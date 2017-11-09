/* eslint-disable  no-console */

const dataToStream = data => {
  const StreamPrototype = require('stream').PassThrough;
  const s = new StreamPrototype();
  let d = new Buffer(data);
  setImmediate(() => {
    while (d.length) {
      const tosend = Math.floor(Math.random() * d.length) + 1;
      s.push(d.slice(0, tosend));
      d = d.slice(tosend);
      console.log('wrote', tosend, d.length);
    }
    s.push(null);
  });
  return s;
};

const streamToData = stream => new Promise((resolve, reject) => {
  const data = [];
  stream.on('data', chunk => {
    data.push(chunk);
  });
  stream.on('end', () => resolve(Buffer.concat(data)));
  setTimeout(() => reject(new Error('timed out to read')), 10 * 1000);
});

const originalData = require('crypto').randomBytes(32);
const StreamCutter = require('..');
console.log('originalData', originalData);

const dataStream = dataToStream(originalData);

const cutStart = new StreamCutter({ start: 10 });
const cutEnd = new StreamCutter({ end: 10 });
const cutLength = new StreamCutter({ length: 10 });

dataStream.pipe(cutStart);
streamToData(cutStart).then(data => {
  if (originalData.slice(10).equals(data)) {
    console.log('correctly cut start');
  } else {
    console.log('failed to cut start');
  }
}).catch(err => {
  throw err;
});

dataStream.pipe(cutEnd);
streamToData(cutEnd).then(data => {
  if (originalData.slice(0, originalData.length - 10).equals(data)) {
    console.log('correctly cut end');
  } else {
    console.log('failed to cut end');
  }
}).catch(err => {
  throw err;
});

dataStream.pipe(cutLength);
streamToData(cutLength).then(data => {
  if (originalData.slice(0, 10).equals(data)) {
    console.log('correctly cut length');
  } else {
    console.log('failed to cut length');
  }
}).catch(err => {
  throw err;
});
