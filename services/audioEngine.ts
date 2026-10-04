
import { Module, ModuleType, Cable, Rarity } from '../types';
import { ROW_SIZE } from '../constants';
import type { StudioPatchSession } from './patchAudioGraph.ts';

let audioAuthority: 'STUDIO' | 'PATCH' = 'STUDIO';
let patchSessionOwned = false;

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let soundEffectBus: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
let limiter: WaveShaperNode | null = null; 
let analyser: AnalyserNode | null = null;
let isMuted = false;

// --- Recorder State ---
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingDest: MediaStreamAudioDestinationNode | null = null;

// --- Living Rack State ---
let drumBus: GainNode | null = null;
let bassBus: GainNode | null = null;
let melodyBus: GainNode | null = null;

let sidechainNodeBass: GainNode | null = null; 
let sidechainNodeMelody: GainNode | null = null; 

let rackFilter: BiquadFilterNode | null = null; 
let masterSaturator: WaveShaperNode | null = null;
let saturatorDrive: GainNode | null = null;
let saturatorMakeup: GainNode | null = null;

let delaySend: GainNode | null = null;
let delayNode: DelayNode | null = null;
let delayFeedback: GainNode | null = null;
let delayFilter: BiquadFilterNode | null = null;

// Noise / Texture
let noiseNode: AudioBufferSourceNode | null = null;
let noiseGain: GainNode | null = null;
let ambienceIntensity = 0;

// Scheduler State
let nextNoteTime = 0.0;
let currentStepIndex = 0; 
let schedulerTimer: number | null = null;
let lookahead = 25.0; // ms
let scheduleAheadTime = 0.1; // s

// Visual Sync Subscription
type StepCallback = (stepIndices: number[], currentStep: number) => void;
let stepCallbacks: StepCallback[] = [];

export const subscribeToStep = (cb: StepCallback) => {
    stepCallbacks.push(cb);
    return () => {
        stepCallbacks = stepCallbacks.filter(c => c !== cb);
    };
};

export type PlaybackMode = 'SEQ' | 'DRONE' | 'NOISE';
export type ScaleType = 'PENT' | 'DARK' | 'ALIEN' | 'CHRM';

let globalParams = {
    tempo: 120, 
    filterCutoff: 0.6, 
    delayAmount: 0.4, 
    resonance: 0.5,
    rackVolume: 0.5,
    noteLength: 0.5, 
    playMode: 'SEQ' as PlaybackMode,
    scaleType: 'PENT' as ScaleType,
    shuffle: 0.0,
    modFilter: false,
    modResonance: false,
    masterBoost: 1.0,
    volDrum: 0.8,
    volBass: 0.8,
    volMelody: 0.7
};

let performanceOverrides = {
    timbre: null as number | null, 
    space: null as number | null, 
    force: null as number | null   
};

let xyParams = {
    x: 0.5, 
    y: 0,   
};

let generativeInput = { x: 0.5, y: 0.5 };

export const updatePerformancePad = (x: number, y: number) => {
    xyParams = { x, y };
};

export const updateGenerativeInput = (x: number, y: number) => {
    generativeInput = { x, y };
};

export const playSoundEffect = (type: 'click' | 'power' | 'error' | 'success') => {
    if (audioAuthority === 'PATCH') return;
    const { audioCtx: ctx, masterGain } = getContext();
    if (!ctx || !masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(soundEffectBus!);
    
    const now = ctx.currentTime;
    
    if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'power') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1); 
        osc.frequency.setValueAtTime(659.25, now + 0.2); 
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.3);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
    }
};

let activeRows: Module[][] = [[], [], []]; 
let activeDuckers: Module[] = [];
let mutedModuleIds = new Set<string>();
let modulationFrameId: number | null = null;
let activeTrashCount = 0;

const SCALE_ROOT = 55;
const SCALES: Record<ScaleType, number[]> = {
    PENT: [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24], 
    DARK: [0, 2, 3, 7, 8, 12, 14, 15, 19, 20, 24], 
    ALIEN: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20], 
    CHRM: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] 
};

