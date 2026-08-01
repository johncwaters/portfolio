# Blog writing guide

Rules for writing and editing posts in this directory. Grounded in Nielsen Norman Group web-reading research and inverted-pyramid practice. Roughly 79% of readers scan; write for them first.

## Openings

- Lead with a journalistic lede, not an abstract: the conclusion or headline finding in 1 to 3 short sentences. Method and scope come after the reader has opted in.
- Never pack method, sample size, headline metrics, and multiple findings into one paragraph.
- For data-heavy posts, follow the lede with a labeled **TL;DR:** block of 3 to 5 one-line bullets.
- No throat-clearing: cut "In this post we will", "It is important to note", and any intro paragraph that only sets up the next one.

## Paragraphs and sentences

- One idea per paragraph, 2 to 4 sentences, roughly 50 to 80 words. Split anything past 100 words rather than compressing it.
- Front-load every sentence and paragraph: actor, result, or claim first; method, hedge, and subordinate clauses after. The first few words decide whether a scanner reads the rest.
- Short sentences carry the key claims; one longer sentence may follow for nuance, not the reverse.
- Target roughly half the word count a print or academic treatment of the same point would use.

## Structure

- Subheads state the finding or topic, not a clever label. They are the primary scan path.
- Bullets for parallel, countable, or independently actionable items, one line each where possible. Never bullet a continuous argument or causal narrative, and never dump multi-sentence paragraphs under bullets.
- Tables when readers compare the same fields across conditions; charts when the story is trend or magnitude. Interpret either in 1 to 2 sentences, do not restate cell values in prose.
- Bold sparingly, only decision-grade claims or metrics.

## Numbers

- One result per sentence: claim, number, baseline or condition. Never nest multiple percentages, sample sizes, and a caveat in one clause.
- Finding first, qualifiers trailing: "X went 4/4 under mcp" then the n and the caveat.
- Separate "what happened" from "what it means": results prose states magnitudes, discussion prose states mechanism and limits. Mixing the two is how mega-paragraphs form.

## Fat to cut

- Hedges that do not change the claim: "somewhat", "it could be argued", "in many cases", double qualifiers. Keep only hedges that bound the inference (sample, scope, significance).
- Restatement: any sentence that rephrases the previous one without new evidence, and any section opener that repeats the lede or TL;DR.
- Filler patterns: "which is exactly the kind of", "as mentioned above", "the thing is".

## House style (non-negotiable)

- No em dashes (U+2014) or en dashes (U+2013) anywhere. Use a comma, colon, or parentheses.
- No emoji.
- Frontmatter: `title`, `description` (1 to 2 sentences, the lede in miniature), `pubDate`, `tags`.
- Images live in `public/blog/`, referenced as `/blog/<file>`. Alt text describes the image content and matches any embedded SVG aria-label verbatim.
- Sanitization: employer named only as "ELM" or "a utility infrastructure company", never internal codenames, repo/server names, or ticket numbers. Personal projects (Glissa, Keeplings, Card Harbor) may be named freely.
- End posts with a link to the relevant repo or product when one is public.
