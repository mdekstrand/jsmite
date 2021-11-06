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

export default log;
