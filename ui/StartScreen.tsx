import { useState } from 'react';
import type { BotLevel } from '../bots';
import { Icon, ShapeGlyph } from './icons';
import { ROUND_OPTIONS } from '../engine/src';
import { LENGTH_LABEL, LEVEL_LABEL, SPEED_LABEL, type Length, type Settings, type Speed } from './settings';
import { PLAYERS } from './theme';

interface Props {
  initial: Settings;
  onStart: (s: Settings) => void;
  canResume?: boolean;
  onResume?: () => void;
}

export function StartScreen({ initial, onStart, canResume, onResume }: Props) {
  const [s, set] = useState(initial);
  return (
    <div className="start">
      <div className="start-card">
        <h1>Rotterdam</h1>
        <p className="sub">Een havenspel voor 2–4 spelers</p>

        <h3>Tegenstanders</h3>
        <div className="seg">
          {[1, 2, 3].map((n) => (
            <button key={n} className={s.bots === n ? 'on' : ''} onClick={() => set({ ...s, bots: n })} aria-pressed={s.bots === n}>
              <span className="shapes">
                {PLAYERS.slice(1, n + 1).map((p) => (
                  <Icon key={p.name} size={14}>
                    <ShapeGlyph shape={p.shape} size={10} fill={p.color} />
                  </Icon>
                ))}
              </span>
              {n} {n === 1 ? 'bot' : 'bots'}
            </button>
          ))}
        </div>

        <h3>Speelduur</h3>
        <div className="seg">
          {(Object.keys(LENGTH_LABEL) as Length[]).map((l) => (
            <button key={l} className={s.length === l ? 'on' : ''} onClick={() => set({ ...s, length: l })} aria-pressed={s.length === l}>
              {LENGTH_LABEL[l]}
              <small>{ROUND_OPTIONS[l]} rondes</small>
            </button>
          ))}
        </div>

        <h3>Niveau</h3>
        <div className="seg">
          {(Object.keys(LEVEL_LABEL) as BotLevel[]).map((l) => (
            <button key={l} className={s.level === l ? 'on' : ''} onClick={() => set({ ...s, level: l })} aria-pressed={s.level === l}>
              {LEVEL_LABEL[l]}
            </button>
          ))}
        </div>

        <h3>Snelheid bots</h3>
        <div className="seg">
          {(Object.keys(SPEED_LABEL) as Speed[]).map((k) => (
            <button key={k} className={s.speed === k ? 'on' : ''} onClick={() => set({ ...s, speed: k })} aria-pressed={s.speed === k}>
              {SPEED_LABEL[k]}
            </button>
          ))}
        </div>

        <button className="btn primary wide" onClick={() => onStart(s)}>
          Nieuw spel
        </button>
        {canResume && (
          <button className="btn ghost-dark wide" onClick={onResume}>
            Verder spelen
          </button>
        )}
      </div>
    </div>
  );
}
