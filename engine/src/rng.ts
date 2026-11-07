/** Seedbare PRNG (mulberry32). De state is één getal, dus serialiseerbaar. */
export function nextRandom(state: number): [value: number, next: number] {
  const s = (state + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

export function randomInt(state: number, maxExclusive: number): [number, number] {
  const [v, next] = nextRandom(state);
  return [Math.floor(v * maxExclusive), next];
}

/** Fisher–Yates; geeft een nieuwe array en de nieuwe rng-state terug. */
export function shuffle<T>(items: readonly T[], state: number): [T[], number] {
  const out = items.slice();
  let s = state;
  for (let i = out.length - 1; i > 0; i--) {
    let j: number;
    [j, s] = randomInt(s, i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return [out, s];
}
