import { useEffect, useMemo, useRef, useState } from 'react';
import { ProspectMap } from './components/ProspectMap';
import { csvFor, demoObservations, exportGeoJSON, factors, parseGeoJSON, rankObservations } from './engine';
import type { Observation, RankedObservation } from './engine';
import { useProjectStore } from './state/projectStore';
import { presetCatalog } from './types/presets';
import { weightCatalog } from './types/weights';

const factorLabels = Object.fromEntries(weightCatalog.map((item) => [item.id, item.label])) as Record<string, string>;

function download(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function scoreColor(score: number) {
  return score >= 75 ? 'high' : score >= 55 ? 'medium' : 'low';
}

function App() {
  const weights = useProjectStore((state) => state.weights);
  const activePreset = useProjectStore((state) => state.activePreset);
  const projectName = useProjectStore((state) => state.projectName);
  const setProjectName = useProjectStore((state) => state.setProjectName);
  const updateWeight = useProjectStore((state) => state.updateWeight);
  const applyPreset = useProjectStore((state) => state.applyPreset);
  const uploadInput = useRef<HTMLInputElement>(null);
  const [sites, setSites] = useState<Observation[]>(demoObservations);
  const [dataKey, setDataKey] = useState('demo');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(0);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showMethod, setShowMethod] = useState(false);
  const imported = sites[0]?.source === 'import';

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.hash.slice(1)).get('model');
    if (!encoded) return;
    try {
      const shared = JSON.parse(encoded) as { weights?: Record<string, number>; min?: number };
      if (shared.weights && typeof shared.weights === 'object') {
        for (const key of factors) {
          const value = shared.weights[key];
          if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 5) {
            useProjectStore.getState().updateWeight(key, value);
          }
        }
      }
      if (typeof shared.min === 'number' && Number.isFinite(shared.min)) {
        setThreshold(Math.max(0, Math.min(100, shared.min)));
      }
      setNotice('Shared model settings loaded. Import the original dataset separately if needed.');
    } catch {
      setNotice('The shared configuration could not be read.');
    }
  }, []);

  const ranked = useMemo(() => rankObservations(sites, weights), [sites, weights]);
  const visible = useMemo(() => ranked.filter((site) =>
    site.score >= threshold && (site.name.toLowerCase().includes(query.toLowerCase()) ||
    site.id.toLowerCase().includes(query.toLowerCase()))
  ), [ranked, threshold, query]);
  const selected = ranked.find((site) => site.id === selectedId) ?? null;
  const average = ranked.length ? ranked.reduce((sum, item) => sum + item.score, 0) / ranked.length : 0;
  const above75 = ranked.filter((site) => site.score >= 75).length;

  async function importFile(file: File) {
    if (file.size > 1024 * 1024) {
      setNotice('Import failed: GeoJSON file must be 1 MB or less.');
      return;
    }
    try {
      const data = parseGeoJSON(JSON.parse(await file.text()));
      setSites(data);
      setSelectedId(null);
      setQuery('');
      setThreshold(0);
      setDataKey('import-' + Date.now());
      setNotice('Imported ' + data.length + ' measured sites. No data was uploaded to a server.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to read GeoJSON file.');
    }
  }

  function restoreDemo() {
    setSites(demoObservations);
    setSelectedId(null);
    setQuery('');
    setThreshold(0);
    setDataKey('demo-' + Date.now());
    setNotice('Illustrative dataset restored.');
    if (uploadInput.current) uploadInput.current.value = '';
  }

  function shareSettings() {
    const encoded = new URLSearchParams({ model: JSON.stringify({ weights, min: threshold }) });
    const link = window.location.origin + window.location.pathname + '#' + encoded.toString();
    setShareUrl(link);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link).then(
        () => setNotice('Model configuration link copied. Imported site data is NOT included.'),
        () => setNotice('Copy the share link from the field below.')
      );
    } else setNotice('Copy the share link from the field below.');
  }

  function exportTargets(format: 'csv' | 'geojson') {
    if (!visible.length) { setNotice('No targets match your filters.'); return; }
    if (format === 'csv') download('pap-targets.csv', csvFor(visible), 'text/csv;charset=utf-8');
    else download('pap-targets.geojson', JSON.stringify(exportGeoJSON(visible), null, 2), 'application/geo+json');
    setNotice('Exported ' + visible.length + ' ranked observations (' + format.toUpperCase() + ').');
  }

  return (
    <div className="workspace">
      <header className="masthead">
        <div className="brand">
          <div className="brand-symbol">P<span>∧</span>P</div>
          <div><strong>Prospecting Analytics Platform</strong><small>EXPLORATION INTELLIGENCE / WORKSPACE</small></div>
        </div>
        <div className="header-center"><span className="status-dot" /> ALL SYSTEMS LOCAL <span className="separator">/</span> WORKBENCH V2</div>
        <div className="header-actions">
          <button className="button ghost" type="button" onClick={() => setShowMethod(!showMethod)}>Methodology</button>
          <button className="button outline" type="button" onClick={shareSettings}>↗ Share model</button>
          <button className="button primary" type="button" onClick={() => uploadInput.current?.click()}>＋ Import GeoJSON</button>
        </div>
      </header>

      <div className="work-grid">
        <aside className="sidebar sidebar-left">
          <div className="sidebar-scroll">
            <div className="section-label"><span>01</span> MODEL CONFIGURATION</div>
            <h1>Explore the <em>potential.</em></h1>
            <p className="section-description">Tune your geological factors and rank spatial observations with a transparent weighted model.</p>
            <div className="project-field">
              <label htmlFor="project-name">WORKSPACE NAME</label>
              <input id="project-name" maxLength={80} value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              <div className="microcopy">Model settings are saved automatically in this browser.</div>
            </div>

            <div className="section-divider" />
            <div className="subheading"><span>COMMODITY MODELS</span><span className="subtle">03 PRESETS</span></div>
            <div className="preset-stack">
              {presetCatalog.map((preset, i) => (
                <button key={preset.id} type="button" onClick={() => applyPreset(preset.id)}
                  className={'preset-option ' + (activePreset === preset.id ? 'is-active' : '')}
                  aria-pressed={activePreset === preset.id}>
                  <span className="preset-number">0{i + 1}</span>
                  <span className="preset-main"><strong>{preset.name}</strong><small>{preset.description}</small></span>
                  <span className="preset-arrow">↗</span>
                </button>
              ))}
            </div>

            <div className="section-divider" />
            <div className="subheading"><span>FACTOR WEIGHTS</span><span className="subtle">0–5 SCALE</span></div>
            <div className="factor-stack">
              {weightCatalog.map((factor) => (
                <div className="factor-row" key={factor.id}>
                  <label htmlFor={factor.id}><span>{factor.label}</span><strong>{weights[factor.id].toFixed(1)}</strong></label>
                  <input id={factor.id} type="range" min="0" max="5" step=".5" value={weights[factor.id]}
                    onChange={(event) => updateWeight(factor.id, Number(event.target.value))}
                    aria-label={factor.label} />
                </div>
              ))}
            </div>
            <button className="button reset-button" type="button" onClick={() => applyPreset('gold_orogenic')}>↺ Reset to gold model</button>
          </div>
          <div className="sidebar-footer"><span className="live-dot" /> CLIENT-SIDE SCORING <span>NO PAID API REQUIRED</span></div>
        </aside>

        <main className="center-column">
          <div className="map-head">
            <div>
              <div className="section-label"><span>02</span> GEOSPATIAL ANALYSIS</div>
              <h2>Exploration overview <span className="map-head-tag">{imported ? 'IMPORTED OBSERVATIONS' : 'SYNTHETIC DEMO'}</span></h2>
            </div>
            <div className="map-head-tools">
              <button className="button outline small" type="button" onClick={() => exportTargets('csv')}>↓ CSV</button>
              <button className="button outline small" type="button" onClick={() => exportTargets('geojson')}>↓ GeoJSON</button>
            </div>
          </div>

          <div className="stats-strip">
            <div className="stat"><small>OBSERVATIONS</small><div>{ranked.length.toString().padStart(2, '0')}<span> RECORDS</span></div></div>
            <div className="stat"><small>AVERAGE MODEL SCORE</small><div>{average.toFixed(1)}<span> / 100</span></div></div>
            <div className="stat"><small>HIGH SCORING SITES</small><div>{above75.toString().padStart(2, '0')}<span> ≥ 75</span></div></div>
            <div className="stat"><small>DATA PROVENANCE</small><div className="provenance">{imported ? 'YOUR GEOJSON' : 'SIMULATED DATA'}</div></div>
          </div>

          <ProspectMap points={visible} selectedId={selectedId} onSelect={setSelectedId} dataKey={dataKey} />

          <div className="analysis-bottom">
            <section className="insight-card">
              <div className="subheading"><span>SELECTED TARGET</span><span className="subtle">{selected ? selected.id : 'NONE'}</span></div>
              {selected ? (
                <>
                  <div className="selected-top">
                    <div><h3>{selected.name}</h3><p>{selected.coordinates[1].toFixed(4)}° N/S · {selected.coordinates[0].toFixed(4)}° E/W</p></div>
                    <div className={'score-large ' + scoreColor(selected.score)}>{selected.score.toFixed(1)}<small>/ 100</small></div>
                  </div>
                  <div className="factor-contributions">
                    {selected.dominant.map((factor) => (
                      <div key={factor.key}><span>{factorLabels[factor.key]}</span><div className="factor-meter"><div style={{ width: Math.round(factor.value / 5 * 100) + '%' }} /></div><strong>{factor.value.toFixed(2)}</strong></div>
                    ))}
                    {selected.dominant.length === 0 && <p>All model weights are set to zero.</p>}
                  </div>
                </>
              ) : (
                <div className="empty-select"><div className="target-cross">⌖</div><div><strong>Select a target to inspect its signal.</strong><p>Click a map point or choose a ranked observation.</p></div></div>
              )}
            </section>
            <section className="insight-card caution-card">
              <div className="subheading"><span>MODEL TRANSPARENCY</span><span className="subtle">IMPORTANT</span></div>
              <h3>{imported ? 'Your data, your interpretation.' : 'Illustrative analysis only.'}</h3>
              <p>{imported
                ? 'Scores are derived only from the eight normalized input attributes you supplied. PAP does not independently verify geological accuracy.'
                : 'The starting 12 locations and all feature measurements are synthetic examples. They do not indicate verified deposits, mineral rights, or exploration suitability.'}</p>
              <button className="text-link" type="button" onClick={() => setShowMethod(true)}>Read scoring methodology →</button>
            </section>
          </div>
        </main>

        <aside className="sidebar sidebar-right">
          <div className="sidebar-scroll">
            <div className="section-label"><span>03</span> TARGET INTELLIGENCE</div>
            <div className="right-heading"><h2>Ranked targets</h2><span className="count-pill">{visible.length} / {ranked.length}</span></div>
            <p className="section-description">Compare model outputs, inspect factor strengths and export a prioritized shortlist.</p>

            <div className="data-status">
              <div className="status-icon">⌗</div>
              <div><strong>{imported ? 'Imported dataset active' : 'Demo dataset active'}</strong><small>{imported ? 'Validated normalized GeoJSON · browser only' : '12 illustrative observations · not real survey data'}</small></div>
              <span className="live-dot" />
            </div>
            <div className="filter-controls">
              <label htmlFor="search">FILTER OBSERVATIONS</label>
              <input id="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sites or IDs…" />
              <div className="filter-label"><label htmlFor="score-filter">MINIMUM SCORE</label><strong>{threshold}</strong></div>
              <input id="score-filter" type="range" min="0" max="100" step="5" value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))} />
              <div className="filter-boundaries"><span>0</span><span>100</span></div>
            </div>

            <div className="rank-head"><span>RANK / SITE</span><span>MODEL SCORE</span></div>
            <div className="target-list">
              {visible.length ? visible.map((site: RankedObservation, i) => (
                <button key={site.id} type="button" className={'target-row ' + (selectedId === site.id ? 'selected' : '')}
                  onClick={() => setSelectedId(site.id)}>
                  <span className="rank-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="target-details"><strong>{site.name}</strong><small>{site.coordinates[1].toFixed(2)}, {site.coordinates[0].toFixed(2)} · {site.id}</small></span>
                  <span className={'score-chip ' + scoreColor(site.score)}>{site.score.toFixed(1)}</span>
                </button>
              )) : <div className="no-results">No sites match these filters. Reduce the minimum score or clear your search.</div>}
            </div>
          </div>
          <div className="right-footer">
            <p>DATASET OPERATIONS</p>
            <div className="footer-buttons"><button type="button" className="button outline" onClick={() => uploadInput.current?.click()}>＋ Load data</button><button type="button" className="button ghost" onClick={restoreDemo}>↺ Demo</button></div>
            <div className="microcopy">Import Point GeoJSON with all eight normalized factor fields (0–1). Maximum 500 sites, 1 MB.</div>
          </div>
        </aside>
      </div>

      {notice && <div className="toast" role="status"><span>{notice}</span><button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div>}
      {shareUrl && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShareUrl('')}>
        <div className="modal" role="dialog" aria-modal="true" aria-label="Share model" onMouseDown={(event) => event.stopPropagation()}>
          <button className="modal-close" type="button" onClick={() => setShareUrl('')}>×</button>
          <div className="section-label">SHARE ANALYSIS MODEL</div><h2>Share your configuration</h2>
          <p>This link contains your weights and score filter only. It does not contain imported datasets or upload your information.</p>
          <input aria-label="Share URL" readOnly value={shareUrl} onFocus={(event) => event.target.select()} />
          <button className="button primary" type="button" onClick={() => {
            if (navigator.clipboard) void navigator.clipboard.writeText(shareUrl).then(() => setNotice('Link copied.')).catch(() => setNotice('Select and copy the URL above.'));
          }}>Copy link</button>
        </div>
      </div>}

      {showMethod && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowMethod(false)}>
        <div className="modal methodology-modal" role="dialog" aria-modal="true" aria-label="Methodology" onMouseDown={(event) => event.stopPropagation()}>
          <button className="modal-close" type="button" onClick={() => setShowMethod(false)}>×</button>
          <div className="section-label">EXPLAINABLE SCORING ENGINE</div><h2>How prospect scores are calculated</h2>
          <p>PAP computes a weighted average of eight supplied, normalized indicators. Each indicator must be a number from 0 to 1; a weight of zero disables that factor.</p>
          <div className="formula">SCORE = 100 × Σ (weight × value) / Σ (active weights)</div>
          <p>A score is an analytical ranking, not an estimated mineral grade or probability of a discovery. The example dataset is synthetic. Imported measurements are scored as-is and never transmitted to PAP servers.</p>
          <div className="method-factor-list">{weightCatalog.map((factor) => <div key={factor.id}><strong>{factor.label}</strong><span>{factor.description}</span></div>)}</div>
          <p><strong>GeoJSON input:</strong> FeatureCollection of Point features, each with properties.name and numeric properties for all eight IDs shown in the <a href="https://github.com/amiddlebrook/PAP/blob/main/README.md" target="_blank" rel="noreferrer">documentation</a>. The dataset stays in memory only; download it separately to preserve it.</p>
        </div>
      </div>}
      <input ref={uploadInput} className="visually-hidden" type="file" accept=".geojson,.json,application/json,application/geo+json"
        aria-label="Import Point GeoJSON" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); }} />
    </div>
  );
}

export default App;
