
import React from 'react';
import { Module, ModuleType, Rarity, PortType } from '../types';
import { Activity, Zap, Skull, Speaker, Radio, ArrowDownToLine, Minus } from 'lucide-react';

interface ModuleCardProps {
  module: Module;
  onClick?: () => void;
  // Drag and Drop handlers
  onPortPointerDown?: (type: 'input' | 'output', index: number, e: React.PointerEvent) => void;
  onPortPointerUp?: (type: 'input' | 'output', index: number, e: React.PointerEvent) => void;
  // Visual feedback
  highlightPort?: { type: 'input' | 'output', index: number } | null;
  activityLevel?: number; // 0-1 range for reactive lighting
  isActive?: boolean; // New: Triggered by sequencer
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  minimal?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
    module, 
    onClick, 
    onPortPointerDown,
    onPortPointerUp,
    highlightPort,
    activityLevel = 0,
    isActive = false,
    disabled = false, 
    size = 'md',
    minimal = false
}) => {
  
  const getBorderColor = (rarity: Rarity) => {
    if (module.type === ModuleType.EMPTY) return 'border-zinc-700';
    switch (rarity) {
      case Rarity.COMMON: return 'border-zinc-600';
      case Rarity.UNCOMMON: return 'border-blue-500';
      case Rarity.RARE: return 'border-amber-500';
      case Rarity.LEGENDARY: return 'border-purple-500';
      case Rarity.MYTHIC: return 'border-pink-500';
      case Rarity.CURSED: return 'border-red-600';
      default: return 'border-zinc-600';
    }
  };

  const getBgColor = (type: ModuleType) => {
    switch(type) {
      case ModuleType.TRASH: return 'bg-zinc-800';
      case ModuleType.CURSE: return 'bg-red-950/30';
      case ModuleType.DUCKER: return 'bg-orange-950/20';
      case ModuleType.EMPTY: return 'bg-zinc-800/50';
      default: return 'bg-zinc-800';
    }
  };

  const getPortColor = (port: PortType) => {
      if (port.includes('AUDIO')) return 'bg-zinc-300 border-zinc-400 group-hover:bg-zinc-100';
      if (port.includes('CV')) return 'bg-zinc-900 border-zinc-500 group-hover:bg-zinc-700';
      if (port.includes('GATE')) return 'bg-red-600 border-red-800 group-hover:bg-red-500';
      return 'bg-zinc-500';
  };

  const getLedColor = () => {
      switch(module.type) {
          case ModuleType.VCO: return 'bg-green-500';
          case ModuleType.LFO: return 'bg-blue-500';
          case ModuleType.VCA: return 'bg-yellow-500';
          case ModuleType.FILTER: return 'bg-purple-500';
          case ModuleType.TRASH: return 'bg-red-900';
          case ModuleType.CURSE: return 'bg-red-600';
          case ModuleType.SEQ: return 'bg-orange-500';
          case ModuleType.DUCKER: return 'bg-orange-600';
          case ModuleType.EMPTY: return 'bg-transparent';
          default: return 'bg-amber-500';
      }
  };

  // Determine if this module is free-running (always animating)
  const isFreeRunning = module.type === ModuleType.VCO || module.type === ModuleType.LFO || module.type === ModuleType.SEQ || module.type === ModuleType.TRASH;
  
  // Animation duration based on value (faster for higher values)
  const animDuration = Math.max(0.1, 2 - (Math.abs(module.value) * 0.2)) + 's';

  const Icon = () => {
    switch(module.type) {
        case ModuleType.VCO: return <Activity className="text-green-400" />;
        case ModuleType.VCA: return <Speaker className="text-yellow-400" />;
        case ModuleType.FILTER: return <Radio className="text-blue-400" />;
        case ModuleType.TRASH: return <div className="text-zinc-500 font-bold text-xl">X</div>;
        case ModuleType.CURSE: return <Skull className="text-red-500" />;
        case ModuleType.DUCKER: return <ArrowDownToLine className="text-orange-500" />;
        case ModuleType.EMPTY: return <Minus className="text-zinc-700" />;
        default: return <Zap className="text-zinc-400" />;
    }
  };

  const sizeClasses = {
    sm: 'w-24 h-32 text-xs',
    md: 'w-40 h-64 text-sm',
    lg: 'w-48 h-72 text-base'
  };

  if (module.type === ModuleType.EMPTY) {
      return (
        <div 
            onClick={!disabled && onClick ? onClick : undefined}
            className={`
                relative flex flex-col items-center justify-center p-2 
                ${sizeClasses[size]} 
                bg-[linear-gradient(45deg,#27272a_25%,#3f3f46_25%,#3f3f46_50%,#27272a_50%,#27272a_75%,#3f3f46_75%,#3f3f46_100%)] bg-[length:10px_10px] opacity-20
                border-2 border-zinc-800 
                rounded-sm
                ${!disabled && onClick ? 'hover:opacity-40 cursor-pointer' : ''}
            `}
        >
            <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-inner" />
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-inner" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-inner" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-inner" />
            <div className="text-xs text-zinc-500 font-mono rotate-90 whitespace-nowrap opacity-50 tracking-[0.3em]">BLANK PANEL</div>
        </div>
      );
  }

  return (
    <div 
      onClick={!disabled && onClick ? onClick : undefined}
      className={`
        relative flex flex-col items-center justify-between p-2 
        ${sizeClasses[size]} 
        ${getBgColor(module.type)} 
        border-2 ${getBorderColor(module.rarity)} 
        rounded-sm shadow-xl transition-all duration-200 overflow-hidden
        ${!disabled && onClick ? 'hover:-translate-y-1 hover:shadow-2xl hover:border-zinc-300 cursor-pointer' : ''}
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
        ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-[1.02]' : ''}
      `}
    >
      {/* Screws */}
      <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-400 shadow-inner" />
      
      {/* LED Indicator */}
      <div className="absolute top-2 right-2">
          <div 
            className={`w-2 h-2 rounded-full ${getLedColor()} transition-all duration-100 shadow-[0_0_8px_currentColor]`}
            style={{
                opacity: isActive 
                    ? 1.0 
                    : isFreeRunning ? 0.5 : 0.2 + (activityLevel * 0.8), 
                transform: isActive ? 'scale(1.5)' : 'scale(1)',
                animation: isFreeRunning && !isActive ? `pulse ${animDuration} infinite alternate` : undefined
            }}
          />
      </div>

      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-400 shadow-inner" />
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-400 shadow-inner" />

      {/* Header */}
      <div className="w-full text-center border-b border-zinc-700 pb-1 mt-1 truncate font-bold text-zinc-300 uppercase tracking-tighter cursor-default pr-3">
        {module.name}
      </div>

      {/* Faceplate Visuals */}
      <div className="flex-1 w-full flex flex-col items-center justify-center space-y-2 py-2 pointer-events-none">
        <div className={`p-2 border-2 border-zinc-900 rounded-full bg-zinc-900/50 shadow-inner ${isActive || activityLevel > 0.1 ? 'shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}`}>
            <Icon />
        </div>
        
        {/* Description Snippet (Small) */}
        {!minimal && (
            <div className="text-[9px] text-zinc-500 text-center leading-tight px-1 h-6 overflow-hidden">
                {module.description}
            </div>
        )}

        {/* Value Display */}
        {!minimal && (
            <div className="w-full bg-black/40 py-0.5 rounded-sm border border-zinc-700 text-center">
                <span className={`font-mono font-bold text-lg ${module.value < 0 ? 'text-red-500' : 'text-green-400'}`}>
                    {module.value > 0 ? `+${module.value}` : module.value}v
                </span>
            </div>
        )}
      </div>

      {/* Jacks Panel */}
      {!minimal && (
          <div className="w-full h-12 bg-zinc-900/80 border-t border-zinc-700 rounded-sm mt-1 flex text-[9px] z-10">
              {/* Inputs */}
              <div className="flex-1 border-r border-zinc-800 flex flex-col items-center justify-start py-1">
                  <span className="text-zinc-600 uppercase mb-1 pointer-events-none">In</span>
                  <div className="flex flex-wrap justify-center gap-2 px-1">
                      {module.inputs.map((port, i) => {
                          const isHighlighted = highlightPort?.type === 'input' && highlightPort?.index === i;
                          return (
                              <button 
                                key={i} 
                                onPointerDown={(e) => onPortPointerDown && onPortPointerDown('input', i, e)}
                                onPointerUp={(e) => onPortPointerUp && onPortPointerUp('input', i, e)}
                                className={`
                                    group relative w-4 h-4 rounded-full border-2 shadow-sm transition-all touch-none
                                    ${getPortColor(port)}
                                    ${isHighlighted ? 'ring-2 ring-white scale-125' : ''}
                                    ${onPortPointerDown ? 'cursor-crosshair hover:scale-110' : 'cursor-default'}
                                `}
                                title={port} 
                              >
                                  <div className="absolute inset-0 bg-black/20 rounded-full" />
                              </button>
                          );
                      })}
                      {module.inputs.length === 0 && <span className="text-zinc-700">-</span>}
                  </div>
              </div>
              {/* Outputs */}
              <div className="flex-1 flex flex-col items-center justify-start py-1">
                  <span className="text-zinc-600 uppercase mb-1 pointer-events-none">Out</span>
                  <div className="flex flex-wrap justify-center gap-2 px-1">
                      {module.outputs.map((port, i) => {
                          const isHighlighted = highlightPort?.type === 'output' && highlightPort?.index === i;
                          return (
                              <button 
                                key={i} 
                                onPointerDown={(e) => onPortPointerDown && onPortPointerDown('output', i, e)}
                                onPointerUp={(e) => onPortPointerUp && onPortPointerUp('output', i, e)}
                                className={`
                                    group relative w-4 h-4 rounded-full border-2 shadow-sm transition-all touch-none
                                    ${getPortColor(port)}
                                    ${isHighlighted ? 'ring-2 ring-white scale-125' : ''}
                                    ${onPortPointerDown ? 'cursor-crosshair hover:scale-110' : 'cursor-default'}
                                `}
                                title={port} 
                              >
                                  <div className="absolute inset-0 bg-black/20 rounded-full" />
                              </button>
                          );
                      })}
                      {module.outputs.length === 0 && <span className="text-zinc-700">-</span>}
                  </div>
              </div>
          </div>
      )}
      
      <style>{`
        @keyframes pulse {
            0% { opacity: 0.3; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 12px currentColor; }
        }
      `}</style>
    </div>
  );
};

export default ModuleCard;
