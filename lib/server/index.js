var Adapter = require('../adapter')

  , connect = require('connect')
  , http = require('http');

var Server = function (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.path = options.output_path;
  this.port = options.port || 1111;
  this.index = options.index;

  if (extension = Adapter.extension({path: this.index})) {
    this.index = this.index.replace(/.([a-zA-Z]*)$/, extension);
  }

  this.app = connect()
    .use(connect.static(this.path, {index: this.index}));

  this.server = http.createServer(this.app);
}

Server.prototype = {

  start: function () {
    this.emitter.emit('start', 'server on port ' + this.port);
    this.server.listen(this.port);
  },

  stop: function () {
    this.server.close();
  }

}

module.exports = Server;
