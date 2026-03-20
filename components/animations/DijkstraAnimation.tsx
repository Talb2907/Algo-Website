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
  q: string[];   // remaining in priority queue
  info: string;
}

const INF = '∞';
const INIT: Dst = { S:0, A:INF, B:INF, C:INF, D:INF, T:INF };

const mk = (ns: NS, es: ES, dist: Dst, q: string[], info: string): Step =>
  ({ ns, es, dist, q, info });

const STEPS: Step[] = [
  mk({ S:'gray', A:'white', B:'white', C:'white', D:'white', T:'white' },
     {},
     INIT, ['S','A','B','C','D','T'],
     'אתחול: d[S]=0, כל השאר ∞. Q = {S(0), A(∞), B(∞), C(∞), D(∞), T(∞)}'),

  mk({ S:'current', A:'white', B:'white', C:'white', D:'white', T:'white' },
     { 'S->A':'active' },
     { S:0, A:4, B:INF, C:INF, D:INF, T:INF }, ['A','B','C','D','T'],
     'שלף S (d=0). RELAX S→A: d[A] = min(∞, 0+4) = 4 ✓  π[A]=S'),

  mk({ S:'current', A:'gray', B:'gray', C:'white', D:'white', T:'white' },
     { 'S->A':'tree', 'S->B':'active' },
     { S:0, A:4, B:2, C:INF, D:INF, T:INF }, ['B','A','C','D','T'],
     'RELAX S→B: d[B] = min(∞, 0+2) = 2 ✓  π[B]=S. Q מסודרת: B(2),A(4),…'),

  mk({ S:'black', A:'gray', B:'current', C:'white', D:'white', T:'white' },
     { 'S->A':'tree', 'S->B':'tree' },
     { S:0, A:4, B:2, C:INF, D:INF, T:INF }, ['A','C','D','T'],
     'S → שחור (סופי). שלף B (d=2, מינימלי בתור). בדוק שכנים: A, C, D.'),

  mk({ S:'black', A:'gray', B:'current', C:'white', D:'white', T:'white' },
     { 'S->A':'rejected', 'S->B':'tree', 'A->B':'active' },
     { S:0, A:3, B:2, C:INF, D:INF, T:INF }, ['A','C','D','T'],
     'RELAX B→A: d[A] = min(4, 2+1) = 3 ✓ עדכון!  π[A] ← B  (S→A הוסר מהעץ)'),

  mk({ S:'black', A:'gray', B:'current', C:'gray', D:'white', T:'white' },
     { 'S->B':'tree', 'A->B':'tree', 'B->C':'active' },
     { S:0, A:3, B:2, C:10, D:INF, T:INF }, ['A','C','D','T'],
     'RELAX B→C: d[C] = min(∞, 2+8) = 10 ✓  π[C]=B'),

  mk({ S:'black', A:'gray', B:'current', C:'gray', D:'gray', T:'white' },
     { 'S->B':'tree', 'A->B':'tree', 'B->C':'tree', 'B->D':'active' },
     { S:0, A:3, B:2, C:10, D:12, T:INF }, ['A','C','D','T'],
     'RELAX B→D: d[D] = min(∞, 2+10) = 12 ✓  π[D]=B. Q: A(3),C(10),D(12),T(∞)'),

  mk({ S:'black', A:'current', B:'black', C:'gray', D:'gray', T:'white' },
     { 'S->B':'tree', 'A->B':'tree', 'B->C':'tree', 'B->D':'tree' },
     { S:0, A:3, B:2, C:10, D:12, T:INF }, ['C','D','T'],
     'B → שחור (סופי). שלף A (d=3, מינימלי). בדוק שכן C.'),

  mk({ S:'black', A:'current', B:'black', C:'gray', D:'gray', T:'white' },
     { 'S->B':'tree', 'A->B':'tree', 'B->C':'rejected', 'A->C':'active', 'B->D':'tree' },
     { S:0, A:3, B:2, C:8, D:12, T:INF }, ['C','D','T'],
     'RELAX A→C: d[C] = min(10, 3+5) = 8 ✓ עדכון!  π[C] ← A  (B→C הוסר)'),

  mk({ S:'black', A:'black', B:'black', C:'current', D:'gray', T:'white' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'tree' },
     { S:0, A:3, B:2, C:8, D:12, T:INF }, ['D','T'],
     'A → שחור (סופי). שלף C (d=8). RELAX C→T.'),

  mk({ S:'black', A:'black', B:'black', C:'current', D:'gray', T:'gray' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->T':'active' },
     { S:0, A:3, B:2, C:8, D:12, T:10 }, ['T','D'],
     'RELAX C→T: d[T] = min(∞, 8+2) = 10 ✓  π[T]=C. Q: T(10),D(12)'),

  mk({ S:'black', A:'black', B:'black', C:'black', D:'gray', T:'current' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->T':'tree' },
     { S:0, A:3, B:2, C:8, D:12, T:10 }, ['D'],
     'C → שחור. שלף T (d=10). RELAX T→D: d[D]=min(12, 10+3)=12 — אין שיפור.'),

  mk({ S:'black', A:'black', B:'black', C:'black', D:'current', T:'black' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->T':'tree' },
     { S:0, A:3, B:2, C:8, D:12, T:10 }, [],
     'T → שחור. שלף D (d=12). אין שכנים שלא עובדו.'),

  mk({ S:'black', A:'black', B:'black', C:'black', D:'black', T:'black' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->T':'tree' },
     { S:0, A:3, B:2, C:8, D:12, T:10 }, [],
     '✓ Dijkstra הסתיים! מסלול קצר ביותר S→T = 10: S→B→A→C→T'),
];

export default function DijkstraAnimation() {
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
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-gold)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-gold)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>תור עדיפויות Q</div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', minHeight:26 }}>
            {s.q.length===0
              ? <span style={{ color:'var(--text-secondary)', fontSize:12 }}>ריק</span>
              : s.q.map(n=>(
                <span key={n} style={{
                  background:'#EF9F2718', border:'1px solid #EF9F27',
                  color:'#EF9F27', borderRadius:4, padding:'1px 7px',
                  fontSize:12, fontFamily:'monospace', fontWeight:700,
                }}>
                  {n}({s.dist[n]})
                </span>
              ))
            }
          </div>
        </div>

        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>מרחקים d[v]</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {Object.entries(s.dist).map(([k,v])=>(
              <span key={k} style={{ fontSize:12, fontFamily:'monospace' }}>
                <span style={{ color:'var(--accent-gold)' }}>{k}</span>
                <span style={{ color:'var(--text-secondary)' }}>=</span>
                <span style={{ color: v===INF ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{v}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
        {[['#1D9E75','קשת עץ SP'],['#EF9F27','בדיקה נוכחית'],['#e03939','נדחתה (אין שיפור)']].map(([c,l])=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
            <div style={{ width:18, height:2, background:c as string }}/>
            <span style={{ color:'var(--text-secondary)' }}>{l}</span>
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
