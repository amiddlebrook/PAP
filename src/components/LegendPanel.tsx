const legendStops = [
  { color: '#0f172a', label: '0 - 200' },
  { color: '#2563eb', label: '200 - 400' },
  { color: '#38bdf8', label: '400 - 600' },
  { color: '#f59e0b', label: '600 - 800' },
  { color: '#f97316', label: '800 - 1000' }
];

export function LegendPanel() {
  return (
    <footer className="panel legend-panel">
      <header>
        <h2>Prospect Score</h2>
        <p>Combined weighted score scaled from 0 to 1000.</p>
      </header>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {legendStops.map((stop) => (
          <div key={stop.label} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '12px',
                borderRadius: '8px',
                background: stop.color
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>{stop.label}</div>
          </div>
        ))}
      </div>
    </footer>
  );
}
