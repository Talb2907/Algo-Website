export interface GNode { id: string; x: number; y: number; }
export interface GEdge { from: string; to: string; weight?: number; }

// General directed graph — BFS, DFS, Topological, SCC
export const GRAPH_GENERAL = {
  nodes: [
    { id: 'A', x: 70,  y: 130 },
    { id: 'B', x: 200, y: 60  },
    { id: 'C', x: 200, y: 200 },
    { id: 'D', x: 360, y: 60  },
    { id: 'E', x: 360, y: 200 },
    { id: 'F', x: 500, y: 130 },
  ] as GNode[],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'B', to: 'E' },
    { from: 'C', to: 'F' },
    { from: 'D', to: 'F' },
  ] as GEdge[],
};

// Weighted undirected graph — Dijkstra, Kruskal, Prim, Bellman-Ford
export const GRAPH_WEIGHTED = {
  nodes: [
    { id: 'S', x: 60,  y: 130 },
    { id: 'A', x: 180, y: 60  },
    { id: 'B', x: 180, y: 200 },
    { id: 'C', x: 340, y: 60  },
    { id: 'D', x: 340, y: 200 },
    { id: 'T', x: 500, y: 130 },
  ] as GNode[],
  edges: [
    { from: 'S', to: 'A', weight: 4  },
    { from: 'S', to: 'B', weight: 2  },
    { from: 'A', to: 'B', weight: 1  },
    { from: 'A', to: 'C', weight: 5  },
    { from: 'B', to: 'C', weight: 8  },
    { from: 'B', to: 'D', weight: 10 },
    { from: 'C', to: 'T', weight: 2  },
    { from: 'D', to: 'T', weight: 3  },
  ] as GEdge[],
};

// Flow network — Ford-Fulkerson, Edmonds-Karp
export const GRAPH_FLOW = {
  nodes: [
    { id: 's', x: 60,  y: 130 },
    { id: 'a', x: 190, y: 60  },
    { id: 'b', x: 370, y: 60  },
    { id: 'c', x: 190, y: 200 },
    { id: 'd', x: 370, y: 200 },
    { id: 't', x: 500, y: 130 },
  ] as GNode[],
  edges: [
    { from: 's', to: 'a', weight: 16 },
    { from: 's', to: 'c', weight: 13 },
    { from: 'a', to: 'b', weight: 12 },
    { from: 'a', to: 'c', weight: 10 },
    { from: 'c', to: 'a', weight: 4  },
    { from: 'b', to: 't', weight: 20 },
    { from: 'c', to: 'd', weight: 14 },
    { from: 'd', to: 'b', weight: 7  },
    { from: 'd', to: 't', weight: 4  },
  ] as GEdge[],
};
