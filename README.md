# Prospecting Analytics Platform (PAP)

## Product Overview
The Prospecting Analytics Platform (PAP) is a Cloudflare-native web application for analyzing global geological, geochemical, and remote-sensing datasets to identify precious-metal prospecting opportunities. It provides an interactive heatmap experience where users can tune weights, apply filters, and extract high-value targets.

Core capabilities include the ability to select any geographic region, load multiple geological and remote-sensing layers, adjust weights to generate live Prospect Score heatmaps, select areas using drawing tools, export leads, and save or share sessions through unique URLs. The system emphasizes low operating cost and high performance by leveraging Cloudflare Pages and Workers, R2 for storage, and PMTiles/COGs for map layers.

## User Personas
- **Independent Prospectors**: seek easy presets, rapid insights, and quick exports (GPX, KML, GeoJSON).
- **Exploration Startups**: need ranked leads, structured data, and team collaboration features.
- **Data Researchers**: require raw values, transparency, and complete control for their own modeling.

## Core Features (MVP)
### Global Map Interface
- Built with MapLibre GL for rendering.
- Smooth pan and zoom with multiple basemaps.

### Layer Browser
- Toggle geology polygons, faults, known deposits, geochemical grids, satellite indices, and DEM derivatives.

### Prospect Score Engine
Uses a weighted sum model:

```
score = Σ(weight_i × normalized_feature_i)
```

Supported features include deposit proximity, fault density, lithology match, geochemical anomaly values, ferric iron index, clay index, Al-OH alteration index, and slope/exposure scores.

### Selection Tools
- Lasso, rectangle, and point selection.
- Statistical summaries and export of selections.

### Leads Generator
- Extracts top-scoring tiles, clusters them, and generates lead zones with metadata.

### Save & Share
- Stores data in Durable Objects and shares via encoded URLs.

## Advanced Features (Post-MVP)
Future enhancements include ML-assisted alteration mapping, satellite time-series analysis, offline PMTiles packs, user-uploaded assay data, and AI-guided prospecting queries.

## Technical Architecture
- **Frontend**: React, MapLibre, deck.gl, Zustand, TanStack Query.
- **Backend**: Cloudflare Workers and Durable Objects.
- **Storage**: Cloudflare R2 for PMTiles/COGs and D1 (SQLite).

### R2 Storage Structure
- `geo/geology.pmtiles`
- `geo/faults.pmtiles`
- `geo/deposits.pmtiles`
- `geo/indices/*.tif`
- `geo/dem/*.tif`

### D1 Database Tables
- `projects(id, owner, name, state_json, created_at)`
- `leads(id, project_id, geom, score, factors_json)`
- `sources(id, type, url, version, metadata_json)`

## Scoring Engine Details
Each tile or hex cell stores normalized features:
`deposit_proximity`, `fault_density`, `lithology_match`, `geochem_score`, `ferric_index`, `clay_index`, `aloh_index`, and `slope_score`.

Normalization strategies:
- Min-max scaling per region.
- Z-score normalization for geochemical data.
- Capped values for distance-based metrics.

## Preset Models
- **Gold (Orogenic)**: high structure density, medium-high ferric iron, lithology match for greenstones, Au/As/Sb anomalies.
- **Copper (Porphyry)**: high ferric and clay indices, intrusive lithology, faults within 5 km.
- **Lithium (Pegmatite)**: fractionated granites, radiometric potassium proxies, low vegetation index, moderate slopes.

## User Stories
- **US-001**: Generate Heatmap.
- **US-002**: Select Area.
- **US-003**: Generate Leads.
- **US-004**: Save & Share Projects.
- **US-005**: Export Data.

## UI Specification
- Left panel for layer management.
- Right panel for weight sliders.
- Top-left controls for Save/Share.
- Top-right presets menu.
- Bottom heatmap legend.

### Leads Panel
Displays lead name, score, centroid, bounding box, sorting options, and zoom-to buttons.

## Performance Requirements
- Heatmap updates in under 500 ms.
- Tile load times under 200 ms.
- Worker compute time under 50 ms.
- Storage cost under $5 per month.
- Worker cost under $7 per month under medium usage.

## Security Requirements
- Optional Cloudflare Access OAuth.
- Enforced HTTPS.
- Signed tile URLs.
- No user file uploads in the MVP.

## Future Roadmap
- **Q2**: ML classifiers and custom formulas.
- **Q3**: Offline mode, AI agent, and team workspaces.
- **Q4**: Automated PDF reports, drillhole ingestion, and predictive modeling.

