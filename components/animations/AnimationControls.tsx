'use client';

interface Props {
  step: number;
  totalSteps: number;
  playing: boolean;
  speed: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onTogglePlay: () => void;
  onSpeedChange: (s: number) => void;
}

const btn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  cursor: 'pointer', fontSize: 15,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default function AnimationControls({
  step, totalSteps, playing, speed,
  canPrev, canNext,
  onPrev, onNext, onReset, onTogglePlay, onSpeedChange,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Step counter + speed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
        <span>שלב {step + 1} / {totalSteps}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>מהירות</span>
          <input
            type="range" min="0.5" max="3" step="0.5" value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            style={{ width: 72, accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
          />
          <span style={{ minWidth: 24 }}>{speed}x</span>
        </div>
      </div>

      {/* Progress bar (clickable steps) */}
      <div style={{ width: '100%', height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%', borderRadius: 2,
            background: 'var(--accent-purple)',
            width: `${(step / Math.max(totalSteps - 1, 1)) * 100}%`,
            transition: 'width 0.2s',
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <button onClick={onReset} style={btn} title="איפוס">↺</button>
        <button
          onClick={onPrev} disabled={!canPrev}
          style={{ ...btn, opacity: canPrev ? 1 : 0.3, cursor: canPrev ? 'pointer' : 'default' }}
          title="שלב קודם"
        >
          ⏮
        </button>
        <button
          onClick={onTogglePlay}
          style={{ ...btn, width: 44, height: 44, background: 'var(--accent-purple)', border: 'none', color: '#fff', fontSize: 18 }}
          title={playing ? 'השהה' : 'הפעל'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button
          onClick={onNext} disabled={!canNext}
          style={{ ...btn, opacity: canNext ? 1 : 0.3, cursor: canNext ? 'pointer' : 'default' }}
          title="שלב הבא"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
