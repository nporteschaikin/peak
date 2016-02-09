var Peak = require('../')
  , Commands = require('../lib/commands')
  , Adapter = require('../lib/adapter')
  , Theme = require('../lib/theme')
  , ThemeLexer = require('../lib/theme/lexer')
  , ThemeParser = require('../lib/theme/parser')
  , ThemeCompiler = require('../lib/theme/compiler')

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
      cli.init().done(function () {
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
        cli.init().done(function () {
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
        cli.init().done(function () {
          exists(path).should.be.true;
          cli.emitter.emit('exit');
          done();
        });
      })
    })

  })

  describe('deploy', function () {

    this.timeout(10000);

    it('should deploy project', function (done) {
      var path = join(fixtures, 'cli', 'deploy')
        , cli = new Commands(null, {
          action: 'deploy',
          path: path,
          mute: true,
          email: 'ship@carrotcreative.com',
          password: 'carrotcreative',
          blog: 'shipdeploy'
        });

      cli.init().done(function(){done()});
    })

  })

})

describe('adapter', function () {

  it('should return js kind if ext is .coffee', function () {
    var adapter = new Adapter('$ ->\nconsole.log \'test\'', { path: 'test.coffee' });
    adapter.kind.name.should.eq('javascript');
  })

  it('should return html kind if ext is .jade', function () {
    var adapter = new Adapter('html\n  head', { path: 'test.jade' });
    adapter.kind.name.should.eq('html');
  })

  it('should return html kind if ext is .sneak', function () {
    var adapter = new Adapter('html\n  head', { path: 'test.sneak' });
    adapter.kind.name.should.eq('html');
  })

  it('should return html kind if ext is .haml', function () {
    var adapter = new Adapter('%html', { path: 'test.haml' });
    adapter.kind.name.should.eq('html');
  })

  it('should return css kind if ext is .styl', function () {
    var adapter = new Adapter('body\n  background: black', { path: 'test.styl' });
    adapter.kind.name.should.eq('css');
  })

  it('should return css kind if ext is .less', function () {
    var adapter = new Adapter('body { &.index { background: blue; } }', { path: 'test.less' });
    adapter.kind.name.should.eq('css');
  })

})

