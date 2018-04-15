require("dotenv").config();
const rp = require("request-promise");

const BOT_KEY = process.env.BOT_KEY;

const botUrl = `https://api.telegram.org/bot${BOT_KEY}`;

async function cmd(command, formData) {
  const uri = `${botUrl}/${command}`;
  const options = { method: "POST", uri, formData };
  const result = await rp(options);
  console.log(`${command} -> ${result}`);
  return result;
}

async function deleteMessage(chatId, msgId) {
  return cmd("deleteMessage", { chat_id: chatId, message_id: msgId });
}

module.exports = { cmd, deleteMessage };