export const toggleMute = () => {
    isMuted = !isMuted;
    if (masterGain) {
        masterGain.gain.setValueAtTime(isMuted ? 0 : (0.5 * globalParams.masterBoost), audioCtx?.currentTime || 0);
    }
    return isMuted;
};

export const setPerformanceOverrides = (timbre: number | null, space: number | null, force: number | null) => {
    performanceOverrides = { timbre, space, force };
};

const getContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        recordingDest = audioCtx.createMediaStreamDestination();

        compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-20, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0.005, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
        
        masterGain = audioCtx.createGain();
        masterGain.gain.value = isMuted ? 0 : 0.5;
        soundEffectBus = audioCtx.createGain();
        soundEffectBus.connect(masterGain);

        limiter = audioCtx.createWaveShaper();
        limiter.curve = makeHardClipCurve(audioCtx.sampleRate);
        limiter.oversample = '4x';

        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048; 
        analyser.smoothingTimeConstant = 0.85;
        
        compressor.connect(masterGain);
        masterGain.connect(limiter); 
        limiter.connect(analyser);
        analyser.connect(audioCtx.destination);
        limiter.connect(recordingDest);

        if (audioAuthority === 'STUDIO') {
            initLivingRack();
            startModulationLoop();
        }
    }
    if (audioCtx.state === 'suspended' && audioAuthority === 'STUDIO') {
        void audioCtx.resume().catch(error => console.warn('Audio is waiting for a user gesture.', error));
    }
    return { audioCtx, masterGain, compressor, analyser };
};

/** The visible graph takes source/routing authority; Studio retains the output chain. */
export const openStudioPatchSession = (): StudioPatchSession => {
    if (patchSessionOwned) throw new Error('A visible patch already owns the Studio audio session.');
    audioAuthority = 'PATCH';
    if (schedulerTimer !== null) { clearTimeout(schedulerTimer); schedulerTimer = null; }
    if (modulationFrameId !== null) { cancelAnimationFrame(modulationFrameId); modulationFrameId = null; }
    // Existing Studio voices and noise must not masquerade as a cable's result.
    for (const bus of [drumBus, bassBus, melodyBus, noiseGain]) if (bus) {
        bus.gain.cancelScheduledValues(audioCtx!.currentTime);
        bus.gain.setValueAtTime(0, audioCtx!.currentTime);
    }
    // Muting inputs alone is insufficient: nonlinear legacy nodes can emit DC at zero.
    drumBus?.disconnect();
    rackFilter?.disconnect();
    soundEffectBus?.disconnect();
    const { audioCtx: ctx, compressor: destination, analyser: scope } = getContext();
    soundEffectBus!.disconnect();
    // The patch's listen control owns volume; a prior Studio mute/boost is not hidden state.
    masterGain!.gain.cancelScheduledValues(ctx.currentTime);
    masterGain!.gain.setValueAtTime(0.5, ctx.currentTime);
    patchSessionOwned = true;
    return {
        context: ctx, destination: destination!, analyser: scope!,
        release: async () => {
            if (audioCtx !== ctx) return;
            // Clear ownership synchronously so restart cannot retain a closing context.
            if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
            mediaRecorder = null; recordedChunks = []; recordingDest = null;
            audioCtx = null; masterGain = null; soundEffectBus = null; compressor = null; limiter = null; analyser = null;
            drumBus = null; bassBus = null; melodyBus = null;
            sidechainNodeBass = null; sidechainNodeMelody = null;
            rackFilter = null; masterSaturator = null; saturatorDrive = null; saturatorMakeup = null;
            delaySend = null; delayNode = null; delayFeedback = null; delayFilter = null;
            noiseNode = null; noiseGain = null;
            nextNoteTime = 0; currentStepIndex = 0;
            patchSessionOwned = false; audioAuthority = 'STUDIO';
            if (ctx.state !== 'closed') await ctx.close();
        }
    };
};

