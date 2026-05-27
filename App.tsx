import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface IphoneContainerProps {
  children: React.ReactNode;
}

export default function IphoneContainer({ children }: IphoneContainerProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 12 hour format
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-6 text-white overflow-hidden font-sans">
      {/* Phone Case Wrap - Hidden on mobile viewports */}
      <div className="relative w-full max-w-[430px] h-screen sm:h-[880px] sm:rounded-[56px] sm:border-[12px] sm:border-neutral-800 bg-black sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden sm:ring-8 sm:ring-neutral-900/50">
        
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-0 inset-x-0 h-12 flex justify-between items-center px-8 z-50 pointer-events-none">
          {/* Time */}
          <span className="text-[14px] font-semibold tracking-tight text-white select-none">
            {time}
          </span>
          
          {/* Dynamic Island Capsule */}
          <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-3 w-[110px] h-7 bg-black rounded-full border border-neutral-900 shadow-inner z-[51]"></div>

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 text-white">
            <Signal className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-bold tracking-tighter mr-0.5">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5 ml-0.5">
              <span className="text-[10px] font-semibold mr-0.5">88%</span>
              <Battery className="w-5 h-3.5" />
            </div>
          </div>
        </div>

        {/* iPhone Screen Content */}
        <div className="flex-1 w-full h-full pt-12 pb-6 px-4 flex flex-col bg-black overflow-y-auto no-scrollbar relative">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-1 right-0 left-0 h-5 flex items-end justify-center pointer-events-none pb-1.5 z-50">
          <div className="w-32 h-1 bg-white/70 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
