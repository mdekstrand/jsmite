import { performance } from 'perf_hooks';
import prettyMS from 'pretty-ms';

export default class Timer {
  constructor() {
    this._start = performance.now();
  }

  start() {
    this._start = performance.now();
  }

  stop() {
    this._end = performance.now();
  }

  elapsed() {
    let end = this._end;
    if (!end) end = performance.now();

    return end - this._start;
  }

  prettyElapsed() {
    let time = this.elapsed();
    return prettyMS(time, {compact: true});
  }

  toString() {
    return this.prettyElapsed();
  }
}
