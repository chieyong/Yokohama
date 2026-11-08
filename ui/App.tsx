import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NEIGHBOURS, applyMove, createGame, isGameOver, legalMoves,
  type GameState, type LocationId, type Move,
} from '../engine/src';
import type { BotLevel } from '../bots';
import { ActionTray } from './ActionTray';
import { Board, type Tap } from './Board';
import { BottomSheet } from './BottomSheet';
import { EndScreen } from './EndScreen';
import { InfoSheet, type Info } from './InfoSheet';
import { LogSheet, type LogEntry } from './LogSheet';
import { StartScreen } from './StartScreen';
import { StatusPanel } from './StatusPanel';
import { TopBar } from './TopBar';
import { computeBotTurn } from './botRunner';
import { demoState } from './demo';
import { haptic } from './haptics';
import { actionText, turnText } from './logText';
import { TIMING, loadSettings, saveSettings, type Settings, type Speed } from './settings';

const HUMAN = 0;
const NAMES = ['Jij', 'Anna', 'Bram', 'Cor'];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function newGame(st: Settings): GameState {
  return createGame({
    seed: Math.floor(Math.random() * 2 ** 31),
    players: NAMES.slice(0, st.bots + 1).map((name, i) => ({ name, kind: i === HUMAN ? 'human' : st.level })),
  });
}

/** Route over het water: 1 of 2 stappen. */
function sailPath(from: LocationId, to: LocationId): LocationId[] {
  if (NEIGHBOURS[from].includes(to)) return [to];
  const mid = NEIGHBOURS[from].find((m) => NEIGHBOURS[m].includes(to));
  return mid ? [mid, to] : [to];
}

interface Toast {
  player: number;
  text: string;
}

export function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [game, setGame] = useState<GameState | null>(() =>
    new URLSearchParams(location.search).has('demo') ? demoState() : null,
  );
  const [draft, setDraft] = useState<Move[]>([]);
  const [pending, setPending] = useState<Move | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);
  // Bot-animatie
  const [botView, setBotView] = useState<GameState | null>(null);
  const [boatAt, setBoatAt] = useState<{ player: number; loc: LocationId } | undefined>();
  const [focus, setFocus] = useState<LocationId | undefined>();
  const [toast, setToast] = useState<Toast | null>(null);
  const botRng = useRef(Math.floor(Math.random() * 2 ** 31));
  const speedRef = useRef<Speed>(settings.speed);
  speedRef.current = settings.speed;

  const updateSettings = (s: Settings) => {
    setSettings(s);
    saveSettings(s);
  };

  const view = useMemo(() => (game ? draft.reduce(applyMove, game) : null), [game, draft]);
  const myTurn = !!game && game.current === HUMAN && !isGameOver(game);
  const targets: LocationId[] | undefined = myTurn
    ? legalMoves(game!).flatMap((m) => (m.type === 'move' ? [m.to] : []))
    : undefined;
  const selected = myTurn ? (draft[0]?.type === 'move' ? draft[0].to : undefined) : focus;

  // ---------- botbeurten ----------
  useEffect(() => {
    if (!game || isGameOver(game) || game.current === HUMAN) return;
    let cancelled = false;
    (async () => {
      const who = game.current;
      const level = game.players[who]!.kind as BotLevel;
      if (level === 'hard' && speedRef.current !== 'instant') setToast({ player: who, text: 'denkt na…' });
      const seed = (botRng.current = (botRng.current * 1103515245 + 12345) >>> 0);
      const [t0] = await Promise.all([computeBotTurn(game, level, seed), sleep(speedRef.current === 'instant' ? 0 : 250)]);
      if (cancelled) return;
      const moves = t0;
      const [sail, action] = moves as [Move, Move];
      const afterSail = applyMove(game, sail);
      const after = applyMove(afterSail, action);
      const t = TIMING[speedRef.current];

      if (t.step > 0) {
        setToast(null);
        if (sail.type === 'move') {
          const path = sailPath(game.players[who]!.boat, sail.to);
          if (path.length === 2) {
            setBoatAt({ player: who, loc: path[0]! });
            await sleep(t.step);
            if (cancelled) return;
            setBoatAt(undefined);
          }
        }
        setBotView(afterSail);
        await sleep(t.step);
        if (cancelled) return;
        setFocus(afterSail.players[who]!.boat);
        setToast({ player: who, text: actionText(afterSail, action) });
        haptic();
        await sleep(t.action);
        if (cancelled) return;
      }
      setLog((l) => [...l, { round: game.round, player: who, text: turnText(game, moves, after) }]);
      setBotView(null);
      setFocus(undefined);
      setToast(null);
      setGame(after);
    })();
    return () => {
      cancelled = true;
    };
  }, [game]);

  if (!game || !view) {
    return (
      <StartScreen
        initial={settings}
        onStart={(st) => {
          updateSettings(st);
          setLog([]);
          setGame(newGame(st));
        }}
      />
    );
  }

  const shown = botView ?? view;

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
    const after = applyMove(view, pending);
    const sail = draft[0] ?? { type: 'stay' as const };
    setLog((l) => [...l, { round: game.round, player: HUMAN, text: turnText(game, [sail, pending], after) }]);
    setGame(after);
    setDraft([]);
    setPending(null);
  };

  const quit = () => {
    setShowLog(false);
    setGame(null);
    setDraft([]);
    setPending(null);
  };

  return (
    <div className={`app ${myTurn ? 'my-turn' : ''}`}>
      <TopBar state={shown} onLog={() => setShowLog(true)} />
      <Board
        state={shown}
        targets={targets}
        selected={selected}
        origin={game.players[HUMAN]!.boat}
        boatAt={boatAt}
        boatMs={TIMING[settings.speed].step}
        onTap={onTap}
      />
      <BottomSheet
        state={shown}
        me={HUMAN}
        onInfo={(id) => setInfo({ kind: 'contract', id })}
        context={
          myTurn ? (
            <ActionTray
              s={view}
              pending={pending}
              canUndo={!!pending || draft.length > 0}
              onPick={pick}
              onUndo={undo}
              onConfirm={confirm}
              onInfo={() => setInfo({ kind: 'loc', id: view.players[HUMAN]!.boat })}
            />
          ) : isGameOver(game) ? (
            <StatusPanel text="Het spel is afgelopen." />
          ) : (
            <StatusPanel
              player={toast?.player ?? game.current}
              name={game.players[toast?.player ?? game.current]!.name}
              text={toast?.text ?? 'is aan zet…'}
              onLog={() => setShowLog(true)}
            />
          )
        }
      />
      {info && <InfoSheet info={info} state={view} me={HUMAN} onClose={() => setInfo(null)} />}
      {showLog && (
        <LogSheet
          log={log}
          state={game}
          speed={settings.speed}
          onSpeed={(sp) => updateSettings({ ...settings, speed: sp })}
          onClose={() => setShowLog(false)}
          onQuit={quit}
        />
      )}
      {isGameOver(game) && <EndScreen state={game} onNew={() => setGame(null)} />}
    </div>
  );
}
