import TaskSet from './taskset.js';

export const globalTasks = new TaskSet();

export const task = globalTasks.task.bind(globalTasks);
