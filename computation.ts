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
