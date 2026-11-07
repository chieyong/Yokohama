import { useState } from 'react';
import { Icon, ShapeGlyph } from './icons';
import { PLAYERS } from './theme';

export function StartScreen({ onStart, canResume, onResume }: { onStart: (bots: number) => void; canResume?: boolean; onResume?: () => void }) {
  const [bots, setBots] = useState(2);
  return (
    <div className="start">
      <div className="start-card">
        <h1>Rotterdam</h1>
        <p className="sub">Een havenspel voor 2–4 spelers</p>
        <h3>Tegenstanders</h3>
        <div className="seg">
          {[1, 2, 3].map((n) => (
            <button key={n} className={bots === n ? 'on' : ''} onClick={() => setBots(n)} aria-pressed={bots === n}>
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
        <button className="btn primary wide" onClick={() => onStart(bots)}>
          Nieuw spel
        </button>
        {canResume && (
          <button className="btn ghost wide" onClick={onResume}>
            Verder spelen
          </button>
        )}
      </div>
    </div>
  );
}
