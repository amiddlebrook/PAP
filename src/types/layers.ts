export type LayerId =
  | 'geology'
  | 'faults'
  | 'deposits'
  | 'geochem'
  | 'ferric'
  | 'clay'
  | 'aloh'
  | 'dem';

export interface LayerDefinition {
  id: LayerId;
  name: string;
  description: string;
  source: string;
  defaultVisible: boolean;
}

export const layerCatalog: LayerDefinition[] = [
  {
    id: 'geology',
    name: 'Lithology Polygons',
    description: 'Generalized lithology units from global geology datasets.',
    source: 'geo/geology.pmtiles',
    defaultVisible: true
  },
  {
    id: 'faults',
    name: 'Fault Network',
    description: 'Mapped faults and shear zones with structural orientation.',
    source: 'geo/faults.pmtiles',
    defaultVisible: true
  },
  {
    id: 'deposits',
    name: 'Known Deposits',
    description: 'Registered precious metal occurrences and past producers.',
    source: 'geo/deposits.pmtiles',
    defaultVisible: false
  },
  {
    id: 'geochem',
    name: 'Geochemical Grids',
    description: 'Interpolated anomaly grids for priority pathfinder elements.',
    source: 'geo/indices/geochem.tif',
    defaultVisible: false
  },
  {
    id: 'ferric',
    name: 'Ferric Iron Index',
    description: 'Satellite-derived ferric iron abundance index.',
    source: 'geo/indices/ferric.tif',
    defaultVisible: false
  },
  {
    id: 'clay',
    name: 'Clay Alteration Index',
    description: 'Shortwave infrared clay alteration indicator.',
    source: 'geo/indices/clay.tif',
    defaultVisible: false
  },
  {
    id: 'aloh',
    name: 'Al-OH Alteration Index',
    description: 'Hydrothermal Al-OH alteration highlight layer.',
    source: 'geo/indices/aloh.tif',
    defaultVisible: false
  },
  {
    id: 'dem',
    name: 'Terrain Model',
    description: 'Digital elevation model derivatives for slope/exposure.',
    source: 'geo/dem/slope.tif',
    defaultVisible: false
  }
];
