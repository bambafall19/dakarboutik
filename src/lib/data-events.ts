'use client';

export type DataChangeEvent = {
  resource: string;
  at: number;
};

type Listener = (event: DataChangeEvent) => void;

const listeners = new Set<Listener>();
let channel: BroadcastChannel | null = null;

const RESOURCE_ALIASES: Record<string, string[]> = {
  orders: ['public-orders'],
  'public-orders': ['orders'],
};

export function resourceFromUrl(url: string): string {
  const path = url.split('?')[0].replace(/\/+$/, '');
  const match = path.match(/\/api\/([^/?#]+)/);
  return match ? match[1] : '*';
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel('dakarboutik:data');
    channel.onmessage = (event: MessageEvent) => {
      const data = event.data as DataChangeEvent;
      if (!data || typeof data.resource !== 'string') return;
      listeners.forEach((listener) => listener(data));
    };
  }
  return channel;
}

export function emitDataChange(resource: string) {
  const targets = Array.from(new Set([resource, ...(RESOURCE_ALIASES[resource] ?? [])]));
  targets.forEach((target) => {
    const event: DataChangeEvent = { resource: target, at: Date.now() };
    listeners.forEach((listener) => listener(event));
    getChannel()?.postMessage(event);
  });
}

export function subscribeDataChange(listener: Listener): () => void {
  getChannel();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
