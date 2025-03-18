---
"computation": minor
---

Simplify fmap implementaton

The callback invoked by .then() does not need to handle the Pending case.
That is done automatically inside .then() already.
