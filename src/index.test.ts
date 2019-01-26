import "mocha";

import Computation from "./index";
import { assert } from "chai";

// Some predefined computations.
const fortyTwo = Computation.pure(42);
const pending = Computation.pending;
const failure = Computation.fail(new Error("fail"));

// Transformation functions.
function multiplyByTwo(x) {
  return x * 2;
}

function multipleByTwoC(x) {
  return Computation.pure(x * 2);
}

describe("Computation#get", function() {
  it("should use the given computation function to compute the result", function() {
    assert.equal(42, fortyTwo.get(0));
  });
  it("should use the fallback value if the computation is pending", function() {
    assert.equal("fallback", pending.get("fallback"));
  });
  it("should use the fallback value if the computation throws an exception", function() {
    assert.equal("fallback", failure.get("fallback"));
  });
});

describe("Computation#then", function() {
  it("should use the resolve function to map the value", function() {
    assert.equal(84, fortyTwo.then(multiplyByTwo).get(0));
  });
  it("should fail if the computation throws an exception", function() {
    assert.equal(42, failure.then(() => {}).get(42));
  });
  it("should should use the reject callback to transform exceptions", function() {
    function handleError(e) {
      return "not " + e.message;
    }
    assert.equal(
      "not fail",
      failure.then(() => "", handleError).get(undefined)
    );
  });
});

describe("Computation#fmap", function() {
  it("should map the result to a new value", function() {
    assert.equal(84, fortyTwo.fmap(multiplyByTwo).get(0));
  });
  it("should pass pending state through", function() {
    assert.equal(42, pending.fmap(() => {}).get(42));
  });
});

describe("Computation#bind", function() {
  it("should propagate pending state of the continuation", function() {
    assert.equal("pending", fortyTwo.bind(() => pending).get("pending"));
  });
  it("should propagate error of the continuation", function() {
    assert.equal("pending", fortyTwo.bind(() => failure).get("pending"));
  });
  it("should apply the function to the value", function() {
    assert.equal(84, fortyTwo.bind(multipleByTwoC).get(0));
  });
});

describe("Computation#liftA2", function() {
  it("should pass input to the given function", function() {
    assert.equal(
      84,
      Computation.liftA2(fortyTwo, fortyTwo, function(a, b) {
        return a + b;
      }).get(0)
    );
  });
  it("should propagate pending state", function() {
    assert.equal(
      "pending",
      Computation.liftA2(pending, fortyTwo, function(a, b) {
        return "" + a + b;
      }).get("pending")
    );
  });
  it("should propagate errors", function() {
    assert.equal(
      "pending",
      Computation.liftA2(failure, fortyTwo, function(a, b) {
        return "" + a + b;
      }).get("pending")
    );
  });
});
