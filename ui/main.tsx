import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

// iOS: voorkom de eigen pinch-zoom van Safari; wij zoomen zelf op het bord.
document.addEventListener('gesturestart', (e) => e.preventDefault());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
