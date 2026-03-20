'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '🔍',
    title: 'הדמיות אינטראקטיביות',
    desc: 'צפה באלגוריתמים רצים בזמן אמת — BFS, DFS, Dijkstra, Kruskal ועוד. כל צעד מוסבר ומוצג ויזואלית.',
    color: '#7F77DD',
    href: '/bfs',
    cta: 'נסה הדמיה',
  },
  {
    icon: '🤖',
    title: 'מורה AI אישי',
    desc: 'שאל כל שאלה על הקורס וקבל הסבר מותאם אישית. מבוסס Claude ומכיר את כל חומר הקורס.',
    color: '#1D9E75',
    href: '/bfs',
    cta: 'שאל שאלה',
  },
  {
    icon: '📝',
    title: 'מחולל מבחן חכם',
    desc: 'צור מבחן מותאם אישית לפי נושאים ורמת קושי. שאלות נוצרות בזמן אמת על ידי AI.',
    color: '#5B9BD5',
    href: '/exam',
    cta: 'צור מבחן',
  },
  {
    icon: '🎓',
    title: 'אינטגרציית מודל',
    desc: 'טען חומרי לימוד ישירות ממודל — סילבוס, מצגות, תרגולים — והאי יצור שאלות ספציפיות לקורס שלך.',
    color: '#EF9F27',
    href: '/exam',
    cta: 'נסה עכשיו',
  },
];

const ALGORITHMS = [
  { name: 'BFS', color: '#7F77DD' },
  { name: 'DFS', color: '#5B9BD5' },
  { name: 'Dijkstra', color: '#1D9E75' },
  { name: 'Kruskal', color: '#EF9F27' },
  { name: 'Prim', color: '#E07B39' },
  { name: 'Bellman-Ford', color: '#7F77DD' },
  { name: 'Floyd-Warshall', color: '#5B9BD5' },
  { name: 'SCC', color: '#1D9E75' },
  { name: 'Huffman', color: '#EF9F27' },
  { name: 'A*', color: '#E07B39' },
  { name: 'Ford-Fulkerson', color: '#7F77DD' },
  { name: 'Edmonds-Karp', color: '#5B9BD5' },
];

export default function LandingPage() {
  return (
    <div style={{ overflowY: 'auto', height: '100%', background: 'var(--bg-main)' }}>

      {/* Hero */}
      <section style={{
        padding: '72px 40px 56px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, #7F77DD18 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 20,
            border: '1px solid #7F77DD44', background: '#7F77DD12',
            color: '#7F77DD', fontSize: 13, fontWeight: 600, marginBottom: 20,
          }}>
            קורס 636017 — אלגוריתמים
          </div>

          <h1 style={{
            fontSize: 48, fontWeight: 900, lineHeight: 1.15,
            color: 'var(--text-primary)', marginBottom: 16,
          }}>
            למד אלגוריתמים{' '}
            <span style={{ color: '#7F77DD' }}>בצורה חכמה</span>
          </h1>

          <p style={{
            fontSize: 18, color: 'var(--text-secondary)', maxWidth: 520,
            margin: '0 auto 36px', lineHeight: 1.7,
          }}>
            הדמיות אינטראקטיביות, מורה AI אישי, מחולל מבחנים ואינטגרציה עם מודל — הכל במקום אחד.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/bfs" style={{
              padding: '13px 28px', borderRadius: 10,
              background: '#7F77DD', color: '#fff',
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}>
              התחל ללמוד ←
            </Link>
            <Link href="/exam" style={{
              padding: '13px 28px', borderRadius: 10,
              border: '1px solid var(--border)', color: 'var(--text-primary)',
              background: 'var(--bg-card)',
              fontSize: 15, fontWeight: 600, textDecoration: 'none',
            }}>
              צור מבחן
            </Link>
          </div>
        </motion.div>

        {/* Algorithm pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 44 }}
        >
          {ALGORITHMS.map((alg, i) => (
            <motion.span
              key={alg.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.04 }}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1px solid ${alg.color}44`,
                background: `${alg.color}10`,
                color: alg.color,
              }}
            >
              {alg.name}
            </motion.span>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '56px 40px', maxWidth: 900, margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontSize: 28, fontWeight: 800, color: 'var(--text-primary)',
            textAlign: 'center', marginBottom: 40,
          }}
        >
          כל מה שצריך לעבור את הקורס
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid var(--border)`,
                borderRadius: 14,
                padding: '28px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${f.color}55`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {f.title}
                </h3>
              </div>

              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {f.desc}
              </p>

              <Link href={f.href} style={{
                alignSelf: 'flex-start', marginTop: 4,
                padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: `1px solid ${f.color}44`,
                background: `${f.color}12`,
                color: f.color, textDecoration: 'none',
                transition: 'background 0.15s',
              }}>
                {f.cta} ←
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '36px 40px',
        display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap',
      }}>
        {[
          { value: '12', label: 'אלגוריתמים עם הדמיה' },
          { value: 'AI', label: 'שאלות נוצרות בזמן אמת' },
          { value: '∞', label: 'מבחנים לתרגול' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#7F77DD' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 40px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            מוכן להתחיל?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 15 }}>
            בחר אלגוריתם מהתפריט הצידי או התחל ישר עם מחולל המבחנים
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/bfs" style={{
              padding: '13px 28px', borderRadius: 10,
              background: '#7F77DD', color: '#fff',
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
            }}>
              BFS ← התחל עם
            </Link>
            <Link href="/exam" style={{
              padding: '13px 28px', borderRadius: 10,
              border: '1px solid var(--border)', color: 'var(--text-primary)',
              background: 'var(--bg-card)',
              fontSize: 15, fontWeight: 600, textDecoration: 'none',
            }}>
              📝 מחולל מבחן
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
