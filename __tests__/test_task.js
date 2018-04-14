const fs = require("fs");
const { init, addTask, getTasks } = require("../src/task");
const tmp = require("tmp");

it("should add task", async done => {
  const tmpData = tmp.fileSync();
  init(tmpData.name);
  const taskId = await addTask(2218200, 2218200, "2018-04-09");
  const tasks = await getTasks();

  const expectedTask = {
    from: 2218200,
    to: 2218200,
    date: "2018-04-09",
    time: "00:00",
    stop: false,
    id: taskId
  };

  expect(tasks).toEqual([expectedTask]);
  const fileResult = fs.readFileSync(tmpData.name).toString();
  expect(JSON.parse(fileResult)).toEqual([expectedTask]);
  tmpData.removeCallback();
  done();
});
