var Peak = require('../')
  , Commands = require('../lib/commands')
  , Lexer = require('../lib/compiler/lexer')
  , Parser = require('../lib/compiler/parser')
  , Adapter = require('../lib/compiler/adapter')
  , Compiler = require('../lib/compiler')

  , chai = require('chai')
  , fs = require('fs')
  , path = require('path')
  , rimraf = require('rimraf')
  , yaml = require('js-yaml')

  , join = path.join
  , exists = fs.existsSync
  , read = fs.readFileSync

  , fixtures = join(__dirname, "fixtures");

chai.should();

describe('cli', function () {

  it('should watch if no action sent', function (done) {
    var path = join(fixtures, 'cli', 'watch')
      , cli = new Commands(null, {path: path, mute: true});

    helpers.rmdir(join(path, '.peak'), function () {
      cli.exec().done(function () {
        exists(path).should.be.true;
        cli.emitter.emit('exit');
        done();
      });
    })
  })

  describe('new', function () {

    it('should create a new project', function (done) {
      var path = join(fixtures, 'cli', 'new', 'create')
        , cli = new Commands(null, {action: 'new', path: path, mute: true});
      helpers.rmdir(path, function () {
        cli.exec().done(function () {
          exists(path).should.be.true;
          done();
        });
      })
    })

  })

  describe('watch', function () {

    it('should watch project', function (done) {
      var path = join(fixtures, 'cli', 'watch')
        , cli = new Commands(null, {action: 'watch', path: path, mute: true});

      helpers.rmdir(join(path, '.peak'), function () {
        cli.exec().done(function () {
          exists(path).should.be.true;
          cli.emitter.emit('exit');
          done();
        });
      })
    })

  })

  describe('deploy', function () {

    // this.timeout(10000);
    //
    // it('should deploy project', function (done) {
    //   var path = join(fixtures, 'cli', 'deploy')
    //     , cli = new Commands(null, {
    //       action: 'deploy',
    //       path: path,
    //       mute: true,
    //       email: 'ship@carrotcreative.com',
    //       password: 'carrotcreative',
    //       blog: 'shipdeploy'
    //     });
    //
    //   cli.exec().done(done);
    // })

  })

})