export const getMasterAnalyser = (): AnalyserNode | null => {
    const { analyser } = getContext();
    return analyser;
};

export const startTape = (): boolean => {
    const { audioCtx } = getContext();
    if (!audioCtx || !recordingDest) return false;
    recordedChunks = [];
    try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        mediaRecorder = new MediaRecorder(recordingDest.stream, { mimeType });
        mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) recordedChunks.push(event.data); };
        mediaRecorder.start();
        return true;
    } catch (e) { return false; }
};

export const stopTape = () => {
    return new Promise<void>((resolve) => {
        if (!mediaRecorder) { resolve(); return; }
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a); a.style.display = 'none'; a.href = url;
            const date = new Date().toISOString().slice(0,19).replace(/:/g, "-");
            a.download = `eurorack-inc-session-${date}.webm`;
            a.click(); window.URL.revokeObjectURL(url); resolve();
        };
        mediaRecorder.stop(); mediaRecorder = null;
    });
};

export const setMasterVolumeBoost = (boost: number) => {
    globalParams.masterBoost = boost;
    if (masterGain && !isMuted) {
        masterGain.gain.setTargetAtTime(0.5 * boost, audioCtx?.currentTime || 0, 0.1);
    }
};

const initLivingRack = () => {
    if (!audioCtx || drumBus) return;
    const ctx = audioCtx;

    drumBus = ctx.createGain();
    drumBus.gain.value = globalParams.volDrum;

    bassBus = ctx.createGain();
    bassBus.gain.value = globalParams.volBass;

    melodyBus = ctx.createGain();
    melodyBus.gain.value = globalParams.volMelody;

    sidechainNodeBass = ctx.createGain();
    sidechainNodeMelody = ctx.createGain();
    
    bassBus.connect(sidechainNodeBass);
    melodyBus.connect(sidechainNodeMelody);

    saturatorDrive = ctx.createGain();
    saturatorDrive.gain.value = 1.0; 

    masterSaturator = ctx.createWaveShaper();
    masterSaturator.curve = makeAnalogSaturationCurve(20); 
    masterSaturator.oversample = '4x';

    saturatorMakeup = ctx.createGain();
    saturatorMakeup.gain.value = 1.0;

    rackFilter = ctx.createBiquadFilter();
    rackFilter.type = 'lowpass';
    rackFilter.frequency.value = 1200; 
    rackFilter.Q.value = 0.5;

    delayNode = ctx.createDelay(5.0);
    delayNode.delayTime.value = 45 / globalParams.tempo; 
    delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.3; 
    delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'highpass'; 
    delayFilter.frequency.value = 600;
    delaySend = ctx.createGain();
    delaySend.gain.value = 0; 

    drumBus.connect(compressor!);

    sidechainNodeBass.connect(saturatorDrive);
    sidechainNodeMelody.connect(saturatorDrive);

    saturatorDrive.connect(masterSaturator);
    masterSaturator.connect(saturatorMakeup);
    
    saturatorMakeup.connect(rackFilter);
    rackFilter.connect(compressor!);

    delaySend.connect(delayNode);
    delayNode.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    delayNode.connect(saturatorDrive); 

    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 2.5;
    }
    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0; 

    noiseNode.connect(noiseGain);
    noiseGain.connect(melodyBus); 
    noiseNode.start();

    scheduler();
};

let lastOut = 0;

