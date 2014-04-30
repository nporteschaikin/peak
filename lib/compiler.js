var Lexer = require('./lexer');

var Compiler = module.exports = function (str, context) {
  this.lexer = new Lexer(str);
  this.tokens = this.lexer.exec();
  this.buf = [];

  if (typeof context == 'object') {
    this.context = context;
  } else if (typeof context !== 'undefined') {
    this.context = JSON.parse(context);
  } else {
    this.context = {};
  }
}

Compiler.prototype = {

  peek: function () {
    return this.tokens[0];
  },

  advance: function () {
    return this.current = this.tokens.shift();
  },

  buffer: function (str) {
    this.buf.push(str);
  },

  get: function (key) {
    return this.context[key];
  },

  getBlock: function (key) {
    return this.get('block:' + key) || this.get('Block:' + key) || false;
  },

  block: function () {
    var block = this.advance()
      , get = this.getBlock(block.value)
      , buffer = []
      , compile;

    while (!(this.peek().type == 'blockclose'
            && this.peek().value == block.value)
            && this.peek().type !== 'eos') {

      if (typeof get === 'boolean') {

        if (get) {
          this.expression();
        } else {
          this.advance();
        }

      } else if (typeof get === 'string') {
        this.expression();

      } else if (get instanceof Array
                  || typeof get === 'object') {

        buffer.push(this.peek().match);
        this.advance();

      } else {
        this.advance();
      }

    }

    if (buffer) {
      for (var x=0;x<get.length;x++) {
        compile = new Compiler(buffer.join(""), get[x]).compile();
        this.buffer(compile);
      }
    }

    this.advance();

  },

  variable: function () {
    var variable = this.advance().value;
    this.buffer(this.get(variable));
  },

  string: function () {
    this.buffer(this.advance().match);
  },

  expression: function () {
    switch (this.peek().type) {
    case "blockopen":
      this.block();
      break;
    case "variable":
      this.variable();
      break;
    case "string":
      this.string();
      break;
    default:
      throw new Error("Unexpected " + this.peek().type);
    }
  },

  compile: function () {
    while (this.peek().type !== 'eos') {
      this.expression();
    }
    return this.buf.join('');
  }

}
