import axios from 'axios';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:4000/api/v1';
const PRODUCTION_API_BASE_URL = 'https://kusf-aems-api.onrender.com/api/v1';

function isTemporaryTunnelUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;
    return hostname.endsWith('.trycloudflare.com') || hostname.endsWith('.loca.lt');
  } catch {
    return false;
  }
}

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    if (isTemporaryTunnelUrl(configured) && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return PRODUCTION_API_BASE_URL;
    }
    return configured;
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.host}/api/v1`;
  }

  return DEFAULT_API_BASE_URL;
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export function getApiUrl(path: string) {
  return `${getApiBaseUrl().replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
