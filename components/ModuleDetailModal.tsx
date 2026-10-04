
import React, { useEffect, useState } from 'react';
import { Module, ModuleType, Rarity, ModuleSettings } from '../types';
import Button from './Button';
import { Activity, Zap, Skull, Speaker, Radio, Box, X, CircuitBoard, Waves, Settings2, ArrowDownToLine, Minus } from 'lucide-react';

interface ModuleDetailModalProps {
  module: Module;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  onUpdateModule?: (updatedModule: Module) => void;
  isActionDisabled?: boolean;
}

const ModuleVisualizer: React.FC<{ module: Module }> = ({ module }) => {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 100);
        return () => clearInterval(interval);
    }, []);

    const intensity = Math.min(10, Math.max(1, Math.abs(module.value)));
    
    switch (module.type) {
        case ModuleType.VCO:
            return (
                <div className="w-full h-full bg-black rounded-md relative overflow-hidden flex items-center justify-center border border-zinc-800">
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(0deg,transparent_24%,rgba(34,197,94,0.3)_25%,rgba(34,197,94,0.3)_26%,transparent_27%,transparent_74%,rgba(34,197,94,0.3)_75%,rgba(34,197,94,0.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(34,197,94,0.3)_25%,rgba(34,197,94,0.3)_26%,transparent_27%,transparent_74%,rgba(34,197,94,0.3)_75%,rgba(34,197,94,0.3)_76%,transparent_77%,transparent)] bg-[length:30px_30px]" />
                    <svg viewBox="0 0 100 50" className="w-full h-1/2 stroke-green-500 fill-none stroke-2 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]">
                        <path d="M0,25 Q12.5,0 25,25 T50,25 T75,25 T100,25" className="animate-[dash_1s_linear_infinite]" style={{ animationDuration: `${2 / intensity}s` }}>
                           <animate attributeName="d" dur={`${2/intensity}s`} repeatCount="indefinite"
                                values="M0,25 Q12.5,5 25,25 T50,25 T75,25 T100,25;
                                        M0,25 Q12.5,45 25,25 T50,25 T75,25 T100,25;
                                        M0,25 Q12.5,5 25,25 T50,25 T75,25 T100,25" />
                        </path>
                    </svg>
                </div>
            );
        // ... (Other cases same as before) ...
        case ModuleType.LFO:
            return (
                <div className="w-full h-full bg-black rounded-md relative flex items-center justify-center border border-zinc-800">
                    <div className="w-16 h-16 rounded-full border-2 border-blue-900 flex items-center justify-center">
                        <div 
                            className="w-12 h-12 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-in-out"
                            style={{ 
                                transform: `scale(${0.2 + (Math.sin(tick * 0.2 * (intensity/2)) + 1) / 2})`,
                                opacity: 0.5 + (Math.sin(tick * 0.2) + 1) / 4
                            }}
                        />
                    </div>
                </div>
            );
        case ModuleType.VCA:
        case ModuleType.UTILITY:
        case ModuleType.MASTER:
            return (
                <div className="w-full h-full bg-black rounded-md flex items-end justify-center p-4 gap-2 border border-zinc-800">
                    {[0, 1, 2, 3].map(i => {
                        const height = Math.max(10, Math.min(100, (Math.sin(tick * 0.5 + i) + 1) * 50 * (intensity/3)));
                        const color = height > 80 ? 'bg-red-500' : height > 50 ? 'bg-amber-400' : 'bg-green-500';
                        return (
                            <div key={i} className="w-4 bg-zinc-900 rounded-sm overflow-hidden relative h-full flex items-end">
                                <div 
                                    className={`w-full transition-all duration-100 ${color} shadow-[0_0_10px_currentColor]`}
                                    style={{ height: `${height}%` }}
                                />
                            </div>
                        )
                    })}
                </div>
            );
        case ModuleType.FILTER:
        case ModuleType.EFFECT:
             return (
                <div className="w-full h-full bg-black rounded-md flex items-center justify-center border border-zinc-800 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-50">
                         {[...Array(12)].map((_, i) => (
                             <div key={i} 
                                className="w-1 bg-purple-500 transition-all duration-200"
                                style={{ 
                                    height: `${20 + Math.random() * 60}%`,
                                    opacity: Math.random() 
                                }} 
                             />
                         ))}
                    </div>
                    <Activity className="relative z-10 text-white drop-shadow-md" size={32} />
                </div>
             );
        case ModuleType.DUCKER:
             return (
                <div className="w-full h-full bg-black rounded-md flex items-center justify-center border border-zinc-800 overflow-hidden relative">
                    <div className={`absolute inset-0 bg-red-900/30 transition-transform duration-200 ${Math.floor(tick/5) % 2 === 0 ? 'scale-y-50' : 'scale-y-100'}`} />
                    <ArrowDownToLine className="relative z-10 text-orange-500 drop-shadow-md animate-bounce" size={40} />
                </div>
             );
        case ModuleType.SEQ:
             const step = Math.floor(tick / 2) % 8;
             return (
                <div className="w-full h-full bg-black rounded-md grid grid-cols-4 gap-2 p-3 content-center border border-zinc-800">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className={`
                            w-4 h-4 rounded-full transition-all duration-100
                            ${i === step ? 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,1)] scale-110' : 'bg-zinc-800'}
                        `} />
                    ))}
                </div>
             );
        case ModuleType.TRASH:
        case ModuleType.CURSE:
             return (
                 <div className="w-full h-full bg-zinc-950 rounded-md flex items-center justify-center border border-red-900/30 overflow-hidden relative">
                     <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                     {Math.random() > 0.8 && <div className="absolute inset-0 bg-white/20 translate-x-1" />}
                     <Skull className={`text-red-700 ${Math.random() > 0.9 ? 'translate-x-1' : ''}`} size={48} />
                 </div>
             );
        case ModuleType.EMPTY:
             return (
                 <div className="w-full h-full bg-zinc-900 rounded-md flex items-center justify-center border-2 border-zinc-800 opacity-50">
                     <Minus className="text-zinc-700" size={32} />
                 </div>
             );
        default:
             return (
                 <div className="w-full h-full bg-black rounded-md flex items-center justify-center border border-zinc-800">
                     <Zap className="text-zinc-600" size={32} />
                 </div>
             );
    }
};

