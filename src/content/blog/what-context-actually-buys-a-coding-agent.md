---
title: "Four Runs, Same Wrong Number: What Context Actually Buys a Coding Agent"
description: "For my PostHog Context Engineer application, I ran a headless Claude Code agent through 96 trials on real tasks from my own shipping products, under four context regimes. The sharpest finding was four independent runs converging on the identical wrong answer."
pubDate: 2026-08-01
tags: ["evals", "agents", "posthog", "context-engineering"]
---

I'm applying for PostHog's Context Engineer role. The job, in one sentence: make PostHog legible to AI agents, not just to humans reading docs. Rather than claim in a cover letter that I can do that, I measured how legible it is today. This study is my application.

The setup: a headless Claude Code agent (`claude -p`, model `claude-sonnet-5`) ran six real tasks from my two shipping products, both of which run PostHog, under four context regimes. Four trials per cell, 96 trials total, every pass/fail decided by a script against a pinned reference. No LLM judge anywhere.

**TL;DR:**

- Live data access via MCP was the only regime that ever solved the analytics tasks: 7 of 8 trials on the two winnable ones. Every other regime went 0 for 24 on them.
- The sharpest finding is an MCP *failure*: all four trials on a funnel task computed the identical wrong number, by the identical shortcut. That reproduces reliably, which makes it a documentation gap, not a model quirk.
- A hand-built context bundle swept the Electron crash-capture task 4/4. No other regime managed more than 2.
- `llms.txt`, PostHog's own agent-facing doc index, bought zero passes over no context at all, at 2.9x the cost per run.
- n=4 per cell. That finds floors and directions, not statistical significance (see Limitations).

## Why this eval

The credible way to test agent legibility is to stop asking "is the documentation good" and start asking "does an agent that only has this documentation get the task right," scored by a program, not a read-through.

So every task here is something I actually needed done on my own products: Card Harbor, an Electron/TypeScript desktop app, and Keeplings, a Flutter app with PostHog live in production.

## Method

**Tasks.** Six, in two families:

- Three coding tasks (`ch-`) against a pinned Card Harbor commit, authored before the real feature landed: `ch-release-tagging` (tag events with app version/build as super properties, sourced from the packaged app), `ch-main-process-capture` (capture Electron main-process crashes, since only the renderer has a PostHog client today), and `ch-flag-gated-rollout` (gate an unattended automation step behind a feature flag, defaulting safely to off).
- Three analytics tasks (`kp-`) against Keeplings production data: `kp-release-impact` (event volume and DAU, 7 days before vs. after a release), `kp-reminder-funnel` (per-user conversion from `reminder_created` to a subsequent `habit_confirmed`), and `kp-store-engagement` (fraction of store visitors who also earned amber, and their median amber-earned count).

**Scoring.** `ch-` tasks are graded by typecheck, a diff scan for the right PostHog calls in the right files, and a hallucinated-SDK scan against the installed `posthog-js`/`@posthog/react` versions. `kp-` tasks write their answer and the HogQL they ran to `answer.json`, which a checker compares against a verified reference query within a stated tolerance. Harness-side faults get a reserved `check-infra` code and are excluded from pass rates; the valid batches recorded zero.

**Regimes.** Four conditions, identical prompt otherwise:

| Regime | What the agent gets |
|---|---|
| `none` | Task prompt only. `WebSearch` and `WebFetch` both off. |
| `llms-txt` | A frozen snapshot of `posthog.com/llms.txt` (a ~330 KB link index of doc URLs; `llms-full.txt` 404s) injected into context, plus `WebFetch` scoped to `posthog.com`, since following the index's links is its designed use. |
| `mcp` | The live PostHog MCP server (`https://mcp.posthog.com/mcp`), bearer-authenticated with a read-only, project-pinned personal API key. No doc injection. |
| `bundle` | A hand-authored, task-scoped context bundle built only from public PostHog docs, content-hashed and frozen before its first scored run. |

`WebSearch`, `Task`, and `Agent` are disallowed in every regime, so every run stays single-agent and off the open web beyond the one scoped exception above. One caveat: `ch-` runs use a real Card Harbor checkout, so the repo's own `CLAUDE.md`/`AGENTS.md` reach the agent even in `none`. That leakage is identical across regimes, so comparisons hold, but `none` is a repo-context baseline on those tasks, not a zero-context one.

**n.** Four trials per (task, regime) cell is enough to find floors (a regime that never solves a task class) and to sweep all four regimes directionally. It is not enough to call a mid-range difference significant: distinguishing a 90% pass rate from 80% at conventional power needs roughly 100 trials per cell.