export const setGlobalRackParams = (params: Partial<typeof globalParams>) => {
    globalParams = { ...globalParams, ...params };
    
    if (audioCtx) {
        const now = audioCtx.currentTime;
        if (params.volDrum !== undefined && drumBus) drumBus.gain.setTargetAtTime(globalParams.volDrum * globalParams.rackVolume, now, 0.1);
        if (params.volBass !== undefined && bassBus) bassBus.gain.setTargetAtTime(globalParams.volBass * globalParams.rackVolume, now, 0.1);
        if (params.volMelody !== undefined && melodyBus) melodyBus.gain.setTargetAtTime(globalParams.volMelody * globalParams.rackVolume, now, 0.1);
        
        if (params.rackVolume !== undefined) {
             if (drumBus) drumBus.gain.setTargetAtTime(globalParams.volDrum * globalParams.rackVolume, now, 0.1);
             if (bassBus) bassBus.gain.setTargetAtTime(globalParams.volBass * globalParams.rackVolume, now, 0.1);
             if (melodyBus) melodyBus.gain.setTargetAtTime(globalParams.volMelody * globalParams.rackVolume, now, 0.1);
        }
    }
};

export const setMutedModules = (ids: string[]) => {
    mutedModuleIds = new Set(ids);
};

export const syncLivingRack = (deck: Module[]) => {
    if (audioAuthority === 'PATCH') return;
    const { audioCtx: ctx } = getContext();
    if (!ctx) return;
    
    // Create 3 sparse rows of length 16 (ROW_SIZE)
    // We map the deck linearly to these rows.
    // Row 1: Deck indices 0-15
    // Row 2: Deck indices 16-31
    // Row 3: Deck indices 32-47
    
    const r1: Module[] = new Array(ROW_SIZE).fill(null).map((_, i) => deck[i] || null);
    const r2: Module[] = new Array(ROW_SIZE).fill(null).map((_, i) => deck[i + ROW_SIZE] || null);
    const r3: Module[] = new Array(ROW_SIZE).fill(null).map((_, i) => deck[i + ROW_SIZE * 2] || null);
    
    activeRows = [r1, r2, r3];
    
    activeDuckers = deck.filter(m => m.type === ModuleType.DUCKER);
    activeTrashCount = deck.filter(m => m.type === ModuleType.TRASH || m.type === ModuleType.CURSE).length;
    
    setGlobalRackParams({});
};

export const updateAmbienceIntensity = (intensity: number) => {
    ambienceIntensity = intensity;
    setGlobalRackParams({});
};

const startModulationLoop = () => {
    if (modulationFrameId) cancelAnimationFrame(modulationFrameId);

    const loop = () => {
        if (!audioCtx || !rackFilter || !saturatorDrive || !saturatorMakeup || !delayFeedback) {
            modulationFrameId = requestAnimationFrame(loop);
            return;
        }

        const now = audioCtx.currentTime;
        
        let effectiveCutoff = globalParams.filterCutoff;
        if (performanceOverrides.timbre !== null) effectiveCutoff = performanceOverrides.timbre;

        let baseFreq = 50 + (effectiveCutoff * 8000);
        if (globalParams.playMode === 'NOISE') baseFreq = Math.max(baseFreq, 2000);
        
        if (globalParams.modFilter && performanceOverrides.timbre === null) {
            const lfoVal = Math.sin(now * 1.5); 
            baseFreq = baseFreq + (lfoVal * 2000); 
        }

        if (performanceOverrides.timbre === null) {
            const xDrift = (xyParams.x - 0.5) * 2; 
            const genDrift = (generativeInput.x - 0.5) * 0.5;
            baseFreq = baseFreq + (xDrift * (baseFreq * 0.2)) + (genDrift * 100); 
        }

        baseFreq = Math.max(50, Math.min(12000, baseFreq));
        rackFilter.frequency.setTargetAtTime(baseFreq, now, 0.05);

        let effectiveRes = globalParams.resonance;
        if (performanceOverrides.timbre !== null) effectiveRes = effectiveRes * (0.5 + performanceOverrides.timbre); 

        let baseQ = 0.5 + (effectiveRes * 10);
        if (globalParams.playMode === 'NOISE') baseQ += 5;

        if (globalParams.modResonance && performanceOverrides.timbre === null) {
            const lfoVal = Math.sin(now * 2.1 + 1); 
            baseQ = baseQ + (lfoVal * 4);
            baseQ = Math.max(0.1, Math.min(20, baseQ));
        }

        rackFilter.Q.setTargetAtTime(baseQ, now, 0.05);

        let effectiveDrive = xyParams.y; 
        if (performanceOverrides.force !== null) effectiveDrive = performanceOverrides.force;

        const driveAmt = 1.0 + (effectiveDrive * 0.8); 
        const makeupAmt = 1.0 - (effectiveDrive * 0.3); 

        saturatorDrive.gain.setTargetAtTime(driveAmt, now, 0.05);
        saturatorMakeup.gain.setTargetAtTime(makeupAmt, now, 0.05);

        let effectiveDelay = globalParams.delayAmount;
        if (performanceOverrides.space !== null) effectiveDelay = performanceOverrides.space;
        
        let fb = effectiveDelay * 0.9;
        if (globalParams.playMode === 'DRONE') fb = Math.max(fb, 0.6);
        delayFeedback.gain.setTargetAtTime(fb, now, 0.1);

        if (noiseGain) {
            let targetNoise = 0;
            if (globalParams.playMode === 'NOISE') {
                targetNoise = 0.3; 
            } else {
                const trashLevel = Math.min(0.1, (activeTrashCount * 0.01) + (ambienceIntensity * 0.02) + 0.002);
                targetNoise = trashLevel;
            }
            if (performanceOverrides.force !== null) {
                targetNoise += performanceOverrides.force * 0.05;
            }
            noiseGain.gain.setTargetAtTime(targetNoise, now, 0.5);
        }

        modulationFrameId = requestAnimationFrame(loop);
    };

    loop();
};

