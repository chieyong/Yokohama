import { useMemo } from 'react';
import { Board } from './Board';
import { BottomSheet } from './BottomSheet';
import { TopBar } from './TopBar';
import { demoState } from './demo';

export function App() {
  const state = useMemo(() => {
    const q = new URLSearchParams(location.search);
    return demoState(Number(q.get('moves') ?? 30), Number(q.get('seed') ?? 2026));
  }, []);
  return (
    <div className="app">
      <TopBar state={state} />
      <Board state={state} />
      <BottomSheet state={state} me={0} />
    </div>
  );
}
