# PAP — Prospecting Analytics Platform

**Cloudflare-native, zero-mandatory-cost mineral exploration workbench.** An interactive geospatial app that ranks user-supplied, normalized geological observations with a fully explainable weighted model.

> **Data integrity first:** PAP launches with a **synthetic 12-point demonstration dataset**, clearly labeled in the interface. These positions and measurements are invented for UI and model testing, **not real assays, mineral deposits, validated anomalies, mineral-resource estimates, investment advice or property recommendations**. To perform actual analyses, import your own verified GeoJSON observations.

## What works

- **MapLibre map** with OpenFreeMap basemap (no API key), clickable locations, map navigation and target focus.
- **Gold / Copper / Lithium model presets** plus eight adjustable 0–5 factor weights.
- **Live, explainable prospect scores**, ranked targets, search and minimum-score filtering.
- **GeoJSON import:** validates every Point, coordinate and normalized measurement.
- **CSV and GeoJSON export** of the visible ranked shortlist, including score and original factors.
- **Local workspace settings** (project name, weights and preset) via browser storage; data imports remain in memory.
- **Share model link** containing weights and score threshold (not imported data).
- **Mobile-responsive exploration UI** and accessibility labels.
- **Cloudflare Worker** with `/api/health` and `/api/schema`; static SPA delivered by Workers Static Assets.
- **GitHub Actions** typechecking, lint, build, Wrangler packaging check on PRs, and deploy on push to `main`.

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm ci
npm run dev
```

Open the Vite local address (normally http://localhost:5173). For a production-like Cloudflare local preview:

```bash
npm run build
npx wrangler@4 dev
```

For local builds without Cloudflare credentials, the Vite development server and static preview work without any cloud setup.

## Deploy free to Cloudflare from GitHub

This project uses **one Worker** with static assets, **no D1, R2, KV, durable objects, paid databases, paid mapping subscriptions or external AI APIs**.

1. Create a free Cloudflare account and enable your free `workers.dev` subdomain.
2. Go to **GitHub → PAP → Settings → Secrets and variables → Actions** and create repository secrets:
   - `CLOUDFLARE_API_TOKEN` — Cloudflare API token scoped to *Edit Cloudflare Workers* for your account.
   - `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID (not the zone ID).
3. Merge the restoration pull request to `main`. The workflow builds, checks, and runs `wrangler deploy` automatically. Subsequent pushes to `main` redeploy.
4. Open the assigned workers.dev URL shown in deployment output. Verify `/api/health` returns `{"status":"ok", ...}`.

No credit card or paid Cloudflare plan is required for the app design; actual availability is still subject to Cloudflare's free-tier limits and to the availability of the free public OpenFreeMap tiles. Worker requests use the Workers Free request allocation, while static asset requests are free. GitHub Actions usage is subject to GitHub's plan and repository allowances.

**Important:** GitHub Actions deployment requires those two secrets. The CI job runs without them, but the deployment job intentionally fails with instructions until both are configured. No secret or account identifier belongs in tracked files.

## Input data: normalized GeoJSON

Import a **GeoJSON FeatureCollection** of **1–500 Point features**, at most **1 MB**. Each feature must have all eight numeric properties between **0 and 1**:

| Property | Interpretation |
| --- | --- |
| `deposit_proximity` | Normalized proximity to known occurrences |
| `fault_density` | Normalized mapped structures/fault density |
| `lithology_match` | Target lithology similarity |
| `geochem_score` | Normalized geochemical anomaly |
| `ferric_index` | Ferric iron response |
| `clay_index` | Clay alteration response |
| `aloh_index` | Al-OH alteration response |
| `slope_score` | Slope/exposure favorability |

Example (all values invented):

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-116.42, 40.13] },
      "properties": {
        "id": "SAMPLE-1",
        "name": "Illustrative location",
        "deposit_proximity": 0.86,
        "fault_density": 0.91,
        "lithology_match": 0.72,
        "geochem_score": 0.85,
        "ferric_index": 0.63,
        "clay_index": 0.44,
        "aloh_index": 0.32,
        "slope_score": 0.58
      }
    }
  ]
}
```

The file `examples/illustrative-observations.geojson` is an import-ready example. The API endpoint `GET /api/schema` enumerates required field IDs. Feature properties can also be supplied under `properties.features`.

### Scoring formula

For enabled factors (`weight > 0`):

```text
score = 100 × sum(weight_i × normalized_feature_i) / sum(weight_i)
```

If all weights are zero, all scores are zero. Results range 0–100. This is a **relative suitability index computed from inputs**, not a probability of mineralization, deposit size, yield or exploration success. Values are never inferred for missing measurements; incomplete imports are rejected.

## Data handling and sharing

All GeoJSON parsing, scoring and export occur in the browser. Imported datasets are **not uploaded** to the Worker and disappear on refresh; save an exported GeoJSON before navigating away. Project name and model settings persist only in this browser via Zustand/localStorage. Share URLs contain model weights and the score threshold but never imported data; recipients must independently load the same observations.

## Repo structure

```text
src/App.tsx                   responsive analysis workbench
src/engine.ts                validated input, score engine, export formatters
src/components/ProspectMap.tsx  MapLibre overlay + target interactions
src/styles.css               responsive design system
worker/src/index.ts          lightweight JSON health/schema API
wrangler.toml                single Worker + static assets
.github/workflows/deploy.yml CI and CD
examples/                    synthetic sample imports
```

**Scope and next data integration:** This version is an operational *import-and-analyze* workbench. It does not claim to supply a global live geology/assay database, satellite raster analytics, mineral titles/land access validation, or remote project synchronization. Real geological data pipelines should be sourced, licensed, normalized, and tested before adding them, not replaced by generated values.

## Free infrastructure

- Hosting and API: [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- CI/CD: [GitHub Actions](https://github.com/features/actions)
- Basemap: [OpenFreeMap](https://openfreemap.org/) using OpenStreetMap/open mapping contributors
- Rendering: [MapLibre GL JS](https://maplibre.org/)
- No mandatory account sign-in; no paid service dependencies.
