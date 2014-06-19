var Compiler = require('./compiler');

var Theme = function (source, options) {
  this.compiler = new Compiler(source, options);
  this.kind = this.compiler.kind;
}

Theme.prototype = {

  render: function (options) {
    options = options || {};
    return this.compile()(options);
  },

  compile: function () {
    return this.compiler.compile();
  }

}

module.exports = Theme;
