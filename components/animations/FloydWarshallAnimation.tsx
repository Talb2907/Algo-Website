'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GNode, GEdge } from '@/data/graphs';

type NS = Record<string, NodeState>;
type ES = Record<string, EdgeState>;
type Val = number | '∞';
type Row = Record<string, Val>;
type Matrix = Record<string, Row>;

interface Step {
  ns: NS; es: ES;
  matrix: Matrix;
  k: string | null;
  updated: [string, string][];
  info: string;
}

const mk = (
  ns: NS, es: ES, matrix: Matrix,
  k: string | null, updated: [string, string][],
  info: string
): Step => ({ ns, es, matrix, k, updated, info });

// Custom 4-node directed weighted graph
const FW_NODES: GNode[] = [
  { id: 'A', x: 100, y: 130 },
  { id: 'B', x: 280, y: 58  },
  { id: 'C', x: 280, y: 202 },
  { id: 'D', x: 450, y: 130 },
];

const FW_EDGES: GEdge[] = [
  { from: 'A', to: 'B', weight: 3 },
  { from: 'A', to: 'C', weight: 8 },
  { from: 'B', to: 'D', weight: 1 },
  { from: 'C', to: 'B', weight: 4 },
  { from: 'D', to: 'C', weight: 2 },
];

const INF = '∞';
const W: NS = { A:'white', B:'white', C:'white', D:'white' };

// Matrix snapshots
const M0: Matrix = {
  A: { A:0,   B:3,   C:8,   D:INF },
  B: { A:INF, B:0,   C:INF, D:1   },
  C: { A:INF, B:4,   C:0,   D:INF },
  D: { A:INF, B:INF, C:2,   D:0   },
};
// After k=B: A→D=4, C→D=5
const M1: Matrix = {
  A: { A:0,   B:3,   C:8,   D:4   },
  B: { A:INF, B:0,   C:INF, D:1   },
  C: { A:INF, B:4,   C:0,   D:5   },
  D: { A:INF, B:INF, C:2,   D:0   },
};
// After k=C: D→B=6
const M2: Matrix = {
  A: { A:0,   B:3,   C:8,   D:4   },
  B: { A:INF, B:0,   C:INF, D:1   },
  C: { A:INF, B:4,   C:0,   D:5   },
  D: { A:INF, B:6,   C:2,   D:0   },
};
// After k=D: A→C=6, B→C=3
const M3: Matrix = {
  A: { A:0,   B:3,   C:6,   D:4   },
  B: { A:INF, B:0,   C:3,   D:1   },
  C: { A:INF, B:4,   C:0,   D:5   },
  D: { A:INF, B:6,   C:2,   D:0   },
};

const STEPS: Step[] = [
  mk(W, {}, M0, null, [],
    'פלויד-וורשל: מחשב מרחקים קצרים ביותר בין כל זוג צמתים. D[i][j] = משקל קשת ישירה (∞ אם אין).'),

  mk({ ...W, A:'current' }, {}, M0, 'A', [],
    'k=A: בדוק כל זוג (i,j) — האם i→A→j קצר מ-i→j? dist[i][A]=∞ לכל i≠A → אין שיפור.'),

  mk({ ...W, B:'current' }, { 'A->B':'active', 'B->D':'active' }, M0, 'B', [],
    'k=B: בדוק A→B→D: dist[A][B]+dist[B][D] = 3+1 = 4 < ∞. עדכן! גם C→B→D: 4+1=5 < ∞. עדכן!'),

  mk({ ...W, B:'current' }, { 'A->B':'tree', 'B->D':'tree', 'C->B':'tree' }, M1, 'B',
    [['A','D'],['C','D']],
    'k=B: עדכון D[A][D]=4, D[C][D]=5. כעת ידוע שקיים נתיב A→B→D באורך 4 ו-C→B→D באורך 5.'),

  mk({ ...W, C:'current' }, { 'D->C':'active', 'C->B':'active' }, M1, 'C', [],
    'k=C: בדוק D→C→B: dist[D][C]+dist[C][B] = 2+4 = 6 < ∞. עדכן D[D][B]=6!'),

  mk({ ...W, C:'current' }, { 'D->C':'tree', 'C->B':'tree' }, M2, 'C',
    [['D','B']],
    'k=C: עדכון D[D][B]=6. כעת ידוע שקיים נתיב D→C→B באורך 6.'),

  mk({ ...W, D:'current' }, { 'A->D':'active', 'D->C':'active' }, M2, 'D', [],
    'k=D: בדוק A→D→C: dist[A][D]+dist[D][C] = 4+2 = 6 < 8. עדכן D[A][C]=6! גם B→D→C: 1+2=3 < ∞.'),

  mk({ ...W, D:'current' },
    { 'A->B':'tree', 'B->D':'tree', 'D->C':'tree' }, M3, 'D',
    [['A','C'],['B','C']],
    'k=D: עדכון D[A][C]=6 (A→D→C), D[B][C]=3 (B→D→C). כל הצמתים נבדקו כ-k.'),

  mk({ A:'black', B:'black', C:'black', D:'black' },
    { 'A->B':'tree', 'A->C':'tree', 'B->D':'tree', 'C->B':'tree', 'D->C':'tree' },
    M3, null, [],
    '✓ פלויד-וורשל הסתיים! מטריצת המרחקים הסופית מכילה מסלול קצר ביותר בין כל זוג צמתים. מורכבות: Θ(V³).'),
];

