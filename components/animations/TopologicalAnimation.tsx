'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GRAPH_GENERAL } from '@/data/graphs';

type NS = Record<string, NodeState>;
type ES = Record<string, EdgeState>;

interface Step {
  ns: NS; es: ES;
  times: Record<string, string>;
  topoList: string[];   // nodes added to front of list so far
  info: string;
}

const mk = (ns: NS, es: ES, times: Record<string,string>, topoList: string[], info: string): Step =>
  ({ ns, es, times, topoList, info });

// DFS on GRAPH_GENERAL: A→B, A→C, B→D, B→E, C→F, D→F
// Trace: A.d=1 B.d=2 D.d=3 F.d=4 F.f=5 D.f=6 E.d=7 E.f=8 B.f=9 C.d=10 C.f=11 A.f=12
// Topo order (f desc): A(12), C(11), B(9), E(8), D(6), F(5)

const STEPS: Step[] = [
  mk({ A:'white', B:'white', C:'white', D:'white', E:'white', F:'white' }, {},
     { A:'-/-', B:'-/-', C:'-/-', D:'-/-', E:'-/-', F:'-/-' }, [],
     'מיון טופולוגי: מפעיל DFS ומוסיף כל צומת לראש הרשימה כשהוא מסיים (f[] יורד).'),

  mk({ A:'current', B:'white', C:'white', D:'white', E:'white', F:'white' }, {},
     { A:'1/-', B:'-/-', C:'-/-', D:'-/-', E:'-/-', F:'-/-' }, [],
     'DFS-VISIT(A): A.d=1. בדוק שכן B.'),

  mk({ A:'gray', B:'current', C:'white', D:'white', E:'white', F:'white' },
     { 'A->B':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'-/-', E:'-/-', F:'-/-' }, [],
     'DFS-VISIT(B): B.d=2. בדוק שכן D.'),

  mk({ A:'gray', B:'gray', C:'white', D:'current', E:'white', F:'white' },
     { 'A->B':'tree', 'B->D':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/-', E:'-/-', F:'-/-' }, [],
     'DFS-VISIT(D): D.d=3. בדוק שכן F.'),

  mk({ A:'gray', B:'gray', C:'white', D:'gray', E:'white', F:'current' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/-', E:'-/-', F:'4/-' }, [],
     'DFS-VISIT(F): F.d=4. F אין שכנים לבנים → F הסתיים! F.f=5. הכנס F לראש הרשימה.'),

  mk({ A:'gray', B:'gray', C:'white', D:'current', E:'white', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/6', E:'-/-', F:'4/5' }, ['F'],
     'D.f=6 → D הסתיים! הכנס D לראש הרשימה. רשימה: [D, F]. חזרה ל-B, בדוק E.'),

  mk({ A:'gray', B:'gray', C:'white', D:'black', E:'current', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree' },
     { A:'1/-', B:'2/-', C:'-/-', D:'3/6', E:'7/8', F:'4/5' }, ['E','D','F'],
     'DFS-VISIT(E): E.d=7. E אין שכנים לבנים → E.f=8. הכנס E לראש הרשימה. רשימה: [E, D, F].'),

  mk({ A:'gray', B:'black', C:'white', D:'black', E:'black', F:'black' },
     { 'A->B':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree' },
     { A:'1/-', B:'2/9', C:'-/-', D:'3/6', E:'7/8', F:'4/5' }, ['B','E','D','F'],
     'B.f=9 → B הסתיים! הכנס B לראש הרשימה. חזרה ל-A. בדוק שכן C.'),

  mk({ A:'gray', B:'black', C:'current', D:'black', E:'black', F:'black' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree', 'C->F':'cross' },
     { A:'1/-', B:'2/9', C:'10/11', D:'3/6', E:'7/8', F:'4/5' }, ['C','B','E','D','F'],
     'DFS-VISIT(C): C.d=10. C→F: F שחור → קשת חוצה (cross). C.f=11. הכנס C לראש הרשימה.'),

  mk({ A:'black', B:'black', C:'black', D:'black', E:'black', F:'black' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'D->F':'tree', 'B->E':'tree', 'C->F':'cross' },
     { A:'1/12', B:'2/9', C:'10/11', D:'3/6', E:'7/8', F:'4/5' }, ['A','C','B','E','D','F'],
     'A.f=12 → A הסתיים! הכנס A לראש הרשימה. DFS הסתיים. סדר טופולוגי: A → C → B → E → D → F'),
];

// Topological order: A, C, B, E, D, F
const TOPO_ORDER = ['A', 'C', 'B', 'E', 'D', 'F'];

export default function TopologicalAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Graph */}
      <div className="rounded-lg" style={{ background:'#0a0a12', border:'1px solid var(--border)', padding:'10px 8px 4px' }}>
        <GraphCanvas
          nodes={GRAPH_GENERAL.nodes} edges={GRAPH_GENERAL.edges}
          directed nodeStates={s.ns} edgeStates={s.es}
          nodeLabels={Object.fromEntries(
            Object.entries(s.times).map(([k,v]) => [k, v==='-/-' ? '' : v])
          )}
        />

        {/* Topological order bar at bottom of SVG area */}
        {s.topoList.length > 0 && (
          <div style={{ padding:'6px 8px 8px', borderTop:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, color:'var(--text-secondary)', marginBottom:5 }}>
              רשימה טופולוגית (ראש → זנב):
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, flexWrap:'wrap' }}>
              {s.topoList.map((n, i) => (
                <span key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{
                    padding:'3px 10px', borderRadius:6,
                    background: i===0 ? '#7F77DD28' : '#1a1a24',
                    border: `1px solid ${i===0 ? 'var(--accent-purple)' : 'var(--border)'}`,
                    color: i===0 ? 'var(--accent-purple)' : 'var(--text-primary)',
                    fontSize:13, fontFamily:'monospace', fontWeight:700,
                  }}>{n}</span>
                  {i < s.topoList.length-1 && (
                    <span style={{ color:'var(--text-secondary)', fontSize:12 }}>→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Final topological layout — edges go left→right */}
      {anim.step === STEPS.length - 1 && (
        <div className="rounded-lg p-4" style={{ background:'#0a0a12', border:'1px solid var(--accent-green)' }}>
          <div style={{ fontSize:11, color:'var(--accent-green)', fontWeight:600, marginBottom:8 }}>
            ✓ כל הקשתות הולכות שמאל←ימין (לפי כיוון ה-RTL: ימין לשמאל)
          </div>
          <svg viewBox="0 0 580 80" style={{ width:'100%' }}>
            {/* Edges */}
            {[
              [0,1],[0,2],[1,3],[1,4],[2,5],[3,5]
            ].map(([fi,ti],i) => {
              const fx = 40 + fi*95, tx = 40 + ti*95;
              return (
                <line key={i} x1={fx+18} y1={40} x2={tx-18} y2={40}
                  stroke="var(--accent-green)" strokeWidth={1.5}
                  markerEnd="url(#topo-arr)" />
              );
            })}
            <defs>
              <marker id="topo-arr" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0,0 7,3 0,6" fill="var(--accent-green)"/>
              </marker>
            </defs>
            {TOPO_ORDER.map((n, i) => (
              <g key={n}>
                <circle cx={40+i*95} cy={40} r={18} fill="#1D9E7520" stroke="var(--accent-green)" strokeWidth={2}/>
                <text x={40+i*95} y={44} textAnchor="middle" dominantBaseline="middle"
                  fontSize="14" fontWeight="700" fill="var(--accent-green)" fontFamily="monospace">
                  {n}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Info box */}
      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-purple)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-purple)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
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
