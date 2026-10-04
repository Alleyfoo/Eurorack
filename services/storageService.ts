import { PlayerState } from '../types';

const SAVE_KEY = 'eurorack_inc_save_v1';

export const saveGame = (state: PlayerState) => {
    try {
        const serialized = JSON.stringify(state);
        localStorage.setItem(SAVE_KEY, serialized);
    } catch (e) {
        console.error('Failed to save game:', e);
    }
};

export const loadGame = (): PlayerState | null => {
    try {
        const data = localStorage.getItem(SAVE_KEY);
        if (!data) return null;
        return JSON.parse(data);
    } catch (e) {
        console.error('Failed to load game:', e);
        return null;
    }
};

export const clearSave = () => {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch (e) {
        console.error('Failed to clear save:', e);
    }
};
