// sequential/index.ts — Ray Delgado's timeline, chronological.
import type { TimedPersona } from './types';
import { ray_2023_07 } from './ray-2023-07';
import { ray_2024_01 } from './ray-2024-01';
import { ray_2024_07 } from './ray-2024-07';
import { ray_2025_01 } from './ray-2025-01';
import { ray_2025_07 } from './ray-2025-07';
import { ray_2026_01 } from './ray-2026-01';
import { ray_2026_07 } from './ray-2026-07';

export * from './types';

/** Ray, every 6 months, July 2023 → July 2026 (oldest first). */
export const RAY_TIMELINE: TimedPersona[] = [
  ray_2023_07,
  ray_2024_01,
  ray_2024_07,
  ray_2025_01,
  ray_2025_07,
  ray_2026_01,
  ray_2026_07,
];

/** The current (July 2026) snapshot. */
export const RAY_NOW: TimedPersona = ray_2026_07;
