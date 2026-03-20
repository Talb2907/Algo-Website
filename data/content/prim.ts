import { AlgorithmContent } from '@/types';

const prim: AlgorithmContent = {
  slug: 'prim',
  title: 'Prim',
  goal: 'מוצא MST ע"י גדילה של עץ אחד — בכל שלב מוסיפים את הקשת הקלה ביותר לצומת חדש.',
  input: 'גרף לא-מכוון G=(V,E), משקל w, צומת התחלה r',
  output: 'MST דרך ערכי π',
  pseudocode: `MST-PRIM(G, w, r):
  for each u ∈ G.V:
    u.key = ∞;  u.π = NIL
  r.key = 0
  Q = min-priority-queue(כל הצמתים)
  while Q ≠ ∅:
    u = EXTRACT-MIN(Q)
    for each v ∈ G.Adj[u]:
      if v ∈ Q and w(u,v) < v.key:
        v.π = u
        v.key = w(u,v)
  return {(v, v.π) | v ≠ r}`,
  notes: [
    'v.key = משקל הקשת הקלה שמחברת v לעץ (לא מרחק מהמקור!)',
    'דומה ל-Dijkstra אבל: Prim → משקל קשת, Dijkstra → מרחק מהמקור',
    'MST לא מוצא מסלולים קצרים!',
    'כשמשקלים שונים — MST יחיד',
  ],
  timeComplexity: 'O(E log V)',
  spaceComplexity: 'O(V)',
  questions: [
    {
      q: 'מה מייצג v.key ב-Prim?',
      options: [
        'מרחק מהמקור r',
        'משקל הקשת הקלה שמחברת v לעץ הנוכחי',
        'מספר שכנים',
        'עומק v בעץ',
      ],
      correct: 1,
      explanation: 'v.key = מינימום משקל קשת שמחברת v לאחד מצמתי העץ הנוכחי.',
    },
    {
      q: 'מה ההבדל המהותי בין Prim ל-Dijkstra?',
      options: [
        'Prim מהיר יותר',
        'Dijkstra עובד על גרפים לא מכוונים, Prim לא',
        'ב-Prim המפתח = משקל קשת, ב-Dijkstra = מרחק מהמקור',
        'אין הבדל',
      ],
      correct: 2,
      explanation: 'Dijkstra: v.key = d[v] = מרחק מ-s. Prim: v.key = משקל הקשת הקלה לעץ.',
    },
    {
      q: 'האם MST מוצא מסלולים קצרים?',
      options: [
        'כן, תמיד',
        'כן, אם המשקלים חיוביים',
        'לא — MST ממזער סכום משקלות, לא מסלולים',
        'כן, רק לצומת השורש',
      ],
      correct: 2,
      explanation: 'MST ≠ shortest paths. מטרות שונות לחלוטין.',
    },
    {
      q: 'לגרף קשיר ולא-מכוון עם משקלים שונים — כמה MSTs יש?',
      options: ['אין הגבלה', 'תמיד יותר מאחד', 'בדיוק אחד', 'תלוי במספר הצמתים'],
      correct: 2,
      explanation: 'כשכל משקלי הקשתות שונים — ה-MST יחיד.',
    },
  ],
};

export default prim;
