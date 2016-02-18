var Compiler = require('./compiler');

var Theme = function (source, options) {
  this.compiler = new Compiler(source, options);
  this.kind = this.compiler.kind;
}

Theme.prototype = {

  render: function (context, options) {
    if (arguments.length == 1) options = context;
    options = options || {};
    var result = this.compile()(context, options);
    return result;
  },

  compile: function () {
      var result = this.compiler.compile();
      return result;
  }

}

module.exports = Theme;
