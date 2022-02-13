import winston from "winston";

export const levels = winston.config.cli.levels;

export const log = winston.createLogger({
  levels,
});

export const silly = log.log.bind(log, 'silly');
export const verbose = log.log.bind(log, 'verbose');
export const debug = log.log.bind(log, 'debug');
export const info = log.log.bind(log, 'info');
export const warn = log.log.bind(log, 'warn');
export const error = log.log.bind(log, 'error');

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

  log.format = winston.format.combine(
    winston.format.splat(),
    winston.format.cli()
  );
  log.add(new winston.transports.Console({
    stderrLevels: Object.keys(levels)
  }));

  debug(`logging initialized at level ${level}`);
}

const metalog = {
  log: log.log.bind(log),
  silly, debug, info, warn, error
};

export default metalog;
