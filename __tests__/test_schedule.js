const fs = require("fs");
const { init, addTask, getTasks } = require("../src/task");
const { schedule } = require("../src/scheduler");
const tmp = require("tmp");

it("should schedule task", async done => {
  const tmpData = tmp.fileSync();
  init(tmpData.name);
  const taskId = await addTask({
    from: 2218200,
    to: 2218200,
    date: "2018-04-09",
    chatId: 111
  });

  const id = schedule(task => {
    expect(task.id).toBe(taskId);
    tmpData.removeCallback();
    clearInterval(id);
    done();
  }, 100);
});
