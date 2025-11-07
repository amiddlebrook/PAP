type ProspectRequest = {
  weights: Record<string, number>;
  layers: string[];
};

type LeadResponse = {
  id: string;
  name: string;
  score: number;
  centroid: [number, number];
  areaSqKm: number;
  dominantFactors: string[];
};

function jsonResponse<T>(payload: T, init?: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json' },
    ...init
  });
}

function computeLeads(request: ProspectRequest): LeadResponse[] {
  const totalWeight = Object.values(request.weights).reduce((acc, value) => acc + value, 0);
  const baseScore = totalWeight === 0 ? 0 : 1000 / totalWeight;

  return request.layers.slice(0, 5).map((layer, index) => ({
    id: `lead-${index + 1}`,
    name: `Prospect ${layer.toUpperCase()}-${index + 1}`,
    score: Math.round((baseScore + index * 42) * 10) / 10,
    centroid: [133.8 + index * 0.5, -25.27 + index * 0.3],
    areaSqKm: 5 + index * 1.2,
    dominantFactors: Object.keys(request.weights)
      .sort((a, b) => request.weights[b] - request.weights[a])
      .slice(0, 3)
  }));
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    if (url.pathname === '/api/health') {
      return jsonResponse({ status: 'ok', timestamp: Date.now() }, { status: 200 });
    }

    if (url.pathname === '/api/leads' && request.method === 'POST') {
      const payload = (await request.json()) as ProspectRequest;
      const leads = computeLeads(payload);
      return jsonResponse({ leads });
    }

    return jsonResponse({ error: 'Not found' }, { status: 404 });
  }
};
