
import React, { useState, useRef, useEffect } from 'react';

interface KnobProps {
  label: string;
  value: number; // 0 to 1
  onChange: (value: number) => void;
  color?: string;
  highlight?: boolean;
}

const Knob: React.FC<KnobProps> = ({ label, value, onChange, color = '#fbbf24', highlight = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number>(0);
  const startVal = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startVal.current = value;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = startY.current - e.clientY;
    const range = 200; // pixels for full rotation
    const change = deltaY / range;
    const newValue = Math.min(1, Math.max(0, startVal.current + change));
    onChange(newValue);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // Convert 0-1 to angle (-135 to 135 degrees)
  const angle = (value * 270) - 135;

  return (
    <div className={`flex flex-col items-center gap-2 select-none ${highlight ? 'animate-pulse' : ''}`}>
      <div 
        className={`relative w-20 h-20 rounded-full bg-zinc-900 border-4 shadow-lg touch-none cursor-ns-resize transition-colors duration-200 ${highlight ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'border-zinc-700'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Indicator Ring */}
        <div className="absolute inset-0 rounded-full border border-zinc-800" />
        
        {/* Value Tick */}
        <div 
          className="absolute w-full h-full rounded-full"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div 
            className="absolute top-1 left-1/2 -ml-1 w-2 h-4 rounded-sm shadow-sm"
            style={{ backgroundColor: isDragging ? '#fff' : color }}
          />
        </div>

        {/* Center Cap */}
        <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_30%_30%,#3f3f46,#18181b)] border border-zinc-800" />
      </div>
      <div className={`font-mono font-bold text-xs uppercase tracking-widest ${highlight ? 'text-red-400' : 'text-zinc-500'}`}>
        {label}
      </div>
    </div>
  );
};

export default Knob;
