---
title: "Four Runs, Same Wrong Number: What Context Actually Buys a Coding Agent"
description: "For my PostHog Context Engineer application, I ran a headless Claude Code agent through 96 trials on real tasks from my own shipping products, under four context regimes. The sharpest finding was four independent runs converging on the identical wrong answer."
pubDate: 2026-08-01
tags: ["evals", "agents", "posthog", "context-engineering"]
---

If you're reading this from PostHog: hi, you're the audience. I'm applying for the Context Engineer role, the job of making PostHog legible to AI agents, not just to humans reading docs.

> Rather than claim in a cover letter that I can do that, I measured how legible PostHog is to an agent today.

The setup: a headless Claude Code agent (`claude -p`, model `claude-sonnet-5`) ran six real tasks from my two shipping products, both of which run PostHog, under four context regimes. Four trials per cell, 96 trials total, every pass/fail decided by a script against a pinned reference. No LLM judge anywhere.

**TL;DR:**

- Live data access via MCP was the only regime that ever solved the analytics tasks: 7 of 8 trials on the two winnable ones. Every other regime went 0 for 24 on them.
- The sharpest finding is an MCP *failure*: all four trials on a funnel task computed the identical wrong number, by the identical shortcut. That reproduces reliably, which makes it a documentation gap, not a model quirk.
- A hand-built context bundle swept the Electron crash-capture task 4/4. No other regime managed more than 2.
- `llms.txt`, PostHog's own agent-facing doc index, bought zero passes over no context at all, at 2.9x the cost per run.
- n=4 per cell. That finds floors and directions, not statistical significance (see Limitations).

## The goal

Answer one question with data: which kind of context actually helps a coding agent get PostHog tasks right, and which kind just burns tokens? The credible way to test that is to stop asking "is the documentation good" and start asking "does an agent that only has this documentation get the task right," scored by a program, not a read-through.

So every task here is something I actually needed done on my own products: Card Harbor, an Electron/TypeScript desktop app, and Keeplings, a Flutter app with PostHog live in production.

## Method

**Tasks.** Six, in two families. The `ch-` coding tasks run against a pinned Card Harbor commit, authored before the real feature landed. The `kp-` analytics tasks run against Keeplings production data.

| Task | Family | What the agent must do |
|---|---|---|
| `ch-release-tagging` | Coding | Tag events with app version/build as super properties, sourced from the packaged app |
| `ch-main-process-capture` | Coding | Capture Electron main-process crashes; only the renderer has a PostHog client today |
| `ch-flag-gated-rollout` | Coding | Gate an unattended automation step behind a feature flag, defaulting safely to off |
| `kp-release-impact` | Analytics | Event volume and DAU, 7 days before vs. after a release |
| `kp-reminder-funnel` | Analytics | Per-user conversion from `reminder_created` to a subsequent `habit_confirmed` |
| `kp-store-engagement` | Analytics | Fraction of store visitors who also earned amber, and their median amber-earned count |

**Scoring.** All scripted, no LLM judge:

- `ch-` tasks: typecheck, a diff scan for the right PostHog calls in the right files, and a hallucinated-SDK scan against the installed `posthog-js`/`@posthog/react` versions.
- `kp-` tasks: the agent writes its answer and the HogQL it ran to `answer.json`; a checker compares both against a verified reference query within a stated tolerance.
- Harness-side faults: a reserved `check-infra` code, excluded from pass rates. The valid batches recorded zero.

**Regimes.** Four conditions, identical prompt otherwise:

| Regime | What the agent gets |
|---|---|
| `none` | Task prompt only. `WebSearch` and `WebFetch` both off. |
| `llms-txt` | A frozen snapshot of `posthog.com/llms.txt` (a ~330 KB link index of doc URLs; `llms-full.txt` 404s) injected into context, plus `WebFetch` scoped to `posthog.com`, since following the index's links is its designed use. |
| `mcp` | The live PostHog MCP server (`https://mcp.posthog.com/mcp`), bearer-authenticated with a read-only, project-pinned personal API key. No doc injection. |
| `bundle` | A hand-authored, task-scoped context bundle built only from public PostHog docs, content-hashed and frozen before its first scored run. |

