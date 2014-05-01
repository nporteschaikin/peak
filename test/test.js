var chai = require('chai')
  , cli = require('../lib/cli')
  , peak = require('..')
  , fs = require('fs')
  , path = require('path')

  , join = path.join
  , exists = fs.existsSync
  , unlink = fs.unlinkSync
  , read = fs.readFileSync

  , fixtures = join(__dirname, "fixtures");

chai.should();

function rm (dir) {
  if (exists(dir)) unlink(dir);
  return dir;
}

describe('cli', function () {

  var c = new cli({path: join(fixtures, 'cli', 'base')});

  it('should throw an error if path is invalid', function () {
    (function(){new cli({path: "!@#$%&"})}).should.throw();
  })

  it('does not throw with a valid path', function () {
    (function(){c}).should.not.throw();
  })

  it('should have a peak instance', function () {
    c.should.have.ownProperty('peak');
  })

  it('should have an emitter', function () {
    c.should.have.ownProperty('emitter');
  })

  describe('exec', function () {

    it('should compile to public folder', function (done) {
      var pub = rm(join(fixtures, 'cli', 'exec', '.peak', 'public', 'index.html'))
        , c = new cli({path: join(fixtures, 'cli', 'exec')});
      c.exec(function () {
        done();
        exists(pub).should.be.true;
        c.exit();
      })
    })

    it('should compile a theme file', function (done) {
      var theme = rm(join(fixtures, 'cli', 'exec', '.peak', 'public', 'theme', 'index.html'))
        , c = new cli({theme: true, path: join(fixtures, 'cli', 'exec')});
      c.exec(function () {
        done();
        exists(theme).should.be.true;
        c.exit();
      })
    })

  })

  describe('events', function() {

    it('should return an object with a _maxListeners property', function () {
      var c = new cli({path: join(fixtures, 'cli', 'exec')});
      c.events().should.have.ownProperty('_maxListeners');
    })

  })

})

describe('api', function () {

  describe('start', function () {

    var p = new peak(join(fixtures, 'api', 'base'))
      , base = join(fixtures, 'api', 'base', '.peak')
      , out = rm(join(base, 'index.html'))
      , pub = rm(join(base, 'public', 'index.html'));

    before(function (done) {
      p.start(function(){done();p.stop();});
    })

    it('should compile to public folder', function () {
      exists(pub).should.be.true;
    })

    it('should compile correctly', function () {
      read(pub, 'utf8').should
        .eq('<!DOCTYPE html><html><head><title>Fixture</title></head></html>');
    })

    it('should output original file to base dir', function () {
      read(out, 'utf8').should
        .eq('<!DOCTYPE html><html><head><title>Fixture</title></head></html>');
    })

    it('peak.options.index == "index.html"', function (done) {
      var p2 = new peak(join(fixtures, 'api', 'base', 'index.sneak'));
      p2.start(function () {
        done();
        this.stop();
        this.options.index.should.eq('index.html');
      })
    })

    it('should get tumblr', function (done) {
      this.timeout(0);
      var p3 = new peak(join(fixtures, 'api', 'base', 'index.sneak'), { tumblr: "carrotcreative", port: "1234" });
      p3.start(function () {
        done();
        this.stop();
        this.context.should.include('block:Posts');
      })
    })

    it('should parse tumblr blocks', function (done) {
      this.timeout(0);
      var p4 = new peak(join(fixtures, 'api', 'base', 'blocks.sneak'), { tumblr: "carrotcreative", port: "4321" });
      p4.start(function () {
        done();
        this.stop();
        read(join(fixtures, 'api', 'base', '.peak', 'public', 'blocks.html'), 'utf8').should.include('<p>1</p><p>1</p><p>1</p>');
      })
    })

    it('should parse tumblr variables', function (done) {
      this.timeout(0);
      var p4 = new peak(join(fixtures, 'api', 'base', 'variables.sneak'), { tumblr: "carrotcreative", port: "4321" });
      p4.start(function () {
        done();
        this.stop();
        read(join(fixtures, 'api', 'base', '.peak', 'public', 'variables.html'), 'utf8').should.include('<p>carrotcreative</p>');
      })
    })

  })

})
