var Parser = require('./parser')

  , path = require('path')
  , fs = require('fs');

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

      var functionBody = this.buf.join('');
      var returnFunction = new Function('context, options', functionBody);
      return returnFunction;
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
        if (this.options.deploy.customOptions.hasOwnProperty(variable.value)) {
            this.buffer('if (!context) { buf.push("' + this.options.deploy.customOptions[variable.value] + '"); }'
            + 'else if (typeof ' + ref + ' !== "object") { buf.push(' + ref + '); }');
        }
        else{
        this.buffer('if (!context) { buf.push("{' + variable.value + '}"); }'
            + 'else if (typeof ' + ref + ' !== "object") { buf.push(' + ref + '); }');    
        }
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

  button: function (buttonInfo) {
    var postID = 'if(ctx["PostID"]) { buf.push(ctx["PostID"]); }';
    var blogName = 'if(ctx["PostAuthorName"]) { buf.push(ctx["PostAuthorName"]); }';
    var buttonColor = buttonInfo.attrs['color'] || 'grey';
    var buttonHexColor = "#ccc";
    if(buttonColor.toLowerCase() === "white") {
        buttonHexColor = "#fff";
    } else if (buttonColor.toLowerCase() === "black") {
        buttonHexColor = "#000";
    }
    var buttonSize = buttonInfo.attrs['size'] || '20';

    if (buttonInfo.value === 'Like') {
      this.buffer("if(!context) { buf.push('{LikeButton color=\"" + buttonColor + "\" size=\"" + buttonSize + "\"}'); } else {");
      this.buffer('buf.push("<div class=\'like_button\' data-post-id=\'");');
      this.buffer(postID);
      this.buffer('buf.push("\' id=\'");');
      this.buffer('buf.push("like_button_");');
      this.buffer(postID);
      this.buffer('buf.push("\'><iframe id=\'like_iframe_");');
      this.buffer(postID);
      this.buffer('buf.push("\' src=\'http://assets.tumblr.com/assets/html/like_iframe.html?_v=1af0c0fbf0ad9b4dc38445698d099106#name=");');
      this.buffer(blogName);
      this.buffer('buf.push("&amp;post_id=");');
      this.buffer(postID);
      this.buffer('buf.push("&amp;color=' + buttonColor + '&amp;rk=5dXEd33c\' scrolling=\'no\' width=\'' + buttonSize + '\' height=\'' + buttonSize + '\' frameborder=\'0\' class=\'like_toggle\' allowtransparency=\'true\' name=\'like_iframe_");');
      this.buffer(postID);
      this.buffer('buf.push("\'></iframe></div>");}');
    } else if (buttonInfo.value === 'Reblog') {
      var reblogUrl = 'if(ctx["ReblogURL"]) { buf.push(ctx["ReblogURL"]); }';
      this.buffer("if(!context) { buf.push('{ReblogButton color=\"" + buttonColor + "\" size=\"" + buttonSize + "\"}'); } else {");
      this.buffer('buf.push("<a href=\'");');
      this.buffer(reblogUrl);
      this.buffer('buf.push("\' class=\'reblog_button\' style=\'display:block;width:' + buttonSize + 'px;height:' + buttonSize + 'px;\'>");');
      this.buffer('buf.push("<svg width=\'100%\' height=\'100%\' viewBox=\'0 0 21 21\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' fill=\'' + buttonHexColor + '\'><path d=\'M5.01092527,5.99908429 L16.0088498,5.99908429 L16.136,9.508 L20.836,4.752 L16.136,0.083 L16.1360004,3.01110845 L2.09985349,3.01110845 C1.50585349,3.01110845 0.979248041,3.44726568 0.979248041,4.45007306 L0.979248041,10.9999998 L3.98376463,8.30993634 L3.98376463,6.89801007 C3.98376463,6.20867902 4.71892527,5.99908429 5.01092527,5.99908429 Z\'></path><path d=\'M17.1420002,13.2800293 C17.1420002,13.5720293 17.022957,14.0490723 16.730957,14.0490723 L4.92919922,14.0490723 L4.92919922,11 L0.5,15.806 L4.92919922,20.5103758 L5.00469971,16.9990234 L18.9700928,16.9990234 C19.5640928,16.9990234 19.9453125,16.4010001 19.9453125,15.8060001 L19.9453125,9.5324707 L17.142,12.203\'></path></svg>");');
      this.buffer('buf.push("</a>");')
      this.buffer('}');
    }
  },

  visit: function (nodes) {
    for (var x = 0; x < nodes.length; x++) {
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
        case 'button':
          this.button(nodes[x]);
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
