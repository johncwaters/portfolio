---
title: "My Terminal Congratulated Me for Clearing the Screen"
description: "Glissa told me a session finished when all I did was clear the scrollback. Three war stories from making Claude Code's own signals tell the truth about what six parallel sessions are actually doing."
pubDate: 2026-07-31
tags: ["glissa", "claude-code", "agents", "debugging"]
---

I was running six Claude Code sessions in Glissa, the dashboard I built to manage them, and one card popped a native notification: "Session complete." I hadn't touched that session in ten minutes. I switched to it. The agent was mid-task, half a diff on screen, nothing finished. All I'd done, a few seconds earlier, was type `/clear` to wipe the scrollback so I could read a stack trace without scrolling.

Glissa had watched the terminal redraw after `/clear`, seen a spinner flash and then settle to an idle glyph, and concluded the agent had finished a unit of work. It hadn't started one. That bug, and two others like it, are the reason Glissa's status detection looks the way it does today: hooks first, a terminal-title fallback second, and a lot of code that exists purely to stop a signal from lying to you with total confidence.

![The Glissa dashboard: a grid of session cards, each reporting the live status of a parallel Claude Code session](/blog/glissa-demo.gif)

## The obvious approach is a trap

The first version of this detection scraped the rendered terminal: watched the raw PTY byte stream for prompt strings, reconstructed screen lines from cursor moves and carriage-return overwrites, and matched a growing blacklist of chrome text against whatever Claude Code (or an orchestration layer on top of it) happened to print that week. It worked until the next release changed a spinner glyph or added a line of padding, at which point it silently stopped working, and I found out from a session that had finished an hour ago with no notification at all.

Screen content is written for a human's eyes, not a parser's. Every redraw, every theme change, every point release invalidates whatever pattern you matched against it. And there wasn't one detector doing the guessing, there were three, layered: a prompt-pattern matcher, a terminal-title watcher, and an idle timer flagging "pending content" as a last resort. Reasoning about which one fired, and why, meant reading a stack of race-condition band-aids accreted over months. None of it was measurable. Tuning was by anecdote: something looked wrong, I nudged a timeout, I moved on.

The fix wasn't a better scraper. It was giving up on the rendered screen entirely and asking Claude Code what it was actually doing.

## Structural signals: hooks first, title as a fallback

At spawn, Glissa writes a per-session settings file that injects Claude Code hooks (`Stop`, `Notification`, `UserPromptSubmit`, `SessionStart`/`SessionEnd`, `SubagentStart`/`SubagentStop`) as HTTP callbacks to a local endpoint on Glissa's own server, gated by a per-session bearer token. No changes to the target repo, nothing the agent has to cooperate with beyond running normally. These hooks are the authoritative signal: Claude Code emits them on purpose, at real lifecycle boundaries, carrying structured payloads instead of pixels.

The old OSC-0 terminal-title trick didn't get deleted, it got demoted. A braille spinner in the title means working, an idle glyph means ready, and anything else is reported honestly as unknown rather than guessed. It never claims "awaiting input," because a title glyph alone can't tell the difference between idle-and-done and idle-and-waiting-on-you. It exists to cover the gap for anything that predates or bypasses the hooks, and it loses to a hook whenever both are available.

The two sources feed a merge step with explicit precedence (hook beats title) and a short conflict window: if a `ready` signal shows up, Glissa holds it briefly in case a racing `awaiting-input` or a fresh `working` signal is about to arrive and should win instead. That window is what saved me from the next class of bug, and also what let one slip through.

![Diagram: hooks and the terminal-title fallback feed a merge step with explicit precedence, which drives the session card status](/blog/status-detection-pipeline.svg)

## War story one: the quiet redraw

`/clear` and `/compact` don't fire `UserPromptSubmit` or `Stop`. From the hooks' point of view, nothing happened. But the terminal itself redraws, and that redraw briefly puts a spinner in the title before settling to idle. To the title-fallback detector, a spinner-then-idle transition is indistinguishable from a real turn finishing. So every `/clear` looked exactly like completed work, and Glissa said so, out loud, with a notification.

The fix is a quiet latch. On a detected `SessionStart` with source `clear` or `compact`, Glissa resets both signal sources, which also cancels any `ready` currently being held in the conflict window, and mutes the title source until the next genuine `UserPromptSubmit` arrives. The title fallback still exists for everything else; it just isn't allowed to speak during a redraw it didn't cause.

## War story two: the agent that finished while it was still working

`Task` with `run_in_background`, or Ctrl+B, lets an agent kick off a sub-agent and keep going. The main agent's own turn can end, firing `Stop`, while that sub-agent is still running. Treat `Stop` as completion and you close the card while real work is happening underneath it, unseen.

Glissa counts live sub-agents from `SubagentStart` and `SubagentStop` (a simple `agent_id` set) and suppresses the `ready` to `task_complete` transition while that set is non-empty. Usually the main agent auto-resumes when the sub-agent finishes, its later `Stop` drains the count back to zero, and the card completes normally a moment late. The interesting failures are the times no later `Stop` ever arrives: an idle teammate, a dropped `SubagentStop`. For those, the suppressed `ready` gets held rather than discarded, and released later once the count actually drains, whether that's a real `SubagentStop`, a payload that explicitly declares zero running tasks, or a TTL prune.