describe('lexer', function () {

  describe('html', function () {

    it('should return open token', function () {
      var lexer = new Lexer('<!-- #(Test) -->', {name: 'html'});
      lexer.exec()
        .should.include({type: 'open', capture: '<!-- #(Test) -->', value: 'Test'})
    })

    it('should return close token', function () {
      var lexer = new Lexer('<!-- ## -->', {name: 'html'});
      lexer.exec()
        .should.include({type: 'close', capture: '<!-- ## -->', value: undefined})
    })

    it('should return variable token', function () {
      var lexer = new Lexer('!(Test)', {name: 'html'});
      lexer.exec()
        .should.include({type: 'variable', capture: '!(Test)', value: 'Test'})
    })

    it('should return url token', function () {
      var lexer = new Lexer('@(images/doge.jpg)', {name: 'html'});
      lexer.exec()
        .should.include({type: 'url', capture: '@(images/doge.jpg)', value: 'images/doge.jpg'})
    })

    it('should return include token', function () {
      var lexer = new Lexer('<!-- +(src: "test.css" media: "all") -->', {name: 'html'});
      lexer.exec()
        .should.include({type: 'include', capture: '<!-- +(src: "test.css" media: "all") -->', value: {src: 'test.css', media: 'all'}})
    })

    it('should return string token', function () {
      var lexer = new Lexer('<html>', {name: 'html'});
      lexer.exec()
        .should.include({type: 'string', capture: '<html>', value: '<html>'})
    })

  })

  describe('css', function () {

    it('should return open token', function () {
      var lexer = new Lexer('/* #(Test) */', {name: 'css'});
      lexer.exec()
        .should.include({type: 'open', capture: '/* #(Test) */', value: 'Test'})
    })

    it('should return close token', function () {
      var lexer = new Lexer('/* ## */', {name: 'css'});
      lexer.exec()
        .should.include({type: 'close', capture: '/* ## */', value: undefined})
    })

    it('should return variable token', function () {
      var lexer = new Lexer('!(Test)', {name: 'css'});
      lexer.exec()
        .should.include({type: 'variable', capture: '!(Test)', value: 'Test'})
    })

    it('should return url token', function () {
      var lexer = new Lexer('@(images/doge.jpg)', {name: 'css'});
      lexer.exec()
        .should.include({type: 'url', capture: '@(images/doge.jpg)', value: 'images/doge.jpg'})
    })

    it('should return include token', function () {
      var lexer = new Lexer('/* +(src: "test.css") */', {name: 'css'});
      lexer.exec()
        .should.include({type: 'include', capture: '/* +(src: "test.css") */', value: {src: 'test.css'}})
    })

    it('should return string token', function () {
      var lexer = new Lexer('body { background: #000; }', {name: 'css'});
      lexer.exec()
        .should.include({type: 'string', capture: 'body { background: #000; }', value: 'body { background: #000; }'})
    })

  })

  describe('javascript', function () {

    it('should return open token', function () {
      var lexer = new Lexer('// #(Test)', {name: 'javascript'});
      lexer.exec()
        .should.include({type: 'open', capture: '// #(Test)', value: 'Test'})
    })

    it('should return close token', function () {
      var lexer = new Lexer('// ##', {name: 'javascript'});
      lexer.exec()
        .should.include({type: 'close', capture: '// ##', value: undefined})
    })

    it('should return variable token', function () {
      var lexer = new Lexer('!(Test)', {name: 'javascript'});
      lexer.exec()
        .should.include({type: 'variable', capture: '!(Test)', value: 'Test'})
    })

    it('should return url token', function () {
      var lexer = new Lexer('@(images/doge.jpg)', {name: 'javascript'});
      lexer.exec()
        .should.include({type: 'url', capture: '@(images/doge.jpg)', value: 'images/doge.jpg'})
    })

    it('should return include token', function () {
      var lexer = new Lexer('// +(src: "test.js")', {name: 'javascript'});
      lexer.exec()
        .should.include({type: 'include', capture: '// +(src: "test.js")', value: {src: 'test.js'}})
    })

    it('should return string token', function () {
      var lexer = new Lexer('var foo = bar;', {name: 'javascript'});
      lexer.exec()
        .should.include({type: 'string', capture: 'var foo = bar;', value: 'var foo = bar;'})
    })

  })

})

