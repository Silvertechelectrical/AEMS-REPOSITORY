import axios from 'axios';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:4000/api/v1';

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured;
  }

  return DEFAULT_API_BASE_URL;
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export function getApiUrl(path: string) {
  return `${getApiBaseUrl().replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
