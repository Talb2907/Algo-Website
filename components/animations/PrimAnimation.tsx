'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GRAPH_WEIGHTED } from '@/data/graphs';

type NS  = Record<string, NodeState>;
type ES  = Record<string, EdgeState>;
type Key = Record<string, number | '∞'>;
type Pi  = Record<string, string | '-'>;

interface Step {
  ns: NS; es: ES;
  key: Key; pi: Pi;
  inTree: string[];
  info: string;
}

const INF = '∞';

const mk = (ns: NS, es: ES, key: Key, pi: Pi, inTree: string[], info: string): Step =>
  ({ ns, es, key, pi, inTree, info });

const STEPS: Step[] = [
  mk({ S:'gray', A:'white', B:'white', C:'white', D:'white', T:'white' }, {},
     { S:0, A:INF, B:INF, C:INF, D:INF, T:INF },
     { S:'-', A:'-', B:'-', C:'-', D:'-', T:'-' }, [],
     'אתחול: key[S]=0, כל השאר ∞. Q = כל הצמתים.'),

  mk({ S:'current', A:'white', B:'white', C:'white', D:'white', T:'white' },
     { 'S->A':'active', 'S->B':'active' },
     { S:0, A:4, B:2, C:INF, D:INF, T:INF },
     { S:'-', A:'S', B:'S', C:'-', D:'-', T:'-' }, ['S'],
     'שלף S (key=0). עדכן שכנים: key[A]=4 π[A]=S, key[B]=2 π[B]=S.'),

  mk({ S:'black', A:'gray', B:'current', C:'white', D:'white', T:'white' },
     { 'S->B':'active' },
     { S:0, A:4, B:2, C:INF, D:INF, T:INF },
     { S:'-', A:'S', B:'S', C:'-', D:'-', T:'-' }, ['S'],
     'S → שחור (בעץ). שלף B (key=2, מינימלי). בדוק שכנים: A, C, D.'),

  mk({ S:'black', A:'gray', B:'current', C:'white', D:'white', T:'white' },
     { 'S->B':'tree', 'A->B':'active' },
     { S:0, A:1, B:2, C:INF, D:INF, T:INF },
     { S:'-', A:'B', B:'S', C:'-', D:'-', T:'-' }, ['S'],
     'RELAX B→A: key[A] = min(4, 1) = 1 ✓ עדכון!  π[A] ← B'),

  mk({ S:'black', A:'gray', B:'current', C:'gray', D:'white', T:'white' },
     { 'S->B':'tree', 'A->B':'active', 'B->C':'active' },
     { S:0, A:1, B:2, C:8, D:INF, T:INF },
     { S:'-', A:'B', B:'S', C:'B', D:'-', T:'-' }, ['S'],
     'RELAX B→C: key[C] = min(∞, 8) = 8  π[C]=B'),

  mk({ S:'black', A:'gray', B:'current', C:'gray', D:'gray', T:'white' },
     { 'S->B':'tree', 'A->B':'active', 'B->C':'active', 'B->D':'active' },
     { S:0, A:1, B:2, C:8, D:10, T:INF },
     { S:'-', A:'B', B:'S', C:'B', D:'B', T:'-' }, ['S'],
     'RELAX B→D: key[D] = min(∞, 10) = 10  π[D]=B. Q: A(1),C(8),D(10),T(∞)'),

  mk({ S:'black', A:'current', B:'black', C:'gray', D:'gray', T:'white' },
     { 'S->B':'tree', 'A->B':'tree' },
     { S:0, A:1, B:2, C:8, D:10, T:INF },
     { S:'-', A:'B', B:'S', C:'B', D:'B', T:'-' }, ['S','B'],
     'B → שחור. שלף A (key=1, מינימלי). בדוק שכן C.'),

  mk({ S:'black', A:'current', B:'black', C:'gray', D:'gray', T:'white' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'active', 'B->C':'rejected' },
     { S:0, A:1, B:2, C:5, D:10, T:INF },
     { S:'-', A:'B', B:'S', C:'A', D:'B', T:'-' }, ['S','B'],
     'RELAX A→C: key[C] = min(8, 5) = 5 ✓ עדכון!  π[C] ← A  (B→C הוסר)'),

  mk({ S:'black', A:'black', B:'black', C:'current', D:'gray', T:'white' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree' },
     { S:0, A:1, B:2, C:5, D:10, T:INF },
     { S:'-', A:'B', B:'S', C:'A', D:'B', T:'-' }, ['S','B','A'],
     'A → שחור. שלף C (key=5). בדוק שכן T.'),

  mk({ S:'black', A:'black', B:'black', C:'current', D:'gray', T:'gray' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'C->T':'active' },
     { S:0, A:1, B:2, C:5, D:10, T:2 },
     { S:'-', A:'B', B:'S', C:'A', D:'B', T:'C' }, ['S','B','A'],
     'RELAX C→T: key[T] = min(∞, 2) = 2 ✓  π[T]=C. Q: T(2),D(10)'),

  mk({ S:'black', A:'black', B:'black', C:'black', D:'gray', T:'current' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'C->T':'tree' },
     { S:0, A:1, B:2, C:5, D:10, T:2 },
     { S:'-', A:'B', B:'S', C:'A', D:'B', T:'C' }, ['S','B','A','C'],
     'C → שחור. שלף T (key=2). RELAX T→D: key[D] = min(10, 3) = 3 ✓ עדכון! π[D]←T'),

  mk({ S:'black', A:'black', B:'black', C:'black', D:'current', T:'black' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'C->T':'tree', 'D->T':'tree' },
     { S:0, A:1, B:2, C:5, D:3, T:2 },
     { S:'-', A:'B', B:'S', C:'A', D:'T', T:'C' }, ['S','B','A','C','T'],
     'T → שחור. שלף D (key=3). אין שכנים שלא עובדו.'),

  mk({ S:'black', A:'black', B:'black', C:'black', D:'black', T:'black' },
     { 'S->B':'tree', 'A->B':'tree', 'A->C':'tree', 'C->T':'tree', 'D->T':'tree' },
     { S:0, A:1, B:2, C:5, D:3, T:2 },
     { S:'-', A:'B', B:'S', C:'A', D:'T', T:'C' }, ['S','B','A','C','T','D'],
     '✓ Prim הסתיים! MST: S-B:2, B-A:1, A-C:5, C-T:2, T-D:3. סכום=13'),
];

export default function PrimAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div className="rounded-lg" style={{ background:'#0a0a12', border:'1px solid var(--border)', padding:'12px 8px' }}>
        <GraphCanvas
          nodes={GRAPH_WEIGHTED.nodes} edges={GRAPH_WEIGHTED.edges}
          directed={false} nodeStates={s.ns} edgeStates={s.es}
          nodeLabels={Object.fromEntries(Object.entries(s.key).map(([k,v])=>[k,`k=${v}`]))}
        />
      </div>

      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-green)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-green)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
      </div>

      {/* key[] and π[] tables */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>key[v] — משקל קשת קלה לעץ</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {Object.entries(s.key).map(([k,v])=>(
              <span key={k} style={{ fontSize:12, fontFamily:'monospace' }}>
                <span style={{ color:'var(--accent-green)' }}>{k}</span>=<span style={{ color: v===INF?'var(--text-secondary)':'var(--text-primary)' }}>{v}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>π[v] — אבא בעץ Prim</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {Object.entries(s.pi).map(([k,v])=>(
              <span key={k} style={{ fontSize:12, fontFamily:'monospace' }}>
                <span style={{ color:'var(--accent-green)' }}>{k}</span>=<span style={{ color:'var(--text-secondary)' }}>{v}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
        {[
          ['#1D9E75','בעץ (שחור)'],['#EF9F27','ממתין (אפור)'],
          ['#1D9E75','קשת MST'],['#EF9F27','בדיקה'],['#e03939','הוחלף']
        ].map(([c,l],i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
            {i<2
              ? <div style={{ width:10,height:10,borderRadius:'50%',background:c as string }}/>
              : <div style={{ width:18,height:2,background:c as string }}/>
            }
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
