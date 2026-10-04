import { validateStudioState, type StudioState } from './studioModel.ts';

export const STUDIO_SAVE_KEY = 'eurorack_studio_save_v1';
export interface StudioStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function loadStudio(storage: StudioStorage): StudioState | null {
    const raw = storage.getItem(STUDIO_SAVE_KEY);
    return raw === null ? null : validateStudioState(JSON.parse(raw));
}
export function saveStudio(storage: StudioStorage, state: StudioState): void {
    storage.setItem(STUDIO_SAVE_KEY, JSON.stringify(state));
}
