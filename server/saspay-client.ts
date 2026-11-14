import crypto from 'node:crypto';
import type {
  SasPayCheckoutSessionRequest,
  SasPayCheckoutSessionResponse,
  SasPayCheckoutSessionStatusResponse,
  SasPayCountry,
  SasPayMerchantBalance,
  SasPayNetwork,
  SasPayPayoutRequest,
  SasPayPricingRate,
  SasPaySoftpayRequest,
  SasPaySoftpayResponse,
  SasPayVerifyResponse,
  SasPayWalletTransferRequest,
} from './saspay-types.ts';

export const SASPAY_BASE_URL = 'https://api.saspay.me/api/v1';

export class SasPayHttpError extends Error {
  status: number;
  code: string;
  details?: unknown;
  retryAfterMs?: number;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
    retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'SasPayHttpError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryAfterMs = retryAfterMs;
  }
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
let rateLimitCooldownUntil = 0;

export function getSasPayApiKey(): string {
  return (process.env.SASPAY_API_KEY || '').trim();
}

export function getSasPayWebhookSecret(): string {
  return (process.env.SASPAY_WEBHOOK_SECRET || '').trim();
}

export function getSasPayConfigSummary(): {
  configured: boolean;
  mode: 'test' | 'live' | 'custom' | 'unconfigured';
  webhookConfigured: boolean;
} {
  const apiKey = getSasPayApiKey();
  const webhookSecret = getSasPayWebhookSecret();
  let mode: 'test' | 'live' | 'custom' | 'unconfigured' = 'unconfigured';
  if (apiKey) {
    if (apiKey.startsWith('sk_test_')) mode = 'test';
    else if (apiKey.startsWith('sk_live_')) mode = 'live';
    else mode = 'custom';
  }
  return {
    configured: Boolean(apiKey),
    mode,
    webhookConfigured: Boolean(webhookSecret),
  };
}

/**
 * Formats any monetary input strictly into a 2-decimal string (e.g. "2500.00").
 * Never returns or serializes floats.
 */
export function formatDecimalAmount(input: string | number): string {
  if (typeof input === 'string') {
    const cleaned = input.trim().replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
      throw new SasPayHttpError(
        400,
        'invalid_amount',
        'Montant invalide : fournissez une chaîne décimale positive (ex. "2500.00").',
      );
    }
    const [intPart, decPart = ''] = cleaned.split('.');
    const padded = (decPart + '00').slice(0, 2);
    const normalizedInt = intPart.replace(/^0+(?=\d)/, '') || '0';
    if (normalizedInt === '0' && padded === '00') {
      throw new SasPayHttpError(
        400,
        'invalid_amount',
        'Le montant doit être strictement supérieur à zéro.',
      );
    }
    return `${normalizedInt}.${padded}`;
  }

  if (typeof input === 'number' && Number.isFinite(input) && input > 0) {
    return input.toFixed(2);
  }

  throw new SasPayHttpError(
    400,
    'invalid_amount',
    'Montant invalide : fournissez un montant positif.',
  );
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as { success?: unknown }).success === true &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function extractSasPayError(
  status: number,
  body: unknown,
  retryAfterMs?: number,
): SasPayHttpError {
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    const nestedErr =
      obj.error && typeof obj.error === 'object'
        ? (obj.error as Record<string, unknown>)
        : null;

    if (nestedErr) {
      const code =
        typeof nestedErr.code === 'string' ? nestedErr.code : `http_${status}`;
      const message =
        typeof nestedErr.message === 'string'
          ? nestedErr.message
          : typeof nestedErr.detail === 'string'
            ? nestedErr.detail
            : `Erreur SasPay (${status})`;
      return new SasPayHttpError(status, code, message, body, retryAfterMs);
    }

    if (typeof obj.message === 'string' || typeof obj.code === 'string') {
      return new SasPayHttpError(
        status,
        typeof obj.code === 'string' ? obj.code : `http_${status}`,
        typeof obj.message === 'string' ? obj.message : `Erreur SasPay (${status})`,
        body,
        retryAfterMs,
      );
    }

    // Field validation map: { field: ["message"] }
    const fieldMessages: string[] = [];
    for (const [field, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        fieldMessages.push(`${field}: ${val.join(', ')}`);
      } else if (typeof val === 'string') {
        fieldMessages.push(`${field}: ${val}`);
      }
    }
    if (fieldMessages.length > 0) {
      return new SasPayHttpError(
        status,
        'validation_error',
        fieldMessages.join(' | '),
        body,
        retryAfterMs,
      );
    }
  }

  return new SasPayHttpError(
    status,
    `http_${status}`,
    `Erreur SasPay (${status})`,
    body,
    retryAfterMs,
  );
}

interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
  idempotencyKey?: string;
  requireAuth?: boolean;
}

async function saspayRequest<T>(opts: RequestOptions): Promise<T> {
  const now = Date.now();
  if (now < rateLimitCooldownUntil) {
    const remainingMs = rateLimitCooldownUntil - now;
    throw new SasPayHttpError(
      429,
      'rate_limited',
      `Limite de débit SasPay atteinte. Veuillez patienter ${Math.ceil(remainingMs / 1000)}s avant de réessayer.`,
      undefined,
      remainingMs,
    );
  }

  const requireAuth = opts.requireAuth !== false;
  const apiKey = getSasPayApiKey();

  if (requireAuth && !apiKey) {
    throw new SasPayHttpError(
      401,
      'api_key_missing',
      'La variable serveur SASPAY_API_KEY n’est pas configurée.',
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (opts.idempotencyKey) {
    headers['Idempotency-Key'] = opts.idempotencyKey;
  }

  const url = `${SASPAY_BASE_URL}${opts.path}`;
  let response: globalThis.Response;
  try {
    response = await fetch(url, {
      method: opts.method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch (networkErr: unknown) {
    const message =
      networkErr instanceof Error ? networkErr.message : 'Erreur réseau';
    throw new SasPayHttpError(
      502,
      'saspay_unreachable',
      `Impossible de joindre l'API SasPay : ${message}`,
    );
  }

  const rawText = await response.text();
  let parsed: unknown = null;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { message: rawText };
    }
  }

  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('retry-after');
    const retrySec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
    const cooldownMs =
      Number.isFinite(retrySec) && retrySec > 0 ? retrySec * 1000 : 3000;
    rateLimitCooldownUntil = Date.now() + cooldownMs;
    throw extractSasPayError(429, parsed, cooldownMs);
  }

  if (!response.ok) {
    throw extractSasPayError(response.status, parsed);
  }

  return unwrapEnvelope<T>(parsed);
}

async function cachedGet<T>(
  cacheKey: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const existing = cache.get(cacheKey);
  if (existing && Date.now() < existing.expiresAt) {
    return existing.value as T;
  }
  const value = await fetcher();
  cache.set(cacheKey, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export async function listCountries(): Promise<SasPayCountry[]> {
  return cachedGet('countries', 10 * 60 * 1000, async () => {
    const res = await saspayRequest<SasPayCountry[] | { results?: SasPayCountry[] }>({
      method: 'GET',
      path: '/countries/',
      requireAuth: false,
    });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  });
}

export async function listNetworks(): Promise<SasPayNetwork[]> {
  return cachedGet('networks', 5 * 60 * 1000, async () => {
    const res = await saspayRequest<SasPayNetwork[] | { results?: SasPayNetwork[] }>({
      method: 'GET',
      path: '/networks/?page_size=200',
      requireAuth: true,
    });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  });
}

export async function getMyRates(): Promise<SasPayPricingRate[]> {
  return cachedGet('my-rates', 2 * 60 * 1000, async () => {
    const res = await saspayRequest<SasPayPricingRate[] | { results?: SasPayPricingRate[] }>({
      method: 'GET',
      path: '/pricing/my-rates/',
      requireAuth: true,
    });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  });
}

export async function listExchangeRates(): Promise<unknown[]> {
  return cachedGet('exchange-rates', 2 * 60 * 1000, async () => {
    const res = await saspayRequest<unknown[] | { results?: unknown[] }>({
      method: 'GET',
      path: '/exchange-rates/?page_size=100',
      requireAuth: true,
    });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  });
}

export async function softpayPayment(
  payload: SasPaySoftpayRequest,
  idempotencyKey: string,
): Promise<SasPaySoftpayResponse> {
  return saspayRequest<SasPaySoftpayResponse>({
    method: 'POST',
    path: '/payments/softpay/',
    body: {
      ...payload,
      amount: formatDecimalAmount(payload.amount),
    },
    idempotencyKey,
    requireAuth: true,
  });
}

export async function confirmPaymentOtp(
  paymentId: string,
  otp: string,
): Promise<unknown> {
  return saspayRequest<unknown>({
    method: 'POST',
    path: `/payments/${encodeURIComponent(paymentId)}/confirm-otp/`,
    body: { otp: otp.trim() },
    requireAuth: true,
  });
}

export async function retryPayment(
  paymentId: string,
  body: {
    methods?: string[];
    customer?: {
      email?: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    };
    preferred_gateway?: string;
  },
  idempotencyKey: string,
): Promise<SasPaySoftpayResponse> {
  return saspayRequest<SasPaySoftpayResponse>({
    method: 'POST',
    path: `/payments/${encodeURIComponent(paymentId)}/retry/`,
    body,
    idempotencyKey,
    requireAuth: true,
  });
}

export async function verifyPayment(paymentId: string): Promise<SasPayVerifyResponse> {
  return saspayRequest<SasPayVerifyResponse>({
    method: 'GET',
    path: `/payments/${encodeURIComponent(paymentId)}/verify/`,
    requireAuth: true,
  });
}

export async function createCheckoutSession(
  payload: SasPayCheckoutSessionRequest,
): Promise<SasPayCheckoutSessionResponse> {
  return saspayRequest<SasPayCheckoutSessionResponse>({
    method: 'POST',
    path: '/checkout-sessions/',
    body: {
      ...payload,
      amount: formatDecimalAmount(payload.amount),
    },
    requireAuth: true,
  });
}

export async function getCheckoutSessionStatus(
  sessionId: string,
): Promise<SasPayCheckoutSessionStatusResponse> {
  return saspayRequest<SasPayCheckoutSessionStatusResponse>({
    method: 'GET',
    path: `/checkout-sessions/${encodeURIComponent(sessionId)}/status/`,
    requireAuth: true,
  });
}

export async function cancelCheckoutSession(sessionId: string): Promise<unknown> {
  return saspayRequest<unknown>({
    method: 'POST',
    path: `/checkout-sessions/${encodeURIComponent(sessionId)}/cancel/`,
    body: {},
    requireAuth: true,
  });
}

export async function initializePayout(
  payload: SasPayPayoutRequest,
  idempotencyKey: string,
): Promise<{ message?: string; id: string }> {
  return saspayRequest<{ message?: string; id: string }>({
    method: 'POST',
    path: '/payouts/initialize/',
    body: {
      ...payload,
      amount: formatDecimalAmount(payload.amount),
    },
    idempotencyKey,
    requireAuth: true,
  });
}

export async function verifyPayout(payoutId: string): Promise<SasPayVerifyResponse> {
  return saspayRequest<SasPayVerifyResponse>({
    method: 'GET',
    path: `/payouts/${encodeURIComponent(payoutId)}/verify/`,
    requireAuth: true,
  });
}

export async function createWalletTransfer(
  payload: SasPayWalletTransferRequest,
  idempotencyKey: string,
): Promise<{ id?: string; status?: string; [k: string]: unknown }> {
  return saspayRequest<{ id?: string; status?: string; [k: string]: unknown }>({
    method: 'POST',
    path: '/wallet-transfers/',
    body: {
      ...payload,
      from_amount: formatDecimalAmount(payload.from_amount),
    },
    idempotencyKey,
    requireAuth: true,
  });
}

export async function listMerchantBalances(): Promise<SasPayMerchantBalance[]> {
  const res = await saspayRequest<
    SasPayMerchantBalance[] | { results?: SasPayMerchantBalance[] }
  >({
    method: 'GET',
    path: '/merchant-balances/?page_size=100',
    requireAuth: true,
  });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.results)) return res.results;
  return [];
}

export async function listTransactions(cursor?: string): Promise<{
  next?: string | null;
  previous?: string | null;
  results?: unknown[];
}> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return saspayRequest<{
    next?: string | null;
    previous?: string | null;
    results?: unknown[];
  }>({
    method: 'GET',
    path: `/transactions/${qs}`,
    requireAuth: true,
  });
}

export async function listMerchantWebhooks(): Promise<unknown[]> {
  const res = await saspayRequest<unknown[] | { results?: unknown[] }>({
    method: 'GET',
    path: '/merchant-webhooks/?page_size=50',
    requireAuth: true,
  });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.results)) return res.results;
  return [];
}

export async function listMerchantWebhookSubscriptions(): Promise<unknown[]> {
  const res = await saspayRequest<unknown[] | { results?: unknown[] }>({
    method: 'GET',
    path: '/merchant-webhook-subscriptions/?page_size=50',
    requireAuth: true,
  });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.results)) return res.results;
  return [];
}

export async function listWebhookLogs(): Promise<unknown[]> {
  const res = await saspayRequest<unknown[] | { results?: unknown[] }>({
    method: 'GET',
    path: '/webhook-logs/?page_size=50',
    requireAuth: true,
  });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.results)) return res.results;
  return [];
}
