require("dotenv").config();
const BOT_NAME = process.env.BOT_NAME;
const micro = require("micro");
const path = require("path");
const { initConfig } = require("./config");
const config = initConfig(path.resolve(__dirname, `../${process.argv[2]}`));
const { addTask, getTasks, start } = require("./scheduler");
const { hello, watch, handleDialog } = require("./bot");

const server = micro(async (req, res) => {
  const method = req.method;
  const url = req.url;

  if (method === "POST") {
    const data = await micro.json(req);
    if (url === "/new_message") {
      console.log(`new message ${JSON.stringify(data)}`);
      if (data.message) {
        const text = data.message.text;
        if (text == "/hello") {
          await hello(data.message);
        }
        if (text == "/watch") {
          await watch(data.message);
        }
        if (
          data.message.reply_to_message &&
          data.message.reply_to_message.from.username === BOT_NAME
        ) {
          await handleDialog(data.message);
        }
      }
      if (data.callback_query) {
        await handleDialog(
          data.callback_query.message,
          JSON.parse(data.callback_query.data)
        );
      }
      res.end();
      return;
    }
  }

  return "bot server is online";
});
const { host, port } = config.botServer;
server.listen(port, host, () => {
  console.log(`bot server is listening on ${host} ${port}`);
});
