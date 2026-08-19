---
title: "We Audited 24 READMEs by Hand. Then We Deleted the Process."
description: "Twenty pull requests into a manual documentation cleanup, we abandoned the epic on purpose and replaced it with a linter and a required CI check."
pubDate: 2026-01-22
tags: ["developer-experience", "ci", "documentation", "process"]
---

Our organization had a README template and several dozen repositories, and the overlap between "repos" and "repos that followed the template" was embarrassing. Some READMEs were missing setup instructions. Others described services that had been rewritten twice. A few repos had no README at all.

So I did the responsible thing. I scoped a proper cleanup: an epic with one story per repository, each story bringing that repo's README up to the org standard. Twenty-four repos, twenty-four stories, a clear definition of done. I even made it efficient, dispatching AI agents in batches to draft the updates, so the mechanical work moved fast and human time went to review.

It worked. Pull requests went up, early ones merged, the burndown chart did its satisfying thing. Twenty PRs in, I killed the epic and abandoned most of them.

## The decay argument

What stopped me had nothing to do with the quality of the PRs. They were fine. The problem was the day after the last one merged.

A README standardized by hand starts rotting immediately. A feature changes a setup step. A reorg renames the team on the ownership line, a service migration invalidates a link, and nothing anywhere notices. What the epic actually produced was a snapshot: "on this date, all 24 READMEs complied." Six months later we would be back where we started, minus the credibility of the standard, because everyone would remember that the last big cleanup did not stick either.

Hand-auditing does not produce compliance. It produces a photograph of it, dated the day you finished.

## Sunk cost, faced honestly

Abandoning twenty open pull requests felt terrible. They were done, reviewed or nearly reviewed, each one a small real improvement. Merging them all and *then* building enforcement was the comfortable path, and the argument for it ("the work is already done, just land it") is emotionally compelling and not entirely wrong.

The problem: those twenty merges would have consumed the team's attention budget for README work and produced the same decaying snapshot. The three PRs that had already merged stayed merged. The rest were superseded by something better, and finishing them anyway would have been effort spent making the sunk cost feel justified.

## What replaced the epic

The replacement had four parts, none of them clever on its own:

- A style guide rewritten as a machine-checkable contract: required sections, required ordering, a pattern each section must satisfy. Any rule a program could not check got reworded until it could be, or cut.
- A small Python linter that validates any README against that contract and names the missing piece in terms a contributor can fix without ever opening the guide.
- A reusable pipeline template, so a repo adds the check with one include.
- A required branch policy: a PR that breaks the README contract does not merge.

![Diagram: the manual audit produced a dated snapshot of compliance; its replacement lints every pull request against a machine-checkable README contract, failing PRs get an exact fix list, and a required branch policy makes passing the gate a condition of merging](/blog/readme-gate.svg)

Bulk remediation still happened, once, to get every repo past the gate. The difference is that the gate remains. The system now enforces the standard on every future PR, forever, at a marginal cost of about two seconds of CI time. Compliance stopped being a project and became a property.

## Audits become artifacts

A convention without a CI gate is a suggestion, and suggestions decay at the speed of your busiest sprint. When you find yourself auditing anything by hand for the second time, stop and convert the audit into something executable: a lint rule instead of a style guide page, a test instead of a paragraph describing the behavior. And if you are twenty PRs into the manual version when you work this out, those twenty PRs are not the thing worth protecting.
