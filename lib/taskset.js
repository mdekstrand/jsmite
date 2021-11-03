import bb from "bluebird";
const { Promise } = bb;

const TaskPromiseSymbol = Symbol('TaskPromise');
const TaskProto = {
  run() {
    if (!this[TaskPromiseSymbol]) {
      if (this.action) {
        this[TaskPromiseSymbol] = this.action();
      } else {
        this[TaskPromiseSymbol] = Promise.resolve();
      }
    }
    return this[TaskPromiseSymbol];
  }
}

/**
 * Named collection of JSmite tasks.
 */
export default class TaskSet {
  constructor() {
    this.tasks = {};
  }

  addTask(task) {
    let tobj = Object.create(TaskProto);
    Object.assign(tobj, task);
    if (!tobj.dependencies) {
      tobj.dependencies = [];
    }
    if (this.tasks[tobj.name]) {
      throw new Error(`task ${tobj.name} already defined`);
    }
    this.tasks[tobj.name] = tobj;
  }

  async run(name) {
    let task = this.tasks[name];
    if (!task) {
      throw new Error(`unknown task ${name}`);
    }

    await Promise.map(task.dependencies, (task) => this.run(task));
    await task.run();
  }
}
