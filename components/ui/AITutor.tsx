'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function BrainIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2a2.5 2.5 0 0 1 5 0"/>
      <path d="M12 2v2"/>
      <path d="M6.5 7a4 4 0 0 0-2 7.5V17a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-2.5A4 4 0 0 0 17.5 7"/>
      <path d="M6.5 7A3.5 3.5 0 0 1 12 4.5 3.5 3.5 0 0 1 17.5 7"/>
      <line x1="9" y1="12" x2="9" y2="15"/>
      <line x1="12" y1="11" x2="12" y2="15"/>
      <line x1="15" y1="12" x2="15" y2="15"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#7F77DD' }}
        />
      ))}
    </div>
  );
}

export default function AITutor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error('שגיאה');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: accumulated };
          return copy;
        });
      }
    } catch {
      setLoading(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'מצטער, אירעה שגיאה בתקשורת עם השרת. נסה שוב.',
      }]);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        aria-label="פתח מורה AI"
        style={{
          position: 'fixed',
          bottom: 28, left: 28,
          width: 56, height: 56,
          borderRadius: '50%',
          background: open ? '#5a53b5' : '#7F77DD',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 24px #7F77DD55, 0 2px 8px rgba(0,0,0,0.4)',
          zIndex: 1000,
          transition: 'background 0.2s',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}
                style={{ fontSize: 22, lineHeight: 1 }}>✕</motion.span>
            : <motion.div key="brain" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <BrainIcon />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 1001,
            }}
          />
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, bottom: 0,
              width: 390,
              background: '#1a1a24',
              borderRight: '1px solid #2e2e42',
              zIndex: 1002,
              display: 'flex',
              flexDirection: 'column',
              direction: 'rtl',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #2e2e42',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#7F77DD22', border: '1px solid #7F77DD55',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#7F77DD',
                }}>
                  <BrainIcon />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: 15 }}>מורה AI</div>
                  <div style={{ fontSize: 11, color: '#6666aa' }}>קורס אלגוריתמים 636017</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#6666aa', fontSize: 18, lineHeight: 1,
                  padding: '4px 6px', borderRadius: 6, transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e8e8f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6666aa')}
              >✕</button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto',
              padding: '16px 14px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {messages.length === 0 && !loading && (
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                  <div style={{ fontSize: 40, marginBottom: 14, color: '#7F77DD' }}>
                    <BrainIcon />
                  </div>
                  <div style={{ fontSize: 15, color: '#e8e8f0', fontWeight: 600, marginBottom: 8 }}>
                    שלום! אני המורה AI שלך
                  </div>
                  <div style={{ fontSize: 13, color: '#6666aa', lineHeight: 1.6 }}>
                    שאל אותי כל שאלה על BFS, DFS,<br />
                    מיון טופולוגי, גרפים, ועוד.
                  </div>
                  <div style={{
                    marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    {['מה ההבדל בין BFS ל-DFS?', 'מתי להשתמש ב-Dijkstra ומתי ב-Bellman-Ford?', 'הסבר לי מיון טופולוגי בפשטות'].map(q => (
                      <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        style={{
                          background: '#12121a', border: '1px solid #2e2e42',
                          borderRadius: 8, padding: '8px 12px',
                          color: '#9999cc', fontSize: 12, cursor: 'pointer',
                          textAlign: 'right', transition: 'border-color 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#7F77DD55'; e.currentTarget.style.color = '#e8e8f0'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2e42'; e.currentTarget.style.color = '#9999cc'; }}
                      >{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end',
                    maxWidth: '86%',
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{ fontSize: 10, color: '#6666aa', marginBottom: 3, paddingRight: 2 }}>
                      מורה AI
                    </div>
                  )}
                  <div style={{
                    padding: '10px 13px',
                    borderRadius: msg.role === 'user'
                      ? '14px 14px 14px 3px'
                      : '14px 14px 3px 14px',
                    background: msg.role === 'user' ? '#252535' : '#7F77DD1a',
                    border: `1px solid ${msg.role === 'user' ? '#3a3a52' : '#7F77DD33'}`,
                    color: '#e8e8f0',
                    fontSize: 14,
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content || (loading && i === messages.length - 1 ? <TypingDots /> : '')}
                  </div>
                </motion.div>
              ))}

              {loading && (messages.length === 0 || messages[messages.length - 1].role === 'user') && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ alignSelf: 'flex-end', maxWidth: '86%' }}
                >
                  <div style={{ fontSize: 10, color: '#6666aa', marginBottom: 3, paddingRight: 2 }}>מורה AI</div>
                  <div style={{
                    padding: '10px 16px', borderRadius: '14px 14px 3px 14px',
                    background: '#7F77DD1a', border: '1px solid #7F77DD33',
                  }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{
              padding: '12px 14px',
              borderTop: '1px solid #2e2e42',
              display: 'flex',
              gap: 8,
              flexShrink: 0,
              background: '#1a1a24',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="שאל את המורה... (Enter לשליחה)"
                rows={1}
                disabled={loading}
                style={{
                  flex: 1, resize: 'none',
                  background: '#12121a',
                  border: '1px solid #2e2e42',
                  borderRadius: 10,
                  color: '#e8e8f0',
                  fontSize: 14,
                  padding: '10px 13px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  direction: 'rtl',
                  maxHeight: 120,
                  overflow: 'auto',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#7F77DD66')}
                onBlur={e => (e.target.style.borderColor = '#2e2e42')}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: 42, height: 42,
                  flexShrink: 0,
                  alignSelf: 'flex-end',
                  background: input.trim() && !loading ? '#7F77DD' : '#252535',
                  border: 'none',
                  borderRadius: 10,
                  color: input.trim() && !loading ? '#fff' : '#4444666',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s, color 0.15s',
                  flexDirection: 'row',
                }}
              >
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