const scheduler = () => {
    if (!audioCtx) return;
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        scheduleStep(nextNoteTime);
        nextStep();
    }
    schedulerTimer = window.setTimeout(scheduler, lookahead);
};

const nextStep = () => {
    let secondsPerBeat = 60.0 / globalParams.tempo;
    let stepDuration = 0.25 * secondsPerBeat;

    if (globalParams.shuffle > 0) {
        if (currentStepIndex % 2 === 0) {
            stepDuration += stepDuration * (globalParams.shuffle * 0.66);
        } else {
            stepDuration -= stepDuration * (globalParams.shuffle * 0.66);
        }
    }
    
    if (performanceOverrides.force !== null) {
        stepDuration = stepDuration * (1.0 - (performanceOverrides.force * 0.2));
    }

    if (globalParams.playMode === 'NOISE') {
        stepDuration = (60.0 / (globalParams.tempo * 2)) * (0.5 + Math.random());
    }
    
    nextNoteTime += stepDuration;
    // Advance step 0-15
    currentStepIndex = (currentStepIndex + 1) % 16;
};

interface StepContext {
    fmAmount: number; 
    filterMod: number; 
    decayScale: number; 
    grit: number; 
    delaySendAmt: number;
    rowType: 'DRUM' | 'BASS' | 'MELODY';
}

