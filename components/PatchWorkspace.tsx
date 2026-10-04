import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Oscilloscope from './Oscilloscope';
import { PatchAudioGraph } from '../services/patchAudioGraph.ts';
import { openStudioPatchSession } from '../services/audioEngine';
import { connectionError, createPatchModule, findPort, PALETTE, PATCH_DEFINITIONS, removePatchModule, setPatchControl, WAVEFORMS, type PatchEndpoint, type PatchKind, type PatchModule, type PatchPort, type SandboxPatch } from '../services/patchModel.ts';
import './patchSandbox.css';

type Point = { x: number; y: number };
const endpointKey = (endpoint: PatchEndpoint) => `${endpoint.moduleId}:${endpoint.portId}`;
const sameEndpoint = (a: PatchEndpoint, b: PatchEndpoint) => endpointKey(a) === endpointKey(b);

interface Props {
    patch: SandboxPatch;
    setPatch: React.Dispatch<React.SetStateAction<SandboxPatch>>;
    installable?: PatchModule[];
    capacity?: number;
    title?: string;
    eyebrow?: string;
}

/** Shared cable gestures, controls and Studio-owned audio; callers own patch state. */
export default function PatchWorkspace({ patch, setPatch, installable, capacity = 12, title = 'PATCH / LISTEN', eyebrow = 'EURORACK / S1-A' }: Props) {
    const [pending, setPending] = useState<PatchEndpoint | null>(null);
    const [message, setMessage] = useState('Start audio. Connect a SIGNAL output to the Output MIX input.');
    const [started, setStarted] = useState(false);
    const [busy, setBusy] = useState(false);
    const [volume, setVolume] = useState(0.15);
    const [muted, setMuted] = useState(false);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [points, setPoints] = useState<Record<string, Point>>({});
    const [pointer, setPointer] = useState<Point | null>(null);
    const engine = useRef<PatchAudioGraph | null>(null);
    const patchRef = useRef(patch);
    patchRef.current = patch;
    const board = useRef<HTMLDivElement>(null);
    const ports = useRef(new Map<string, HTMLButtonElement>());
    const dragged = useRef<string | null>(null);
    const portGesture = useRef(false);

    useEffect(() => () => { const runtime = engine.current; engine.current = null; void runtime?.dispose(); }, []);
    useEffect(() => {
        if (!engine.current) return;
        try { engine.current.apply(patch); } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not apply this patch.'); }
    }, [patch]);
    useEffect(() => { engine.current?.setOutput(volume, muted); }, [volume, muted]);

    useLayoutEffect(() => {
        const element = board.current;
        if (!element) return;
        const measure = () => {
            const rect = element.getBoundingClientRect();
            const next: Record<string, Point> = {};
            ports.current.forEach((button, key) => {
                const port = button.querySelector('.jack')!.getBoundingClientRect();
                next[key] = { x: port.left + port.width / 2 - rect.left, y: port.top + port.height / 2 - rect.top };
            });
            setPoints(next);
        };
        measure();
        const observer = new ResizeObserver(measure); observer.observe(element);
        window.addEventListener('resize', measure);
        return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
    }, [patch.modules]);

    useEffect(() => {
        const cancel = (event: KeyboardEvent) => { if (event.key === 'Escape') { setPending(null); setPointer(null); } };
        window.addEventListener('keydown', cancel);
        return () => window.removeEventListener('keydown', cancel);
    }, []);

    const startAudio = async () => {
        if (busy) return;
        setBusy(true);
        const runtime = engine.current ?? new PatchAudioGraph(openStudioPatchSession); engine.current = runtime;
        runtime.setOutput(volume, muted);
        try {
            await runtime.start(patchRef.current);
            if (engine.current !== runtime) return;
            runtime.apply(patchRef.current);
            setAnalyser(runtime.getAnalyser()); setStarted(true);
            setMessage('Audio is live. The patch is silent until a source reaches Output.');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Audio could not start. Try again.');
        } finally { setBusy(false); }
    };

    const stopAudio = async () => {
        const runtime = engine.current; engine.current = null;
        setStarted(false); setAnalyser(null);
        await runtime?.dispose();
        setMessage('Audio stopped. Your patch is still here.');
    };

    const completeConnection = (first: PatchEndpoint, second: PatchEndpoint) => {
        const firstPort = findPort(patchRef.current, first);
        const from = firstPort?.direction === 'out' ? first : second;
        const to = firstPort?.direction === 'out' ? second : first;
        const error = connectionError(patchRef.current, from, to);
        if (error) setMessage(error);
        else {
            setPatch(prev => ({ ...prev, cables: [...prev.cables, { id: crypto.randomUUID(), from, to }] }));
            setMessage(`${findPort(patchRef.current, from)?.family} connected. Listen, then change something.`);
        }
        setPending(null); setPointer(null);
    };

    const selectPort = (endpoint: PatchEndpoint) => {
        if (!pending) { setPending(endpoint); setMessage('Choose the other port. Escape cancels.'); }
        else if (sameEndpoint(pending, endpoint)) { setPending(null); setPointer(null); }
        else completeConnection(pending, endpoint);
    };

    const addModule = (kind: PatchKind) => {
        if (patch.modules.length >= capacity + 1) { setMessage(`This rack holds ${capacity} modules plus Output. Uninstall one to make room; owned modules stay in storage.`); return; }
        setPatch(prev => ({ ...prev, modules: [...prev.modules.slice(0, -1), createPatchModule(kind, crypto.randomUUID()), prev.modules.at(-1)!] }));
    };

    const removeModule = (id: string) => {
        setPatch(prev => removePatchModule(prev, id));
        if (pending?.moduleId === id) { setPending(null); setPointer(null); }
    };

    const renderPort = (moduleId: string, port: PatchPort) => {
        const endpoint = { moduleId, portId: port.id };
        const selected = pending && sameEndpoint(pending, endpoint);
        return <button key={port.id} className={`patch-port ${port.family.toLowerCase()} ${selected ? 'selected' : ''}`}
            ref={element => { const key = endpointKey(endpoint); if (element) ports.current.set(key, element); else ports.current.delete(key); }}
            aria-label={`${PATCH_DEFINITIONS[patch.modules.find(m => m.id === moduleId)!.kind].name} ${port.label} ${port.direction === 'out' ? 'output' : 'input'}`}
            aria-pressed={!!selected} data-module={moduleId} data-port={port.id} title={`${port.family} ${port.direction}`}
            onClick={event => { if (event.detail === 0 || !portGesture.current) selectPort(endpoint); portGesture.current = false; }}
            onPointerDown={event => {
                if (event.button !== 0) return;
                portGesture.current = true;
                if (!pending) { setPending(endpoint); setPointer(points[endpointKey(endpoint)] ?? null); }
            }}
            onPointerUp={() => {
                if (pending && !sameEndpoint(pending, endpoint)) completeConnection(pending, endpoint);
                // A click on its starting jack keeps selection for click-to-connect.
            }}
            onPointerCancel={() => { setPending(null); setPointer(null); portGesture.current = false; }}>
            <span className="jack" /><span>{port.label}<small>{port.family} {port.direction === 'out' ? '↗' : '↙'}</small></span>
        </button>;
    };

    return <main className="patch-sandbox">
        <header className="patch-header">
            <div><p className="patch-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="patch-intro">Build a relationship. Hear what changes.</p></div>
            <div className="patch-transport">
                <span className={`audio-status ${started ? 'live' : ''}`}>{started ? '● AUDIO LIVE' : '○ AUDIO OFF'}</span>
                <button className="patch-button primary" onClick={started ? stopAudio : startAudio} disabled={busy}>{busy ? 'Starting…' : started ? 'Stop audio' : 'Start audio'}</button>
                <a className="patch-button" href="?mode=legacy">Legacy game ↗</a>
                <a className="patch-button" href="?mode=studio">Studio ↗</a>
            </div>
        </header>
        <section className="patch-toolbar" aria-label="Module palette">
            <span className="patch-eyebrow">{installable ? `INSTALL / ${patch.modules.length - 1} OF ${capacity}` : 'ADD TO RACK'}</span>
            {installable ? installable.filter(m => !patch.modules.some(installed => installed.id === m.id)).map(module =>
                <button className="patch-button" key={module.id} data-install-instance={module.id}
                    disabled={patch.modules.length >= capacity + 1}
                    onClick={() => setPatch(prev => ({ ...prev, modules: [...prev.modules.slice(0, -1), structuredClone(module), prev.modules.at(-1)!] }))}>
                    Install {PATCH_DEFINITIONS[module.kind].name} · {module.id.slice(0, 6)}
                </button>) : PALETTE.map(kind => <button className="patch-button" key={kind} onClick={() => addModule(kind)}>+ {PATCH_DEFINITIONS[kind].name}</button>)}
            <button className="patch-button clear" onClick={() => { setPatch(prev => ({ ...prev, cables: [] })); setPending(null); setPointer(null); setMessage('Cables cleared. Silence is a valid patch.'); }}>Clear cables</button>
        </section>
        <div className="patch-notice" role="status"><span className="patch-eyebrow">PATCH NOTE</span>{message}</div>
        <section className="patch-rack" aria-label="Patch rack" ref={board}
            onPointerMove={event => { if (pending && board.current) { const rect = board.current.getBoundingClientRect(); setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top }); } }}
            onPointerUp={event => { if (pending && !(event.target as HTMLElement).closest('.patch-port')) { setPending(null); setPointer(null); } }}>
            <svg className="patch-cables" aria-label="Cable routes">
                {patch.cables.map(cable => {
                    const from = points[endpointKey(cable.from)]; const to = points[endpointKey(cable.to)];
                    if (!from || !to) return null;
                    const family = findPort(patch, cable.from)?.family;
                    return <path key={cable.id} data-cable={cable.id} className={`patch-cable ${family?.toLowerCase()}`} d={`M${from.x},${from.y} C${from.x},${from.y + 70} ${to.x},${to.y + 70} ${to.x},${to.y}`} />;
                })}
                {pending && pointer && points[endpointKey(pending)] && <path className="patch-cable pending" d={`M${points[endpointKey(pending)].x},${points[endpointKey(pending)].y} L${pointer.x},${pointer.y}`} />}
            </svg>
            {patch.modules.map((module, index) => {
                const definition = PATCH_DEFINITIONS[module.kind];
                return <article className={`patch-module ${module.kind}`} key={module.id} data-module-card={module.id}
                    onDragOver={event => event.preventDefault()}
                    onDrop={event => { event.preventDefault(); const id = dragged.current; dragged.current = null; if (!id || id === module.id || module.kind === 'output') return; setPatch(prev => { const modules = [...prev.modules]; const from = modules.findIndex(m => m.id === id); const to = modules.findIndex(m => m.id === module.id); if (from < 0 || to < 0) return prev; const [moved] = modules.splice(from, 1); modules.splice(to, 0, moved); return { ...prev, modules }; }); }}>
                    <header className="module-header" draggable={module.kind !== 'output'} onDragStart={event => { dragged.current = module.id; event.dataTransfer.setData('text/plain', module.id); }} onDragEnd={() => { dragged.current = null; }}>
                        <span className="module-number">{String(index + 1).padStart(2, '0')}</span>
                        <h2>{definition.name}</h2>
                        {module.kind !== 'output' && <button className="remove-module" aria-label={`Remove ${definition.name}`} onClick={() => removeModule(module.id)}>×</button>}
                    </header>
                    <p className="module-subtitle">{definition.subtitle}</p>
                    <div className="module-controls">
                        {definition.controls.map(control => <label key={control.id} className="patch-control">
                            <span>{control.label}<output>{control.id === 'waveform' ? WAVEFORMS[module.controls.waveform] : `${Number(module.controls[control.id].toFixed(2))} ${control.unit}`}</output></span>
                            <input type="range" aria-label={`${definition.name} ${control.label}`} min={control.min} max={control.max} step={control.step} value={module.controls[control.id]}
                                onChange={event => setPatch(prev => setPatchControl(prev, module.id, control.id, Number(event.target.value)))} />
                        </label>)}
                        {module.kind === 'output' && <>
                            <Oscilloscope analyser={analyser} width={190} height={84} />
                            <label className="patch-control"><span>Listen level<output>{Math.round(volume * 100)}%</output></span><input aria-label="Output Listen level" type="range" min="0" max="1" step="0.01" value={volume} onChange={event => setVolume(Number(event.target.value))} /></label>
                            <button className={`patch-button ${muted ? 'primary' : ''}`} aria-pressed={muted} onClick={() => setMuted(prev => !prev)}>{muted ? 'Unmute output' : 'Mute output'}</button>
                        </>}
                    </div>
                    <div className="module-ports">{definition.ports.map(port => renderPort(module.id, port))}</div>
                    <span className="panel-screw left" /><span className="panel-screw right" />
                </article>;
            })}
        </section>
        <footer className="patch-footer">
            <div><span className="signal-key audio">● AUDIO</span><span className="signal-key cv">● CV</span><p>Drag between jacks, or click two jacks. Drag a module header to move it.</p><p>Feedback: Delay SIGNAL → its RETURN. Listen level starts at 15%.</p></div>
            <section className="patch-connections" aria-label="Connections"><h2>{patch.cables.length} {patch.cables.length === 1 ? 'CONNECTION' : 'CONNECTIONS'}</h2>
                {patch.cables.map(cable => <button key={cable.id} className="connection-remove" aria-label={`Remove cable ${cable.id}`} onClick={() => setPatch(prev => ({ ...prev, cables: prev.cables.filter(c => c.id !== cable.id) }))}>
                    {patch.modules.findIndex(m => m.id === cable.from.moduleId) + 1} / {findPort(patch, cable.from)?.label} → {patch.modules.findIndex(m => m.id === cable.to.moduleId) + 1} / {findPort(patch, cable.to)?.label} <span>×</span>
                </button>)}
            </section>
        </footer>
    </main>;
}
