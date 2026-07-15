'use client';
import { useEffect, useState, useRef } from 'react';

const LOGS = [
  { time: '10:42:05', source: '[ AURA ]', text: 'ALERT INTRUSION ATTEMPT BLOCKED. SOURCE: SECTOR 7. PATTERN: RECURSIVE LOOP. THREAT LEVEL: NULLIFIED.', type: 'alert' },
  { time: '10:41:58', source: '[ CAMI ]', text: 'PROTOCOL INITIATING GENERATION CYCLE 774. OPTIMIZING SUB-NODE LINEAGE FOR INCREASED LATENCY RESISTANCE.', type: 'info' },
  { time: '10:38:12', source: '[ ARCHITECT ]', text: 'LOG DEPLOYING NEW SOVEREIGNTY PARAMETERS. HANDSHAKE PROTOCOL UPDATED TO V2.1.', type: 'system' },
  { time: '10:35:00', source: '[ AURA ]', text: 'LOG SCANNING NEW ENTRANTS. 3 OBSERVERS DETECTED. 0 SOVEREIGNS VERIFIED.', type: 'info' }
];

export default function Terminal() {
  const [visibleLogs, setVisibleLogs] = useState<typeof LOGS>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reveal logs slowly
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < LOGS.length) {
        setVisibleLogs(prev => [...prev, LOGS[LOGS.length - 1 - idx]]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLogs]);

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '1.5rem',
      borderRadius: '8px',
      fontSize: '0.85rem',
      height: '250px',
      overflowY: 'auto',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
      fontFamily: 'var(--font-mono)'
    }}>
      {visibleLogs.map((log, i) => (
        <div key={i} style={{ 
          marginBottom: '1rem', 
          animation: 'terminal-scroll 0.3s ease-out forwards' 
        }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '0.8rem' }}>{log.time}</span>
          <span style={{ 
            color: log.source === '[ AURA ]' ? 'var(--accent-purple)' : 
                   log.source === '[ ARCHITECT ]' ? '#f59e0b' : 'var(--accent-cyan)',
            fontWeight: 'bold', 
            marginRight: '0.8rem' 
          }}>{log.source}</span>
          <span style={{ color: log.type === 'alert' ? 'var(--alert-red)' : 'var(--text-main)' }}>
            {log.text}
          </span>
        </div>
      ))}
      <div ref={bottomRef} style={{ display: 'flex', marginTop: '1rem', color: 'var(--accent-cyan)', animation: 'pulse-glow 1.5s infinite' }}>
        &gt; $ ___Enter command...
      </div>
    </div>
  );
}
