---
title: "Burnout at 10x Speed: The Next Interface for Coding Agents Won't Be Text"
description: "I started 1,654 agent sessions in 30 days, and reading them became the bottleneck. Glimmervoid is my experiment in making the board the interface and chat the way you talk about it."
pubDate: 2026-11-20
tags: ["agents", "ade", "glimmervoid"]
draft: false
---

A friend messaged me last week that her brain can't keep up with how fast ideas turn into real things now. I told her I already forced myself to slow down, because nothing beats getting burnout at 10x speed.

Agents made the typing cheap. They didn't make reading cheap.

Over the last 30 days I started 1,654 agent sessions, about 55 a day. On November 2 it was 157, one every nine minutes around the clock.

Those sessions put 2,375 commits on main and changed 540,000 lines, nearly twice the size of the whole codebase.

Everyone suggests the same fixes:

- A wall of terminals, 30 panes in a tmux grid: more to watch, and I only have two eyes.
- Brevity prompts: shorter replies, but still a stream of text for every session. (I run my agents in caveman mode. It helps, but I'm still reading.)
- More agents in parallel: more sessions to keep track of.
- Turn off approvals and let it rip: maybe.

Every one of them keeps the chat transcript as the place you work.

We moved from writing every line, to reviewing every line an agent wrote, to reviewing its diffs. The next step is to stop reading the work and look at its architecture.

So I'm building [Glimmervoid](https://glimmervoid.dev), where **the board is the interface and chat is how you talk about it.**

Here's what that looks like:

1. **Focus, not a grid**: the one session that needs you comes to the front, and the rest wait in a quiet rail. "Needs you" comes from the agent's own hooks, never from scraping terminal text.

   ![The Glimmervoid Focus view: a rail on the left reads 1 needs you, and the focused session asks permission to create a migration plan file while the other sessions wait](/blog/burnout/focus.png)

2. **Quiet chat by default**: tool calls collapse into one muted line, with the detail a click away in the trace. The chat keeps the agent's decisions and questions.

   ![A session transcript where the agent's tool calls collapse into one muted line reading searched for 1 pattern, read 1 file, called glimmervoid 2 times, followed by its one-line reply](/blog/burnout/quiet-chat.png)

3. **The board is the state**: a plan is boxes on a whiteboard, and wires set the build order. Press Run and each step gets its own session, then turns building and landed as its work merges.

   ![A whiteboard titled Invoice total: three plan steps marked landed, building and planned sit above a diagram of how line items, discounts, subtotal and tax flow into the invoice total, with a support note wired to the total](/blog/burnout/board-state.png)

4. **Chat and board together**: the agent draws what it means, I drag a box or leave a note, and it reads my edit on its next turn.

   ![A session beside the Checkout flow board it drew: boxes for api, catalog, cart, checkout, payments, shipping and notifications joined by labelled wires, while the chat only points at the board](/blog/burnout/chat-and-board.png)

5. **Architecture over diffs**: a code map of the repo, tinted with the modules each session touched. I review where a change landed before I read how.

   ![A code map of a shop repo with the gift-cards session overlay tinting the checkout and payments modules it changed](/blog/burnout/code-map.png)

The fair objection: have the agent write a summary. A summary is still text, one more per session, and at 55 sessions a day that's 55 more things to read.

Sometimes text is the work, like a spec I need to get right or this post. I still read those. I no longer read to find out whether a session needs me.

Next I'm flipping the board around: many chats on one board instead of many boards in one chat. Click any part of the diagram to open a side chat about it, or fork an agent from there and steer the build visually.

I'm still slowing down on purpose, and I'd rather do it with a board than with 157 transcripts. If you're running more agents than your head can track, try it and tell me where it breaks: [glimmervoid.dev](https://glimmervoid.dev). The source is at [github.com/johncwaters/glimmervoid](https://github.com/johncwaters/glimmervoid).