const scheduleStep = (time: number) => {
    if (!audioCtx || !drumBus) return;

    const activeIndices: number[] = [];
    const step = currentStepIndex;

    // --- ROW 1: RHYTHM ---
    if (globalParams.volDrum > 0 && activeRows[0]) {
        const module = activeRows[0][step];
        if (module && module.type !== ModuleType.EMPTY && !mutedModuleIds.has(module.id)) {
            activeIndices.push(step); // Global Index 0-15
            
            // Sidechain trigger on 1/4 notes or if specifically a heavy element?
            // Let's just sidechain if it's on a beat (0, 4, 8, 12) OR if it's explicitly a Kick-like thing
            if ((step % 4 === 0) && sidechainNodeBass && sidechainNodeMelody) {
                triggerSidechain(time);
            }

            const ctx: StepContext = { fmAmount: 0, filterMod: 0, decayScale: 1.0, grit: 0, delaySendAmt: 0, rowType: 'DRUM' };
            
            if (module.type === ModuleType.VCO || module.type === ModuleType.SEQ) {
                playDrumHit(module, time, ctx); 
            } else if (module.type === ModuleType.TRASH || module.type === ModuleType.CURSE) {
                playGlitch(time, ctx);
            } else if (module.type === ModuleType.LFO || module.type === ModuleType.FILTER) {
                playClick(time, ctx);
            }
        }
    }

    // --- ROW 2: BASS ---
    if (globalParams.volBass > 0 && activeRows[1]) {
        const module = activeRows[1][step];
        if (module && module.type !== ModuleType.EMPTY && !mutedModuleIds.has(module.id)) {
            activeIndices.push(ROW_SIZE + step); // Global Index 16-31
            const ctx: StepContext = { fmAmount: 0, filterMod: 0, decayScale: 1.0, grit: 0, delaySendAmt: 0, rowType: 'BASS' };
            if (module.type === ModuleType.VCO) {
                playVcoNote(module, time, ctx);
            } else {
                playGlitch(time, ctx); 
            }
        }
    }

    // --- ROW 3: MELODY ---
    if (globalParams.volMelody > 0 && activeRows[2]) {
        const module = activeRows[2][step];
        if (module && module.type !== ModuleType.EMPTY && !mutedModuleIds.has(module.id)) {
            activeIndices.push((ROW_SIZE * 2) + step); // Global Index 32-47
            const ctx: StepContext = { fmAmount: 0, filterMod: 0, decayScale: 1.5, grit: 0, delaySendAmt: 0.5, rowType: 'MELODY' };
            if (module.type === ModuleType.VCO) {
                playVcoNote(module, time, ctx);
            } else if (module.type === ModuleType.EFFECT) {
                playGlitch(time, ctx);
            }
        }
    }

    const timeUntilNote = (time - audioCtx.currentTime) * 1000;
    if (timeUntilNote >= 0) {
        setTimeout(() => {
            stepCallbacks.forEach(cb => cb(activeIndices, step));
        }, timeUntilNote);
    }
};

const triggerSidechain = (time: number) => {
    let duckDepth = 0.3;
    activeDuckers.forEach(d => {
        if (!mutedModuleIds.has(d.id)) {
            const setting = d.settings?.depth ?? 0.8;
            duckDepth += (setting * 0.6); 
        }
    });
    
    const targetGain = Math.max(0.05, 1.0 - duckDepth);

    if (sidechainNodeBass) {
        sidechainNodeBass.gain.setValueAtTime(targetGain, time);
        sidechainNodeBass.gain.exponentialRampToValueAtTime(1.0, time + 0.15); 
    }
    if (sidechainNodeMelody) {
        sidechainNodeMelody.gain.setValueAtTime(targetGain, time);
        sidechainNodeMelody.gain.exponentialRampToValueAtTime(1.0, time + 0.15); 
    }
};

