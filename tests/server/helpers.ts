import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../../server/app.ts';
import { buildSeed } from '../../server/seed.ts';
import { Store } from '../../server/store.ts';

export const TODAY = new Date(2026, 4, 20); // 20 May 2026

export interface TestServer {
  url: string;
  store: Store;
  close: () => Promise<void>;
}

export async function startServer(): Promise<TestServer> {
  const store = new Store(buildSeed(TODAY));
  const server: Server = createApp(store).listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    store,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

export async function call(base: string, method: string, path: string, body?: unknown) {
  const res = await fetch(base + path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const contentType = res.headers.get('content-type') ?? '';
  return { status: res.status, body: contentType.includes('json') ? JSON.parse(text) : text, headers: res.headers };
}
