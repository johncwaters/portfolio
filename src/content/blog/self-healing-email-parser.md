---
title: "Teaching an AI to Parse Emails Once, Then Never Again"
description: "When an unknown email format shows up, call an LLM exactly once to generate a reusable extraction profile, then parse that format deterministically forever. Zero AI calls on the hot path."
pubDate: 2026-05-19
tags: ["llm-architecture", "parsing", "python", "cost-engineering"]
---

In the United States, anyone planning to dig calls 811 first, and the local utilities get notified so nobody puts a backhoe through a gas line. Those notifications, called locate tickets, arrive as email. Every state system and every partner formats them differently: different labels, different field ordering, different delimiters, sometimes a full reformat with no warning.

The legacy answer at the utility infrastructure company where I work was a hand-maintained rules system. A new email format appears, a human studies it, a human writes extraction rules, the parser works until the format changes again. It is exactly as fun as it sounds, and the queue of unparsed formats never quite reaches zero.

## The obvious architecture is the wrong one

The moment you say "unstructured email" and "extraction" in the same sentence, the obvious 2026 answer is: send every email to an LLM and ask for JSON.

I rejected that design before writing any code. Cost was the loudest reason: we see a handful of new formats a year and thousands of messages a day, so per-message inference pays thousands of times over for knowledge the system already has.

Latency and nondeterminism were close behind. An LLM round trip per message is a tax you pay forever, and locate tickets feed time-boxed regulatory workflows that cannot absorb it. The same email should parse the same way every time; a model that is 99.5% consistent is a slow-burning incident generator in a compliance workflow.

Then there's the audit question. "Why did this ticket parse this way?" needs an answer that is a rule you can read, not a temperature setting.

What actually changes is the *format*, not the message. So put the intelligence where the change happens.

## Parse with profiles, heal with one LLM call

The system I built works like this:

1. **Normalize.** A pipeline of normalizers strips the volatile junk: encodings, wrapped lines, signature noise.
2. **Fingerprint.** Compute a structural fingerprint of the normalized message: the skeleton of labels, ordering, and delimiters, with the variable content removed. Two messages in the same format produce the same signature even though every field value differs.
3. **Match.** Look the signature up in the profile store. Known signature: apply the stored extraction profile, a purely static, declarative set of rules. This is the hot path, and it contains no AI at all.
4. **Heal.** Unknown signature: make exactly one LLM call. The model's job is not to parse the message. Its job is to *write the extraction profile* for this format: where each field lives, what pattern captures it, what the delimiters are. The profile is stored against the signature, and every future message in that format parses statically.

![Diagram: every email is normalized and fingerprinted; known signatures parse with a stored static profile on the hot path, unknown signatures trigger exactly one LLM call that writes and stores a new profile](/blog/parser-pipeline.svg)

The comparison ends up lopsided:

| | LLM per message | Profile generation |
|---|---|---|
| Inference cost | O(messages) | O(formats) |
| Hot-path latency | Model round trip | Regex and string ops |
| Determinism | Best effort | Total |
| Audit trail | Prompt and prayer | A readable profile |

## The part I did not expect

The first working version of this came together in a single focused day at our monthly professional development day, working solo with AI coding tools. That is not a humblebrag about typing speed; it is a data point about where the effort in this design lives.

Normalization and fingerprinting are the hard 20% that make the LLM's job easy. When the model only has to describe a format once, with a clean normalized sample in front of it, you are asking it for the thing LLMs are genuinely great at: noticing structure and writing it down.

A self-healing system also fails better. If the model writes a bad profile, you find out immediately, on the first message of a new format, in one place, with a reviewable artifact to fix. A per-message design smears the same failure across thousands of messages as a subtle quality problem.

## The principle

Put the LLM where the change happens, not where the work happens. Design-time inference is cheap, reviewable, and cacheable; hot-path inference is a per-transaction tax on cost, latency, and determinism. If the variability in your problem is low-frequency (formats, schemas, layouts) and the volume is high-frequency (messages, rows, requests), let the model generate the deterministic artifact once, and let boring code run it forever.
