'use client';

import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';

interface Step {
  heap: { label: string; freq: number }[];
  treeNodes: TreeNode[];
  highlight: string[];
  merging: [string, string] | null;
  info: string;
}

interface TreeNode {
  id: string;
  label: string;
  freq: number;
  x: number; y: number;
  left?: string; right?: string;
  isLeaf?: boolean;
}

// Tree layout — fixed positions for the final tree
// Root (15) at top, then EDC(6)/BA(9), then leaves
const ALL_NODES: Record<string, TreeNode> = {
  root: { id:'root', label:'15', freq:15, x:290, y:28 },
  edc:  { id:'edc',  label:'6',  freq:6,  x:155, y:108, left:'ed', right:'c' },
  ba:   { id:'ba',   label:'9',  freq:9,  x:425, y:108, left:'b',  right:'a' },
  ed:   { id:'ed',   label:'3',  freq:3,  x:80,  y:188, left:'e',  right:'d' },
  c:    { id:'c',    label:'C',  freq:3,  x:230, y:188, isLeaf:true },
  b:    { id:'b',    label:'B',  freq:4,  x:370, y:188, isLeaf:true },
  a:    { id:'a',    label:'A',  freq:5,  x:500, y:188, isLeaf:true },
  e:    { id:'e',    label:'E',  freq:1,  x:40,  y:268, isLeaf:true },
  d:    { id:'d',    label:'D',  freq:2,  x:130, y:268, isLeaf:true },
};

function buildStep(
  heapItems: { label: string; freq: number }[],
  visible: string[],
  highlight: string[],
  merging: [string, string] | null,
  info: string
): Step {
  return {
    heap: heapItems,
    treeNodes: visible.map(id => ALL_NODES[id]),
    highlight,
    merging,
    info,
  };
}

const STEPS: Step[] = [
  buildStep(
    [{ label:'E', freq:1 },{ label:'D', freq:2 },{ label:'C', freq:3 },{ label:'B', freq:4 },{ label:'A', freq:5 }],
    [], [], null,
    'האפמן: הכנס כל תו כצומת עלה ל-min-heap. תמיד מיזוג שני הצמתים עם התדירות הנמוכה ביותר.'
  ),
  buildStep(
    [{ label:'E', freq:1 },{ label:'D', freq:2 },{ label:'C', freq:3 },{ label:'B', freq:4 },{ label:'A', freq:5 }],
    ['e','d'], ['e','d'], ['e','d'],
    'מיזוג 1: שלוף E(1) ו-D(2) — הקטנים ביותר. צור צומת פנימי ED עם תדירות 1+2=3.'
  ),
  buildStep(
    [{ label:'ED', freq:3 },{ label:'C', freq:3 },{ label:'B', freq:4 },{ label:'A', freq:5 }],
    ['e','d','ed'], ['ed'], null,
    'ED(3) הוכנס ל-heap. heap: {ED:3, C:3, B:4, A:5}.'
  ),
  buildStep(
    [{ label:'ED', freq:3 },{ label:'C', freq:3 },{ label:'B', freq:4 },{ label:'A', freq:5 }],
    ['e','d','ed','c'], ['ed','c'], ['ed','c'],
    'מיזוג 2: שלוף ED(3) ו-C(3). צור צומת פנימי EDC עם תדירות 3+3=6.'
  ),
  buildStep(
    [{ label:'B', freq:4 },{ label:'A', freq:5 },{ label:'EDC', freq:6 }],
    ['e','d','ed','c','edc'], ['edc'], null,
    'EDC(6) הוכנס ל-heap. heap: {B:4, A:5, EDC:6}.'
  ),
  buildStep(
    [{ label:'B', freq:4 },{ label:'A', freq:5 },{ label:'EDC', freq:6 }],
    ['e','d','ed','c','edc','b','a'], ['b','a'], ['b','a'],
    'מיזוג 3: שלוף B(4) ו-A(5). צור צומת פנימי BA עם תדירות 4+5=9.'
  ),
  buildStep(
    [{ label:'EDC', freq:6 },{ label:'BA', freq:9 }],
    ['e','d','ed','c','edc','b','a','ba'], ['ba'], null,
    'BA(9) הוכנס ל-heap. heap: {EDC:6, BA:9}.'
  ),
  buildStep(
    [{ label:'EDC', freq:6 },{ label:'BA', freq:9 }],
    ['e','d','ed','c','edc','b','a','ba','root'], ['edc','ba','root'], ['edc','ba'],
    'מיזוג 4 (אחרון): שלוף EDC(6) ו-BA(9). שורש עם תדירות 6+9=15. עץ הופמן הושלם!'
  ),
  buildStep(
    [{ label:'ROOT', freq:15 }],
    Object.keys(ALL_NODES), ['e','d','c','b','a'], null,
    '✓ עץ הופמן מוכן! קודים: E=000, D=001, C=01, B=10, A=11. ביטים כוללים: 1×3+2×3+3×2+4×2+5×2=33.'
  ),
];

