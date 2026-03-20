'use client';

import { GNode, GEdge } from '@/data/graphs';

export type NodeState = 'white' | 'gray' | 'black' | 'current';
export type EdgeState = 'default' | 'active' | 'tree' | 'back' | 'cross' | 'forward' | 'rejected';

const NODE_R = 22;

const NODE_STYLE: Record<NodeState, { fill: string; stroke: string; text: string }> = {
  white:   { fill: '#1a1a24', stroke: '#4a4a6a', text: '#8888aa' },
  gray:    { fill: '#EF9F2720', stroke: '#EF9F27', text: '#EF9F27' },
  current: { fill: '#7F77DD28', stroke: '#7F77DD', text: '#c0bcff' },
  black:   { fill: '#1D9E7520', stroke: '#1D9E75', text: '#1D9E75' },
};

export const EDGE_COLOR: Record<EdgeState, string> = {
  default:  '#3a3a55',
  active:   '#EF9F27',
  tree:     '#1D9E75',
  back:     '#e03939',
  cross:    '#5B9BD5',
  forward:  '#c88aff',
  rejected: '#e03939',
};

export function edgeKey(from: string, to: string) {
  return `${from}->${to}`;
}

function getArrowPoints(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  return {
    sx: x1 + ux * NODE_R,
    sy: y1 + uy * NODE_R,
    ex: x2 - ux * (NODE_R + 9),
    ey: y2 - uy * (NODE_R + 9),
  };
}

function getMidpoint(x1: number, y1: number, x2: number, y2: number, offset = 0) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: mx - (dy / dist) * offset, y: my + (dx / dist) * offset };
}

interface GraphCanvasProps {
  nodes: GNode[];
  edges: GEdge[];
  directed?: boolean;
  nodeStates?: Record<string, NodeState>;
  edgeStates?: Record<string, EdgeState>;
  nodeLabels?: Record<string, string>;
  height?: number;
}

export default function GraphCanvas({
  nodes, edges,
  directed = true,
  nodeStates = {},
  edgeStates = {},
  nodeLabels = {},
  height = 260,
}: GraphCanvasProps) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox={`0 0 580 ${height}`}
      style={{ width: '100%', maxWidth: 580, overflow: 'visible' }}
    >
      <defs>
        {(Object.keys(EDGE_COLOR) as EdgeState[]).map((state) => (
          <marker
            key={state}
            id={`arr-${state}`}
            markerWidth="8" markerHeight="7"
            refX="6" refY="3.5"
            orient="auto"
          >
            <polygon points="0,0 8,3.5 0,7" fill={EDGE_COLOR[state]} />
          </marker>
        ))}
      </defs>

      {/* Edges */}
      {edges.map((e) => {
        const fn = nodeMap[e.from], tn = nodeMap[e.to];
        if (!fn || !tn) return null;
        const key = edgeKey(e.from, e.to);
        const state: EdgeState = edgeStates[key] ?? 'default';
        const color = EDGE_COLOR[state];
        const pts = getArrowPoints(fn.x, fn.y, tn.x, tn.y);
        const isDashed = state === 'rejected';
        const isThick  = state === 'tree' || state === 'active';
        const mid = getMidpoint(fn.x, fn.y, tn.x, tn.y, 10);

        return (
          <g key={key}>
            <line
              x1={pts.sx} y1={pts.sy} x2={pts.ex} y2={pts.ey}
              stroke={color}
              strokeWidth={isThick ? 2.5 : 1.5}
              strokeDasharray={isDashed ? '5,3' : undefined}
              markerEnd={directed ? `url(#arr-${state})` : undefined}
              strokeLinecap="round"
            />
            {e.weight !== undefined && (
              <text
                x={mid.x} y={mid.y}
                fontSize="11" fontFamily="monospace"
                fill={color} textAnchor="middle" dominantBaseline="middle"
              >
                {e.weight}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => {
        const state: NodeState = nodeStates[n.id] ?? 'white';
        const s = NODE_STYLE[state];
        const extra = nodeLabels[n.id];
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={NODE_R} fill={s.fill} stroke={s.stroke} strokeWidth={2} />
            <text
              x={n.x} y={n.y + (extra ? -5 : 1)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="14" fontWeight="700" fill={s.text} fontFamily="monospace"
            >
              {n.id}
            </text>
            {extra && (
              <text
                x={n.x} y={n.y + 10}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fill={s.text} fontFamily="monospace"
              >
                {extra}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