interface ControlConfig {
    key: keyof ModuleSettings;
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
    def: number;
}

const CONTROL_MAP: Partial<Record<ModuleType, ControlConfig[]>> = {
    [ModuleType.VCO]: [
        { key: 'fine', label: 'Fine Tune', min: -50, max: 50, step: 1, unit: 'ct', def: 0 }
    ],
    [ModuleType.FILTER]: [
        { key: 'cutoff', label: 'Cutoff Freq', min: 0, max: 1, step: 0.01, unit: '', def: 0.5 },
        { key: 'resonance', label: 'Resonance', min: 0, max: 1, step: 0.01, unit: '', def: 0.5 }
    ],
    [ModuleType.LFO]: [
        { key: 'rate', label: 'Rate', min: 0, max: 1, step: 0.01, unit: '', def: 0.5 }
    ],
    [ModuleType.VCA]: [
        { key: 'level', label: 'Gain Level', min: 0, max: 1, step: 0.01, unit: '', def: 1.0 }
    ],
    [ModuleType.EFFECT]: [
        { key: 'time', label: 'Time / Decay', min: 0, max: 1, step: 0.01, unit: '', def: 0.5 },
        { key: 'mix', label: 'Dry / Wet', min: 0, max: 1, step: 0.01, unit: '', def: 0.5 }
    ],
    [ModuleType.SEQ]: [
        { key: 'probability', label: 'Gate Probability', min: 0, max: 1, step: 0.01, unit: '', def: 1.0 }
    ],
    [ModuleType.DUCKER]: [
        { key: 'depth', label: 'Sidechain Depth', min: 0, max: 1, step: 0.01, unit: '', def: 0.8 }
    ]
};