describe('parser', function () {

  it('should return nil if adapter does not exist', function () {
    var parser = new Parser('var foo = bar;', 'foo');
    (parser.parse() === undefined).should.be.true;
  })

  it('should return valid kind via path', function () {
    var parser = new Parser('foo = bar', {path: 'test.coffee'});
    parser.parse();
    parser.kind.name.should.eq('javascript');
  })

  describe('html', function () {

    it('should return block node', function () {
      var parser = new Parser('<!-- #(Test) -->Foo<!-- ## -->', { with: 'html' });
      parser.parse().should.include(
        {type: 'block', name: 'Test', nodes: [{ type: 'string', value: 'Foo' }]});
    })

    it('should return variable node', function () {
      var parser = new Parser('!(Test)', { with: 'html' });
      parser.parse().should.include(
        {type: 'variable', value: 'Test'});
    })

    it('should return url node', function () {
      var parser = new Parser('@(images/doge.jpg)', { with: 'html' });
      parser.parse().should.include(
        {type: 'url', value: 'images/doge.jpg'});
    })

    it('should return include node', function () {
      var parser = new Parser('<!-- +(src: "test.css") -->', { path: join(fixtures, 'parser', 'html', 'include', 'index.html') });
      parser.parse().should.include(
        {type: 'include', open: '<style type="text/css">', close: '</style>', nodes: [{type: 'string', value: 'body { background: black; }\n'}]});
    })

  })

  describe('css', function () {

    it('should return block node', function () {
      var parser = new Parser('/* #(Test) */Foo/* ## */', { with: 'css' });
      parser.parse().should.include(
        {type: 'block', name: 'Test', nodes: [{ type: 'string', value: 'Foo' }]});
    })

    it('should return variable node', function () {
      var parser = new Parser('!(Test)', { with: 'css' });
      parser.parse().should.include(
        {type: 'variable', value: 'Test'});
    })

    it('should return url node', function () {
      var parser = new Parser('@(images/doge.jpg)', { with: 'css' });
      parser.parse().should.include(
        {type: 'url', value: 'images/doge.jpg'});
    })

    it('should return include node', function () {
      var parser = new Parser('/* +(src: "test.css") */', { path: join(fixtures, 'parser', 'css', 'include', 'style.css') });
      parser.parse().should.include(
        {type: 'include', nodes: [{type: 'string', value: 'body { background: black; }\n'}]});
    })

  })

  describe('javascript', function () {

    it('should return block node', function () {
      var parser = new Parser('// #(Test)\nFoo\n// ##', { with: 'js' });
      parser.parse().should.include(
        {type: 'block', name: 'Test', nodes: [{ type: 'string', value: 'Foo\n' }]});
    })

    it('should return variable node', function () {
      var parser = new Parser('!(Test)', { with: 'js' });
      parser.parse().should.include(
        {type: 'variable', value: 'Test'});
    })

    it('should return url node', function () {
      var parser = new Parser('@(images/doge.jpg)', { with: 'js' });
      parser.parse().should.include(
        {type: 'url', value: 'images/doge.jpg'});
    })

    it('should return include node', function () {
      var parser = new Parser('// +(src: "test.js")', { path: join(fixtures, 'parser', 'javascript', 'include', 'main.js') });
      parser.parse().should.include(
        {type: 'include', nodes: [{type: 'string', value: 'alert(\'foo\');\n'}]});
    })

  })

})

describe('adapter', function () {

  it('should return js kind if ext is .coffee', function () {
    var adapter = Adapter('$ ->\nconsole.log \'test\'', { path: 'test.coffee' });
    adapter.kind.name.should.eq('javascript');
  })

  it('should return html kind if ext is .jade', function () {
    var adapter = Adapter('html\n  head', { path: 'test.jade' });
    adapter.kind.name.should.eq('html');
  })

  it('should return css kind if ext is .styl', function () {
    var adapter = Adapter('body\n  background: black', { path: 'test.styl' });
    adapter.kind.name.should.eq('css');
  })

})

describe('compiler', function () {

  describe('blocks', function () {

    it('should render one of block if context is true', function () {
      var compiler = new Compiler('<!-- #(Test) --><div></div><!-- ## -->', { with: 'html' });
      compiler.compile()(null, {'block:Test': true})
        .should.eq('<div></div>');
    })

    it('should render two of block if context is array with two elements', function () {
      var compiler = new Compiler('<!-- #(Test) --><div></div><!-- ## -->', { with: 'html' });
      compiler.compile()(null, {'block:Test': [{foo: 'bar'}, {foo: 'bar'}]})
        .should.eq('<div></div><div></div>');
    })

    it('should use block as context if block is object', function () {
      var compiler = new Compiler('<!-- #(Test) --><div>!(foo)</div><!-- ## -->', { with: 'html' });
      compiler.compile()(null, {'block:Test': {foo: 'bar'}})
        .should.eq('<div>bar</div>');
    })

  })

  describe('url', function () {

    it('should render url with base if specified', function () {
      var compiler = new Compiler('@(images/doge.jpg)', { with: 'html' });
      compiler.compile()({url: 'http://www.tumblr.com/'})
        .should.eq('http://www.tumblr.com/images/doge.jpg');
    })

    it('should render url if no base is specified', function () {
      var compiler = new Compiler('@(images/doge.jpg)', { with: 'html' });
      compiler.compile()()
        .should.eq('images/doge.jpg');
    })

  })

  describe('include', function () {

    it('should wrap in enclosure if enclosure for kind specified in map', function () {
      var compiler = new Compiler('<!-- +(src: "test.css") -->', { path: join(fixtures, 'compiler', 'include', 'index.html') });
      compiler.compile()()
        .should.eq('<style type="text/css">body { background: black; }\n</style>');
    })

  })

})

