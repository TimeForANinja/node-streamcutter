<div align="center">
  <p>
    <a href="https://www.npmjs.com/package/streamcutter"><img src="https://img.shields.io/npm/v/streamcutter.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/streamcutter"><img src="https://img.shields.io/npm/dt/streamcutter.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://github.com/timeforaninja/node-streamcutter"><img src="https://david-dm.org/timeforaninja/node-streamcutter.svg" alt="Dependencies" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/streamcutter/"><img src="https://nodei.co/npm/streamcutter.png?downloads=true&stars=true" alt="NPM info" /></a>
  </p>
</div>

# node-streamcutter
cut a streams start, end and length

# Usage
remove the first and last 10 bytes from a stream
```js
const streamCutter = require('streamcutter');
const fs = require('fs');

const noStartNoEnd = new streamCutter({start: 10, end: 10});
<stream>.pipe(noStartNoEnd);
noStartNoEnd.pipe(fs.createWriteStream('./cutFile'));
```

# API
### new streamCutter([options[, transformerStreamOptions]])
* options typeof Object
  * options.end
    * typeof number
    * how many bytes to trim from the end
    * default's to `0`
  * options.start
    * typeof number
    * how many bytes to trim from the start
    * default's to `0`
  * options.length
    * typeof number
    * how many bytes it should be long
    * default's to `Infinity`
  * options.debug
    * typeof boolean
    * enable debug logs
    * default's to `false`
* [transformerStreamOptions](https://nodejs.org/api/stream.html#stream_new_stream_transform_options)

# Install
    npm install --save streamcutter

# License
MIT