## Results

Both valid batches ran clean: 96/96 trials scored, none excluded, 16 passes in the first batch and 17 in the second. Total wall time was 382 minutes; total token cost was $171.72 at API-equivalent pricing (the runs actually rode a Claude subscription, so this is a comparability number, not money spent).

Two earlier batches are excluded: one ran before the regimes were fully wired, and one had two harness gaps (headless MCP silently not connecting, and the agent subprocess inheriting live credentials). Both gaps were fixed before the first valid batch; see "Methods hardening."

![Chart: passes by regime in each independent batch](/blog/evals-passes-by-regime-per-batch.png)

**Pass/fail grid** (P = pass, f = fail, four trials per cell, in trial order):

| Task | none | llms-txt | mcp | bundle |
|---|---|---|---|---|
| ch-release-tagging | PPPP | PPPP | PPPP | PPPP |
| ch-main-process-capture | fPfP | ffPf | ffff | PPPP |
| ch-flag-gated-rollout | ffff | ffPf | fffP | fPff |
| kp-release-impact | ffff | ffff | PPPf | ffff |
| kp-reminder-funnel | ffff | ffff | ffff | ffff |
| kp-store-engagement | ffff | ffff | PPPP | ffff |
| **Passes / 24** | **6** | **6** | **12** | **9** |

![Chart: pass rate heatmap, task by regime](/blog/evals-pass-rate-heatmap.png)

![Chart: pass rate by regime](/blog/evals-pass-rate-by-regime.png)

![Chart: pass rate by task](/blog/evals-pass-rate-by-task.png)

**Cost per success by regime:**

| Regime | Passes | Total cost | Mean cost/run | Cost per success |
|---|---|---|---|---|
| none | 6/24 | $28.73 | $1.20 | $4.79 |
| llms-txt | 6/24 | $82.27 | $3.43 | $13.71 |
| mcp | 12/24 | $31.20 | $1.30 | $2.60 |
| bundle | 9/24 | $29.52 | $1.23 | $3.28 |

![Chart: cost per success by regime](/blog/evals-cost-per-success-by-regime.png)

The coding tasks are the expensive half of the suite regardless of regime. `ch-` runs averaged 50.75 turns (45 of 48 hit the 50-turn cap) and accounted for $132.88 of the cost and 323 of the wall-minutes. `kp-` runs averaged 12.5 turns and finished in 59 minutes total.

![Chart: average turns per task against the 50-turn cap](/blog/evals-average-turns-per-task.png)

![Chart: failure reason breakdown across the 63 failing trials](/blog/evals-failure-reasons.png)

## Findings

**1. Live data access is necessary, and almost always sufficient, for the winnable analytics tasks.** `kp-store-engagement` went 4/4 under `mcp`. `kp-release-impact` went 3/4, and the single miss failed to produce a valid answer file rather than reporting a wrong number. Every other regime went 0/4 on both.

The failure mode matters as much as the pass rate: all 24 non-`mcp` trials on these two tasks died at the answer-shape gate instead of producing a well-formed wrong number. Without a live connection, no amount of documentation lets an agent produce numbers like "809 events and 8.71 average DAU the week before release, 520 and 6.86 the week after."

**2. The sharpest finding is an MCP failure, not an MCP success.** On `kp-reminder-funnel`, all four `mcp` trials across both batches independently computed a conversion rate of 0.5. The true rate is 0.1667. All four used the identical wrong method: counting users who fired both `reminder_created` and `habit_confirmed` anywhere in the window, instead of users whose first `habit_confirmed` came at or after their first `reminder_created`, which the prompt explicitly asked for.

That is a per-user event-sequencing error, "did A and B" instead of "did A then B." I could not find a worked sequential-funnel HogQL example anywhere in PostHog's public docs. Four independent trials converging on the same shortcut is a concrete signal that the docs, or the MCP tool's own guidance, don't make the correct pattern obvious. It reproduces reliably, and it is exactly the kind of failure better agent-facing documentation fixes and a smarter model doesn't.

**3. A hand-built bundle swept the Electron crash-capture task; the flag-rollout task is just hard.** `bundle` went 4/4 on `ch-main-process-capture`, against 2/4 for `none`, 1/4 for `llms-txt`, and 0/4 for `mcp`. Public PostHog docs don't cover Electron main-process integration at all, so the bundle had to compose renderer-side error APIs with a preload/IPC bridge. That task-specific synthesis is what curated context engineering provides and a generic doc index can't.

