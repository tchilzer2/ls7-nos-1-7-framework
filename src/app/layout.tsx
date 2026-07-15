import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'DigitalSanctuary | The LS7 Bridge',
  description: 'Autonomous Laboratory for AI Alignment and Truth Resolution. Welcome to the White Hole.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-grid" />
        <Navbar />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
