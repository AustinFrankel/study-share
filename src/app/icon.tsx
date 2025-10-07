import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
 
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 100 100" fill="white">
          <path d="M50 20 L75 35 L75 48 Q75 60 67 68 Q59 76 50 76 Q41 76 33 68 Q25 60 25 48 L25 35 Z"/>
          <path d="M50 76 L50 88 M46 83 Q50 85 54 83"/>
          <rect x="42" y="32" width="16" height="20" rx="2"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
