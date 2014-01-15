// A computation describes a way to compute a value out of the environment.
// The value may not immediately be available (eg. if it's being asynchronously
// fetched from a server).

class Computation<T> {

    // Special value which can be used to denote that the computation is
    // pending and the result may become available at a later time.
    static Pending : any = {};


    // The function which when called will produce the computation result.
    private fn : () => T;


    constructor(fn: () => T) {
        this.fn = fn;
    }


    // Convenience function to construct a pending computation.
    static pending<V>(): Computation<V> {
        return new Computation(() => {
            return <V> Computation.Pending;
        });
    }

    // Convenience function to create an failed computation.
    static fail<V>(e: Error): Computation<V> {
        return new Computation((): V => {
            throw e;
        });
    }


    // Like the ES6 Promise#then function.
    then<V>(resolve: (value: T) => V, reject?: (err: Error) => V): Computation<V> {
        return new Computation(() => {
            try {
                return resolve(this.fn());
            } catch (e) {
                if (reject) {
                    return reject(e);
                } else {
                    throw e;
                }
            }
        });
    }

    // Map over the result. Pending state and errors are passsed onto the next
    // computation untounched.
    fmap<V>(f: (value: T) => V): Computation<V> {
        return this.then(v => {
            if (v === Computation.Pending) {
                return <V> Computation.Pending;
            } else {
                return f(v);
            }
        });
    }


    // Pending computations and errors are passed through.
    static liftA2<A,B,C>(a: Computation<A>, b: Computation<B>, f: (a: A, b: B) => C): Computation<C> {
        try {
            var av = a.fn(), bv = b.fn();

            if (av !== Computation.Pending && bv !== Computation.Pending) {
                return new Computation(() => {
                    return f(av, bv);
                });
            } else {
                return Computation.pending<C>();
            }
        } catch (e) {
            return Computation.fail<C>(e);
        }
    }

    // Get the result of this computation. If the result is not available yet,
    // return the fallback value.
    get(fallback: T): T {
        try {
            var result = this.fn();
            if (result === Computation.Pending) {
                return fallback;
            } else {
                return result;
            }
        } catch (e) {
            return fallback;
        }
    }
}


declare var module: any;
if (typeof module !== 'undefined') {
    module.exports = Computation;
}
