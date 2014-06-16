var Compiler = require('../compiler')

  , fs = require('fs')
  , when = require('when')
  , request = require('request').defaults({jar: true})
  , cheerio = require('cheerio')

  , read = fs.readFileSync;

var Deployer = function Deployer (peak, options) {
  this.peak = peak;
  this.options = peak.options;
  this.emitter = peak.emitter;
}

Deployer.prototype = {

  start: function () {
    this.emitter.emit('start', 'deploying', this.peak.path);
    return when(this.compile)
      .with(this)
      .then(this.get_sign_in)
      .then(this.parse_sign_in)
      .then(this.sign_in)
      .then(this.get_customize)
      .then(this.deploy)
      .then(this.confirm);
  },

  compile: function () {
    if (!this.options.index) throw new Error('An index theme must be specified to deploy.');
    var compiler = new Compiler(read(this.options.index, 'utf8'), { path: this.options.index })
      , render;
    if (render = compiler.compile()) {
      this.theme = render(this.options.deploy.compile);
      this.emitter.emit('misc', 'compiled', this.options.index);
    } else {
      throw new Error('The index theme could not be compiled');
    }
  },

  get_sign_in: function () {
    return this.request(url('login'), 'GET');
  },

  parse_sign_in: function (response) {
    var credentials = {
      'user[email]': this.options.email
      , 'user[password]': this.options.password
    }
    return parse_form(response, 'signup_form', credentials);
  },

  sign_in: function (data) {
    return this.request(url('login'), 'POST', { form: data });
  },

  get_customize: function () {
    return this.request(url('customize', this.options.blog), 'GET');
  },

  deploy: function (response) {
    var options = {
      json: true
      , body: {
        'user_form_key': element(response, 'form_key').val()
        , 'custom_theme': this.theme
      }
    }
    return this.request(url('customize_api', 'blog', this.options.blog), 'POST', options);
  },

  confirm: function (response) {
    if (response.statusCode != 200) {
      throw new Error('Please verify your credentials are correct '
        + 'by signing into Tumblr via their web site.');
    }
    this.emitter.emit('misc', 'deployed', this.peak.path);
  },

  request: function (uri, method, options) {
    this.emitter.emit('init', method, uri);
    return when.promise(function (resolve, reject) {

      options = options || {};
      options.uri = uri;
      options.method = method;
      options.followAllRedirects = true;

      request(options, function (error, response) {
        if (error) reject(error);
        this.emitter.emit('done');
        resolve(response);
      }.bind(this));

    }.bind(this));
  }

}

function parse_form (response, id, attrs) {
  var el = element(response, id)
    , data = {};

  el.find('input, textarea, select, keygen').each(function () {
    data[this.attr('name')] = this.val();
  })

  for (attr in attrs) data[attr] = attrs[attr];
  return data;
}

function element (response, id) {
  return cheerio(('#' + id), response.body);
}

function url () {
  return 'https://www.tumblr.com/'
    + Array.prototype.slice.call(arguments, 0).join('/');
}

module.exports = Deployer;
