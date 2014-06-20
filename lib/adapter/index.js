var map = require('./map')

  , fs = require('fs')
  , path = require('path')

  , read = fs.readFileSync
  , extname = path.extname;

var Adapter = function (source, options) {
  this.source = source;
  this.options = (options || {});
  this.compiler = Adapter.compiler(options);
  this.kind = Adapter.kind(options);
}

Adapter.prototype = {
  render: function () {
    if (this.compiler) {
      if (!this.source && this.options.path)
        this.source = read(this.options.path, 'utf8');
      return this.compiler.render(this.source, this.options);
    }
  }
}

Adapter.compiler = function (options) {
  if (options.path && !options.with)
    options.with = map.extensions[extname(options.path)];
  return map.compilers[options.with];
}

Adapter.kind = function (options) {
  var compiler
    , kind;

  options = (options || {});
  compiler = Adapter.compiler(options);

  if (compiler) {
    kind = map.kinds[compiler.kind];
    kind.name = compiler.kind;
    return kind;
  }
}

Adapter.supports = function (options) {
  return !!Adapter.compiler(options);
}

Adapter.extension = function (options) {
  var kind = Adapter.kind(options);
  if (kind) return kind.extension;
}

module.exports = Adapter;
