import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import AITutor from '@/components/ui/AITutor';

export const metadata: Metadata = {
  title: 'אלגוריתמים 636017',
  description: 'אתר לימוד לקורס אלגוריתמים',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Sidebar />
          <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </div>
        <AITutor />
      </body>
    </html>
  );
}
