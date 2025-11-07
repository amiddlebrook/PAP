import { useMemo } from 'react';
import { useProjectStore } from '../state/projectStore';

export function LeadsPanel() {
  const { leads } = useProjectStore((state) => ({ leads: state.leads }));

  const sortedLeads = useMemo(() => leads.slice(0, 5), [leads]);

  return (
    <section className="panel leads-panel">
      <header>
        <h2>Top Leads</h2>
        <p>High scoring clusters generated from the current Prospect Score.</p>
      </header>
      {sortedLeads.length === 0 ? (
        <p>No leads generated yet. Adjust weights to get started.</p>
      ) : (
        sortedLeads.map((lead) => (
          <div key={lead.id} className="lead-row">
            <div>
              <strong>{lead.name}</strong>
              <div style={{ color: '#64748b' }}>
                {lead.centroid[1].toFixed(2)}°, {lead.centroid[0].toFixed(2)}°
              </div>
            </div>
            <span className="badge">{lead.score.toFixed(1)}</span>
            <span>{lead.areaSqKm.toFixed(1)} km²</span>
            <button className="secondary">Zoom</button>
          </div>
        ))
      )}
    </section>
  );
}
