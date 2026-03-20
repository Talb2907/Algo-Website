'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GNode, GEdge } from '@/data/graphs';

type NS = Record<string, NodeState>;
type ES = Record<string, EdgeState>;
type Val = number | '∞';

interface Step {
  ns: NS; es: ES;
  dist: Record<string, Val>;
  pi: Record<string, string>;
  active: string | null;
  info: string;
}

const mk = (
  ns: NS, es: ES,
  dist: Record<string, Val>, pi: Record<string, string>,
  active: string | null, info: string
): Step => ({ ns, es, dist, pi, active, info });

// Weighted DAG: A→B:5, A→C:3, B→C:2, B→D:6, C→D:7, C→E:4, D→E:1
// Topological order: A, B, C, D, E
// Source: A. Distances: A=0, B=5, C=3, D=10, E=7

const DAG_NODES: GNode[] = [
  { id: 'A', x: 70,  y: 130 },
  { id: 'B', x: 230, y: 60  },
  { id: 'C', x: 230, y: 200 },
  { id: 'D', x: 390, y: 130 },
  { id: 'E', x: 520, y: 130 },
];

const DAG_EDGES: GEdge[] = [
  { from: 'A', to: 'B', weight: 5 },
  { from: 'A', to: 'C', weight: 3 },
  { from: 'B', to: 'C', weight: 2 },
  { from: 'B', to: 'D', weight: 6 },
  { from: 'C', to: 'D', weight: 7 },
  { from: 'C', to: 'E', weight: 4 },
  { from: 'D', to: 'E', weight: 1 },
];

const W: NS = { A:'white', B:'white', C:'white', D:'white', E:'white' };
const D0 = { A:0 as Val, B:'∞' as Val, C:'∞' as Val, D:'∞' as Val, E:'∞' as Val };
const P0 = { A:'-', B:'-', C:'-', D:'-', E:'-' };

const TOPO = ['A','B','C','D','E'];

const STEPS: Step[] = [
  mk(W, {}, D0, P0, null,
    'DAG-SP: מיין טופולוגית, אתחל d[s]=0 ו-d[v]=∞. עבור על כל צומת לפי הסדר ובצע RELAX על כל קשת יוצאת.'),

  mk({ ...W, A:'current' }, {},
    D0, P0, 'A',
    'סדר טופולוגי: A → B → C → D → E. עבד A ראשון (d[A]=0).'),

  mk({ ...W, A:'current' },
    { 'A->B':'active', 'A->C':'active' },
    { A:0, B:5, C:3, D:'∞', E:'∞' },
    { A:'-', B:'A', C:'A', D:'-', E:'-' }, 'A',
    'RELAX(A→B): d[B]=min(∞,0+5)=5 ✓. RELAX(A→C): d[C]=min(∞,0+3)=3 ✓.'),

  mk({ ...W, A:'black', B:'current' },
    { 'A->B':'tree', 'A->C':'tree', 'B->C':'cross', 'B->D':'active' },
    { A:0, B:5, C:3, D:11, E:'∞' },
    { A:'-', B:'A', C:'A', D:'B', E:'-' }, 'B',
    'עבד B (d[B]=5). RELAX(B→C): d[C]=min(3, 5+2=7)=3 — אין שיפור. RELAX(B→D): d[D]=min(∞,5+6)=11 ✓.'),

  mk({ ...W, A:'black', B:'black', C:'current' },
    { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->D':'active', 'C->E':'active' },
    { A:0, B:5, C:3, D:10, E:7 },
    { A:'-', B:'A', C:'A', D:'C', E:'C' }, 'C',
    'עבד C (d[C]=3). RELAX(C→D): d[D]=min(11,3+7=10)=10 ✓ עדכון! π[D]←C. RELAX(C→E): d[E]=min(∞,3+4)=7 ✓.'),

  mk({ ...W, A:'black', B:'black', C:'black', D:'current' },
    { 'A->B':'tree', 'A->C':'tree', 'B->D':'rejected', 'C->D':'tree', 'C->E':'tree', 'D->E':'cross' },
    { A:0, B:5, C:3, D:10, E:7 },
    { A:'-', B:'A', C:'A', D:'C', E:'C' }, 'D',
    'עבד D (d[D]=10). RELAX(D→E): d[E]=min(7,10+1=11)=7 — אין שיפור. עבד E — אין קשתות יוצאות.'),

  mk({ A:'black', B:'black', C:'black', D:'black', E:'black' },
    { 'A->B':'tree', 'A->C':'tree', 'C->D':'tree', 'C->E':'tree' },
    { A:0, B:5, C:3, D:10, E:7 },
    { A:'-', B:'A', C:'A', D:'C', E:'C' }, null,
    '✓ DAG-SP הסתיים! מרחקים: A=0, B=5, C=3, D=10, E=7. מורכבות O(V+E) — מהיר מ-Bellman-Ford O(VE).'),
];

const NODES_ORDER = ['A','B','C','D','E'];

export default function DAGSPAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Topological order bar */}
      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
        <span style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600 }}>סדר טופולוגי:</span>
        {TOPO.map((n, i) => (
          <span key={n} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{
              padding:'3px 10px', borderRadius:5, fontSize:12, fontFamily:'monospace', fontWeight:700,
              background: s.active===n ? '#7F77DD28' : s.ns[n]==='black' ? '#1D9E7520' : '#1a1a24',
              border: `1px solid ${s.active===n ? 'var(--accent-purple)' : s.ns[n]==='black' ? 'var(--accent-green)' : 'var(--border)'}`,
              color: s.active===n ? 'var(--accent-purple)' : s.ns[n]==='black' ? 'var(--accent-green)' : 'var(--text-secondary)',
            }}>{n}</span>
            {i < TOPO.length-1 && <span style={{ color:'var(--border)' }}>→</span>}
          </span>
        ))}
      </div>

      {/* Graph */}
      <div className="rounded-lg" style={{ background:'#0a0a12', border:'1px solid var(--border)', padding:'10px 8px' }}>
        <GraphCanvas
          nodes={DAG_NODES} edges={DAG_EDGES}
          directed nodeStates={s.ns} edgeStates={s.es}
          nodeLabels={Object.fromEntries(
            NODES_ORDER.map(n => [n, s.dist[n] === '∞' ? '∞' : `${s.dist[n]}`])
          )}
        />
      </div>

      {/* Info */}
      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-purple)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-purple)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Distance table */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>d[v] — מרחק מ-A</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {NODES_ORDER.map(k => (
              <div key={k} style={{ textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:'monospace' }}>{k}</div>
                <div style={{ fontSize:13, fontFamily:'monospace', fontWeight:700,
                  color: s.dist[k]==='∞' ? 'var(--text-secondary)' : 'var(--accent-gold)' }}>
                  {s.dist[k]===0 ? '0' : s.dist[k]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* π table */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>π[v] — קודם בנתיב</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {NODES_ORDER.map(k => (
              <div key={k} style={{ textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:'monospace' }}>{k}</div>
                <div style={{ fontSize:13, fontFamily:'monospace', fontWeight:700, color:'var(--text-primary)' }}>
                  {s.pi[k]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'8px 12px', borderRadius:8, fontSize:12,
        background:'#1D9E7518', border:'1px solid var(--accent-green)', color:'var(--text-primary)' }}>
        <span style={{ fontWeight:700, color:'var(--accent-green)' }}>יתרון: </span>
        DAG מובטח ללא מעגלים → RELAX בסדר טופולוגי מבטיח שכל צומת מטופל אחרי כל קודמיו. עובד גם עם משקלים שליליים!
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
