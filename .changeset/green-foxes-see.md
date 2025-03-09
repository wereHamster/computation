---
"computation": minor
---

Explicitly allow Computation function to return Pending sentinel

Previously we did not explicitly allow the Computation function to return the Pending sentinel.
Though most of the code already handled that case correctly.
This change makes the typing around the Computation function more accurate.
