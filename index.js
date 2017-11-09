/* eslint-disable  no-console */

const stream = require('stream');

class StreamCutter extends stream.Transform {
  constructor(options = {}, superOptions) {
    super(superOptions);

    if (options.debug) console.log('construct', options);

    this._debug = options.debug || false;
    this._buffer = [];
    this._bufferlength = 0;
    this._start = options.start || 0;
    this._end = options.end || 0;
    this._length = options.length || Infinity;
  }

  _transform(chunk, enc, cb) {
    if (this._debug) console.log('transform chunk', this._end, this._start, this._length, chunk.length);
    // Ignore if already done
    if (this._length === 0) {
      if (this._debug) console.log('skip chunk already done');
      cb();
      return;
    }
    // Chunk can be skipped completely
    if (this._start >= chunk.length) {
      if (this._debug) console.log('skip chunk not at start');
      this._start -= chunk.length;
      cb();
      return;
    }

    // Can only skip half of the chunk
    if (this._start !== 0) {
      if (this._debug) console.log('skip half chunk');
      if (this._start < chunk.length) {
        chunk = chunk.slice(this._start);
      }
      this._start = 0;
    }

    // No need to handle buffering to splice end
    if (this._end === 0) {
      if (this._debug) console.log('dont buffer');
      this._queue(chunk);
      cb();
      return;
    }

    // Handle buffering to splice end
    if (this._debug) console.log('buffer');
    this._buffer.push(chunk);
    this._bufferlength += chunk.length;

    if (this._debug) console.log(this._buffer, this._bufferlength);
    let tolerance = this._bufferlength - this._end;
    while (this._buffer.length && this._buffer[0].length <= tolerance) {
      if (this._debug) console.log('push full chunk');
      let firstChunk = this._buffer.shift();
      tolerance -= firstChunk.length;
      this._bufferlength -= firstChunk.length;
      this._queue(firstChunk);
    }

    if (tolerance > 0) {
      if (this._debug) console.log('push full chunk');
      let fullChunk = this._buffer[0];
      let firstHalfChunk = fullChunk.slice(0, tolerance);
      let secondHalfChunk = fullChunk.slice(tolerance);
      this._buffer[0] = secondHalfChunk;
      tolerance -= firstHalfChunk.length;
      this._bufferlength -= firstHalfChunk.length;
      this._queue(firstHalfChunk);
    }

    cb();
  }

  _queue(chunk) {
    if (chunk.length > this._length) {
      if (this._debug) console.log('cut chunk since 2 long');
      chunk = chunk.slice(0, this._length);
    }
    this._length -= chunk.length;
    this.push(chunk);
  }
}

module.exports = StreamCutter;
