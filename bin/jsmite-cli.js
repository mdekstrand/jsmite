#!/usr/bin/env node
import fs from 'fs/promises';
import { pathToFileURL } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { log, initialize } from '../lib/logging.js';
import * as jsg from '../lib/global.js'

const SMITEFILES = [
  'smite.js',
  'smite.mjs',
]

let tasks = jsg.globalTasks;

function parseArgs(args) {
  if (args === undefined) {
    args = hideBin(process.argv);
  }
  return yargs(args).
    scriptName('jsmite').
    alias('h', 'help').
    option('verbose', {
      alias: 'v',
      type: 'count',
      description: 'enable verbose logging'
    }).
    option('file', {
      alias: 'f',
      type: 'string',
      description: 'load from alternate jsmite file'
    }).
    option('list', {
      alias: 'l',
      type: 'boolean',
      describe: 'list tasks from file'
    }).
    parse();
}

async function findSmiteFile(spec) {
  if (spec) {
    return pathToFileURL(spec);
  }

  for (let fn of SMITEFILES) {
    try {
      log.log('debug', `checking for ${fn}`)
      await fs.access(fn);
      log.debug(`found ${fn}`);
      return pathToFileURL(fn);
    } catch (err) {
      if (err.code === 'ENOENT') {
        log.debug(`${fn} not found`);
      } else {
        log.error(`could not check access to ${fn}: ${err}`)
        throw err;
      }
    }
  }

  log.error(`no smitefile found`);
  throw new Error('no smitefile found');
}

async function listTasks() {
  log.info('listing available tasks')
  for (let l of Object.keys(tasks.tasks)) {
    console.log('%s', l);
  }
}

async function main() {
  let options = parseArgs();
  initialize({verbosity: options.verbose});

  let smf = await findSmiteFile(options.file);
  log.info(`reading tasks from ${smf}`);
  await import(smf);

  if (options.list) {
    return listTasks();
  }

  let requested = options._;
  if (requested.length == 0) {
    if (!tasks.tasks.default) {
      log.error('no tasks requested and no default task defined');
      process.exit(2);
    } else {
      requested = ['default'];
    }
  }
  log.debug('kicking off tasks');
  let results = requested.map((t) => tasks.run(t));
  log.debug('waiting for tasks to complete');
  await Promise.all(results);
}

main();
