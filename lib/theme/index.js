var Compiler = require('./compiler');

var Theme = function (source, options) {
  this.compiler = new Compiler(source, options);
  this.kind = this.compiler.kind;
}

Theme.prototype = {

  render: function (context, options) {
    if (arguments.length == 1) options = context;
    options = options || {};
    return this.compile()(context, options);
  },

  compile: function () {
    return this.compiler.compile();
  }

}

module.exports = Theme;
