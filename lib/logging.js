import winston from "winston";

export const levels = winston.config.cli.levels;

export const log = winston.createLogger({
  levels
});

export const debug = log.debug.bind(log);
export const info = log.info.bind(log);
export const warn = log.warn.bind(log);
export const error = log.error.bind(log);

export function initialize(options) {
  if (!options) options = {};
  let verbosity = options || 0;
  let level = levels.info;
  level += verbosity;
  log.level = level;

  log.add(new winston.transports.Console({
    stderrLevels: Object.keys(levels)
  }));

  debug('logging initialized');
}

export default log;
