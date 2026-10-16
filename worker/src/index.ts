type Env = { ASSETS: { fetch: (request: Request) => Promise<Response> } };

const factorIds = [
  'deposit_proximity', 'fault_density', 'lithology_match', 'geochem_score',
  'ferric_index', 'clay_index', 'aloh_index', 'slope_score'
];

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status, headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json({ error: 'Method not allowed' }, 405);
      }
      if (url.pathname === '/api/health') {
        return json({ status: 'ok', product: 'PAP', storage: 'client-side', paidServicesRequired: false });
      }
      if (url.pathname === '/api/schema') {
        return json({
          type: 'FeatureCollection',
          geometry: 'Point',
          normalizedFeatureProperties: factorIds,
          range: [0, 1],
          maxFeatures: 500,
          note: 'Geological measurements must be provided by the user; no discovery probability is inferred.'
        });
      }
      return json({ error: 'Unknown API endpoint' }, 404);
    }
    return env.ASSETS.fetch(request);
  }
};
