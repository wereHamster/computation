/// <reference types="node" />

import { test, describe, it } from "node:test";
import assert from "node:assert";
import * as fc from "fast-check";

import Computation from "./index.js";

// Some predefined computations.
const fortyTwo = Computation.pure(42);
const pending = Computation.pending;
const failure = Computation.fail(new Error("fail"));

// Transformation functions.
function multiplyByTwo(x: number) {
  return x * 2;
}

function multipleByTwoC(x: number) {
  return Computation.pure(x * 2);
}

describe("Computation#get", () => {
  it("should use the given computation function to compute the result", () => {
    assert.equal(42, fortyTwo.get(0));
  });
  it("should use the fallback value if the computation is pending", () => {
    assert.equal("fallback", pending.get("fallback"));
  });
  it("should use the fallback value if the computation throws an exception", () => {
    assert.equal("fallback", failure.get("fallback"));
  });
});

describe("Computation#then", () => {
  it("should pass Pending through", () => {
    assert.equal("fallback", pending.then(multiplyByTwo).get("fallback"));
    assert.equal("fallback", pending.then(multiplyByTwo, () => 1).get("fallback"));
  });
  it("should use the resolve function to map the value", () => {
    assert.equal(84, fortyTwo.then(multiplyByTwo).get(0));
    assert.equal(84, fortyTwo.then(multiplyByTwo, () => 1).get(0));
  });
  it("should fail if the computation throws an exception", () => {
    assert.equal(42, failure.then(() => {}).get(42));
  });
  it("should use the reject callback to transform exceptions", () => {
    function handleError(e: Error) {
      return `not ${e.message}`;
    }
    assert.equal(
      "not fail",
      failure.then(() => "", handleError).get(undefined),
    );
  });
});

describe("Computation#fmap", () => {
  it("should map the result to a new value", () => {
    assert.equal(84, fortyTwo.fmap(multiplyByTwo).get(0));
  });
  it("should pass pending state through", () => {
    assert.equal(42, pending.fmap(() => {}).get(42));
  });
});

describe("Computation#bind", () => {
  it("should propagate pending state of the continuation", () => {
    assert.equal("pending", fortyTwo.bind(() => pending).get("pending"));
  });
  it("should propagate error of the continuation", () => {
    assert.equal("pending", fortyTwo.bind(() => failure).get("pending"));
  });
  it("should apply the function to the value", () => {
    assert.equal(84, fortyTwo.bind(multipleByTwoC).get(0));
  });
});

describe("Computation#liftA2", () => {
  it("should pass input to the given function", () => {
    assert.equal(
      84,
      Computation.liftA2(fortyTwo, fortyTwo, (a, b) => a + b).get(0),
    );
  });
  it("should propagate pending state", () => {
    assert.equal(
      "pending",
      Computation.liftA2(pending, fortyTwo, (a, b) => `${a}${b}`).get(
        "pending",
      ),
    );
  });
  it("should propagate errors", () => {
    assert.equal(
      "pending",
      Computation.liftA2(failure, fortyTwo, (a, b) => `${a}${b}`).get(
        "pending",
      ),
    );
  });
});

test("forall x,f. pure(x).fmap(f).get() === f(x)", () => {
  const mapper = fc.constant((x: unknown) => {
    if (x === undefined) {
      return "UNDEFINED";
    } else if (x === null) {
      return "NULL";
    } else if (typeof x === "symbol") {
      return x.toString();
    } else if (typeof x === "number") {
      return x * 2;
    } else if (typeof x === "bigint") {
      return x * 2n;
    } else if (typeof x === "string") {
      return x.toUpperCase();
    } else if (typeof x === "boolean") {
      return !x;
    } else if (Array.isArray(x)) {
      return [...x, 42];
    } else if (typeof x === "object") {
      return { ...x, id: 42 };
    } else if (typeof x === "function") {
      return x();
    }

    throw new Error("Unexpected Value");
  });

  fc.assert(
    fc.property(fc.anything(), fc.oneof(mapper, fc.func(fc.anything())), (x, f) => {
      assert.deepEqual(Computation.pure(x).fmap(f).get(undefined), f(x));
    })
  );
});
