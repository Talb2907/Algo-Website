'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GRAPH_WEIGHTED } from '@/data/graphs';

type NS = Record<string, NodeState>;
type ES = Record<string, EdgeState>;

interface KruskalStep {
  ns: NS; es: ES;
  currentEdge: string;
  decision: 'none' | 'accept' | 'reject';
  mstWeight: number;
  components: string[][];   // union-find groups
  info: string;
}

// Sorted edges: A-B:1, S-B:2, C-T:2, D-T:3, S-A:4, A-C:5, B-C:8, B-D:10
const SORTED_EDGES = [
  { key:'A->B', label:'A-B', w:1 },
  { key:'S->B', label:'S-B', w:2 },
  { key:'C->T', label:'C-T', w:2 },
  { key:'D->T', label:'D-T', w:3 },
  { key:'S->A', label:'S-A', w:4 },
  { key:'A->C', label:'A-C', w:5 },
  { key:'B->C', label:'B-C', w:8 },
  { key:'B->D', label:'B-D', w:10 },
];

const mk = (
  ns: NS, es: ES,
  currentEdge: string, decision: KruskalStep['decision'],
  mstWeight: number, components: string[][],
  info: string
): KruskalStep => ({ ns, es, currentEdge, decision, mstWeight, components, info });

const W0: NS = { S:'white', A:'white', B:'white', C:'white', D:'white', T:'white' };

const STEPS: KruskalStep[] = [
  mk(W0, {}, '', 'none', 0,
     [['S'],['A'],['B'],['C'],['D'],['T']],
     'מיין את כל הקשתות בסדר עולה לפי משקל. כל צומת הוא רכיב נפרד.'),

  mk(W0, { 'A->B':'active' }, 'A->B', 'accept', 1,
     [['S'],['A','B'],['C'],['D'],['T']],
     'בדוק A-B (w=1): FIND-SET(A)≠FIND-SET(B) → קבל! UNION(A,B). משקל MST: 1'),

  mk(W0, { 'A->B':'tree', 'S->B':'active' }, 'S->B', 'accept', 3,
     [['S','A','B'],['C'],['D'],['T']],
     'בדוק S-B (w=2): FIND-SET(S)≠FIND-SET(B) → קבל! UNION(S,{A,B}). משקל MST: 3'),

  mk(W0, { 'A->B':'tree', 'S->B':'tree', 'C->T':'active' }, 'C->T', 'accept', 5,
     [['S','A','B'],['C','T'],['D']],
     'בדוק C-T (w=2): FIND-SET(C)≠FIND-SET(T) → קבל! UNION(C,T). משקל MST: 5'),

  mk(W0, { 'A->B':'tree', 'S->B':'tree', 'C->T':'tree', 'D->T':'active' }, 'D->T', 'accept', 8,
     [['S','A','B'],['C','T','D']],
     'בדוק D-T (w=3): FIND-SET(D)≠FIND-SET(T) → קבל! UNION(D,{C,T}). משקל MST: 8'),

  mk(W0,
     { 'A->B':'tree', 'S->B':'tree', 'C->T':'tree', 'D->T':'tree', 'S->A':'rejected' },
     'S->A', 'reject', 8,
     [['S','A','B'],['C','T','D']],
     'בדוק S-A (w=4): FIND-SET(S)==FIND-SET(A) → שניהם ב-{S,A,B} → דחה! (יצור מעגל)'),

  mk(W0,
     { 'A->B':'tree', 'S->B':'tree', 'C->T':'tree', 'D->T':'tree', 'A->C':'active' },
     'A->C', 'accept', 13,
     [['S','A','B','C','T','D']],
     'בדוק A-C (w=5): FIND-SET(A)={S,A,B} ≠ FIND-SET(C)={C,T,D} → קבל! כל הצמתים מחוברים!'),

  mk(W0,
     { 'A->B':'tree', 'S->B':'tree', 'C->T':'tree', 'D->T':'tree', 'A->C':'tree' },
     '', 'none', 13,
     [['S','A','B','C','T','D']],
     '✓ MST הושלם! |MST|=5=V-1 קשתות. משקל כולל: 13. (A-B:1 + S-B:2 + C-T:2 + D-T:3 + A-C:5)'),
];

const COMP_COLORS = ['#7F77DD','#1D9E75','#EF9F27','#E07B39','#5B9BD5','#e03939'];

export default function KruskalAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];

  // Assign a color to each node based on its component
  const nodeColor: Record<string, string> = {};
  s.components.forEach((comp, i) => {
    comp.forEach(n => { nodeColor[n] = COMP_COLORS[i % COMP_COLORS.length]; });
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div className="rounded-lg" style={{ background:'#0a0a12', border:'1px solid var(--border)', padding:'12px 8px' }}>
        <GraphCanvas
          nodes={GRAPH_WEIGHTED.nodes} edges={GRAPH_WEIGHTED.edges}
          directed={false} nodeStates={s.ns} edgeStates={s.es}
        />
        {/* Component color dots overlay — shown as legend below */}
      </div>

      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-green)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-green)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Sorted edge list */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
            קשתות ממוינות
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            {SORTED_EDGES.map(({ key, label, w }) => {
              const state = s.es[key];
              const isCurrent = key === s.currentEdge;
              const isAccepted = state === 'tree';
              const isRejected = state === 'rejected';
              return (
                <div key={key} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'2px 8px', borderRadius:4, fontSize:12, fontFamily:'monospace',
                  background: isCurrent ? '#7F77DD18' : 'transparent',
                  border: `1px solid ${isCurrent ? 'var(--accent-purple)' : 'transparent'}`,
                  color: isAccepted ? 'var(--accent-green)' : isRejected ? '#e03939' : isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                  opacity: (state && !isCurrent && !isAccepted) ? 0.5 : 1,
                }}>
                  <span>{label}:{w}</span>
                  <span>{isAccepted ? '✓' : isRejected ? '✗' : isCurrent ? '◀' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Components */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
            רכיבים נוכחיים — MST משקל: {s.mstWeight}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {s.components.map((comp, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: COMP_COLORS[i % COMP_COLORS.length], flexShrink:0 }}/>
                <span style={{ fontSize:12, fontFamily:'monospace', color:'var(--text-primary)' }}>
                  {'{' + comp.join(',') + '}'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
        {[['#1D9E75','קשת MST'],['#EF9F27','בדיקה נוכחית'],['#e03939','נדחתה (מעגל)']].map(([c,l])=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
            <div style={{ width:18, height:2, background: c as string }}/>
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
