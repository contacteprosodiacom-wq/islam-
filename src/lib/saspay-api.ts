export type SasPayStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type SasPayFeeChargeMode = 'ADD_ON' | 'DEDUCTED';

export interface SasPayConfigStatus {
  configured: boolean;
  mode: 'test' | 'live' | 'custom' | 'unconfigured';
  webhookConfigured: boolean;
  webhookUrl: string;
  baseUrl: string;
}

export interface SasPayCountryItem {
  id: string;
  iso_code: string;
  name: string;
  default_currency: string;
  is_active: boolean;
}

export interface SasPayPricingRateItem {
  country_code: string;
  country_name: string;
  currency: string;
  network_code: string;
  network_name: string;
  payin?: {
    available: boolean;
    otp_required: boolean;
    otp_instructions: string;
    tiers?: Array<{
      min_amount: string;
      max_amount: string | null;
      currency: string;
      percent: string;
      fixed: string;
      fee_charge_mode: SasPayFeeChargeMode;
    }>;
  };
  payout?: {
    available: boolean;
    otp_required: boolean;
    otp_instructions: string;
  };
}

export interface SasPayReferenceData {
  configured: boolean;
  mode: 'test' | 'live' | 'custom' | 'unconfigured';
  countries: SasPayCountryItem[];
  rates: SasPayPricingRateItem[];
  networks: Array<{
    id: string;
    name: string;
    code: string;
    country_code?: string;
    is_active: boolean;
  }>;
  exchangeRates: Array<{
    from_currency?: string;
    to_currency?: string;
    rate?: string;
    [k: string]: unknown;
  }>;
  authWarning?: { status: number; code: string; message: string } | null;
}

export interface PublicSasPayOrder {
  orderId: string;
  intentType: 'donation' | 'ebook';
  itemId: string;
  itemTitle: string;
  project?: string;
  flow: 'softpay' | 'checkout_session';
  amount: string;
  currency: string;
  country: string;
  network?: string;
  customerName: string;
  paymentId?: string;
  checkoutSessionId?: string;
  checkoutUrl: string;
  requiresRedirect: boolean;
  bankTransfer?: Record<string, unknown>;
  reference?: string;
  externalReference?: string;
  status: SasPayStatus;
  charged?: string;
  netAmount?: string;
  feeChargeMode?: string;
  delivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  retryAfterMs?: number;

  constructor(status: number, code: string, message: string, retryAfterMs?: number) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfterMs = retryAfterMs;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  let json: Record<string, unknown> = {};
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new ApiClientError(
        res.status || 502,
        'invalid_server_response',
        contentType.includes('text/html')
          ? 'Le serveur de paiement backend ne répond pas sur cette adresse (republiez l’application ou utilisez le serveur Node.js).'
          : 'Réponse invalide du serveur de paiement.',
      );
    }
  }
  if (!res.ok) {
    const errObj =
      json.error && typeof json.error === 'object'
        ? (json.error as { status?: number; code?: string; message?: string; retryAfterMs?: number })
        : {};
    throw new ApiClientError(
      errObj.status || res.status,
      errObj.code || `http_${res.status}`,
      errObj.message || `Erreur serveur (${res.status})`,
      errObj.retryAfterMs,
    );
  }
  return json as T;
}

export function toDecimalString(value: number | string): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (!Number.isFinite(num) || num <= 0) return '0.00';
  return num.toFixed(2);
}

export async function fetchSasPayStatus(): Promise<SasPayConfigStatus> {
  const res = await fetch('/api/saspay/status');
  return parseResponse<SasPayConfigStatus>(res);
}

export async function fetchSasPayReference(): Promise<SasPayReferenceData> {
  const res = await fetch('/api/saspay/reference');
  return parseResponse<SasPayReferenceData>(res);
}

