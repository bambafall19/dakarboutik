// Session admin locale de TEST (cookie JWT signé) — usage: node scripts/dev-admin-session.mjs
import 'dotenv/config';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.NEON_AUTH_COOKIE_SECRET);
const user = {
  id: process.env.TEST_USER_ID || '94bb886d-bb8f-4706-9a27-a98beab10601',
  email: process.env.TEST_USER_EMAIL || 'owner@dakarboutik.com',
  name: 'Admin Test',
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
const session = {
  id: 'test-session-local',
  token: 'test-session-local',
  userId: user.id,
  expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ipAddress: '127.0.0.1',
  userAgent: 'test',
};

const sessionData = await new SignJWT({ session, user })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('1h')
  .sign(secret);

console.log(
  `__Secure-neon-auth.session_token=test-session-local; __Secure-neon-auth.local.session_data=${sessionData}`
);
