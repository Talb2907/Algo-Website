import { AlgorithmContent } from '@/types';
import basics from './basics';
import bfs from './bfs';
import dfs from './dfs';
import topological from './topological';
import scc from './scc';
import kruskal from './kruskal';
import prim from './prim';
import dijkstra from './dijkstra';
import bellmanFord from './bellman-ford';
import floydWarshall from './floyd-warshall';
import dagSp from './dag-sp';
import huffman from './huffman';
import astar from './astar';
import fordFulkerson from './ford-fulkerson';
import edmondsKarp from './edmonds-karp';
import mergesort from './mergesort';

export const CONTENT: Record<string, AlgorithmContent> = {
  basics,
  bfs,
  dfs,
  topological,
  scc,
  kruskal,
  prim,
  dijkstra,
  'bellman-ford': bellmanFord,
  'floyd-warshall': floydWarshall,
  'dag-sp': dagSp,
  huffman,
  astar,
  'ford-fulkerson': fordFulkerson,
  'edmonds-karp': edmondsKarp,
  mergesort,
};
