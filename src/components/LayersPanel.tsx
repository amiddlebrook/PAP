import { useProjectStore } from '../state/projectStore';
import { layerCatalog } from '../types/layers';

export function LayersPanel() {
  const { activeLayers, toggleLayer } = useProjectStore((state) => ({
    activeLayers: state.activeLayers,
    toggleLayer: state.toggleLayer
  }));

  return (
    <aside className="panel layers-panel">
      <header>
        <h2>Layers</h2>
        <p>Toggle base datasets to feed the scoring model.</p>
      </header>
      {layerCatalog.map((layer) => (
        <label key={layer.id} className="layer-row">
          <span>
            <input
              type="checkbox"
              checked={activeLayers[layer.id]}
              onChange={() => toggleLayer(layer.id)}
            />
            <strong>{layer.name}</strong>
          </span>
          <small>{layer.source.replace('geo/', '')}</small>
        </label>
      ))}
    </aside>
  );
}