Counting `SubagentStart`/`Stop` pairs wasn't the whole picture. `Stop` and `SubagentStop` payloads also carry a `background_tasks` field (running or pending entries, each with an id and a type) that sees work the counted pairs can't: background shell commands, native-team teammates. Glissa takes the max of the counted set and the declared active entries, and that surfaced a strange fact: an idle-but-alive teammate stays declared `status: running` in Claude's own task registry until it's explicitly shut down, so every subsequent `Stop` re-declares it as in-flight forever.

The drain hook for this, `TeammateIdle`, carries only a name, no task id, and for named-agent teammates the id-granting hook (`TaskCreated`) never fires at all, so there's no name-to-id map to resolve it against. Glissa ends up draining by count instead of identity: an unresolved `TeammateIdle` is recorded by name, and that count is subtracted from the surviving declared teammate entries, clamped so a stale name can never mask a real one. Inelegant, but it's what survives multiple simultaneous idle teammates with ambiguous names.

Releasing a held `ready` needed its own arbiter: releasing it is a completion claim made minutes after the `Stop` that produced it, and a count draining to zero isn't proof it's still the same turn. The logic checks, in order: has the state changed since the hold was stashed (cancel); did a newer signal arrive after the stash (cancel); is anything still gating (keep holding); has it been quiet long enough (release). Staleness is ordered by a sequence number, not a timestamp, because concurrent signals routinely land in the same millisecond.

![Diagram: the arbiter that decides whether a held ready signal is cancelled, kept holding, or released as task complete](/blog/held-ready-release.svg)

The quiet window (ten seconds by default) exists because a lead resuming on a teammate mailbox message fires no `UserPromptSubmit`, and the title source only emits `working` on the edge into a spinner, so a card already spinning when the message arrived reported nothing new; an instant release would fire a false completion before any evidence could show up. Hook-less background work (shell tasks, monitors) never gets a completion callback at all, so those entries stop counting after a bounded TTL instead of pinning a card working for the full half-hour agent timeout because someone left a dev server running.

## War story three: the process that vanished mid-assertion

I added GitHub Actions to run the test suite on every push. Three tests failed, every time, only on the Windows runner. Locally: green. On `windows-latest`: the process died, not a failing assertion, the whole Node process exited with no stack trace pointing at my code.

The runner's `%TEMP%` is an 8.3 short path, `C:\Users\RUNNER~1\AppData\Local\Temp`. Some of Glissa's file watching goes through `fs.watch`, and libuv, on every reported event, expands the filename it saw to its long form and asserts it still starts with the directory it was told to watch. Handed a short path, that assertion fails from native code, before a JS exception exists to catch. A `try`/`catch` around the `fs.watch` call is a no-op; there's nothing for it to intercept.

The fix is a canonicalization function that resolves a path through `fs.realpathSync.native` (falling back to the input if it doesn't exist on disk yet), routed through every `fs.watch` call in the codebase. A related helper that compares two directory paths for equality needed the same canonical fallback, gated to Windows only: the short-name and subst-drive aliasing problem is a Windows quirk, and canonicalizing elsewhere would silently treat two distinct symlinked directories as the same one.

The part I'm more pleased with than the fix is the test helper. Reproducing an 8.3-short-path bug locally needs an actual 8.3 alias, and Windows only mints those under specific conditions. I wrote a helper that shells out to `cmd /c for %I in (...) do @echo %~sI` against a real temp directory to get a genuine short-path alias, so the regression tests run the exact hazard the CI runner hits, on my own machine, without needing a runner to debug against.

## Limitations, stated plainly

Glissa is Windows 11 only, built for a problem I have on the machine I use every day, and untested anywhere else. Neither WebSocket channel it opens has authentication; any local process can connect to either one. That's a scope decision for a single-user dev tool, not an oversight, but it means the port must never be exposed past localhost. Underneath all of the above, detection is still inference over signals Claude Code doesn't formally guarantee: hooks documented to fire don't always fire the same way across versions (boot auto-resume had to stop depending on `SessionStart` entirely once testing showed it doesn't reliably fire on interactive startup), and the fallback exists precisely because that inference sometimes comes up empty.

## What dogfooding actually got me

Every one of these incidents was found by running Glissa on itself. This article was written inside a Glissa session. The `/clear` bug showed up because I clear my scrollback constantly; the background-agent gate showed up because I run background sub-agents constantly. The CI bug only showed up once I wired up CI, which is its own small lesson: a fix you haven't put in front of a colder environment is a fix you haven't tested. Every session also writes a forensic recording by default (hook payloads and state transitions, not raw keystrokes), replayed through a version-aware harness as regression fixtures, which is the only reason I could diagnose the sub-agent gate bug from real session data instead of trying to reproduce a race by hand.

Glissa is on npm (`npm install -g glissa`) and the source is at [github.com/johncwaters/glissa](https://github.com/johncwaters/glissa).
