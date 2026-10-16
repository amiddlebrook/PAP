import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { presetCatalog, type PresetId } from '../types/presets';
import { defaultWeights, type WeightKey } from '../types/weights';

type ProjectState = {
  projectName: string;
  weights: Record<WeightKey, number>;
  activePreset: PresetId | null;
  setProjectName: (name: string) => void;
  updateWeight: (key: WeightKey, value: number) => void;
  applyPreset: (preset: PresetId) => void;
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projectName: 'New exploration workspace',
      weights: { ...defaultWeights },
      activePreset: 'gold_orogenic',
      setProjectName: (name) => set({ projectName: name }),
      updateWeight: (key, value) => set((state) => ({
        weights: { ...state.weights, [key]: value },
        activePreset: null
      })),
      applyPreset: (preset) => {
        const model = presetCatalog.find((candidate) => candidate.id === preset);
        if (model) set({ weights: { ...model.weights }, activePreset: preset });
      }
    }),
    {
      name: 'pap-project-state',
      partialize: ({ projectName, weights, activePreset }) => ({ projectName, weights, activePreset })
    }
  )
);
