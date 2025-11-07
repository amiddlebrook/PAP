const base = (import.meta.env.VITE_API_BASE_URL ?? '').trim();

function normalizeBaseUrl(url: string) {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export const API_BASE_URL = normalizeBaseUrl(base);
