const { cmd } = require("./telegramAPI");
const WatchDialog = require("./dialogs/watchDialog");

const inline_keyboard = [
  [{ text: "button1", callback_data: "button1_pressed" }]
];

async function hello(message) {
  const chatId = message.chat.id;
  await cmd("sendMessage", {
    chat_id: chatId,
    text: "Дратути",
    reply_markup: JSON.stringify({ inline_keyboard })
  });
}

const dialogs = {};

async function watch(message) {
  const chatId = message.chat.id;
  dialogs[chatId] = new WatchDialog(chatId, args => console.log(args));
}

async function handleDialog(message, data) {
  const chatId = message.chat.id;
  const dialog = dialogs[chatId];
  if (!dialog || (dialog && dialog.done)) return;
  console.log(dialog.stage);
  await dialog[`stage${dialog.stage}`](message, data);
}

module.exports = { hello, watch, handleDialog };
