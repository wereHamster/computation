var Computation = require('../' + (process.env.COMPUTATION || 'computation'))
  , chai        = require('chai')
  , assert      = chai.assert;


// Some predefined computations.
var fortyTwo = new Computation(function() { return 42; })
  , pending  = new Computation(function() { return Computation.Pending; })
  , failure  = new Computation(function() { throw new Error('fail'); });
  ;


// Transformation functions.
function multiplyByTwo(x) {
    return x * 2;
}


describe('Computation#get', function() {
    it('should use the given computation function to compute the result', function() {
        assert.equal(42, fortyTwo.get());
    });
    it('should use the fallback value if the computation is pending', function() {
        assert.equal('fallback', pending.get('fallback'));
    });
    it('should use the fallback value if the computation throws an exception', function() {
        assert.equal('fallback', failure.get('fallback'));
    });
});

describe('Computation#then', function() {
    it('should use the resolve function to map the value', function() {
        assert.equal(84, fortyTwo.then(multiplyByTwo).get());
    });
    it('should fail if the computation throws an exception', function() {
        assert.equal(42, failure.then().get(42));
    });
    it('should should use the reject callback to transform exceptions', function() {
        function handleError(e) { return 'not ' + e.message; }
        assert.equal('not fail', failure.then(null, handleError).get());
    });
});

describe('Computation#fmap', function() {
    it('should map the result to a new value', function() {
        assert.equal(84, fortyTwo.fmap(multiplyByTwo).get());
    });
    it('should pass pending state through', function() {
        assert.equal(42, pending.fmap().get(42));
    });
});

describe('Computation#liftA2', function() {
    it('should pass input to the given function', function() {
        assert.equal(84, Computation.liftA2(fortyTwo, fortyTwo, function(a, b) {
            return a + b;
        }).get());
    });
    it('should propagate pending state', function() {
        assert.equal('pending', Computation.liftA2(pending, fortyTwo, function(a, b) {
            return a + b;
        }).get('pending'));
    });
    it('should propagate errors', function() {
        assert.equal('pending', Computation.liftA2(failure, fortyTwo, function(a, b) {
            return a + b;
        }).get('pending'));
    });
});
