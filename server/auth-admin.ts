import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response, NextFunction } from 'express';

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts: Record<string, string> = {};
let certsExpiresAt = 0;

function readFirebaseProjectId(): string {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw) as { projectId?: string };
    if (parsed.projectId) return parsed.projectId;
  } catch {
    // fallback below
  }
  return process.env.FIREBASE_PROJECT_ID || 'master-evening-vxctm';
}

function getAllowedAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || 'contacteprosodiacom@gmail.com').trim().toLowerCase();
}

async function getGoogleCerts(): Promise<Record<string, string>> {
  if (Date.now() < certsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }
  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Google public certificates (${res.status})`);
  }
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSec = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;
  cachedCerts = (await res.json()) as Record<string, string>;
  certsExpiresAt = Date.now() + maxAgeSec * 1000;
  return cachedCerts;
}

function decodeBase64Url(segment: string): Buffer {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64');
}

export async function verifyFirebaseAdminToken(idToken: string): Promise<{
  uid: string;
  email: string;
}> {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT token');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(decodeBase64Url(headerB64).toString('utf8')) as {
    alg?: string;
    kid?: string;
  };
  const payload = JSON.parse(decodeBase64Url(payloadB64).toString('utf8')) as {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    auth_time?: number;
    email?: string;
    email_verified?: boolean;
  };

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported JWT algorithm or missing key id');
  }

  const certs = await getGoogleCerts();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error('Matching Firebase certificate not found');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();
  const isValidSig = verifier.verify(cert, decodeBase64Url(signatureB64));
  if (!isValidSig) {
    throw new Error('Invalid Firebase ID token signature');
  }

  const projectId = readFirebaseProjectId();
  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= nowSec) {
    throw new Error('Firebase ID token expired');
  }
  if (payload.aud !== projectId) {
    throw new Error('Firebase ID token audience mismatch');
  }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Firebase ID token issuer mismatch');
  }
  if (!payload.sub) {
    throw new Error('Missing Firebase user subject');
  }

  const tokenEmail = (payload.email || '').trim().toLowerCase();
  if (!tokenEmail || tokenEmail !== getAllowedAdminEmail()) {
    throw new Error('Authenticated user is not the authorized administrator');
  }

  return {
    uid: payload.sub,
    email: tokenEmail,
  };
}

export async function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({
      error: {
        code: 'admin_auth_required',
        message: 'Authentification Firebase Administrateur requise pour accéder aux opérations financières.',
      },
    });
    return;
  }

  try {
    const admin = await verifyFirebaseAdminToken(match[1].trim());
    (req as Request & { adminUser?: { uid: string; email: string } }).adminUser = admin;
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Jeton administrateur invalide';
    res.status(403).json({
      error: {
        code: 'admin_forbidden',
        message,
      },
    });
  }
}
