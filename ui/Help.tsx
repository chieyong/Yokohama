import { RESOURCES } from '../engine/src';
import { OFFICE_LINES } from './describe';
import { Icon, LocationGlyph, ResourceGlyph } from './icons';
import { RES, locColor } from './theme';

const Dot = ({ l }: { l: Parameters<typeof locColor>[0] }) => (
  <span className="loc-dot" style={{ background: locColor(l) }}>
    <Icon size={18}>
      <LocationGlyph l={l} fill="#f1e5c8" detail={locColor(l)} />
    </Icon>
  </span>
);

export function Help() {
  return (
    <div className="help">
      <h4>Doel</h4>
      <p>Na 10 rondes wint wie de meeste punten heeft. Punten krijg je vooral door contracten af te leveren; kantoren helpen met meerderheden en inkomsten.</p>

      <h4>Je beurt</h4>
      <ul>
        <li><b>Varen:</b> 1 of 2 stappen over het water. Niet eindigen waar je begon of bij een andere schuit.</li>
        <li><b>Eén actie</b> op die locatie: werken, een kantoor vestigen of rusten (+ƒ1).</li>
      </ul>

      <h4>Goederen</h4>
      <p>
        {RESOURCES.map((r) => (
          <span key={r} style={{ marginRight: 10, whiteSpace: 'nowrap' }}>
            <Icon size={18}>
              <ResourceGlyph r={r} fill={RES[r].color} />
            </Icon>{' '}
            {RES[r].label}
          </span>
        ))}
      </p>
      <p>Haal ze op in de vier havens (één per goed).</p>

      <h4><Dot l="beurs" /> Contracten</h4>
      <p>Neem een contract op de Beurs (max. 3 in je hand). Lever de goederen af aan de Wilhelminapier voor de punten op de kaart. Een contract dat je aan het eind nog hebt kost 2 punten.</p>

      <h4><Dot l="binnenrotte" /> Markt en <Dot l="veerhaven" /> ruilen</h4>
      <p>Binnenrotte: verkoop 1 of 2 goederen voor ƒ2 per stuk. Veerhaven: ruil 1 goed voor een ander soort.</p>

      <h4>Kantoren</h4>
      <ul>
        {OFFICE_LINES.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      <h4>Eindtelling</h4>
      <p>Contracten + meerderheden + 1 punt per ƒ3 − 2 per contract in je hand. Bij gelijkspel wint wie het meeste geld heeft.</p>
    </div>
  );
}
