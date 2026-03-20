'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GRAPH_GENERAL } from '@/data/graphs';

type NS = Record<string, NodeState>;
type ES = Record<string, EdgeState>;
type Times = Record<string, string>; // e.g. "1/-" or "1/5"

interface DFSStep {
  ns: NS;
  es: ES;
  times: Times;
  path: string[];   // active call stack
  info: string;
  line: number;
}

// DFS on directed graph A→B,A→C,B→D,B→E,C→F,D→F  starting from A
// Adj order: A:[B,C], B:[D,E], C:[F], D:[F], E:[], F:[]
// Trace (times): A.d=1 B.d=2 D.d=3 F.d=4 F.f=5 D.f=6 E.d=7 E.f=8 B.f=9 C.d=10 C.f=11 A.f=12
// Edge types: A→B tree, A→C tree, B→D tree, B→E tree, D→F tree, C→F cross

const W = (
  ns: NS, es: ES,
  times: Times, path: string[],
  info: string, line: number
): DFSStep => ({ ns, es, times, path, info, line });

const STEPS: DFSStep[] = [
  // Step 0: Init
  W({ A:'white', B:'white', C:'white', D:'white', E:'white', F:'white' },
     {},
     { A:'-/-', B:'-/-', C:'-/-', D:'-/-', E:'-/-', F:'-/-' }, [],
     'אתחול: כל הצמתים לבן, time=0.',
     1),

  // Step 1: DFS-VISIT(A)
  W({ A:'current', B:'white', C:'white', D:'white', E:'white', F:'white' },
     {},
     { A:'1/-', B:'-/-', C:'-/-', D:'-/-', E:'-/-', F:'-/-' }, ['A'],
     'DFS-VISIT(A): A→אפור, d[A]=1, time=1. בדוק שכן B.',
     3),

  // Step 2: B is white → DFS-VISIT(B)
  W({ A:'gray',    B:'current', C:'white', D:'white', E:'white', F:'white' },
     { 'A->B':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'-/-', E:'-/-', F:'-/-' }, ['A','B'],
     'B לבן → DFS-VISIT(B): B→אפור, d[B]=2, time=2. קשת A→B: עץ.',
     5),

  // Step 3: DFS-VISIT(D)
  W({ A:'gray', B:'gray', C:'white', D:'current', E:'white', F:'white' },
     { 'A->B':'tree', 'B->D':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/-', E:'-/-', F:'-/-' }, ['A','B','D'],
     'D לבן → DFS-VISIT(D): D→אפור, d[D]=3, time=3. קשת B→D: עץ.',
     5),

  // Step 4: DFS-VISIT(F) from D
  W({ A:'gray', B:'gray', C:'white', D:'gray', E:'white', F:'current' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/-', E:'-/-', F:'4/-' }, ['A','B','D','F'],
     'F לבן → DFS-VISIT(F): F→אפור, d[F]=4, time=4. קשת D→F: עץ.',
     5),

  // Step 5: F has no adj → F done
  W({ A:'gray', B:'gray', C:'white', D:'gray', E:'white', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/-', E:'-/-', F:'4/5' }, ['A','B','D'],
     'F אין שכנים → F→שחור, f[F]=5, time=5. חזרה ל-D.',
     9),

  // Step 6: D has no more adj → D done
  W({ A:'gray', B:'gray', C:'white', D:'black', E:'white', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/6', E:'-/-', F:'4/5' }, ['A','B'],
     'D עיבד את כל שכניו → D→שחור, f[D]=6, time=6. חזרה ל-B.',
     9),

  // Step 7: DFS-VISIT(E) from B
  W({ A:'gray', B:'gray', C:'white', D:'black', E:'current', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/6', E:'7/-', F:'4/5' }, ['A','B','E'],
     'E לבן → DFS-VISIT(E): E→אפור, d[E]=7, time=7. קשת B→E: עץ.',
     5),

  // Step 8: E has no adj → E done
  W({ A:'gray', B:'gray', C:'white', D:'black', E:'black', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/6', E:'7/8', F:'4/5' }, ['A','B'],
     'E אין שכנים → E→שחור, f[E]=8, time=8. חזרה ל-B.',
     9),

  // Step 9: B done
  W({ A:'gray', B:'black', C:'white', D:'black', E:'black', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree' },
     { A:'1/-', B:'2/9', C:'-/-', D:'3/6', E:'7/8', F:'4/5' }, ['A'],
     'B עיבד את כל שכניו → B→שחור, f[B]=9, time=9. חזרה ל-A.',
     9),

  // Step 10: DFS-VISIT(C) from A
  W({ A:'gray', B:'black', C:'current', D:'black', E:'black', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree', 'A->C':'tree' },
     { A:'1/-', B:'2/9', C:'10/-', D:'3/6', E:'7/8', F:'4/5' }, ['A','C'],
     'C לבן → DFS-VISIT(C): C→אפור, d[C]=10, time=10. קשת A→C: עץ.',
     5),

  // Step 11: C visits F — F is already BLACK → cross edge
  W({ A:'gray', B:'black', C:'current', D:'black', E:'black', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree', 'A->C':'tree', 'C->F':'cross' },
     { A:'1/-', B:'2/9', C:'10/-', D:'3/6', E:'7/8', F:'4/5' }, ['A','C'],
     'F שחור (d[F]=4 < f[F]=5 < d[C]=10) → קשת C→F: חוצה (cross edge).',
     7),

  // Step 12: C done
  W({ A:'gray', B:'black', C:'black', D:'black', E:'black', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree', 'A->C':'tree', 'C->F':'cross' },
     { A:'1/-', B:'2/9', C:'10/11', D:'3/6', E:'7/8', F:'4/5' }, ['A'],
     'C עיבד את כל שכניו → C→שחור, f[C]=11, time=11. חזרה ל-A.',
     9),

  // Step 13: A done
  W({ A:'black', B:'black', C:'black', D:'black', E:'black', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree', 'A->C':'tree', 'C->F':'cross' },
     { A:'1/12', B:'2/9', C:'10/11', D:'3/6', E:'7/8', F:'4/5' }, [],
     '✓ DFS הסתיים! A→שחור, f[A]=12. עצי DFS: A→B→D→F, B→E, A→C. קשת חוצה: C→F.',
     9),
];

const EDGE_LEGEND = [
  { color: '#1D9E75', label: 'קשת עץ' },
  { color: '#5B9BD5', label: 'קשת חוצה' },
  { color: '#e03939', label: 'קשת אחורה' },
];

const NODE_FILL: Record<NodeState, string> = {
  white: '#4a4a6a', gray: '#EF9F27', current: '#7F77DD', black: '#1D9E75',
};

export default function DFSAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Graph */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: '#0a0a12', border: '1px solid var(--border)', padding: '12px 8px' }}
      >
        <GraphCanvas
          nodes={GRAPH_GENERAL.nodes}
          edges={GRAPH_GENERAL.edges}
          directed
          nodeStates={s.ns}
          edgeStates={s.es}
          nodeLabels={Object.fromEntries(
            Object.entries(s.times).map(([k, v]) => [k, v === '-/-' ? '' : v])
          )}
        />
      </div>

      {/* Info */}
      <div
        className="rounded-lg px-4 py-3 text-sm"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--accent-purple)',
          color: 'var(--text-primary)', minHeight: 48, lineHeight: 1.6,
        }}
      >
        <span style={{ color: 'var(--accent-purple)', fontWeight: 700, marginLeft: 6 }}>שלב {anim.step + 1}:</span>
        {s.info}
      </div>

      {/* Call stack + times */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="rounded-lg p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>מחסנית (call stack)</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', minHeight: 28 }}>
            {s.path.length === 0
              ? <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>ריקה</span>
              : s.path.map((n, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>→</span>}
                  <span style={{
                    background: i === s.path.length - 1 ? '#7F77DD28' : '#1a1a24',
                    border: `1px solid ${i === s.path.length - 1 ? '#7F77DD' : '#3a3a55'}`,
                    color: i === s.path.length - 1 ? '#c0bcff' : 'var(--text-primary)',
                    borderRadius: 4, padding: '2px 8px',
                    fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
                  }}>
                    {n}
                  </span>
                </span>
              ))
            }
          </div>
        </div>

        <div className="rounded-lg p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>זמנים d/f</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(s.times).map(([node, t]) => (
              <span key={node} style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--accent-purple)' }}>{node}</span>
                <span style={{ color: 'var(--text-secondary)' }}>[</span>
                {t}
                <span style={{ color: 'var(--text-secondary)' }}>]</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#4a4a6a', label: 'לא נגלה' },
          { color: '#EF9F27', label: 'אפור (gray)' },
          { color: '#7F77DD', label: 'מעובד כעת' },
          { color: '#1D9E75', label: 'שחור (done)' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
        {EDGE_LEGEND.map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <div style={{ width: 20, height: 2, background: color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>

      <AnimationControls
        step={anim.step} totalSteps={STEPS.length}
        playing={anim.playing} speed={anim.speed}
        canPrev={anim.canPrev} canNext={anim.canNext}
        onPrev={anim.prev} onNext={anim.next}
        onReset={anim.reset} onTogglePlay={anim.togglePlay}
        onSpeedChange={anim.setSpeed}
      />
    </div>
  );
}
