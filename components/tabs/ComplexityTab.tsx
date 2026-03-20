'use client';

import { AlgorithmContent } from '@/types';

// Rough O-notation sizes for visual bar (log scale feel)
const O_SIZES: Record<string, number> = {
  'O(1)': 2,
  'O(log n)': 8,
  'O(n)': 15,
  'O(V)': 15,
  'O(V+E)': 22,
  'O(n log n)': 30,
  'O(E log E)': 30,
  'O(E log V)': 30,
  'O(V²)': 45,
  'O(VE)': 55,
  'O(V³)': 80,
  'O(VE²)': 95,
};

const ALL_ALGORITHMS = [
  { name: 'BFS',           time: 'O(V+E)',    space: 'O(V)' },
  { name: 'DFS',           time: 'O(V+E)',    space: 'O(V)' },
  { name: 'מיון טופולוגי', time: 'O(V+E)',    space: 'O(V)' },
  { name: 'SCC',           time: 'O(V+E)',    space: 'O(V)' },
  { name: 'Kruskal',       time: 'O(E log E)',space: 'O(V)' },
  { name: 'Prim',          time: 'O(E log V)',space: 'O(V)' },
  { name: 'Dijkstra',      time: 'O(E log V)',space: 'O(V)' },
  { name: 'Bellman-Ford',  time: 'O(VE)',     space: 'O(V)' },
  { name: 'Floyd-Warshall',time: 'O(V³)',     space: 'O(V²)' },
  { name: 'Huffman',       time: 'O(n log n)',space: 'O(n)' },
  { name: 'Ford-Fulkerson',time: 'O(E·|f*|)', space: 'O(V)' },
  { name: 'Edmonds-Karp',  time: 'O(VE²)',    space: 'O(V)' },
];

function ComplexityBar({ label }: { label: string }) {
  const pct = O_SIZES[label] ?? 20;
  return (
    <div className="flex items-center gap-3">
      <span
        className="font-mono text-sm"
        style={{ color: 'var(--accent-gold)', minWidth: 100, direction: 'ltr' }}
      >
        {label}
      </span>
      <div className="flex-1 rounded-full h-2" style={{ background: 'var(--border)' }}>
        <div
          className="h-2 rounded-full"
          style={{
            width: `${pct}%`,
            background: pct < 25 ? 'var(--accent-green)' : pct < 50 ? 'var(--accent-gold)' : '#e03939',
          }}
        />
      </div>
    </div>
  );
}

interface Props { content: AlgorithmContent; }

export default function ComplexityTab({ content }: Props) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* This algorithm */}
      <section
        className="rounded-lg p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--accent-purple)' }}>
          סיבוכיות — {content.title}
        </h2>
        <div className="space-y-3">
          <div>
            <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>זמן ריצה</div>
            <ComplexityBar label={content.timeComplexity} />
          </div>
          <div>
            <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>מקום</div>
            <ComplexityBar label={content.spaceComplexity} />
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="px-5 py-3 text-sm font-semibold"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', color: 'var(--accent-purple)' }}
        >
          השוואת כל האלגוריתמים
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0d0d17' }}>
              {['אלגוריתם', 'זמן', 'מקום'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-right text-xs font-semibold"
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_ALGORITHMS.map((row, i) => {
              const isThis = row.name === content.title;
              return (
                <tr
                  key={i}
                  style={{
                    background: isThis ? 'var(--accent-purple)18' : i % 2 === 0 ? 'var(--bg-card)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <td
                    className="px-4 py-2 text-sm font-medium"
                    style={{ color: isThis ? 'var(--accent-purple)' : 'var(--text-primary)' }}
                  >
                    {row.name} {isThis && '◀'}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--accent-gold)', direction: 'ltr' }}>{row.time}</td>
                  <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--accent-green)', direction: 'ltr' }}>{row.space}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
