Computation
===========

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
