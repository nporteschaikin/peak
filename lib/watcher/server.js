var Adapter = require('../adapter')

  , connect = require('connect')
  , http = require('http');

var Server = function (path, port, index) {
  var extension;

  this.path = path;
  this.port = port || 1111;
  this.index = index;

  if (extension = Adapter.extension({path: this.index})) {
    this.index = index = index.replace(/.([a-zA-Z]*)$/, extension);
  }

  this.app = connect()
    .use(connect.static(path, {index: index}));

  this.server = http.createServer(this.app);
}

Server.prototype = {

  start: function () {
    this.server.listen(this.port);
  },

  stop: function () {
    this.server.close();
  }

}

module.exports = Server;
