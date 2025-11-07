import type { WeightKey } from './weights';

export type PresetId = 'gold_orogenic' | 'copper_porphyry' | 'lithium_pegmatite';

export interface PresetDefinition {
  id: PresetId;
  name: string;
  description: string;
  weights: Record<WeightKey, number>;
}

export const presetCatalog: PresetDefinition[] = [
  {
    id: 'gold_orogenic',
    name: 'Gold (Orogenic)',
    description:
      'Favors high structural intensity, moderate ferric response, and gold-pathfinder geochemistry.',
    weights: {
      deposit_proximity: 4,
      fault_density: 5,
      lithology_match: 4,
      geochem_score: 5,
      ferric_index: 3,
      clay_index: 1,
      aloh_index: 2,
      slope_score: 2
    }
  },
  {
    id: 'copper_porphyry',
    name: 'Copper (Porphyry)',
    description:
      'Boosts clay alteration, ferric index, and intrusive lithology with proximal structures.',
    weights: {
      deposit_proximity: 3,
      fault_density: 4,
      lithology_match: 4,
      geochem_score: 4,
      ferric_index: 4,
      clay_index: 5,
      aloh_index: 3,
      slope_score: 2
    }
  },
  {
    id: 'lithium_pegmatite',
    name: 'Lithium (Pegmatite)',
    description:
      'Targets fractionated granites, radiometric proxies, moderate slopes, and low vegetation.',
    weights: {
      deposit_proximity: 2,
      fault_density: 3,
      lithology_match: 5,
      geochem_score: 3,
      ferric_index: 1,
      clay_index: 2,
      aloh_index: 1,
      slope_score: 3
    }
  }
];
