'use client';

import { AlgorithmMeta } from '@/types';
import { GROUP_COLORS, GROUP_LABELS } from '@/data/algorithms';

interface HeaderProps {
  alg: AlgorithmMeta;
}

export default function Header({ alg }: HeaderProps) {
  const color = GROUP_COLORS[alg.group];
  return (
    <header
      className="flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {alg.name}
        </h1>
        <span
          className="px-2 py-0.5 rounded text-xs font-semibold"
          style={{ background: `${color}22`, color }}
        >
          {GROUP_LABELS[alg.group]}
        </span>
      </div>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {alg.nameEn}
      </span>
    </header>
  );
}
