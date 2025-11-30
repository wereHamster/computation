// A computation describes a way to compute a value out of the environment.
// The value may not immediately be available (eg. if it's being asynchronously
// fetched from a server).

const Pending = Symbol.for("Computation.Pending");
type Pending = typeof Pending;

/**
 * The value that the computation function can return.
 * Either a {@link Pending} sentinel or a value of its chosing.
 */
type Return<T> = Pending | T;

export default class Computation<T> {
  // Special value which can be used to denote that the computation is
  // pending and the result may become available at a later time.
  //
  // We use a runtime-wide Symbol. The 'Computation' library may be loaded
  // by multiple node modules independently, but we need to ensure that the
  // 'Pending' value can be compared for equality.

  static readonly Pending: Pending = Pending;

  // The function which when called will produce the computation result.
  private fn: () => Return<T>;

  constructor(fn: () => Return<T>) {
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
  static pending = new Computation<never>(() => Computation.Pending);

  // Like the ES6 Promise#then function.
  then<V>(
    resolve: (value: T) => Return<V>,
    reject?: (err: Error) => V,
  ): Computation<V> {
    if (reject === undefined) {
      return new Computation(() => {
        const value = this.fn();
        if (value === Computation.Pending) {
          return Computation.Pending;
        } else {
          return resolve(value);
        }
      });
    } else {
      return new Computation(() => {
        try {
          const value = this.fn();
          if (value === Computation.Pending) {
            return Computation.Pending;
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
  fmap<V>(f: (value: T) => V): Computation<V> {
    return this.then(f);
  }

  // Like fmap, but the function can return a computation which is then
  // automatically executed.
  bind<V>(f: (value: T) => Computation<V>): Computation<V> {
    return this.then((v) => f(v).fn());
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
      if (av !== Computation.Pending && bv !== Computation.Pending) {
        return f(av, bv);
      } else {
        return Computation.Pending;
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
      if (result === Computation.Pending) {
        return fallback();
      } else {
        return result;
      }
    } catch (_e) {
      return fallback();
    }
  }
}
