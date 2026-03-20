import { useEffect, useState, useCallback } from 'react';

export function useAnimation(stepCount: number) {
  const [step, setStep]     = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed]   = useState(1);

  useEffect(() => {
    if (!playing) return;
    if (step >= stepCount - 1) { setPlaying(false); return; }
    const delay = 1300 / speed;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [playing, step, speed, stepCount]);

  const reset = useCallback(() => { setStep(0); setPlaying(false); }, []);

  return {
    step,
    playing,
    speed,
    canPrev: step > 0,
    canNext: step < stepCount - 1,
    prev:       () => setStep((s) => Math.max(0, s - 1)),
    next:       () => setStep((s) => Math.min(stepCount - 1, s + 1)),
    reset,
    togglePlay: () => setPlaying((p) => !p),
    setSpeed,
  };
}
