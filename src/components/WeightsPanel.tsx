import { useEffect, useRef } from 'react';
import { useProjectStore } from '../state/projectStore';
import { weightCatalog } from '../types/weights';

export function WeightsPanel() {
  const { weights, updateWeight, refreshLeads } = useProjectStore((state) => ({
    weights: state.weights,
    updateWeight: state.updateWeight,
    refreshLeads: state.refreshLeads
  }));

  const debounceHandle = useRef<number | undefined>();

  useEffect(() => {
    return () => {
      if (debounceHandle.current) {
        window.clearTimeout(debounceHandle.current);
      }
    };
  }, []);

  return (
    <aside className="panel weights-panel">
      <header>
        <h2>Weights</h2>
        <p>Adjust the contribution of each factor to the Prospect Score.</p>
      </header>
      {weightCatalog.map((weight) => (
        <div key={weight.id} className="slider-group">
          <div className="slider-header">
            <span>{weight.label}</span>
            <span>{weights[weight.id].toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={weight.min}
            max={weight.max}
            step={0.1}
            value={weights[weight.id]}
            onChange={(event) => {
              updateWeight(weight.id, Number(event.target.value));
              if (debounceHandle.current) {
                window.clearTimeout(debounceHandle.current);
              }
              debounceHandle.current = window.setTimeout(() => {
                void refreshLeads();
              }, 250);
            }}
            onMouseUp={() => {
              if (debounceHandle.current) {
                window.clearTimeout(debounceHandle.current);
              }
              debounceHandle.current = window.setTimeout(() => {
                void refreshLeads();
              }, 10);
            }}
            onTouchEnd={() => {
              if (debounceHandle.current) {
                window.clearTimeout(debounceHandle.current);
              }
              debounceHandle.current = window.setTimeout(() => {
                void refreshLeads();
              }, 10);
            }}
          />
          <small>{weight.description}</small>
        </div>
      ))}
    </aside>
  );
}
