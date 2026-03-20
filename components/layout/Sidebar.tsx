'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  ALGORITHMS_BY_GROUP,
  GROUP_COLORS,
  GROUP_LABELS,
  GROUP_ORDER,
} from '@/data/algorithms';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Sidebar() {
  const params = useParams();
  const pathname = usePathname();
  const current = params?.algorithm as string | undefined;

  return (
    <aside
      className="h-screen overflow-y-auto flex flex-col"
      style={{
        width: 280,
        minWidth: 280,
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="px-5 py-4 text-lg font-bold tracking-wide block"
        style={{
          borderBottom: '1px solid var(--border)', color: 'var(--accent-purple)',
          textDecoration: 'none',
          background: pathname === '/' ? '#7F77DD12' : 'transparent',
        }}
      >
        636017 — אלגוריתמים
      </Link>

      <nav className="flex-1 py-3 overflow-y-auto">
        {GROUP_ORDER.map((group) => {
          const algs = ALGORITHMS_BY_GROUP[group] ?? [];
          const color = GROUP_COLORS[group];
          return (
            <div key={group} className="mb-2">
              {/* Group header */}
              <div
                className="px-5 py-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                {GROUP_LABELS[group]}
              </div>
              {algs.map((alg) => {
                const isActive = alg.slug === current;
                return (
                  <Link
                    key={alg.slug}
                    href={`/${alg.slug}`}
                    className="flex items-center px-5 py-2 text-sm transition-colors"
                    style={{
                      color: isActive ? color : 'var(--text-primary)',
                      background: isActive ? `${color}18` : 'transparent',
                      borderRight: isActive ? `3px solid ${color}` : '3px solid transparent',
                    }}
                  >
                    {alg.name}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Tools section */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 0 12px' }}>
        <div className="px-5 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: '#5B9BD5' }}>
          כלים
        </div>
        <ThemeToggle />
        <Link
          href="/exam"
          className="flex items-center px-5 py-2 text-sm transition-colors gap-2"
          style={{
            color: pathname === '/exam' ? '#5B9BD5' : 'var(--text-primary)',
            background: pathname === '/exam' ? '#5B9BD518' : 'transparent',
            borderRight: pathname === '/exam' ? '3px solid #5B9BD5' : '3px solid transparent',
          }}
        >
          <span style={{ fontSize: 15 }}>📝</span>
          מחולל מבחן
        </Link>
      </div>
    </aside>
  );
}
