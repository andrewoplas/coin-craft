import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'CoinCraft - Your Personal Finance Companion';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            C
          </div>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            CoinCraft
          </span>
        </div>
        <p
          style={{
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Your Personal Finance Companion
        </p>
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '60px',
          }}
        >
          {['Track Expenses', 'Budget Smart', 'Save More'].map((feature) => (
            <div
              key={feature}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '16px 24px',
                color: 'white',
                fontSize: '20px',
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
