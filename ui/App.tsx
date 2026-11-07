import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { applyMove, createGame, isGameOver, legalMoves, type GameState, type LocationId, type Move } from '../engine/src';
import { chooseGreedy } from '../bots/greedy';
import { ActionTray } from './ActionTray';
import { Board, type Tap } from './Board';
import { BottomSheet } from './BottomSheet';
import { EndScreen } from './EndScreen';
import { InfoSheet, type Info } from './InfoSheet';
import { StartScreen } from './StartScreen';
import { TopBar } from './TopBar';
import { demoState } from './demo';
import { haptic } from './haptics';

const HUMAN = 0;
const NAMES = ['Jij', 'Anna', 'Bram', 'Cor'];
const BOT_DELAY = 450;

function newGame(bots: number): GameState {
  return createGame({
    seed: Math.floor(Math.random() * 2 ** 31),
    players: NAMES.slice(0, bots + 1).map((name, i) => ({ name, kind: i === HUMAN ? 'human' : 'normal' })),
  });
}

export function App() {
  const [game, setGame] = useState<GameState | null>(() =>
    new URLSearchParams(location.search).has('demo') ? demoState() : null,
  );
  const [draft, setDraft] = useState<Move[]>([]);
  const [pending, setPending] = useState<Move | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const botRng = useRef(12345);

  const view = useMemo(() => (game ? draft.reduce(applyMove, game) : null), [game, draft]);
  const myTurn = !!game && game.current === HUMAN && !isGameOver(game);
  const targets: LocationId[] | undefined = myTurn
    ? legalMoves(game!).flatMap((m) => (m.type === 'move' ? [m.to] : []))
    : undefined;
  const selected = draft[0]?.type === 'move' ? draft[0].to : undefined;

  // Bots spelen hun beurt (stap 5: animaties, log en niveaus).
  useEffect(() => {
    if (!game || isGameOver(game) || game.current === HUMAN) return;
    const t = setTimeout(() => {
      let s = game;
      const who = s.current;
      while (s.current === who && !isGameOver(s)) {
        let m: Move;
        [m, botRng.current] = chooseGreedy(s, botRng.current);
        s = applyMove(s, m);
      }
      setGame(s);
    }, BOT_DELAY);
    return () => clearTimeout(t);
  }, [game]);

  // Hoogte van de actiebalk doorgeven aan de layout.
  const trayRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = trayRef.current;
    const set = (h: number) => document.documentElement.style.setProperty('--tray-h', `${h}px`);
    if (!el) return set(0);
    const ro = new ResizeObserver(() => set(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [myTurn]);

  if (!game || !view) {
    return (
      <StartScreen
        onStart={(bots) => {
          botRng.current = Math.floor(Math.random() * 2 ** 31);
          setGame(newGame(bots));
        }}
      />
    );
  }

  const onTap = (t: Tap) => {
    if (t.kind === 'loc' && targets?.includes(t.id)) {
      haptic();
      setDraft([{ type: 'move', to: t.id }]);
      setPending(null);
      return;
    }
    if (t.kind === 'contract' && myTurn && view.phase === 'action') {
      const m = legalMoves(view).find((x) => x.type === 'takeContract' && x.contract === t.id);
      if (m) {
        haptic();
        setPending(m);
        return;
      }
    }
    setInfo(t);
  };

  const pick = (m: Move) => {
    haptic();
    if (m.type === 'stay' || m.type === 'move') {
      setDraft([m]);
      setPending(null);
    } else setPending(m);
  };

  const undo = () => {
    haptic();
    if (pending) setPending(null);
    else setDraft(draft.slice(0, -1));
  };

  const confirm = () => {
    if (!pending) return;
    haptic();
    setGame(applyMove(view, pending));
    setDraft([]);
    setPending(null);
  };

  return (
    <div className={`app ${myTurn ? 'my-turn' : ''}`}>
      <TopBar state={view} />
      <Board state={view} targets={targets} selected={selected} origin={game.players[HUMAN]!.boat} onTap={onTap} />
      {myTurn && (
        <div ref={trayRef} className="tray-wrap">
          <ActionTray s={view} pending={pending} canUndo={!!pending || draft.length > 0} onPick={pick} onUndo={undo} onConfirm={confirm} />
        </div>
      )}
      <BottomSheet state={view} me={HUMAN} onInfo={(id) => setInfo({ kind: 'contract', id })} />
      {info && <InfoSheet info={info} state={view} me={HUMAN} onClose={() => setInfo(null)} />}
      {isGameOver(game) && <EndScreen state={game} onNew={() => setGame(null)} />}
    </div>
  );
}
