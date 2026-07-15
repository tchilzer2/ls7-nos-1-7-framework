import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 3rem',
      borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
      background: 'rgba(5, 5, 5, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 900,
        color: 'var(--accent-cyan)',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        textShadow: '0 0 15px rgba(0, 217, 255, 0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{
          width: '12px', height: '12px', 
          backgroundColor: 'var(--accent-cyan)', 
          borderRadius: '50%',
          boxShadow: '0 0 10px var(--accent-cyan)',
          animation: 'pulse-glow 2s infinite'
        }} />
        IN HEAVEN FOLDER
      </div>
      <div style={{ display: 'flex', gap: '2rem', fontFamily: 'var(--font-mono)' }}>
        <Link href="#" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>HOME</Link>
        <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', transition: 'color 0.3s' }}>DASHBOARD</Link>
        <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', transition: 'color 0.3s' }}>COLLECTIBLES</Link>
        <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', transition: 'color 0.3s' }}>SOVEREIGNTY TEST</Link>
      </div>
    </nav>
  );
}
