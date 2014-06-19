var Parser = require('./parser')

  , path = require('path')
  , fs = require('fs')

  , extension = path.extname
  , resolve = path.resolve
  , dirname = path.dirname;

var Compiler = function (source, options) {
  this.source = source;
  this.options = options;
  this.parser = new Parser(source, options);
  this.kind = this.parser.kind;
}

Compiler.prototype = {

  compile: function () {
    var nodes;

    if (nodes = this.parser.parse()) {
      this.buf = [];

      this.buffer('options = options || {};'
        + 'var ctx = context;'
        + 'var buf = [];');
      this.visit(nodes);
      this.buffer('return buf.join("");');

      return new Function('context, options', this.buf.join(''));
    }
  },

  buffer: function (str) {
    this.buf.push(str);
  },

  block: function (block) {
    var ref = 'ctx["block:' + block.name + '"]';

    this.buffer('var block = (function(ctx){');
    this.visit(block.nodes);
    this.buffer('});');

    this.buffer('if (!context) { buf.push("{block:' + block.name + '}"); block(); buf.push("{/block:' + block.name + '}"); } else {');

    this.buffer('if (' + ref + ' === true) { block(ctx); }'
      + 'else if (' + ref + ' instanceof Array) {'
      + 'for (var x=0; x<' + ref + '.length; x++) { block(' + ref + '[x]); };'
      + '} else if (typeof ' + ref + ' === "object") { block(' + ref + '); };');

    this.buffer('};');
  },

  variable: function (variable) {
    var ref = 'ctx["' + variable.value + '"]';
    this.buffer('if (!context) { buf.push("{' + variable.value + '}"); }'
      + 'else { buf.push(' + ref + '); }');
  },

  string: function (str) {
    var str = escape(str.value)
      .replace(/(\r\n|\n|\r)/gm, '" + "\\n" + "');
    this.buffer('buf.push("' + str + '");');
  },

  url: function (url) {
    var url = escape(url.value);
    this.buffer('if (options.url) { buf.push(options.url + "' + url + '"); }'
      + 'else { buf.push("' + url + '") }');
  },

  include: function (include) {
    this.buffer('buf.push("' + escape(include.open) + '");');
    this.visit(include.nodes);
    this.buffer('buf.push("' + escape(include.close) + '");');
  },

  visit: function (nodes) {
    for (var x=0; x<nodes.length; x++) {
      switch (nodes[x].type) {
      case 'block':
        this.block(nodes[x]);
        break;
      case 'variable':
        this.variable(nodes[x]);
        break;
      case 'url':
        this.url(nodes[x]);
        break;
      case 'include':
        this.include(nodes[x]);
        break;
      case 'string':
        this.string(nodes[x]);
        break;
      }
    }
  }

}

function escape(str) {
  return (str || '')
    .replace(/\"/g, '\\"');
}

module.exports = Compiler;
