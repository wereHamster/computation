// A computation describes a way to compute a value out of the environment.
// The value may not immediately be available (eg. if it's being asynchronously
// fetched from a server).

const Pending = Symbol.for("Computation.Pending");
type Pending = typeof Pending;

export default class Computation<T> {
  // Special value which can be used to denote that the computation is
  // pending and the result may become available at a later time.
  //
  // We use a runtime-wide Symbol. The 'Computation' library may be loaded
  // by multiple node modules independently, but we need to ensure that the
  // 'Pending' value can be compared for equality.

  static readonly Pending = Pending;

  // The function which when called will produce the computation result.
  private fn: () => Pending | T;

  constructor(fn: () => Pending | T) {
    this.fn = fn;
  }

  // Convenience functions to create pure and failing computations.
  static pure<V>(value: V) {
    return new Computation(() => value);
  }

  static fail(e: Error) {
    return new Computation(() => {
      throw e;
    });
  }

  // A predefined computation which is always pending. It is a property
  // rather than a function because it doesn't have to be parametrized.
  static pending = new Computation<never>((() => Pending) as any);

  // Like the ES6 Promise#then function.
  then<V>(
    resolve: (value: T) => Pending | V,
    reject?: (err: Error) => V,
  ): Computation<V> {
    if (reject === undefined) {
      return new Computation(() => {
        const value = this.fn();
        if (value === Pending) {
          return Pending;
        } else {
          return resolve(value);
        }
      });
    } else {
      return new Computation(() => {
        try {
          const value = this.fn();
          if (value === Pending) {
            return Pending;
          } else {
            return resolve(value);
          }
        } catch (e: any) {
          return reject(e);
        }
      });
    }
  }

  // Map over the result. Pending state and errors are passsed onto the next
  // computation untounched.
  fmap<V>(f: (value: T) => Pending | V): Computation<V> {
    return this.then<V>((v) => {
      if (v === Pending) {
        return Pending;
      } else {
        return f(v);
      }
    });
  }

  // Like fmap, but the function can return a computation which is then
  // automatically executed.
  bind<V>(f: (value: T) => Computation<V>): Computation<V> {
    return this.fmap((v) => f(v).fn());
  }

  // Pending computations and errors are passed through.
  static liftA2<A, B, C>(
    a: Computation<A>,
    b: Computation<B>,
    f: (a: A, b: B) => C,
  ): Computation<C> {
    return new Computation(() => {
      const av = a.fn();
      const bv = b.fn();
      if (av !== Pending && bv !== Pending) {
        return f(av, bv);
      } else {
        return Pending;
      }
    });
  }

  // Get the result of this computation. If the result is not available yet,
  // return the fallback value.
  get<A>(fallback: A): T | A {
    return this.getf<A>(() => fallback);
  }

  // Like 'get' but the fallback value is created lazily.
  getf<A>(fallback: () => A): T | A {
    try {
      const result = this.fn();
      if (result === Pending) {
        return fallback();
      } else {
        return result;
      }
    } catch (e) {
      return fallback();
    }
  }
}
