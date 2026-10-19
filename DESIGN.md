# Design

Taste: the `portfolio` reference from the `house-style` skill; this site is its source. Process (motion, inline feedback, failure and empty states) comes from the `design` skill.

## Scene

A recruiter or peer opening a link from a résumé or post, on a laptop or phone, curious and skimming. Dark theme only.

## States

| Situation | Pattern |
|---|---|
| Loading | a `role="status"` region in place naming what is loading |
| Error | the same region names the failure and says what is safe; the retry control sits beside the status line |
| Empty | one sentence in place of the list inviting the first entry |

No toasts: feedback renders beside its cause. The fry leaderboard (`role="status"` region with a retry button beside it) is the starting point, not a conforming example: it says only "Loading…" and its error text omits what is safe.
