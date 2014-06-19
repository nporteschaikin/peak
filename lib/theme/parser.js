var Lexer = require('./lexer')
  , Adapter = require('../adapter')

  , fs = require('fs')
  , path = require('path')

  , read = fs.readFileSync
  , join = path.join
  , dirname = path.dirname;

var Parser = function (source, options) {
  var lexer
    , options = options || {};

  this.adapter = adapter = new Adapter(source, options);
  this.kind = adapter.kind;
  this.lexer = new Lexer(adapter.render(), adapter.kind);
  this.tokens = this.lexer.exec();
  this.path = options.path;
  this.nodes = [];
}

Parser.prototype = {

  peek: function () {
    return this.tokens[0];
  },

  advance: function () {
    return this.current = this.tokens.shift();
  },

  buffer: function (node) {
    if (typeof node === 'object') this.nodes.push(node);
  },

  concat: function (parser) {
    parser.parse();
    this.nodes = this.nodes.concat(parser.nodes);
  },

  block: function () {
    var node = {
      type: 'block'
      , name: this.advance().value
      , nodes: []
    }

    while (this.peek().type != 'close') {
      node.nodes.push(this.expression());
    }

    this.advance();
    return node;
  },

  variable: function () {
    return {
      type: 'variable'
      , value: this.advance().value
    };
  },

  string: function () {
    return {
      type: 'string'
      , value: this.advance().value
    };
  },

  url: function () {
    return {
      type: 'url'
      , value: this.advance().value
    }
  },

  include: function () {
    var include = this.advance()
      , parser
      , options
      , enclosure;

    var node = {
      type: 'include'
    }

    if (include.value.src) {

      options = {
        path: include.value.src
      }

      parser = new Parser(read(join(dirname(this.path), options.path), 'utf8'), options);
      if (parser.parse()) {

        if (enclosure = (parser.kind.enclosure || {})[this.kind.name]) {
          delete include.value.src;
          node.open = enclosure.open(include.value);
          node.close = enclosure.close(include.value);
        }

        node.nodes = parser.nodes;
        return node;
      }
    }
  },

  expression: function () {
    switch (this.peek().type) {
    case 'open':
      return this.block();
    case 'variable':
      return this.variable();
    case 'url':
      return this.url();
    case 'include':
      return this.include();
    case 'string':
      return this.string();
    default:
      throw new Error('Unexpected ' + this.peek().type);
    }
  },

  parse: function () {
    if (this.tokens) {
      while (this.peek().type !== 'eos') this.buffer(this.expression());
      return this.nodes;
    }
  }

}

module.exports = Parser;
