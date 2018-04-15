require("dotenv").config();
const { cmd } = require("../src/telegramAPI");

const WEBHOOK = process.env.WEBHOOK;

cmd("deleteWebhook");
cmd("setWebhook", { url: WEBHOOK });
