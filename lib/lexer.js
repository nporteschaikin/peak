var Lexer = module.exports = function (str) {
  this.tokens = [];
  this.str = String(str)
    .trim()
    .replace(/\r\n|\r|\n *\n/g, '\n');
}

Lexer.prototype = {

  exec: function () {
    while (this.str.length) {
      this.next();
    }
    this.push('eos');
    return this.tokens;
  },

  token: function (type, match, value) {
    return {
      type: type
      , match: match
      , value: value
    }
  },

  push: function (type, match, value) {
    this.tokens.push(this.token(type, match, value));
  },

  consume: function (len) {
    this.str = this.str.substr(len);
  },

  unknown: function () {
    throw new Error('Invalid: ' + this.str.substr(0, 5));
  },

  next: function () {
    var captures
      , buffer = "";
    if (match = matches(this.str)) {
      this.consume(match.captures[0].length);
      this.push(match.type, match.captures[0], match.captures[1]);
    } else {
      while (!matches(this.str) && this.str.length) {
        buffer += this.str.charAt(0);
        this.consume(1);
      }
      this.push('string', buffer, buffer);
    }
  }

}

var rules = {
  blockopen: /^\{[B|b]lock:([\w\s\-:]+)\}/,
  blockclose: /^\{\/[B|b]lock:([\w\s\-:]+)\}/,
  variable: /^\{([\w\s\-:]+)\}/
}

function matches(str) {
  var captures;
  for (var rule in rules) {
    if (captures = rules[rule].exec(str)) {
      return {
        type: rule,
        captures: captures
      }
    }
  }
  return false;
}
