---
title: "My Rice Cooker Sings. Most Software Is the Air Fryer."
description: "My rice cooker plays a song when the rice is done and my air fryer beeps like a forklift in reverse. They do the same job, and only one of them had somebody decide what done should feel like."
pubDate: 2026-10-10
tags: ["craft", "sound-design", "glimmervoid", "keeplings"]
draft: true
---

My rice cooker sings when the rice is done. My air fryer does the same job, telling me the food is ready, with a beep so industrial it sounds like a forklift backing through my kitchen.

Both machines are announcing the same thing. The difference is that somebody at the rice cooker company sat down and decided what "done" should sound like, and the air fryer got whatever a buzzer does when nobody is asked.

Most software is the air fryer, and usually it's worse, because the air fryer at least makes a noise. You finish the thing you spent all day on and the screen swaps one gray label for another. I complained about this on LinkedIn in the most mature way available to me: "Software is soooo boring and lifeless. Rounded corners, no sense of satisfaction, and lame colors."

That was a joke with a real complaint under it, and the complaint is that nobody decided. So I've been deciding, in two projects, and both of them taught me the same rule about where the fun is allowed to go.

## A merged pull request deserves more than a purple badge

[Glimmervoid](https://github.com/johncwaters/glimmervoid) is the dashboard I use to run several Claude Code sessions in parallel. The best moment in it is a pull request merging, which is the point of everything the agents and I did before it, and on GitHub the payoff for that moment is a badge turning purple.

Now a merge plays one of five sports highlights, picked at random: a bowling strike, a swish, a bullseye, a headshot, or a royal flush. The banner drops in with a whoosh, the scene lands with a thump, and a short brassy jingle plays over the confetti.

<video controls playsinline preload="metadata" width="1600" height="900" poster="/blog/glimmervoid-merge-celebrations-poster.png" aria-label="Screen recording with sound: five queued merge celebrations play from the Glimmervoid trophy tray, a bowling strike, a swish, a bullseye, a headshot, and a royal flush, each with a jingle pitched higher than the last and a bigger burst of confetti">
  <source src="/blog/glimmervoid-merge-celebrations.mp4" type="video/mp4" />
</video>

*Five merges played back to back from the trophy tray, one of each scene, on made-up pull requests. Sound on.*

The part I care about is what happens across a run. All five jingles share one eight-beat skeleton and close on the same three-note cadence, so they sound like siblings instead of five unrelated ringtones. Each celebration in a run plays two semitones higher than the one before it, and the confetti grows from 0.6 to 1.6 times its normal size, so merging five things in a row builds like a combo counter.

None of it needed a sound library or a single audio file. The jingles are one 76-line file of note tables, played through the oscillator code that already existed for the chime that tells me a session needs attention. That's the uncomfortable part: the gray label was never saving anybody money.

## The first version was an air fryer

The first version fired the moment a pull request merged. Agents merge things while I'm in another window or away from the desk, so I missed them, and a celebration that goes off while you're reading a stack trace in a different session is an interruption with confetti on it. It was a sound I didn't ask for, at a time I didn't choose, about something I wasn't looking at. I had built a better-sounding air fryer.

So celebrations wait now. A merge lands in a trophy button in the header, which turns green and shows a count, and nothing plays until I click it. I tried a small clink for the moment one lands in the tray and cut it because it was noisy. One switch turns the sound off.

That's the rule, and it's my answer to the fair objection that "fun" software is software that annoys you with a smile on its face. The objection is right about fun that gets imposed. A celebration should mark something you did, at a moment you picked, and it should be gone the instant you'd prefer silence.

## Two notes, tuned by ear

[Keeplings](https://play.google.com/store/apps/details?id=app.keeplings.keeplings) is my habit app, where every habit is championed by a small collectible creature. Its reference point is Nintendo, specifically the Wii menu, whose soft, round little sounds I can still hear twenty years later.

I built a Web Audio soundboard to chase that sound, landed on a recipe I named Feather, and baked it into four chimes. Each one is two or three notes with a 14-millisecond attack, a tail a little over a second long, some shimmer, and reverb.

<img src="/blog/keeplings-habit-card.png" alt="A Keeplings card for Remi, an orange elephant with a sprout on its head who champions the habit Drink water, marked Flourishing, with an I did it button at the bottom" width="270" height="600" style="margin-inline: auto;" />

**Habit kept.** A rising fifth. This is what the "I did it" button sounds like.

<audio controls preload="none" src="/blog/keeplings-habit-complete.mp3" aria-label="Keeplings habit kept chime: two notes rising a fifth"></audio>

**Reminder.** The same rising fifth, pitched a fifth lower.

<audio controls preload="none" src="/blog/keeplings-notification.mp3" aria-label="Keeplings reminder chime: two lower notes rising a fifth"></audio>

**App opens.** Three notes that dip before they rise, at a tenth of the volume.

<audio controls preload="none" src="/blog/keeplings-app-startup.mp3" aria-label="Keeplings startup chime: three quiet notes that dip and then rise"></audio>

**Purchase.** The fifth again, with the octave on top.

<audio controls preload="none" src="/blog/keeplings-store-purchase.mp3" aria-label="Keeplings purchase chime: three notes rising through a fifth to the octave"></audio>

The volumes were set by ear, one moment at a time. On the recipe's volume dial, keeping a habit plays at 145 and opening the app plays at 14, because you earn a fanfare by doing the thing and not by launching an app. The reminder is the reward's two-note shape moved down a fifth, which means it ends on the exact note the reward begins with: the app asks, and you finish the phrase.

The chimes also never pause your music or your podcast. They play over it, at whatever your media volume already is, which is the trophy tray's rule arrived at from the other direction.

## Fun is not a retention strategy

That LinkedIn post ended with "Next, loot boxes. (Sold separately)". It was the punchline, and it's also where the line is. The Keeplings site promises creature cards "earned by showing up, never pulled from a loot box," and when you skip a habit the creature rests instead of dying.

A streak counter and a merge celebration can look alike, since both are bright and both make noise, but they point in opposite directions: one celebrates what you just did and the other threatens what you'll lose tomorrow. My read is that this confusion is why so many serious tools ship gray. "Delight" got filed under "engagement," engagement earned its bad name, and the safe response was to make everything look like a spreadsheet.

The safe response throws out the wrong thing. Find the moments where your product has good news (merged, saved, paid, kept) and decide what each one sounds and looks like. If you don't, the default decides for you, and the default is a beep. Somebody picked my rice cooker's song, and I'd bet they had a good afternoon doing it.

Glimmervoid's source is at [github.com/johncwaters/glimmervoid](https://github.com/johncwaters/glimmervoid), and Keeplings is on [Google Play](https://play.google.com/store/apps/details?id=app.keeplings.keeplings). Loot boxes not included.
