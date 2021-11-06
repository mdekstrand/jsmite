import {format} from 'util';
import winston from "winston";

export const levels = winston.config.cli.levels;

export const log = winston.createLogger({
  levels
});

function logMessage() {
  let args = Array.from(arguments);
  let level = args.shift();
  let msg = format.apply(null, args);
  this.log(level, msg);
}

export const silly = logMessage.bind(log, 'silly');
export const debug = logMessage.bind(log, 'debug');
export const info = logMessage.bind(log, 'info');
export const warn = logMessage.bind(log, 'warn');
export const error = logMessage.bind(log, 'error');

export function initialize(options) {
  if (!options) options = {};
  let verbosity = options.verbosity || 0;
  let lno = levels.info + verbosity;
  let level = 'silly';
  for (let l of Object.keys(levels)) {
    if (levels[l] == lno) {
      level = l;
    }
  }

  log.level = level;

  log.format = winston.format.cli();
  log.add(new winston.transports.Console({
    stderrLevels: Object.keys(levels)
  }));

  debug(`logging initialized at level ${level}`);
}

const metalog = {
  log: logMessage.bind(log),
  silly, debug, info, warn, error
};

export default metalog;
