require("dotenv").config();
const micro = require("micro");
const path = require("path");
const { initConfig } = require("./config");
const config = initConfig(path.resolve(__dirname, `../${process.argv[2]}`));
const { addTask, getTasks, start } = require("./scheduler");
const { createSearch } = require("./bot");

const server = micro(async (req, res) => {
  const method = req.method;
  const url = req.url;

  if (method === "POST") {
    const data = await micro.json(req);
    if (url === "/new_message") {
      const text = data.message.text;
      if (text == "/search") {
        createSearch(data.message.chat.id);
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
