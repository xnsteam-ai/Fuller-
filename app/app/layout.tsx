import type { Metadata, Viewport } from 'next';
import './globals.css';
import { APP_NAME, APP_TAGLINE } from '@/lib/brand';

export const metadata: Metadata = { title: APP_NAME, description: APP_TAGLINE };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="bg-bg font-sans text-text">{children}</body></html>);
}
