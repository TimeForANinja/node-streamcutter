/* global describe, it */
const STREAMCUTTER = require('..');
const CRYPTO = require('crypto');
const ASSERT = require('assert-diff');
const PASSTHROUGH = require('stream').PassThrough;

const dataToStream = data => {
  const pt = new PASSTHROUGH();
  let d = new Buffer.from(data);
  setImmediate(() => {
    while (d.length) {
      const chunkLength = Math.floor(Math.random() * d.length) + 1;
      pt.push(d.slice(0, chunkLength));
      d = d.slice(chunkLength);
    }
    pt.push(null);
  });
  return pt;
};

const streamToData = stream => new Promise((resolve, reject) => {
  const data = [];
  stream.on('data', chunk => data.push(chunk));
  stream.on('end', () => resolve(Buffer.concat(data)));
  setTimeout(() => reject(new Error('read timed out')), 10 * 1000);
});

describe('main()', () => {
  it('cut from start', done => {
    const originalData = CRYPTO.randomBytes(128);
    const dataStream = dataToStream(originalData);
    const start = 10;
    const cutter = new STREAMCUTTER({ start });
    dataStream.pipe(cutter);
    streamToData(cutter).then(data => {
      ASSERT.ok(originalData.slice(start).equals(data));
      done();
    }).catch(ASSERT.ifError);
  });
  it('cut from end', done => {
    const originalData = CRYPTO.randomBytes(128);
    const dataStream = dataToStream(originalData);
    const end = 10;
    const cutter = new STREAMCUTTER({ end });
    dataStream.pipe(cutter);
    streamToData(cutter).then(data => {
      ASSERT.ok(originalData.slice(0, originalData.length - end).equals(data));
      done();
    }).catch(ASSERT.ifError);
  });
  it('cut start and end', done => {
    const originalData = CRYPTO.randomBytes(128);
    const dataStream = dataToStream(originalData);
    const start = 10;
    const end = 10;
    const cutter = new STREAMCUTTER({ start, end });
    dataStream.pipe(cutter);
    streamToData(cutter).then(data => {
      ASSERT.ok(originalData.slice(start, originalData.length - end).equals(data));
      done();
    }).catch(ASSERT.ifError);
  });
  it('cut everything from start and end', done => {
    const originalData = CRYPTO.randomBytes(128);
    const dataStream = dataToStream(originalData);
    const start = 70;
    const end = 70;
    const cutter = new STREAMCUTTER({ start, end });
    dataStream.pipe(cutter);
    streamToData(cutter).then(data => {
      ASSERT.ok(Buffer.alloc(0).equals(data));
      done();
    }).catch(ASSERT.ifError);
  });
  it('cut everything from start', done => {
    const originalData = CRYPTO.randomBytes(128);
    const dataStream = dataToStream(originalData);
    const start = 140;
    const cutter = new STREAMCUTTER({ start });
    dataStream.pipe(cutter);
    streamToData(cutter).then(data => {
      ASSERT.ok(Buffer.alloc(0).equals(data));
      done();
    }).catch(ASSERT.ifError);
  });
  it('cut to length', done => {
    const originalData = CRYPTO.randomBytes(128);
    const dataStream = dataToStream(originalData);
    const length = 20;
    const cutter = new STREAMCUTTER({ length });
    dataStream.pipe(cutter);
    streamToData(cutter).then(data => {
      ASSERT.ok(originalData.slice(0, length).equals(data));
      done();
    }).catch(ASSERT.ifError);
  });
  it('cut length and start', done => {
    const originalData = CRYPTO.randomBytes(128);
    const dataStream = dataToStream(originalData);
    const length = 20;
    const start = 10;
    const cutter = new STREAMCUTTER({ length, start });
    dataStream.pipe(cutter);
    streamToData(cutter).then(data => {
      ASSERT.ok(originalData.slice(start, length + start).equals(data));
      done();
    }).catch(ASSERT.ifError);
  });
  it('cut length ignore end', done => {
    const originalData = CRYPTO.randomBytes(128);
    const dataStream = dataToStream(originalData);
    const length = 40;
    const end = 10;
    const cutter = new STREAMCUTTER({ length, end });
    dataStream.pipe(cutter);
    streamToData(cutter).then(data => {
      ASSERT.ok(originalData.slice(0, length).equals(data));
      done();
    }).catch(ASSERT.ifError);
  });
  it('cut end ignore length', done => {
    const originalData = CRYPTO.randomBytes(128);
    const dataStream = dataToStream(originalData);
    const length = 40;
    const end = 130;
    const cutter = new STREAMCUTTER({ length, end });
    dataStream.pipe(cutter);
    streamToData(cutter).then(data => {
      ASSERT.ok(Buffer.alloc(0).equals(data));
      done();
    }).catch(ASSERT.ifError);
  });
});
