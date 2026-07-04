# CLAUDE.md — Scholé Growth Lab

A self-improving landing-page system: a web app that contains a web app. The
inner app is a real Scholé *Teams* landing page rendered from a structured
config; the outer app runs an online optimization loop over many page variants
using simulated traffic, decides which perform best, generates informed new
variants, and explains what changed and why.

Design priorities, in order: **interpretability, determinism, simplicity.** Every
number surfaced in the UI should trace to a formula in `/src/core`. Prefer small
pure functions over frameworks.

---

## Architecture

Keep the core (the "brain") separate from the UI (the "face"). The core is
framework-free TypeScript, fully unit-tested; the UI only calls into it.

```
/src
  /core                 ← PURE, no React, no I/O, unit-tested
    genome.ts           ← genes, alleles, real Scholé copy, the seed variants
    personas.ts         ← the 4-role buying committee, revenue values, GROUND_TRUTH
    render.ts           ← genome → which sections render, in what order
    tone.ts             ← the tone gene → copy voice
    rng.ts              ← seeded deterministic RNG (mulberry32)
    simulate.ts         ← (genome, persona) → section signals + revenue-weighted conversion
    bandit.ts           ← epsilon-greedy, UCB1, Thompson sampling
    experiment.ts       ← orchestrates a run: rounds → allocate → simulate → update
    attribute.ts        ← per-allele effect estimation (OLS main effects + HC1 SEs) + promotion gate
    generate.ts         ← informed recombination → new genome(s)
    interpret.ts        ← composes the run into a human-readable narrative
    evals.ts            ← grades the system's inferences against ground truth
    holdout.ts          ← out-of-sample champion-vs-challenger A/B
    /sequential         ← time-varying (per-timepoint) personas + timeline runner
  /components
    /landing            ← section components; genome → real landing page
    /lab                ← dashboard charts + shared nav
  /app                  ← Next.js App Router (thin): home, /variants/[id], /lab/*
/evals                  ← eval harness, runs with `npm test`
```

Rule: nothing in `/core` imports React or touches the network. Only `simulate.ts`
reads `GROUND_TRUTH`; everything downstream must infer it.

---

## The genome (the parameterized page)

A genome is a flat object mapping each gene to a chosen allele. Genes are discrete
and few, which is what makes per-allele attribution identifiable.

| Gene | Alleles | Controls |
|---|---|---|
| `headline` | `team_capability`, `measurable_adoption`, `governance_ready`, `admin_control`, `research_credibility`, `value_realization` | The core "why" |
| `primaryCta` | `book_demo`, `get_pricing`, `get_diagnostic` | The main ask |
| `ctaStyle` | `single`, `dual` | One button vs. two |
| `socialProof` | `case_studies`, `company_logos`, `research_stats`, `compliance_security` | Which proof shows |
| `tone` | `academic`, `punchy`, `consultative` | Copy voice |
| `sectionOrder` | permutations of `[benefits, howItWorks, proof, credibility, pricing]` | Structure |
| `length` | `short`, `medium`, `long` | How many sections render |
| `heroLayout` | `split_image`, `centered_minimal`, `dashboard_demo` | Above-the-fold layout |

Copy for each allele lives in `genome.ts` as data, grounded in the real Scholé
Teams positioning. A genome always renders to a coherent page.

The seed variants (`SEED_VARIANTS`) are six boldly different concepts, each built
on one "why", so a comparison is a message test rather than a cosmetic test.

---

## The simulation model

We simulate traffic instead of using real users, and author the ground truth so
we can grade the system's inferences against it.

- **Personas.** Four roles on the enterprise buying committee (`personas.ts`),
  each with `conversionValue` (dollars per action) and a row in the hidden
  `GROUND_TRUTH` preference matrix (how much they like each allele).
- **Audience mix.** A probability distribution over which role dominates a deal.
  Presets: `champion_led`, `roi_driven`, `risk_driven`, `balanced`. Flipping the
  mix changes which "why" wins.
- **From genome + visitor → behavior** (`simulate.ts`): utility = Σ of the
  persona's ground-truth weights over the genome's alleles; utility drives
  section-level dwell/scroll and a softmax (random-utility discrete-choice model)
  over the actions the page offers plus "none"; reward =
  `conversionValue[persona][action]`. Seeded noise throughout.

Reward is **revenue**, not raw conversions.

`PersonaSpec` generalizes this so the same loop can run against any buyer
(including the time-varying personas in `/core/sequential`).

---

## Optimization, attribution, generation

- **Bandits** (`bandit.ts`): epsilon-greedy, UCB1, Thompson (Beta-Bernoulli with
  fractional updates for bounded rewards) behind one interface. Traffic is
  allocated in rounds; allocation shifts toward winners.
- **Attribution** (`attribute.ts`): an interpretable OLS main-effects regression
  (effects/sum-to-zero coding) estimates each allele's effect on revenue while
  controlling for the other genes, with HC1 heteroscedasticity-consistent
  confidence intervals. A **promotion gate** only crowns an allele that clears a
  minimum sample size and whose CI separates from the runner-up; rejections are
  surfaced with reasons.
- **Generation** (`generate.ts`): breeds an informed offspring by applying only
  the gate-cleared alleles to the current champion; unproven genes are inherited
  untouched. Reports estimated vs. true lift.
- **Interpreter** (`interpret.ts`): composes the run into an ordered narrative
  where each claim links to the view that shows the number.

Optional LLM copy generation is behind a `USE_LLM` flag (default off, with a
deterministic fallback). The decision of *what* to generate is always the
attribution, never the LLM.

---

## Evals (`/evals`, `npm test`)

Because we author the ground truth, we grade the system across many seeds:

- **Arm identification** — how often the bandit crowns the truly-best variant.
- **Attribution recovery** — correlation between estimated and true allele effects.
- **Regret** — cumulative regret vs. an oracle, as a share of uniform allocation.
- **CI calibration** — do the 95% intervals cover the truth ~95% of the time?
- **False-discovery guard** — a planted null gene (`heroLayout`) is never promoted.

---

## Determinism

Everything random flows through `rng.ts`, seeded from a single run seed. A run is
fully defined by `(config, seed)` and reproduces exactly. Never call
`Math.random()`.

---

## Tech stack & conventions

- Next.js (App Router) + TypeScript + Tailwind v4. Static/edge build, no database.
- The optimization loop runs client-side (deterministic, no real user data), so
  the app is a static build with no server to keep alive.
- Charts: hand-rolled SVG (no chart dependency).
- Testing: Vitest for `/core` and `/evals`. Build test-first.
- Style: small pure functions, explicit types, comments that explain *why*.

## Scope discipline — do not build

No real analytics/cookies/tracking, no auth, no database/ORM, no deep-learning
models. The bandits and the marginal-effects estimator are the whole ML surface.

## Commands

```bash
npm install
npm run dev          # local dev
npm test             # core unit tests + evals (Vitest)
npm run build        # production build
# deploy: `vercel --prod`
```