const playVcoNote = (module: Module, time: number, ctxData: StepContext) => {
    const ctx = audioCtx!;
    const mode = globalParams.playMode;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    let targetBus = melodyBus;
    if (ctxData.rowType === 'DRUM') targetBus = drumBus;
    if (ctxData.rowType === 'BASS') targetBus = bassBus;
    
    let outputNode: AudioNode = gain;
    if (ctxData.grit > 0) {
        const shaper = ctx.createWaveShaper();
        shaper.curve = makeDistortionCurve(100 * ctxData.grit);
        gain.connect(shaper);
        outputNode = shaper;
    }

    const scale = SCALES[globalParams.scaleType] || SCALES.PENT;
    const tuningOffset = module.tuning || 0;
    let noteIndex = Math.max(0, (module.value * 2) + tuningOffset);
    noteIndex = noteIndex % scale.length;
    
    let octaveShift = 1;
    if (ctxData.rowType === 'BASS') octaveShift = 0.25; 
    if (ctxData.rowType === 'MELODY') octaveShift = 2; 
    if (mode === 'DRONE') octaveShift *= 0.5;

    const semitones = scale[noteIndex];
    let freq = (SCALE_ROOT * octaveShift) * Math.pow(2, semitones / 12);
    
    if (module.settings?.fine) {
        osc.detune.setValueAtTime(module.settings.fine, time);
    }

    osc.type = module.name.includes('Saw') ? 'sawtooth' : module.name.includes('Pulse') ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.Q.value = 4 + (globalParams.resonance * 5);
    
    const baseCutoff = freq * 4;
    filter.frequency.setValueAtTime(0, time);
    
    gain.gain.setValueAtTime(0, time);

    if (mode === 'DRONE' || ctxData.rowType === 'MELODY') {
        const attack = ctxData.rowType === 'MELODY' ? 0.1 : 1.0;
        const release = ctxData.rowType === 'MELODY' ? 0.5 : 4.0;
        
        filter.frequency.linearRampToValueAtTime(Math.min(20000, freq * 3), time + attack + 0.1);
        gain.gain.linearRampToValueAtTime(0.2, time + attack);
        gain.gain.exponentialRampToValueAtTime(0.001, time + release * ctxData.decayScale); 
        osc.start(time);
        osc.stop(time + (release + 1.0) * ctxData.decayScale);
    } else {
        const decay = (0.2 + (globalParams.noteLength * 0.5)) * ctxData.decayScale; 
        filter.frequency.exponentialRampToValueAtTime(Math.min(20000, baseCutoff), time + 0.01);
        filter.frequency.exponentialRampToValueAtTime(freq, time + (decay * 0.5));
        gain.gain.linearRampToValueAtTime(0.4, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
        osc.start(time);
        osc.stop(time + decay + 0.1);
    }

    osc.connect(filter);
    filter.connect(gain);
    outputNode.connect(targetBus!);
};

const playDrumHit = (module: Module, time: number, ctxData: StepContext) => {
    const ctx = audioCtx!;
    const mode = globalParams.playMode;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const isDistorted = mode === 'NOISE' || ctxData.grit > 0;
    const decay = 0.3 * (0.5 + globalParams.noteLength);
    let freq = isDistorted ? 80 : 120 - (module.value * 5); 
    
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + decay);
    
    if (isDistorted || module.name.includes('Saw')) { osc.type = 'square'; } else { osc.type = 'sine'; }

    gain.gain.setValueAtTime(0.8, time); 
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(gain);
    gain.connect(drumBus!);
    osc.start(time);
    osc.stop(time + decay);
};

const playGlitch = (time: number, ctxData: StepContext) => {
    const ctx = audioCtx!;
    const duration = 0.1;
    const bufferSize = ctx.sampleRate * duration; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(gain);
    let targetBus = melodyBus;
    if (ctxData.rowType === 'DRUM') targetBus = drumBus;
    if (ctxData.rowType === 'BASS') targetBus = bassBus;
    gain.connect(targetBus!);
    noise.start(time);
};

const playClick = (time: number, ctxData: StepContext) => {
    const ctx = audioCtx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    let freq = 800;
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);
    
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(drumBus!); 
    osc.start(time);
    osc.stop(time + 0.05);
};

function makeDistortionCurve(amount: number) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function makeHardClipCurve(sampleRate: number) {
    const n_samples = sampleRate;
    const curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
        // Symmetric endpoints keep zero input at zero after interpolation.
        let x = (i * 2) / (n_samples - 1) - 1;
        if (x > 1) x = 1;
        if (x < -1) x = -1;
        curve[i] = x;
    }
    return curve;
}

function makeAnalogSaturationCurve(drive: number) {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; i++) {
        let x = (i * 2) / n_samples - 1;
        curve[i] = Math.tanh(x * drive);
    }
    return curve;
}

export const playPatch = (modules: Module[], cables: Cable[]) => {
    playSoundEffect('power');
};
