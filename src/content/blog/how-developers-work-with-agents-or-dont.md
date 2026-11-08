---
title: "How Developers Work With Agents; or Don't"
description: "I read 411 first-hand accounts of how developers run coding agents and scored each one. Most of them drive agents from a bare terminal and still read most of the diff, and the ones who built their own tooling mostly stopped reading."
pubDate: 2026-11-08
tags: ["agents", "ade", "data"]
draft: true
---

Every few weeks someone on X asks "how do you work with coding agents?" and a few hundred people answer. I kept reading those threads, then Hacker News threads, then blog posts, and at some point I started writing it down. After 411 people the short version is this: most developers don't use an ADE at all.

An ADE (agent development environment) is to agents what an IDE is to code: the app you sit in while agents do the work. Think Conductor, T3 Code, Herdr, or [Glimmervoid](https://github.com/johncwaters/glimmervoid) (the one I build). 345 of the 411 people said what they drive agents from, and here's where they landed.

<figure class="not-prose my-8" data-chart="ade-share">
<svg role="img" aria-label="Bar chart of where 345 developers drive coding agents from: bare agent CLI 125, built their own 39, terminal multiplexer 30, vendor app or cloud 28, other orchestrator app 27, Herdr 25, T3 Code 14, Cursor 14, editor 14, chat bot 13, Conductor 9, Antigravity 4, cmux 2, Glimmervoid 1"></svg>
<p role="status" class="text-sm opacity-75">Loading the chart of where people drive agents from...</p>
<figcaption class="mt-3 text-sm opacity-75">Where people drive agents from, first tool named per person. Hover or tap a bar for who's in it.</figcaption>
</figure>

45% run agents from a bare CLI or tmux tabs. 23% use an orchestrator app, every product on that list added together. 11% got fed up and built their own, which is about half as many people as all the orchestrator apps combined. Count those two as ADE's and 34% have one. The other 66% drive agents from a terminal, an editor, a vendor's own app, or a chat bot. And Glimmervoid has exactly one user in the data (me, hi).

That lines up with how fast this moved. GitHub Copilot was autocomplete in 2021. Cursor put chat in the editor after that. Claude Code and Codex CLI showed up in 2025 and turned the agent into its own process in a terminal. The ADE is the next step on that list, and most people haven't taken it yet... the terminal tab still works fine for one or two agents.

## What your setup says about how you work

I scored every account 0 to 4 on nine axes (how many agents at once, how long they run alone, who coordinates them, how much code the developer still reads, and so on). Two of those axes explain most of the differences between people:

- **Delegation:** how many agents, how long they run unwatched, and whether agents dispatch other agents, averaged.
- **Reading:** how much of the code the developer still reads, from every line down to outcome only.

160 people said enough to place on both.

<figure class="not-prose my-8" data-chart="quadrant">
<svg role="img" aria-label="Scatter of 160 developers by delegation and how much code they read: 33% pair programmers, 17% overloaded reviewers, 20% light touch, 30% harness trusters"></svg>
<p role="status" class="text-sm opacity-75">Loading the delegation and reading chart...</p>
<figcaption class="mt-3 text-sm opacity-75">Each dot is one person; each cluster is people within half a point of each other, with its head count beside it. Hover or tap a dot for who it is and what they said.</figcaption>
</figure>

Only 17% delegate heavily (2 or more out of 4) and still read most diffs. That's the overloaded reviewer: the agents write faster than one carbon unit can read, and these folks are reading anyway. Everyone else picked a side. 33% keep agents on a short leash and read the diffs. 30% delegate heavily and trust the harness to catch problems.

Now color that by ADE.

<figure class="not-prose my-8" data-chart="ade-mix">
<svg role="img" aria-label="Stacked bars of each ADE's mix of the four groups; 11 of 13 people who built their own are harness trusters"></svg>
<p role="status" class="text-sm opacity-75">Loading the ADE by group chart...</p>
<figcaption class="mt-3 text-sm opacity-75">Each ADE's mix of the four groups, for ADE's with at least five people placed. Mixes under 10 people are hints, not findings.</figcaption>
</figure>

The people who built their own ADE are almost all harness trusters: 11 of 13. Only 2 of 13 self-builders read most diffs. Meanwhile 58% of bare CLI users, 67% of tmux users, and 4 of 6 Cursor users still read most of the code.

So the split isn't really about which app you picked. Pretty sure it runs the other way: once you stop reading every line, a terminal tab stops being enough, and you start building the thing that tells you which agent needs you. I can't prove the direction from public posts though.

## Machines read instead

If carbon units read less, something else has to. 73% of people put agent or bot review in front of themselves: a second model, a fresh-context reviewer, a PR bot, evals, or hooks that block a bad change.

<figure class="not-prose my-8" data-chart="machine-review">
<svg role="img" aria-label="Bar chart of the share of developers with agent or bot review or stronger, by agents running at once: 61% at 1, 66% at 2-3, 81% at 4-6, 76% at 7-15, 71% at 16 or more"></svg>
<p role="status" class="text-sm opacity-75">Loading the machine review chart...</p>
<figcaption class="mt-3 text-sm opacity-75">Share with agent or bot review, evals or blocking hooks (verification 3 or 4 on the rubric), by agents running at once. Faded bar: fewer than 10 people.</figcaption>
</figure>

It's already 61% at one agent and peaks at 81% for people running 4 to 6. Machine review isn't a fleet operator thing. It's table stakes.

## What still hurts

253 people named something that annoys them. The top of the list:

<figure class="not-prose my-8" data-chart="pains">
<svg role="img" aria-label="Bar chart of problems named by 253 developers; agent quality leads with 62, then relaying context 41, review volume 33, environment setup 33, attention and dispatch 32"></svg>
<p role="status" class="text-sm opacity-75">Loading the pains chart...</p>
<figcaption class="mt-3 text-sm opacity-75">People naming each problem, bucketed by keyword. One person can land in several.</figcaption>
</figure>

Agent quality is first (skipped tests, fake "done", drift), and no app fixes that. But look at the next ones: relaying context between agents, environment setup (worktrees, env files, ports), and figuring out which agent needs you. Those are the jobs an ADE is supposed to do. Most people are doing them by hand in a terminal, and they're telling you it hurts.

## Where I sit

I'm the one Glimmervoid dot. My row came from seven days of my own session recordings: one to five sessions open on this machine (two on average) and more on my other one, a worktree per session, and agent review lanes plus gates in front of every merge. I read none of the code. That makes me a harness truster, which is exactly what the self-builder bar says I'd be lol

So how do developers work with agents? Mostly from a terminal tab, one or two at a time, reading most of what comes back. Or they don't, and they build something so they can stop.

## How I did this

- **Sources:** 411 public, first-hand accounts from Hacker News (166), X (149), blogs (86), lobste.rs (5) and a few others, collected in November 2026. I left out vendor marketing and posts that only compare models.
- **Scoring:** a language model scored each account 0 to 4 per axis against a fixed rubric, and left an axis blank when the post didn't say. A handful of well-known people were scored by hand from their own posts, and my row came from my recordings.
- **Caveats:** people who post about their setup lean early adopter. Scores read what people said, not what they do. Small groups (anything under 10) are hints.

<details class="my-6">
<summary class="cursor-pointer">All 411 sources</summary>
<div data-sources class="mt-4"><p role="status" class="text-sm opacity-75">Loading the source list...</p></div>
</details>

Glimmervoid is open source: [github.com/johncwaters/glimmervoid](https://github.com/johncwaters/glimmervoid).

<script type="module" src="/blog/agent-workflows/charts.js"></script>