describe('theme', function () {

  describe('base', function () {

    it('should render theme', function () {
      var theme = new Theme('html', {with: 'jade'});
      theme.render().should.eq('\n<html></html>');
    })

    it('should compile theme', function () {
      var theme = new Theme('html', {with: 'jade'});
      theme.compile().should.be.an.instanceof(Function);
    })

  })

  describe('lexer', function () {

    describe('html', function () {

      it('should return open token', function () {
        var lexer = new ThemeLexer('<!-- #(Test) -->', {name: 'html'});
        lexer.exec()
          .should.include({type: 'open', capture: '<!-- #(Test) -->', value: 'Test'})
      })

      it('should return close token', function () {
        var lexer = new ThemeLexer('<!-- ## -->', {name: 'html'});
        lexer.exec()
          .should.include({type: 'close', capture: '<!-- ## -->', value: undefined})
      })

      it('should return variable token', function () {
        var lexer = new ThemeLexer('!(Test)', {name: 'html'});
        lexer.exec()
          .should.include({type: 'variable', capture: '!(Test)', value: 'Test'})
      })

      it('should return url token', function () {
        var lexer = new ThemeLexer('@(images/doge.jpg)', {name: 'html'});
        lexer.exec()
          .should.include({type: 'url', capture: '@(images/doge.jpg)', value: 'images/doge.jpg'})
      })

      it('should return include token', function () {
        var lexer = new ThemeLexer('<!-- +(src: "test.css" media: "all") -->', {name: 'html'});
        lexer.exec()
          .should.include({type: 'include', capture: '<!-- +(src: "test.css" media: "all") -->', value: {src: 'test.css', media: 'all'}})
      })

      it('should return string token', function () {
        var lexer = new ThemeLexer('<html>', {name: 'html'});
        lexer.exec()
          .should.include({type: 'string', capture: '<html>', value: '<html>'})
      })

    })

    describe('css', function () {

      it('should return open token', function () {
        var lexer = new ThemeLexer('/* #(Test) */', {name: 'css'});
        lexer.exec()
          .should.include({type: 'open', capture: '/* #(Test) */', value: 'Test'})
      })

      it('should return close token', function () {
        var lexer = new ThemeLexer('/* ## */', {name: 'css'});
        lexer.exec()
          .should.include({type: 'close', capture: '/* ## */', value: undefined})
      })

      it('should return variable token', function () {
        var lexer = new ThemeLexer('!(Test)', {name: 'css'});
        lexer.exec()
          .should.include({type: 'variable', capture: '!(Test)', value: 'Test'})
      })

      it('should return url token', function () {
        var lexer = new ThemeLexer('@(images/doge.jpg)', {name: 'css'});
        lexer.exec()
          .should.include({type: 'url', capture: '@(images/doge.jpg)', value: 'images/doge.jpg'})
      })

      it('should return include token', function () {
        var lexer = new ThemeLexer('/* +(src: "test.css") */', {name: 'css'});
        lexer.exec()
          .should.include({type: 'include', capture: '/* +(src: "test.css") */', value: {src: 'test.css'}})
      })

      it('should return string token', function () {
        var lexer = new ThemeLexer('body { background: #000; }', {name: 'css'});
        lexer.exec()
          .should.include({type: 'string', capture: 'body { background: #000; }', value: 'body { background: #000; }'})
      })

    })

    describe('javascript', function () {

      it('should return open token', function () {
        var lexer = new ThemeLexer('// #(Test)', {name: 'javascript'});
        lexer.exec()
          .should.include({type: 'open', capture: '// #(Test)', value: 'Test'})
      })

      it('should return close token', function () {
        var lexer = new ThemeLexer('// ##', {name: 'javascript'});
        lexer.exec()
          .should.include({type: 'close', capture: '// ##', value: undefined})
      })

      it('should return variable token', function () {
        var lexer = new ThemeLexer('!(Test)', {name: 'javascript'});
        lexer.exec()
          .should.include({type: 'variable', capture: '!(Test)', value: 'Test'})
      })

      it('should return url token', function () {
        var lexer = new ThemeLexer('@(images/doge.jpg)', {name: 'javascript'});
        lexer.exec()
          .should.include({type: 'url', capture: '@(images/doge.jpg)', value: 'images/doge.jpg'})
      })

      it('should return include token', function () {
        var lexer = new ThemeLexer('// +(src: "test.js")', {name: 'javascript'});
        lexer.exec()
          .should.include({type: 'include', capture: '// +(src: "test.js")', value: {src: 'test.js'}})
      })

      it('should return string token', function () {
        var lexer = new ThemeLexer('var foo = bar;', {name: 'javascript'});
        lexer.exec()
          .should.include({type: 'string', capture: 'var foo = bar;', value: 'var foo = bar;'})
      })

    })

  })

  describe('parser', function () {

    it('should return nil if adapter does not exist', function () {
      var parser = new ThemeParser('var foo = bar;', 'foo');
      (parser.parse() === undefined).should.be.true;
    })

    it('should return valid kind via path', function () {
      var parser = new ThemeParser('foo = bar', {path: 'test.coffee'});
      parser.parse();
      parser.kind.name.should.eq('javascript');
    })

    describe('html', function () {

      it('should return block node', function () {
        var parser = new ThemeParser('<!-- #(Test) -->Foo<!-- ## -->', { with: 'html' });
        parser.parse().should.include(
          {type: 'block', name: 'Test', nodes: [{ type: 'string', value: 'Foo' }]});
      })

      it('should return variable node', function () {
        var parser = new ThemeParser('!(Test)', { with: 'html' });
        parser.parse().should.include(
          {type: 'variable', value: 'Test'});
      })
      
      it('should return variable node with {}', function() {
        var parser = new ThemeParser('{Test}', { with: 'html' });
        parser.parse().should.include(
          { type: 'variable', value: 'Test' }
        );
      });

      it('should return url node', function () {
        var parser = new ThemeParser('@(images/doge.jpg)', { with: 'html' });
        parser.parse().should.include(
          {type: 'url', value: 'images/doge.jpg'});
      })

      it('should return include node', function () {
        var parser = new ThemeParser('<!-- +(src: "test.css") -->', { path: join(fixtures, 'parser', 'html', 'include', 'index.html') });
        parser.parse().should.include(
          {type: 'include', open: '<style type="text/css">', close: '</style>', nodes: [{type: 'string', value: 'body { background: black; }\n'}]});
      })

    })

    describe('css', function () {

      it('should return block node', function () {
        var parser = new ThemeParser('/* #(Test) */Foo/* ## */', { with: 'css' });
        parser.parse().should.include(
          {type: 'block', name: 'Test', nodes: [{ type: 'string', value: 'Foo' }]});
      })

      it('should return variable node', function () {
        var parser = new ThemeParser('!(Test)', { with: 'css' });
        parser.parse().should.include(
          {type: 'variable', value: 'Test'});
      })

      it('should return url node', function () {
        var parser = new ThemeParser('@(images/doge.jpg)', { with: 'css' });
        parser.parse().should.include(
          {type: 'url', value: 'images/doge.jpg'});
      })

      it('should return include node', function () {
        var parser = new ThemeParser('/* +(src: "test.css") */', { path: join(fixtures, 'parser', 'css', 'include', 'style.css') });
        parser.parse().should.include(
          {type: 'include', nodes: [{type: 'string', value: 'body { background: black; }\n'}]});
      })

    })

    describe('javascript', function () {

      it('should return block node', function () {
        var parser = new ThemeParser('// #(Test)\nFoo\n// ##', { with: 'js' });
        parser.parse().should.include(
          {type: 'block', name: 'Test', nodes: [{ type: 'string', value: 'Foo\n' }]});
      })

      it('should return variable node', function () {
        var parser = new ThemeParser('!(Test)', { with: 'js' });
        parser.parse().should.include(
          {type: 'variable', value: 'Test'});
      })

      it('should return url node', function () {
        var parser = new ThemeParser('@(images/doge.jpg)', { with: 'js' });
        parser.parse().should.include(
          {type: 'url', value: 'images/doge.jpg'});
      })

      it('should return include node', function () {
        var parser = new ThemeParser('// +(src: "test.js")', { path: join(fixtures, 'parser', 'javascript', 'include', 'main.js') });
        parser.parse().should.include(
          {type: 'include', nodes: [{type: 'string', value: 'alert(\'foo\');\n'}]});
      })

    })

  })

  describe('compiler', function () {

    describe('blocks', function () {

      it('should render one of block if context is true', function () {
        var compiler = new ThemeCompiler('<!-- #(Test) --><div></div><!-- ## -->', { with: 'html' });
        compiler.compile()({'block:Test': true})
          .should.eq('<div></div>');
      })

      it('should render two of block if context is array with two elements', function () {
        var compiler = new ThemeCompiler('<!-- #(Test) --><div></div><!-- ## -->', { with: 'html' });
        compiler.compile()({'block:Test': [{foo: 'bar'}, {foo: 'bar'}]})
          .should.eq('<div></div><div></div>');
      })

      it('should use block as context if block is object', function () {
        var compiler = new ThemeCompiler('<!-- #(Test) --><div>!(foo)</div><!-- ## -->', { with: 'html' });
        compiler.compile()({'block:Test': {foo: 'bar'}})
          .should.eq('<div>bar</div>');
      })

    })

    describe('url', function () {

      it('should render url with base if specified', function () {
        var compiler = new ThemeCompiler('@(images/doge.jpg)', { with: 'html' });
        compiler.compile()(null, {url: 'http://www.tumblr.com/'})
          .should.eq('http://www.tumblr.com/images/doge.jpg');
      })

      it('should render url if no base is specified', function () {
        var compiler = new ThemeCompiler('@(images/doge.jpg)', { with: 'html' });
        compiler.compile()()
          .should.eq('images/doge.jpg');
      })

    })

    describe('include', function () {

      it('should wrap in enclosure if enclosure for kind specified in map', function () {
        var compiler = new ThemeCompiler('<!-- +(src: "test.css") -->', { path: join(fixtures, 'compiler', 'include', 'index.html') });
        compiler.compile()()
          .should.eq('<style type="text/css">body { background: black; }\n</style>');
      })
      
      it('should include file if variable present in src', function() {
        var compiler = new ThemeCompiler('<!-- +(src: "{name}.html") -->', { path: join(fixtures, 'compiler', 'include', 'index.html' ), customOptions: {name: 'partialTest'}});
        compiler.compile()()
          .should.eq('<div class="dynamic-partial"></div>');
      })

    })
    
    describe('button', function() {
      
      it('should insert likebutton iframe with no options', function() {
        var compiler = new ThemeCompiler('{LikeButton}', { with: 'html'});
        var compiledOutput = compiler.compile()({'PostID': '1234567', 'PostAuthorName': 'test'});
        compiledOutput.should.eq('<div class=\'like_button\' data-post-id=\'1234567\' id=\'like_button_1234567\'><iframe id=\'like_iframe_1234567\' src=\'http://assets.tumblr.com/assets/html/like_iframe.html?_v=1af0c0fbf0ad9b4dc38445698d099106#name=test&amp;post_id=1234567&amp;color=grey&amp;rk=5dXEd33c\' scrolling=\'no\' width=\'20\' height=\'20\' frameborder=\'0\' class=\'like_toggle\' allowtransparency=\'true\' name=\'like_iframe_1234567\'></iframe></div>');
      });
      
      it('should not insert likebutton with no context', function() {
        var compiler = new ThemeCompiler('{LikeButton}', { with: 'html' });
        compiler.compile()().should.eq('{LikeButton color=\'grey\' size=\'20\' }');
      });
      
      it('should insert likebutton iframe with options', function() {
        var compiler = new ThemeCompiler('{LikeButton color="black" size="16"}', { with: 'html' }); 
        compiler.compile()({'PostID': '1234567', 'PostAuthorName': 'test' }).should.eq('<div class=\'like_button\' data-post-id=\'1234567\' id=\'like_button_1234567\'><iframe id=\'like_iframe_1234567\' src=\'http://assets.tumblr.com/assets/html/like_iframe.html?_v=1af0c0fbf0ad9b4dc38445698d099106#name=test&amp;post_id=1234567&amp;color=black&amp;rk=5dXEd33c\' scrolling=\'no\' width=\'16\' height=\'16\' frameborder=\'0\' class=\'like_toggle\' allowtransparency=\'true\' name=\'like_iframe_1234567\'></iframe></div>');
      })
      
      it('should insert reblog button', function() {
        var compiler = new ThemeCompiler('{ReblogButton color="black" size="16"}', { with: 'html' });
        var compiledOutput = compiler.compile()({'ReblogUrl': 'https://www.tumblr.com/reblog/76621181710/Dzl0O7ZG' });
        compiledOutput.should.eq('<a href=\'https://www.tumblr.com/reblog/76621181710/Dzl0O7ZG\' class=\'reblog_button\' style=\'display:block;width:16px;height:16px;\'></a>');
      })
      
    })

  })

});

describe('generator', function () {

  it('should fail if existing directory is specified', function (done) {
    var peak = new Peak(join(fixtures, 'generator'));
    peak.generate().catch(function(error){done();});
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

  this.timeout(10000);

  it('should create .peak folder', function (done) {
    var path = join(fixtures, 'watcher', 'folder')
      , dir = join(path, '.peak')
      , peak;
    helpers.rmdir(dir, function () {
      peak = new Peak(path, {index: 'index.html'});
      peak.watch().done(function () {
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
      peak = new Peak(path, {blog: 'shipdeploy', email: 'ship@carrotcreative.com', password: 'carrotcreative'});
      peak.watch().then(function () {
        read(join(dir, 'index.html'), 'utf8').should.eq('<div>shipdeploy</div>\n');
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

  this.timeout(20000);

  it('should throw exception if credentials are invalid', function (done) {
    var peak = new Peak(join(fixtures, 'deployer', 'invalid'), {email: "foo@bar.com", password: "!@#$%^&"});
    peak.deploy().catch(function(error){done()});
  })

})

var helpers = {

  rmdir: function (path, callback) {
    return rimraf(path, callback.bind(null, path));
  }

}
