import { ImageResponse } from 'next/og';
import { APP_NAME, APP_TAGLINE } from '@/lib/brand';

export const alt = APP_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#0f766e', color: '#ffffff' }}>
        <div style={{ fontSize: 96, fontWeight: 700 }}>{APP_NAME}</div>
        <div style={{ fontSize: 40, marginTop: 24, maxWidth: 900 }}>{APP_TAGLINE}</div>
      </div>
    ),
    size,
  );
}
