var WebSocketServer = require('ws').Server
var websocket = require('websocket-stream')
var http = require('http')
var path = require('path')
var doorknobServer = require('./server.js')
var server = doorknobServer(8181)
var wss = new WebSocketServer({server: server})
var sublevel = require('level-sublevel')
var replicate = require('level-replicate')
var levelup = require('levelup')

var db = sublevel(levelup('foo.db'))
var master = replicate(db, 'master', "MASTER-1")

wss.on('connection', function(conn, req) {
  var sessionID = server.doorknob.persona.getId(req)
  if (!sessionID) return conn.close('unauthenticated')
  var stream = websocket(conn)
  stream.pipe(master.createStream({tail: true})).pipe(stream)
  stream.on('data', function(c) {
    console.log(c)
  })
})
