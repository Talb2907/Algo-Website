'use client';

import GraphCanvas, { NodeState, EdgeState, edgeKey } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GRAPH_GENERAL } from '@/data/graphs';

type NS = Record<string, NodeState>;
type ES = Record<string, EdgeState>;
type Dist = Record<string, number | '∞'>;

interface BFSStep {
  ns: NS;
  es: ES;
  queue: string[];
  dist: Dist;
  info: string;
  line: number;
}

const INIT_DIST: Dist = { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' };
const W = (ns: NS, es: ES = {}, q: string[], d: Dist, info: string, line: number): BFSStep =>
  ({ ns, es, queue: q, dist: d, info, line });

const STEPS: BFSStep[] = [
  W({ A:'gray',    B:'white', C:'white', D:'white', E:'white', F:'white' },
     {},
     ['A'], INIT_DIST,
     'אתחול: כל הצמתים לבן. מקור A צבוע אפור (בתור), d[A]=0.',
     3),

  W({ A:'current', B:'white', C:'white', D:'white', E:'white', F:'white' },
     {},
     [], INIT_DIST,
     'שלף A מהתור (u=A). בדוק שכניו: {B, C}.',
     8),

  W({ A:'current', B:'gray',  C:'white', D:'white', E:'white', F:'white' },
     { 'A->B':'active' },
     ['B'], { A:0, B:1, C:'∞', D:'∞', E:'∞', F:'∞' },
     'B לבן → צבע אפור, d[B]=1, π[B]=A. הכנס B לתור.',
     10),

  W({ A:'current', B:'gray',  C:'gray',  D:'white', E:'white', F:'white' },
     { 'A->B':'tree', 'A->C':'active' },
     ['B','C'], { A:0, B:1, C:1, D:'∞', E:'∞', F:'∞' },
     'C לבן → צבע אפור, d[C]=1, π[C]=A. הכנס C לתור.',
     10),

  W({ A:'black',   B:'gray',  C:'gray',  D:'white', E:'white', F:'white' },
     { 'A->B':'tree', 'A->C':'tree' },
     ['B','C'], { A:0, B:1, C:1, D:'∞', E:'∞', F:'∞' },
     'כל שכני A עובדו. A → שחור.',
     15),

  W({ A:'black',   B:'current', C:'gray', D:'white', E:'white', F:'white' },
     { 'A->B':'tree', 'A->C':'tree' },
     ['C'], { A:0, B:1, C:1, D:'∞', E:'∞', F:'∞' },
     'שלף B מהתור (u=B). בדוק שכניו: {D, E}.',
     8),

  W({ A:'black',   B:'current', C:'gray', D:'gray',  E:'white', F:'white' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'active' },
     ['C','D'], { A:0, B:1, C:1, D:2, E:'∞', F:'∞' },
     'D לבן → צבע אפור, d[D]=2, π[D]=B. הכנס D לתור.',
     10),

  W({ A:'black',   B:'current', C:'gray', D:'gray',  E:'gray',  F:'white' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'active' },
     ['C','D','E'], { A:0, B:1, C:1, D:2, E:2, F:'∞' },
     'E לבן → צבע אפור, d[E]=2, π[E]=B. הכנס E לתור.',
     10),

  W({ A:'black',   B:'black',   C:'gray', D:'gray',  E:'gray',  F:'white' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree' },
     ['C','D','E'], { A:0, B:1, C:1, D:2, E:2, F:'∞' },
     'כל שכני B עובדו. B → שחור.',
     15),

  W({ A:'black',   B:'black',   C:'current', D:'gray', E:'gray', F:'white' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree' },
     ['D','E'], { A:0, B:1, C:1, D:2, E:2, F:'∞' },
     'שלף C מהתור (u=C). בדוק שכניו: {F}.',
     8),

  W({ A:'black',   B:'black',   C:'current', D:'gray', E:'gray', F:'gray'  },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree', 'C->F':'active' },
     ['D','E','F'], { A:0, B:1, C:1, D:2, E:2, F:2 },
     'F לבן → צבע אפור, d[F]=2, π[F]=C. הכנס F לתור.',
     10),

  W({ A:'black',   B:'black',   C:'black',   D:'gray', E:'gray', F:'gray'  },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree', 'C->F':'tree' },
     ['D','E','F'], { A:0, B:1, C:1, D:2, E:2, F:2 },
     'כל שכני C עובדו. C → שחור.',
     15),

  W({ A:'black',   B:'black',   C:'black',   D:'current', E:'gray', F:'gray' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree', 'C->F':'tree' },
     ['E','F'], { A:0, B:1, C:1, D:2, E:2, F:2 },
     'שלף D מהתור (u=D). בדוק שכניו: {F}.',
     8),

  W({ A:'black',   B:'black',   C:'black',   D:'current', E:'gray', F:'gray' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree', 'C->F':'tree', 'D->F':'rejected' },
     ['E','F'], { A:0, B:1, C:1, D:2, E:2, F:2 },
     'F כבר אפור (בתור, לא לבן) → דלג על הקשת D→F.',
     9),

  W({ A:'black',   B:'black',   C:'black',   D:'black',   E:'gray', F:'gray' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree', 'C->F':'tree', 'D->F':'rejected' },
     ['E','F'], { A:0, B:1, C:1, D:2, E:2, F:2 },
     'D הסתיים. D → שחור.',
     15),

  W({ A:'black',   B:'black',   C:'black',   D:'black',   E:'current', F:'gray' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree', 'C->F':'tree', 'D->F':'rejected' },
     ['F'], { A:0, B:1, C:1, D:2, E:2, F:2 },
     'שלף E מהתור (u=E). אין שכנים לבנים.',
     8),

  W({ A:'black',   B:'black',   C:'black',   D:'black',   E:'black',  F:'gray' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree', 'C->F':'tree', 'D->F':'rejected' },
     ['F'], { A:0, B:1, C:1, D:2, E:2, F:2 },
     'E הסתיים. E → שחור.',
     15),

  W({ A:'black',   B:'black',   C:'black',   D:'black',   E:'black',  F:'current' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree', 'C->F':'tree', 'D->F':'rejected' },
     [], { A:0, B:1, C:1, D:2, E:2, F:2 },
     'שלף F מהתור (u=F). אין שכנים.',
     8),

  W({ A:'black',   B:'black',   C:'black',   D:'black',   E:'black',  F:'black' },
     { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'B->E':'tree', 'C->F':'tree', 'D->F':'rejected' },
     [], { A:0, B:1, C:1, D:2, E:2, F:2 },
     '✓ BFS הסתיים! התור ריק. עץ BFS: A→{B,C} B→{D,E} C→F',
     7),
];

const NODE_COLOR_LEGEND = [
  { state: 'white'   as NodeState, label: 'לא נגלה' },
  { state: 'gray'    as NodeState, label: 'בתור' },
  { state: 'current' as NodeState, label: 'מעובד כעת' },
  { state: 'black'   as NodeState, label: 'הסתיים' },
];

const NODE_FILL: Record<NodeState, string> = {
  white: '#4a4a6a', gray: '#EF9F27', current: '#7F77DD', black: '#1D9E75',
};

export default function BFSAnimation() {
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
            Object.entries(s.dist).map(([k, v]) => [k, `d=${v}`])
          )}
        />
      </div>

      {/* Info box */}
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

      {/* Queue + distances */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="rounded-lg p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>תור Q</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 28 }}>
            {s.queue.length === 0
              ? <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>ריק ∅</span>
              : s.queue.map((n, i) => (
                <span key={i} style={{
                  background: '#EF9F2720', border: '1px solid #EF9F27',
                  color: '#EF9F27', borderRadius: 4, padding: '2px 8px',
                  fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
                }}>
                  {n}
                </span>
              ))
            }
          </div>
        </div>

        <div className="rounded-lg p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>מרחקים d[v]</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(s.dist).map(([node, d]) => (
              <span key={node} style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--accent-purple)' }}>{node}</span>={d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {NODE_COLOR_LEGEND.map(({ state, label }) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: NODE_FILL[state], border: '2px solid ' + NODE_FILL[state],
            }} />
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <div style={{ width: 20, height: 2, background: '#1D9E75' }} />
          <span style={{ color: 'var(--text-secondary)' }}>קשת עץ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <div style={{ width: 20, height: 2, background: '#e03939', borderTop: '2px dashed #e03939' }} />
          <span style={{ color: 'var(--text-secondary)' }}>נדחית</span>
        </div>
      </div>

      {/* Controls */}
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