const NODES = ['A','B','C','D'];

function MatrixTable({ matrix, k, updated }: { matrix: Matrix; k: string | null; updated: [string,string][] }) {
  const isUpdated = (r: string, c: string) => updated.some(([ur, uc]) => ur === r && uc === c);
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ borderCollapse:'collapse', fontFamily:'monospace', fontSize:13, margin:'0 auto' }}>
        <thead>
          <tr>
            <th style={{ padding:'4px 10px', color:'var(--text-secondary)', fontWeight:400 }}>i \ j</th>
            {NODES.map(c => (
              <th key={c} style={{
                padding:'4px 14px', textAlign:'center', fontWeight:700,
                color: c === k ? 'var(--accent-purple)' : 'var(--text-secondary)',
                borderBottom: c === k ? '2px solid var(--accent-purple)' : '1px solid var(--border)',
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {NODES.map(r => (
            <tr key={r}>
              <td style={{
                padding:'4px 10px', fontWeight:700, textAlign:'center',
                color: r === k ? 'var(--accent-purple)' : 'var(--text-secondary)',
                borderRight: r === k ? '2px solid var(--accent-purple)' : '1px solid var(--border)',
              }}>{r}</td>
              {NODES.map(c => {
                const val = matrix[r][c];
                const upd = isUpdated(r, c);
                const isDiag = r === c;
                const isInf = val === INF;
                return (
                  <td key={c} style={{
                    padding:'5px 14px', textAlign:'center',
                    background: upd ? '#1D9E7530' : isDiag ? '#1a1a24' : 'transparent',
                    border: upd ? '1px solid var(--accent-green)' : '1px solid transparent',
                    borderRadius: upd ? 4 : 0,
                    color: upd ? 'var(--accent-green)'
                         : isDiag ? 'var(--text-secondary)'
                         : isInf  ? '#3a3a55'
                         : 'var(--accent-gold)',
                    fontWeight: upd ? 800 : 600,
                    transition: 'all 0.2s',
                  }}>
                    {val === INF ? '∞' : val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FloydWarshallAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Graph */}
      <div className="rounded-lg" style={{ background:'#0a0a12', border:'1px solid var(--border)', padding:'10px 8px' }}>
        <GraphCanvas
          nodes={FW_NODES} edges={FW_EDGES}
          directed nodeStates={s.ns} edgeStates={s.es}
          height={240}
        />
      </div>

      {/* Matrix */}
      <div className="rounded-lg p-4" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>מטריצת מרחקים D[i][j]</span>
          {s.k && (
            <span style={{ padding:'2px 10px', borderRadius:12, fontSize:11,
              background:'#7F77DD20', border:'1px solid var(--accent-purple)', color:'var(--accent-purple)', fontWeight:700 }}>
              k = {s.k}
            </span>
          )}
        </div>
        <MatrixTable matrix={s.matrix} k={s.k} updated={s.updated} />
      </div>

      {/* Info */}
      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-purple)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-purple)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
      </div>

      {/* Recurrence */}
      <div style={{
        padding:'8px 14px', borderRadius:8, fontSize:12,
        background:'#5B9BD518', border:'1px solid #5B9BD5', color:'var(--text-primary)',
      }}>
        <span style={{ fontWeight:700, color:'#5B9BD5' }}>נוסחת הנסיגה: </span>
        D[i][j] = min( D[i][j], D[i][k] + D[k][j] ) לכל k, i, j. שלוש לולאות מקוננות → O(V³).
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
