import { performance } from 'perf_hooks';

import etStr from 'pretty-ms';

import bb from "bluebird";
const { Promise } = bb;
import { log } from './logging.js';

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
    log.info(`beginning task ${task.name}`);
    let start = performance.now();
    await task.run();
    let end = performance.now();
    let estr = etStr(end - start, {compact: true});
    log.info(`task ${task.name} finished in ${estr}`);
  }
}
