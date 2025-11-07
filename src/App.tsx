import { MapView } from './components/MapView';
import { LayersPanel } from './components/LayersPanel';
import { WeightsPanel } from './components/WeightsPanel';
import { PresetsPanel } from './components/PresetsPanel';
import { LeadsPanel } from './components/LeadsPanel';
import { LegendPanel } from './components/LegendPanel';
import { SaveSharePanel } from './components/SaveSharePanel';
import { useProjectStore } from './state/projectStore';

function App() {
  const { activePreset } = useProjectStore();

  return (
    <div className="app-shell">
      <div className="top-left-actions">
        <SaveSharePanel />
        <div className="badge">{activePreset ? `${activePreset} preset` : 'Custom weights'}</div>
      </div>
      <LayersPanel />
      <MapView />
      <WeightsPanel />
      <PresetsPanel />
      <LegendPanel />
      <LeadsPanel />
    </div>
  );
}

export default App;
