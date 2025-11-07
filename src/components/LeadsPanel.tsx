import { useMemo } from 'react';
import { useProjectStore } from '../state/projectStore';

export function LeadsPanel() {
  const { leads, leadsStatus, leadsError, leadsUpdatedAt, refreshLeads } = useProjectStore(
    (state) => ({
      leads: state.leads,
      leadsStatus: state.leadsStatus,
      leadsError: state.leadsError,
      leadsUpdatedAt: state.leadsUpdatedAt,
      refreshLeads: state.refreshLeads
    })
  );

  const sortedLeads = useMemo(() => leads.slice().sort((a, b) => b.score - a.score).slice(0, 8), [
    leads
  ]);

  return (
    <section className="panel leads-panel">
      <header>
        <h2>Top Leads</h2>
        <p>High scoring clusters generated from the current Prospect Score.</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="secondary"
            onClick={() => {
              void refreshLeads();
            }}
            disabled={leadsStatus === 'loading'}
          >
            {leadsStatus === 'loading' ? 'Refreshing…' : 'Refresh'}
          </button>
          {leadsUpdatedAt && (
            <small style={{ color: '#64748b' }}>
              Updated {new Date(leadsUpdatedAt).toLocaleTimeString()}
            </small>
          )}
        </div>
      </header>
      {leadsStatus === 'error' && (
        <p style={{ color: '#dc2626' }}>{leadsError ?? 'Lead generation failed'}</p>
      )}
      {leadsStatus === 'loading' && <p style={{ color: '#475569' }}>Generating leads…</p>}
      {leadsStatus !== 'loading' && sortedLeads.length === 0 && (
        <p style={{ color: '#475569' }}>No leads available yet.</p>
      )}
      {leadsStatus !== 'loading' &&
        sortedLeads.map((lead) => (
          <div key={lead.id} className="lead-row">
            <div>
              <strong>{lead.name}</strong>
              <div style={{ color: '#64748b' }}>
                {lead.centroid[1].toFixed(2)}°, {lead.centroid[0].toFixed(2)}° · {lead.areaSqKm.toFixed(1)} km²
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                {lead.dominantFactors.join(', ')}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span className="badge">{lead.score.toFixed(1)}</span>
              <button className="secondary">Zoom</button>
            </div>
          </div>
        ))}
    </section>
  );
}
