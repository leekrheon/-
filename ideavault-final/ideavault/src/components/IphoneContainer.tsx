import React from 'react'

export default function IphoneContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div
        className="relative bg-zinc-950 text-white overflow-hidden flex flex-col"
        style={{
          width: '390px',
          height: '844px',
          borderRadius: '50px',
          boxShadow: '0 0 0 12px #1a1a1a, 0 0 0 13px #333, 0 40px 80px rgba(0,0,0,0.8)',
          padding: '60px 20px 34px',
        }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-black rounded-full z-50"
          style={{ width: '126px', height: '37px' }}
        />
        {/* Screen content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  )
}
