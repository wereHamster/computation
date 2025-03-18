# computation

## 2.1.0

### Minor Changes

- 4c48c77: Explicitly allow Computation function to return Pending sentinel

  Previously we did not explicitly allow the Computation function to return the Pending sentinel.
  Though most of the code already handled that case correctly.
  This change makes the typing around the Computation function more accurate.

- c230ed9: Simplify fmap implementaton

  The callback invoked by .then() does not need to handle the Pending case.
  That is done automatically inside .then() already.
