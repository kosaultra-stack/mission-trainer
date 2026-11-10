import { useState } from 'react';
import { IS_DEMO } from './ui/engine';
import { HowToPlay } from './ui/overlays/HowToPlay';
import { GameScreen } from './ui/screens/GameScreen';
import { TitleScreen } from './ui/screens/TitleScreen';

export default function App() {
  const [screen, setScreen] = useState<'title' | 'game'>('title');
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="stars pointer-events-none fixed inset-0" aria-hidden />
      <div className="stars-big anim-twinkle pointer-events-none fixed inset-0" aria-hidden />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,41,59,.7),transparent_65%)]" aria-hidden />

      {screen === 'title' ? (
        <TitleScreen isDemo={IS_DEMO} onStart={() => setScreen('game')} onHelp={() => setHelpOpen(true)} />
      ) : (
        <GameScreen onHome={() => setScreen('title')} />
      )}
      {helpOpen && <HowToPlay onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
