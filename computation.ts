// A computation describes a way to compute a value out of the environment.
// The value may not immediately be available (eg. if it's being asynchronously
// fetched from a server).

export default class Computation<T> {
  // Special value which can be used to denote that the computation is
  // pending and the result may become available at a later time.
  //
  // We use a runtime-wide Symbol. The 'Computation' library may be loaded
  // by multiple node modules independently, but we need to ensure that the
  // 'Pending' value can be compared for equality.

  static Pending: any = Symbol.for("Computation.Pending");

  // The function which when called will produce the computation result.
  private fn: () => T;

  constructor(fn: () => T) {
    this.fn = fn;
  }

  // Convenience functions to create pure and failing computations.
  static pure<V>(value: V) {
    return new Computation(() => value);
  }

  static fail<V>(e: Error) {
    return new Computation(
      (): V => {
        throw e;
      }
    );
  }

  // A predefined computation which is always pending. It is a property
  // rather than a function because it doesn't have to be parametrized.
  static pending = new Computation(() => <any>Computation.Pending);

  // Like the ES6 Promise#then function.
  then<V>(
    resolve: (value: T) => V,
    reject?: (err: Error) => V
  ): Computation<V> {
    if (reject === undefined) {
      return new Computation(() => resolve(this.fn()));
    } else {
      return new Computation(() => {
        try {
          return resolve(this.fn());
        } catch (e) {
          return reject(e);
        }
      });
    }
  }

  // Map over the result. Pending state and errors are passsed onto the next
  // computation untounched.
  fmap<V>(f: (value: T) => V): Computation<V> {
    return this.then(v => {
      if (v === Computation.Pending) {
        return <V>Computation.Pending;
      } else {
        return f(v);
      }
    });
  }

  // Like fmap, but the function can return a computation which is then
  // automatically executed.
  bind<V>(f: (value: T) => Computation<V>): Computation<V> {
    return this.fmap(v => f(v).fn());
  }

  // Pending computations and errors are passed through.
  static liftA2<A, B, C>(
    a: Computation<A>,
    b: Computation<B>,
    f: (a: A, b: B) => C
  ): Computation<C> {
    return new Computation(() => {
      let av = a.fn(),
        bv = b.fn();
      if (av !== Computation.Pending && bv !== Computation.Pending) {
        return f(av, bv);
      } else {
        return Computation.Pending;
      }
    });
  }

  // Get the result of this computation. If the result is not available yet,
  // return the fallback value.
  get(fallback: T): T {
    return this.getf(() => fallback);
  }

  // Like 'get' but the fallback value is created lazily.
  getf(fallback: () => T): T {
    try {
      let result = this.fn();
      if (result === Computation.Pending) {
        return fallback();
      } else {
        return result;
      }
    } catch (e) {
      return fallback();
    }
  }
}