const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({ 
  module, 
  onClose, 
  actionLabel, 
  onAction, 
  onUpdateModule,
  isActionDisabled = false 
}) => {
  
  const getBorderColor = (rarity: Rarity) => {
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

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
        case Rarity.COMMON: return 'text-zinc-400';
        case Rarity.UNCOMMON: return 'text-blue-400';
        case Rarity.RARE: return 'text-amber-400';
        case Rarity.LEGENDARY: return 'text-purple-400';
        case Rarity.MYTHIC: return 'text-pink-400';
        case Rarity.CURSED: return 'text-red-500';
        default: return 'text-zinc-400';
    }
  };

  const handleTune = (val: number) => {
      if (onUpdateModule) {
          onUpdateModule({ ...module, tuning: val });
      }
  };

  const handleSettingChange = (key: keyof ModuleSettings, val: number) => {
      if (onUpdateModule) {
          onUpdateModule({ 
              ...module, 
              settings: { 
                  ...module.settings, 
                  [key]: val 
              } 
          });
      }
  };

  const controls = CONTROL_MAP[module.type] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className={`
        relative w-full max-w-md bg-zinc-900 
        border-2 ${getBorderColor(module.rarity)}
        shadow-[0_0_50px_rgba(0,0,0,0.5)] 
        flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto
      `}>
        
        {/* Header */}
        <div className="flex justify-between items-start p-4 border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 uppercase font-vt323 tracking-widest">{module.name}</h2>
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{module.manufacturer || 'Unknown Manufacturer'}</div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
            
            {/* Visual & Stats Row */}
            <div className="flex space-x-6">
                <div className="w-32 h-32 flex-shrink-0">
                    <ModuleVisualizer module={module} />
                </div>
                
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
                        <span className="text-zinc-500 text-xs uppercase">Type</span>
                        <span className="font-bold text-zinc-200">{module.type}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
                        <span className="text-zinc-500 text-xs uppercase">Rarity</span>
                        <span className={`font-bold ${getRarityColor(module.rarity)}`}>{module.rarity}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
                        <span className="text-zinc-500 text-xs uppercase">Output</span>
                        <span className={`font-bold font-mono text-lg ${module.value < 0 ? 'text-red-500' : 'text-green-400'}`}>
                            {module.value > 0 ? '+' : ''}{module.value}v
                        </span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                        <span className="text-zinc-500 text-xs uppercase">Value</span>
                        <span className="font-bold text-amber-400">{module.cost}cr</span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="bg-zinc-950/50 p-4 rounded border border-zinc-800">
                <p className="text-sm text-zinc-400 leading-relaxed font-mono">
                    {module.description}
                </p>
                {module.effect && (
                    <div className="mt-2 pt-2 border-t border-zinc-800/50 text-xs text-blue-400">
                        <span className="font-bold uppercase text-blue-500">Effect:</span> {module.effect}
                    </div>
                )}
            </div>

            {/* Calibration / Tuning */}
            {onUpdateModule && (controls.length > 0 || module.type === ModuleType.VCO) && (
                <div className="bg-zinc-800/30 p-4 rounded border border-zinc-700 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase text-xs border-b border-zinc-700 pb-2">
                        <Settings2 size={14} /> Module Calibration
                    </div>
                    
                    {/* Standard VCO Tuning (Semitones) */}
                    {module.type === ModuleType.VCO && (
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-400 uppercase">Coarse Tune</span>
                                <span className="text-green-400 font-mono">{(module.tuning || 0) > 0 ? '+' : ''}{module.tuning || 0} st</span>
                            </div>
                            <input 
                                type="range" min="-12" max="12" step="1"
                                value={module.tuning || 0}
                                onChange={(e) => handleTune(parseInt(e.target.value))}
                                className="w-full accent-green-500 h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    )}

                    {/* Dynamic Controls */}
                    {controls.map(ctrl => {
                        const val = module.settings?.[ctrl.key] ?? ctrl.def;
                        return (
                            <div key={ctrl.key} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400 uppercase">{ctrl.label}</span>
                                    <span className="text-amber-400 font-mono">{val > 0 && ctrl.unit ? '+' : ''}{val}{ctrl.unit}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min={ctrl.min} max={ctrl.max} step={ctrl.step}
                                    value={val}
                                    onChange={(e) => handleSettingChange(ctrl.key, parseFloat(e.target.value))}
                                    className="w-full accent-amber-500 h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-800/30 flex justify-end space-x-3 mt-auto">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            {actionLabel && onAction && (
                <Button 
                    variant={module.cost > 0 ? "primary" : "danger"} 
                    onClick={() => { onAction(); onClose(); }}
                    disabled={isActionDisabled}
                >
                    {actionLabel}
                </Button>
            )}
        </div>

        {/* Decorative Screw Heads */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-700/50 pointer-events-none" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-700/50 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-zinc-700/50 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-zinc-700/50 pointer-events-none" />

      </div>
    </div>
  );
};

export default ModuleDetailModal;
