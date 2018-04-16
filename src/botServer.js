require("dotenv").config();
const BOT_NAME = process.env.BOT_NAME;
const micro = require("micro");
const path = require("path");
const { initConfig } = require("./config");
const config = initConfig(path.resolve(__dirname, `../${process.argv[2]}`));
const { schedule } = require("./scheduler");
const {
  hello,
  watch,
  handleDialog,
  taskList,
  clearTaskList,
  hasTrain,
  hasNoTrain
} = require("./bot");
const { checkTrain } = require("./govAPI");
const { init } = require("./task");

const server = micro(async (req, res) => {
  const method = req.method;
  const url = req.url;

  if (method === "POST") {
    const data = await micro.json(req);
    if (url === "/new_message") {
      console.log(`new message ${JSON.stringify(data)}`);
      if (data.message) {
        const text = data.message.text;
        if (text && text.startsWith("/hello")) {
          await hello(data.message);
        }
        if (text && text.startsWith("/pewpew")) {
          await watch(data.message);
        }
        if (text && text.startsWith("/list")) {
          await taskList(data.message);
        }
        if (text && text.startsWith("/clear")) {
          await clearTaskList(data.message);
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

async function pingTrain(task) {
  const result = await checkTrain(task);
  const train = task.options.trains[0];
  const resultTrain = result.data.list.find(({ num }) => num === train);
  if (resultTrain.types.length) {
    hasTrain(task, resultTrain);
  } else {
    hasNoTrain(task);
  }
}

const { host, port } = config.botServer;
server.listen(port, host, () => {
  console.log(`bot server is listening on ${host} ${port}`);
  init(config.botServer.taskFile);
  schedule(async task => await pingTrain(task), config.botServer.timeout);
});
