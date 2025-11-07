export interface Lead {
  id: string;
  name: string;
  score: number;
  centroid: [number, number];
  areaSqKm: number;
  dominantFactors: string[];
}
