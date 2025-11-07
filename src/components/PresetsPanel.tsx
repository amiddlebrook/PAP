import { useProjectStore } from '../state/projectStore';
import { presetCatalog } from '../types/presets';

export function PresetsPanel() {
  const { applyPreset, activePreset } = useProjectStore((state) => ({
    applyPreset: state.applyPreset,
    activePreset: state.activePreset
  }));

  return (
    <aside className="panel weights-panel">
      <header>
        <h2>Presets</h2>
        <p>Start from curated models tuned for different commodities.</p>
      </header>
      <div className="presets-grid">
        {presetCatalog.map((preset) => (
          <button
            key={preset.id}
            className={`preset-card ${activePreset === preset.id ? '' : 'secondary'}`}
            onClick={() => applyPreset(preset.id)}
          >
            <div>
              <strong>{preset.name}</strong>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#1e293b' }}>{preset.description}</p>
            </div>
            <div className="stat-block">
              <span className="stat-value">
                {Math.round(
                  Object.values(preset.weights).reduce((acc, value) => acc + value, 0) / 8
                ).toFixed(0)}{' '}
                avg
              </span>
              <small>Avg weight</small>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
