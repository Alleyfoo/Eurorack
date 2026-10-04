import React, { useEffect, useRef, useState } from 'react';
import PatchWorkspace from './PatchWorkspace';
import { PATCH_DEFINITIONS, type SandboxPatch } from '../services/patchModel.ts';
import { availableModules, closeBranch, createStudio, currentPatch, forkArchive, INSTALLED_CAPACITY, missingDependencies, PROJECTS, resumeBranch, startProject, substitutes, updatePatch, visitStudio,
    type ArchiveEntry, type ProjectId, type Resolution, type StudioState } from '../services/studioModel.ts';
import { loadStudio, saveStudio } from '../services/studioStorage.ts';
import './studioPrototype.css';

function boot(): { state: StudioState | null; error: string | null } {
    try { return { state: loadStudio(localStorage), error: null }; }
    catch (error) { return { state: null, error: `Studio save could not load: ${error instanceof Error ? error.message : String(error)} Stored data has not been overwritten.` }; }
}

export default function StudioPrototype() {
    const [initial] = useState(boot);
    const [state, setState] = useState(initial.state);
    const stateRef = useRef(state); stateRef.current = state;
    const [notice, setNotice] = useState('');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [closing, setClosing] = useState(false);
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [retainId, setRetainId] = useState('');
    const [resolver, setResolver] = useState<ArchiveEntry | null>(null);
    const [resolutions, setResolutions] = useState<Record<string, Resolution>>({});

    useEffect(() => {
        if (!state || initial.error) return;
        try { saveStudio(localStorage, state); setSaveError(null); }
        catch (error) { setSaveError(`Could not save: ${error instanceof Error ? error.message : String(error)} Your work is still in this page; retry before leaving.`); }
    }, [state, initial.error]);

    const commit = (transition: (current: StudioState) => StudioState): boolean => {
        if (!stateRef.current) return false;
        try {
            const next = transition(stateRef.current);
            stateRef.current = next; setState(next); setNotice(''); return true;
        } catch (error) { setNotice(error instanceof Error ? error.message : String(error)); return false; }
    };
    const editPatch: React.Dispatch<React.SetStateAction<SandboxPatch>> = edit => {
        commit(current => updatePatch(current, typeof edit === 'function' ? edit(currentPatch(current)) : edit));
    };
    const openArchive = (archive: ArchiveEntry) => {
        if (!state) return;
        if (missingDependencies(state, archive).length === 0) { commit(current => forkArchive(current, archive.id, {})); return; }
        setResolutions({}); setResolver(archive);
    };

    if (initial.error) return <main className="studio-prototype studio-welcome"><h1>Studio save needs attention</h1><p role="alert">{initial.error}</p><p>The legacy save is untouched. No audio has started.</p><button className="patch-button" onClick={() => location.reload()}>Retry load</button></main>;
    if (!state) return <main className="studio-prototype studio-welcome">
        <p className="patch-eyebrow">EURORACK / G1-P</p><h1>Choose your starting material.</h1>
        <p>One source, Filter and LFO. Output is always here. The rack starts unpatched.</p>
        <div className="studio-actions">{(['oscillator', 'noise'] as const).map(source => <button className="patch-button primary" key={source}
            onClick={() => { const fresh = createStudio(source); stateRef.current = fresh; setState(fresh); }}>{source === 'oscillator' ? 'Tone' : 'Noise'}</button>)}</div>
        <p>This is material, not a class. The other source is offered very early.</p>
        <p>Silence, rough resonance and direct routes are legitimate. There is no correct signal chain.</p>
        <a className="patch-button" href="?mode=patch">Patch / Listen reference ↗</a>
    </main>;

    const active = state.active;
    const inBranch = state.view === 'branch' && !!active;
    const branchTitle = active?.projectId ? PROJECTS[active.projectId].title : 'Archive working copy';
    const inventory = availableModules(state);
    const missing = resolver ? missingDependencies(state, resolver) : [];
    const workspaceKey = inBranch ? active!.id : 'studio';
    return <main className="studio-prototype">
        <nav className="studio-navigation" aria-label="Studio context">
            <button className={`patch-button ${!inBranch ? 'primary' : ''}`} onClick={() => { commit(visitStudio); setClosing(false); }}>Free Studio</button>
            {active && <button className={`patch-button ${inBranch ? 'primary' : ''}`} onClick={() => { commit(resumeBranch); setClosing(false); }}>Resume {branchTitle}</button>}
            <a className="patch-button" href="?mode=patch">Patch / Listen reference ↗</a>
            <span>Studio · Project · Archive / saved separately from the legacy game</span>
        </nav>
        {saveError && <div className="studio-alert" role="alert">{saveError} <button className="patch-button" onClick={() => setState({ ...state })}>Retry save</button></div>}
        {notice && <p className="studio-alert" role="alert">{notice}</p>}
        {state.prototypeComplete && <section className="studio-complete"><h2>Prototype arc complete</h2><p>Both projects are closed. Your Studio is still yours. Keep patching, revisit an archive, or make a working copy. This is not a game ending.</p></section>}

        <section className="studio-context" aria-label="Working context">
            <div><p className="patch-eyebrow">{inBranch ? 'PROJECT BRANCH' : 'PERSISTENT STUDIO'}</p>
                <h2>{inBranch ? branchTitle : 'Your own working system'}</h2>
                {inBranch ? <>
                    <p>{active!.projectId ? PROJECTS[active!.projectId].question : 'This copy can borrow archived dependencies. It grants no ownership and leaves the original archive unchanged.'}</p>
                    {active!.projectId && <p data-engagement={active!.engaged ? 'ready' : 'pending'}>
                        <strong>{active!.engaged ? 'Ready to close when you choose.' : 'Closure requirement:'}</strong> Make at least one valid cable involving a project loan.
                        Audio does not need to be started. No sound, amplitude, topology or genre is graded.
                    </p>}
                    <div className="studio-actions">
                        <button className="patch-button" onClick={() => { commit(visitStudio); setClosing(false); }}>Leave / abandon for now</button>
                        <button className="patch-button primary" disabled={!!active!.projectId && !active!.engaged} onClick={() => { setClosing(true); setTitle(''); setNote(''); setRetainId(''); }}>Keep result & close</button>
                    </div>
                    <p>Leaving pauses this branch and keeps your edits for later. Studio edits never overwrite it.</p>
                </> : <p>Your owned tools remain available. Install up to six ordinary modules; Output is fixed. Projects introduce possibilities, not restrictions on your Studio.</p>}
            </div>
            <aside className="studio-storage" aria-label="Available storage"><h3>{inBranch ? 'Branch tools / owned + loans' : 'Owned studio storage'}</h3>
                <ul>{inventory.map(module => <li key={module.id} data-inventory-instance={module.id}>
                    <span>{PATCH_DEFINITIONS[module.kind].name} <small>{module.id.slice(0, 8)}</small></span>
                    <strong>{state.owned.some(m => m.id === module.id) ? 'OWNED' : 'LOAN'}</strong>
                </li>)}</ul><p>Uninstalling makes working space; it never sells or destroys ownership. Loans belong to their branch.</p>
            </aside>
        </section>

        {closing && inBranch && <section className="studio-close" aria-label="Close project">
            <h2>Keep this version</h2><p>The snapshot preserves exact modules, controls, cables and borrowed dependencies before loans return. Recording is not required.</p>
            <label>Title (optional)<input aria-label="Archive title" value={title} maxLength={120} onChange={event => setTitle(event.target.value)} /></label>
            <label>Note (optional)<textarea aria-label="Archive note" value={note} maxLength={2000} onChange={event => setNote(event.target.value)} /></label>
            {active!.projectId && <label>Retain at most one offered module<select aria-label="Retain offered module" value={retainId} onChange={event => setRetainId(event.target.value)}>
                <option value="">None — return every loan</option>{active!.loans.map(module => <option key={module.id} value={module.id}>{PATCH_DEFINITIONS[module.kind].name} · {module.id.slice(0, 8)}</option>)}
            </select></label>}
            <p>Retained modules go into storage. Your Studio rack is never replaced.</p>
            <div className="studio-actions"><button className="patch-button primary" onClick={() => { if (commit(current => closeBranch(current, retainId || null, title, note))) setClosing(false); }}>Save snapshot & close</button>
                <button className="patch-button" onClick={() => setClosing(false)}>Keep experimenting</button></div>
        </section>}

        <React.Fragment key={workspaceKey}><PatchWorkspace patch={currentPatch(state)} setPatch={editPatch} installable={inventory} capacity={INSTALLED_CAPACITY}
            title={inBranch ? 'PROJECT / LISTEN' : 'STUDIO / LISTEN'} eyebrow="EURORACK / G1-P" /></React.Fragment>

        <section className="studio-projects" aria-label="Projects"><h2>Two small opportunities</h2>
            {(Object.keys(PROJECTS) as ProjectId[]).map(id => <article key={id} data-project={id}>
                <p className="patch-eyebrow">{state.closed.includes(id) ? 'CLOSED / KEPT IN ARCHIVE' : state.unlocked.includes(id) ? 'AVAILABLE' : 'OPENS AFTER MATERIAL / MEMORY CLOSES'}</p>
                <h3>{PROJECTS[id].title}</h3><p>{PROJECTS[id].question}</p>
                {!state.closed.includes(id) && <button className="patch-button" disabled={!state.unlocked.includes(id) || !!active} onClick={() => commit(current => startProject(current, id))}>Start {PROJECTS[id].title}</button>}
            </article>)}
            {active && <p>Your existing branch is kept. Resume or close it before starting another; returning to free Studio is always available.</p>}
        </section>

        {resolver && <section className="studio-resolver" aria-label="Dependency resolver">
            <h2>Explain the missing dependencies</h2><p>{resolver.title} stays unchanged. These exact instances are not owned/available. Choose how a new copy will use them.</p>
            {missing.map(dependency => {
                const options = substitutes(state, resolver, dependency);
                const selection = resolutions[dependency.id];
                return <div className="studio-dependency" key={dependency.id}>
                    <h3>{PATCH_DEFINITIONS[dependency.kind].name} · {dependency.id.slice(0, 8)}</h3>
                    <p>Original cables and {dependency.definition.ports.map(p => `${p.label} (${p.family} ${p.direction})`).join(', ')} are preserved. Same-kind substitutes map those port IDs explicitly.</p>
                    <label>Resolution<select aria-label={`Resolve ${dependency.id}`} value={selection?.mode === 'loan' ? 'loan' : selection?.mode === 'substitute' ? selection.instanceId : ''}
                        onChange={event => setResolutions(prev => { const next = { ...prev }; if (!event.target.value) delete next[dependency.id]; else next[dependency.id] = event.target.value === 'loan' ? { mode: 'loan' } : { mode: 'substitute', instanceId: event.target.value }; return next; })}>
                        <option value="">Choose a resolution</option><option value="loan">Reacquire temporarily — loan in this copy</option>
                        {options.map(m => <option value={m.id} key={m.id}>Substitute owned {PATCH_DEFINITIONS[m.kind].name} · {m.id.slice(0, 8)}</option>)}
                    </select></label>{!options.length && <p>No valid owned same-kind substitute exists.</p>}
                </div>;
            })}
            <div className="studio-actions"><button className="patch-button primary" disabled={missing.some(m => !resolutions[m.id]) || !!active} onClick={() => { if (commit(current => forkArchive(current, resolver.id, resolutions))) setResolver(null); }}>Make resolved working copy</button>
                <button className="patch-button" onClick={() => setResolver(null)}>Retain as archive</button></div>
        </section>}

        <section className="studio-archives" aria-label="Project archive"><h2>Archive / immutable kept work</h2>
            {!state.archives.length && <p>Close a project when ready to keep its first snapshot.</p>}
            {state.archives.map(archive => <article key={archive.id} data-archive={archive.id}>
                <p className="patch-eyebrow">{archive.projectId ? PROJECTS[archive.projectId].title : 'WORKING COPY'} / {new Date(archive.createdAt).toLocaleString()}</p>
                <h3>{archive.title}</h3>{archive.note && <p className="archive-note">{archive.note}</p>}
                <ul>{archive.patch.modules.map(module => <li key={module.id}>
                    {module.definition.name} · <small>{module.id}</small> — {module.kind === 'output' ? 'fixed infrastructure' : state.owned.some(m => m.id === module.id) ? 'exact instance owned' : 'dependency preserved / not owned'}
                    <br /><small>Origin: {module.provenance.origin}{module.provenance.projectId ? ` / ${module.provenance.projectId}` : ''}; controls: {JSON.stringify(module.controls)}</small>
                </li>)}</ul>
                <p>{archive.patch.cables.length} preserved cables</p>
                <ul>{archive.patch.cables.map(cable => <li key={cable.id}><small>{cable.from.moduleId.slice(0, 8)} / {cable.from.portId} → {cable.to.moduleId.slice(0, 8)} / {cable.to.portId}</small></li>)}</ul>
                <button className="patch-button" disabled={!!active} onClick={() => openArchive(archive)}>Make working copy</button>
                <p>Dependencies are preserved without granting ownership. Missing instances are explained; no module or cable is silently deleted.</p>
            </article>)}
        </section>
    </main>;
}
