var chai = require('chai')
  , cli = require('../lib/cli')
  , fs = require('fs')
  , path = require('path')

  , join = path.join
  , exists = fs.existsSync

  , fixtures = join(__dirname, "fixtures");

chai.should();

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
      var c = new cli({path: join(fixtures, 'cli', 'exec')});
      c.exec(function () {
        done();
        exists(join(fixtures, 'cli', 'exec', 'public')).should.be.true;
      })
    })

  })

})