export async function createSoftpayOrder(payload: {
  orderId?: string;
  intentType: 'donation' | 'ebook';
  itemId: string;
  itemTitle: string;
  project?: string;
  amount: string;
  currency: string;
  country: string;
  network: string;
  otp?: string;
  fee_charge_mode?: SasPayFeeChargeMode;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
}): Promise<{ order: PublicSasPayOrder; message: string }> {
  const res = await fetch('/api/saspay/orders/softpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ order: PublicSasPayOrder; message: string }>(res);
}

export async function createCheckoutOrder(payload: {
  intentType: 'donation' | 'ebook';
  itemId: string;
  itemTitle: string;
  project?: string;
  amount: string;
  currency: string;
  country?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  fee_charge_mode?: SasPayFeeChargeMode;
}): Promise<{ order: PublicSasPayOrder }> {
  const res = await fetch('/api/saspay/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ order: PublicSasPayOrder }>(res);
}

export async function confirmSoftpayOtp(paymentId: string, otp: string): Promise<unknown> {
  const res = await fetch(`/api/saspay/payments/${encodeURIComponent(paymentId)}/confirm-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp }),
  });
  return parseResponse<unknown>(res);
}

export async function retrySoftpayPayment(
  paymentId: string,
  payload: {
    methods?: string[];
    retryAttemptKey: string;
    customer?: {
      email?: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    };
  },
): Promise<{ order: PublicSasPayOrder | null }> {
  const res = await fetch(`/api/saspay/payments/${encodeURIComponent(paymentId)}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ order: PublicSasPayOrder | null }>(res);
}

export async function verifySasPayOrder(orderId: string): Promise<{
  order: PublicSasPayOrder;
  shouldRecordDonor: boolean;
  canDeliver: boolean;
}> {
  const res = await fetch(`/api/saspay/orders/${encodeURIComponent(orderId)}/verify`);
  return parseResponse<{
    order: PublicSasPayOrder;
    shouldRecordDonor: boolean;
    canDeliver: boolean;
  }>(res);
}

export async function cancelSasPaySession(sessionId: string): Promise<unknown> {
  const res = await fetch(`/api/saspay/checkout-sessions/${encodeURIComponent(sessionId)}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return parseResponse<unknown>(res);
}

export async function deliverSasPayOrder(orderId: string): Promise<{
  delivered: boolean;
  order: PublicSasPayOrder;
  fileName: string;
  content: string;
}> {
  const res = await fetch(`/api/saspay/orders/${encodeURIComponent(orderId)}/deliver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return parseResponse<{
    delivered: boolean;
    order: PublicSasPayOrder;
    fileName: string;
    content: string;
  }>(res);
}

export interface SasPayAdminOverview {
  config: { configured: boolean; mode: string; webhookConfigured: boolean };
  local: {
    orders: PublicSasPayOrder[];
    payouts: Array<{
      localId: string;
      payoutId?: string;
      idempotencyKey: string;
      amount: string;
      currency: string;
      country: string;
      method: string;
      recipientMsisdn: string;
      description?: string;
      status: SasPayStatus;
      charged?: string;
      netAmount?: string;
      reference?: string;
      createdAt: string;
      updatedAt: string;
    }>;
    walletTransfers: Array<{
      localId: string;
      transferId?: string;
      idempotencyKey: string;
      fromCountry: string;
      toCountry: string;
      fromAmount: string;
      status: string;
      createdAt: string;
    }>;
    webhooks: Array<{
      dedupKey: string;
      event: string;
      timestamp: string;
      validSignature: boolean;
      transactionId?: string;
      reference?: string;
      status?: string;
      charged?: string;
      netAmount?: string;
      currency?: string;
      processedAt: string;
    }>;
    accounting: Record<string, { totalCharged: string; totalNetAmount: string; count: number }>;
  };
  remote: {
    balances: Array<{
      id: string;
      country: string;
      currency: string;
      available_amount: string;
      pending_amount: string;
      is_frozen: boolean;
    }>;
    transactions: Array<Record<string, unknown>>;
    webhooksConfig: Array<Record<string, unknown>>;
    webhookSubscriptions: Array<Record<string, unknown>>;
    remoteWebhookLogs: Array<Record<string, unknown>>;
  };
  warnings: Array<{ source: string; status: number; code: string; message: string }>;
}

export async function fetchSasPayAdminOverview(idToken: string): Promise<SasPayAdminOverview> {
  const res = await fetch('/api/saspay/admin/overview', {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return parseResponse<SasPayAdminOverview>(res);
}

export async function initializeSasPayPayout(
  idToken: string,
  payload: {
    amount: string;
    currency: string;
    country: string;
    method: string;
    msisdn: string;
    description?: string;
    idempotencyKey: string;
  },
) {
  const res = await fetch('/api/saspay/admin/payouts/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ payout: SasPayAdminOverview['local']['payouts'][0] }>(res);
}

export async function verifySasPayPayout(idToken: string, payoutId: string) {
  const res = await fetch(`/api/saspay/admin/payouts/${encodeURIComponent(payoutId)}/verify`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return parseResponse<unknown>(res);
}

export async function createSasPayWalletTransfer(
  idToken: string,
  payload: {
    from_country: string;
    to_country: string;
    from_amount: string;
    idempotencyKey: string;
  },
) {
  const res = await fetch('/api/saspay/admin/wallet-transfers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<unknown>(res);
}
