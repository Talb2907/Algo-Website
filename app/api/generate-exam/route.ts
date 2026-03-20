import Anthropic from '@anthropic-ai/sdk';

const ALGO_CONTEXT: Record<string, string> = {
  basics:          'הגדרות בסיסיות: גרף G=(V,E), גרף מכוון/לא-מכוון, עץ, DAG, רשימת שכנות O(V+E), מטריצת שכנות O(V²), משפט לחיצת הידיים',
  bfs:             'BFS — חיפוש לרוחב: תור FIFO, צביעה לבן/אפור/שחור, מרחקים ב-O(V+E), עץ BFS',
  dfs:             'DFS — חיפוש לעומק: רקורסיה/סטאק, זמני גילוי d[v] וסיום f[v], סיווג קשתות (tree/back/cross/forward)',
  topological:     'מיון טופולוגי: DFS + הוספה לראש רשימה לפי f[v] יורד, תקף רק ב-DAG, O(V+E)',
  scc:             'SCC — קוסאראג׳ו: DFS על גרף מקורי, גרף הפוך G^T, DFS בסדר f[] יורד, Θ(V+E)',
  kruskal:         'Kruskal: מיון קשתות O(E log E), Union-Find, קבל קשת אם שני קצוות ברכיבים שונים, MST',
  prim:            'Prim: priority queue, key[v]=משקל קשת קלה לעץ, π[v]=אבא, O((V+E) log V), MST',
  dijkstra:        'Dijkstra: priority queue, RELAX(u,v,w), משקלים חיוביים בלבד, O((V+E) log V)',
  'bellman-ford':  'Bellman-Ford: |V|-1 sweeps, RELAX כל הקשתות, מזהה מעגלים שליליים, O(VE)',
  'floyd-warshall':'Floyd-Warshall: DP, D[i][j] = min(D[i][j], D[i][k]+D[k][j]), all-pairs, O(V³)',
  'dag-sp':        'DAG Shortest Paths: מיון טופולוגי + RELAX בסדר, O(V+E), עובד עם משקלים שליליים',
  huffman:         'קוד הופמן: min-heap, מיזוג שני צמתים עם תדירות נמוכה, קידוד קידומת חסר עמימות, אופטימלי',
  astar:           'A*: f(n)=g(n)+h(n), g=עלות ממקור, h=heuristic ליעד, אופטימלי אם h קבילה',
  'ford-fulkerson': 'Ford-Fulkerson: נתיבים מגדילים ברשת שיורית, max-flow min-cut, O(E·|f*|)',
  'edmonds-karp':  'Edmonds-Karp: Ford-Fulkerson עם BFS לנתיב הקצר ביותר, O(VE²) פולינומי',
};

const DIFFICULTY_DESC: Record<string, string> = {
  easy:   'קל — הגדרות ישירות, מורכבות בסיסית, מושגים פשוטים',
  medium: 'בינוני — עקרונות האלגוריתמים, השוואות בין אלגוריתמים, יישום בסיסי',
  hard:   'קשה — ניתוח עמוק, מקרי קצה, שאלות עם מסיחות חזקות, הוכחות חלקיות',
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { algorithms, count, difficulty, moodleContext } = await req.json();

    const algoDescriptions = (algorithms as string[])
      .map(slug => `• ${ALGO_CONTEXT[slug] ?? slug}`)
      .join('\n');

    const prompt = `אתה מחולל שאלות מבחן לקורס אלגוריתמים 636017 באוניברסיטה הפתוחה.
צור בדיוק ${count} שאלות בחינה ברמת קושי: ${DIFFICULTY_DESC[difficulty] ?? difficulty}.

נושאים לכלול (חלק את השאלות ביניהם בשוויוניות):
${algoDescriptions}

${moodleContext ? `חומר קורס ממודל (השתמש בו ליצירת שאלות רלוונטיות):\n${moodleContext}\n\n` : ''}כללים חשובים:
- כל שאלה חייבת להיות ברורה וחד-משמעית
- 4 אפשרויות תשובה — אחת נכונה, שלוש מסיחות סבירות
- המסיחות צריכות להיות שגויות אך הגיוניות
- ההסבר חייב להיות קצר (משפט-שניים) ומדויק
- מגוון שאלות: מורכבות זמן, מורכבות מקום, עקרונות, השוואות

החזר JSON בלבד, ללא שום טקסט לפני או אחרי, בפורמט המדויק הזה:
[
  {
    "question": "השאלה בעברית?",
    "options": ["אפשרות א׳", "אפשרות ב׳", "אפשרות ג׳", "אפשרות ד׳"],
    "correct": 0,
    "explanation": "הסבר קצר לתשובה הנכונה."
  }
]`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = (response.content[0] as { type: string; text: string }).text;
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in response');

    const questions = JSON.parse(match[0]);
    return Response.json({ questions });
  } catch (err) {
    console.error('generate-exam error:', err);
    return Response.json({ error: 'שגיאה ביצירת המבחן' }, { status: 500 });
  }
}
