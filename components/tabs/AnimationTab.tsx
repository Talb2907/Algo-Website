'use client';

import dynamic from 'next/dynamic';
import { AlgorithmMeta } from '@/types';

const BFSAnimation          = dynamic(() => import('@/components/animations/BFSAnimation'),          { ssr: false });
const DFSAnimation          = dynamic(() => import('@/components/animations/DFSAnimation'),          { ssr: false });
const DijkstraAnimation     = dynamic(() => import('@/components/animations/DijkstraAnimation'),     { ssr: false });
const KruskalAnimation      = dynamic(() => import('@/components/animations/KruskalAnimation'),      { ssr: false });
const PrimAnimation         = dynamic(() => import('@/components/animations/PrimAnimation'),         { ssr: false });
const BellmanFordAnimation  = dynamic(() => import('@/components/animations/BellmanFordAnimation'),  { ssr: false });
const TopologicalAnimation  = dynamic(() => import('@/components/animations/TopologicalAnimation'),  { ssr: false });
const SCCAnimation          = dynamic(() => import('@/components/animations/SCCAnimation'),          { ssr: false });
const FordFulkersonAnimation = dynamic(() => import('@/components/animations/FordFulkersonAnimation'), { ssr: false });
const HuffmanAnimation       = dynamic(() => import('@/components/animations/HuffmanAnimation'),       { ssr: false });
const FloydWarshallAnimation = dynamic(() => import('@/components/animations/FloydWarshallAnimation'), { ssr: false });
const DAGSPAnimation         = dynamic(() => import('@/components/animations/DAGSPAnimation'),         { ssr: false });
const AStarAnimation         = dynamic(() => import('@/components/animations/AStarAnimation'),         { ssr: false });
const EdmondsKarpAnimation   = dynamic(() => import('@/components/animations/EdmondsKarpAnimation'),   { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ANIMATION_MAP: Partial<Record<string, React.ComponentType<any>>> = {
  bfs:             BFSAnimation,
  dfs:             DFSAnimation,
  dijkstra:        DijkstraAnimation,
  kruskal:         KruskalAnimation,
  prim:            PrimAnimation,
  'bellman-ford':  BellmanFordAnimation,
  topological:     TopologicalAnimation,
  scc:             SCCAnimation,
  'ford-fulkerson':  FordFulkersonAnimation,
  huffman:           HuffmanAnimation,
  'floyd-warshall':  FloydWarshallAnimation,
  'dag-sp':          DAGSPAnimation,
  astar:             AStarAnimation,
  'edmonds-karp':    EdmondsKarpAnimation,
};

interface Props { meta: AlgorithmMeta; }

export default function AnimationTab({ meta }: Props) {
  const AnimComponent = ANIMATION_MAP[meta.slug];

  if (!meta.hasAnimation || !AnimComponent) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: 280, gap: 12,
      }}>
        <span style={{ fontSize: 44 }}>🚧</span>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          {meta.hasAnimation ? 'אנימציה תתווסף בקרוב' : 'אין אנימציה לפרק זה'}
        </p>
      </div>
    );
  }

  return <AnimComponent />;
}
