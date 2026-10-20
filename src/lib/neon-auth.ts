import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
const issuer = process.env.NEON_AUTH_BASE_URL;

const jwks = jwksUrl ? createRemoteJWKSet(new URL(jwksUrl)) : null;

export type NeonAuthClaims = {
  sub: string;
  email?: string;
  [key: string]: unknown;
};

export function isNeonAuthConfigured(): boolean {
  return Boolean(jwksUrl && issuer);
}

export async function verifyNeonAuthToken(token: string): Promise<NeonAuthClaims | null> {
  if (!jwks || !issuer) return null;
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer });
    return payload as NeonAuthClaims;
  } catch {
    return null;
  }
}

export async function getNeonAuthHealth() {
  if (!jwksUrl || !issuer) {
    return { configured: false, reachable: false, baseUrl: null as string | null, keys: 0 };
  }
  try {
    const res = await fetch(jwksUrl, { cache: 'no-store' });
    if (!res.ok) return { configured: true, reachable: false, baseUrl: issuer, keys: 0 };
    const body = (await res.json()) as { keys?: unknown[] };
    return {
      configured: true,
      reachable: true,
      baseUrl: issuer,
      keys: Array.isArray(body.keys) ? body.keys.length : 0,
    };
  } catch {
    return { configured: true, reachable: false, baseUrl: issuer, keys: 0 };
  }
}
