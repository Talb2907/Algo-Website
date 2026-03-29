export type AlgorithmSlug =
  | 'basics'
  | 'bfs'
  | 'dfs'
  | 'topological'
  | 'scc'
  | 'kruskal'
  | 'prim'
  | 'dijkstra'
  | 'bellman-ford'
  | 'floyd-warshall'
  | 'dag-sp'
  | 'huffman'
  | 'astar'
  | 'ford-fulkerson'
  | 'edmonds-karp'
  | 'mergesort';

export type AlgorithmGroup = 'graph' | 'mst' | 'sp' | 'greedy' | 'flow' | 'sorting';

export interface AlgorithmMeta {
  slug: AlgorithmSlug;
  name: string;
  nameEn: string;
  group: AlgorithmGroup;
  hasAnimation: boolean;
}

export interface Question {
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface AlgorithmContent {
  slug: AlgorithmSlug;
  title: string;
  goal: string;
  input: string;
  output: string;
  pseudocode: string;
  notes: string[];
  timeComplexity: string;
  spaceComplexity: string;
  questions: Question[];
}

export interface QuizScore {
  correct: number;
  total: number;
  answered: Record<number, boolean>;
  selected: Record<number, number>; // questionIdx → chosen option idx
}
