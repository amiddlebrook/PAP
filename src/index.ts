/**
 * Prospecting Analytics Platform (PAP) v1.0
 * Cloudflare Worker for analyzing geological, geochemical, and remote-sensing data
 */

// Sample geological data with coordinates and attributes
const SAMPLE_DATA = [
  // High-value prospects
  { lat: 45.5, lon: -120.5, geology: 0.85, geochem: 0.92, remote: 0.78, name: "Site A" },
  { lat: 45.52, lon: -120.48, geology: 0.88, geochem: 0.85, remote: 0.82, name: "Site B" },
  { lat: 45.48, lon: -120.52, geology: 0.79, geochem: 0.88, remote: 0.85, name: "Site C" },
  
  // Medium-value prospects
  { lat: 45.6, lon: -120.3, geology: 0.65, geochem: 0.72, remote: 0.68, name: "Site D" },
  { lat: 45.45, lon: -120.45, geology: 0.62, geochem: 0.68, remote: 0.71, name: "Site E" },
  { lat: 45.55, lon: -120.55, geology: 0.58, geochem: 0.65, remote: 0.62, name: "Site F" },
  
  // Low-value prospects
  { lat: 45.4, lon: -120.4, geology: 0.42, geochem: 0.38, remote: 0.45, name: "Site G" },
  { lat: 45.62, lon: -120.38, geology: 0.35, geochem: 0.42, remote: 0.38, name: "Site H" },
  { lat: 45.58, lon: -120.42, geology: 0.38, geochem: 0.35, remote: 0.42, name: "Site I" },
  
  // Additional scattered sites
  { lat: 45.42, lon: -120.58, geology: 0.72, geochem: 0.68, remote: 0.75, name: "Site J" },
  { lat: 45.68, lon: -120.52, geology: 0.55, geochem: 0.62, remote: 0.58, name: "Site K" },
  { lat: 45.38, lon: -120.35, geology: 0.48, geochem: 0.52, remote: 0.45, name: "Site L" },
];

interface Env {}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // API endpoint for data
    if (url.pathname === '/api/data') {
      return handleDataRequest(request);
    }
    
    // Serve the main HTML interface
    return new Response(getHTML(), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};