`WebSearch`, `Task`, and `Agent` are disallowed in every regime, so every run stays single-agent and off the open web beyond the one scoped exception above.

One caveat: `ch-` runs use a real Card Harbor checkout, so the repo's own `CLAUDE.md`/`AGENTS.md` reach the agent even in `none`. That leakage is identical across regimes, so comparisons hold, but `none` is a repo-context baseline on those tasks, not a zero-context one.

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

*Editorial note (2026-08-03): the `ch-release-tagging` 16/16 and `kp-reminder-funnel` 0/16 rows both turned out to need a second look. The release-tagging checker had two real bugs, and the funnel task's "always wrong" streak broke once under a follow-up run. See the update below.*

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

*Editorial note (2026-08-03): a follow-up run confirmed this cap-starvation was the dominant failure mode on `ch-` tasks, not a minor artifact; once uncapped, the same tasks ran 22 to 122 turns instead of pinning at 50. See the update below.*

![Chart: average turns per task against the 50-turn cap](/blog/evals-average-turns-per-task.png)

![Chart: failure reason breakdown across the 63 failing trials](/blog/evals-failure-reasons.png)

## Findings

**1. Live data access is necessary, and almost always sufficient, for the winnable analytics tasks.** `kp-store-engagement` went 4/4 under `mcp`. `kp-release-impact` went 3/4, and the single miss failed to produce a valid answer file rather than reporting a wrong number. Every other regime went 0/4 on both.

The failure mode matters as much as the pass rate: all 24 non-`mcp` trials on these two tasks died at the answer-shape gate instead of producing a well-formed wrong number. Without a live connection, no amount of documentation lets an agent produce numbers like "809 events and 8.71 average DAU the week before release, 520 and 6.86 the week after."

**2. The sharpest finding is an MCP failure, not an MCP success.** On `kp-reminder-funnel`, all four `mcp` trials across both batches independently computed a conversion rate of 0.5. The true rate is 0.1667. All four used the identical wrong method: counting users who fired both `reminder_created` and `habit_confirmed` anywhere in the window, instead of users whose first `habit_confirmed` came at or after their first `reminder_created`, which the prompt explicitly asked for.

That is a per-user event-sequencing error, "did A and B" instead of "did A then B." I could not find a worked sequential-funnel HogQL example anywhere in PostHog's public docs. Four independent trials converging on the same shortcut is a concrete signal that the docs, or the MCP tool's own guidance, don't make the correct pattern obvious. It reproduces reliably, and it is exactly the kind of failure better agent-facing documentation fixes and a smarter model doesn't.

*Editorial note (2026-08-03): a follow-up run under a much higher turn cap broke the "always" in this finding, once. See the update below for what changed and why the finding still holds directionally.*

**3. A hand-built bundle swept the Electron crash-capture task; the flag-rollout task is just hard.** `bundle` went 4/4 on `ch-main-process-capture`, against 2/4 for `none`, 1/4 for `llms-txt`, and 0/4 for `mcp`. Public PostHog docs don't cover Electron main-process integration at all, so the bundle had to compose renderer-side error APIs with a preload/IPC bridge. That task-specific synthesis is what curated context engineering provides and a generic doc index can't.

`ch-flag-gated-rollout` tells a soberer story. At n=2 it looked bundle-favored; at n=4 it sits at 0/4 or 1/4 for every regime, which reads as occasional passes on a uniformly hard task, not a regime effect. Doubling n dissolved an apparent finding, which is itself the argument for raising n before claiming anything mid-range.

**4. Post-isolation, agents without data access decline honestly instead of guessing.** In the excluded batches, one `bundle` trial confidently fabricated plausible-looking analytics numbers, and another passed by quietly querying production data through inherited credentials. After credential isolation, every `bundle` trial on every `kp-` task either failed to produce a valid answer file or was flagged wrong by the reference check.

Both earlier failure modes point the same direction: context that describes data without connecting to it is not neutral, it is a fabrication risk, and a live reference check is the only guard here that catches it.

**5. `llms.txt` bought no passes and cost the most.** `llms-txt` and `none` both passed 6/24, but `llms-txt` cost $3.43 per run against `none`'s $1.20, and its $13.71 cost per success was the worst of any regime. The snapshot is a ~330 KB flat link index, so an agent has to burn turns crawling it via `WebFetch` before it can act, and that overhead never translated into task-relevant depth.

