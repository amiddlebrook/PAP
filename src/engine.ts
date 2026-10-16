import type { WeightKey } from './types/weights';

export const factors: WeightKey[] = [
  'deposit_proximity', 'fault_density', 'lithology_match', 'geochem_score',
  'ferric_index', 'clay_index', 'aloh_index', 'slope_score'
];

export type Observation = {
  id: string;
  name: string;
  coordinates: [number, number];
  features: Record<WeightKey, number>;
  source: 'demo' | 'import';
};

export type RankedObservation = Observation & {
  score: number;
  dominant: { key: WeightKey; value: number }[];
};

const specimen = (id: string, name: string, lon: number, lat: number, values: number[]): Observation => ({
  id, name, coordinates: [lon, lat], source: 'demo',
  features: Object.fromEntries(factors.map((key, i) => [key, values[i]])) as Record<WeightKey, number>
});

// These are synthetic feature vectors at illustrative geographic coordinates.
// They are not mineral occurrence records, actual surveys or recommendations.
export const demoObservations: Observation[] = [
  specimen('D01', 'Great Basin · sample 01', -116.42, 40.13, [.86,.91,.72,.85,.63,.44,.32,.58]),
  specimen('D02', 'Great Basin · sample 02', -117.82, 39.25, [.72,.84,.78,.66,.45,.38,.40,.70]),
  specimen('D03', 'Sonoran Belt · sample 03', -111.10, 32.72, [.68,.73,.92,.70,.88,.90,.72,.38]),
  specimen('D04', 'Sonoran Belt · sample 04', -109.55, 33.11, [.48,.87,.71,.64,.82,.77,.79,.54]),
  specimen('D05', 'Colorado Plateau · sample 05', -108.72, 38.45, [.69,.54,.86,.76,.57,.51,.64,.73]),
  specimen('D06', 'Colorado Plateau · sample 06', -110.15, 37.19, [.41,.62,.83,.57,.29,.42,.35,.82]),
  specimen('D07', 'Northern Rockies · sample 07', -113.61, 46.51, [.88,.75,.65,.80,.49,.30,.46,.61]),
  specimen('D08', 'Northern Rockies · sample 08', -115.25, 45.20, [.77,.67,.71,.82,.39,.23,.32,.64]),
  specimen('D09', 'Sierra Nevada · sample 09', -120.79, 38.22, [.83,.91,.79,.74,.47,.28,.40,.58]),
  specimen('D10', 'Sierra Nevada · sample 10', -119.48, 36.91, [.53,.66,.72,.69,.61,.49,.34,.78]),
  specimen('D11', 'Southwest · sample 11', -107.54, 35.41, [.56,.60,.62,.71,.70,.66,.59,.42]),
  specimen('D12', 'Southwest · sample 12', -105.95, 34.65, [.43,.78,.74,.51,.83,.61,.56,.64])
];

export function rankObservations(items: Observation[], weights: Record<WeightKey, number>): RankedObservation[] {
  const active = factors.filter((key) => Number.isFinite(weights[key]) && weights[key] > 0);
  const total = active.reduce((sum, key) => sum + weights[key], 0);
  return items.map((item) => {
    const dominant = active.map((key) => ({ key, value: weights[key] * item.features[key] }))
      .sort((a, b) => b.value - a.value);
    const weighted = dominant.reduce((sum, factor) => sum + factor.value, 0);
    return { ...item, score: total ? Math.round(1000 * weighted / total) / 10 : 0, dominant: dominant.slice(0, 3) };
  }).sort((a, b) => b.score - a.score);
}

export function parseGeoJSON(input: unknown): Observation[] {
  if (!input || typeof input !== 'object') throw new Error('Expected a GeoJSON FeatureCollection.');
  const root = input as Record<string, unknown>;
  if (root.type !== 'FeatureCollection' || !Array.isArray(root.features)) {
    throw new Error('Expected a GeoJSON FeatureCollection with Point features.');
  }
  if (root.features.length === 0 || root.features.length > 500) {
    throw new Error('Import between 1 and 500 Point features.');
  }
  const features = root.features as unknown[];
  return features.map((value, index) => {
    if (!value || typeof value !== 'object') throw new Error('Feature ' + (index + 1) + ' is invalid.');
    const feature = value as Record<string, unknown>;
    const geometry = feature.geometry as Record<string, unknown> | undefined;
    const props = (feature.properties ?? {}) as Record<string, unknown>;
    if (!geometry || geometry.type !== 'Point' || !Array.isArray(geometry.coordinates)) {
      throw new Error('Feature ' + (index + 1) + ': only GeoJSON Point geometries are supported.');
    }
    const pair = geometry.coordinates as unknown[];
    const [longitude, latitude] = pair.map(Number);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude) ||
        longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      throw new Error('Feature ' + (index + 1) + ': invalid longitude/latitude.');
    }
    const nested = props.features && typeof props.features === 'object'
      ? props.features as Record<string, unknown> : props;
    const measurements = {} as Record<WeightKey, number>;
    for (const key of factors) {
      const val = nested[key];
      if (typeof val !== 'number' || !Number.isFinite(val) || val < 0 || val > 1) {
        throw new Error('Feature ' + (index + 1) + ': "' + key + '" must be a number between 0 and 1.');
      }
      measurements[key] = val;
    }
    return {
      id: String(props.id ?? feature.id ?? 'import-' + (index + 1)),
      name: String(props.name ?? 'Imported site ' + (index + 1)).slice(0, 90),
      coordinates: [longitude, latitude] as [number, number],
      features: measurements,
      source: 'import'
    };
  });
}

export function exportGeoJSON(items: RankedObservation[]) {
  return {
    type: 'FeatureCollection',
    features: items.map((item) => ({
      type: 'Feature', id: item.id,
      geometry: { type: 'Point', coordinates: item.coordinates },
      properties: { name: item.name, score: item.score, source: item.source, ...item.features }
    }))
  };
}

export function csvFor(items: RankedObservation[]): string {
  const columns = ['id','name','longitude','latitude','score', ...factors];
  const rows = items.map((item) => [
    item.id, item.name, item.coordinates[0], item.coordinates[1], item.score,
    ...factors.map((key) => item.features[key])
  ].map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(','));
  return [columns.join(','), ...rows].join('\n');
}
