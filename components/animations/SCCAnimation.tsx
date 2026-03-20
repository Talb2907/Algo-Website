'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GNode, GEdge } from '@/data/graphs';

type NS = Record<string, NodeState>;
type ES = Record<string, EdgeState>;

interface Step {
  ns: NS; es: ES;
  times: Record<string, string>;
  stack: string[];
  phase: 1 | 2;
  sccs: string[][];
  info: string;
}

const mk = (
  ns: NS, es: ES,
  times: Record<string, string>, stack: string[],
  phase: 1 | 2, sccs: string[][], info: string
): Step => ({ ns, es, times, stack, phase, sccs, info });

// Custom graph: A→B→C→A (SCC1), C→D→E→F→D (SCC2)
const SCC_NODES: GNode[] = [
  { id: 'A', x: 100, y: 130 },
  { id: 'B', x: 230, y: 58  },
  { id: 'C', x: 230, y: 202 },
  { id: 'D', x: 370, y: 130 },
  { id: 'E', x: 480, y: 58  },
  { id: 'F', x: 480, y: 202 },
];

const SCC_EDGES_ORIG: GEdge[] = [
  { from: 'A', to: 'B' },
  { from: 'B', to: 'C' },
  { from: 'C', to: 'A' },
  { from: 'C', to: 'D' },
  { from: 'D', to: 'E' },
  { from: 'E', to: 'F' },
  { from: 'F', to: 'D' },
];

const SCC_EDGES_TRANS: GEdge[] = [
  { from: 'B', to: 'A' },
  { from: 'C', to: 'B' },
  { from: 'A', to: 'C' },
  { from: 'D', to: 'C' },
  { from: 'E', to: 'D' },
  { from: 'F', to: 'E' },
  { from: 'D', to: 'F' },
];

const T0 = { A:'-/-', B:'-/-', C:'-/-', D:'-/-', E:'-/-', F:'-/-' };
const W: NS = { A:'white', B:'white', C:'white', D:'white', E:'white', F:'white' };

const STEPS: Step[] = [
  mk(W, {}, T0, [], 1, [],
    'קוסאראג׳ו שלב 1: הפעל DFS על הגרף המקורי. הוסף כל צומת לסטאק כשהוא מסיים.'),

  mk({ ...W, A:'current' }, { 'A->B':'active' },
    { ...T0, A:'1/-' }, [], 1, [],
    'DFS-VISIT(A): A.d=1. בדוק שכן B.'),

  mk({ ...W, A:'gray', B:'current' },
    { 'A->B':'tree', 'B->C':'active' },
    { ...T0, A:'1/-', B:'2/-' }, [], 1, [],
    'DFS-VISIT(B): B.d=2. בדוק שכן C.'),

  mk({ ...W, A:'gray', B:'gray', C:'current' },
    { 'A->B':'tree', 'B->C':'tree', 'C->A':'back', 'C->D':'active' },
    { ...T0, A:'1/-', B:'2/-', C:'3/-' }, [], 1, [],
    'DFS-VISIT(C): C.d=3. C→A: A אפור → קשת אחורה (back edge)! בדוק שכן D.'),

  mk({ ...W, A:'gray', B:'gray', C:'gray', D:'current' },
    { 'A->B':'tree', 'B->C':'tree', 'C->A':'back', 'C->D':'tree', 'D->E':'active' },
    { ...T0, A:'1/-', B:'2/-', C:'3/-', D:'4/-' }, [], 1, [],
    'DFS-VISIT(D): D.d=4. בדוק שכן E.'),

  mk({ ...W, A:'gray', B:'gray', C:'gray', D:'gray', E:'current' },
    { 'A->B':'tree', 'B->C':'tree', 'C->A':'back', 'C->D':'tree', 'D->E':'tree', 'E->F':'active' },
    { ...T0, A:'1/-', B:'2/-', C:'3/-', D:'4/-', E:'5/-' }, [], 1, [],
    'DFS-VISIT(E): E.d=5. בדוק שכן F.'),

  mk({ ...W, A:'gray', B:'gray', C:'gray', D:'gray', E:'gray', F:'current' },
    { 'A->B':'tree', 'B->C':'tree', 'C->A':'back', 'C->D':'tree', 'D->E':'tree', 'E->F':'tree', 'F->D':'back' },
    { ...T0, A:'1/-', B:'2/-', C:'3/-', D:'4/-', E:'5/-', F:'6/-' }, [], 1, [],
    'DFS-VISIT(F): F.d=6. F→D: D אפור → קשת אחורה! F.f=7. דחף F לסטאק.'),

  mk({ ...W, A:'gray', B:'gray', C:'gray', D:'gray', E:'black', F:'black' },
    { 'A->B':'tree', 'B->C':'tree', 'C->A':'back', 'C->D':'tree', 'D->E':'tree', 'E->F':'tree', 'F->D':'back' },
    { A:'1/-', B:'2/-', C:'3/-', D:'4/9', E:'5/8', F:'6/7' }, ['F','E','D'], 1, [],
    'E.f=8 → דחף E. D.f=9 → דחף D. חזרה ל-C, B, A — כולם מסיימים. C.f=10, B.f=11, A.f=12.'),

  mk({ A:'black', B:'black', C:'black', D:'black', E:'black', F:'black' },
    { 'A->B':'tree', 'B->C':'tree', 'C->A':'back', 'C->D':'tree', 'D->E':'tree', 'E->F':'tree', 'F->D':'back' },
    { A:'1/12', B:'2/11', C:'3/10', D:'4/9', E:'5/8', F:'6/7' },
    ['A','B','C','D','E','F'], 1, [],
    'שלב 1 הסתיים! סטאק (ראש→): A(12), B(11), C(10), D(9), E(8), F(7). שלב 2: DFS על גרף הפוך לפי סדר הסטאק.'),

  mk({ A:'current', B:'gray', C:'gray', D:'white', E:'white', F:'white' },
    { 'B->A':'tree', 'A->C':'tree', 'C->B':'tree' },
    { A:'1/12', B:'2/11', C:'3/10', D:'4/9', E:'5/8', F:'6/7' },
    ['D','E','F'], 2, [['A','B','C']],
    'גרף הפוך: הפוך כיוון כל הקשתות. DFS מ-A (f=12, גבוה ביותר): A→C→B→A (מעגל!). SCC1 = {A, B, C} ✓'),

  mk({ A:'black', B:'black', C:'black', D:'current', E:'gray', F:'gray' },
    { 'B->A':'tree', 'A->C':'tree', 'C->B':'tree', 'E->D':'tree', 'D->F':'tree', 'F->E':'tree' },
    { A:'1/12', B:'2/11', C:'3/10', D:'4/9', E:'5/8', F:'6/7' },
    [], 2, [['A','B','C'],['D','E','F']],
    'B, C כבר ביקרו — דלג. DFS מ-D (הבא): D→F→E→D (מעגל!). SCC2 = {D, E, F} ✓'),

  mk({ A:'black', B:'black', C:'black', D:'black', E:'black', F:'black' },
    { 'B->A':'tree', 'A->C':'tree', 'C->B':'tree', 'E->D':'tree', 'D->F':'tree', 'F->E':'tree' },
    { A:'1/12', B:'2/11', C:'3/10', D:'4/9', E:'5/8', F:'6/7' },
    [], 2, [['A','B','C'],['D','E','F']],
    '✓ קוסאראג׳ו הסתיים! 2 רכיבי קשירות חזקה (SCC): {A,B,C} ו-{D,E,F}. מורכבות: Θ(V+E).'),
];

