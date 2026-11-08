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

/** Duur in ms: per vaarstap en voor het tonen van de actie. */
export const TIMING: Record<Speed, { step: number; action: number }> = {
  slow: { step: 900, action: 1700 },
  normal: { step: 480, action: 900 },
  instant: { step: 0, action: 0 },
};

export const SPEED_LABEL: Record<Speed, string> = { slow: 'Traag', normal: 'Normaal', instant: 'Direct' };
export const LEVEL_LABEL: Record<BotLevel, string> = { easy: 'Makkelijk', normal: 'Normaal', hard: 'Moeilijk' };
