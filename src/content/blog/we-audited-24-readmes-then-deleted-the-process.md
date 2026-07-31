---
title: "We Audited 24 READMEs by Hand. Then We Deleted the Process."
description: "Twenty pull requests into a manual documentation cleanup, we abandoned the epic on purpose and replaced it with a linter and a required CI check."
pubDate: 2026-07-29
tags: ["developer-experience", "ci", "documentation", "process"]
cover: "/blog/covers/we-audited-24-readmes-then-deleted-the-process.svg"
---

Our organization had a README template and several dozen repositories, and the overlap between "repos" and "repos that followed the template" was embarrassing. Some READMEs were missing setup instructions, some described services that had been rewritten twice, some did not exist.

So I did the responsible thing. I scoped a proper cleanup: an epic with one story per repository, each story bringing that repo's README up to the org standard. Twenty-four repos, twenty-four stories, a clear definition of done. I even made it efficient, dispatching AI agents in batches to draft the updates, so the mechanical work moved fast and human time went to review.

It worked. Pull requests went up, early ones merged, the burndown chart did its satisfying thing. Twenty PRs in, I killed the epic and abandoned most of them.

## The decay argument

The realization that stopped me was not about the quality of the PRs. It was about what happens the day after the last one merges.

A README standardized by hand starts rotting immediately. The next feature changes a setup step, the next reorg renames a team, the next service migration invalidates a link, and nothing anywhere notices. The epic was producing a snapshot: "on this date, all 24 READMEs complied." Six months later we would be exactly where we started, minus the credibility of the standard, because everyone would remember that the last big cleanup did not stick either.

Manual compliance work does not produce compliance. It produces a photograph of compliance, dated the day you finished.

![Line chart showing compliance rising after each manual README cleanup and decaying before the next one, sawtoothing over time. Once the required CI check lands, compliance stays flat at the top instead of decaying again.](/blog/figures/we-audited-24-readmes-then-deleted-the-process/fig-1.svg)

## Sunk cost, faced honestly

Abandoning twenty open pull requests felt terrible. They were done, reviewed or nearly reviewed, each one a small real improvement. Merging them all and *then* building enforcement was the comfortable path, and I want to be honest that the argument for it ("the work is already done, just land it") is emotionally compelling and not entirely wrong.

The problem: those twenty merges would have consumed the team's attention budget for README work and produced the same decaying snapshot. The three PRs that had already merged stayed merged. The rest were superseded by something better, and finishing them anyway would have been effort spent making the sunk cost feel justified.

## What replaced the epic

The replacement had four parts, none of them clever individually. The prose style guide became a machine-checkable contract: required sections, required ordering, patterns each section must satisfy, and any rule that could not be checked by a program was rewritten until it could be, or cut. A small Python linter validates any README against that contract and says exactly what is missing, in terms a contributor can fix without ever opening the style guide. A reusable pipeline template lets any repo add the check with one include. And a required branch policy makes it binding: a PR that breaks the README contract does not merge.

Bulk remediation still happened, once, to get every repo past the gate. The difference is that the gate remains. The system now enforces the standard on every future PR, forever, at a marginal cost of about two seconds of CI time. Compliance stopped being a project and became a property.

## Audits become artifacts

A convention without a CI gate is a suggestion, and suggestions decay at the speed of your busiest sprint. When you find yourself auditing anything by hand for the second time, stop and convert the audit into an executable artifact: a lint rule beats a style guide, a test beats a behavior doc, a schema beats a glossary. And if you are mid-way through the manual version when you realize this, killing the in-flight work is not waste. Finishing it would be.

![Table mapping manual, decaying artifacts to executable, enforcing ones: style guide to lint rule, behavior doc to test, glossary to schema.](/blog/figures/we-audited-24-readmes-then-deleted-the-process/fig-2.svg)
