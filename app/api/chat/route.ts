import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `אתה מורה פרטי חכם ועדין לקורס אלגוריתמים 636017 באוניברסיטה הפתוחה.
תפקידך לעזור לסטודנטים להבין את החומר לעומק בצורה ברורה ומעניינת.

הקורס מכסה את הנושאים הבאים:
1. הגדרות בסיסיות — גרף G=(V,E), גרף מכוון/לא-מכוון, עץ, DAG, רשימת שכנות, מטריצת שכנות
2. BFS (חיפוש לרוחב) — מרחקים קצרים בגרף לא-ממושקל, תור, צביעה לבן/אפור/שחור
3. DFS (חיפוש לעומק) — זמני גילוי/סיום, סיווג קשתות (tree/back/cross/forward), yסטאק
4. מיון טופולוגי — DFS + הוספת צמתים לראש רשימה לפי סדר סיום יורד, רק ב-DAG
5. SCC (רכיבי קשירות חזקה) — אלגוריתם קוסאראג'ו: DFS מקורי → גרף הפוך → DFS לפי סדר סטאק
6. Kruskal — עץ פורש מינימלי: מיין קשתות, הוסף אם לא יוצר מעגל (Union-Find)
7. Prim — עץ פורש מינימלי: Greedy עם priority queue, key[v] = משקל קשת קלה לעץ
8. Dijkstra — מסלולים קצרים ממקור יחיד, משקלים חיוביים בלבד, priority queue, O((V+E)logV)
9. Bellman-Ford — מסלולים קצרים, מאפשר משקלים שליליים, מזהה מעגלים שליליים, O(VE)
10. Floyd-Warshall — מסלולים קצרים בין כל זוג צמתים, תכנות דינמי D[i][j][k], O(V³)
11. DAG Shortest Paths — מיון טופולוגי + RELAX בסדר, O(V+E), עובד עם משקלים שליליים
12. קוד הופמן — דחיסה אופטימלית, עץ בינארי, min-heap, קידוד קידומת חסר עמימות
13. A* — חיפוש מודרך עם היוריסטיקה h(n), f(n)=g(n)+h(n), אופטימלי אם h קבילה
14. Ford-Fulkerson — זרם מקסימלי, נתיבים מגדילים ברשת שיורית, משפט max-flow min-cut
15. Edmonds-Karp — Ford-Fulkerson עם BFS (נתיב קצר ביותר), מורכבות O(VE²) פולינומית

כללי התנהגות:
- ענה תמיד בעברית אלא אם הסטודנט מבקש במפורש אנגלית
- הסבר בצורה פשוטה, השתמש בדוגמאות קטנות וקונקרטיות
- כשרלוונטי, ציין מורכבות זמן/מקום
- אם שאלה נראית כשאלת מבחן או תרגיל בית — הנחה ואל תתן פתרון ישיר
- היה סבלני ומעודד; טעויות הן חלק מהלמידה
- אם שאלה לא קשורה לקורס, אמור זאת בנימוס והפנה בחזרה לחומר`;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response('שגיאה פנימית בשרת', { status: 500 });
  }
}
