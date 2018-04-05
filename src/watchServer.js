const micro = require("micro");
const path = require("path");
const { initConfig } = require("./config");
const config = initConfig(path.resolve(__dirname, `../${process.argv[2]}`));
const { addTask, getTasks, start } = require("./scheduler");

async function createWatch(data) {
  if (!data.from) {
    throw new Error("from is required");
  }
  if (!data.to) {
    throw new Error("to is required");
  }
  if (!data.date) {
    throw new Error("date is required");
  }
  return addTask(data.from, data.to, data.date, data.time, {});
}

function getList() {
  const watches = getTasks();
  return watches.map(w => {
    return {
      id: w.id,
      from: w.from,
      to: w.to,
      time: w.time,
      options: w.options,
      stop: w.stop
    };
  });
}

const server = micro(async (req, res) => {
  const method = req.method;
  const url = req.url;
  try {
    if (method === "POST") {
      const data = await micro.json(req);
      if (url === "/create") {
        const id = await createWatch(data);
        return micro.send(res, 200, { id });
      }
      return micro.send(res, 404, "404 Not found");
    }
    if (method === "GET") {
      if (url === "/list") {
        const list = getList();
        return micro.send(res, 200, list);
      }
    }
    return "watch server is online";
  } catch (err) {
    micro.send(res, 500, err.message);
  }
});
const { host, port } = config.watchServer;
server.listen(port, host, () => {
  console.log(`watch server is listening on ${host} ${port}`);
  start(watch => console.log(`processing task ${watch.id}`));
});