describe('generator', function () {

  it('should fail if existing directory is specified', function (done) {
    var peak = new Peak(join(fixtures, 'generator'));
    peak.generate().catch(function(){done()});
  })

  it('should create directory', function (done) {
    var path = join(fixtures, 'generator', 'create_directory')
      , peak;
    helpers.rmdir(path, function () {
      peak = new Peak(path);
      peak.generate().done(function () {
        exists(path).should.be.true
        done();
      });
    })
  })

  it('should create configuration file', function (done) {
    var path = join(fixtures, 'generator', 'config_file')
      , peak;
    helpers.rmdir(path, function () {
      peak = new Peak(path);
      peak.generate().done(function() {
        exists(join(path, '.peakconfig.yml')).should.be.true
        done();
      });
    })
  })

  it('should create default index if none specified', function (done) {
    var path = join(fixtures, 'generator', 'index')
      , peak;
    helpers.rmdir(path, function () {
      peak = new Peak(path);
      peak.generate().done(function () {
        exists(join(path, 'index.jade')).should.be.true
        done();
      });
    })
  })

  it('should create custom index if specified', function (done) {
    var path = join(fixtures, 'generator', 'index')
      , peak;
    helpers.rmdir(path, function () {
      peak = new Peak(path, {index: 'index.html'});
      peak.generate().done(function (){
        exists(join(path, 'index.html')).should.be.true
        done();
      })
    })
  })

  it('should create config file with custom index', function (done) {
    var path = join(fixtures, 'generator', 'index')
      , peak;
    helpers.rmdir(path, function () {
      peak = new Peak(path, {index: 'index.html'});
      peak.generate().done(function() {
        yaml.safeLoad(read(join(path, '.peakconfig.yml'), 'utf8')).index.should.eq('index.html');
        done();
      })
    })
  })

})

describe('watcher', function (){

  it('should create .peak folder', function (done) {
    var path = join(fixtures, 'watcher', 'folder')
      , dir = join(path, '.peak')
      , peak;
    helpers.rmdir(dir, function () {
      peak = new Peak(path, {index: 'index.html'});
      peak.watch().then(function () {
        exists(dir).should.be.true;
        peak.emitter.emit('exit');
        done();
      });
    })
  })

  it('should render with context if tumblr specified', function (done) {
    var path = join(fixtures, 'watcher', 'context')
      , dir = join(path, '.peak')
      , peak;
    helpers.rmdir(dir, function () {
      peak = new Peak(path, {blog: 'shipdeploy'});
      peak.watch().then(function () {
        read(join(dir, 'index.html'), 'utf8').should.eq('shipdeploy\n');
        peak.emitter.emit('exit');
        done();
      });
    })
  })

  it('should render adapted files with correct extension', function (done) {
    var path = join(fixtures, 'watcher', 'adapter')
      , dir = join(path, '.peak')
      , peak;
    helpers.rmdir(dir, function () {
      peak = new Peak(path);
      peak.watch().then(function () {
        exists(join(dir, 'index.html')).should.be.true;
        peak.emitter.emit('exit');
        done();
      });
    })
  })

  it('should create symlink for non-theme file', function (done) {
    var path = join(fixtures, 'watcher', 'symlink')
      , dir = join(path, '.peak')
      , peak;
    helpers.rmdir(dir, function () {
      peak = new Peak(path);
      peak.watch().then(function () {
        exists(join(dir, 'foo.txt')).should.be.true;
        peak.emitter.emit('exit');
        done();
      });
    })
  })

})

describe('deployer', function () {

  this.timeout(10000);

  it('should throw exception if credentials are invalid', function (done) {
    var peak = new Peak(join(fixtures, 'deployer', 'invalid'), {email: "foo@bar.com", password: "!@#$%^&"});
    peak.deploy().catch(function(){done()});
  })

})

var helpers = {

  rmdir: function (path, callback) {
    return rimraf(path, callback.bind(null, path));
  }

}
