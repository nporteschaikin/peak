var Lexer = function (str, kind) {
  this.str = str;
  this.kind = kind;
  this.tokens = [];
}

Lexer.prototype = {

  exec: function () {
    while (this.str.length) {
      this.next();
    }
    this.tokens.push(token('eos'));
    return this.tokens;
  },

  consume: function (len) {
    this.str = this.str.substr(len);
  },

  next: function () {
    var tok
      , buf;
    if (tok = this.match()) {
      this.consume(tok.capture.length);
      this.tokens.push(tok);
    } else {
      buf = new String();
      while (!this.match() && this.str.length) {
        buf += this.str.charAt(0);
        this.consume(1);
      }
      this.tokens.push(token('string', buf, buf));
    }
  },

  match: function () {
    var fn
      , match;
    for (var rule in rules) {
      fn = rules[rule][this.kind.name];
      if (fn) {
        match = fn(this.str);
        if (!match && rules[rule]['all']) match = rules[rule]['all'](this.str);
        if (match) break;
      }
    }
    return match;
  }

}

var rules = {

  open: {

    all: function (str) {
      return scan('open', /^\{[B|b]lock:([\w\s\-:]+)\}/, str);
    },

    css: function (str) {
      return scan('open', /^\/\*\s?#\(([\w\s\-:]+)\)\s?\*\//, str);
    },

    html: function (str) {
      return scan('open', /^<!--\s?#\(([\w\s\-:]+)\)\s?-->/, str);
    },

    javascript: function (str) {
      return scan('open', /^\/\/\s?#\(([\w\s\-:]+)\)\s?/, str);
    }

  },

  close: {

    all: function (str) {
      return scan('close', /^\{\/[B|b]lock:([\w\s\-:]+)\}/, str);
    },

    css: function (str) {
      return scan('close', /^\/\*\s?##\s?\*\//, str);
    },

    html: function (str) {
      return scan('close', /^<!--\s?##\s?-->/, str);
    },

    javascript: function (str) {
      return scan('close', /^\/\/\s?##/, str);
    }

  },
  
  button: {
    
    html: function(str) {
      return button('button', /^\{(Like|Reblog)Button\s?(.*?)\}/, str)
    }
    
  },

  variable: {

    all: function (str) {
      return scan('variable', /^\{([\w\s\-:]+)\}/, str);
    },

    css: function (str) {
      return scan('variable', /^\!\(([\w\s\-:]+)\)/, str);
    },

    html: function (str) {
      return scan('variable', /^\!\(([\w\s\-:]+)\)/, str)
    },

    javascript: function (str) {
      return scan('variable', /^\!\(([\w\s\-:]+)\)\s?/, str)
    }

  },

  url: {

    css: function (str) {
      return scan('url', /^@\((.*?)\)/, str);
    },

    html: function (str) {
      return scan('url', /^@\((.*?)\)/, str);
    },

    javascript: function (str) {
      return scan('url', /^@\((.*?)\)\s?/, str);
    }

  },

  include: {

    css: function (str) {
      return tag('include', /^\/\*\s?\+\((.*?)\)\s?\*\//, str);
    },

    html: function (str) {
      return tag('include', /^<!--\s?\+\((.*?)\)\s?-->/, str);
    },

    javascript: function (str) {
      return tag('include', /\/\/\s?\+\((.*?)\)\s?/, str);
    }

  }

}

function token (type, capture, value) {
  return {
    type: type
    , capture: capture
    , value: value
  };
}

function buttonToken(type, capture, buttonType, value) {
  return {
    type: type,
    capture: capture,
    value: buttonType,
    attrs: value
  }
}

function tag (rule, regexp, str) {
  var captures;
  if (captures = regexp.exec(str)) {
    return token(rule, captures[0], attrs(captures[1]));
  }
}

function button(rule, regexp, str) {
  var captures;
  if(captures = regexp.exec(str)) {
    return buttonToken(rule, captures[0], captures[1], htmlAttrs(captures[2]));
  }
}

function scan (rule, regexp, str) {
  var captures;
  if (captures = regexp.exec(str)) {
    return token(rule, captures[0], captures[1]);
  }
}

function attrs (str) {
  var regexp = /(\S+)\:\s?["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g
    , attributes = {}
    , captures;
  while (captures = regexp.exec(str)) {
    attributes[captures[1]] = captures[2];
  }
  return attributes;
}

function htmlAttrs(str) {
  var regexp = /(\S+)=\s?["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g
    , attributes = {}
    , captures;
  while (captures = regexp.exec(str)) {
    attributes[captures[1]] = captures[2];
  }
  return attributes;
}

module.exports = Lexer;
