
import { Module, ModuleType, Quest, PlayerState, Rarity, PatchResult, Cable, PortType } from '../types';

/**
 * SMART DRAW LOGIC
 * Tries to create a "Playable Hand" consisting of:
 * 1. A Source (VCO)
 * 2. A Modifier (Filter, LFO, Seq, Utility)
 * 3. An Output/Stage (VCA, Effect, Master)
 * 
 * If the deck doesn't support this structure, it falls back to random filling.
 */
export const drawCards = (deck: Module[], count: number): Module[] => {
  // Filter out EMPTY modules so they don't clog the hand
  const activeDeck = deck.filter(m => m.type !== ModuleType.EMPTY);
  
  if (activeDeck.length === 0) return [];
  
  // 1. Shuffle the active deck first
  const pool = [...activeDeck];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const hand: Module[] = [];
  const usedIds = new Set<string>();

  // Helper to find and extract a card of specific types
  const findAndTake = (types: ModuleType[]): boolean => {
      const idx = pool.findIndex(m => types.includes(m.type) && !usedIds.has(m.id));
      if (idx !== -1) {
          hand.push(pool[idx]);
          usedIds.add(pool[idx].id);
          return true;
      }
      return false;
  };

  // SLOT 1: THE SOURCE
  findAndTake([ModuleType.VCO]);

  // SLOT 2: THE MODIFIER
  if (hand.length < count) {
      findAndTake([ModuleType.FILTER, ModuleType.LFO, ModuleType.SEQ, ModuleType.UTILITY]);
  }

  // SLOT 3: THE OUTPUT / CHAIN
  if (hand.length < count) {
      findAndTake([ModuleType.VCA, ModuleType.EFFECT, ModuleType.MASTER]);
  }

  // FILLER
  let poolIndex = 0;
  while (hand.length < count && poolIndex < pool.length) {
      const candidate = pool[poolIndex];
      if (!usedIds.has(candidate.id)) {
          hand.push(candidate);
          usedIds.add(candidate.id);
      }
      poolIndex++;
  }

  for (let i = hand.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [hand[i], hand[j]] = [hand[j], hand[i]];
  }
  
  return hand;
};

export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

// --- SIMULATION ENGINE ---

interface NodeState {
    audioIn: number;
    cvIn: number;
    output: number;
}

