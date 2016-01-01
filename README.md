[![view on npm](http://img.shields.io/npm/v/stream-connect.svg)](https://www.npmjs.org/package/stream-connect)
[![npm module downloads per month](http://img.shields.io/npm/dm/stream-connect.svg)](https://www.npmjs.org/package/stream-connect)
[![Build Status](https://travis-ci.org/75lb/stream-connect.svg?branch=master)](https://travis-ci.org/75lb/stream-connect)
[![Dependency Status](https://david-dm.org/75lb/stream-connect.svg)](https://david-dm.org/75lb/stream-connect)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

<a name="module_stream-connect"></a>
## stream-connect
Similar to `.pipe` except `.pipe` returns the last stream in a pipeline. stream-connect returns a stream which writes to the first stream in the pipeline and reads from the last.

Consider this `.pipe` example.
```js
function getExampleStream () {
  ...
  return streamOne.pipe(streamTwo)
}

const stream = getExampleStream()
stream.on('data', function (chunk) {}) // catches data from streamOne via streamTwo
stream.on('error', function (err) {}) // catches errors only from streamTwo
stream.end('test') // is written to streamTwo
```

If you write to the output it will be written to `streamTwo`, whereas you probably wanted to write to the  * start of the pipeline and read from the end. Fixed by stream-connect:

```js
const connect = require('stream-connect')

function getExampleStream () {
  ...
  return connect(streamOne, streamTwo)
}

const stream = getExampleStream()
stream.on('data', function (chunk) {}) // catches data from streamOne via streamTwo
stream.on('error', function (err) {}) // catches errors from both streamOne and streamTwo
stream.end('test') // is written to streamOne
```

Any errors emitted in `streamOne` or `streamTwo` are propagated to the output stream.

<a name="exp_module_stream-connect--connect"></a>
### connect() ⇒ <code>[Duplex](https://nodejs.org/api/stream.html#stream_class_stream_duplex)</code> ⏏
Connect streams.

**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| ... | <code>[Duplex](https://nodejs.org/api/stream.html#stream_class_stream_duplex)</code> | One or more streams to connect. |


* * *

&copy; 2015 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
