
import { Module, ModuleType, Rarity, Boss, StudioUpgrade, Character } from './types';

export const ROW_SIZE = 16; // Global constant for Rack Row Size

// --- STARTER CHARACTERS ---
export const CHARACTERS: Character[] = [
    {
        id: 'char_purist',
        name: 'The Purist',
        description: 'A traditionalist who believes in the warmth of voltage. Good balance of generation and shaping.',
        focus: 'Subtractive Synthesis',
        difficulty: 'EASY',
        deck: [
            { id: 'start_p_1', name: 'Solar Sine VCO', type: ModuleType.VCO, value: 3, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'A reliable, warm analog sine wave.', cost: 0, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_p_2', name: 'Pulse Driver', type: ModuleType.VCO, value: 2, rarity: Rarity.COMMON, manufacturer: 'Thunderclap', description: 'High-current oscillator.', cost: 0, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_p_3', name: 'Fusion Filter', type: ModuleType.FILTER, value: 2, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'Classic 4-pole lowpass.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_p_4', name: 'Ghost Gate VCA', type: ModuleType.VCA, value: 2, rarity: Rarity.COMMON, manufacturer: 'Generic', description: 'Standard amplifier.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_p_5', name: 'Ember ADSR', type: ModuleType.UTILITY, value: 2, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'Snappy envelope.', cost: 0, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
            { id: 'start_p_6', name: 'Needle Mixer', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Generic', description: '2-channel mixer.', cost: 0, inputs: ['AUDIO_IN', 'AUDIO_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'trash_hum', name: '60Hz Hum', type: ModuleType.TRASH, value: 0, rarity: Rarity.COMMON, manufacturer: 'Bad Wiring', description: 'Ground loop issue.', cost: 0, inputs: ['AUDIO_IN'], outputs: ['AUDIO_OUT'] },
        ]
    },
    {
        id: 'char_glitcher',
        name: 'The Glitcher',
        description: 'Thrives on error and noise. High risk, high chaos.',
        focus: 'Digital Chaos',
        difficulty: 'HARD',
        deck: [
            { id: 'start_g_1', name: 'Dust Engine', type: ModuleType.VCO, value: 2, rarity: Rarity.COMMON, manufacturer: 'Ancient Circuitry', description: 'Generates gritty digital noise.', cost: 0, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_g_2', name: 'Binary Pulse', type: ModuleType.VCO, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Precise digital oscillation.', cost: 0, inputs: ['CV_IN'], outputs: ['AUDIO_OUT', 'CV_OUT'] },
            { id: 'start_g_3', name: 'Biscuit Bitcrusher', type: ModuleType.EFFECT, value: 2, rarity: Rarity.COMMON, manufacturer: 'Analog Granny', description: 'Sample rate reducer.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_g_4', name: 'Logic Farmer', type: ModuleType.UTILITY, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Generic', description: 'AND/OR logic gates.', cost: 0, inputs: ['GATE_IN', 'GATE_IN'], outputs: ['GATE_OUT'] },
            { id: 'start_g_5', name: 'Broken Jack', type: ModuleType.TRASH, value: 0, rarity: Rarity.COMMON, manufacturer: 'Unknown', description: 'No signal passes.', cost: 0, inputs: ['AUDIO_IN'], outputs: [] },
            { id: 'start_g_6', name: 'Bad Cable', type: ModuleType.TRASH, value: 0, rarity: Rarity.COMMON, manufacturer: 'Bulk', description: 'Intermittent signal.', cost: 0, inputs: ['AUDIO_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_g_7', name: 'Random Source', type: ModuleType.LFO, value: 2, rarity: Rarity.COMMON, manufacturer: 'Generic', description: 'Stepped random voltage.', cost: 0, inputs: ['GATE_IN'], outputs: ['CV_OUT'] }
        ]
    },
    {
        id: 'char_weaver',
        name: 'The Weaver',
        description: 'Prefers long, evolving textures over rigid beats.',
        focus: 'Ambient Drone',
        difficulty: 'MEDIUM',
        deck: [
            { id: 'start_w_1', name: 'Solar Sine VCO', type: ModuleType.VCO, value: 2, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'Pure analog sine.', cost: 0, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_w_2', name: 'Glow Reverb', type: ModuleType.EFFECT, value: 3, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'Simple plate reverb.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_w_3', name: 'Void Delay', type: ModuleType.EFFECT, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Dark digital delay.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'start_w_4', name: 'Orbit Modulator', type: ModuleType.LFO, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Slow gravitational LFO.', cost: 0, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
            { id: 'start_w_5', name: 'Needle Mixer', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Generic', description: '2-channel mixer.', cost: 0, inputs: ['AUDIO_IN', 'AUDIO_IN'], outputs: ['AUDIO_OUT'] },
            { id: 'trash_knob', name: 'Missing Knob', type: ModuleType.TRASH, value: 0, rarity: Rarity.COMMON, manufacturer: 'Unknown', description: 'Hard to turn.', cost: 0, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
        ]
    }
];

// Fallback for types not using the new system yet
export const INITIAL_DECK = CHARACTERS[0].deck;

export const BLANK_MODULE: Module = {
    id: 'blank_panel',
    name: 'Blank Panel',
    type: ModuleType.EMPTY,
    value: 0,
    rarity: Rarity.COMMON,
    manufacturer: 'Standard',
    description: 'A metal plate used to fill empty rack space. Creates silence in the sequence.',
    cost: 5,
    inputs: [],
    outputs: []
};

// ... (Rest of file unchanged) ...
// --- TRASH & CURSES ---
export const TRASH_ITEMS: Module[] = [
    { id: 'trash_hum', name: '60Hz Hum', type: ModuleType.TRASH, value: 0, rarity: Rarity.COMMON, manufacturer: 'Bad Wiring', description: 'Ground loop issue that won\'t go away.', cost: 0, inputs: ['AUDIO_IN'], outputs: ['AUDIO_OUT'] },
    { id: 'trash_cable', name: 'Bad Cable', type: ModuleType.TRASH, value: 0, rarity: Rarity.COMMON, manufacturer: 'China (Bulk)', description: 'Intermittent signal. Needs wiggling.', cost: 0, inputs: ['AUDIO_IN'], outputs: ['AUDIO_OUT'] },
    { id: 'trash_knob', name: 'Missing Knob', type: ModuleType.TRASH, value: 0, rarity: Rarity.COMMON, manufacturer: 'Unknown', description: 'Potentiometer shaft is too sharp to turn.', cost: 0, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
];

export const CURSE_ITEMS: Module[] = [
    { id: 'curse_void', name: 'Void Patch', type: ModuleType.CURSE, value: -2, rarity: Rarity.CURSED, manufacturer: 'The Abyss', description: 'Sucks sound away into nothingness.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: [] },
    { id: 'curse_short', name: 'Short Circuit', type: ModuleType.CURSE, value: -5, rarity: Rarity.CURSED, manufacturer: 'Entropy', description: 'Dangerous voltage spike.', cost: 0, inputs: ['AUDIO_IN'], outputs: ['AUDIO_OUT'] },
    { id: 'curse_whisper', name: 'Eldritch Whisper', type: ModuleType.CURSE, value: -3, rarity: Rarity.CURSED, manufacturer: 'Unknown', description: 'Mumbles things you shouldn\'t hear.', cost: 0, inputs: ['AUDIO_IN'], outputs: ['AUDIO_OUT'] },
];

// --- STUDIO UPGRADES ---
export const STUDIO_UPGRADES: StudioUpgrade[] = [
    {
        id: 'compressor',
        name: 'Master Compressor',
        description: 'Install high-end tube compression in the master bus for louder, punchier mixes.',
        baseCost: 3, // Reputation
        maxLevel: 5,
        effectDescription: (l) => `+${l * 10}% Master Gain`
    },
    {
        id: 'cables',
        name: 'Gold-Plated Cables',
        description: 'Replace standard patch cables with low-impedance gold connectors.',
        baseCost: 5, // Reputation
        maxLevel: 3,
        effectDescription: (l) => `+${(l * 0.2).toFixed(1)}v per Cable Synergy`
    },
    {
        id: 'rack_space',
        name: 'Rack Expansion',
        description: 'Install wider rails to fit more modules.',
        baseCost: 8, // Reputation
        maxLevel: 5,
        effectDescription: (l) => `+${l * 2} HP Capacity`
    }
];

// --- MASTER MODULE POOL ---
export const MASTER_POOL: Module[] = [
  // DUCKERS (New Category)
  { id: 'duck_001', name: 'Kick-Safe Ducker', type: ModuleType.DUCKER, value: 2, rarity: Rarity.COMMON, manufacturer: 'Thunderclap Systems', description: 'Basic sidechain pump when kicks hit.', cost: 60, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
  { id: 'duck_002', name: 'Vacuum Pump', type: ModuleType.DUCKER, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Vaporvale Laboratories', description: 'Heavy suction compression.', cost: 110, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
  { id: 'duck_003', name: 'Abyss Swallow', type: ModuleType.DUCKER, value: 5, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Consumes all sound on the beat.', cost: 250, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },

  // OSCILLATORS (VCO)
  { id: 'vco_001', name: 'Solar Sine', type: ModuleType.VCO, value: 2, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'Pure analog sine wave.', cost: 50, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vco_002', name: 'Gramps’ Saw', type: ModuleType.VCO, value: 2, rarity: Rarity.COMMON, manufacturer: 'Analog Granny Industries', description: 'Buzzing saw wave with vintage drift.', cost: 55, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vco_003', name: 'Pulse Driver', type: ModuleType.VCO, value: 2, rarity: Rarity.COMMON, manufacturer: 'Thunderclap Systems', description: 'High-current oscillator with aggressive pulse.', cost: 60, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vco_004', name: 'Twin Ember VCO', type: ModuleType.VCO, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Luminous Forge', description: 'Dual oscillator for detuned warmth.', cost: 120, inputs: ['CV_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vco_005', name: 'Binary Pulse Engine', type: ModuleType.VCO, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Precise digital oscillation source.', cost: 140, inputs: ['CV_IN'], outputs: ['AUDIO_OUT', 'CV_OUT'] },
  { id: 'vco_006', name: 'Vaporline FM Source', type: ModuleType.VCO, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Vaporvale Laboratories', description: 'Glassy FM tones.', cost: 150, inputs: ['CV_IN', 'AUDIO_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vco_007', name: 'Oracle Wavetable', type: ModuleType.VCO, value: 5, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Predicts the voltage you need.', cost: 300, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vco_008', name: 'Crystal Drone Generator', type: ModuleType.VCO, value: 5, rarity: Rarity.RARE, manufacturer: 'Starlit Machines', description: 'Sustained harmonic textures.', cost: 320, inputs: ['CV_IN'], outputs: ['AUDIO_OUT', 'AUDIO_OUT'] },
  { id: 'vco_009', name: 'Fossil Resonator', type: ModuleType.VCO, value: 4, rarity: Rarity.RARE, manufacturer: 'Analog Granny Industries', description: 'Ancient acoustic modeling.', cost: 280, inputs: ['CV_IN', 'AUDIO_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vco_010', name: 'Relic Harmonic Core', type: ModuleType.VCO, value: 8, rarity: Rarity.LEGENDARY, manufacturer: 'Ancient Circuitry Guild', description: 'Generates sound from lost eras.', cost: 800, inputs: ['CV_IN'], outputs: ['AUDIO_OUT', 'CV_OUT'] },

  // FILTERS (VCF)
  { id: 'vcf_001', name: 'Fusion Ladder Filter', type: ModuleType.FILTER, value: 2, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'Creamy 4-pole lowpass filter.', cost: 60, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vcf_002', name: 'Fog SEM Filter', type: ModuleType.FILTER, value: 2, rarity: Rarity.COMMON, manufacturer: 'Thunderclap Systems', description: 'Variable state filter, thick and hazy.', cost: 65, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vcf_003', name: 'Grandma’s Notch Carver', type: ModuleType.FILTER, value: 2, rarity: Rarity.COMMON, manufacturer: 'Analog Granny Industries', description: 'Passive notch filter for sculpting.', cost: 50, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vcf_004', name: 'Thunderfold VCF', type: ModuleType.FILTER, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Thunderclap Systems', description: 'Wavefolding filter.', cost: 130, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vcf_005', name: 'Orbit Shaper VCF', type: ModuleType.FILTER, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Morphing filter topology.', cost: 140, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vcf_006', name: 'Solar Crest Bandpass', type: ModuleType.FILTER, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Luminous Forge', description: 'Resonant bandpass for vocal tones.', cost: 125, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vcf_007', name: 'Relic Low-Pass Gate', type: ModuleType.FILTER, value: 5, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Organic, plucky low-pass gate.', cost: 280, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vcf_008', name: 'Grainwind Triple Filter', type: ModuleType.FILTER, value: 5, rarity: Rarity.RARE, manufacturer: 'Vaporvale Laboratories', description: 'Three filters in parallel.', cost: 310, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vcf_009', name: 'Ruins Dual Ladder', type: ModuleType.FILTER, value: 5, rarity: Rarity.RARE, manufacturer: 'Starlit Machines', description: 'Stereo ladder filter.', cost: 350, inputs: ['AUDIO_IN', 'AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT', 'AUDIO_OUT'] },
  { id: 'vcf_010', name: 'Stasis Resonant Well', type: ModuleType.FILTER, value: 7, rarity: Rarity.LEGENDARY, manufacturer: 'Ancient Circuitry Guild', description: 'Self-oscillating infinity filter.', cost: 900, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT', 'CV_OUT'] },

  // LFOs / MODULATION
  { id: 'lfo_001', name: 'Grandpa’s Drift LFO', type: ModuleType.LFO, value: 1, rarity: Rarity.COMMON, manufacturer: 'Analog Granny Industries', description: 'Slow, unpredictable wandering voltage.', cost: 40, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
  { id: 'lfo_002', name: 'Electric Meadow LFO', type: ModuleType.LFO, value: 1, rarity: Rarity.COMMON, manufacturer: 'Thunderclap Systems', description: 'Self-generating nature modulation.', cost: 45, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
  { id: 'lfo_003', name: 'Orbit Modulator', type: ModuleType.LFO, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Planetary gravitational LFO.', cost: 100, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
  { id: 'lfo_004', name: 'Fluctuation Engine', type: ModuleType.LFO, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Vaporvale Laboratories', description: 'Random voltage source.', cost: 110, inputs: ['CV_IN'], outputs: ['CV_OUT', 'GATE_OUT'] },
  { id: 'lfo_005', name: 'Pulse Wander LFO', type: ModuleType.LFO, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Thunderclap Systems', description: 'Stepped random voltages.', cost: 95, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'lfo_006', name: 'Binary Sync LFO', type: ModuleType.LFO, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Tempo-synced digital LFO.', cost: 105, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'lfo_007', name: 'Ember Curve Shaper', type: ModuleType.LFO, value: 4, rarity: Rarity.RARE, manufacturer: 'Luminous Forge', description: 'Customizable modulation shapes.', cost: 250, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
  { id: 'lfo_008', name: 'Ancient Chaotic Map', type: ModuleType.LFO, value: 4, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Deterministic chaos generator.', cost: 275, inputs: ['CV_IN'], outputs: ['CV_OUT', 'CV_OUT'] },
  { id: 'lfo_009', name: 'Shattered Wave Modulator', type: ModuleType.LFO, value: 6, rarity: Rarity.LEGENDARY, manufacturer: 'Vaporvale Laboratories', description: 'Breaks LFOs into tiny shards.', cost: 750, inputs: ['CV_IN'], outputs: ['CV_OUT', 'GATE_OUT'] },

  // ENVELOPES (UTILITY)
  { id: 'env_001', name: 'Ember ADSR', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'Classic 4-stage envelope.', cost: 40, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'env_002', name: 'Thunderstrike ENV', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Thunderclap Systems', description: 'Fast attack percussion envelope.', cost: 45, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'env_003', name: 'Elder Bark ADSR', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Analog Granny Industries', description: 'Wooden, organic decay.', cost: 35, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'env_004', name: 'Rustleaf Function Duo', type: ModuleType.UTILITY, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Analog Granny Industries', description: 'Dual function generator.', cost: 90, inputs: ['GATE_IN', 'CV_IN'], outputs: ['CV_OUT', 'GATE_OUT'] },
  { id: 'env_005', name: 'Moonrise Decay Engine', type: ModuleType.UTILITY, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Long, lunar decay times.', cost: 95, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'env_006', name: 'Scripted Response Generator', type: ModuleType.UTILITY, value: 3, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Complex multistage envelope.', cost: 220, inputs: ['GATE_IN', 'CV_IN'], outputs: ['CV_OUT'] },
  { id: 'env_007', name: 'Vaportrail Envelope', type: ModuleType.UTILITY, value: 3, rarity: Rarity.RARE, manufacturer: 'Vaporvale Laboratories', description: 'Envelope with reverb-like release.', cost: 240, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'env_008', name: 'Solar Bloom Generator', type: ModuleType.UTILITY, value: 3, rarity: Rarity.RARE, manufacturer: 'Luminous Forge', description: 'Expanding envelope curves.', cost: 230, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'env_009', name: 'Quantum Peak Shaper', type: ModuleType.UTILITY, value: 5, rarity: Rarity.LEGENDARY, manufacturer: 'Starlit Machines', description: 'Probability-based envelopes.', cost: 600, inputs: ['GATE_IN', 'CV_IN'], outputs: ['CV_OUT'] },
  { id: 'env_010', name: 'Relic Erosion Envelope', type: ModuleType.UTILITY, value: 5, rarity: Rarity.LEGENDARY, manufacturer: 'Ancient Circuitry Guild', description: 'Envelopes that degrade over time.', cost: 650, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },

  // VCAs
  { id: 'vca_001', name: 'Ghost Gate VCA', type: ModuleType.VCA, value: 1, rarity: Rarity.COMMON, manufacturer: 'Generic', description: 'Basic VCA.', cost: 30, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vca_002', name: 'Thunderhold VCA', type: ModuleType.VCA, value: 1, rarity: Rarity.COMMON, manufacturer: 'Thunderclap Systems', description: 'VCA with integrated drive.', cost: 40, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vca_003', name: 'Binary Clamp', type: ModuleType.VCA, value: 1, rarity: Rarity.COMMON, manufacturer: 'Starlit Machines', description: 'Digital logic VCA.', cost: 45, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vca_004', name: 'Echo-Leaf Attenuator', type: ModuleType.VCA, value: 1, rarity: Rarity.COMMON, manufacturer: 'Vaporvale Laboratories', description: 'Passive attenuation.', cost: 25, inputs: ['AUDIO_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vca_005', name: 'Rusted VCA', type: ModuleType.VCA, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Analog Granny Industries', description: 'Adds harmonic distortion.', cost: 85, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vca_006', name: 'Solar Bloom VCA', type: ModuleType.VCA, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Luminous Forge', description: 'VCA with soft clipping.', cost: 95, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vca_007', name: 'Flare Matrix VCA', type: ModuleType.VCA, value: 3, rarity: Rarity.RARE, manufacturer: 'Vaporvale Laboratories', description: '4x4 Mixing VCA.', cost: 210, inputs: ['AUDIO_IN', 'AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vca_008', name: 'Relic Sustain Cell', type: ModuleType.VCA, value: 3, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Infinite sustain VCA.', cost: 250, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vca_009', name: 'Grandma’s Gatekeeper', type: ModuleType.VCA, value: 3, rarity: Rarity.RARE, manufacturer: 'Analog Granny Industries', description: 'Opto-isolator VCA.', cost: 230, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'vca_010', name: 'Crystal Vein Amplifier', type: ModuleType.VCA, value: 3, rarity: Rarity.RARE, manufacturer: 'Starlit Machines', description: 'Transparent digital gain.', cost: 240, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },

  // NOISE / RANDOM (VCO Type for Noise)
  { id: 'noi_001', name: 'Dust Engine', type: ModuleType.VCO, value: 1, rarity: Rarity.COMMON, manufacturer: 'Ancient Circuitry Guild', description: 'Digital dust noise.', cost: 35, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'noi_002', name: 'Quantum Sprinkle', type: ModuleType.LFO, value: 1, rarity: Rarity.COMMON, manufacturer: 'Vaporvale Laboratories', description: 'Random granular triggers.', cost: 40, inputs: ['GATE_IN'], outputs: ['GATE_OUT', 'CV_OUT'] },
  { id: 'noi_003', name: 'Static Orchard', type: ModuleType.VCO, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Analog Granny Industries', description: 'Radio interference noise.', cost: 80, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'noi_004', name: 'Binary Snowfall', type: ModuleType.VCO, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Shift-register noise.', cost: 90, inputs: ['GATE_IN'], outputs: ['AUDIO_OUT', 'CV_OUT'] },
  { id: 'noi_005', name: 'Solar Wind Noise', type: ModuleType.VCO, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Luminous Forge', description: 'Filtered white noise.', cost: 85, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'noi_006', name: 'Thundergrain Burst', type: ModuleType.LFO, value: 3, rarity: Rarity.RARE, manufacturer: 'Thunderclap Systems', description: 'Burst generator.', cost: 200, inputs: ['GATE_IN'], outputs: ['GATE_OUT'] },
  { id: 'noi_007', name: 'Relic Ash Generator', type: ModuleType.VCO, value: 3, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Lo-fi textural noise.', cost: 220, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'noi_008', name: 'Fluctis Stream', type: ModuleType.LFO, value: 3, rarity: Rarity.RARE, manufacturer: 'Vaporvale Laboratories', description: 'River-like random voltages.', cost: 240, inputs: ['CV_IN'], outputs: ['CV_OUT'] },
  { id: 'noi_009', name: 'Chaotic Oracle', type: ModuleType.LFO, value: 6, rarity: Rarity.LEGENDARY, manufacturer: 'Ancient Circuitry Guild', description: 'Predicts future random states.', cost: 800, inputs: ['CV_IN'], outputs: ['CV_OUT', 'GATE_OUT'] },

  // EFFECTS
  { id: 'eff_001', name: 'Glow Reverb', type: ModuleType.EFFECT, value: 2, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'Simple plate reverb.', cost: 70, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_002', name: 'Biscuit Bitcrusher', type: ModuleType.EFFECT, value: 2, rarity: Rarity.COMMON, manufacturer: 'Analog Granny Industries', description: 'Sample rate reducer.', cost: 65, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_003', name: 'Void Delay', type: ModuleType.EFFECT, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Dark digital delay.', cost: 150, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_004', name: 'Diffuse Echo', type: ModuleType.EFFECT, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Vaporvale Laboratories', description: 'Smeared tape delay.', cost: 160, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_005', name: 'Cloudform Diffuser', type: ModuleType.EFFECT, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Vaporvale Laboratories', description: 'Texture cloud generator.', cost: 170, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_006', name: 'Solar Prism Chorus', type: ModuleType.EFFECT, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Luminous Forge', description: 'Stereo widener.', cost: 140, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_007', name: 'Thunderflare Overdrive', type: ModuleType.EFFECT, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Thunderclap Systems', description: 'Aggressive saturation.', cost: 130, inputs: ['AUDIO_IN', 'AUDIO_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_008', name: 'Pebble Granulator', type: ModuleType.EFFECT, value: 4, rarity: Rarity.RARE, manufacturer: 'Vaporvale Laboratories', description: 'Micro-sampling engine.', cost: 350, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_009', name: 'Echo of Ruins', type: ModuleType.EFFECT, value: 4, rarity: Rarity.RARE, manufacturer: 'Thunderclap Systems', description: 'Broken tape echo.', cost: 320, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_010', name: 'Resonant Shard Saturator', type: ModuleType.EFFECT, value: 4, rarity: Rarity.RARE, manufacturer: 'Luminous Forge', description: 'Resonant distortion.', cost: 300, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_011', name: 'Spectral Grove Splitter', type: ModuleType.EFFECT, value: 4, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Spectral band processing.', cost: 380, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT', 'AUDIO_OUT'] },
  { id: 'eff_012', name: 'Void Bloom Reverb', type: ModuleType.EFFECT, value: 4, rarity: Rarity.RARE, manufacturer: 'Starlit Machines', description: 'Infinite space generator.', cost: 360, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_013', name: 'Grainstorm Cascade', type: ModuleType.EFFECT, value: 7, rarity: Rarity.LEGENDARY, manufacturer: 'Starlit Machines', description: 'Massive granular cloud.', cost: 1200, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'eff_014', name: 'Elder Tape Ghost', type: ModuleType.EFFECT, value: 7, rarity: Rarity.LEGENDARY, manufacturer: 'Analog Granny Industries', description: 'Haunted tape loop.', cost: 1100, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT', 'CV_OUT'] },

  // SEQUENCERS
  { id: 'seq_001', name: 'Scribe Sequencer', type: ModuleType.SEQ, value: 1, rarity: Rarity.COMMON, manufacturer: 'Ancient Circuitry Guild', description: 'Simple 8-step sequencer.', cost: 50, inputs: ['GATE_IN'], outputs: ['CV_OUT', 'GATE_OUT'] },
  { id: 'seq_002', name: 'Thunderclock Driver', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Thunderclap Systems', description: 'Master clock source.', cost: 40, inputs: ['CV_IN'], outputs: ['GATE_OUT', 'GATE_OUT'] },
  { id: 'seq_003', name: 'Clockwork Stepper', type: ModuleType.SEQ, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Generic', description: 'Mechanical trigger sequencer.', cost: 110, inputs: ['GATE_IN'], outputs: ['GATE_OUT', 'GATE_OUT'] },
  { id: 'seq_004', name: 'Binary Stepper', type: ModuleType.SEQ, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Bit-flipping sequencer.', cost: 120, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'seq_005', name: 'Driftline Euclid', type: ModuleType.SEQ, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Analog Granny Industries', description: 'Euclidean rhythm generator.', cost: 130, inputs: ['GATE_IN'], outputs: ['GATE_OUT'] },
  { id: 'seq_006', name: 'Solar Path Sequencer', type: ModuleType.SEQ, value: 3, rarity: Rarity.RARE, manufacturer: 'Luminous Forge', description: 'Light-guided sequencing.', cost: 280, inputs: ['GATE_IN', 'CV_IN'], outputs: ['CV_OUT', 'GATE_OUT'] },
  { id: 'seq_007', name: 'Grainwheel Rotator', type: ModuleType.SEQ, value: 3, rarity: Rarity.RARE, manufacturer: 'Vaporvale Laboratories', description: 'Granular position sequencer.', cost: 300, inputs: ['GATE_IN'], outputs: ['CV_OUT'] },
  { id: 'seq_008', name: 'Lunar Pulse Divider', type: ModuleType.UTILITY, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Clock divider/multiplier.', cost: 100, inputs: ['GATE_IN'], outputs: ['GATE_OUT'] },
  { id: 'seq_009', name: 'Oracle Timeline', type: ModuleType.SEQ, value: 6, rarity: Rarity.LEGENDARY, manufacturer: 'Ancient Circuitry Guild', description: 'Non-linear time sequencer.', cost: 950, inputs: ['GATE_IN'], outputs: ['CV_OUT', 'GATE_OUT'] },

  // UTILITIES / MIXERS
  { id: 'util_001', name: 'Needle Mixer', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Generic', description: '2-channel mixer.', cost: 30, inputs: ['AUDIO_IN', 'AUDIO_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'util_002', name: 'Moonphase Mixer', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Starlit Machines', description: 'Stereo panning mixer.', cost: 45, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'util_003', name: 'Grandma’s Patch Shelf', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Analog Granny Industries', description: 'Passive mult and attenuator.', cost: 35, inputs: ['AUDIO_IN'], outputs: ['AUDIO_OUT', 'AUDIO_OUT'] },
  { id: 'util_004', name: 'Solar Quad Attenuator', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Luminous Forge', description: 'Active attenuation.', cost: 50, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'util_005', name: 'Thunderclap Mult', type: ModuleType.UTILITY, value: 1, rarity: Rarity.COMMON, manufacturer: 'Thunderclap Systems', description: 'Signal splitter.', cost: 25, inputs: ['AUDIO_IN'], outputs: ['AUDIO_OUT', 'AUDIO_OUT'] },
  { id: 'util_006', name: 'Logic Farmer', type: ModuleType.UTILITY, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Generic', description: 'AND/OR/XOR logic gates.', cost: 90, inputs: ['GATE_IN', 'GATE_IN'], outputs: ['GATE_OUT'] },
  { id: 'util_007', name: 'Stormlogic Gate', type: ModuleType.UTILITY, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Thunderclap Systems', description: 'Probability logic.', cost: 110, inputs: ['GATE_IN'], outputs: ['GATE_OUT'] },
  { id: 'util_008', name: 'Vapor Flux Switch', type: ModuleType.UTILITY, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Vaporvale Laboratories', description: 'Sequential switch.', cost: 100, inputs: ['AUDIO_IN', 'AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'util_009', name: 'Elder Chain Mixer', type: ModuleType.UTILITY, value: 2, rarity: Rarity.UNCOMMON, manufacturer: 'Analog Granny Industries', description: 'Daisy-chain mixer.', cost: 95, inputs: ['AUDIO_IN', 'AUDIO_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'util_010', name: 'Relic Router', type: ModuleType.UTILITY, value: 4, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Matrix signal router.', cost: 260, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'util_011', name: 'Cloudform Mod Matrix', type: ModuleType.UTILITY, value: 4, rarity: Rarity.RARE, manufacturer: 'Vaporvale Laboratories', description: 'Floating modulation points.', cost: 280, inputs: ['CV_IN', 'CV_IN'], outputs: ['CV_OUT'] },
  { id: 'util_012', name: 'Crystal Linker', type: ModuleType.UTILITY, value: 4, rarity: Rarity.RARE, manufacturer: 'Starlit Machines', description: 'Optical signal distribution.', cost: 270, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT', 'CV_OUT'] },
  { id: 'util_013', name: 'Luminous Orbit Link', type: ModuleType.UTILITY, value: 4, rarity: Rarity.RARE, manufacturer: 'Luminous Forge', description: 'Rotating signal path.', cost: 290, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT'] },
  { id: 'util_014', name: 'Rune Divider', type: ModuleType.UTILITY, value: 4, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Divides voltage by runes.', cost: 300, inputs: ['CV_IN'], outputs: ['CV_OUT', 'CV_OUT'] },
];

// --- SCRAP POOL (High Trash/Curse rate, low Treasure) ---
export const SCRAP_POOL: Module[] = [
    ...TRASH_ITEMS,
    ...TRASH_ITEMS,
    ...TRASH_ITEMS,
    ...CURSE_ITEMS,
    ...CURSE_ITEMS,
    ...MASTER_POOL.filter(m => m.rarity === Rarity.COMMON),
    // One lucky item
    ...MASTER_POOL.filter(m => m.rarity === Rarity.RARE).slice(0, 1)
];

export const BOSSES: Boss[] = [
  {
    id: 'boss_1',
    name: 'Disco Titan',
    title: 'The Moroder Engine',
    hp: 3,
    description: 'A colossal machine pumping out 120BPM basslines.',
    deckPool: [
      { id: 'b1_1', name: 'Pulse Driver', type: ModuleType.VCO, value: 4, rarity: Rarity.RARE, manufacturer: 'Thunderclap Systems', description: 'Relentless bass pulse.', cost: 0, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
      { id: 'b1_2', name: 'Thunderfold VCF', type: ModuleType.FILTER, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Thunderclap Systems', description: 'Harmonic growl.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
      { id: 'b1_3', name: 'Clockwork Stepper', type: ModuleType.SEQ, value: 2, rarity: Rarity.COMMON, manufacturer: 'Generic', description: 'Four-on-the-floor trigger.', cost: 0, inputs: ['GATE_IN'], outputs: ['GATE_OUT'] },
      { id: 'b1_4', name: 'Glitter Delay', type: ModuleType.EFFECT, value: 5, rarity: Rarity.LEGENDARY, manufacturer: 'Boss Special', description: 'Blinding repeats.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] }
    ]
  },
  {
    id: 'boss_2',
    name: 'Stadium Prophet',
    title: 'Keeper of the Anthem',
    hp: 4,
    description: 'Floaty pads and massive leads that fill arenas.',
    deckPool: [
      { id: 'b2_1', name: 'Oracle Wavetable', type: ModuleType.VCO, value: 5, rarity: Rarity.RARE, manufacturer: 'Ancient Circuitry Guild', description: 'Prophetic lead tone.', cost: 0, inputs: ['CV_IN'], outputs: ['AUDIO_OUT'] },
      { id: 'b2_2', name: 'Moonphase Mixer', type: ModuleType.UTILITY, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Starlit Machines', description: 'Stereo width enhancer.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
      { id: 'b2_3', name: 'Cathedral BBD', type: ModuleType.EFFECT, value: 6, rarity: Rarity.LEGENDARY, manufacturer: 'Boss Special', description: 'Infinite reverb tail.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
      { id: 'b2_4', name: 'Grandpa’s Drift LFO', type: ModuleType.LFO, value: 4, rarity: Rarity.RARE, manufacturer: 'Analog Granny Industries', description: 'Upgraded drift circuit.', cost: 0, inputs: ['CV_IN'], outputs: ['CV_OUT'] }
    ]
  },
  {
    id: 'boss_3',
    name: 'Gospel MPC Guy',
    title: 'Finger Drummer Deity',
    hp: 5,
    description: 'His timing is impeccable. His samples are divine.',
    deckPool: [
      { id: 'b3_1', name: 'Pebble Granulator', type: ModuleType.EFFECT, value: 4, rarity: Rarity.RARE, manufacturer: 'Vaporvale Laboratories', description: 'Glitchy textures.', cost: 0, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT'] },
      { id: 'b3_2', name: 'Rhythm Scratcher', type: ModuleType.SEQ, value: 7, rarity: Rarity.LEGENDARY, manufacturer: 'Boss Special', description: 'Impossible polyrhythms.', cost: 0, inputs: ['GATE_IN'], outputs: ['GATE_OUT'] },
      { id: 'b3_3', name: 'Logic Farmer', type: ModuleType.UTILITY, value: 3, rarity: Rarity.UNCOMMON, manufacturer: 'Generic', description: 'Harvests triggers.', cost: 0, inputs: ['GATE_IN', 'GATE_IN'], outputs: ['GATE_OUT'] },
      { id: 'b3_4', name: 'Void Echo', type: ModuleType.EFFECT, value: 5, rarity: Rarity.RARE, manufacturer: 'Boss Special', description: 'Abyssal delay lines.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] }
    ]
  },
  {
    id: 'boss_final',
    name: 'The Voltage Tyrant',
    title: 'Ruler of DC',
    hp: 7,
    description: 'A sentient modular wall that consumed its creator.',
    deckPool: [
        { id: 'bf_1', name: 'Relic Harmonic Core', type: ModuleType.VCO, value: 10, rarity: Rarity.LEGENDARY, manufacturer: 'Ancient Circuitry Guild', description: 'Perfect oscillation.', cost: 0, inputs: ['CV_IN'], outputs: ['AUDIO_OUT', 'CV_OUT'] },
        { id: 'bf_2', name: 'Stasis Resonant Well', type: ModuleType.FILTER, value: 8, rarity: Rarity.LEGENDARY, manufacturer: 'Ancient Circuitry Guild', description: 'Unstable gravity well.', cost: 0, inputs: ['AUDIO_IN', 'CV_IN'], outputs: ['AUDIO_OUT'] },
        { id: 'bf_3', name: 'Chaotic Oracle', type: ModuleType.LFO, value: 8, rarity: Rarity.LEGENDARY, manufacturer: 'Ancient Circuitry Guild', description: 'Pure chaos.', cost: 0, inputs: ['CV_IN'], outputs: ['CV_OUT', 'GATE_OUT'] },
        { id: 'bf_4', name: 'Grainstorm Cascade', type: ModuleType.EFFECT, value: 9, rarity: Rarity.LEGENDARY, manufacturer: 'Starlit Machines', description: 'Reality shredder.', cost: 0, inputs: ['AUDIO_IN', 'GATE_IN'], outputs: ['AUDIO_OUT'] }
    ]
  }
];
