'use client';

import { emitDataChange, resourceFromUrl } from './data-events';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed: ${res.status}`);
  }
  return data as T;
}

async function mutate<T>(url: string, init: RequestInit): Promise<T> {
  const result = await request<T>(url, init);
  emitDataChange(resourceFromUrl(url));
  return result;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: any) =>
    mutate<T>(url, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: <T>(url: string, body?: any) =>
    mutate<T>(url, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  delete: <T>(url: string) => mutate<T>(url, { method: 'DELETE' }),
};
