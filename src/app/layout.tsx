import type { Metadata } from 'next';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import './globals.css';
import '@/components/campaign/campaign.css';

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