const NODE_R = 20;
const NODE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  leaf:     { fill:'#7F77DD28', stroke:'var(--accent-purple)', text:'var(--accent-purple)' },
  internal: { fill:'#1D9E7518', stroke:'var(--accent-green)',  text:'var(--accent-green)'  },
  highlight:{ fill:'#EF9F2730', stroke:'var(--accent-gold)',   text:'var(--accent-gold)'   },
};

const CODES: [string, string, string][] = [
  ['E','000','3 ביטים'],
  ['D','001','3 ביטים'],
  ['C','01', '2 ביטים'],
  ['B','10', '2 ביטים'],
  ['A','11', '2 ביטים'],
];

function TreeSVG({ nodes, highlight }: { nodes: TreeNode[]; highlight: string[] }) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const edges: { x1:number; y1:number; x2:number; y2:number; label:string }[] = [];

  nodes.forEach(n => {
    if (n.left && nodeMap[n.left]) {
      const c = nodeMap[n.left];
      edges.push({ x1:n.x, y1:n.y, x2:c.x, y2:c.y, label:'0' });
    }
    if (n.right && nodeMap[n.right]) {
      const c = nodeMap[n.right];
      edges.push({ x1:n.x, y1:n.y, x2:c.x, y2:c.y, label:'1' });
    }
  });

  return (
    <svg viewBox="0 0 580 300" style={{ width:'100%' }}>
      {/* Edges */}
      {edges.map((e,i) => {
        const mx = (e.x1+e.x2)/2, my = (e.y1+e.y2)/2;
        return (
          <g key={i}>
            <line x1={e.x1} y1={e.y1+NODE_R} x2={e.x2} y2={e.y2-NODE_R}
              stroke="var(--border)" strokeWidth={1.5} />
            <text x={mx-8} y={my} fontSize="11" fill="var(--accent-gold)"
              fontFamily="monospace" fontWeight="700">{e.label}</text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(n => {
        const isHl = highlight.includes(n.id);
        const style = isHl ? NODE_COLORS.highlight : n.isLeaf ? NODE_COLORS.leaf : NODE_COLORS.internal;
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={NODE_R} fill={style.fill} stroke={style.stroke} strokeWidth={2} />
            <text x={n.x} y={n.y + (n.isLeaf ? -5 : 1)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="13" fontWeight="700" fill={style.text} fontFamily="monospace">
              {n.label}
            </text>
            {n.isLeaf && (
              <text x={n.x} y={n.y+10}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fill={style.text} fontFamily="monospace">
                {n.freq}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function HuffmanAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];
  const showCodes = anim.step === STEPS.length - 1;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Tree */}
      <div className="rounded-lg" style={{ background:'#0a0a12', border:'1px solid var(--border)', padding:'12px 8px 4px' }}>
        {s.treeNodes.length > 0
          ? <TreeSVG nodes={s.treeNodes} highlight={s.highlight} />
          : <div style={{ height:100, display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--text-secondary)', fontSize:13 }}>
              הכנס צמתי עלה ל-heap...
            </div>
        }
      </div>

      {/* Min-heap */}
      <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
          Min-Heap (ממוין לפי תדירות)
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
          {s.heap.map((item, i) => {
            const isMerge = s.merging && (item.label === s.merging[0] || item.label === s.merging[1]);
            return (
              <span key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{
                  padding:'4px 12px', borderRadius:6, fontFamily:'monospace',
                  fontSize:13, fontWeight:700,
                  background: isMerge ? '#EF9F2730' : '#1a1a24',
                  border: `1px solid ${isMerge ? 'var(--accent-gold)' : 'var(--border)'}`,
                  color: isMerge ? 'var(--accent-gold)' : 'var(--text-primary)',
                }}>
                  {item.label}:{item.freq}
                </span>
                {i < s.heap.length-1 && <span style={{ color:'var(--border)' }}>|</span>}
              </span>
            );
          })}
          {s.heap.length === 0 && <span style={{ color:'var(--text-secondary)', fontSize:12 }}>ריק</span>}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-purple)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-purple)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
      </div>

      {/* Final codes table */}
      {showCodes && (
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--accent-green)' }}>
          <div style={{ fontSize:11, color:'var(--accent-green)', fontWeight:600, marginBottom:8 }}>
            ✓ קודי הופמן (קידוד קידומת — לא עמום)
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
            {CODES.map(([ch, code, bits]) => (
              <div key={ch} style={{ textAlign:'center', padding:'6px 4px', borderRadius:6,
                background:'#1D9E7518', border:'1px solid var(--accent-green)' }}>
                <div style={{ fontSize:16, fontWeight:800, color:'var(--accent-green)', fontFamily:'monospace' }}>{ch}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', fontFamily:'monospace' }}>{code}</div>
                <div style={{ fontSize:10, color:'var(--text-secondary)' }}>{bits}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
