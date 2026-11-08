import { LOCATIONS, LOCATION_INFO, RESOURCES, finalScores, type GameState } from '../engine/src';
import { useSheetDrag } from './useSheetDrag';
import { Icon, LocationGlyph, ResourceGlyph, ShapeGlyph } from './icons';
import { ContractCard } from './pieces';
import { PLAYERS, RES, locColor } from './theme';

export function BottomSheet({ state, me, onInfo }: { state: GameState; me: number; onInfo?: (contract: string) => void }) {
  const sd = useSheetDrag();
  const open = sd.open;
  const p = state.players[me]!;
  const score = finalScores(state)[me]!;
  const c = PLAYERS[me]!;
  const myOffices = LOCATIONS.filter((l) => state.offices[l][me]! > 0);

  return (
    <section ref={sd.sheetRef} className={`sheet ${open ? 'open' : ''}`} style={sd.style} aria-label="Jouw voorraad">
      <div className="sheet-head" {...sd.handlers}>
      <div className="sheet-handle" role="button" aria-expanded={open} aria-label={open ? 'Inklappen' : 'Uitklappen'}>
        <span className="grip" />
      </div>

      <div className="peek">
        {RESOURCES.map((r) => (
          <div key={r} className={`chip res ${p.resources[r] ? '' : 'zero'}`} aria-label={`${RES[r].label}: ${p.resources[r]}`}>
            <Icon size={24}>
              <ResourceGlyph r={r} fill={RES[r].color} />
            </Icon>
            <b>{p.resources[r]}</b>
          </div>
        ))}
        <div className="chip" aria-label={`Gulden: ${p.gulden}`}>
          <span className="florin">ƒ</span>
          <b>{p.gulden}</b>
        </div>
        <div className="chip" aria-label={`Kantoren over: ${p.officesLeft}`}>
          <Icon size={22}>
            <path d="M-9 -2 L0 -11 L9 -2 V10 H-9Z" fill={c.color} stroke="#3a2817" strokeWidth="1.2" />
            <g transform="translate(0 3)">
              <ShapeGlyph shape={c.shape} size={4} fill="#f1e6cc" />
            </g>
          </Icon>
          <b>{p.officesLeft}</b>
        </div>
      </div>
      </div>

      <div className="sheet-body">
        <h3>
          Jouw stand nu <small>(als het spel nu zou eindigen)</small>
        </h3>
        <table className="mini-score">
          <tbody>
            <tr><td>Contracten</td><td>{score.contracts}</td></tr>
            <tr><td>Kantoren</td><td>{score.offices}</td></tr>
            <tr><td>Meerderheden</td><td>{score.majorities}</td></tr>
            <tr><td>Geld (ƒ3 = 1)</td><td>{score.money}</td></tr>
            <tr><td>Contracten nog in hand</td><td>{score.penalty}</td></tr>
            <tr className="total"><td>Totaal</td><td>{score.total}</td></tr>
          </tbody>
        </table>

        <h3>Contracten in je hand <small>({p.hand.length}/3)</small></h3>
        <div className="cards">
          {p.hand.length ? p.hand.map((id) => (
                <button key={id} className="card-btn" onClick={() => onInfo?.(id)} aria-label="Uitleg contract">
                  <ContractCard id={id} width={104} />
                </button>
              )) : <p className="empty">Geen contracten</p>}
        </div>

        <h3>Afgeleverd <small>({p.delivered.length})</small></h3>
        <div className="cards">
          {p.delivered.length ? p.delivered.map((id) => <ContractCard key={id} id={id} width={80} />) : <p className="empty">Nog niets afgeleverd</p>}
        </div>

        <h3>Jouw kantoren</h3>
        <ul className="offices">
          {myOffices.length ? (
            myOffices.map((l) => (
              <li key={l}>
                <span className="loc-dot" style={{ background: locColor(l) }}>
                  <Icon size={18}>
                    <LocationGlyph l={l} fill="#f1e6cc" />
                  </Icon>
                </span>
                {LOCATION_INFO[l].name} <b>×{state.offices[l][me]}</b>
              </li>
            ))
          ) : (
            <li className="empty">Nog geen kantoren</li>
          )}
        </ul>
      </div>
    </section>
  );
}
