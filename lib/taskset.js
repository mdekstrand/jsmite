import { performance } from 'perf_hooks';
import chalk from 'chalk'

import etStr from 'pretty-ms';

import bb from "bluebird";
const { Promise } = bb;
import log from './logging.js';
import Timer from './timer.js';

const TaskPromiseSymbol = Symbol('TaskPromise');
const TaskTimerSymbol = Symbol('TaskTimer');
const ErrorHandledSymbol = Symbol('JSmiteErrorHandled');

const TaskProto = {
  run() {
    if (!this[TaskPromiseSymbol]) {
      if (this.action) {
        this[TaskPromiseSymbol] = (async () => {
          log.info("beginning task ‘%s’", chalk.blue(this.name));
          let timer = new Timer();
          let rv;
          try {
            rv = await this.action();
          } catch (e) {
            timer.stop();
            log.error("task ‘%s’ failed in %s with error %s",
                      chalk.blue(this.name), timer, e);
            e[ErrorHandledSymbol] = true;
            throw e;
          }

          timer.stop();
          let tt = this[TaskTimerSymbol];
          tt.stop();
          log.info("task ‘%s’ finished in %s (%s with deps)", chalk.blue(this.name), timer, tt);
          return rv;
        })();
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
    log.debug("registering task ‘%s’", tobj.name);
    this.tasks[tobj.name] = tobj;
    return tobj;
  }

  handledError(err) {
    return err[ErrorHandledSymbol] || false;
  }

  async run(name) {
    let task = this.tasks[name];
    if (!task) {
      throw new Error(`unknown task ${name}`);
    }

    if (!task[TaskTimerSymbol]) {
      task[TaskTimerSymbol] = new Timer();
    }

    await Promise.map(task.dependencies, (task) => this.run(task));

    await task.run();
  }

  /**
   * Convenience function for adding a task.
   * @param {*} name
   * @param {*} deps_or_fun
   * @param {*} fun
   */
  task(name, dependencies, action) {
    if (typeof(name) == 'function') {
      action = name;
      name = name.name;
      if (!Array.isArray(dependencies)) {
        dependencies = [...arguments];
        dependencies.shift();
      }
    }
    if (action === undefined && typeof(dependencies) == 'function') {
      action = dependencies;
      dependencies = [];
    }
    if (action === undefined) {
      action = () => {
        log.debug('no-op task %s', name);
      }
    }

    return this.addTask({
      name, dependencies, action
    });
  }
}