export const calculatePatchSynergy = (cards: Module[], cables: Cable[] = [], cableLevel: number = 0): PatchResult => {
    // 1. Initialize State
    const nodeMap = new Map<string, NodeState>();
    cards.forEach(m => {
        nodeMap.set(m.id, { audioIn: 0, cvIn: 0, output: 0 });
    });

    // 2. Identify Architecture for Multipliers
    let hasVCO = false;
    let hasFilter = false;
    let hasVCA = false;
    let hasLFO = false;
    let hasClock = false;

    cards.forEach(m => {
        if (m.type === ModuleType.VCO) hasVCO = true;
        if (m.type === ModuleType.FILTER) hasFilter = true;
        if (m.type === ModuleType.VCA) hasVCA = true;
        if (m.type === ModuleType.LFO) hasLFO = true;
        if (m.type === ModuleType.SEQ || m.inputs.includes('GATE_IN')) hasClock = true;
    });

    // 3. Simulation Loop
    const ITERATIONS = 4;
    
    for (let step = 0; step < ITERATIONS; step++) {
        // A. Reset Inputs
        nodeMap.forEach(state => {
            state.audioIn = 0;
            state.cvIn = 0;
        });

        // B. Transfer Signals
        cables.forEach(cable => {
            const sourceState = nodeMap.get(cable.fromModuleId);
            const destState = nodeMap.get(cable.toModuleId);
            const destModule = cards.find(c => c.id === cable.toModuleId);
            
            if (sourceState && destState && destModule) {
                const inPortType = destModule.inputs[cable.toPortIndex];
                const signal = sourceState.output;

                if (inPortType?.includes('CV') || inPortType?.includes('GATE')) {
                    destState.cvIn += signal;
                } else {
                    destState.audioIn += signal;
                }
            }
        });

        // C. Process Modules
        cards.forEach(m => {
            const state = nodeMap.get(m.id)!;
            let nextOut = 0;

            const intrinsicPower = Math.max(0.5, m.value * 0.5); 

            switch (m.type) {
                case ModuleType.VCO:
                    nextOut = m.value; 
                    if (state.cvIn !== 0) {
                        nextOut += Math.abs(state.cvIn) * 0.8; 
                    }
                    if (state.audioIn !== 0) {
                        nextOut += Math.abs(state.audioIn) * 0.5;
                    }
                    break;

                case ModuleType.LFO:
                    nextOut = m.value;
                    if (state.cvIn !== 0) nextOut += Math.abs(state.cvIn) * 0.5;
                    break;

                case ModuleType.VCA:
                    if (state.cvIn > 0.1) {
                        nextOut = state.audioIn * (1 + (m.value * 0.3) + state.cvIn);
                    } else {
                        nextOut = state.audioIn * 0.5;
                    }
                    if (state.audioIn > 0) nextOut += m.value * 0.2;
                    break;

                case ModuleType.FILTER:
                    if (state.audioIn > 0) {
                        nextOut = state.audioIn + (m.value * 0.5); 
                        if (state.cvIn > 0) nextOut += state.cvIn; 
                    } else {
                        if (m.value >= 3) nextOut = 1.0;
                    }
                    break;

                case ModuleType.EFFECT:
                    if (state.audioIn > 0) {
                        nextOut = state.audioIn * 1.2 + m.value;
                    }
                    if (state.cvIn > 2) nextOut += 2;
                    break;
                
                case ModuleType.UTILITY:
                case ModuleType.SEQ:
                    nextOut = state.audioIn + state.cvIn + intrinsicPower;
                    break;

                case ModuleType.TRASH:
                    nextOut = 0.5; 
                    if (state.audioIn > 0) nextOut += state.audioIn * 0.2; 
                    break;

                case ModuleType.CURSE:
                    nextOut = -2;
                    if (state.audioIn > 0) nextOut -= state.audioIn * 0.5;
                    break;
                
                case ModuleType.EMPTY:
                    // Passive pass-through if connected, but otherwise 0
                    nextOut = state.audioIn;
                    break;

                default:
                    nextOut = state.audioIn + intrinsicPower;
            }

            if (nextOut > 20) nextOut = 20 + (nextOut - 20) * 0.1;
            
            state.output = nextOut;
        });
    }

    // 4. Scoring
    let totalVoltage = 0;
    const moduleActivity: Record<string, number> = {};

    const cableMultiplier = 0.5 + (cableLevel * 0.2);
    const cableBonus = cables.length * cableMultiplier;
    totalVoltage += cableBonus;

    cards.forEach(m => {
        const state = nodeMap.get(m.id)!;
        
        const activityRaw = Math.abs(state.output) + Math.abs(state.cvIn) + Math.abs(state.audioIn);
        moduleActivity[m.id] = Math.min(1, activityRaw / 5);

        let weight = 0.5; 
        if (m.type === ModuleType.VCO) weight = 1.0; 
        if (m.type === ModuleType.FILTER) weight = 1.2; 
        if (m.type === ModuleType.VCA) weight = 1.2; 
        if (m.type === ModuleType.EFFECT) weight = 1.5; 
        
        if (m.type === ModuleType.TRASH) weight = -0.5;
        if (m.type === ModuleType.CURSE) weight = -2.0;
        if (m.type === ModuleType.EMPTY) weight = 0; // Blanks don't score

        totalVoltage += state.output * weight;
    });

    // 5. Architecture Multipliers
    let multiplier = 1.0;
    let synergyName = "No Flow";
    let feedback = "Patch cables to generate voltage.";

    if (totalVoltage > 0) {
        synergyName = "Raw Signal";
        feedback = "Signal detected.";
    }

    if (hasVCO && hasFilter && hasVCA) {
        multiplier += 0.5;
        synergyName = "Classic Voice";
        feedback = "Subtractive synthesis architecture detected (+50%)";
    }
    else if (hasVCO && hasLFO) {
        multiplier += 0.3;
        synergyName = "Modulated Carrier";
        feedback = "LFO modulating oscillator (+30%)";
    }
    else if (hasVCO && !hasVCA && cards.some(m => m.type === ModuleType.EFFECT)) {
        multiplier += 0.4;
        synergyName = "Ambient Drone";
        feedback = "Oscillator feeding effects directly (+40%)";
    }
    else if (hasClock && (hasVCA || hasFilter)) {
        multiplier += 0.4;
        synergyName = "Rhythmic Pulse";
        feedback = "Sequenced modulation detected (+40%)";
    }

    totalVoltage *= multiplier;

    if (totalVoltage < 0) totalVoltage = 0;
    const finalScore = Math.floor(totalVoltage * 10) / 10;

    return { 
        totalOutput: finalScore, 
        baseScore: finalScore, 
        multiplier, 
        synergyName, 
        feedback, 
        isSilence: finalScore <= 0.5,
        moduleActivity
    };
};

