import { connectionError, createPatchModule, PATCH_DEFINITIONS, type PatchDefinition, type PatchKind, type PatchModule, type SandboxPatch } from './patchModel.ts';

export const INSTALLED_CAPACITY = 6; // G1-P tuning, not a progression ladder.
export type SourceChoice = 'oscillator' | 'noise';
export type ProjectId = 'material-memory' | 'level-motion';
export interface StudioModule extends PatchModule {
    definition: PatchDefinition;
    provenance: { origin: 'starter' | 'infrastructure' | 'project-loan' | 'archive-loan'; projectId?: ProjectId; archiveId?: string };
}
export interface WorkingBranch {
    id: string;
    projectId: ProjectId | null;
    archiveId?: string;
    patch: SandboxPatch;
    inventory: StudioModule[]; // Branch-local controls; editing never mutates owned instances.
    loans: StudioModule[];
    engaged: boolean;
}
export interface ArchiveEntry {
    id: string;
    projectId: ProjectId | null;
    sourceArchiveId?: string;
    title: string;
    note: string;
    createdAt: string;
    patch: { modules: StudioModule[]; cables: SandboxPatch['cables'] };
}
export interface StudioState {
    version: 1;
    starter: SourceChoice;
    owned: StudioModule[];
    studioPatch: SandboxPatch;
    active: WorkingBranch | null;
    view: 'studio' | 'branch';
    unlocked: ProjectId[];
    closed: ProjectId[];
    archives: ArchiveEntry[];
    prototypeComplete: boolean;
}

// Two authored objects, deliberately not a quest DSL or generic content engine.
export const PROJECTS: Record<ProjectId, { title: string; question: string; loans: (starter: SourceChoice) => PatchKind[] }> = {
    'material-memory': {
        title: 'Material / Memory',
        question: 'Change what enters the system, or let the system remember what happened. Try the other source and a Delay; keep the response you want.',
        loans: starter => [starter === 'oscillator' ? 'noise' : 'oscillator', 'delay']
    },
    'level-motion': {
        title: 'Level in Motion',
        question: 'What happens when level becomes something you can influence? Try the VCA with your accumulated tools. The sonic response is yours.',
        loans: () => ['vca']
    }
};
const copy = <T,>(value: T): T => structuredClone(value);
const newId = () => crypto.randomUUID();
function instance(kind: PatchKind, provenance: StudioModule['provenance']): StudioModule {
    return { ...createPatchModule(kind, newId()), definition: copy(PATCH_DEFINITIONS[kind]), provenance };
}
export function createStudio(starter: SourceChoice): StudioState {
    const owned = [starter, 'filter', 'lfo'].map(kind => instance(kind as PatchKind, { origin: 'starter' }));
    const output = instance('output', { origin: 'infrastructure' });
    return { version: 1, starter, owned, studioPatch: { modules: copy([...owned, output]), cables: [] }, active: null,
        view: 'studio', unlocked: ['material-memory'], closed: [], archives: [], prototypeComplete: false };
}
export function currentPatch(state: StudioState): SandboxPatch {
    return state.view === 'branch' && state.active ? state.active.patch : state.studioPatch;
}
export function availableModules(state: StudioState): StudioModule[] {
    return state.view === 'branch' && state.active ? state.active.inventory : state.owned;
}

export function startProject(state: StudioState, projectId: ProjectId): StudioState {
    if (state.active) throw new Error('Return to or close the existing working branch first; it will not be discarded.');
    if (!state.unlocked.includes(projectId) || state.closed.includes(projectId)) throw new Error('This project is not available.');
    const loans = PROJECTS[projectId].loans(state.starter).map(kind => instance(kind, { origin: 'project-loan', projectId }));
    return { ...state, view: 'branch', active: { id: newId(), projectId, patch: copy(state.studioPatch),
        inventory: copy([...state.owned, ...loans]), loans, engaged: false } };
}
export function visitStudio(state: StudioState): StudioState { return { ...state, view: 'studio' }; }
export function resumeBranch(state: StudioState): StudioState {
    if (!state.active) throw new Error('No working branch to resume.');
    return { ...state, view: 'branch' };
}

