'use strict'
var Duplex = require('stream').Duplex

/**
Create a pipeline of connected streams.

@module stream-connect
@example
> streamConnect = require("stream-connect")
> PassThrough = require("stream").PassThrough

> pass1 = PassThrough()
> pass1.setEncoding("utf8")
> pass1.on("data", console.log.bind(console, "pass1"))

> pass2 = PassThrough()
> pass2.setEncoding("utf8")
> pass2.on("data", console.log.bind(console, "pass2"))

> pass1.write("testing")
pass1 testing

> connected = streamConnect(pass1, pass2)
> connected.write("testing")
pass1 testing
pass2 testing
*/
module.exports = connect

/**
Connects two duplex streams together.

@param {external:Duplex} - source stream
@param {external:Duplex} - dest stream, to be connected to
@return {external:Transform}
@alias module:stream-connect
*/
function connect (one, two) {
  one.pipe(two)

  var connected = new Duplex({ objectMode: true })
  connected._write = function (chunk, enc, done) {
    one.write(chunk)
    done()
  }
  connected._read = function () {}
  connected.on('finish', function () {
    one.end()
  })
  two.on('readable', function () {
    var chunk = this.read()
    connected.push(chunk)
  })

  one.on('error', function (err) {
    connected.emit('error', err)
  })
  two.on('error', function (err) {
    connected.emit('error', err)
  })

  return connected
}

/**
@external Transform
@see https://nodejs.org/api/stream.html#stream_class_stream_transform
*/
/**
@external Duplex
@see https://nodejs.org/api/stream.html#stream_class_stream_duplex
*/
