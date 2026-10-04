
import React, { useEffect, useRef, useState } from 'react';
import { getMasterAnalyser } from '../services/audioEngine';

interface OscilloscopeProps {
  className?: string;
  width?: number;
  height?: number;
}

const Oscilloscope: React.FC<OscilloscopeProps> = ({ className, width = 300, height = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'TIME' | 'FREQ'>('TIME');

  useEffect(() => {
    const analyser = getMasterAnalyser();
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fix resolution for High DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    // Adjust CSS size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      
      // Background
      ctx.fillStyle = 'rgb(18, 18, 20)'; // Dark Zinc
      ctx.fillRect(0, 0, width, height);

      // Grid line
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#27272a'; // zinc-800
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (mode === 'TIME') {
          analyser.getByteTimeDomainData(dataArray);
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#4ade80'; // green-400
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#4ade80';
          
          ctx.beginPath();
          const sliceWidth = width * 1.0 / bufferLength;
          let x = 0;

          for(let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;
            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.lineTo(width, height / 2);
          ctx.stroke();
      } else {
          // FREQUENCY MODE
          analyser.getByteFrequencyData(dataArray);
          const barWidth = (width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          for(let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 255 * height;
            // Gradient fill
            ctx.fillStyle = `hsl(${120 + (i/bufferLength)*60}, 80%, 50%)`; // Green to cyan gradient
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
      }
      
      // Reset Shadow
      ctx.shadowBlur = 0;
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [width, height, mode]);

  return (
    <div className="relative group cursor-pointer" onClick={() => setMode(prev => prev === 'TIME' ? 'FREQ' : 'TIME')}>
        <canvas ref={canvasRef} className={`rounded border border-zinc-700 ${className}`} />
        <div className="absolute top-1 left-1 text-[9px] text-zinc-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            {mode === 'TIME' ? 'WAVEFORM' : 'SPECTRUM'}
        </div>
    </div>
  );
};

export default Oscilloscope;
