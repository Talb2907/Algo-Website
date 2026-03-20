import { AlgorithmContent } from '@/types';

const floydWarshall: AlgorithmContent = {
  slug: 'floyd-warshall',
  title: 'Floyd-Warshall',
  goal: 'מוצא מסלולים קלים ביותר בין כל זוג צמתים (All-Pairs Shortest Paths).',
  input: 'מטריצת משקלים W של גרף G',
  output: 'מטריצה D^(n) — D[i][j] = מרחק קצר מ-i ל-j',
  pseudocode: `FLOYD-WARSHALL(W):
  n = W.rows
  D^(0) = W
  for k = 1 to n:
    for i = 1 to n:
      for j = 1 to n:
        d[i][j]^(k) = min(d[i][j]^(k-1),
                          d[i][k]^(k-1) + d[k][j]^(k-1))
  return D^(n)

// נוסחה:
// d^(k)[i][j] = min(d^(k-1)[i][j],
//                   d^(k-1)[i][k] + d^(k-1)[k][j])`,
  notes: [
    'k = צומת ביניים מותר (מ-{1,...,k})',
    'D^(0) = W (מטריצת המשקלים המקורית)',
    'מעגל שלילי: D[i][i] < 0 לאיזשהו i',
    'מטריצת π[i][j] שומרת אבות לשחזור מסלולים',
    'שלוש לולאות מקוננות על n צמתים = O(V³)',
  ],
  timeComplexity: 'O(V³)',
  spaceComplexity: 'O(V²)',
  questions: [
    {
      q: 'מה Floyd-Warshall מחשב?',
      options: ['MST', 'מסלול קצר ממקור יחיד', 'מסלולים קצרים בין כל זוג צמתים', 'רכיבים קשירים'],
      correct: 2,
      explanation: 'All-pairs shortest paths.',
    },
    {
      q: 'מה מייצג k בלולאה?',
      options: ['מספר הקשתות', 'צומת ביניים מותר', 'מספר השלב', 'משקל הקשת'],
      correct: 1,
      explanation: 'D^(k)[i][j] = מסלול קצר מ-i ל-j כשצמתי הביניים מ-{1,...,k}.',
    },
    {
      q: 'מהו זמן הריצה?',
      options: ['O(V²)', 'O(V² log V)', 'O(V³)', 'O(V²E)'],
      correct: 2,
      explanation: 'שלוש לולאות מקוננות על n צמתים.',
    },
    {
      q: 'כיצד מזהים מעגל שלילי?',
      options: [
        'אם המטריצה אינה סימטרית',
        'אם D[i][i] < 0 לאיזשהו i',
        'אם V³ > E',
        'אם D[i][j] = ∞',
      ],
      correct: 1,
      explanation: 'D[i][i] אמור להיות 0. אם שלילי — יש מעגל שלילי דרך i.',
    },
    {
      q: 'מה ההבדל בין D^(0) ל-D^(n)?',
      options: [
        'D^(0) = ∞ לכל, D^(n) = 0 לכל',
        'D^(0) = מטריצת המשקלים המקורית, D^(n) = מסלולים קצרים',
        'D^(0) = MST',
        'אין הבדל',
      ],
      correct: 1,
      explanation:
        'D^(0) = W (ללא צמתי ביניים). D^(n) = מסלולים קצרים עם כל הצמתים האפשריים כביניים.',
    },
    {
      q: 'כדי לשחזר את המסלול עצמו (לא רק המרחק), מה נשתמש?',
      options: ['במטריצה D בלבד', 'במטריצת האבות π', 'בגרף ההפוך G^T', 'ב-BFS על הגרף המקורי'],
      correct: 1,
      explanation:
        'π[i][j] שומר את הצומת האחרון לפני j במסלול הקצר מ-i. מעבר על שרשרת π משחזר את המסלול.',
    },
  ],
};

export default floydWarshall;
