# Prospecting Analytics Platform (PAP)

Prospecting Analytics Platform (PAP) is a Cloudflare-native web application that analyzes global
datasets to surface high-value mineral exploration targets. The product requirements document in
this repository is now accompanied by a working prototype that includes the core frontend layout,
state management, a mock scoring engine, and a Cloudflare Worker skeleton.

## Monorepo layout

```
.
├── index.html              # Vite entry document
├── package.json            # Frontend dependencies and scripts
├── public/                 # Static assets (favicon)
├── src/                    # React application source
│   ├── components/         # UI primitives (map, panels, leads list, presets, etc.)
│   ├── state/              # Zustand project store with persistence and lead refresh logic
│   ├── types/              # Shared type definitions for layers, weights, presets, and leads
│   └── utils/              # Prospect score mock computation utilities
└── worker/                 # Cloudflare Worker API scaffold
    ├── package.json
    ├── src/index.ts        # REST endpoints for health check and lead generation
    └── wrangler.toml
```

## Getting started

### Frontend (Vite + React + MapLibre)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The UI opens automatically on http://localhost:5173 with the following capabilities:

- **Global map** rendered by MapLibre with toggleable geological data layers and mock PMTiles/COG
  sources.
- **Layer browser** that reflects the PRD dataset catalog and toggles visibility instantly.
- **Weight sliders** tied to the weighted-sum prospect score model. Adjusting sliders immediately
  recalculates leads via the mock scoring engine.
- **Commodity presets** for Orogenic Gold, Porphyry Copper, and Pegmatite Lithium that load tailored
  weight configurations.
- **Leads panel** listing the highest-scoring targets returned by the Cloudflare Worker scoring
  endpoint, with automatic refreshes as you adjust sliders or toggle layers.
- **Save & Share** control that persists the current session state via the Worker and returns a
  signed share URL scoped to the active project configuration.
- **Selection toolbar** with placeholder lasso/box/point controls and export trigger.
- **Heatmap legend** that conveys the scoring range.

### Cloudflare Worker API

```bash
npm run worker:install
npm run worker:dev
```

The worker exposes two endpoints:

- `GET /api/health` — lightweight status check.
- `POST /api/leads` — deterministic lead generator that accepts weights and active layers and returns
  ranked lead clusters. This powers the frontend leads panel and gracefully handles CORS and
  validation errors.
- `POST /api/share` — accepts the current project state and returns a signed share path that embeds
  the encoded session payload for distribution.

All worker commands use the root-level `wrangler.toml`. If you prefer to drive them directly, run
`npx wrangler <command>` from the repository root.

### Connecting the UI to a remote worker

By default the frontend sends API requests to the same origin. To target a deployed Worker during
local development, create a `.env.local` file and set:

```
VITE_API_BASE_URL=https://your-worker.example.workers.dev
```

Restart `npm run dev` after adjusting environment variables.

Both the frontend and worker adhere to the architecture, performance, and data model conventions
captured in the original PAP PRD, enabling the team to iterate toward production features.
