import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Screen Studio', description: 'Describe an app screen, get a design you can refine and export.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="bg-bg font-sans text-text">{children}</body></html>);
}