const SCC_COLORS = ['#7F77DD', '#1D9E75'];

export default function SCCAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];
  const isPhase2 = s.phase === 2;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Phase indicator */}
      <div style={{ display:'flex', gap:8 }}>
        {[1,2].map(p => (
          <div key={p} style={{
            padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700,
            background: s.phase===p ? (p===1 ? '#7F77DD28' : '#1D9E7528') : 'transparent',
            border: `1px solid ${s.phase===p ? (p===1 ? 'var(--accent-purple)' : 'var(--accent-green)') : 'var(--border)'}`,
            color: s.phase===p ? (p===1 ? 'var(--accent-purple)' : 'var(--accent-green)') : 'var(--text-secondary)',
          }}>
            שלב {p}: {p===1 ? 'DFS על גרף מקורי' : 'DFS על גרף הפוך'}
          </div>
        ))}
      </div>

      {/* Graph */}
      <div className="rounded-lg" style={{ background:'#0a0a12', border:'1px solid var(--border)', padding:'10px 8px 4px' }}>
        <GraphCanvas
          nodes={SCC_NODES}
          edges={isPhase2 ? SCC_EDGES_TRANS : SCC_EDGES_ORIG}
          directed nodeStates={s.ns} edgeStates={s.es}
          nodeLabels={Object.fromEntries(
            Object.entries(s.times).map(([k,v]) => [k, v==='-/-' ? '' : v])
          )}
        />

        {/* SCC result boxes */}
        {s.sccs.length > 0 && (
          <div style={{ padding:'6px 8px 8px', borderTop:'1px solid var(--border)', display:'flex', gap:8, flexWrap:'wrap' }}>
            {s.sccs.map((scc, i) => (
              <div key={i} style={{
                padding:'4px 10px', borderRadius:6, fontSize:13, fontFamily:'monospace',
                background: `${SCC_COLORS[i]}18`,
                border: `1px solid ${SCC_COLORS[i]}`,
                color: SCC_COLORS[i], fontWeight:700,
              }}>
                SCC{i+1}: {'{' + scc.join(', ') + '}'}
              </div>
            ))}
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
        {/* Finish times */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>זמני גילוי/סיום (d/f)</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {Object.entries(s.times).map(([k,v]) => (
              <div key={k} style={{ textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:'monospace' }}>{k}</div>
                <div style={{ fontSize:12, fontFamily:'monospace', fontWeight:700, color: v==='-/-' ? 'var(--text-secondary)' : 'var(--accent-gold)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>סטאק (ראש→זנב)</div>
          {s.stack.length === 0
            ? <span style={{ fontSize:12, color:'var(--text-secondary)' }}>ריק</span>
            : <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {s.stack.map((n,i) => (
                  <span key={i} style={{
                    padding:'2px 8px', borderRadius:4, fontSize:12, fontFamily:'monospace',
                    background: i===0 ? '#7F77DD20' : '#1a1a24',
                    border: `1px solid ${i===0 ? 'var(--accent-purple)' : 'var(--border)'}`,
                    color: i===0 ? 'var(--accent-purple)' : 'var(--text-primary)',
                    fontWeight:700,
                  }}>{n}</span>
                ))}
              </div>
          }
        </div>
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
