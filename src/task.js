const fs = require("fs");
const uuid = require("uuid");
let tasksFilePath = null;

function newTask(from, to, date, chatId, time, options) {
  return {
    from,
    to,
    date,
    chatId,
    time: time || "00:00",
    stop: false,
    id: uuid.v4()
  };
}

async function readTasks() {
  return new Promise((res, rej) => {
    if (!tasksFilePath) {
      throw new Error("no tasks file path is set");
    }
    fs.readFile(tasksFilePath, (err, data) => {
      if (err) {
        return rej(err);
      }
      const dataStr = data.toString();
      if (dataStr) {
        return res(JSON.parse(dataStr));
      }
      return res([]);
    });
  });
}

async function writeTasks(tasks) {
  return new Promise((res, rej) => {
    fs.writeFile(tasksFilePath, JSON.stringify(tasks), err => {
      if (err) {
        rej("failed to save tasks");
      }
      res();
    });
  });
}

async function addTask({ from, to, date, chatId, time, options }) {
  if (!from) {
    throw new Error("from is required");
  }
  if (!to) {
    throw new Error("to is required");
  }
  if (!date) {
    throw new Error("date is required");
  }
  if (!chatId) {
    throw new Error("chatId is required");
  }
  const task = newTask(from, to, date, chatId, time, options);
  const storedTasks = await readTasks();
  storedTasks.push(task);
  await writeTasks(storedTasks);
  console.log(`task added ${task.id}`);
  return task.id;
}

async function getTasks() {
  return await readTasks();
}

function init(tasksPath) {
  tasksFilePath = tasksPath;
}

module.exports = { init, getTasks, addTask };