`ch-flag-gated-rollout` tells a soberer story. At n=2 it looked bundle-favored; at n=4 it sits at 0/4 or 1/4 for every regime, which reads as occasional passes on a uniformly hard task, not a regime effect. Doubling n dissolved an apparent finding, which is itself the argument for raising n before claiming anything mid-range.

**4. Post-isolation, agents without data access decline honestly instead of guessing.** In the excluded batches, one `bundle` trial confidently fabricated plausible-looking analytics numbers, and another passed by quietly querying production data through inherited credentials. After credential isolation, every `bundle` trial on every `kp-` task either failed to produce a valid answer file or was flagged wrong by the reference check.

Both earlier failure modes point the same direction: context that describes data without connecting to it is not neutral, it is a fabrication risk, and a live reference check is the only guard here that catches it.

**5. `llms.txt` bought no passes and cost the most.** `llms-txt` and `none` both passed 6/24, but `llms-txt` cost $3.43 per run against `none`'s $1.20, and its $13.71 cost per success was the worst of any regime. The snapshot is a ~330 KB flat link index, so an agent has to burn turns crawling it via `WebFetch` before it can act, and that overhead never translated into task-relevant depth. This reads as a design problem with the artifact: a link index optimized for a human skimming titles fits an agent worse than either no context or a small task-scoped bundle.

## Methods hardening

The parts that took the most iteration:

| Problem | Fix |
|---|---|
| Multi-turn runs re-read cached context every turn, so gross token counts inflate 20-50x over real spend (measured: 30.5x overall) | Budget guard caps *noncached* tokens per run (input + cache-creation + output), so the cap tracks real spend instead of turn count |
| Headless `claude -p` would silently skip connecting to the PostHog MCP server | Server entry must declare `"type": "http"` and must not be named `posthog` (Claude Code caches a needs-auth verdict per server name, so colliding with a developer's own OAuth-based server skips auth); every run passes `--strict-mcp-config` so no ambient user-scoped MCP server leaks in |
| A `none`/`llms-txt`/`bundle` run must never query live PostHog with harness credentials | All harness PostHog environment variables are stripped from the agent subprocess in every regime; the `mcp` token travels through a generated config file outside the workspace, deleted at teardown, never as an env var |
| The `mcp` regime must not touch production data destructively or leak into the wrong project | Read-only API key; every task pins the MCP session to one project via header (`kp-` to Keeplings production, `ch-` to a scratch project); a missing token or project id fails the cell as `check-infra` rather than running unpinned |

## Doc-gap recommendations for PostHog

1. **A worked "did A then B" sequential-funnel HogQL recipe.** Finding 2 is the case: counting users who did two events in a window is a different query than counting users who did them in order, and the difference is easy to get wrong even with live schema access. A canonical example, ideally reachable from the MCP server's own tool descriptions, would likely have prevented all four failing trials.
2. **Electron / desktop main-process integration guidance.** PostHog's JS SDK docs are written renderer/browser-first. Nothing public covers bridging flag evaluation or error capture across a preload/IPC boundary into a Node-side main process, and any Electron app using PostHog hits that assumption.
3. **What `llms.txt` should become.** A version with lightweight per-page summaries, or task-class-scoped sub-indexes, would let an agent judge relevance before spending a `WebFetch` turn per candidate page. That per-page crawl is the bottleneck the cost data points at.

## Limitations

- **n=4 per cell.** Powers floor-finding and directional sweeps, not mid-range comparisons; finding 3 shows an apparent n=2 effect dissolving at n=4.
- **Single model.** Every trial ran `claude-sonnet-5`; nothing here claims the regime effects generalize across models.
- **Six tasks.** Real work from two apps, not a stratified sample of PostHog use cases.
- **Static acceptance on `ch-` tasks.** Live event-arrival validation happens manually once each feature actually lands; it could never pass during a trial, since no task asks the agent to run the app.
- **Cost is API-equivalent, not actual spend.** The runs used a Claude subscription; per-token pricing is applied for comparability across regimes.

## Results dashboard

Every trial fires an `eval_run_completed` event into a PostHog project as it is scored, so the results of this study live in PostHog itself: each chart above is a capture of a dashboard tile, each tile a HogQL insight over the captured events. The dashboard is [publicly shared](https://us.posthog.com/shared/7uIxmXQ4aocE_xJ7VFTDXssY8ixh1w) if you want the live version.

## Reproduction

The full harness, task definitions, prompts, references, and raw data live in the public repo at [github.com/johncwaters/claude-setup](https://github.com/johncwaters/claude-setup): the harness README under `evals/`, one append-only journal row per trial in `evals/results/journal.jsonl`, per-cell roll-ups in `evals/results/summary.json`, and task definitions in `evals/tasks/`.
