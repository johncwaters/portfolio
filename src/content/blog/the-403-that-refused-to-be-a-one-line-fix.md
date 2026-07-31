---
title: "The 403 That Refused to Be a One-Line Fix"
description: "A failing deploy, a hand-edited Azure role shared by three services, and why the real fix was an IAM-as-code layer with a drift gate instead of a permissions patch."
pubDate: 2026-03-10
tags: ["azure", "rbac", "bicep", "infrastructure-as-code"]
---

A deploy pipeline that had worked for months started failing with an ARM 403 during a function app slot deploy. Permission denied, on an operation that used to succeed.

Every platform engineer knows the tempting version of this fix. Find the identity, find the missing permission, grant it in the portal, rerun the pipeline, green check, close the ticket, get coffee. Ten minutes, tops.

I want to walk through why that would have been the wrong fix, because the reasoning generalizes to most cloud permission failures.

## Root-causing the 403

The deploy identity held a custom Azure role, created by hand in the portal some time in the past, with a name along the lines of "Custom FunctionApp Slot Deploy." Tracing the failing ARM calls showed the role was missing the actions needed to read publish profiles and app configuration during the slot operation.

Two facts turned this from a permissions bug into an architecture smell:

1. **The role was shared by three services.** Whatever I changed for this pipeline would silently change the security posture of two other deploy paths.
2. **Nothing, anywhere, recorded what the role was supposed to contain.** No file, no doc, no template. The role's definition existed in exactly one place: the live Azure portal, as the accumulated result of hand edits nobody could reconstruct.

That second fact is the important one. The question "what actions should this role have?" had no authoritative answer. Patching it in the portal would produce a role whose contents were still undocumented, still shared, still one hand-edit away from breaking a different service on a different afternoon. The next engineer to hit a 403 would start from zero, exactly like I did.

## Fixing the layer instead of the symptom

The fix that actually closes the loop: make the role's definition exist somewhere other than the portal.

We stood up an IAM layer in our platform infrastructure repository. The custom role, with its corrected action list, became a Bicep definition: versioned, reviewed in pull requests, deployed like any other infrastructure. The 403 fix itself was a one-line action added to that file, which is the punchline: the *fix* was one line, it was the *system that makes the line reviewable* that was missing.

Then the part that keeps it fixed: a CI gate that runs an ARM what-if against the live role on every change. If someone hand-edits the role in the portal again, the drift shows up as a failed build in daylight, not as a failed production deploy at 5pm. The role's definition in code is now authoritative, and the pipeline proves it stays that way.

![Diagram: the role definition moves from hand edits in the portal to a Bicep file that deploys the live role, with a CI what-if gate comparing code against live so drift fails the build instead of a production deploy](/blog/iam-drift-gate.svg)

Because the role was shared, fixing it once fixed three services. Shared infrastructure multiplies blast radius, but it multiplies fix value by exactly the same factor. That trade is worth making on purpose instead of by accident.

## The rejected alternative, honestly

Patching the single pipeline's permissions was not obviously wrong in the moment. It was faster, lower risk today, and did not require agreeing on where IAM definitions should live. If this had been a one-off role on a one-off service scheduled for decommission, the patch would have been the right call. Codifying everything is not free; the argument for the IAM layer was specifically that this role was *shared*, *undocumented*, and *already causing failures*. That is the combination that justifies building the layer.

## The rule worth keeping

Any cloud resource that exists only in the portal is a production incident on a timer. If no file says what a permission should be, every deploy that depends on it is a guess. When a permissions failure sends you toward a hand-edit, spend the extra hour turning the resource into code with a drift check, because the 403 you are debugging is the system telling you exactly which piece of invisible infrastructure to make visible first.
