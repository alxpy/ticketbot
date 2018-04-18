const { cmd, deleteMessage } = require("../telegramAPI");
const { getTasks, deleteTask, stopTask, resumeTask } = require("../task");

class TaskListDialog {
  constructor(chatId, resultCb) {
    this.chatId = chatId;
    this.resultCb = resultCb;
    this.stage = 0;
    this.done = false;
    this.stage0();
    this.data = { selectedTask: null, action: null };
  }

  async stage0() {
    const tasks = await getTasks();
    this.tasks = tasks;
    const chatTasks = tasks.filter(task => task.chatId === this.chatId);
    if (chatTasks.length) {
      const inlineKeyboard = chatTasks.map((task, i) => {
        return [
          {
            text: `🚂 ${task.options.trains.join(", ")} на ${task.date}`,
            callback_data: JSON.stringify({
              dialog: "list",
              action: "select",
              value: task.id
            })
          }
        ];
      });
      await cmd("sendMessage", {
        chat_id: this.chatId,
        text: `Ищем такое:`,
        reply_markup: JSON.stringify({ inline_keyboard: inlineKeyboard })
      });
      this.stage = 1;
    } else {
      await cmd("sendMessage", {
        chat_id: this.chatId,
        text: "Зейчаз ничего не ищем"
      });
      this.stage = 0;
    }
  }

  async stage1(message, data) {
    if (!data.dialog || !data.dialog === "list" || !data.action === "select") {
      return;
    }
    if (data.action === "select") {
      this.data.selectedTask = data.value;
    }
    const task = this.tasks.find(t => t.id === this.data.selectedTask);
    if (!task) {
      return;
    }
    deleteMessage(this.chatId, message.message_id);
    const inlineKeyboard = [
      [
        {
          text: "Удалить",
          callback_data: JSON.stringify({
            dialog: "list",
            action: "action",
            value: "del"
          })
        },
        task.stop
          ? {
              text: "Возобновить",
              callback_data: JSON.stringify({
                dialog: "list",
                action: "action",
                value: "resume"
              })
            }
          : {
              text: "Остановить",
              callback_data: JSON.stringify({
                dialog: "list",
                action: "action",
                value: "stop"
              })
            },
        {
          text: "Ничего не делать",
          callback_data: JSON.stringify({
            dialog: "list",
            action: "action",
            value: "nothing"
          })
        }
      ]
    ];
    await cmd("sendMessage", {
      chat_id: this.chatId,
      text: `Что делаем с поиском`,
      reply_markup: JSON.stringify({ inline_keyboard: inlineKeyboard })
    });
    this.stage = 2;
  }

  async stage2(msg, data) {
    if (!data.dialog || !data.dialog === "list" || !data.action === "action") {
      return;
    }
    this.data.action = data.value;
    deleteMessage(this.chatId, msg.message_id);
    if (this.data.action === "del") {
      await deleteTask(this.data.selectedTask);
      await cmd("sendMessage", {
        chat_id: this.chatId,
        text: `Удалил ...`
      });
    }
    if (this.data.action === "stop") {
      await stopTask(this.data.selectedTask);
      await cmd("sendMessage", {
        chat_id: this.chatId,
        text: `Остановил ...`
      });
    }
    if (this.data.action === "resume") {
      await resumeTask(this.data.selectedTask);
      await cmd("sendMessage", {
        chat_id: this.chatId,
        text: `Возобновил ...`
      });
    }
    this.done = true;
    this.resultCb(this.data);
  }
}

module.exports = TaskListDialog;
