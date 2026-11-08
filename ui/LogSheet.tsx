import { useState } from 'react';
import type { GameState } from '../engine/src';
import { Help } from './Help';
import { Icon, ShapeGlyph } from './icons';
import { SPEED_LABEL, type Speed } from './settings';
import { PLAYERS } from './theme';

export interface LogEntry {
  round: number;
  player: number;
  text: string;
}

interface Props {
  log: LogEntry[];
  state: GameState;
  speed: Speed;
  onSpeed: (s: Speed) => void;
  onClose: () => void;
  onQuit: () => void;
}

export function LogSheet({ log, state, speed, onSpeed, onClose, onQuit }: Props) {
  const [tab, setTab] = useState<'log' | 'help'>('log');
  const rounds = [...new Set(log.map((e) => e.round))].sort((a, b) => b - a);
  return (
    <div className="info-backdrop" onClick={onClose}>
      <div className="info log" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'log'} className={tab === 'log' ? 'on' : ''} onClick={() => setTab('log')}>
            Logboek
          </button>
          <button role="tab" aria-selected={tab === 'help'} className={tab === 'help' ? 'on' : ''} onClick={() => setTab('help')}>
            Spelregels
          </button>
        </div>
        {tab === 'help' ? (
          <div className="log-list">
            <Help />
          </div>
        ) : (
        <>
        <div className="seg small" role="group" aria-label="Snelheid bots">
          {(Object.keys(SPEED_LABEL) as Speed[]).map((k) => (
            <button key={k} className={speed === k ? 'on' : ''} aria-pressed={speed === k} onClick={() => onSpeed(k)}>
              {SPEED_LABEL[k]}
            </button>
          ))}
        </div>
        <div className="log-list">
          {log.length === 0 && <p className="empty">Nog geen zetten.</p>}
          {rounds.map((r) => (
            <section key={r}>
              <h3>Ronde {r}</h3>
              {log
                .filter((e) => e.round === r)
                .reverse()
                .map((e, i) => (
                  <p key={i} className="log-line">
                    <Icon size={14}>
                      <ShapeGlyph shape={PLAYERS[e.player]!.shape} size={10} fill={PLAYERS[e.player]!.color} />
                    </Icon>
                    <b>{state.players[e.player]!.name}</b> {e.text}
                  </p>
                ))}
            </section>
          ))}
        </div>
        </>
        )}
        <button className="btn" onClick={onClose}>
          Sluiten
        </button>
        <button className="btn ghost-dark" onClick={onQuit}>
          Stoppen met dit spel
        </button>
      </div>
    </div>
  );
}
