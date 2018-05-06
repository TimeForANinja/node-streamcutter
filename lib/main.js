const STREAM = require('stream');

class StreamCutter extends STREAM.Transform {
  constructor(options = {}, superOptions) {
    super(superOptions);

    this._buffer = [];
    this._bufferlength = 0;
    this._start = options.start || 0;
    this._end = options.end || 0;
    this._length = options.length || Infinity;
  }

  _transform(chunk, enc, cb) { // eslint-disable-line consistent-return
    // Ignore if already done
    if (this._length === 0) return cb();

    // Chunk can be skipped completely
    if (this._start >= chunk.length) {
      this._start -= chunk.length;
      return cb();
    }
    // Can only skip half of the chunk
    if (this._start !== 0) {
      chunk = chunk.slice(this._start);
      this._start = 0;
    }

    // No need to handle buffering to splice end
    if (this._end === 0) {
      this._queue(chunk);
      return cb();
    }

    // Handle buffering to splice end
    this._buffer.push(chunk);
    this._bufferlength += chunk.length;

    let tolerance = this._bufferlength - this._end;
    while (this._buffer.length && this._buffer[0].length <= tolerance) {
      let firstChunk = this._buffer.shift();
      tolerance -= firstChunk.length;
      this._bufferlength -= firstChunk.length;
      this._queue(firstChunk);
    }

    if (tolerance > 0) {
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
    if (chunk.length > this._length) chunk = chunk.slice(0, this._length);
    this._length -= chunk.length;
    this.push(chunk);
  }
}

module.exports = StreamCutter;
