const uuid = require('uuid');
const { getConfig } = require('./config');
const config = getConfig();
let tasks = [];
let started = false;
let watchIdx = 0;
let callbackFn = null;

function Task(from, to, date, time, options) {
  this.from = from;
  this.to = to;
  this.date = date;
  this.time = time;
  this.options = options;
  this.stop = false;
  this.id = uuid.v4();
}

function addTask(from, to, date, time, options) {
  const task = new Task(from, to, date, time, options);
  tasks.push(task);
  console.log(`task added ${task.id}`);
  return task.id;
}

function getTasks() {
  return tasks;
}

function handleTask(watch) {
  callbackFn(watch);
}

async function hardWork() {
  if (!tasks.length) return;
  const task = tasks[watchIdx];
  if (!task.stop) handleTask(task);
  if (watchIdx === tasks.length - 1) {
    watchIdx = 0;
  } else {
    watchIdx += 1;
  }
}

function start(cb) {
  if (!started) { // only 1 scheduler is allowed to run
    callbackFn = cb;
    setInterval(hardWork, config.timeout);
    console.log('scheduler started');
    started = true;
  } else {
    console.log('sheduler was already started');
  }
}

module.exports = { addTask, getTasks, start };