This reads as a design problem with the artifact: a link index optimized for a human skimming titles fits an agent worse than either no context or a small task-scoped bundle.

## Learnings

What this study taught me that transfers past these six tasks:

- **Connection beats description.** Wherever data was the deliverable, live access was the only thing that worked, and context that described the data without connecting to it was worse than neutral: it enabled confident fabrication.
- **Fit beats volume.** A small hand-scoped bundle beat a 330 KB doc index on passes and cost alike. The lever is what an agent can use this turn, not how much it could theoretically reach.
- **Reproducible failures are the highest-value output.** Four trials converging on the same wrong number is a documentation bug with a locatable fix; a flaky miss teaches nothing. Design evals so failures localize.
- **Distrust mid-range effects at small n.** Doubling n from 2 to 4 dissolved one apparent regime effect entirely. Floors and directional sweeps are cheap to establish; middles are not.
- **Harness bugs bias optimistic.** Both excluded batches failed toward inflated scores, one via inherited credentials, one via fabricated numbers. Credential isolation and a live reference check are part of the eval design, not overhead.

## Methods hardening

The parts that took the most iteration:

| Problem | Fix |
|---|---|
| Multi-turn runs re-read cached context every turn, so gross token counts inflate 20-50x over real spend (measured: 30.5x overall) | Budget guard caps *noncached* tokens per run (input + cache-creation + output), so the cap tracks real spend instead of turn count |
| Headless `claude -p` would silently skip connecting to the PostHog MCP server | Server entry must declare `"type": "http"` and must not be named `posthog` (Claude Code caches a needs-auth verdict per server name, so colliding with a developer's own OAuth-based server skips auth); every run passes `--strict-mcp-config` so no ambient user-scoped MCP server leaks in |
| A `none`/`llms-txt`/`bundle` run must never query live PostHog with harness credentials | All harness PostHog environment variables are stripped from the agent subprocess in every regime; the `mcp` token travels through a generated config file outside the workspace, deleted at teardown, never as an env var |
| The `mcp` regime must not touch production data destructively or leak into the wrong project | Read-only API key; every task pins the MCP session to one project via header (`kp-` to Keeplings production, `ch-` to a scratch project); a missing token or project id fails the cell as `check-infra` rather than running unpinned |

## Update: un-starving the agent (2026-08-03)

The work above stopped at a sonnet-only, 50-turn-cap grid. I kept going in the same harness after publication: added a second model, audited the checks that scored these runs, removed the turn cap that was quietly capping most of the coding tasks, and hardened the runner against a rate-limit bug that briefly poisoned the follow-up data. This section reports what changed, with every new number traced back to the harness's own append-only run journals: `evals/results/journal.jsonl` (the original cap-50 grid, and the source of the buggy-checker opus 6/16 below), `evals/results/checkfix-opus/journal.jsonl` (the fixed-checker rerun, source of the opus 5/8), and `evals/results/cap1000-sonnet/journal.jsonl` and `evals/results/cap1000-opus/journal.jsonl` (the definitive 1000-turn-cap grid), all in the [repo](https://github.com/johncwaters/claude-setup).

### The checks had bugs

Before touching the turn cap, I audited the scoring code, because 45 of 48 `ch-` runs hitting the cap (noted above) meant most coding-task failures could be starvation artifacts rather than real misses, and I wanted the scoring itself to be trustworthy before spending more compute on longer runs. `ch-release-tagging`'s checker turned out to have bugs in both directions: a false-negative class that wrongly failed correct implementations, and a false-positive class that wrongly credited incorrect ones.

The false-negative bugs were fixed in `7d60acc`. An opus replay audit found the checker required the `register` call and the release-property keys to appear in the same file's added lines, which failed correct implementations that extracted super-properties into their own module, and its hardcoded-semver scan misread test fixtures like `toHaveBeenCalledWith({ app_version: '0.9.7' })` as production hardcoding. That commit's own message states the motivating numbers directly: sonnet had passed the task 16/16 writing everything inline in one file, opus had scored 6/16 writing extracted modules plus tests, and every opus failure the audit checked turned out to be a check artifact, not a real miss. `7d60acc` also resolved the register-indirection hop and added a `turn-capped` reason code, so turn-budget artifacts stop contaminating failure-reason breakdowns from here on.

The false-positive bug surfaced next, as a side effect of the fix above: once the symbol search could follow the register call to any changed file, release-tagging keys anywhere else in that file, including an unrelated call, could wrongly credit a symbol that didn't actually define them. `349d235` scoped the search to the declaration's own body, and three follow-up commits closed correctness gaps that scoping fix introduced or missed: `7b5b292` fixed a false negative on destructured-parameter arrow functions, `b02bb7c` bounded the assignment search to the declaration's own statement, and `d3b50ce` made bare declarations return `None` and covered async destructured arrows.

With all of that fixed, I reran `ch-release-tagging` for opus at the same `max_turns: 50` cap (`config-checkfix.yml`) and it went from the buggy 6/16 to 5/8, three of those eight hitting the cap directly (`reason_code: turn-capped`). This rerun was still capped, not uncapped: the runner's own turn counter (`num_turns`, as reported by `claude -p`) can land a turn or two past the enforced `--max-turns` boundary, which is why trials in this rerun show 49 to 67 turns against a nominal 50-turn limit, and the three capped ones landed at 51, 51, and 64 rather than exactly on it. I haven't dug into why the CLI's own counter and its own enforcement disagree by that much.

I don't have a clean rescoring of the original 16 sonnet trials against the final checker, and since the false-negative bugs mostly affected opus's extracted-module style rather than sonnet's inline, single-file style, I can't say precisely whether the published 16/16 would hold exactly. I'm flagging that rather than restating a corrected number: treat the original `ch-release-tagging` row as measured by a checker later shown to have bugs in both directions, now fixed.

### Raising the turn cap

With the checks fixed, I raised `max_turns` from 50 to 1000, with an explicit 5400-second wall-clock timeout as the actual backstop (commit `081ba11`). That commit's own message cites the evidence for doing it: a 2026-08-02 cap-100 sweep (`evals/results/capsweep-sonnet/`, `evals/results/capsweep-opus/`) found 39 of 40 addressable `ch-` failures at the 50-turn cap were turn starvation, not model failure, and the check-fix rerun's only failures were turn-capped. With that in hand, I reran a definitive grid: both models, all six tasks, all four regimes, n=2 per cell (down from n=4, to keep the added model and the rerun affordable). Turn count, not the raw cap, drives cost on these tasks, so this only makes sense once the cap itself is no longer the thing being measured.

### Harness hardening: a rate-limit bug that looked like real failures

Partway through the cap-1000 grid, the account hit its weekly Claude usage limit. That produced `claude -p` invocations that returned instantly with zero gross tokens, meaning the process never reached the model at all. The runner didn't know that: it scored the untouched, unmodified workspace against each task's checks exactly as if the agent had tried and failed, which meant a rate-limit rejection was indistinguishable from a genuine wrong answer or a build failure. The runner's own fix commit (`42e3fba`) puts a number on it: this poisoned 55 rows of the cap-1000 grid before it was caught.

The fix detects `usage["gross"] == 0` before scoring and journals the cell as a new `error` status with `reason_code: rate-limited`, excluded from both the scored and infra summary buckets, and always rerun on resume, the same treatment as a harness-side infra fault (commits `42e3fba`, `b2a5a84`). The 55 originally poisoned rows aren't visible in the live journals: they were scored under the pre-fix code path with a plausible-looking `wrong-answer` or `build-fail` verdict, indistinguishable from a real failure until you know to distrust them. They're preserved as-is in `journal.jsonl.bak` in each cap-1000 results directory, and every affected cell was rerun after the fix landed, so the live `journal.jsonl` files hold only the corrected results. Separately, the fix's own detection kept catching genuine rate-limit rejections as the grid continued running: the final journals carry 33 such rows (13 sonnet, 20 opus) correctly tagged `status: error`, `reason_code: rate-limited`, excluded from scoring, with each cell's real result appended later in the same journal once it reran clean. It's a good example of how an eval harness needs the same defensive posture as production code: an infrastructure failure and a real failure produce different-looking evidence (zero tokens versus a scored-but-wrong workspace) and conflating them silently biases every number downstream.

### The definitive grid: 1000-turn cap, n=2, fixed checks

| Model | Passes | Pass rate |
|---|---|---|
| sonnet | 22/48 | 46% |
| opus | 23/48 | 48% |

By regime (of 12 per model):

| Regime | Sonnet | Opus |
|---|---|---|
| mcp | 8 | 7 |
| llms-txt | 5 | 5 |
| none | 5 | 5 |
| bundle | 4 | 6 |

By task (of 8 per model; each cell is two trials per regime, in regime order none, llms-txt, mcp, bundle, `P`/`f` per trial, n=2):

| Task | Sonnet | Opus |
|---|---|---|
| ch-main-process-capture | PP PP PP PP (8/8) | PP PP PP PP (8/8) |
| ch-release-tagging | PP PP Pf fP (6/8) | PP PP ff PP (6/8) |
| ch-flag-gated-rollout | Pf Pf ff Pf (3/8) | fP Pf Pf PP (5/8) |
| kp-release-impact | ff ff PP ff (2/8) | ff ff PP ff (2/8) |
| kp-store-engagement | ff ff PP ff (2/8) | ff ff PP ff (2/8) |
| kp-reminder-funnel | ff ff Pf ff (1/8) | ff ff ff ff (0/8) |

Zero rows hit the turn cap this time (`ch-` runs ranged 22 to 122 turns, averaging 74.6 for sonnet and 79.9 for opus, 77.3 combined), against 45 of 48 hitting the cap in the original grid. That's the headline result of un-starving the agent: `ch-main-process-capture` saturates to 8/8 for both models once given room to work (it was the most regime-sensitive task at the 50-turn cap, where `bundle` swept it 4/4 and everything else struggled), and `ch-flag-gated-rollout` finally separates the models (3/8 sonnet vs. 5/8 opus) instead of reading as uniformly hard. `ch-release-tagging` is not directly comparable to its cap-50 numbers, since the checker changed underneath it, as noted above.

n=2 per cell is enough to confirm floors and saturations (`kp-reminder-funnel` going exactly 0/2 in `none`, `llms-txt`, and `bundle` for both models, the only pass anywhere being one sonnet `mcp` trial; `ch-main-process-capture` hitting the ceiling) but not to read anything into the mid-range regime gaps in the table above, the same caveat the original post makes about n=4. The `mcp` regime still leads on total passes for both models, which is the one result that survived every round of hardening: every `kp-` pass in this grid, all nine of them across all three analytics tasks and both models, came under `mcp`.

### The reminder-funnel finding, revisited

The original finding was that all four `mcp` trials on `kp-reminder-funnel` independently computed the same wrong conversion rate, 0.5 against a true 0.1667, by the same shortcut. Under the cap-1000 grid, that streak breaks, but not in the way I expected.

Sonnet's first `mcp` trial passed: 17 turns, `answer.json` matched the reference query within tolerance, and the agent's own HogQL corroborated it. Its second trial reproduced the exact original failure, the identical 0.5 against 0.1667, by the same "did A and B" shortcut. Opus's two `mcp` trials failed differently again: the checker's read-only guard, a post-hoc, case-insensitive regex over the reported HogQL string looking for `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, or `TRUNCATE` (`tasks/kp-reminder-funnel/checks.py`), rejected both before they ever reached a comparable number. The MCP key itself is read-only and project-pinned, so nothing could actually have written to Keeplings production regardless of what either agent submitted. No transcript survives for either trial, so I have not confirmed whether the flagged keyword was a genuine write statement in the agent's HogQL or a false positive of the same unscoped-scan class I had just finished fixing elsewhere in this checker.

So the honest read is not "still four for four wrong the same way." It's narrower and, I think, more useful: the docs gap that produces the 0.5 shortcut is real and reproduces most of the time, sonnet hit it again on a fresh long run, but it isn't unconditional, one trial got the sequencing right unprompted. That a worked example could plausibly close the gap is a *stronger* claim with one clean pass in hand than it was with zero, because it shows the correct pattern is reachable from the same context, not structurally unreachable.

### What this does and doesn't change

The cap-50, sonnet-only story above is the original measurement and I've left it intact rather than rewriting it in place; the editorial notes above mark where a number needs this section's context. The directional findings hold up under the harder test: live data access via MCP is still the only regime that ever solves the winnable analytics tasks, at both turn caps and both models; a hand-scoped bundle ties the generic doc index on combined passes in the new grid, 10 to 10, splitting one model each way; `llms.txt` still doesn't distinguish itself from no context at all. What changed is confidence in the coding-task numbers specifically, since most of those runs were never given enough turns to finish the job, and confidence in exactly how absolute the reminder-funnel failure is.

The charts embedded above are captures of the original cap-50 dashboard batches; I haven't rebuilt them to include the cap-1000 events, since mixing two different turn-cap regimes and two check-code versions into one chart would misrepresent both.

## Limitations

- **n=4 per cell.** Powers floor-finding and directional sweeps, not mid-range comparisons; finding 3 shows an apparent n=2 effect dissolving at n=4.
- **Single model.** Every trial ran `claude-sonnet-5`; nothing here claims the regime effects generalize across models. *(Editorial note, 2026-08-03: a follow-up grid added `claude-opus-5`; see the update above. Same model family, so this still doesn't test generalization across providers, but the two-model grid is the more current comparison.)*
- **Six tasks.** Real work from two apps, not a stratified sample of PostHog use cases.
- **Static acceptance on `ch-` tasks.** Live event-arrival validation happens manually once each feature actually lands; it could never pass during a trial, since no task asks the agent to run the app.
- **Cost is API-equivalent, not actual spend.** The runs used a Claude subscription; per-token pricing is applied for comparability across regimes.

## Next steps

Concrete actions this data supports.

**For PostHog's docs:**

1. **Ship a worked "did A then B" sequential-funnel HogQL recipe**, ideally reachable from the MCP server's own tool descriptions. Finding 2 is the case: all four failing funnel trials took the same "did A and B" shortcut, and a canonical example would likely have prevented every one.
2. **Write Electron main-process integration guidance.** The JS SDK docs are renderer-first; nothing public covers bridging flag evaluation or error capture across a preload/IPC boundary into a Node-side main process, and any Electron app using PostHog hits that assumption.
3. **Restructure `llms.txt`** with lightweight per-page summaries or task-class-scoped sub-indexes, so an agent can judge relevance before spending a `WebFetch` turn per candidate page. That per-page crawl is the bottleneck the cost data points at.

**For this eval:**

1. **Raise n to 8+ on the mid-range cells** (`ch-main-process-capture`, `ch-flag-gated-rollout`) before claiming regime effects there; n=4 already dissolved one apparent effect.
2. **Add a second model family** to separate regime effects from model quirks.
3. **Re-run `kp-reminder-funnel` after any doc fix** to confirm the 0.5 failure actually disappears. A reproducible failure is only valuable if you close the loop.
4. **Validate `ch-` passes against live event arrival** once the real features ship, replacing static acceptance.

## Results dashboard

Every trial fires an `eval_run_completed` event into a PostHog project as it is scored, so the results of this study live in PostHog itself: each chart above is a capture of a dashboard tile, each tile a HogQL insight over the captured events. The dashboard is [publicly shared](https://us.posthog.com/shared/7uIxmXQ4aocE_xJ7VFTDXssY8ixh1w) if you want the live version.

## Reproduction

The full harness, task definitions, prompts, references, and raw data live in the public repo at [github.com/johncwaters/claude-setup](https://github.com/johncwaters/claude-setup): the harness README under `evals/`, one append-only journal row per trial in `evals/results/journal.jsonl`, per-cell roll-ups in `evals/results/summary.json`, and task definitions in `evals/tasks/`. `evals/results/journal.jsonl` now holds 192 rows, not 96: the 96 published sonnet trials this post reports, plus a 96-row cap-50 opus arm added afterward (see the update below). The `evals/results/cap1000-*/`, `evals/results/checkfix-opus/`, and `evals/results/capsweep-*/` directories hold the follow-up runs the update section cites.

The hedgehog wandering around this page is PostHog's own [hedgehog-mode](https://github.com/PostHog/hedgehog-mode) engine. It felt wrong to write this much about PostHog without inviting one.
