const { cmd } = require("./telegramAPI");
const WatchDialog = require("./dialogs/watchDialog");
const { addTask, getTasks, setTasks } = require("./task");

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
  const tasks = await getTasks();
  const chatTasks = tasks.filter(task => task.chatId === chatId);
  if (chatTasks.length) {
    await cmd("sendMessage", {
      chat_id: chatId,
      text: `Ищем такие поезда:\n${chatTasks
        .map(task => task.options.trains.join(", "))
        .join("|")}`
    });
  } else {
    await cmd("sendMessage", {
      chat_id: chatId,
      text: "Зейчаз ничего не ищем"
    });
  }
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

module.exports = { hello, watch, handleDialog, taskList, clearTaskList };
