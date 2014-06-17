var connect = require('connect')
  , http = require('http')
  , fs = require('fs')
  , path = require('path')
  , io = require('socket.io')

  , lstat = fs.lstatSync
  , dirname = path.dirname
  , resolve = path.resolve
  , join = path.join;

var Server = function (watcher) {

  this.watcher = watcher;
  this.emitter = watcher.emitter;
  this.port = watcher.options.port || 1111;
  this.options = {
    index: watcher.options.main
  };

  this.app = connect()
    .use(connect.static(this.watcher.dir, this.options));

  this.server = http.createServer(this.app);
}

Server.prototype = {

  start: function () {
    this.server.listen(this.port);
    this.emitter.emit('start', 'server at port', this.port);
  },

  stop: function () {
    this.server.close();
  }

}
module.exports = Server;
