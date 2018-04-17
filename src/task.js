const fs = require("fs");
const uuid = require("uuid");
const path = require("path");
const mkdirp = require("mkdirp");
let tasksFilePath = null;

function newTask(from, to, date, chatId, time, options) {
  return {
    from,
    to,
    date,
    chatId,
    time: time || "00:00",
    stop: false,
    options,
    id: uuid.v4().slice(0, 4)
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

async function fileExists(filePath) {
  return new Promise((res, rej) => {
    fs.exists(filePath, exists => res(exists));
  });
}

async function writeFile(filePath) {
  return new Promise((res, rej) => {
    fs.writeFile(filePath, JSON.stringify([]), { flag: "wx" }, err => {
      if (err) return rej(err);
      res();
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
  const storedTasks = await getTasks();
  storedTasks.push(task);
  await writeTasks(storedTasks);
  console.log(`task added ${task.id}`);
  return task.id;
}

async function getTasks() {
  const exists = await fileExists(tasksFilePath);
  if (exists) {
    return await readTasks();
  }
  await writeFile(tasksFilePath);
  return [];
}

async function deleteTask(taskId) {
  const tasks = await getTasks();
  const newTasks = tasks.filter(({ id }) => id !== taskId);
  await setTasks(newTasks);
}

async function stopTask(taskId) {
  const tasks = await getTasks();
  const newTasks = tasks.map(task => {
    if (task.id === taskId) {
      task.stop = true;
    }
    return task;
  });
  await setTasks(newTasks);
}

async function resumeTask(taskId) {
  const tasks = await getTasks();
  const newTasks = tasks.map(task => {
    if (task.id === taskId) {
      task.stop = false;
    }
    return task;
  });
  await setTasks(newTasks);
}

async function setTasks(tasks) {
  await writeTasks(tasks);
}

function init(tasksPath) {
  if (tasksPath) {
    console.log(`Tasks file ${tasksPath}`);
  }
  tasksFilePath = tasksPath;
}

module.exports = {
  init,
  getTasks,
  addTask,
  setTasks,
  deleteTask,
  stopTask,
  resumeTask
};