function handleDataRequest(request: Request): Response {
  const url = new URL(request.url);
  const weights = {
    geology: parseFloat(url.searchParams.get('geology') || '0.33'),
    geochem: parseFloat(url.searchParams.get('geochem') || '0.33'),
    remote: parseFloat(url.searchParams.get('remote') || '0.34'),
  };
  
  const threshold = parseFloat(url.searchParams.get('threshold') || '0');
  
  // Calculate weighted scores for each site
  const processedData = SAMPLE_DATA.map(site => {
    const score = 
      site.geology * weights.geology +
      site.geochem * weights.geochem +
      site.remote * weights.remote;
    
    return {
      ...site,
      score: score,
      filtered: score >= threshold,
    };
  }).filter(site => site.filtered);
  
  return new Response(JSON.stringify(processedData), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function getHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prospecting Analytics Platform (PAP)</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: #333;
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    
    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .subtitle {
      font-size: 1.1em;
      opacity: 0.9;
    }
    
    .main-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .controls {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .controls h2 {
      font-size: 1.3em;
      margin-bottom: 20px;
      color: #2a5298;
      border-bottom: 2px solid #2a5298;
      padding-bottom: 10px;
    }
    
    .control-group {
      margin-bottom: 25px;
    }
    
    .control-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #555;
    }
    
    .weight-control {
      margin-bottom: 15px;
    }
    
    .weight-value {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 0.9em;
    }
    
    input[type="range"] {
      width: 100%;
      height: 6px;
      background: #ddd;
      border-radius: 3px;
      outline: none;
    }
    
    input[type="range"]::-webkit-slider-thumb {
      width: 18px;
      height: 18px;
      background: #2a5298;
      cursor: pointer;
      border-radius: 50%;
    }
    
    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: #2a5298;
      cursor: pointer;
      border-radius: 50%;
      border: none;
    }
    
    .threshold-control input[type="range"] {
      background: linear-gradient(to right, #ff6b6b 0%, #ffd93d 50%, #6bcf7f 100%);
    }
    
    button {
      width: 100%;
      padding: 12px;
      background: #2a5298;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    button:hover {
      background: #1e3c72;
    }
    
    .map-container {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      min-height: 500px;
    }
    
    .map-container h2 {
      font-size: 1.3em;
      margin-bottom: 15px;
      color: #2a5298;
    }
    
    #heatmap {
      width: 100%;
      height: 500px;
      background: #f8f9fa;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }
    
    .site-marker {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      cursor: pointer;
      transition: transform 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .site-marker:hover {
      transform: scale(1.3);
      z-index: 10;
    }
    
    .site-marker.high {
      background: #6bcf7f;
    }
    
    .site-marker.medium {
      background: #ffd93d;
    }
    
    .site-marker.low {
      background: #ff6b6b;
    }
    
    .tooltip {
      position: absolute;
      background: rgba(0,0,0,0.85);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.85em;
      pointer-events: none;
      z-index: 100;
      display: none;
      white-space: nowrap;
    }
    
    .results {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .results h2 {
      font-size: 1.3em;
      margin-bottom: 15px;
      color: #2a5298;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2a5298;
    }
    
    .stat-label {
      font-size: 0.85em;
      color: #666;
      margin-bottom: 5px;
    }
    
    .stat-value {
      font-size: 1.8em;
      font-weight: bold;
      color: #2a5298;
    }
    
    .targets-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .target-item {
      background: #f8f9fa;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .target-name {
      font-weight: 600;
      color: #333;
    }
    
    .target-score {
      background: #2a5298;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    
    .legend {
      display: flex;
      gap: 20px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>⛏️ Prospecting Analytics Platform</h1>
      <p class="subtitle">Analyze geological, geochemical, and remote-sensing data for precious-metal prospecting</p>
    </header>
    
    <div class="main-content">
      <div class="controls">
        <h2>⚙️ Controls</h2>
        
        <div class="control-group">
          <label>Weight Tuning</label>
          
          <div class="weight-control">
            <div class="weight-value">
              <span>Geological Data</span>
              <span id="geology-value">33%</span>
            </div>
            <input type="range" id="geology-weight" min="0" max="100" value="33">
          </div>
          
          <div class="weight-control">
            <div class="weight-value">
              <span>Geochemical Data</span>
              <span id="geochem-value">33%</span>
            </div>
            <input type="range" id="geochem-weight" min="0" max="100" value="33">
          </div>
          
          <div class="weight-control">
            <div class="weight-value">
              <span>Remote-Sensing Data</span>
              <span id="remote-value">34%</span>
            </div>
            <input type="range" id="remote-weight" min="0" max="100" value="34">
          </div>
        </div>
        
        <div class="control-group threshold-control">
          <label>Minimum Score Threshold</label>
          <div class="weight-value">
            <span>Threshold</span>
            <span id="threshold-value">0.00</span>
          </div>
          <input type="range" id="threshold" min="0" max="100" value="0">
        </div>
        
        <button onclick="updateAnalysis()">🔄 Update Analysis</button>
      </div>
      
      <div class="map-container">
        <h2>🗺️ Heatmap Visualization</h2>
        <div id="heatmap">
          <div class="tooltip" id="tooltip"></div>
        </div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color high"></div>
            <span>High Value (≥0.75)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color medium"></div>
            <span>Medium Value (0.50-0.74)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color low"></div>
            <span>Low Value (&lt;0.50)</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="results">
      <h2>📊 Analysis Results</h2>
      
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Total Sites</div>
          <div class="stat-value" id="total-sites">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">High-Value Targets</div>
          <div class="stat-value" id="high-value">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Average Score</div>
          <div class="stat-value" id="avg-score">0.00</div>
        </div>
      </div>
      
      <h3 style="margin-bottom: 10px; color: #2a5298;">Top Targets (Sorted by Score)</h3>
      <div class="targets-list" id="targets-list"></div>
    </div>
  </div>
  
  <script>
    let currentData = [];
    
    // Initialize weight controls
    const geologyWeight = document.getElementById('geology-weight');
    const geochemWeight = document.getElementById('geochem-weight');
    const remoteWeight = document.getElementById('remote-weight');
    const threshold = document.getElementById('threshold');
    
    // Update weight values display
    geologyWeight.addEventListener('input', (e) => {
      document.getElementById('geology-value').textContent = e.target.value + '%';
    });
    
    geochemWeight.addEventListener('input', (e) => {
      document.getElementById('geochem-value').textContent = e.target.value + '%';
    });
    
    remoteWeight.addEventListener('input', (e) => {
      document.getElementById('remote-value').textContent = e.target.value + '%';
    });
    
    threshold.addEventListener('input', (e) => {
      const val = (e.target.value / 100).toFixed(2);
      document.getElementById('threshold-value').textContent = val;
    });
    
    async function updateAnalysis() {
      const geology = parseFloat(geologyWeight.value) / 100;
      const geochem = parseFloat(geochemWeight.value) / 100;
      const remote = parseFloat(remoteWeight.value) / 100;
      const thresholdVal = parseFloat(threshold.value) / 100;
      
      try {
        const response = await fetch(
          \`/api/data?geology=\${geology}&geochem=\${geochem}&remote=\${remote}&threshold=\${thresholdVal}\`
        );
        currentData = await response.json();
        
        renderHeatmap(currentData);
        renderResults(currentData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    
    function renderHeatmap(data) {
      const heatmap = document.getElementById('heatmap');
      const tooltip = document.getElementById('tooltip');
      
      // Clear existing markers
      const markers = heatmap.querySelectorAll('.site-marker');
      markers.forEach(m => m.remove());
      
      if (data.length === 0) {
        return;
      }
      
      // Find bounds
      const lats = data.map(d => d.lat);
      const lons = data.map(d => d.lon);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);
      
      // Add padding
      const latPadding = (maxLat - minLat) * 0.1 || 0.1;
      const lonPadding = (maxLon - minLon) * 0.1 || 0.1;
      
      data.forEach(site => {
        const marker = document.createElement('div');
        marker.className = 'site-marker';
        
        // Determine marker class based on score
        if (site.score >= 0.75) {
          marker.classList.add('high');
        } else if (site.score >= 0.50) {
          marker.classList.add('medium');
        } else {
          marker.classList.add('low');
        }
        
        // Position marker (normalized coordinates)
        const x = ((site.lon - minLon + lonPadding) / (maxLon - minLon + 2 * lonPadding)) * 100;
        const y = (1 - (site.lat - minLat + latPadding) / (maxLat - minLat + 2 * latPadding)) * 100;
        
        marker.style.left = x + '%';
        marker.style.top = y + '%';
        marker.style.transform = 'translate(-50%, -50%)';
        
        // Tooltip on hover
        marker.addEventListener('mouseenter', (e) => {
          tooltip.innerHTML = \`
            <strong>\${site.name}</strong><br>
            Score: \${site.score.toFixed(3)}<br>
            Geology: \${site.geology.toFixed(2)}<br>
            Geochem: \${site.geochem.toFixed(2)}<br>
            Remote: \${site.remote.toFixed(2)}
          \`;
          tooltip.style.display = 'block';
        });
        
        marker.addEventListener('mousemove', (e) => {
          tooltip.style.left = (e.clientX - heatmap.getBoundingClientRect().left + 15) + 'px';
          tooltip.style.top = (e.clientY - heatmap.getBoundingClientRect().top + 15) + 'px';
        });
        
        marker.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });
        
        heatmap.appendChild(marker);
      });
    }
    
    function renderResults(data) {
      // Update stats
      document.getElementById('total-sites').textContent = data.length;
      
      const highValue = data.filter(d => d.score >= 0.75).length;
      document.getElementById('high-value').textContent = highValue;
      
      const avgScore = data.length > 0 
        ? (data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(3)
        : '0.00';
      document.getElementById('avg-score').textContent = avgScore;
      
      // Render targets list
      const targetsList = document.getElementById('targets-list');
      targetsList.innerHTML = '';
      
      // Sort by score descending
      const sortedData = [...data].sort((a, b) => b.score - a.score);
      
      sortedData.forEach(site => {
        const item = document.createElement('div');
        item.className = 'target-item';
        item.innerHTML = \`
          <div>
            <div class="target-name">\${site.name}</div>
            <div style="font-size: 0.85em; color: #666; margin-top: 4px;">
              Lat: \${site.lat.toFixed(2)}°, Lon: \${site.lon.toFixed(2)}°
            </div>
          </div>
          <div class="target-score">\${site.score.toFixed(3)}</div>
        \`;
        targetsList.appendChild(item);
      });
    }
    
    // Initial load
    updateAnalysis();
  </script>
</body>
</html>`;
}
