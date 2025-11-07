import type { WeightKey } from '../types/weights';
import type { Lead } from '../types/leads';

const sampleTiles: Array<{
  id: string;
  centroid: [number, number];
  areaSqKm: number;
  normalizedFeatures: Record<WeightKey, number>;
}> = [
  {
    id: 'tile-001',
    centroid: [-122.4, 49.2],
    areaSqKm: 6.4,
    normalizedFeatures: {
      deposit_proximity: 0.92,
      fault_density: 0.81,
      lithology_match: 0.74,
      geochem_score: 0.88,
      ferric_index: 0.42,
      clay_index: 0.23,
      aloh_index: 0.31,
      slope_score: 0.55
    }
  },
  {
    id: 'tile-002',
    centroid: [117.8, -23.5],
    areaSqKm: 8.1,
    normalizedFeatures: {
      deposit_proximity: 0.63,
      fault_density: 0.72,
      lithology_match: 0.69,
      geochem_score: 0.77,
      ferric_index: 0.64,
      clay_index: 0.61,
      aloh_index: 0.44,
      slope_score: 0.36
    }
  },
  {
    id: 'tile-003',
    centroid: [-68.1, -21.3],
    areaSqKm: 5.7,
    normalizedFeatures: {
      deposit_proximity: 0.48,
      fault_density: 0.66,
      lithology_match: 0.71,
      geochem_score: 0.54,
      ferric_index: 0.82,
      clay_index: 0.79,
      aloh_index: 0.57,
      slope_score: 0.28
    }
  }
];

const factorLabels: Record<WeightKey, string> = {
  deposit_proximity: 'Deposit proximity',
  fault_density: 'Fault density',
  lithology_match: 'Lithology match',
  geochem_score: 'Geochem anomaly',
  ferric_index: 'Ferric index',
  clay_index: 'Clay index',
  aloh_index: 'Al-OH index',
  slope_score: 'Slope/exposure'
};

export function computeProspectScore(weights: Record<WeightKey, number>): Lead[] {
  const maxWeight = Math.max(...Object.values(weights));

  return sampleTiles
    .map((tile) => {
      const weightedSum = (Object.keys(tile.normalizedFeatures) as WeightKey[]).reduce(
        (acc, key) => acc + weights[key] * tile.normalizedFeatures[key],
        0
      );
      const normalizedScore = Math.round((weightedSum / (maxWeight * 8)) * 1000) / 10;
      const dominantFactors = (Object.keys(tile.normalizedFeatures) as WeightKey[])
        .map((key) => ({
          key,
          contribution: weights[key] * tile.normalizedFeatures[key]
        }))
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 3)
        .map((entry) => factorLabels[entry.key]);

      return {
        id: tile.id,
        name: `Lead ${tile.id.split('-')[1]}`,
        score: normalizedScore,
        centroid: tile.centroid,
        areaSqKm: tile.areaSqKm,
        dominantFactors
      } satisfies Lead;
    })
    .sort((a, b) => b.score - a.score);
}
