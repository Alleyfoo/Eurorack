
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, ShoppingBag, Map, Briefcase, Zap, AlertTriangle, RotateCcw, Box, User, Terminal, Skull, ClipboardList, CheckCircle2, Hammer, Trash2, Coins, Plug, XCircle, RefreshCw, Volume2 as VolIcon, Landmark, Speaker, MountainSnow, ArrowLeft, Dices, Settings, Save, VolumeX, Trophy, DollarSign, Activity, Server, Sliders, ChevronLeft, ChevronRight, FileText, Waves, Move, Disc, Mic, MicOff, Download, Star, Shuffle, ArrowRight, GripVertical, Volume, Volume1, Plus, Lock } from 'lucide-react';
import { PlayerState, ViewState, Module, LogEntry, Boss, ModuleType, Quest, Rarity, PatchResult, Cable, StudioUpgrade, Character } from './types';
import { INITIAL_DECK, BOSSES, TRASH_ITEMS, CURSE_ITEMS, MASTER_POOL, SCRAP_POOL, STUDIO_UPGRADES, CHARACTERS, BLANK_MODULE, ROW_SIZE } from './constants';
import ModuleCard from './components/ModuleCard';
import ModuleDetailModal from './components/ModuleDetailModal';
import Oscilloscope from './components/Oscilloscope';
import Button from './components/Button';
import Knob from './components/Knob';
import { calculatePatchSynergy, drawCards, generateId, generateDailyQuests, generateShopInventory } from './services/gameLogic';
import { playPatch, playSoundEffect, toggleMute, updateAmbienceIntensity, updateGenerativeInput, syncLivingRack, setGlobalRackParams, setMutedModules, PlaybackMode, ScaleType, updatePerformancePad, startTape, stopTape, setMasterVolumeBoost, setPerformanceOverrides, subscribeToStep } from './services/audioEngine';
import { saveGame, loadGame, clearSave } from './services/storageService';

// --- Components ---

const XYPad: React.FC<{ width: number; height: number }> = ({ width, height }) => {
    const [pos, setPos] = useState({ x: 0.5, y: 0 });
    const ref = useRef<HTMLDivElement>(null);

    const handleMove = (e: React.PointerEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / width));
        const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / height));
        setPos({ x, y });
        updatePerformancePad(x, y);
    };

    return (
        <div 
            ref={ref}
            className="relative bg-zinc-950 border border-zinc-700 rounded overflow-hidden cursor-crosshair touch-none"
            style={{ width, height }}
            onPointerDown={handleMove}
            onPointerMove={(e) => e.buttons === 1 && handleMove(e)}
        >
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(0deg,transparent_24%,#333_25%,#333_26%,transparent_27%,transparent_74%,#333_75%,#333_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,#333_25%,#333_26%,transparent_27%,transparent_74%,#333_75%,#333_76%,transparent_77%,transparent)] bg-[length:20px_20px]" />
            <div 
                className="absolute w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)] -ml-1.5 -mt-1.5 pointer-events-none"
                style={{ left: `${pos.x * 100}%`, top: `${(1 - pos.y) * 100}%` }}
            />
             <div className="absolute bottom-1 left-1 text-[9px] text-zinc-600 font-mono">FREQ / DRIVE</div>
        </div>
    );
};

const StoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
     <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
        <div className="max-w-2xl space-y-8">
            <h1 className="text-5xl font-bold font-vt323 tracking-widest text-amber-500 mb-8">EURORACK INC.</h1>
            <div className="space-y-4 text-lg text-zinc-300 font-mono leading-relaxed text-left">
                <p>The year is 20XX. Analog warmth is the only currency that matters.</p>
                <p>You are a <strong>Patch Runner</strong>. You connect modules, route signals, and generate voltage to survive in the concrete sprawl.</p>
                <p>Start with a small rack. Take jobs. Buy rare modules. Avoid the <span className="text-red-500">Curse of 60Hz Hum</span>.</p>
            </div>
            <div className="pt-8">
                <Button onClick={onClose} className="text-xl px-12 py-4 border-amber-500 text-amber-500 hover:bg-amber-900/20" variant="ghost">INITIALIZE SYSTEM</Button>
            </div>
        </div>
     </div>
);

const SettingsModal: React.FC<{ onClose: () => void; onReset: () => void }> = ({ onClose, onReset }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-lg max-w-sm w-full space-y-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white uppercase flex items-center gap-2"><Settings size={24}/> Settings</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Master Volume</span>
                    <span>50%</span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Mute Audio</span>
                    <Button size="sm" variant="secondary" onClick={() => toggleMute()}>Toggle</Button>
                </div>
                <hr className="border-zinc-800" />
                <Button fullWidth variant="danger" onClick={onReset}>RESET SAVE DATA</Button>
            </div>
            <Button fullWidth variant="ghost" onClick={onClose}>Close</Button>
        </div>
    </div>
);

