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
- **Leads panel** listing the highest-scoring targets (mock data derived from sample tiles).
- **Save & Share** control that simulates Durable Object-backed sharing by generating an encoded URL.
- **Selection toolbar** with placeholder lasso/box/point controls and export trigger.
- **Heatmap legend** that conveys the scoring range.

### Cloudflare Worker API

```bash
cd worker
npm install
npm run dev
```

The worker exposes two endpoints:

- `GET /api/health` — lightweight status check.
- `POST /api/leads` — mock lead generator that accepts weights + layers and returns synthesized lead
  clusters. This endpoint is ready to be connected to the frontend state store once the real scoring
  engine is implemented.

Both the frontend and worker adhere to the architecture, performance, and data model conventions
captured in the original PAP PRD, enabling the team to iterate toward production features.