function validatePatch(patch: SandboxPatch): void {
    if (!patch || !Array.isArray(patch.modules) || !Array.isArray(patch.cables)) throw new Error('Invalid saved patch.');
    if (patch.modules.length > INSTALLED_CAPACITY + 1 || patch.modules.filter(m => m.kind === 'output').length !== 1 || patch.modules.at(-1)?.kind !== 'output') throw new Error('Patch needs one fixed Output and at most six ordinary modules.');
    const ids = new Set<string>();
    for (const module of patch.modules) {
        validateModule(module);
        if (ids.has(module.id)) throw new Error('Duplicate module instance in patch.');
        ids.add(module.id);
    }
    const accepted: SandboxPatch = { modules: patch.modules, cables: [] };
    const cableIds = new Set<string>();
    for (const cable of patch.cables) {
        if (!cable || typeof cable.id !== 'string' || cableIds.has(cable.id) || !cable.from || !cable.to) throw new Error('Invalid cable record.');
        const error = connectionError(accepted, cable.from, cable.to);
        if (error) throw new Error(error);
        cableIds.add(cable.id); accepted.cables.push(cable);
    }
}
function validateModule(module: PatchModule): void {
    if (!module || typeof module.id !== 'string' || !module.id || !Object.hasOwn(PATCH_DEFINITIONS, module.kind) || !module.controls) throw new Error('Unknown saved module dependency. Stored data has been preserved.');
    for (const control of PATCH_DEFINITIONS[module.kind].controls) {
        const value = module.controls[control.id];
        if (!Number.isFinite(value) || value < control.min || value > control.max || (control.id === 'waveform' && !Number.isInteger(value))) throw new Error('Invalid saved module control.');
    }
}
function checkInventory(modules: StudioModule[]): void {
    if (!Array.isArray(modules)) throw new Error('Invalid instance inventory.');
    const ids = new Set<string>();
    for (const module of modules) {
        validateModule(module);
        checkMetadata(module);
        if (ids.has(module.id) || module.kind === 'output') throw new Error('Invalid saved instance identity.');
        ids.add(module.id);
    }
}
function checkMetadata(module: StudioModule): void {
    if (!module.provenance || !['starter', 'infrastructure', 'project-loan', 'archive-loan'].includes(module.provenance.origin)
        || !module.definition || typeof module.definition.name !== 'string' || !Array.isArray(module.definition.ports)
        || module.definition.ports.some(p => !p || typeof p.id !== 'string' || typeof p.label !== 'string' || !['AUDIO', 'CV', 'GATE'].includes(p.family) || !['in', 'out'].includes(p.direction))) {
        throw new Error('Missing or invalid saved definition/provenance. Stored data is unchanged.');
    }
}
function checkAvailable(patch: SandboxPatch, inventory: StudioModule[]): void {
    for (const module of patch.modules) {
        if (module.kind !== 'output' && !inventory.some(m => m.id === module.id && m.kind === module.kind)) throw new Error('An unavailable dependency needs explicit resolution. No module or cable was deleted.');
    }
}

/** A valid newly added cable involving a loan proves engagement, even with audio off. */
export function updatePatch(state: StudioState, patch: SandboxPatch): StudioState {
    validatePatch(patch);
    const inventory = availableModules(state);
    checkAvailable(patch, inventory);
    const updatedInventory = inventory.map(m => ({ ...m, controls: copy(patch.modules.find(p => p.id === m.id)?.controls ?? m.controls) }));
    if (state.view === 'branch' && state.active) {
        const branch = state.active;
        const added = patch.cables.filter(c => !branch.patch.cables.some(old => old.id === c.id));
        const engaged = branch.engaged || added.some(c => branch.loans.some(m => m.id === c.from.moduleId || m.id === c.to.moduleId));
        return { ...state, active: { ...branch, patch: copy(patch), inventory: updatedInventory,
            loans: branch.loans.map(m => copy(updatedInventory.find(i => i.id === m.id)!)), engaged } };
    }
    return { ...state, studioPatch: copy(patch), owned: updatedInventory };
}

export function closeBranch(state: StudioState, retainId: string | null, title = '', note = ''): StudioState {
    const branch = state.active;
    if (!branch) throw new Error('No working branch to close.');
    if (branch.projectId && !branch.engaged) throw new Error('Make at least one valid cable involving a project loan. Audio and musical quality are not checked.');
    const retained = retainId && branch.loans.find(m => m.id === retainId);
    if (retainId && (!retained || !branch.projectId)) throw new Error('Only an offered project loan can be retained.');
    // Snapshot first. It owns a deep copy of exact instances, definitions and provenance.
    const archive: ArchiveEntry = {
        id: newId(), projectId: branch.projectId, sourceArchiveId: branch.archiveId,
        title: title.trim() || (branch.projectId ? PROJECTS[branch.projectId].title : 'Archive working copy'),
        note, createdAt: new Date().toISOString(),
        patch: { modules: branch.patch.modules.map(m => {
            const metadata = m.kind === 'output' ? m as StudioModule : branch.inventory.find(i => i.id === m.id)!;
            return copy({ ...metadata, controls: m.controls });
        }), cables: copy(branch.patch.cables) }
    };
    const closed = branch.projectId ? [...new Set([...state.closed, branch.projectId])] : state.closed;
    const unlocked = closed.includes('material-memory') ? [...new Set<ProjectId>([...state.unlocked, 'level-motion'])] : state.unlocked;
    return { ...state, active: null, view: 'studio', archives: [...state.archives, archive], closed, unlocked,
        owned: retained ? [...state.owned, copy(retained)] : state.owned, prototypeComplete: closed.includes('level-motion') };
}

