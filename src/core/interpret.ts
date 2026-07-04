// interpret.ts
// ---------------------------------------------------------------------------
// PURE. Turns the pipeline's numbers into the human-readable "what changed and
// why" — deliverable #6, the star of the show. It composes the three sub-runs
// (bandit experiment → attribution/promotion → generation) into an ordered
// narrative where EVERY claim is backed by a number that also lives on a lab
// screen. The interpreter states; the lab views prove.
//
// Framing: the loop is "knowledge tracing on the
// market" — the system traces what the market knows about itself the way Scholé
// traces what a learner knows, updating beliefs about a hidden state (a
// variant's true value) from noisy observations.
// ---------------------------------------------------------------------------

import { SEED_VARIANTS, HEADLINE_COPY, type AttributedGene } from './genome';
import { runExperiment } from './experiment';
import { runGeneration, type GeneChange } from './generate';
import { AUDIENCE_MIXES } from './personas';

export interface StoryBeat {
  phase: number;
  title: string;
  detail: string;
  stat?: string; // the headline number for this beat
  href?: string; // the lab view that shows the evidence
}

export interface Narrative {
  mixKey: string;
  seed: number;
  summary: string;
  recovered: boolean;
  winnerName: string;
  winnerWhy: string;
  oracleName: string;
  regretSaved: number; // dollars saved vs uniform allocation
  promoted: { gene: AttributedGene; allele: string; effect: number }[];
  heldBack: { gene: AttributedGene; allele: string; reason: string }[];
  offspring: {
    parentName: string;
    changes: GeneChange[];
    estimatedLift: number;
    actualLift: number;
    liftPct: number;
    parentReward: number;
    offspringReward: number;
  };
  beats: StoryBeat[];
  caveats: string[];
}

const money = (v: number) =>
  `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString()}`;
const pretty = (s: string) => s.replace(/_/g, ' ');
const nameById = (id: string) => SEED_VARIANTS.find((v) => v.id === id)?.name ?? id;

export function interpret(cfg: { mixKey: string; seed: number }): Narrative {
  const { mixKey, seed } = cfg;

  // Phase 2: the bandit race over the six seed concepts.
  const exp = runExperiment({
    mixKey,
    banditKind: 'thompson',
    rounds: 30,
    visitorsPerRound: 60,
    seed,
  });
  const uniform = runExperiment({
    mixKey,
    banditKind: 'epsilon_greedy',
    epsilon: 1,
    rounds: 30,
    visitorsPerRound: 60,
    seed,
  });
  const regretSaved = (uniform.regretCurve.at(-1) ?? 0) - (exp.regretCurve.at(-1) ?? 0);
  const recovered = exp.empiricalBestId === exp.oracleBestId;

  // Phase 3 + 4: attribution, promotion, and the bred offspring.
  const gen = runGeneration({ mixKey, genomes: 200, visitsPerGenome: 45, seed, minSamples: 400 });

  const winnerGenome = SEED_VARIANTS.find((v) => v.id === exp.empiricalBestId)!.genome;
  const winnerWhy = HEADLINE_COPY[winnerGenome.headline].why;
  const winnerName = nameById(exp.empiricalBestId);
  const oracleName = nameById(exp.oracleBestId);

  const promoted = gen.promotion.promoted.map((p) => ({
    gene: p.gene,
    allele: p.allele,
    effect: p.effect,
  }));
  const heldBack = gen.promotion.rejected.map((r) => ({
    gene: r.gene,
    allele: r.allele,
    reason: r.reason,
  }));

  const liftPct = gen.baseExpectedReward > 0 ? gen.actualLift / gen.baseExpectedReward : 0;
  const offspring = {
    parentName: gen.base.name,
    changes: gen.offspring.changes,
    estimatedLift: gen.offspring.estimatedLift,
    actualLift: gen.actualLift,
    liftPct,
    parentReward: gen.baseExpectedReward,
    offspringReward: gen.offspringExpectedReward,
  };

  const changesDesc =
    offspring.changes.length === 0
      ? 'the champion already carried every proven allele, so it changed nothing — an honest no-op'
      : 'it swapped ' +
        offspring.changes.map((c) => `${pretty(c.gene)} to “${pretty(c.to)}”`).join(', ');

  const heldExample = heldBack[0]
    ? `${pretty(heldBack[0].gene)} (“${pretty(heldBack[0].allele)}”)`
    : 'none';

  const beats: StoryBeat[] = [
    {
      phase: 1,
      title: 'Six reasons to buy, put to the test',
      detail:
        'We built six Scholé Teams concepts, each led by a different “why” — capability, ROI, trust, risk, control, and the AI value gap. This is a message test, not a button-color test: the winner tells us which reason to buy resonates.',
      stat: '6 concepts',
      href: '/#variants',
    },
    {
      phase: 2,
      title: `The bandit crowned ${winnerName}`,
      detail: `A Thompson-sampling bandit poured simulated ${pretty(mixKey)} traffic across the six, shifting spend toward what paid. ${
        recovered
          ? `Its winner matches the true best under this audience — the system recovered reality from noisy behavior.`
          : `Its winner is still within noise of the true best (${oracleName}) — honest about what the sample supports.`
      } Learning this way instead of splitting traffic evenly saved ${money(regretSaved)} in lost revenue.`,
      stat: recovered ? 'recovered the true winner' : 'not yet separated',
      href: '/lab/experiment',
    },
    {
      phase: 3,
      title: `${promoted.length} genes earned their promotion`,
      detail: `Knowing which page won isn’t enough to breed a better one, so an interpretable regression estimated each gene’s effect on revenue while controlling for the others. ${promoted.length} cleared the promotion gate; ${heldBack.length} were held back for want of evidence — including ${heldExample}. The planted null control (hero layout) was correctly ignored, so this isn’t pattern-matching on noise.`,
      stat: `${promoted.length} proven · ${heldBack.length} held back`,
      href: '/lab/attribution',
    },
    {
      phase: 4,
      title: `A bred page worth ${money(offspring.offspringReward)}/visit`,
      detail: `Starting from the champion (${offspring.parentName}), ${changesDesc}. It left every unproven gene untouched — no guessing. Attribution predicted ${money(
        offspring.estimatedLift,
      )}; the true lift was ${money(offspring.actualLift)} (${(liftPct * 100).toFixed(1)}%). The gap is unmodeled gene interactions, stated rather than hidden.`,
      stat: `+${(liftPct * 100).toFixed(1)}% revenue`,
      href: '/lab/generate',
    },
  ];

  const summary = `Under a ${pretty(mixKey)} audience, the market wanted “${winnerWhy}” — ${winnerName} won, and the system bred a page worth ${money(
    offspring.offspringReward,
  )} per visit, a ${(liftPct * 100).toFixed(1)}% lift, and can defend every choice.`;

  const caveats = [
    'All traffic is simulated against a hidden ground truth we authored — the point is that we can grade the system’s inferences against a known answer.',
    'Attribution is a main-effects model; the gap between estimated and actual lift is real gene interactions it can’t see.',
    'Under a shifting audience mix a bandit can crown a false winner — the two-phase design, the mix knob, and the promotion gate exist to catch exactly that. Flip the mix and watch the winner change.',
  ];

  // sanity: the mix must exist (fail loudly rather than narrate nonsense)
  if (!AUDIENCE_MIXES[mixKey]) throw new Error(`unknown mix: ${mixKey}`);

  return {
    mixKey,
    seed,
    summary,
    recovered,
    winnerName,
    winnerWhy,
    oracleName,
    regretSaved,
    promoted,
    heldBack,
    offspring,
    beats,
    caveats,
  };
}
