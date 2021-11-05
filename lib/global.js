import TaskSet from './taskset.js';
import { debug } from './logging.js';

export const globalTasks = new TaskSet();

export function task(name, deps_or_fun, fun) {
  if (fun === undefined) {
    fun = deps_or_fun;
    deps_or_fun = [];
  }
  if (fun === undefined) {
    fun = name;
    name = fun.name;
  }

  debug(`registering task '${name}'`);

  globalTasks.
}