export const generateDailyQuests = (state: PlayerState): Quest[] => {
    const quests: Quest[] = [];
    const hasTrash = state.deck.some(m => m.type === ModuleType.TRASH);
    const hasCurse = state.deck.some(m => m.type === ModuleType.CURSE);

    quests.push({
        id: generateId(),
        title: 'Street Performance',
        description: 'Play a quick set in the underpass for spare change.',
        type: 'EARN',
        costAp: 1,
        costCredits: 0,
        rewardDescription: 'Gain 25-40 Credits'
    });

    if (hasTrash) {
        quests.push({
            id: generateId(),
            title: 'Solder Monk Service',
            description: 'A wandering technician offers to fix a broken module.',
            type: 'REPAIR',
            costAp: 1,
            costCredits: 20,
            rewardDescription: 'Repair 1 Trash Module'
        });
        
        quests.push({
            id: generateId(),
            title: 'Scrap Dealer',
            description: 'Sell off your broken junk for parts.',
            type: 'SALVAGE',
            costAp: 1,
            costCredits: 0,
            rewardDescription: 'Remove 1 Trash, Gain 10cr'
        });
    }

    if (hasCurse) {
        quests.push({
            id: generateId(),
            title: 'Digital Exorcism',
            description: 'Visit the Cathedral to cleanse a haunted circuit.',
            type: 'PURIFY',
            costAp: 2,
            costCredits: 50,
            rewardDescription: 'Remove 1 Curse'
        });
    }

    return quests.sort(() => 0.5 - Math.random()).slice(0, 3);
};

export const generateShopInventory = (pool: Module[], count: number = 6): Module[] => {
    const inventory: Module[] = [];
    
    const vcos = pool.filter(m => m.type === ModuleType.VCO);
    if (vcos.length > 0) {
        const vco = vcos[Math.floor(Math.random() * vcos.length)];
        inventory.push({ ...vco, id: generateId() });
    }

    const outputModules = pool.filter(m => m.type === ModuleType.VCA || m.type === ModuleType.FILTER);
    if (outputModules.length > 0) {
        const mod = outputModules[Math.floor(Math.random() * outputModules.length)];
        inventory.push({ ...mod, id: generateId() });
    }

    const remainingCount = count - inventory.length;
    for (let i = 0; i < remainingCount; i++) {
        const roll = Math.random();
        let targetRarity = Rarity.COMMON;
        if (roll > 0.99) targetRarity = Rarity.MYTHIC;
        else if (roll > 0.95) targetRarity = Rarity.LEGENDARY;
        else if (roll > 0.80) targetRarity = Rarity.RARE;
        else if (roll > 0.50) targetRarity = Rarity.UNCOMMON;
        const eligible = pool.filter(m => m.rarity === targetRarity);
        const finalPool = eligible.length > 0 ? eligible : pool.filter(m => m.rarity === Rarity.COMMON);
        if (finalPool.length > 0) {
            const item = finalPool[Math.floor(Math.random() * finalPool.length)];
            inventory.push({ ...item, id: generateId() });
        }
    }
    
    return inventory.sort(() => 0.5 - Math.random());
};
