# Scholé Growth Lab

**A landing page that learns.** Five Scholé *Teams* landing-page concepts compete
for simulated enterprise-buyer traffic. A multi-armed bandit finds the winning
*"why"*, an interpretable marginal-effects model attributes *which genes* earned
the revenue, a promotion gate separates signal from noise, and the system breeds
an informed new page — then explains what changed and why, in plain language.

Built for the Scholé Founding Growth Engineer challenge by Martin Gonzalez.

## The idea

The app **contains** a web app:

- **Inner app (the artifact):** a real Scholé Teams landing page that is *not
  hardcoded*. It renders from a **genome** — a set of discrete "genes" (headline
  framing, CTA, section order, social proof, tone, length, hero layout). Change
  the genome, change the page.
- **Outer app (the lab):** a dashboard that runs an online optimization loop over
  a population of genomes using **simulated buyer traffic**, decides which pages
  win, generates informed variants, and explains its reasoning.

Reward is **revenue**, not raw clicks: each simulated conversion is weighted by
its expected value to a `$5,800+/yr` Teams contract, and that value lives on the
persona doing the converting.

## Why it's built to be *explained*

The whole system is designed so every number on screen traces to a formula in
`/src/core`. Because we author the hidden ground-truth preference matrix, we can
**grade the system's own inferences** — does it recover the truth we planted?
That's the honesty layer, and it echoes the founders' research in interpretable
AI and knowledge tracing.

## Architecture

```
src/core        ← the brain. Pure, framework-free, unit-tested TypeScript.
  genome.ts     ← genes, alleles, real Scholé copy, the 5 seed variants
  personas.ts   ← the 4-role buying committee, revenue values, GROUND_TRUTH
  render.ts     ← genome → which sections render, in what order
  tone.ts       ← the tone gene → copy voice
  (simulate / bandit / attribute / generate / interpret / experiment — incoming)
src/components/landing  ← section components; genome → real page
src/app         ← Next.js App Router (thin). Home, variant pages, lab views.
```

Everything random flows through a single **seeded RNG**, so a run is fully
defined by `(config, seed)` and reproduces exactly — same seed, same result.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static production build
npm test         # core unit tests + evals (incoming)
```

## Deploy

Static/edge build, no server or database. Hosted free on Vercel.