const CharacterSelectView: React.FC<{ onSelect: (char: Character) => void }> = ({ onSelect }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
            <h1 className="text-4xl font-bold text-zinc-100 uppercase tracking-widest font-vt323">Choose Your Paradigm</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {CHARACTERS.map(char => (
                    <div key={char.id} className="group relative bg-zinc-900 border-2 border-zinc-700 hover:border-amber-500 rounded-lg p-6 flex flex-col gap-4 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer" onClick={() => onSelect(char)}>
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-white uppercase">{char.name}</h2>
                            <span className={`text-[10px] px-2 py-1 rounded font-bold border ${char.difficulty === 'EASY' ? 'border-green-500 text-green-500' : char.difficulty === 'MEDIUM' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}`}>
                                {char.difficulty}
                            </span>
                        </div>
                        <div className="text-amber-500 text-sm font-bold uppercase tracking-wider">{char.focus}</div>
                        <p className="text-sm text-zinc-400 font-mono leading-relaxed flex-1">{char.description}</p>
                        
                        <div className="border-t border-zinc-800 pt-4">
                            <h3 className="text-xs text-zinc-500 font-bold uppercase mb-2">Starter Modules</h3>
                            <div className="flex flex-wrap gap-1">
                                {char.deck.map((m, i) => (
                                    <span key={i} className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 border border-zinc-700">
                                        {m.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <Button fullWidth className="mt-4 group-hover:bg-amber-600 group-hover:border-amber-500 group-hover:text-black transition-colors">SELECT</Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ShopView: React.FC<{
    credits: number;
    inventory: Module[];
    deck: Module[];
    onBuy: (item: Module) => void;
    onSell: (item: Module) => void;
    onBack: () => void;
    onSelect: (item: Module, mode: 'buy' | 'sell') => void;
}> = ({ credits, inventory, deck, onBuy, onSell, onBack, onSelect }) => {
    return (
        <div className="h-full flex flex-col p-6 animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <ShoppingBag size={32} className="text-blue-500" />
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-100 uppercase">Black Market</h2>
                        <div className="text-xs text-zinc-500 font-mono">CREDITS: <span className="text-green-400 text-lg">{credits}</span></div>
                    </div>
                </div>
                <Button variant="secondary" onClick={onBack}>Leave Shop</Button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto">
                <div className="space-y-4">
                    <h3 className="text-zinc-400 font-bold uppercase text-sm flex items-center gap-2"><Download size={16}/> Stock ({inventory.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {inventory.map(m => (
                            <div key={m.id} className="group relative">
                                <div onClick={() => onSelect(m, 'buy')} className="cursor-pointer">
                                    <ModuleCard module={m} size="sm" />
                                </div>
                                <div className="absolute top-0 right-0 bg-black/80 text-green-400 text-xs px-1 font-mono font-bold border border-zinc-700">{m.cost}cr</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4 border-l border-zinc-800 pl-8">
                     <h3 className="text-zinc-400 font-bold uppercase text-sm flex items-center gap-2"><DollarSign size={16}/> Your Rack ({deck.filter(m => m.type !== ModuleType.EMPTY).length} active)</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {deck.filter(m => m.type !== ModuleType.EMPTY).map(m => (
                             <div key={m.id} className="group relative">
                                <div onClick={() => onSelect(m, 'sell')} className="cursor-pointer opacity-80 hover:opacity-100">
                                    <ModuleCard module={m} size="sm" />
                                </div>
                                <div className="absolute top-0 right-0 bg-black/80 text-blue-400 text-xs px-1 font-mono font-bold border border-zinc-700">{Math.floor(m.cost * 0.5)}cr</div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

const QuestView: React.FC<{
    quests: Quest[];
    credits: number;
    ap: number;
    deck: Module[];
    onComplete: (quest: Quest, moduleId?: string) => void;
    onBack: () => void;
}> = ({ quests, credits, ap, deck, onComplete, onBack }) => {
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [selectionMode, setSelectionMode] = useState<'REPAIR' | 'PURIFY' | 'SALVAGE' | null>(null);

    const handleQuestClick = (quest: Quest) => {
        if (ap < quest.costAp || credits < quest.costCredits) {
            playSoundEffect('error');
            return;
        }
        if (quest.type === 'EARN') {
            onComplete(quest);
        } else {
            setSelectedQuest(quest);
            setSelectionMode(quest.type);
        }
    };

    const handleModuleSelect = (m: Module) => {
        if (!selectedQuest) return;
        onComplete(selectedQuest, m.id);
        setSelectedQuest(null);
        setSelectionMode(null);
    };

    return (
        <div className="h-full flex flex-col p-6 animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <ClipboardList size={32} className="text-amber-500" />
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-100 uppercase">Available Gigs</h2>
                        <div className="text-xs text-zinc-500 font-mono">AP: {ap} | CREDITS: {credits}</div>
                    </div>
                </div>
                <Button variant="secondary" onClick={onBack}>Back</Button>
            </div>

            {selectionMode ? (
                 <div className="flex flex-col h-full">
                    <div className="mb-4 text-center">
                        <h3 className="text-xl font-bold text-white uppercase">Select Module to {selectionMode}</h3>
                        <Button variant="ghost" onClick={() => { setSelectionMode(null); setSelectedQuest(null); }} className="mt-2 text-xs">Cancel</Button>
                    </div>
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {deck.filter(m => {
                            if (selectionMode === 'REPAIR' || selectionMode === 'SALVAGE') return m.type === ModuleType.TRASH;
                            if (selectionMode === 'PURIFY') return m.type === ModuleType.CURSE;
                            return false;
                        }).map(m => (
                            <div key={m.id} onClick={() => handleModuleSelect(m)} className="cursor-pointer hover:scale-105 transition-transform">
                                <ModuleCard module={m} size="sm" />
                            </div>
                        ))}
                    </div>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quests.map(q => (
                        <div key={q.id} className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg flex flex-col gap-4 hover:border-amber-500/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-zinc-200">{q.title}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${q.type === 'EARN' ? 'bg-green-900 text-green-400' : 'bg-blue-900 text-blue-400'}`}>{q.type}</span>
                            </div>
                            <p className="text-sm text-zinc-400 flex-1">{q.description}</p>
                            <div className="space-y-2 text-xs font-mono text-zinc-500 border-t border-zinc-800 pt-3">
                                <div className="flex justify-between"><span>COST:</span> <span className={ap < q.costAp ? 'text-red-500' : ''}>{q.costAp} AP</span></div>
                                {q.costCredits > 0 && <div className="flex justify-between"><span>FEE:</span> <span className={credits < q.costCredits ? 'text-red-500' : ''}>{q.costCredits}cr</span></div>}
                                <div className="flex justify-between text-amber-500"><span>REWARD:</span> <span>{q.rewardDescription}</span></div>
                            </div>
                            <Button 
                                onClick={() => handleQuestClick(q)} 
                                disabled={ap < q.costAp || credits < q.costCredits}
                                fullWidth
                                className={q.type === 'EARN' ? "bg-green-700 border-green-600 hover:bg-green-600" : ""}
                            >
                                ACCEPT
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PerformanceView: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    // ... (No Changes)
    const [timeLeft, setTimeLeft] = useState(20);
    const [params, setParams] = useState({ timbre: 0.5, space: 0.5, force: 0.5 });
    const [targetParam, setTargetParam] = useState<'timbre' | 'space' | 'force'>('timbre');
    const [targetValue, setTargetValue] = useState(0.5); 
    const [stability, setStability] = useState(100);
    const [status, setStatus] = useState<'STABLE' | 'DRIFTING' | 'CRITICAL'>('STABLE');
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        setPerformanceOverrides(params.timbre, params.space, params.force);
        return () => setPerformanceOverrides(null, null, null);
    }, []);

    useEffect(() => {
        setPerformanceOverrides(params.timbre, params.space, params.force);
    }, [params]);

    useEffect(() => {
        let changeTargetTimer = 0;
        const animate = (time: number) => {
            if (lastTimeRef.current !== undefined) {
                const deltaTime = time - lastTimeRef.current;
                changeTargetTimer += deltaTime;
                if (changeTargetTimer > 2000) {
                    const keys: ('timbre' | 'space' | 'force')[] = ['timbre', 'space', 'force'];
                    const next = keys[Math.floor(Math.random() * 3)];
                    setTargetParam(next);
                    setTargetValue(Math.random());
                    changeTargetTimer = 0;
                    playSoundEffect('error');
                }
                const currentVal = params[targetParam];
                const dist = Math.abs(currentVal - targetValue);
                const isSafe = dist < 0.15; 
                if (isSafe) {
                    setStability(prev => Math.min(100, prev + 0.2));
                    setStatus('STABLE');
                } else {
                    setStability(prev => Math.max(0, prev - 0.15));
                    setStatus(dist > 0.4 ? 'CRITICAL' : 'DRIFTING');
                }
            }
            lastTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [params, targetParam, targetValue]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete(stability / 100);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [stability]);

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 space-y-8 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${status === 'CRITICAL' ? 'bg-red-900/30' : 'bg-transparent'}`} />
            <div className="z-10 w-full max-w-2xl flex justify-between items-center bg-zinc-900/80 p-4 rounded border border-zinc-700">
                <div className="text-center"><div className="text-xs text-zinc-500 font-mono">TIME REMAINING</div><div className="text-3xl font-bold font-vt323 text-white">{timeLeft}s</div></div>
                <div className="flex-1 px-8"><div className="flex justify-between text-xs font-mono mb-1"><span>SIGNAL STABILITY</span><span className={stability < 30 ? 'text-red-500 animate-pulse' : 'text-green-500'}>{Math.round(stability)}%</span></div><div className="h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700"><div className={`h-full transition-all duration-100 ${stability > 60 ? 'bg-green-500' : stability > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stability}%` }} /></div></div>
                <div className="text-center"><div className="text-xs text-zinc-500 font-mono">STATUS</div><div className={`text-xl font-bold ${status === 'STABLE' ? 'text-green-400' : status === 'CRITICAL' ? 'text-red-500 animate-bounce' : 'text-yellow-400'}`}>{status}</div></div>
            </div>
            <div className="z-10 w-full max-w-2xl h-16 bg-black rounded border border-zinc-700 relative overflow-hidden flex items-center">
                <div className="absolute h-full bg-green-500/20 border-x border-green-500/50 transition-all duration-300" style={{ left: `${(targetValue - 0.15) * 100}%`, width: '30%' }}><div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] text-green-400 font-mono mt-1">TARGET</div></div>
                <div className="absolute h-full w-1 bg-white shadow-[0_0_10px_white] transition-all duration-75" style={{ left: `${params[targetParam] * 100}%` }} />
            </div>
            <div className="z-10 text-center space-y-2"><h2 className="text-2xl font-bold text-white uppercase tracking-widest animate-pulse">ADJUST {targetParam}</h2><p className="text-zinc-500 text-xs font-mono">Match the white line to the green zone!</p></div>
            <div className="z-10 grid grid-cols-3 gap-12"><Knob label="TIMBRE" value={params.timbre} onChange={(v) => setParams(p => ({ ...p, timbre: v }))} highlight={targetParam === 'timbre'} color="#a855f7" /><Knob label="SPACE" value={params.space} onChange={(v) => setParams(p => ({ ...p, space: v }))} highlight={targetParam === 'space'} color="#3b82f6" /><Knob label="FORCE" value={params.force} onChange={(v) => setParams(p => ({ ...p, force: v }))} highlight={targetParam === 'force'} color="#ef4444" /></div>
        </div>
    );
};

const VictoryView: React.FC<{ onContinue: () => void }> = ({ onContinue }) => (
    <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-1000 bg-gradient-to-b from-zinc-900 to-black">
        <Trophy size={80} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
        <div className="text-center space-y-2">
            <h1 className="text-6xl font-bold font-vt323 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">VICTORY</h1>
            <p className="text-zinc-400 font-mono">The signal has been established.</p>
        </div>
        <div className="p-6 bg-zinc-900/50 border border-zinc-700 rounded-lg max-w-md text-center">
            <p className="text-sm text-zinc-300 mb-4">You have conquered the Eurorack underworld. But there are always more noises to be made.</p>
            <Button onClick={onContinue} className="text-lg px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold">NEW GAME+</Button>
        </div>
    </div>
);

// --- Sub-Views ---

const CityView: React.FC<{
    credits: number;
    ap: number;
    deck: Module[];
    onBack: () => void;
    onScavenge: () => void;
    onGamble: (amount: number) => boolean;
    onRepair: (moduleId: string, cost: number) => void;
    onPurify: (moduleId: string, cost: number) => void;
}> = ({ credits, ap, deck, onBack, onScavenge, onGamble, onRepair, onPurify }) => {
    // ... (No Changes, handled via wrapper props)
    const [location, setLocation] = useState<'MAP' | 'TEMPLE' | 'CLUB' | 'SCRAPYARD'>('MAP');
    const trashModules = deck.filter(m => m.type === ModuleType.TRASH);
    const cursedModules = deck.filter(m => m.type === ModuleType.CURSE);
    const [bet, setBet] = useState(10);
    const [gambleResult, setGambleResult] = useState<'WIN' | 'LOSE' | null>(null);

    const handleGamble = () => {
        if (credits < bet) { playSoundEffect('error'); return; }
        const win = onGamble(bet);
        setGambleResult(win ? 'WIN' : 'LOSE');
        playSoundEffect(win ? 'power' : 'error');
        setTimeout(() => setGambleResult(null), 1500);
    };

    const handleRepair = (m: Module) => {
        if (credits >= 50) onRepair(m.id, 50);
        else playSoundEffect('error');
    };

    const handlePurify = (m: Module) => {
        if (credits >= 100) onPurify(m.id, 100);
        else playSoundEffect('error');
    };

    if (location === 'MAP') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-500">
                <h2 className="text-3xl font-bold text-zinc-100 uppercase tracking-[0.2em] mb-4">The Concrete Sprawl</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                    <button onClick={() => { setLocation('TEMPLE'); playSoundEffect('click'); }} className="group bg-zinc-900 border-2 border-zinc-700 hover:border-amber-500 p-8 rounded-lg flex flex-col items-center gap-4 transition-all hover:bg-zinc-800"><Landmark size={48} className="text-zinc-500 group-hover:text-amber-500 transition-colors" /><div className="text-center"><div className="text-xl font-bold text-zinc-200">Solder Temple</div><div className="text-xs text-zinc-500 mt-2 font-mono">REPAIR & PURIFY</div></div></button>
                    <button onClick={() => { setLocation('CLUB'); playSoundEffect('click'); }} className="group bg-zinc-900 border-2 border-zinc-700 hover:border-purple-500 p-8 rounded-lg flex flex-col items-center gap-4 transition-all hover:bg-zinc-800"><Speaker size={48} className="text-zinc-500 group-hover:text-purple-500 transition-colors" /><div className="text-center"><div className="text-xl font-bold text-zinc-200">The Noise Club</div><div className="text-xs text-zinc-500 mt-2 font-mono">RISK & REWARD</div></div></button>
                    <button onClick={() => { setLocation('SCRAPYARD'); playSoundEffect('click'); }} className="group bg-zinc-900 border-2 border-zinc-700 hover:border-green-600 p-8 rounded-lg flex flex-col items-center gap-4 transition-all hover:bg-zinc-800"><MountainSnow size={48} className="text-zinc-500 group-hover:text-green-600 transition-colors" /><div className="text-center"><div className="text-xl font-bold text-zinc-200">The Scrapyard</div><div className="text-xs text-zinc-500 mt-2 font-mono">SCAVENGE (-1 AP)</div></div></button>
                </div>
            </div>
        );
    }

    if (location === 'TEMPLE') {
        return (
            <div className="h-full flex flex-col p-6 animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
                     <div className="flex items-center gap-4"><Landmark size={32} className="text-amber-500" /><div><h2 className="text-2xl font-bold text-zinc-100 uppercase">Solder Temple</h2><p className="text-xs text-zinc-500 font-mono">"We fix what is broken. We silence what screams."</p></div></div>
                     <Button variant="secondary" onClick={() => setLocation('MAP')}>Back to Map</Button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-bold flex items-center gap-2"><Hammer size={16}/> Broken Modules (Repair Cost: 50cr)</h3>
                        {trashModules.length === 0 ? (<div className="text-zinc-600 italic text-sm p-4 border border-zinc-800 rounded">No trash modules detected.</div>) : (<div className="grid grid-cols-2 md:grid-cols-4 gap-4">{trashModules.map(m => (<div key={m.id} className="flex flex-col gap-2"><ModuleCard module={m} size="sm" /><Button size="sm" onClick={() => handleRepair(m)} disabled={credits < 50} className="text-xs">Fix (50cr)</Button></div>))}</div>)}
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-bold flex items-center gap-2"><CheckCircle2 size={16}/> Cursed Modules (Purify Cost: 100cr)</h3>
                        {cursedModules.length === 0 ? (<div className="text-zinc-600 italic text-sm p-4 border border-zinc-800 rounded">No curses detected.</div>) : (<div className="grid grid-cols-2 md:grid-cols-4 gap-4">{cursedModules.map(m => (<div key={m.id} className="flex flex-col gap-2"><ModuleCard module={m} size="sm" /><Button size="sm" variant="danger" onClick={() => handlePurify(m)} disabled={credits < 100} className="text-xs">Purify (100cr)</Button></div>))}</div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (location === 'CLUB') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 space-y-8 animate-in slide-in-from-right duration-300">
                <div className="absolute top-6 left-6"><Button variant="secondary" onClick={() => setLocation('MAP')}><ArrowLeft size={16}/> Leave Club</Button></div>
                <div className="text-center space-y-2"><Speaker size={64} className="text-purple-600 mx-auto animate-pulse" /><h2 className="text-4xl font-bold text-purple-400 uppercase font-vt323 tracking-widest">HIGH VOLTAGE BETTING</h2><p className="text-zinc-500 font-mono">Double your credits or burn your wallet.</p></div>
                <div className="bg-zinc-900 border-2 border-purple-900 p-8 rounded-lg w-full max-w-md flex flex-col items-center gap-6 shadow-[0_0_30px_rgba(147,51,234,0.1)]">
                    <div className="text-6xl font-bold font-vt323 text-white tabular-nums">{gambleResult === 'WIN' && <span className="text-green-500 animate-bounce">WIN!</span>}{gambleResult === 'LOSE' && <span className="text-red-500 animate-bounce">LOSS</span>}{!gambleResult && "READY"}</div>
                    <div className="flex items-center gap-4 w-full"><input type="range" min="10" max={Math.min(credits, 500)} step="10" value={bet} onChange={(e) => setBet(parseInt(e.target.value))} className="w-full accent-purple-500" disabled={credits < 10} /><div className="font-mono font-bold text-xl min-w-[80px] text-right">{bet}cr</div></div>
                    <Button fullWidth variant="primary" className="h-16 text-xl bg-purple-600 border-purple-500 hover:bg-purple-500 text-white" onClick={handleGamble} disabled={credits < 10 || gambleResult !== null}><Dices className="mr-2" /> SPIN VOLTAGE</Button>
                </div>
            </div>
        );
    }

    if (location === 'SCRAPYARD') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 space-y-8 animate-in slide-in-from-right duration-300">
                <div className="absolute top-6 left-6"><Button variant="secondary" onClick={() => setLocation('MAP')}><ArrowLeft size={16}/> Leave Scrapyard</Button></div>
                <div className="text-center space-y-2"><MountainSnow size={64} className="text-green-800 mx-auto" /><h2 className="text-3xl font-bold text-green-700 uppercase tracking-widest">THE HEAP</h2><p className="text-zinc-500 font-mono max-w-md">"One synth's trash is another synth's... well, usually just more trash. But sometimes..."</p></div>
                <div className="flex flex-col items-center gap-4"><div className="text-sm font-mono text-zinc-400">COST: 1 AP</div><Button onClick={() => { onScavenge(); playSoundEffect('power'); }} disabled={ap < 1} className="h-32 w-64 text-2xl border-green-800 text-green-500 hover:bg-green-900/20" variant="secondary">SCAVENGE</Button></div>
            </div>
        );
    }
    return null;
};

// --- NEW STUDIO VIEW ---
const StudioView: React.FC<{
    reputation: number;
    upgrades: Record<string, number>;
    onBuyUpgrade: (upgrade: StudioUpgrade) => void;
    onBack: () => void;
}> = ({ reputation, upgrades, onBuyUpgrade, onBack }) => {
    return (
        <div className="h-full flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <Disc size={40} className="text-cyan-500" />
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-100 uppercase tracking-widest">Studio Upgrades</h2>
                        <div className="text-xs text-zinc-500 font-mono">
                            REPUTATION: <span className="text-cyan-400 text-lg font-bold">{reputation}</span>
                        </div>
                    </div>
                </div>
                <Button variant="secondary" onClick={onBack}>Back to Home</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STUDIO_UPGRADES.map(upgrade => {
                    const currentLevel = upgrades[upgrade.id] || 0;
                    const isMaxed = currentLevel >= upgrade.maxLevel;
                    const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, currentLevel));
                    const canAfford = reputation >= cost;

                    return (
                        <div key={upgrade.id} className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg flex flex-col justify-between space-y-4 hover:border-cyan-900/50 transition-colors">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-zinc-200">{upgrade.name}</h3>
                                    <div className="text-xs font-mono text-zinc-500">
                                        LVL {currentLevel}/{upgrade.maxLevel}
                                    </div>
                                </div>
                                <p className="text-sm text-zinc-400 h-12">{upgrade.description}</p>
                                <div className="mt-4 p-2 bg-black/30 rounded border border-zinc-800 text-xs font-mono text-cyan-400">
                                    CURRENT: {upgrade.effectDescription(currentLevel)}
                                    {!isMaxed && <div className="text-zinc-600 mt-1">NEXT: {upgrade.effectDescription(currentLevel + 1)}</div>}
                                </div>
                            </div>
                            
                            <Button 
                                fullWidth 
                                variant={isMaxed ? "secondary" : canAfford ? "primary" : "secondary"} 
                                disabled={isMaxed || !canAfford}
                                onClick={() => { playSoundEffect(isMaxed ? 'error' : canAfford ? 'power' : 'error'); if(!isMaxed && canAfford) onBuyUpgrade(upgrade); }}
                                className={canAfford && !isMaxed ? "bg-cyan-700 border-cyan-600 text-white hover:bg-cyan-600" : ""}
                            >
                                {isMaxed ? "MAXED OUT" : `UPGRADE (${cost} REP)`}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- JOB VIEW UPDATE ---
const JobView: React.FC<{ 
    deck: Module[]; 
    credits: number;
    week: number;
    cableLevel: number; 
    onComplete: (success: boolean, reward: number, output: number) => void;
    onBack: () => void;
    onReroll: (cost: number) => boolean;
}> = ({ deck, credits, week, cableLevel, onComplete, onBack, onReroll }) => {
    const [hand, setHand] = useState<Module[]>([]);
    const [patched, setPatched] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<PatchResult | null>(null);
    const [cables, setCables] = useState<Cable[]>([]);
    const [dragState, setDragState] = useState<{ moduleId: string; type: 'input' | 'output'; index: number; startX: number; startY: number; currX: number; currY: number; } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const targetOutput = Math.floor(4 + (week - 1) * 1.5);

    useEffect(() => { setHand(drawCards(deck, 3)); setCables([]); setPatched(false); setResult(null); }, [deck]);

    const getPortCoordinates = useCallback((moduleId: string, type: 'input' | 'output', index: number) => {
        const cardIdx = hand.findIndex(m => m.id === moduleId);
        if (cardIdx === -1) return null;
        const cardWidth = 160; const gap = 24; const portOffsetY = 245; 
        const cardStart = cardIdx * (cardWidth + gap); const sectionStart = type === 'output' ? cardStart + 80 : cardStart;
        return { x: sectionStart + (index * 20) + 20, y: portOffsetY };
    }, [hand]);

    const handlePortPointerDown = (moduleId: string, type: 'input' | 'output', index: number, e: React.PointerEvent) => {
        if (patched) return; e.stopPropagation();
        const coords = getPortCoordinates(moduleId, type, index);
        if (!coords) return;
        setDragState({moduleId, type, index, startX: coords.x, startY: coords.y, currX: coords.x, currY: coords.y});
        playSoundEffect('click');
    };

    const handleGlobalPointerMove = (e: React.PointerEvent) => {
        if (!dragState || !containerRef.current) return;
        const patchArea = containerRef.current.querySelector('.patch-area');
        if (patchArea) {
            const rect = patchArea.getBoundingClientRect();
            setDragState(prev => prev ? { ...prev, currX: e.clientX - rect.left, currY: e.clientY - rect.top } : null);
        }
    };

    const handlePortPointerUp = (moduleId: string, type: 'input' | 'output', index: number, e: React.PointerEvent) => {
        if (!dragState) return; e.stopPropagation();
        if (dragState.moduleId === moduleId || dragState.type === type) { setDragState(null); return; }
        const newCable: Cable = { id: generateId(), fromModuleId: dragState.type === 'output' ? dragState.moduleId : moduleId, fromPortIndex: dragState.type === 'output' ? dragState.index : index, toModuleId: dragState.type === 'input' ? dragState.moduleId : moduleId, toPortIndex: dragState.type === 'input' ? dragState.index : index, color: `hsl(${Math.random() * 360}, 70%, 50%)` };
        setCables(prev => [...prev, newCable]); setDragState(null); playSoundEffect('click');
    };

    const handleGlobalPointerUp = () => { if (dragState) setDragState(null); };
    const clearCables = () => { setCables([]); setPatched(false); setResult(null); playSoundEffect('click'); };
    const handleRerollClick = () => { if (onReroll(5)) { setHand(drawCards(deck, 3)); setCables([]); setPatched(false); setResult(null); playSoundEffect('power'); } else { playSoundEffect('error'); } };

    const handlePatch = () => {
        setAnalyzing(true); playSoundEffect('power'); playPatch(hand, cables);
        setTimeout(() => {
            const calcResult = calculatePatchSynergy(hand, cables, cableLevel); 
            setResult(calcResult);
            const success = calcResult.totalOutput >= targetOutput;
            const reward = success ? (calcResult.totalOutput * 10) : 0;
            setPatched(true); setAnalyzing(false);
            if (!success) playSoundEffect('error');
            setTimeout(() => { onComplete(success, reward, calcResult.totalOutput); }, 3000); 
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500 w-full touch-none" ref={containerRef} onPointerMove={handleGlobalPointerMove} onPointerUp={handleGlobalPointerUp}>
            <div className="text-center w-full max-w-lg flex items-center justify-between bg-zinc-900/50 p-4 rounded border border-zinc-800">
                <div className="text-left"><h2 className="text-xl font-bold text-amber-500 uppercase tracking-widest">Client Job</h2><p className="text-zinc-500 font-mono text-xs mt-1">Target: {targetOutput}v</p></div>
                <div className="relative"><Oscilloscope width={200} height={60} /><div className="absolute top-1 right-1 text-[10px] text-green-500 font-mono">MASTER OUT</div></div>
            </div>
            <div className="patch-area relative flex justify-center py-6 px-12 touch-none">
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" style={{ left: '50%', transform: 'translateX(-50%)', width: '530px' }}>
                    {cables.map(cable => {
                        const c1 = getPortCoordinates(cable.fromModuleId, 'output', cable.fromPortIndex); const c2 = getPortCoordinates(cable.toModuleId, 'input', cable.toPortIndex);
                        if (!c1 || !c2) return null;
                        const cp1y = c1.y + 100; const cp2y = c2.y + 100;
                        return (<path key={cable.id} d={`M ${c1.x} ${c1.y} C ${c1.x} ${cp1y}, ${c2.x} ${cp2y}, ${c2.x} ${c2.y}`} fill="none" stroke={cable.color} strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_3px_rgba(0,0,0,0.8)] opacity-90"/>);
                    })}
                    {dragState && (<path d={`M ${dragState.startX} ${dragState.startY} C ${dragState.startX} ${dragState.startY + 50}, ${dragState.currX} ${dragState.currY + 50}, ${dragState.currX} ${dragState.currY}`} fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="4" strokeLinecap="round" strokeDasharray="10,5" className="pointer-events-none"/>)}
                </svg>
                <div className="flex justify-center space-x-6 z-10" style={{ width: '530px' }}>{hand.map((card, idx) => (<div key={`${card.id}-${idx}`} className="relative"><ModuleCard module={card} onPortPointerDown={(type, index, e) => handlePortPointerDown(card.id, type, index, e)} onPortPointerUp={(type, index, e) => handlePortPointerUp(card.id, type, index, e)} highlightPort={dragState ? (dragState.moduleId !== card.id && dragState.type !== 'input' ? { type: 'input', index: -1 } : null) : null} activityLevel={result?.moduleActivity[card.id] || 0}/></div>))}</div>
            </div>
            <div className="w-full max-w-md min-h-[160px] flex flex-col items-center justify-center space-y-4 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 z-30">
                 {analyzing ? (<div className="flex flex-col items-center space-y-2 text-green-400"><Plug className="animate-bounce" size={32} /><span className="text-xl font-mono animate-pulse">Tracing Signal Path...</span></div>) : patched && result ? (
                     <div className="flex flex-col items-center text-center space-y-3 animate-in zoom-in-95 duration-300">
                         <div className={`text-sm uppercase tracking-widest font-bold ${result.multiplier > 1 ? 'text-amber-400' : 'text-zinc-500'}`}>{result.synergyName}</div>
                         <div className="text-xs text-zinc-400 font-mono max-w-xs">{result.feedback}</div>
                         <div className="flex flex-col gap-1 w-full border-t border-zinc-700 pt-2 mt-2">
                             <div className="flex justify-between text-xs text-zinc-500"><span>Modules</span><span>{result.baseScore.toFixed(1)}v</span></div>
                             <div className="flex justify-between text-xs text-zinc-500"><span>Patching ({cables.length})</span><span>+{(cables.length * (0.5 + cableLevel*0.2)).toFixed(1)}v</span></div>
                             {result.multiplier > 1 && (<div className="flex justify-between text-xs text-yellow-500"><span>Synergy</span><span>x{result.multiplier.toFixed(1)}</span></div>)}
                         </div>
                         <div className={`text-4xl font-bold font-vt323 ${result.totalOutput >= targetOutput ? 'text-green-500 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'text-red-500'}`}>{result.totalOutput}v</div>
                     </div>
                 ) : (
                    <div className="w-full space-y-3">
                        <div className="text-xs text-zinc-500 text-center font-mono">{cables.length === 0 ? "Drag between ports to patch." : `${cables.length} connections made.`}</div>
                        <div className="flex gap-2"><Button variant="secondary" onClick={clearCables} disabled={cables.length === 0} title="Clear Patch"><XCircle size={20} /></Button><Button variant="secondary" onClick={handleRerollClick} disabled={credits < 5} title="Reroll Hand (5cr)"><span className="flex items-center gap-1"><RefreshCw size={20} /> <span className="text-xs">5cr</span></span></Button><Button onClick={handlePatch} className="flex-1 text-lg shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all"><span className="flex items-center justify-center gap-2"><Zap size={20} /> POWER ON</span></Button></div>
                    </div>
                 )}
            </div>
        </div>
    );
};

const BossView: React.FC<{
    boss: Boss;
    deck: Module[];
    credits: number;
    onBattleEnd: (win: boolean) => void;
    onReroll: (cost: number) => boolean;
}> = ({ boss, deck, credits, onBattleEnd, onReroll }) => {
    // ... (No Changes)
    const [wins, setWins] = useState(0);
    const [lives, setLives] = useState(3);
    const [round, setRound] = useState(1);
    const [showIntro, setShowIntro] = useState(true);

    const handleRoundComplete = (success: boolean) => {
        if (success) {
            const newWins = wins + 1;
            setWins(newWins);
            if (newWins >= boss.hp) {
                setTimeout(() => onBattleEnd(true), 1500);
            } else {
                setRound(r => r + 1);
            }
        } else {
            const newLives = lives - 1;
            setLives(newLives);
            if (newLives <= 0) {
                setTimeout(() => onBattleEnd(false), 1500);
            }
        }
    };

    if (showIntro) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in zoom-in duration-500">
                <Skull size={64} className="text-red-500 animate-pulse" />
                <h1 className="text-4xl font-bold font-vt323 tracking-widest text-red-500 uppercase">{boss.name}</h1>
                <h2 className="text-xl text-zinc-400 uppercase tracking-widest">{boss.title}</h2>
                <p className="max-w-md text-zinc-500 font-mono">{boss.description}</p>
                <div className="bg-zinc-900 p-4 rounded border border-red-900/50">
                    <div className="text-sm font-bold text-red-400 mb-2">OBJECTIVE</div>
                    <div className="text-xs text-zinc-400">Generate powerful signals to overload the boss.</div>
                    <div className="text-lg font-bold text-white mt-2">WINS REQUIRED: {boss.hp}</div>
                </div>
                <Button variant="danger" onClick={() => setShowIntro(false)} className="text-xl px-8 py-4">ENGAGE</Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative">
            <div className="absolute top-0 left-0 right-0 h-16 bg-red-950/20 border-b border-red-900/50 flex justify-between items-center px-6 z-10 pointer-events-none">
                <div className="flex items-center gap-2">
                    <Skull className="text-red-500" size={20}/>
                    <span className="text-red-500 font-bold uppercase">{boss.name}</span>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-red-400 uppercase">Boss Integrity</span>
                        <div className="flex gap-1">
                            {[...Array(boss.hp)].map((_, i) => (
                                <div key={i} className={`w-4 h-2 rounded-sm ${i < (boss.hp - wins) ? 'bg-red-500' : 'bg-zinc-800'}`} />
                            ))}
                        </div>
                    </div>
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-400 uppercase">Your Integrity</span>
                         <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`w-4 h-2 rounded-sm ${i < lives ? 'bg-green-500' : 'bg-zinc-800'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 pt-10">
                <JobView 
                    key={round}
                    deck={deck} 
                    credits={credits} 
                    week={1} 
                    cableLevel={0} 
                    onComplete={(success, _, output) => handleRoundComplete(success)}
                    onBack={() => {}} 
                    onReroll={onReroll}
                />
            </div>
        </div>
    );
};

// --- RACK VIEW (Overhauled) ---
const RackView: React.FC<{
    deck: Module[];
    capacity: number;
    onSelect: (item: Module) => void;
    onBack: () => void;
    mutedModules: Set<string>;
    toggleMuteModule: (id: string) => void;
    onMoveModule: (id: string, direction: 'left' | 'right') => void;
    onShuffleModules: () => void;
    globalParams: { tempo: number; filterCutoff: number; delayAmount: number; resonance: number; rackVolume: number; playMode: PlaybackMode; scaleType: ScaleType; shuffle: number; modFilter: boolean; modResonance: boolean; volDrum: number; volBass: number; volMelody: number };
    setParams: (p: any) => void;
    onReorderModule: (fromIndex: number, toIndex: number) => void;
    onAddBlank: () => void;
}> = ({ deck, capacity, onSelect, onBack, mutedModules, toggleMuteModule, onMoveModule, onShuffleModules, globalParams, setParams, onReorderModule, onAddBlank }) => {
    
    const [isRecording, setIsRecording] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(-1);

    useEffect(() => {
        const unsubscribe = subscribeToStep((indices, step) => {
            setCurrentStep(step);
        });
        return unsubscribe;
    }, []);

    const handleRecordToggle = async () => {
        if (!isRecording) {
            const started = startTape();
            if (started) setIsRecording(true);
        } else {
            await stopTape();
            setIsRecording(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault(); 
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        
        if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
            // Drag and Drop Swap Logic for any slot
            onReorderModule(sourceIndex, targetIndex);
            playSoundEffect('click');
        }
    };

    const handleDragEnd = () => {
        setDragOverIndex(null);
    };

    const getRowLabel = (index: number) => {
        switch(index) {
            case 0: return "RHYTHM / GATE";
            case 1: return "BASS / FREQ";
            case 2: return "TEXTURE / ATMOS";
            default: return `AUX ${index + 1}`;
        }
    };

    const activeCount = deck.filter(m => m.type !== ModuleType.EMPTY).length;

    return (
        <div className="h-full flex flex-col bg-zinc-950 p-4 overflow-hidden relative">
             <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                    <Server size={24}/> Main Rack
                </h2>
                <div className="flex gap-4 items-center">
                    <div className="text-xs font-mono text-zinc-500">
                        ACTIVE MODULES: <span className={activeCount >= capacity ? "text-red-500" : "text-green-500"}>{activeCount}</span>/{capacity}
                    </div>
                    <div className="h-4 w-[1px] bg-zinc-800"></div>
                    <div className="text-xs font-mono text-green-500 animate-pulse">
                        SEQUENCER RUNNING
                    </div>
                </div>
                <Button variant="secondary" onClick={onBack}>Close Rack</Button>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6 overflow-x-auto pr-80 pb-20 relative"> 
                
                {/* Playhead Overlay */}
                <div 
                    className="absolute top-0 bottom-20 z-40 w-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-75 pointer-events-none"
                    style={{ left: `${(currentStep / 16) * 100}%` }} 
                >
                    <div className="absolute -top-2 -left-1.5 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-black font-bold">
                        {currentStep + 1}
                    </div>
                </div>

                {[0, 1, 2].map((rowIdx) => (
                    <div key={rowIdx} className="relative">
                        {/* Row Label */}
                        <div className="absolute -top-3 left-0 text-[10px] font-bold text-zinc-500 uppercase tracking-widest z-20">
                            {getRowLabel(rowIdx)}
                        </div>

                        <div className="relative bg-zinc-900 border-t-2 border-b-2 border-zinc-700 h-64 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center px-4 gap-2 min-w-max">
                            {/* Rail Screw Holes (Visual) */}
                            <div className="absolute top-1 left-0 right-0 h-2 bg-[repeating-linear-gradient(90deg,transparent,transparent_19px,#3f3f46_20px)] opacity-50 pointer-events-none" />
                            <div className="absolute bottom-1 left-0 right-0 h-2 bg-[repeating-linear-gradient(90deg,transparent,transparent_19px,#3f3f46_20px)] opacity-50 pointer-events-none" />
                            
                            {/* Slots 0-15 */}
                            {[...Array(ROW_SIZE)].map((_, colIdx) => {
                                const actualIndex = rowIdx * ROW_SIZE + colIdx;
                                const mod = deck[actualIndex];
                                const isDragOver = dragOverIndex === actualIndex;
                                const isActive = currentStep === colIdx && mod && mod.type !== ModuleType.EMPTY;

                                // Always render a slot that is draggable/droppable
                                return (
                                    <div 
                                        key={mod ? mod.id : `empty-${actualIndex}`}
                                        className={`relative shrink-0 transition-transform duration-100 ${isDragOver ? 'scale-105 z-20 brightness-110' : ''}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, actualIndex)}
                                        onDragOver={(e) => handleDragOver(e, actualIndex)}
                                        onDrop={(e) => handleDrop(e, actualIndex)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        {mod ? (
                                            <div className="relative group">
                                                <div onClick={() => onSelect(mod)} className={`cursor-pointer transition-all duration-100 ${mutedModules.has(mod.id) ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100'}`}>
                                                    <ModuleCard 
                                                        module={mod} 
                                                        onClick={() => onSelect(mod)} 
                                                        disabled={mutedModules.has(mod.id)} 
                                                        isActive={isActive}
                                                    />
                                                </div>
                                                
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 rounded px-2 py-0.5 border border-zinc-700 cursor-grab active:cursor-grabbing text-zinc-400 z-30 pointer-events-none">
                                                    <GripVertical size={12} />
                                                </div>

                                                {mod.type !== ModuleType.EMPTY && (
                                                    <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={(e) => { e.stopPropagation(); toggleMuteModule(mod.id); }} className={`bg-black border border-zinc-600 text-[10px] px-2 py-1 rounded hover:text-white ${mutedModules.has(mod.id) ? 'text-red-400 border-red-900' : 'text-zinc-400'}`}>
                                                            {mutedModules.has(mod.id) ? 'UNMUTE' : 'MUTE'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // Fallback for unexpected nulls, should be BLANK_MODULE ideally
                                            <div className="w-40 h-64 border-2 border-dashed border-red-500 flex items-center justify-center text-red-500 font-mono text-xs">ERROR</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar Controls ... (No Changes) */}
            <div className="absolute top-20 right-4 bottom-4 w-72 bg-zinc-900 border-2 border-zinc-700 rounded-lg p-6 shadow-2xl flex flex-col gap-6 overflow-y-auto z-50">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                        <Sliders size={20} className="text-amber-500" />
                        <h3 className="text-lg font-bold font-vt323 tracking-widest text-zinc-200">RACK CONTROLS</h3>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onAddBlank} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white" title="Insert Blank Panel (5cr)">
                            <Plus size={16} />
                        </button>
                        <button onClick={onShuffleModules} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white" title="Randomize Module Order">
                            <Shuffle size={16} />
                        </button>
                    </div>
                </div>

                {/* MIXER SECTION */}
                <div className="space-y-4 border-b border-zinc-800 pb-6">
                    <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                        <span className="flex items-center gap-2"><VolIcon size={14}/> BUS MIXER</span>
                    </div>
                    <div className="space-y-3">
                        {/* Drum Bus */}
                        <div className="flex items-center gap-2">
                            <div className="text-[10px] w-12 text-zinc-500 font-bold">DRUM</div>
                            <input 
                                type="range" min="0" max="1" step="0.05" 
                                value={globalParams.volDrum}
                                onChange={(e) => setParams({ volDrum: parseFloat(e.target.value) })}
                                className="flex-1 accent-orange-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <button onClick={() => setParams({ volDrum: globalParams.volDrum > 0 ? 0 : 0.8 })} className={`p-1 rounded ${globalParams.volDrum === 0 ? 'bg-red-900 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                {globalParams.volDrum === 0 ? <VolumeX size={10}/> : <Volume1 size={10}/>}
                            </button>
                        </div>
                        {/* Bass Bus */}
                        <div className="flex items-center gap-2">
                            <div className="text-[10px] w-12 text-zinc-500 font-bold">BASS</div>
                            <input 
                                type="range" min="0" max="1" step="0.05" 
                                value={globalParams.volBass}
                                onChange={(e) => setParams({ volBass: parseFloat(e.target.value) })}
                                className="flex-1 accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <button onClick={() => setParams({ volBass: globalParams.volBass > 0 ? 0 : 0.8 })} className={`p-1 rounded ${globalParams.volBass === 0 ? 'bg-red-900 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                {globalParams.volBass === 0 ? <VolumeX size={10}/> : <Volume1 size={10}/>}
                            </button>
                        </div>
                        {/* Melody Bus */}
                        <div className="flex items-center gap-2">
                            <div className="text-[10px] w-12 text-zinc-500 font-bold">MELODY</div>
                            <input 
                                type="range" min="0" max="1" step="0.05" 
                                value={globalParams.volMelody}
                                onChange={(e) => setParams({ volMelody: parseFloat(e.target.value) })}
                                className="flex-1 accent-purple-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <button onClick={() => setParams({ volMelody: globalParams.volMelody > 0 ? 0 : 0.7 })} className={`p-1 rounded ${globalParams.volMelody === 0 ? 'bg-red-900 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                {globalParams.volMelody === 0 ? <VolumeX size={10}/> : <Volume1 size={10}/>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-b border-zinc-800 pb-4">
                     <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                        <span>GENERATOR MODE</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {['SEQ', 'DRONE', 'NOISE'].map((mode) => (
                            <button 
                                key={mode}
                                onClick={() => setParams({ playMode: mode as PlaybackMode })}
                                className={`
                                    px-2 py-1 text-[10px] font-bold border rounded
                                    ${globalParams.playMode === mode 
                                        ? 'bg-amber-600 border-amber-500 text-black' 
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'}
                                `}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mt-2">
                        <span>HARMONICS</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        {['PENT', 'DARK', 'ALIEN', 'CHRM'].map((scale) => (
                            <button 
                                key={scale}
                                onClick={() => setParams({ scaleType: scale as ScaleType })}
                                className={`
                                    px-2 py-1 text-[10px] font-bold border rounded
                                    ${globalParams.scaleType === scale 
                                        ? 'bg-blue-600 border-blue-500 text-white' 
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'}
                                `}
                            >
                                {scale}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 border-b border-zinc-800 pb-6">
                    <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                        <span className="flex items-center gap-1"><Move size={12}/> PERFORMANCE PAD</span>
                    </div>
                    <XYPad width={235} height={120} />
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-zinc-400">
                            <span>MASTER OUTPUT</span>
                            <span className="text-white">{Math.round(globalParams.rackVolume * 100)}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.05" 
                            value={globalParams.rackVolume}
                            onChange={(e) => setParams({ rackVolume: parseFloat(e.target.value) })}
                            className="w-full accent-white h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-zinc-400"><span>CLOCK BPM</span><span className="text-amber-400">{globalParams.tempo}</span></div>
                        <input type="range" min="60" max="240" step="1" value={globalParams.tempo} onChange={(e) => setParams({ tempo: parseInt(e.target.value) })} className="w-full accent-amber-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-zinc-400"><span>SHUFFLE (SWING)</span><span className="text-orange-400">{Math.round(globalParams.shuffle * 100)}%</span></div>
                        <input type="range" min="0" max="0.5" step="0.01" value={globalParams.shuffle} onChange={(e) => setParams({ shuffle: parseFloat(e.target.value) })} className="w-full accent-orange-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-zinc-400"><span>MASTER FILTER</span><div className="flex items-center gap-2"><span className="text-green-400">{Math.round(globalParams.filterCutoff * 100)}%</span><button onClick={() => setParams({ modFilter: !globalParams.modFilter })} className={`text-[9px] px-1 rounded border ${globalParams.modFilter ? 'bg-green-600 border-green-400 text-white animate-pulse' : 'bg-black border-zinc-600 text-zinc-500'}`} title="Toggle LFO">AUTO</button></div></div>
                        <input type="range" min="0" max="1" step="0.01" value={globalParams.filterCutoff} onChange={(e) => setParams({ filterCutoff: parseFloat(e.target.value) })} className="w-full accent-green-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-zinc-400"><span>RESONANCE</span><div className="flex items-center gap-2"><span className="text-purple-400">{Math.round(globalParams.resonance * 100)}%</span><button onClick={() => setParams({ modResonance: !globalParams.modResonance })} className={`text-[9px] px-1 rounded border ${globalParams.modResonance ? 'bg-purple-600 border-purple-400 text-white animate-pulse' : 'bg-black border-zinc-600 text-zinc-500'}`} title="Toggle LFO">AUTO</button></div></div>
                        <input type="range" min="0" max="0.9" step="0.01" value={globalParams.resonance} onChange={(e) => setParams({ resonance: parseFloat(e.target.value) })} className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-zinc-400"><span>DELAY FEEDBACK</span><span className="text-blue-400">{Math.round(globalParams.delayAmount * 100)}%</span></div>
                        <input type="range" min="0" max="1" step="0.01" value={globalParams.delayAmount} onChange={(e) => setParams({ delayAmount: parseFloat(e.target.value) })} className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-800">
                    <Oscilloscope width={220} height={60} className="w-full opacity-60" />
                    <div className="mt-4 flex gap-2">
                        <button 
                            onClick={handleRecordToggle}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold border rounded uppercase transition-all ${isRecording ? 'bg-red-900 border-red-500 text-white animate-pulse' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            {isRecording ? <><MicOff size={12}/> REC (STOP)</> : <><Mic size={12}/> TAPE REC</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    // Helper to fill rack with Blank Panels up to 48
    const MAX_RACK_SLOTS = 48;
    const ensureDeckSize = (deck: Module[]) => {
        const newDeck = [...deck];
        while (newDeck.length < MAX_RACK_SLOTS) {
            newDeck.push({ ...BLANK_MODULE, id: generateId() });
        }
        return newDeck;
    };

    const [state, setState] = useState<PlayerState>(() => {
        const loaded = loadGame();
        if (loaded) { 
            if (!loaded.upgrades) loaded.upgrades = {};
            // If loaded deck is small, pad it
            if (loaded.deck.length < MAX_RACK_SLOTS) {
                loaded.deck = ensureDeckSize(loaded.deck);
            }
            if (loaded.deck.length > 0 && loaded.tutorialStep === undefined) {
                loaded.tutorialStep = 5;
            }
            return loaded;
        }
        
        // Initial State with Padded Deck
        return { 
            credits: 50, 
            ap: 3, 
            maxAp: 3, 
            day: 1, 
            week: 1, 
            reputation: 0, 
            deck: ensureDeckSize([]), 
            rackCapacity: 10, 
            quests: [],
            upgrades: {} 
        };
    });

    const [view, setView] = useState<ViewState | 'VICTORY'>(() => {
        // Check if actually empty of functional modules
        const activeModules = state.deck.filter(m => m.type !== ModuleType.EMPTY);
        if (!state.characterId && activeModules.length === 0) return 'CHARACTER_SELECT';
        return 'HOME';
    });

    // ... (Logs, refs, settings state unchanged) ...
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [shopInventory, setShopInventory] = useState<Module[]>([]);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [modalContext, setModalContext] = useState<'shop_buy' | 'shop_sell' | 'view' | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showIntro, setShowIntro] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [activeQuest, setActiveQuest] = useState<Quest | null>(null);

    const [rackParams, setRackParams] = useState({ 
        tempo: 120, 
        filterCutoff: 0.6, 
        delayAmount: 0.4, 
        resonance: 0.5, 
        rackVolume: 0.5,
        playMode: 'SEQ' as PlaybackMode,
        scaleType: 'PENT' as ScaleType,
        shuffle: 0.0,
        modFilter: false,
        modResonance: false,
        volDrum: 0.8,
        volBass: 0.8,
        volMelody: 0.7
    });
    const [mutedModules, setMutedModulesState] = useState<Set<string>>(new Set());

    const isTutorial = state.tutorialStep !== undefined && state.tutorialStep < 5;

    useEffect(() => {
        const compLevel = state.upgrades['compressor'] || 0;
        const boost = 1.0 + (compLevel * 0.1);
        setMasterVolumeBoost(boost);
    }, [state.upgrades]);

    const updateRackParams = (newParams: Partial<typeof rackParams>) => {
        const merged = { ...rackParams, ...newParams };
        setRackParams(merged);
        setGlobalRackParams(merged);
    };

    const toggleMuteModule = (id: string) => {
        setMutedModulesState(prev => {
            const next = new Set<string>(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            setMutedModules(Array.from(next));
            syncLivingRack(state.deck); 
            return next;
        });
        playSoundEffect('click');
    };

    const handleMoveModule = (id: string, direction: 'left' | 'right') => {
        // Deprecated with new drag and drop
    };

    const handleReorderModule = (fromIndex: number, toIndex: number) => {
        setState(prev => {
            const newDeck = [...prev.deck];
            // Swap logic instead of splice
            // This ensures deck size remains constant (48)
            if (fromIndex >= 0 && fromIndex < newDeck.length && toIndex >= 0 && toIndex < newDeck.length) {
                const temp = newDeck[fromIndex];
                newDeck[fromIndex] = newDeck[toIndex];
                newDeck[toIndex] = temp;
            }
            return { ...prev, deck: newDeck };
        });
        playSoundEffect('click');
    };
    
    const handleAddBlank = () => {
         // With fixed slots, adding a blank just replaces a real module with a blank? 
         // Or fills an empty slot?
         // If rack is full of real modules, we can't add blank easily without removing something.
         // Actually, "Add Blank" is useful if you want to silence a step that has a module.
         // Or if we treat "Empty" as "Nothing" and "Blank Panel" as a cosmetic "Nothing".
         // Current logic: ModuleType.EMPTY is both.
         // Let's repurpose this: "Clear Slot"
         // No, let's keep it as "Buy Blank Panel" implies filling a space. 
         // If we are already full of Blanks, this does nothing.
         addLog("Rack is already fully equipped with mounting rails.", 'info');
    };

    const handleShuffleRack = () => {
        setState(prev => {
            const newDeck = [...prev.deck];
            // Fisher-Yates shuffle
            for (let i = newDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
            }
            return { ...prev, deck: newDeck };
        });
        playSoundEffect('click');
        addLog('Rack modules shuffled.', 'info');
    };

    const handleUpdateModule = (updatedModule: Module) => {
        const newDeck = state.deck.map(m => m.id === updatedModule.id ? updatedModule : m);
        setState(prev => ({ ...prev, deck: newDeck }));
        
        if (selectedModule && selectedModule.id === updatedModule.id) {
            setSelectedModule(updatedModule);
        }
    };

    const handleBuyUpgrade = (upgrade: StudioUpgrade) => {
        const currentLevel = state.upgrades[upgrade.id] || 0;
        const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, currentLevel));
        
        if (state.reputation >= cost && currentLevel < upgrade.maxLevel) {
            const nextLevel = currentLevel + 1;
            const updates: Partial<PlayerState> = {
                reputation: state.reputation - cost,
                upgrades: { ...state.upgrades, [upgrade.id]: nextLevel }
            };
            if (upgrade.id === 'rack_space') {
                updates.rackCapacity = state.rackCapacity + 2;
            }
            setState(prev => ({ ...prev, ...updates }));
            addLog(`Upgraded ${upgrade.name} to Level ${nextLevel}.`, 'success');
        }
    };

    const handleAppMouseMove = (e: React.MouseEvent) => {
        if (view !== 'DECK') {
            const x = e.clientX / window.innerWidth;
            const y = 1 - (e.clientY / window.innerHeight);
            updateGenerativeInput(x, y);
        }
    };

    useEffect(() => {
        const loaded = loadGame();
        if (loaded) { 
            if (!loaded.upgrades) loaded.upgrades = {};
            // Ensure padding on load
            if (loaded.deck.length < MAX_RACK_SLOTS) {
                loaded.deck = ensureDeckSize(loaded.deck);
            }
            setState(loaded); 
            addLog('Save game loaded.', 'success'); 
        } else { 
            addLog('New session initialized.', 'info');
            setShowIntro(true); 
        }
    }, []);

    const handleIntroClose = () => {
        setShowIntro(false);
        setState(prev => ({ ...prev, hasSeenIntro: true }));
        playSoundEffect('power');
    };

    const handleCharacterSelect = (char: Character) => {
        const starterPool = [...char.deck].sort(() => 0.5 - Math.random());
        // Init deck with blanks
        const initialDeck = ensureDeckSize([]);
        
        setState(prev => ({
            ...prev,
            characterId: char.id,
            pendingStarterDeck: starterPool,
            deck: initialDeck,
            tutorialStep: 0
        }));
        setView('HOME');
        playSoundEffect('power');
        addLog(`System Initialized: ${char.name} Protocol loaded.`, 'success');
    };

    const handleTutorialScavenge = () => {
        setState(current => {
            const currentStep = current.tutorialStep || 0;
            if (currentStep >= 4) return current;
            const pending = [...(current.pendingStarterDeck || [])];
            if (pending.length === 0) return current;
            const nextModule = pending.pop();
            if (!nextModule) return current;
            
            // Replace first EMPTY slot
            const newDeck = [...current.deck];
            const emptyIdx = newDeck.findIndex(m => m.type === ModuleType.EMPTY);
            if (emptyIdx !== -1) {
                newDeck[emptyIdx] = { ...nextModule, id: generateId() };
            } else {
                // Should not happen if size is 48 and starter deck is small
                newDeck.push({ ...nextModule, id: generateId() }); 
            }

            let nextStep = currentStep + 1;
            if (nextStep === 4) {
                while (pending.length > 0) {
                    const rem = pending.pop();
                    if (rem) {
                        const idx = newDeck.findIndex(m => m.type === ModuleType.EMPTY);
                        if (idx !== -1) newDeck[idx] = {...rem, id: generateId()};
                    }
                }
                // Optional: Shuffle active modules slightly? No, let them fill linearly first.
            }
            return { 
                ...current, 
                deck: newDeck, 
                pendingStarterDeck: pending,
                tutorialStep: nextStep 
            };
        });
    };

    useEffect(() => {
        if (state.day > 1 || state.credits !== 50 || state.tutorialStep === 5) { saveGame(state); }
        // Count only active modules for intensity
        const activeCount = state.deck.filter(m => m.type !== ModuleType.EMPTY).length;
        const intensity = Math.min(1, activeCount / 20);
        updateAmbienceIntensity(intensity);
        syncLivingRack(state.deck); 
    }, [state.deck, state.day, state.credits, state.tutorialStep]);

    useEffect(() => {
        if (state.quests.length === 0) { setState(prev => ({ ...prev, quests: generateDailyQuests(prev) })); }
        if (shopInventory.length === 0) { setShopInventory(generateShopInventory(MASTER_POOL)); }
    }, [state.day]);

    useEffect(() => {
        const initAudio = () => { playSoundEffect('click'); window.removeEventListener('click', initAudio); };
        window.addEventListener('click', initAudio);
    }, []);

    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        const entry: LogEntry = { id: Date.now(), message, type, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setLogs(prev => [...prev.slice(-19), entry]);
    };

    // ... (Job, Reset, Boss logic mostly same, just checking active counts) ...
    const handleResetGame = () => { clearSave(); window.location.reload(); };
    const startJob = () => { if (state.ap < 1) { addLog('Not enough AP.', 'warning'); playSoundEffect('error'); return; } playSoundEffect('click'); setState(prev => ({ ...prev, ap: prev.ap - 1 })); setView('JOB'); };
    const handleJobComplete = (success: boolean, reward: number, output: number) => { if (success) { setState(prev => ({ ...prev, credits: prev.credits + reward, reputation: prev.reputation + 1 })); addLog(`Job successful. Earned ${reward}cr.`, 'success'); } else { addLog(`Job failed. Signal too weak.`, 'error'); } setView('HOME'); };
    const visitShop = () => { playSoundEffect('click'); setView('SHOP'); };
    const enterCity = () => { playSoundEffect('click'); setView('CITY'); };
    const openStudio = () => { playSoundEffect('click'); setView('STUDIO'); };
    const openQuests = () => { playSoundEffect('click'); setView('QUESTS'); };
    
    const handleModuleSelect = (item: Module, context: 'shop_buy' | 'shop_sell' | 'view') => { 
        if (context === 'view' && item.type === ModuleType.EMPTY) return; // Don't inspect blanks
        playSoundEffect('click'); 
        setSelectedModule(item); 
        setModalContext(context); 
    };

    const handleBuy = (item: Module) => { 
        const activeCount = state.deck.filter(m => m.type !== ModuleType.EMPTY).length;
        if (state.credits >= item.cost) { 
            if (activeCount >= state.rackCapacity) {
                playSoundEffect('error');
                addLog(`Rack capacity reached (${state.rackCapacity}). Upgrade studio.`, 'error');
                return;
            }
            
            const emptyIdx = state.deck.findIndex(m => m.type === ModuleType.EMPTY);
            if (emptyIdx === -1) {
                playSoundEffect('error');
                addLog('Rack physically full (48/48).', 'error');
                return;
            }

            playSoundEffect('power'); 
            const newModule = { ...item, id: generateId() }; 
            const newDeck = [...state.deck];
            newDeck[emptyIdx] = newModule;

            setState(prev => ({ ...prev, credits: prev.credits - item.cost, deck: newDeck })); 
            setShopInventory(prev => prev.filter(i => i.id !== item.id)); 
            addLog(`Purchased ${item.name}.`, 'success'); 
        } else { 
            playSoundEffect('error'); 
            addLog(`Insufficient credits.`, 'error'); 
        } 
    };

    const handleSell = (item: Module) => { 
        const sellPrice = Math.floor(item.cost * 0.5); 
        playSoundEffect('click'); 
        // Replace with blank
        const newDeck = state.deck.map(m => m.id === item.id ? { ...BLANK_MODULE, id: generateId() } : m);
        setState(prev => ({ ...prev, credits: prev.credits + sellPrice, deck: newDeck })); 
        addLog(`Sold ${item.name} for ${sellPrice}cr.`, 'info'); 
    };

    const handleReroll = (cost: number): boolean => { if (state.credits >= cost) { setState(prev => ({ ...prev, credits: prev.credits - cost })); addLog(`Spent ${cost}cr to reroll.`, 'info'); return true; } else { addLog('Not enough credits.', 'warning'); return false; } };
    
    const handleScavenge = () => { 
        if (state.ap < 1) { addLog('Too tired.', 'warning'); return; } 
        const activeCount = state.deck.filter(m => m.type !== ModuleType.EMPTY).length;
        if (activeCount >= state.rackCapacity) { addLog('Rack full.', 'error'); return; }

        const emptyIdx = state.deck.findIndex(m => m.type === ModuleType.EMPTY);
        if (emptyIdx === -1) { addLog('Rack physically full.', 'error'); return; }

        const newItem = { ...SCRAP_POOL[Math.floor(Math.random() * SCRAP_POOL.length)], id: generateId() }; 
        const newDeck = [...state.deck];
        newDeck[emptyIdx] = newItem;

        setState(prev => ({ ...prev, ap: prev.ap - 1, deck: newDeck })); 
        addLog(`Scavenged a ${newItem.name}.`, 'success'); 
    };

    const handleGamble = (amount: number): boolean => { const win = Math.random() > 0.5; if (win) { setState(prev => ({ ...prev, credits: prev.credits + amount })); addLog(`Won ${amount}cr!`, 'success'); } else { setState(prev => ({ ...prev, credits: prev.credits - amount })); addLog(`Lost ${amount}cr.`, 'error'); } return win; };
    
    const handleRepair = (moduleId: string, cost: number) => { 
        const itemIdx = state.deck.findIndex(m => m.id === moduleId); 
        if (itemIdx === -1) return; 
        const repairPool = MASTER_POOL.filter(m => m.rarity === Rarity.COMMON); 
        const replacement = { ...repairPool[Math.floor(Math.random() * repairPool.length)], id: generateId() }; 
        const newDeck = [...state.deck]; 
        newDeck[itemIdx] = replacement; 
        setState(prev => ({ ...prev, credits: prev.credits - cost, deck: newDeck })); 
        playSoundEffect('power'); 
        addLog(`Module repaired.`, 'success'); 
    };

    const handlePurify = (moduleId: string, cost: number) => { 
        // Replace with blank upon purify? Or destroy?
        // Usually purify removes the curse. Let's replace with blank.
        const newDeck = state.deck.map(m => m.id === moduleId ? { ...BLANK_MODULE, id: generateId() } : m);
        setState(prev => ({ ...prev, credits: prev.credits - cost, deck: newDeck })); 
        playSoundEffect('power'); 
        addLog('Cursed module purified.', 'success'); 
    };

    const handleQuestComplete = (quest: Quest, selectedModuleId?: string) => { 
        if (state.ap < quest.costAp || state.credits < quest.costCredits) { addLog('Insufficient resources.', 'error'); playSoundEffect('error'); return; } 
        playSoundEffect('power'); 
        if (quest.type === 'EARN') { setActiveQuest(quest); setView('PERFORMANCE'); setState(prev => ({ ...prev, ap: prev.ap - quest.costAp })); return; } 
        
        let newDeck = [...state.deck]; 
        let creditChange = -quest.costCredits; 
        if (selectedModuleId) { 
            const modIndex = newDeck.findIndex(m => m.id === selectedModuleId); 
            if (modIndex === -1) return; 
            if (quest.type === 'REPAIR') { 
                const repairPool = MASTER_POOL.filter(m => m.rarity === Rarity.COMMON); 
                const replacement = { ...repairPool[Math.floor(Math.random() * repairPool.length)], id: generateId() }; 
                newDeck[modIndex] = replacement; 
                addLog(`Module repaired.`, 'success'); 
            } else if (quest.type === 'PURIFY') { 
                newDeck[modIndex] = { ...BLANK_MODULE, id: generateId() };
                addLog(`Curse lifted.`, 'success'); 
            } else if (quest.type === 'SALVAGE') { 
                newDeck[modIndex] = { ...BLANK_MODULE, id: generateId() };
                creditChange += 10; 
                addLog(`Salvaged.`, 'success'); 
            } 
        } 
        setState(prev => ({ ...prev, ap: prev.ap - quest.costAp, credits: prev.credits + creditChange, deck: newDeck, quests: prev.quests.filter(q => q.id !== quest.id) })); 
    };

    const handlePerformanceComplete = (score: number) => { const grade = score > 0.9 ? 'S' : score > 0.7 ? 'A' : score > 0.5 ? 'B' : score > 0.3 ? 'C' : 'F'; let earned = Math.floor(Math.random() * 15) + 25; const multipliers: Record<string, number> = { 'S': 2.0, 'A': 1.5, 'B': 1.0, 'C': 0.5, 'F': 0.1 }; earned = Math.floor(earned * multipliers[grade]); const repGain = grade === 'S' ? 5 : grade === 'A' ? 3 : grade === 'B' ? 1 : 0; setState(prev => ({ ...prev, credits: prev.credits + earned, reputation: prev.reputation + repGain, quests: prev.quests.filter(q => q.id !== activeQuest?.id) })); addLog(`Gig complete. Grade: ${grade}. Earned ${earned}cr.`, grade === 'F' ? 'error' : 'success'); if (repGain > 0) addLog(`+${repGain} Reputation`, 'success'); setActiveQuest(null); setView('HOME'); };
    const endDay = () => { playSoundEffect('click'); addLog(`Day ${state.day} ended.`, 'info'); if (state.day % 7 === 0) { addLog('WARNING: Boss incoming.', 'warning'); setTimeout(() => { setView('BOSS'); }, 2000); } else { const nextDayState = { ...state, day: state.day + 1, ap: state.maxAp }; const newQuests = generateDailyQuests(nextDayState); setState(prev => ({ ...prev, day: prev.day + 1, ap: prev.maxAp, quests: newQuests })); addLog('Energy restored.', 'info'); } };
    const handleBossEnd = (win: boolean) => { if (win) { addLog('Boss defeated!', 'success'); const isFinalBoss = currentBoss.id === 'boss_final'; if (isFinalBoss) { setView('VICTORY'); return; } const rewardCredits = 200 * state.week; 
    // Add bloat. Need to find empty slots.
    const newDeck = [...state.deck];
    const bloatPool = [{ ...TRASH_ITEMS[0], id: generateId() }, { ...TRASH_ITEMS[1], id: generateId() }, { ...CURSE_ITEMS[0], id: generateId() }];
    
    bloatPool.forEach(badItem => {
        const idx = newDeck.findIndex(m => m.type === ModuleType.EMPTY);
        if (idx !== -1) newDeck[idx] = badItem;
    });

    setState(prev => ({ ...prev, week: prev.week + 1, day: prev.day + 1, ap: prev.maxAp, credits: prev.credits + rewardCredits, deck: newDeck, quests: generateDailyQuests(prev) })); setShopInventory(generateShopInventory(MASTER_POOL)); addLog('Market stock refreshed.', 'info'); addLog(`Weekly maintenance complete.`, 'warning'); addLog(`Received grant: ${rewardCredits}cr`, 'success'); } else { addLog('Defeated.', 'error'); setState(prev => ({ ...prev, credits: Math.floor(prev.credits / 2), ap: prev.maxAp })); } setView('HOME'); };
    const currentBoss = BOSSES[(state.week - 1) % BOSSES.length];

    return (
        <div className="flex h-screen w-screen bg-zinc-950 text-zinc-200 overflow-hidden" onMouseMove={handleAppMouseMove}>
            {showIntro && <StoryModal onClose={handleIntroClose} />}
            {selectedModule && (
                <ModuleDetailModal 
                    module={selectedModule} 
                    onClose={() => setSelectedModule(null)} 
                    actionLabel={modalContext === 'shop_buy' ? `Buy (${selectedModule.cost}cr)` : modalContext === 'shop_sell' ? `Sell (${Math.floor(selectedModule.cost * 0.5)}cr)` : undefined} 
                    onAction={modalContext === 'shop_buy' ? () => handleBuy(selectedModule) : modalContext === 'shop_sell' ? () => handleSell(selectedModule) : undefined} 
                    onUpdateModule={modalContext === 'view' ? handleUpdateModule : undefined}
                    isActionDisabled={modalContext === 'shop_buy' && state.credits < selectedModule.cost} 
                />
            )}
            {showSettings && (<SettingsModal onClose={() => setShowSettings(false)} onReset={handleResetGame} />)}
            <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col justify-between p-4 z-10 relative">
                <div className="space-y-6"><div className="space-y-1"><h1 className="text-xl font-bold text-amber-500 font-vt323 tracking-widest text-3xl">EURORACK INC</h1><p className="text-xs text-zinc-500">FW: v1.0.0-STABLE</p></div><div className="space-y-2 border-t border-zinc-700 pt-4"><div className="flex justify-between items-center"><span className="text-zinc-400">CREDITS</span><span className="text-green-400 font-bold">{state.credits}</span></div><div className="flex justify-between items-center"><span className="text-zinc-400">AP</span><div className="flex space-x-1">{[...Array(state.maxAp)].map((_, i) => (<div key={i} className={`w-3 h-3 rounded-full ${i < state.ap ? 'bg-amber-400' : 'bg-zinc-700'}`} />))}</div></div><div className="flex justify-between items-center"><span className="text-zinc-400">DAY</span><span>{state.day}</span></div><div className="flex justify-between items-center"><span className="text-zinc-400">WEEK</span><span>{state.week}</span></div><div className="flex justify-between items-center"><span className="text-zinc-400">RACK</span><span className={state.deck.filter(m => m.type !== ModuleType.EMPTY).length > state.rackCapacity ? 'text-red-500' : ''}>{state.deck.filter(m => m.type !== ModuleType.EMPTY).length}/{state.rackCapacity}</span></div></div></div>
                <div className="mt-auto pt-4 border-t border-zinc-800 relative">
                    <button 
                        onClick={() => { 
                            if (state.tutorialStep === 4) setState(prev => ({...prev, tutorialStep: 5}));
                            setView('DECK'); 
                            playSoundEffect('click'); 
                        }} 
                        className={`w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 flex items-center justify-center gap-2 relative ${state.tutorialStep === 4 ? 'animate-pulse bg-zinc-700 text-white' : ''}`}
                    >
                        <Box size={14} /> INSPECT RACK
                    </button>
                    {state.tutorialStep === 4 && (
                        <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex items-center animate-bounce z-50">
                            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded mr-2 whitespace-nowrap">OPEN THIS</span>
                            <ArrowLeft className="text-amber-500" size={32} />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950 z-0 flex flex-col">
                <div className="h-14 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-900/80 backdrop-blur-sm z-20">
                    <div className="flex items-center gap-2 text-sm text-zinc-400"><Terminal size={16} /><span className="uppercase tracking-widest">{view.replace('_', ' ')}</span></div>
                    <div className="flex items-center gap-2">{view !== 'HOME' && view !== 'BOSS' && view !== 'VICTORY' && view !== 'CHARACTER_SELECT' && (<Button variant="ghost" onClick={() => { setView('HOME'); playSoundEffect('click'); }} className="text-xs">Return to Studio</Button>)}<button onClick={() => setShowSettings(true)} className="p-2 text-zinc-500 hover:text-zinc-200"><Settings size={20} /></button></div>
                </div>
                <div className="flex-1 overflow-auto relative p-6">
                    <div className="absolute inset-0 z-[-1] opacity-5" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    
                    {view === 'CHARACTER_SELECT' && <CharacterSelectView onSelect={handleCharacterSelect} />}

                    {view === 'HOME' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
                            {isTutorial ? (
                                <div className="flex flex-col items-center justify-center gap-8 max-w-2xl w-full">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-3xl font-bold text-amber-500 uppercase font-vt323 tracking-widest">SYSTEM OFFLINE</h2>
                                        <p className="text-zinc-400 font-mono">Scavenge parts to build your initial rack.</p>
                                    </div>
                                    
                                    {state.tutorialStep === 4 ? (
                                        <div className="text-2xl font-bold text-green-500 animate-pulse text-center p-8 border-2 border-green-500/50 rounded-lg bg-green-900/20">
                                            RACK READY.<br/>INSPECT MODULES IN SIDEBAR.
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={handleTutorialScavenge}
                                            className="group relative w-64 h-64 bg-zinc-800/50 border-4 border-dashed border-zinc-600 hover:border-amber-500 hover:bg-zinc-800 transition-all rounded-full flex flex-col items-center justify-center gap-4 animate-in zoom-in duration-300"
                                        >
                                            <MountainSnow size={64} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-zinc-200 uppercase tracking-widest">SCAVENGE</div>
                                                <div className="text-sm text-amber-500 mt-2 font-mono">PART {state.tutorialStep! + 1}/4</div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                                        <button onClick={startJob} disabled={state.ap < 1} className="col-span-1 group relative h-48 bg-zinc-800/50 border-2 border-zinc-700 hover:border-amber-500 hover:bg-zinc-800 transition-all rounded-lg flex flex-col items-center justify-center gap-4 disabled:opacity-50 disabled:hover:border-zinc-700"><Briefcase size={40} className="text-zinc-400 group-hover:text-amber-400 transition-colors" /><div className="text-center"><div className="text-xl font-bold text-zinc-200">TAKE JOB</div><div className="text-sm text-zinc-500 mt-1">-1 AP</div></div></button>
                                        <button onClick={visitShop} className="col-span-1 group relative h-48 bg-zinc-800/50 border-2 border-zinc-700 hover:border-blue-500 hover:bg-zinc-800 transition-all rounded-lg flex flex-col items-center justify-center gap-4"><ShoppingBag size={40} className="text-zinc-400 group-hover:text-blue-400 transition-colors" /><div className="text-center"><div className="text-xl font-bold text-zinc-200">VISIT SHOP</div><div className="text-sm text-zinc-500 mt-1">Acquire Modules</div></div></button>
                                        
                                        <button onClick={openQuests} className="group relative h-32 bg-zinc-800/30 border-2 border-zinc-800 hover:border-emerald-500 transition-all rounded-lg flex flex-col items-center justify-center gap-2">
                                            <ClipboardList size={24} className="text-zinc-600 group-hover:text-emerald-400" />
                                            <div className="text-lg font-bold text-zinc-500 group-hover:text-emerald-200">SIDE QUESTS</div>
                                            <div className="text-xs text-zinc-600 font-mono">{state.quests.length} Active</div>
                                        </button>

                                        <button onClick={enterCity} className="group relative h-32 bg-zinc-800/30 border-2 border-zinc-800 hover:border-indigo-500 transition-all rounded-lg flex flex-col items-center justify-center gap-2"><Map size={24} className="text-zinc-600 group-hover:text-indigo-400" /><div className="text-lg font-bold text-zinc-500 group-hover:text-indigo-200">EXPLORE CITY</div></button>
                                        
                                        <button onClick={openStudio} className="col-span-2 group relative h-24 bg-zinc-800/30 border-2 border-zinc-800 hover:border-cyan-500 transition-all rounded-lg flex flex-row items-center justify-center gap-4">
                                            <Disc size={24} className="text-zinc-600 group-hover:text-cyan-400" />
                                            <div className="text-lg font-bold text-zinc-500 group-hover:text-cyan-200">MANAGE STUDIO</div>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 w-full max-w-2xl">
                                         <button onClick={endDay} className="flex-1 group relative h-20 bg-zinc-800/30 border-2 border-zinc-800 hover:border-red-900 transition-all rounded-lg flex flex-col items-center justify-center gap-2"><div className="flex items-center gap-2"><RotateCcw size={24} className="text-zinc-600 group-hover:text-red-400" /><span className="text-lg font-bold text-zinc-500 group-hover:text-red-200">SLEEP</span></div></button>
                                    </div>
                                    <div className="text-zinc-600 font-mono text-sm text-center">{state.day % 7 === 0 ? (<span className="text-red-500 animate-pulse flex items-center gap-2 justify-center"><AlertTriangle size={16}/> BOSS FIGHT IMMINENT</span>) : (<span>{7 - (state.day % 7)} days until weekly boss.</span>)}</div>
                                </>
                            )}
                        </div>
                    )}
                    {view === 'JOB' && (<JobView deck={state.deck.filter(m => m.type !== ModuleType.EMPTY)} credits={state.credits} week={state.week} cableLevel={state.upgrades['cables'] || 0} onComplete={handleJobComplete} onBack={() => setView('HOME')} onReroll={handleReroll} />)}
                    {view === 'SHOP' && (<ShopView credits={state.credits} inventory={shopInventory} deck={state.deck} onBuy={handleBuy} onSell={handleSell} onBack={() => setView('HOME')} onSelect={(item, mode) => handleModuleSelect(item, mode === 'buy' ? 'shop_buy' : 'shop_sell')} />)}
                    {view === 'CITY' && (<CityView credits={state.credits} ap={state.ap} deck={state.deck} onBack={() => setView('HOME')} onScavenge={handleScavenge} onGamble={handleGamble} onRepair={handleRepair} onPurify={handlePurify} />)}
                    {view === 'QUESTS' && (<QuestView quests={state.quests} credits={state.credits} ap={state.ap} deck={state.deck} onComplete={handleQuestComplete} onBack={() => setView('HOME')} />)}
                    {view === 'BOSS' && (<BossView boss={currentBoss} deck={state.deck.filter(m => m.type !== ModuleType.EMPTY)} credits={state.credits} onBattleEnd={handleBossEnd} onReroll={handleReroll} />)}
                    {view === 'VICTORY' && (<VictoryView onContinue={() => { setState(prev => ({ ...prev, week: prev.week + 1, day: prev.day + 1 })); setView('HOME'); }} />)}
                    {view === 'STUDIO' && (<StudioView reputation={state.reputation} upgrades={state.upgrades} onBuyUpgrade={handleBuyUpgrade} onBack={() => setView('HOME')} />)}
                    {view === 'PERFORMANCE' && (<PerformanceView onComplete={handlePerformanceComplete} />)}
                    {view === 'DECK' && (
                        <RackView 
                            deck={state.deck} 
                            capacity={state.rackCapacity} 
                            onSelect={(mod) => handleModuleSelect(mod, 'view')} 
                            onBack={() => setView('HOME')} 
                            mutedModules={mutedModules}
                            toggleMuteModule={toggleMuteModule}
                            onMoveModule={handleMoveModule}
                            onShuffleModules={handleShuffleRack}
                            globalParams={rackParams}
                            setParams={updateRackParams}
                            onReorderModule={handleReorderModule}
                            onAddBlank={handleAddBlank}
                        />
                    )}
                </div>
            </div>
            <div className="w-80 border-l border-zinc-800 bg-black/60 backdrop-blur-sm flex flex-col p-4 z-10 font-mono text-xs">
                <div className="uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2"><Activity size={16} /> System Log</div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {logs.map((log) => (
                        <div key={log.id} className="flex flex-col animate-in slide-in-from-right-2 duration-300">
                            <span className="text-zinc-600 mb-0.5 text-[10px]">{log.timestamp}</span>
                            <span className={`${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-zinc-300'}`}>{log.message}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
};

export default App;
