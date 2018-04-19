const { getTasks } = require("./task");

function schedule(cb, time) {
  let idx = 0;
  return setInterval(async () => {
    const tasks = await getTasks();
    if (tasks.length) {
      if (tasks[idx]) {
        cb(tasks[idx]);
      }
      if (idx >= tasks.length - 1) {
        idx = 0;
      } else {
        idx = idx + 1;
      }
    }
  }, time);
}

module.exports = { schedule };
