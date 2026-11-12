import type { BotLevel } from '../bots';

export type Speed = 'slow' | 'normal' | 'instant';
export interface Settings {
  level: BotLevel;
  speed: Speed;
  bots: number;
}

const KEY = 'rotterdam.settings';
const DEFAULTS: Settings = { level: 'normal', speed: 'normal', bots: 2 };

export function loadSettings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* privémodus: geen opslag */
  }
}

/** Duur in ms: per vaarstap, vliegende goederen en het tonen van de actie. */
export const TIMING: Record<Speed, { step: number; fly: number; action: number }> = {
  slow: { step: 1000, fly: 1100, action: 1900 },
  normal: { step: 600, fly: 750, action: 1150 },
  instant: { step: 0, fly: 0, action: 0 },
};
/** Jouw eigen zetten: altijd geanimeerd. */
export const HUMAN_TIMING = { step: 550, fly: 750 };

export const SPEED_LABEL: Record<Speed, string> = { slow: 'Traag', normal: 'Normaal', instant: 'Direct' };
export const LEVEL_LABEL: Record<BotLevel, string> = { easy: 'Makkelijk', normal: 'Normaal', hard: 'Moeilijk' };
