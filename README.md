# computation

[![npm version][npm-version-src]][npm-version-href]

A small JavaScript library to express computations which always produce
a meaningful value, even if the computation can't be completed yet.

The library was written to be used inside a [React][react] application. React
requires that you can always render the user interface, even if data is being
loaded in the background. That means the render functions must be synchronous,
which makes use of Promises inside them impossible.

You can work around this by using the component state to manage these
asynchronous tasks. But what if you already have a global state which fully
describes your application? Then you just need a way to specify computations
which pull out the necessary data from the global state. And that is where
this library comes into play.

At the heart of a computation is a function which either:

 - Returns the value
 - Returns a sentinel specifying that the value is being loaded in the
   background.
 - Throws an error

To get the result out of a computation, you need to specify a fallback value,
which will be used if the result is not available yet (regardless of the
reason).



## API

### new Computation(fn)

Creates a new computation. The given function must return the value or the
sentinel (`Computation.Pending`) if the result is not available yet.


### then(resolve, reject)

This function is analogous to Promise#then. The first callback is mandatory,
and will be executed when the computation is either completed or pending. The
second callback is optional and is called when the computation threw an error.
Both callbacks are free to return a value, the pending sentinel or throw an
error.

Usually you won't need to use this function directly. There are higher-level
combinators which are more convenient to use:`fmap` and `bind`.


### get(fallback)

Run the computation and get the result. If the computation is pending or
throws an error at any point, then the fallback value is returned instead.


### fmap(fn)

If the computation yields a value (ie. is not pending and did not throw any
error), map it to a new value. Use it if you can directly compute the new
value from the input.


### bind(fn)

Similar to `fmap`, but the function can return a `Computation` instead of
a value directly. The computation is automatically executed when needed. Use
this to chain computations together.


### liftA2(a, b, fn)

If you have two computations `a` and `b`, you can apply the function `fn` once
both results are available.


### static pure(v)

Convenience function to create a computation which returns the given value.


### static fail(e)

Convenience function to create a computation which throws the given error.


### static pending

Computation which is pending. This is a property, not a function!



### Examples

The examples are written in TypeScript, same as the library. But you can also
use the library from plain JavaScript.

```typescript
// Computation which fetches a list of strings from the server.
function fetchListFromServer(url: string): Computation<string[]> {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();

    return new Computation(() => {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                return JSON.parse(xhr.responseText);
            } else {
                throw new Error(xhr.status);
            }
        } else {
            return Computation.Pending;
        }
    });
}

// Define a computation which will eventually deliver the list.
var listComputation = fetchListFromServer('/list');

// Poll for the result, use an empty list if the result was not fetched yet.
setInterval(function() {
    console.log(listComputation.get([]));
}, 1000);
```

You probably want to add a more elaborate error handling, like treating status
codes differently (401, 403, 404, 500, ...). For that we can use the `then`
function. It allows us to map the result or error to a new result.

```typescript
// The list computation status represents the status of the fetch task
// as a human readable string.
var listComputationStatus = listComputation.then(resolve, reject);

// Function to be map the result to a status string.
function resolve(result) {
    if (result == Computation.Pending) {
        return 'Fetching from server...';
    } else {
        return 'Fetched ' + result.length + ' items';
    }
}

function reject(err) {
    // Handle differently depending on status code (stored in err.message).
    return 'Failed to fetch data from server (status ' + err.message + ')';
}

// We poll again and print the status. The fallback should not be used,
// because we map all possible cases of the listComputation into a proper string.
setInterval(function() {
    console.log(listComputationStatus.get("You should never see this string"));
}, 1000);
```


[react]: http://facebook.github.io/react/

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/computation?style=for-the-badge&colorA=131511&colorB=3673b1
[npm-version-href]: https://npmjs.com/package/computation
