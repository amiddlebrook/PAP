import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LayerId, layerCatalog } from '../types/layers';
import { presetCatalog, PresetId } from '../types/presets';
import { WeightKey, defaultWeights } from '../types/weights';
import { computeFallbackLeads } from '../utils/scoring';
import type { Lead } from '../types/leads';
import { API_BASE_URL } from '../config';

type LeadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ProjectState {
  projectName: string;
  activeLayers: Record<LayerId, boolean>;
  weights: Record<WeightKey, number>;
  activePreset: PresetId | null;
  leads: Lead[];
  leadsStatus: LeadStatus;
  leadsError: string | null;
  leadsUpdatedAt: number | null;
  isSharing: boolean;
  setProjectName: (name: string) => void;
  toggleLayer: (layer: LayerId) => void;
  updateWeight: (weight: WeightKey, value: number) => void;
  applyPreset: (preset: PresetId) => void;
  refreshLeads: () => Promise<void>;
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
      leadsStatus: 'idle',
      leadsError: null,
      leadsUpdatedAt: null,
      isSharing: false,
      setProjectName: (name) => set({ projectName: name }),
      toggleLayer: (layer) => {
        set((state) => ({
          activeLayers: { ...state.activeLayers, [layer]: !state.activeLayers[layer] }
        }));
        void get().refreshLeads();
      },
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
        void get().refreshLeads();
      },
      refreshLeads: async () => {
        const { weights, activeLayers } = get();
        const selectedLayers = (Object.entries(activeLayers) as Array<[LayerId, boolean]>)
          .filter(([, isActive]) => isActive)
          .map(([layerId]) => layerId);

        if (selectedLayers.length === 0) {
          set({
            leads: [],
            leadsStatus: 'success',
            leadsError: null,
            leadsUpdatedAt: Date.now()
          });
          return;
        }

        set({ leadsStatus: 'loading', leadsError: null });

        try {
          const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/leads` : '/api/leads';
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({ weights, layers: selectedLayers })
          });

          if (!response.ok) {
            const message = await safeParseError(response);
            throw new Error(message);
          }

          const payload = (await response.json()) as { leads?: Lead[] };
          if (!payload.leads || !Array.isArray(payload.leads)) {
            throw new Error('Worker response did not contain leads data');
          }

          set({
            leads: payload.leads,
            leadsStatus: 'success',
            leadsError: null,
            leadsUpdatedAt: Date.now()
          });
        } catch (error) {
          console.error('Failed to refresh leads', error);
          const fallback = computeFallbackLeads(weights);
          set({
            leads: fallback,
            leadsStatus: 'error',
            leadsError:
              error instanceof Error ? error.message : 'Unable to generate leads from worker',
            leadsUpdatedAt: Date.now()
          });
        }
      },
      setSharing: (sharing) => set({ isSharing: sharing })
    }),
    {
      name: 'pap-project-state',
      partialize: (state) => ({
        projectName: state.projectName,
        activeLayers: state.activeLayers,
        weights: state.weights,
        activePreset: state.activePreset
      })
    }
  )
);

async function safeParseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data.error === 'string' && data.error.length > 0) {
      return data.error;
    }
  } catch (error) {
    console.warn('Unable to parse error response', error);
  }

  return `Request failed with status ${response.status}`;
}