export function missingDependencies(state: StudioState, archive: ArchiveEntry): StudioModule[] {
    return archive.patch.modules.filter(m => m.kind !== 'output' && !state.owned.some(owned => owned.id === m.id && owned.kind === m.kind));
}
export function substitutes(state: StudioState, archive: ArchiveEntry, dependency: StudioModule): StudioModule[] {
    // Same kind exposes the same ports. Never collapse two archived instances into one.
    return state.owned.filter(m => m.kind === dependency.kind && !archive.patch.modules.some(original => original.id === m.id));
}
export type Resolution = { mode: 'loan' } | { mode: 'substitute'; instanceId: string };
export function forkArchive(state: StudioState, archiveId: string, resolutions: Record<string, Resolution>): StudioState {
    if (state.active) throw new Error('Your existing branch is preserved. Close it before making another working copy.');
    const archive = state.archives.find(a => a.id === archiveId);
    if (!archive) throw new Error('Archive not found.');
    const patch = copy(archive.patch);
    const loans: StudioModule[] = [];
    const used = new Set(patch.modules.filter(m => state.owned.some(o => o.id === m.id)).map(m => m.id));
    for (const dependency of missingDependencies(state, archive)) {
        const resolution = resolutions[dependency.id];
        if (!resolution) throw new Error('Resolve every missing dependency or retain this entry as an archive.');
        if (resolution.mode === 'loan') {
            const loan = copy(dependency); // Original identity survives reacquisition, not ownership.
            loans.push(loan);
        } else {
            const replacement = substitutes(state, archive, dependency).find(m => m.id === resolution.instanceId);
            if (!replacement || used.has(replacement.id)) throw new Error('No distinct owned instance of that kind is available to substitute.');
            used.add(replacement.id);
            const index = patch.modules.findIndex(m => m.id === dependency.id);
            patch.modules[index] = { ...copy(replacement), controls: copy(dependency.controls) };
            patch.cables = patch.cables.map(c => ({ ...c,
                from: { ...c.from, moduleId: c.from.moduleId === dependency.id ? replacement.id : c.from.moduleId },
                to: { ...c.to, moduleId: c.to.moduleId === dependency.id ? replacement.id : c.to.moduleId } }));
        }
    }
    validatePatch(patch);
    const inventory = copy([...state.owned, ...loans]);
    for (const module of patch.modules) {
        const stored = inventory.find(m => m.id === module.id);
        if (stored) stored.controls = copy(module.controls);
    }
    return { ...state, view: 'branch', active: { id: newId(), projectId: null, archiveId, patch,
        inventory, loans, engaged: false } };
}

/** Reject unusable saves explicitly; never prune dependencies or replace a stored save. */
export function validateStudioState(value: unknown): StudioState {
    const state = value as StudioState;
    if (!state || state.version !== 1) throw new Error('Unsupported studio save version. Stored data is unchanged.');
    if (!['oscillator', 'noise'].includes(state.starter) || !['studio', 'branch'].includes(state.view) || !Array.isArray(state.closed) || !Array.isArray(state.unlocked) || !Array.isArray(state.archives) || typeof state.prototypeComplete !== 'boolean') throw new Error('Invalid studio state.');
    for (const id of [...state.closed, ...state.unlocked]) if (!Object.hasOwn(PROJECTS, id)) throw new Error('Unknown project.');
    checkInventory(state.owned); validatePatch(state.studioPatch); checkAvailable(state.studioPatch, state.owned);
    state.studioPatch.modules.forEach(m => checkMetadata(m as StudioModule));
    if (state.active) {
        const branch = state.active;
        if (typeof branch.id !== 'string' || typeof branch.engaged !== 'boolean' || (branch.projectId !== null && !Object.hasOwn(PROJECTS, branch.projectId))) throw new Error('Invalid project branch.');
        checkInventory(branch.inventory); checkInventory(branch.loans); validatePatch(branch.patch); checkAvailable(branch.patch, branch.inventory);
        branch.patch.modules.forEach(m => checkMetadata(m as StudioModule));
        for (const loan of branch.loans) if (!branch.inventory.some(m => m.id === loan.id && m.kind === loan.kind) || state.owned.some(m => m.id === loan.id)) throw new Error('Invalid loan ownership.');
        for (const module of branch.inventory) if (!state.owned.some(m => m.id === module.id && m.kind === module.kind) && !branch.loans.some(m => m.id === module.id && m.kind === module.kind)) throw new Error('Unresolved branch inventory dependency.');
    } else if (state.active !== null || state.view === 'branch') throw new Error('Missing active branch.');
    const archiveIds = new Set<string>();
    for (const archive of state.archives) {
        if (!archive || typeof archive.id !== 'string' || archiveIds.has(archive.id) || typeof archive.title !== 'string' || typeof archive.note !== 'string' || typeof archive.createdAt !== 'string' || (archive.projectId !== null && !Object.hasOwn(PROJECTS, archive.projectId))) throw new Error('Invalid archive record.');
        archiveIds.add(archive.id); validatePatch(archive.patch);
        archive.patch.modules.forEach(checkMetadata);
    }
    return copy(state);
}
