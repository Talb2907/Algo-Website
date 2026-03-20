'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GNode, GEdge } from '@/data/graphs';

type NS = Record<string, NodeState>;
type ES = Record<string, EdgeState>;
type Val = number | '∞';

interface OpenEntry { node: string; f: number; }

interface Step {
  ns: NS; es: ES;
  g: Record<string, Val>;
  f: Record<string, Val>;
  openSet: OpenEntry[];
  closedSet: string[];
  path: string[];
  info: string;
}

const mk = (
  ns: NS, es: ES,
  g: Record<string, Val>, f: Record<string, Val>,
  openSet: OpenEntry[], closedSet: string[],
  path: string[], info: string
): Step => ({ ns, es, g, f, openSet, closedSet, path, info });

// Graph: S→A:2, S→B:5, A→C:4, B→C:2, C→T:3, A→T:10
const ASTAR_NODES: GNode[] = [
  { id: 'S', x: 70,  y: 130 },
  { id: 'A', x: 230, y: 60  },
  { id: 'B', x: 230, y: 200 },
  { id: 'C', x: 390, y: 130 },
  { id: 'T', x: 520, y: 130 },
];

const ASTAR_EDGES: GEdge[] = [
  { from: 'S', to: 'A', weight: 2  },
  { from: 'S', to: 'B', weight: 5  },
  { from: 'A', to: 'C', weight: 4  },
  { from: 'A', to: 'T', weight: 10 },
  { from: 'B', to: 'C', weight: 2  },
  { from: 'C', to: 'T', weight: 3  },
];

// Heuristic h(n) = straight-line estimate to T
const H: Record<string, number> = { S:8, A:5, B:6, C:3, T:0 };

const W: NS = { S:'white', A:'white', B:'white', C:'white', T:'white' };
const INF = '∞';
const G0 = { S:INF as Val, A:INF as Val, B:INF as Val, C:INF as Val, T:INF as Val };
const F0 = { S:INF as Val, A:INF as Val, B:INF as Val, C:INF as Val, T:INF as Val };
const NODES = ['S','A','B','C','T'];

const STEPS: Step[] = [
  mk(W, {},
    G0, F0, [], [], [],
    'A*: f(n)=g(n)+h(n). g(n)=עלות ממקור, h(n)=הערכת מרחק ליעד. תמיד הוצא את הצומת עם f מינימלי.'),

  mk({ ...W, S:'current' }, {},
    { ...G0, S:0 }, { ...F0, S:8 },
    [{ node:'S', f:8 }], [], [],
    'אתחול: g[S]=0, f[S]=g[S]+h[S]=0+8=8. הכנס S לרשימה הפתוחה.'),

  mk({ ...W, S:'black', A:'gray', B:'gray' },
    { 'S->A':'active', 'S->B':'active' },
    { ...G0, S:0, A:2, B:5 },
    { ...F0, S:8, A:7, B:11 },
    [{ node:'A', f:7 }, { node:'B', f:11 }], ['S'], [],
    'הוצא S (f=8). הרחב: g[A]=0+2=2, f[A]=2+5=7. g[B]=0+5=5, f[B]=5+6=11. Open={A(7),B(11)}.'),

  mk({ ...W, S:'black', A:'current', B:'gray', C:'gray', T:'gray' },
    { 'S->A':'tree', 'A->C':'active', 'A->T':'active' },
    { ...G0, S:0, A:2, B:5, C:6, T:12 },
    { ...F0, S:8, A:7, B:11, C:9, T:12 },
    [{ node:'C', f:9 }, { node:'B', f:11 }, { node:'T', f:12 }], ['S','A'], [],
    'הוצא A (f=7, מינימלי). הרחב: g[C]=2+4=6, f[C]=6+3=9. g[T]=2+10=12, f[T]=12. Open={C(9),B(11),T(12)}.'),

  mk({ ...W, S:'black', A:'black', B:'gray', C:'current', T:'gray' },
    { 'S->A':'tree', 'A->C':'tree', 'C->T':'active' },
    { ...G0, S:0, A:2, B:5, C:6, T:9 },
    { ...F0, S:8, A:7, B:11, C:9, T:9 },
    [{ node:'T', f:9 }, { node:'B', f:11 }], ['S','A','C'], [],
    'הוצא C (f=9). הרחב C→T: g[T]=6+3=9 < 12 → עדכון! f[T]=9+0=9. Open={T(9),B(11)}.'),

  mk({ S:'black', A:'black', B:'gray', C:'black', T:'current' },
    { 'S->A':'tree', 'A->C':'tree', 'C->T':'tree' },
    { ...G0, S:0, A:2, B:5, C:6, T:9 },
    { ...F0, S:8, A:7, B:11, C:9, T:9 },
    [{ node:'T', f:9 }], ['S','A','C','T'],
    ['S','A','C','T'],
    '✓ הוצא T (f=9) — הגענו ליעד! נתיב: S→A→C→T, עלות=9. B נשאר ב-open אך T כבר נמצא!'),
];

