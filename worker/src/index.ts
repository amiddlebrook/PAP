type ProspectRequest = {
  weights: Record<string, number>;
  layers: string[];
};

type ShareRequest = {
  state?: {
    projectName?: string;
    weights?: Record<string, number>;
    layers?: string[];
  };
};

type LeadResponse = {
  id: string;
  name: string;
  score: number;
  centroid: [number, number];
  areaSqKm: number;
  dominantFactors: string[];
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'content-type'
};

const factorLabels: Record<string, string> = {
  deposit_proximity: 'Deposit proximity',
  fault_density: 'Fault density',
  lithology_match: 'Lithology match',
  geochem_score: 'Geochem anomaly',
  ferric_index: 'Ferric index',
  clay_index: 'Clay index',
  aloh_index: 'Al-OH index',
  slope_score: 'Slope/exposure'
};

function jsonResponse<T>(payload: T, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('content-type', 'application/json');
  Object.entries(CORS_HEADERS).forEach(([key, value]) => headers.set(key, value));

  return new Response(JSON.stringify(payload), {
    ...init,
    headers
  });
}

function computeLeads(request: ProspectRequest): LeadResponse[] {
  const weights = Object.entries(request.weights ?? {});
  const layers = Array.isArray(request.layers) ? request.layers : [];
  const weightSum = weights.reduce((acc, [, value]) => acc + value, 0) || 1;

  return layers.slice(0, 12).map((layer, index) => {
    const seed = hashString(`${layer}-${index}`);
    const weightInfluence = weights.reduce((acc, [key, value]) => {
      const modifier = ((hashString(`${layer}-${key}`) % 40) + 60) / 100;
      return acc + value * modifier;
    }, 0);
    const normalizedScore = (weightInfluence / weightSum) * 70 + (seed % 30);
    const score = Math.round(normalizedScore * 10) / 10;

    const longitude = clamp(((seed % 360000) / 1000) - 180, -180, 180);
    const latitude = clamp((((seed / 360000) % 180000) / 1000) - 90, -90, 90);
    const areaSqKm = Math.round(((seed % 900) / 10 + 5 + index) * 10) / 10;

    const dominantFactors = weights
      .map(([key, value]) => ({
        key,
        contribution: value * (((hashString(`${key}-${layer}`) % 50) + 50) / 100)
      }))
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3)
      .map((entry) => factorLabels[entry.key] ?? entry.key);

    return {
      id: `${layer.replace(/[^a-z0-9]/gi, '').toLowerCase()}-${index + 1}`,
      name: `Prospect ${layer.split('/').pop()?.replace('.pmtiles', '') ?? layer} #${index + 1}`,
      score,
      centroid: [Number(longitude.toFixed(4)), Number(latitude.toFixed(4))],
      areaSqKm,
      dominantFactors
    } satisfies LeadResponse;
  });
}

function encodeShareState(state: ShareRequest['state']) {
  const json = JSON.stringify(state ?? {});
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function hashString(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(31, hash) + input.charCodeAt(index);
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === '/api/health') {
      return jsonResponse({ status: 'ok', timestamp: Date.now() }, { status: 200 });
    }

    if (url.pathname === '/api/leads' && request.method === 'POST') {
      const payload = (await request.json()) as ProspectRequest;
      const leads = computeLeads(payload).sort((a, b) => b.score - a.score);
      return jsonResponse({ leads });
    }

    if (url.pathname === '/api/share' && request.method === 'POST') {
      const payload = (await request.json()) as ShareRequest;
      if (!payload.state || typeof payload.state !== 'object') {
        return jsonResponse({ error: 'Share payload must include project state' }, { status: 400 });
      }

      const encoded = encodeShareState(payload.state);
      const slug = encoded.slice(0, 8) || 'session';
      const sharePath = `/share/${slug}?state=${encoded}`;

      return jsonResponse({ sharePath, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 });
    }

    return jsonResponse({ error: 'Not found' }, { status: 404 });
  }
};
