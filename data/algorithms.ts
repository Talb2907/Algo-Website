import { AlgorithmGroup, AlgorithmMeta, AlgorithmSlug } from '@/types';

export const GROUP_LABELS: Record<AlgorithmGroup, string> = {
  graph: 'גרפים',
  mst: 'עץ פורש מינימלי',
  sp: 'מסלולים קלים',
  greedy: 'אלגוריתמים חמדניים',
  flow: 'זרימה ברשת',
};

export const GROUP_COLORS: Record<AlgorithmGroup, string> = {
  graph: '#7F77DD',
  mst: '#1D9E75',
  sp: '#EF9F27',
  greedy: '#E07B39',
  flow: '#5B9BD5',
};

export const ALGORITHMS: AlgorithmMeta[] = [
  // Graph
  { slug: 'basics',        name: 'הגדרות בסיסיות', nameEn: 'Graph Basics',     group: 'graph',  hasAnimation: false },
  { slug: 'bfs',           name: 'BFS — חיפוש לרוחב', nameEn: 'BFS',           group: 'graph',  hasAnimation: true  },
  { slug: 'dfs',           name: 'DFS — חיפוש לעומק', nameEn: 'DFS',           group: 'graph',  hasAnimation: true  },
  { slug: 'topological',   name: 'מיון טופולוגי',    nameEn: 'Topological Sort', group: 'graph', hasAnimation: true  },
  { slug: 'scc',           name: 'SCC — רכיבים קשירים', nameEn: 'SCC',         group: 'graph',  hasAnimation: true  },
  // MST
  { slug: 'kruskal',       name: "Kruskal",            nameEn: 'Kruskal',        group: 'mst',   hasAnimation: true  },
  { slug: 'prim',          name: "Prim",                nameEn: 'Prim',           group: 'mst',   hasAnimation: true  },
  // Shortest Paths
  { slug: 'dijkstra',      name: "Dijkstra",            nameEn: 'Dijkstra',       group: 'sp',    hasAnimation: true  },
  { slug: 'bellman-ford',  name: "Bellman-Ford",        nameEn: 'Bellman-Ford',   group: 'sp',    hasAnimation: true  },
  { slug: 'floyd-warshall',name: "Floyd-Warshall",      nameEn: 'Floyd-Warshall', group: 'sp',    hasAnimation: true  },
  { slug: 'dag-sp',        name: "DAG Shortest Paths",  nameEn: 'DAG SP',         group: 'sp',    hasAnimation: true  },
  // Greedy
  { slug: 'huffman',       name: "קוד הופמן",           nameEn: 'Huffman Coding', group: 'greedy',hasAnimation: true  },
  { slug: 'astar',         name: "A*",                  nameEn: 'A*',             group: 'greedy',hasAnimation: true  },
  // Flow
  { slug: 'ford-fulkerson',name: "Ford-Fulkerson",      nameEn: 'Ford-Fulkerson', group: 'flow',  hasAnimation: true  },
  { slug: 'edmonds-karp',  name: "Edmonds-Karp",        nameEn: 'Edmonds-Karp',   group: 'flow',  hasAnimation: true  },
];

export const ALGORITHM_BY_SLUG = Object.fromEntries(
  ALGORITHMS.map((a) => [a.slug, a])
) as Record<AlgorithmSlug, AlgorithmMeta>;

export const ALGORITHMS_BY_GROUP = ALGORITHMS.reduce<Partial<Record<AlgorithmGroup, AlgorithmMeta[]>>>(
  (acc, alg) => {
    if (!acc[alg.group]) acc[alg.group] = [];
    acc[alg.group]!.push(alg);
    return acc;
  },
  {}
) as Record<AlgorithmGroup, AlgorithmMeta[]>;

export const GROUP_ORDER: AlgorithmGroup[] = ['graph', 'mst', 'sp', 'greedy', 'flow'];