export default function AStarAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];
  const isDone = anim.step === STEPS.length - 1;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Heuristic legend */}
      <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
          h(n) — פונקציית הנחיה (קבועה, הערכה ליעד T)
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {NODES.map(n => (
            <div key={n} style={{ textAlign:'center' }}>
              <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:'monospace' }}>{n}</div>
              <div style={{ fontSize:13, fontFamily:'monospace', fontWeight:700, color:'#5B9BD5' }}>
                {H[n]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div className="rounded-lg" style={{ background:'#0a0a12', border:`1px solid ${isDone ? 'var(--accent-green)' : 'var(--border)'}`, padding:'10px 8px' }}>
        <GraphCanvas
          nodes={ASTAR_NODES} edges={ASTAR_EDGES}
          directed nodeStates={s.ns} edgeStates={s.es}
          nodeLabels={Object.fromEntries(
            NODES.map(n => [n, s.f[n] === INF ? '' : `f=${s.f[n]}`])
          )}
        />
        {isDone && (
          <div style={{ padding:'4px 10px', borderTop:'1px solid var(--accent-green)',
            fontSize:13, fontFamily:'monospace', color:'var(--accent-green)', fontWeight:700 }}>
            נתיב: S → A → C → T &nbsp;|&nbsp; עלות: 9
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-purple)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-purple)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Open set */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
            רשימה פתוחה (open) — ממוין לפי f
          </div>
          {s.openSet.length === 0
            ? <span style={{ fontSize:12, color:'var(--text-secondary)' }}>ריקה</span>
            : <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                {s.openSet.map((e, i) => (
                  <div key={e.node} style={{
                    display:'flex', justifyContent:'space-between',
                    padding:'3px 8px', borderRadius:4, fontSize:12, fontFamily:'monospace',
                    background: i===0 ? '#7F77DD20' : 'transparent',
                    border: `1px solid ${i===0 ? 'var(--accent-purple)' : 'var(--border)'}`,
                  }}>
                    <span style={{ color: i===0 ? 'var(--accent-purple)' : 'var(--text-primary)', fontWeight:700 }}>{e.node}</span>
                    <span style={{ color:'var(--accent-gold)' }}>f={e.f}</span>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* g and f values */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
            g[v] / f[v] לכל צומת
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            {NODES.map(n => (
              <div key={n} style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontFamily:'monospace' }}>
                <span style={{ color:'var(--text-secondary)' }}>{n}:</span>
                <span>
                  <span style={{ color:'var(--accent-gold)' }}>g={s.g[n]}</span>
                  <span style={{ color:'var(--text-secondary)', margin:'0 4px' }}>+</span>
                  <span style={{ color:'#5B9BD5' }}>h={H[n]}</span>
                  <span style={{ color:'var(--text-secondary)', margin:'0 4px' }}>=</span>
                  <span style={{ color: s.f[n]===INF ? 'var(--text-secondary)' : 'var(--accent-purple)', fontWeight:700 }}>
                    f={s.f[n]}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'8px 12px', borderRadius:8, fontSize:12,
        background:'#5B9BD518', border:'1px solid #5B9BD5', color:'var(--text-primary)' }}>
        <span style={{ fontWeight:700, color:'#5B9BD5' }}>קבילות: </span>
        A* אופטימלי אם h(n) ≤ מרחק אמיתי ליעד (heuristic קבילה). כאן h מבטיח קיצור דרך ב-3 שלבים במקום 5 (כמו Dijkstra).
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
