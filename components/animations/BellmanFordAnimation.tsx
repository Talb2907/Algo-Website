'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GRAPH_WEIGHTED } from '@/data/graphs';

type NS  = Record<string, NodeState>;
type ES  = Record<string, EdgeState>;
type Dst = Record<string, number | '∞'>;

interface Step {
  ns: NS; es: ES;
  dist: Dst;
  sweep: number;
  activeEdge: string;
  info: string;
}

const INF = '∞';

const mk = (
  ns: NS, es: ES,
  dist: Dst, sweep: number,
  activeEdge: string, info: string
): Step => ({ ns, es, dist, sweep, activeEdge, info });

const W: NS = { S:'black', A:'white', B:'white', C:'white', D:'white', T:'white' };

const STEPS: Step[] = [
  mk({ S:'black', A:'white', B:'white', C:'white', D:'white', T:'white' }, {},
     { S:0, A:INF, B:INF, C:INF, D:INF, T:INF }, 0, '',
     'אתחול: d[s]=0, d[v]=∞ לכל שאר. |V|-1=5 sweeps נדרשים.'),

  // Sweep 1 — S edges
  mk(W, { 'S->A':'active' },
     { S:0, A:4, B:INF, C:INF, D:INF, T:INF }, 1, 'S->A',
     'Sweep 1: RELAX(S,A,4): d[A] = min(∞, 0+4) = 4 ✓'),

  mk(W, { 'S->A':'tree', 'S->B':'active' },
     { S:0, A:4, B:2, C:INF, D:INF, T:INF }, 1, 'S->B',
     'Sweep 1: RELAX(S,B,2): d[B] = min(∞, 0+2) = 2 ✓'),

  mk(W, { 'S->A':'tree', 'S->B':'tree', 'A->B':'active' },
     { S:0, A:3, B:2, C:INF, D:INF, T:INF }, 1, 'A->B',
     'Sweep 1: RELAX(B,A,1): d[A] = min(4, 2+1) = 3 ✓ עדכון! π[A]←B  (Bellman-Ford עובד גם כשמעדכנים מ-B שכבר עודכן)'),

  mk(W, { 'S->B':'tree', 'A->B':'tree', 'A->C':'active' },
     { S:0, A:3, B:2, C:8, D:INF, T:INF }, 1, 'A->C',
     'Sweep 1: RELAX(A,C,5): d[C] = min(∞, 3+5) = 8 ✓'),

  mk(W, { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->C':'active' },
     { S:0, A:3, B:2, C:8, D:INF, T:INF }, 1, 'B->C',
     'Sweep 1: RELAX(B,C,8): d[C] = min(8, 2+8) = 8 — אין שיפור'),

  mk(W, { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'active' },
     { S:0, A:3, B:2, C:8, D:12, T:INF }, 1, 'B->D',
     'Sweep 1: RELAX(B,D,10): d[D] = min(∞, 2+10) = 12 ✓'),

  mk(W, { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->T':'active' },
     { S:0, A:3, B:2, C:8, D:12, T:10 }, 1, 'C->T',
     'Sweep 1: RELAX(C,T,2): d[T] = min(∞, 8+2) = 10 ✓'),

  mk(W, { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->T':'tree', 'D->T':'active' },
     { S:0, A:3, B:2, C:8, D:12, T:10 }, 1, 'D->T',
     'Sweep 1: RELAX(D,T,3): d[T] = min(10, 12+3) = 10 — אין שיפור. סיום sweep 1.'),

  // Sweep 2 — no changes
  mk({ S:'black', A:'black', B:'black', C:'black', D:'black', T:'black' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->T':'tree' },
     { S:0, A:3, B:2, C:8, D:12, T:10 }, 2, '',
     'Sweep 2: בדיקת כל הקשתות — אין שיפור בשום d[v]. האלגוריתם יכול לעצור מוקדם!'),

  // Negative cycle check
  mk({ S:'black', A:'black', B:'black', C:'black', D:'black', T:'black' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->T':'tree' },
     { S:0, A:3, B:2, C:8, D:12, T:10 }, 5, '',
     'בדיקת מעגלים שליליים (sweep נוסף): אם sweep נוסף היה משפר — מעגל שלילי קיים. כאן: אין שיפור → ✓ אין מעגל שלילי!'),
];

// All edges for relaxation order display
const ALL_EDGES = [
  { key:'S->A', label:'S-A:4' }, { key:'S->B', label:'S-B:2' },
  { key:'A->B', label:'A-B:1' }, { key:'A->C', label:'A-C:5' },
  { key:'B->C', label:'B-C:8' }, { key:'B->D', label:'B-D:10' },
  { key:'C->T', label:'C-T:2' }, { key:'D->T', label:'D-T:3' },
];

export default function BellmanFordAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div className="rounded-lg" style={{ background:'#0a0a12', border:'1px solid var(--border)', padding:'12px 8px' }}>
        <GraphCanvas
          nodes={GRAPH_WEIGHTED.nodes} edges={GRAPH_WEIGHTED.edges}
          directed={false} nodeStates={s.ns} edgeStates={s.es}
          nodeLabels={Object.fromEntries(Object.entries(s.dist).map(([k,v])=>[k,`${v}`]))}
        />
      </div>

      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-purple)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-purple)', fontWeight:700, marginLeft:6 }}>
          Sweep {s.sweep || '?'} / {GRAPH_WEIGHTED.nodes.length-1} — שלב {anim.step+1}:
        </span>
        {s.info}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Edge relaxation order */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
            סדר עיבוד קשתות (שרירותי)
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {ALL_EDGES.map(({ key, label }) => {
              const isActive = key === s.activeEdge;
              const isDone   = s.es[key] === 'tree';
              return (
                <span key={key} style={{
                  fontSize:11, fontFamily:'monospace',
                  padding:'2px 6px', borderRadius:4,
                  background: isActive ? '#7F77DD20' : isDone ? '#1D9E7518' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--accent-purple)' : isDone ? 'var(--accent-green)' : 'var(--border)'}`,
                  color: isActive ? 'var(--accent-purple)' : isDone ? 'var(--accent-green)' : 'var(--text-secondary)',
                }}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Distance table */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
            d[v] — מרחקים נוכחיים
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {Object.entries(s.dist).map(([k,v])=>(
              <div key={k} style={{ textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:'monospace' }}>{k}</div>
                <div style={{
                  fontSize:13, fontFamily:'monospace', fontWeight:700,
                  color: v===INF ? 'var(--text-secondary)' : 'var(--accent-gold)',
                }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        padding:'8px 12px', borderRadius:8, fontSize:12,
        background:'#5B9BD518', border:'1px solid #5B9BD5',
        color:'var(--text-primary)',
      }}>
        <span style={{ fontWeight:700, color:'#5B9BD5' }}>יתרון על Dijkstra: </span>
        Bellman-Ford עובר על <em>כל הקשתות</em> בסדר שרירותי — לא צריך ל-priority queue. לכן עובד גם עם משקלים שליליים!
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
