const { cmd } = require("./telegramAPI");
const WatchDialog = require("./dialogs/watchDialog");
const TaskListDialog = require("./dialogs/taskListDialog");
const { addTask, getTasks, setTasks } = require("./task");
const { ticketLink, ticketPlaceLink } = require("./govAPI");

async function hello(message) {
  const chatId = message.chat.id;
  await cmd("sendMessage", {
    chat_id: chatId,
    text: "Дратути"
  });
}

const dialogs = {};

async function watch(message) {
  const chatId = message.chat.id;
  dialogs[chatId] = new WatchDialog(chatId, (err, args) => {
    if (err) {
      delete dialogs[chatId];
      return;
    }
    addTask({
      from: args.from,
      to: args.to,
      date: args.date,
      chatId: args.chatId,
      options: args.options
    });
    console.log("Task added", args);
    delete dialogs[chatId];
  });
}

async function handleDialog(message, data) {
  const chatId = message.chat.id;
  const dialog = dialogs[chatId];
  if (!dialog || (dialog && dialog.done)) return;
  console.log(dialog.stage);
  await dialog[`stage${dialog.stage}`](message, data);
}

async function taskList(message) {
  const chatId = message.chat.id;
  dialogs[chatId] = new TaskListDialog(chatId, options => {
    console.log("task list dialog", options);
    delete dialogs[chatId];
  });
}

async function clearTaskList(message) {
  const chatId = message.chat.id;
  const tasks = await getTasks();
  const chatTasks = tasks.filter(task => task.chatId === chatId);
  const otherChatTasks = tasks.filter(task => task.chatId !== chatId);

  await setTasks(otherChatTasks);

  await cmd("sendMessage", {
    chat_id: chatId,
    text: `Отменил поиск поездов:\n${chatTasks
      .map(task => task.options.trains.join(", "))
      .join("|")}`
  });
}

async function sendTicketMessage(task, trainData) {
  const inlineKeyboard = trainData.types.map(t => {
    return [
      {
        text: `🔗 Купить '${t.title}' - ${t.places}`,
        url: ticketPlaceLink(task, trainData.num, t.id)
      }
    ];
  });

  await cmd("sendMessage", {
    chat_id: task.chatId,
    parse_mode: "Markdown",
    text: `*ЕЗДЬ МЕЗДА!!!* 😀�
📅 *${task.date}*
🚂 *${trainData.num}* _${trainData.from.station} - ${trainData.to.station}_`,
    reply_markup: JSON.stringify({ inline_keyboard: inlineKeyboard })
  });
}

const hasTrainMsgs = {};
async function stopSearchTrain(task) {
  if (hasTrainMsgs[task.chatId]) {
    delete hasTrainMsgs[task.chatId][task.id];
  }
}
async function hasTrain(task, trainData) {
  console.log(`Has tickets ${task.id}`);
  const chatId = task.chatId;
  if (!hasTrainMsgs[chatId]) {
    hasTrainMsgs[chatId] = {};
  }
  if (!hasTrainMsgs[chatId][task.id]) {
    hasTrainMsgs[chatId][task.id] = {
      times: 1,
      hasTickets: true
    };
    sendTicketMessage(task, trainData);
  } else {
    const ticketMsg = hasTrainMsgs[chatId][task.id];
    if (!ticketMsg.hasTickets) {
      sendTicketMessage(task, trainData);
    }
    ticketMsg.times = ticketMsg.times + 1;
    ticketMsg.hasTickets = true;
  }
}

async function hasNoTrain(task) {
  console.log(`Had no tickets ${task.id}`);
  const chatId = task.chatId;
  if (!hasTrainMsgs[chatId]) {
    hasTrainMsgs[chatId] = {};
  }
  if (!hasTrainMsgs[chatId][task.id]) {
    hasTrainMsgs[chatId][task.id] = {
      times: 1,
      hasTickets: false
    };
  } else {
    const ticketMsg = hasTrainMsgs[chatId][task.id];
    if (ticketMsg.hasTickets) {
      await cmd("sendMessage", {
        chat_id: chatId,
        text: `😞 Уже мезд на 🚂 ${task.options.trains.join(", ")} нет 😞`
      });
    }
    ticketMsg.times = ticketMsg.times + 1;
    ticketMsg.hasTickets = false;
  }
}

module.exports = {
  hello,
  watch,
  handleDialog,
  taskList,
  clearTaskList,
  hasTrain,
  hasNoTrain,
  stopSearchTrain
};
