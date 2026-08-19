---
title: "The 403 That Refused to Be a One-Line Fix"
description: "A failing deploy, a hand-edited Azure role shared by three services, and why the real fix was an IAM-as-code layer with a drift gate instead of a permissions patch."
pubDate: 2026-03-10
tags: ["azure", "rbac", "bicep", "infrastructure-as-code"]
---

A deploy pipeline that had worked for months started failing with an ARM 403 during a function app slot deploy. Permission denied, on an operation that used to succeed.

Every platform engineer knows the tempting version of this fix. Find the identity, find the missing permission, grant it in the portal, rerun the pipeline, green check, close the ticket, get coffee. Ten minutes, tops.

That would have been the wrong fix, and not only for this pipeline: the same reasoning applies to most cloud permission failures.

## Root-causing the 403

The deploy identity held a custom Azure role, created by hand in the portal, with a name along the lines of "Custom FunctionApp Slot Deploy." Tracing the failing ARM calls showed the role was missing the actions needed to read publish profiles and app configuration during the slot operation.

Two facts turned this from a permissions bug into an architecture smell:

1. **The role was shared by three services.** Whatever I changed for this pipeline would silently change the security posture of two other deploy paths.
2. **Nothing, anywhere, recorded what the role was supposed to contain.** No file, no doc, no template. The role's definition existed in exactly one place: the live Azure portal, as the accumulated result of hand edits nobody could reconstruct.

That second fact is the important one. The question "what actions should this role have?" had no authoritative answer anywhere. Patching it in the portal would have left the contents just as undocumented, and just as shared, ready to break a different service on a different afternoon. The next engineer to hit a 403 on it would have started from the same nothing I started from.

## Fixing the layer instead of the symptom

The fix that actually closes the loop: make the role's definition exist somewhere other than the portal.

We stood up an IAM layer in our platform infrastructure repository. The custom role, with its corrected action list, became a Bicep definition: versioned, reviewed in pull requests, deployed like any other infrastructure. The 403 fix itself came out to one added action on one line of that file. Getting to a place where that line could be reviewed by somebody took the rest of the work.

Then the part that keeps it fixed: a CI gate that runs an ARM what-if against the live role on every change. Hand-edit the role in the portal now and the drift surfaces as a failed build, in daylight, instead of as a failed production deploy at 5pm. The definition in code is authoritative because the pipeline checks that it still matches.

![Diagram: the role definition moves from hand edits in the portal to a Bicep file that deploys the live role, with a CI what-if gate comparing code against live so drift fails the build instead of a production deploy](/blog/iam-drift-gate.svg)

Fixing the role once fixed three services, because it was shared. Shared infrastructure multiplies blast radius, and it multiplies fix value by exactly the same factor. Better to make that trade on purpose than by accident.

## The rejected alternative, honestly

Patching the single pipeline's permissions was not obviously wrong in the moment. It was faster and lower risk that day, and it did not require anyone to agree on where IAM definitions should live. If this had been a one-off role on a one-off service scheduled for decommission, the patch would have been the right call.

Codifying everything is not free. The argument for the IAM layer rested on this particular role being shared, undocumented, and already breaking a deploy. Take away any one of those and I would have patched it.

## What to do at the next 403

A cloud resource that lives only in the portal will eventually cause an incident. Nothing records what it is supposed to contain, so every deploy that depends on it is running on a guess. When a permissions failure starts pushing you toward a hand-edit, spend the extra hour instead: put the resource in code, add a drift check, and let the 403 pick which piece of invisible infrastructure you make visible first.
