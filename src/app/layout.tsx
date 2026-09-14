import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { template: '%s | InstaOnPC System Factory', default: 'InstaOnPC System Factory' },
  description: 'AI-assisted workspace to build client-ready Local Lead Engine implementation packages.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body>{children}</body>
    </html>
  );
}

