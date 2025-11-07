import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LayerId, layerCatalog } from '../types/layers';
import { presetCatalog, PresetId } from '../types/presets';
import { WeightKey, defaultWeights } from '../types/weights';
import { computeProspectScore } from '../utils/scoring';
import type { Lead } from '../types/leads';

export interface ProjectState {
  projectName: string;
  activeLayers: Record<LayerId, boolean>;
  weights: Record<WeightKey, number>;
  activePreset: PresetId | null;
  leads: Lead[];
  isSharing: boolean;
  setProjectName: (name: string) => void;
  toggleLayer: (layer: LayerId) => void;
  updateWeight: (weight: WeightKey, value: number) => void;
  applyPreset: (preset: PresetId) => void;
  refreshLeads: () => void;
  setSharing: (sharing: boolean) => void;
}

const defaultLayerState = Object.fromEntries(
  layerCatalog.map((layer) => [layer.id, layer.defaultVisible])
) as Record<LayerId, boolean>;

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projectName: 'Untitled Project',
      activeLayers: defaultLayerState,
      weights: { ...defaultWeights },
      activePreset: null,
      leads: [],
      isSharing: false,
      setProjectName: (name) => set({ projectName: name }),
      toggleLayer: (layer) =>
        set((state) => ({
          activeLayers: { ...state.activeLayers, [layer]: !state.activeLayers[layer] }
        })),
      updateWeight: (weight, value) =>
        set((state) => ({
          weights: { ...state.weights, [weight]: value },
          activePreset: null
        })),
      applyPreset: (preset) => {
        const presetDefinition = presetCatalog.find((p) => p.id === preset);
        if (!presetDefinition) return;
        set({
          weights: { ...presetDefinition.weights },
          activePreset: preset
        });
        get().refreshLeads();
      },
      refreshLeads: () => {
        const weights = get().weights;
        const mockLeads = computeProspectScore(weights);
        set({ leads: mockLeads });
      },
      setSharing: (sharing) => set({ isSharing: sharing })
    }),
    {
      name: 'pap-project-state'
    }
  )
);
