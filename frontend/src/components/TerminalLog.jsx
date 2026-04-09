import { useState, useEffect } from 'react';

const defaultLogs = [
  '$ Initializing AI job search engine...',
  '$ Loading neural job matching model...',
  '$ Connecting to India job market data...',
  '$ Fetching live job postings...',
  '$ Running vector similarity search...',
  '$ Ranking by relevance & match score...',
  '$ Applying skill-gap analysis...',
  '$ Results ready. Rendering output...',
];

export default function TerminalLog({ active, onComplete, customLogs, keepAlive = false }) {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [done, setDone] = useState(false);

  const logs = customLogs || defaultLogs;

  useEffect(() => {
    if (!active) {
      if (!keepAlive) { setLines([]); setCurrentLine(0); setDone(false); }
      return;
    }
    setLines([]); setCurrentLine(0); setDone(false);
  }, [active, keepAlive]);

  useEffect(() => {
    if (!active || done) return;
    if (currentLine >= logs.length) { setDone(true); onComplete?.(); return; }
    const timer = setTimeout(() => { setLines((prev) => [...prev, logs[currentLine]]); setCurrentLine((prev) => prev + 1); }, 280 + Math.random() * 180);
    return () => clearTimeout(timer);
  }, [active, currentLine, logs, done, onComplete]);

  if (!active && lines.length === 0) return null;

  return (
    <div className="nq-glass rounded-xl p-4 font-mono text-sm" style={{ border: '1px solid rgba(0,212,255,0.15)' }}>
      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <div className="w-3 h-3 rounded-full" style={{ background: '#ff375f' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#ffd60a' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#30d158' }} />
        <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.4)' }}>naukriquest ~ terminal</span>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {lines.map((line, i) => (
          <div key={i} className="text-[#00d4ff] opacity-0 slide-up" style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'forwards' }}>
            <span style={{ color: '#30d158' }}>▶</span> {line}
          </div>
        ))}
        {!done && active && <div className="text-[#00d4ff] terminal-cursor" />}
        {done && (
          <div className="text-[#30d158] mt-2 flex items-center gap-1.5 font-semibold">
            <span>✓</span>
            <span>Process complete. {lines.length} operations executed.</span>
          </div>
        )}
      </div>
    </div>
  );
}
