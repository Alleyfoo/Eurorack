
export enum ModuleType {
  VCO = 'VCO',     // Voltage Controlled Oscillator (Value)
  VCA = 'VCA',     // Amplifier (Booster/Utility)
  FILTER = 'FILTER', // Filter (Modifier)
  LFO = 'LFO',     // Modulator (Randomness)
  TRASH = 'TRASH', // Useless
  CURSE = 'CURSE', // Negative effect
  MASTER = 'MASTER', // Special
  EFFECT = 'EFFECT', // Delay/Reverb
  UTILITY = 'UTILITY', // Mixer/Logic
  SEQ = 'SEQ',      // Sequencer
  DUCKER = 'DUCKER', // Sidechain/Compression
  EMPTY = 'EMPTY'   // Blank Panel (Rest/Spacer)
}

export enum Rarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  LEGENDARY = 'Legendary',
  MYTHIC = 'Mythic',
  CURSED = 'Cursed'
}

export type PortType = 'AUDIO_IN' | 'AUDIO_OUT' | 'CV_IN' | 'CV_OUT' | 'GATE_IN' | 'GATE_OUT';

export interface ModuleSettings {
  fine?: number;       // VCO: Cents (-50 to +50)
  cutoff?: number;     // FILTER: 0-1 normalized
  resonance?: number;  // FILTER: 0-1 normalized
  rate?: number;       // LFO: 0-1 normalized
  mix?: number;        // EFFECT: 0-1 (Dry/Wet)
  time?: number;       // EFFECT: 0-1 (Delay time/Decay)
  level?: number;      // VCA: 0-1 (Gain)
  probability?: number;// SEQ: 0-1 (Trigger chance)
  depth?: number;      // DUCKER: 0-1 (Compression amount)
}

export interface Module {
  id: string;
  name: string;
  type: ModuleType;
  value: number; // Base output value
  rarity: Rarity;
  manufacturer?: string;
  description: string;
  cost: number;
  effect?: string; // Description of special effect
  inputs: PortType[];
  outputs: PortType[];
  tuning?: number; // Semitone offset (-12 to +12)
  settings?: ModuleSettings;
}

export interface PatchResult {
  totalOutput: number;
  baseScore: number;
  multiplier: number;
  synergyName: string;
  feedback: string;
  isSilence: boolean;
  moduleActivity: Record<string, number>; // Normalized 0-1 activity level per module ID
}

export interface Cable {
  id: string;
  fromModuleId: string;
  fromPortIndex: number;
  toModuleId: string;
  toPortIndex: number;
  color: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'REPAIR' | 'PURIFY' | 'EARN' | 'SALVAGE';
  costAp: number;
  costCredits: number;
  rewardDescription: string;
}

export interface Character {
    id: string;
    name: string;
    description: string;
    focus: string; // e.g. "Analog Warmth"
    deck: Module[]; // The pool of starter items
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface PlayerState {
  credits: number;
  ap: number;
  maxAp: number;
  day: number;
  week: number;
  reputation: number;
  deck: Module[];
  rackCapacity: number;
  quests: Quest[];
  upgrades: Record<string, number>; // Upgrade ID -> Level
  hasSeenIntro?: boolean;
  tutorialStep?: number; // 0-3: Scavenging, 4: Inspect Rack, 5: Done
  pendingStarterDeck?: Module[]; // Modules waiting to be scavenged in tutorial
  characterId?: string;
}

export interface StudioUpgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number; // Reputation cost
  maxLevel: number;
  effectDescription: (level: number) => string;
}

export type ViewState = 'HOME' | 'JOB' | 'SHOP' | 'BOSS' | 'CITY' | 'DECK' | 'QUESTS' | 'STUDIO' | 'PERFORMANCE' | 'CHARACTER_SELECT';

export interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: string;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  hp: number; // Wins required
  deckPool: Module[];
  description: string;
}
