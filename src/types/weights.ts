export type WeightKey =
  | 'deposit_proximity'
  | 'fault_density'
  | 'lithology_match'
  | 'geochem_score'
  | 'ferric_index'
  | 'clay_index'
  | 'aloh_index'
  | 'slope_score';

export interface WeightDefinition {
  id: WeightKey;
  label: string;
  description: string;
  min: number;
  max: number;
}

export const weightCatalog: WeightDefinition[] = [
  {
    id: 'deposit_proximity',
    label: 'Deposit Proximity',
    description: 'Inverse-distance weighting to known deposits.',
    min: 0,
    max: 5
  },
  {
    id: 'fault_density',
    label: 'Fault Density',
    description: 'Influence of fault and shear density grids.',
    min: 0,
    max: 5
  },
  {
    id: 'lithology_match',
    label: 'Lithology Match',
    description: 'Similarity to target lithology for selected commodity.',
    min: 0,
    max: 5
  },
  {
    id: 'geochem_score',
    label: 'Geochem Anomaly',
    description: 'Standardized geochemical anomaly ranking.',
    min: 0,
    max: 5
  },
  {
    id: 'ferric_index',
    label: 'Ferric Iron Index',
    description: 'Strength of ferric iron response from multispectral data.',
    min: 0,
    max: 5
  },
  {
    id: 'clay_index',
    label: 'Clay Index',
    description: 'SWIR-derived clay alteration indicator.',
    min: 0,
    max: 5
  },
  {
    id: 'aloh_index',
    label: 'Al-OH Index',
    description: 'Hydrothermal alteration Al-OH indicator.',
    min: 0,
    max: 5
  },
  {
    id: 'slope_score',
    label: 'Slope & Exposure',
    description: 'Favorable slope/exposure conditions for access.',
    min: 0,
    max: 5
  }
];

export const defaultWeights: Record<WeightKey, number> = {
  deposit_proximity: 3,
  fault_density: 4,
  lithology_match: 3,
  geochem_score: 4,
  ferric_index: 2,
  clay_index: 1,
  aloh_index: 1,
  slope_score: 2
};
