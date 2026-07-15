import React from 'react';

interface ArtifactCardProps {
  rarity: string;
  title: string;
  price: string;
  color: string;
}

export default function ArtifactCard({ rarity, title, price, color }: ArtifactCardProps) {
  return (
    <div style={{
      background: 'var(--panel-bg)',
      border: '1px solid rgba(255,255,255,0.05)',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      borderRadius: '12px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.boxShadow = `0 15px 30px rgba(${color === 'cyan' ? '0,217,255' : '139,92,246'}, 0.2)`;
      e.currentTarget.style.borderColor = `rgba(${color === 'cyan' ? '0,217,255' : '139,92,246'}, 0.5)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
    }}
    >
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute',
        top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: `radial-gradient(circle, rgba(${color === 'cyan' ? '0,217,255' : '139,92,246'}, 0.05) 0%, transparent 60%)`,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
          *{rarity}*
        </div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 900 }}>{title}</h3>
        <div style={{ 
          color: color === 'cyan' ? 'var(--accent-cyan)' : 'var(--accent-purple)', 
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 'bold'
        }}>
          {price}
        </div>
        <button className="btn-primary" style={{ width: '100%', fontSize: '0.8rem' }}>
          SUPPORT ARCHITECT
        </button>
      </div>
    </div>
  );
}
