const rp = require("request-promise");
const BOT_KEY = process.env.BOT_KEY;
const botUrl = `https://api.telegram.org/bot${BOT_KEY}`;

async function createSearch(chatId) {
  const options = {
    method: "POST",
    uri: `${botUrl}/sendMessage`,
    formData: {
      chat_id: chatId,
      text: "hello human"
    }
  };
  console.log("starting ticket search");
  await rp(options);
}

module.exports = { createSearch };
