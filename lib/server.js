var connect = require('connect')
  , http = require('http')
  , fs = require('fs')
  , path = require('path')
  , io = require('socket.io')

  , lstat = fs.lstatSync
  , dirname = path.dirname
  , resolve = path.resolve
  , join = path.join;

var Server = module.exports = function Server (path, options) {

  this.path = path;
  this.options = options || {};
  this.port = this.options.port || 1111;

  this.app = connect()
    .use(javascript([join('/socket.io', 'socket.io.js'), join('/peak', 'peak.js')]))
    .use('/peak', connect.static(resolve(__dirname, 'browser')))
    .use(connect.static(path, this.options));

  this.server = http.createServer(this.app);

  this.io = io
    .listen(this.server, { log: false });

}

Server.prototype = {

  start: function () {
    this.server.listen(this.port);
  },

  stop: function () {
    this.server.close();
  },

  send: function (event) {
    this.io.sockets.emit(event);
  }

}

function javascript(paths) {
  var tags = [];
  for (var x=0; x<paths.length; x++) {
    tags.push("<script type='text/javascript' src='" + paths[x] + "'></script>");
  }
  return require('connect-inject')({snippet: tags.join("")});
}
