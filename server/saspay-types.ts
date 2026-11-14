export type SasPayStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type SasPayFeeChargeMode = 'ADD_ON' | 'DEDUCTED';
export type SasPayFlowType = 'softpay' | 'checkout_session';

export interface SasPayCountry {
  id: string;
  iso_code: string;
  name: string;
  default_currency: string;
  is_active: boolean;
}

export interface SasPayNetwork {
  id: string;
  name: string;
  code: string;
  country?: string;
  country_code?: string;
  is_active: boolean;
  supports_payin?: boolean;
  supports_payout?: boolean;
}

export interface SasPayPricingTier {
  min_amount: string;
  max_amount: string | null;
  currency: string;
  percent: string;
  fixed: string;
  floor_amount: string | null;
  cap_amount: string | null;
  fee_charge_mode: SasPayFeeChargeMode;
}

export interface SasPayPricingChannel {
  available: boolean;
  is_custom: boolean;
  otp_required: boolean;
  otp_instructions: string;
  tiers: SasPayPricingTier[];
}

export interface SasPayPricingRate {
  country_code: string;
  country_name: string;
  currency: string;
  network_code: string;
  network_name: string;
  payin: SasPayPricingChannel;
  payout: SasPayPricingChannel;
}

export interface SasPayCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface SasPaySoftpayRequest {
  amount: string;
  currency: string;
  country: string;
  network: string;
  description?: string;
  customer: SasPayCustomer;
  metadata?: Record<string, unknown>;
  fee_charge_mode?: SasPayFeeChargeMode;
  preferred_gateway?: string;
  otp?: string;
  return_url?: string;
}

export interface SasPaySoftpayResponse {
  message?: string;
  id: string;
  status: SasPayStatus | string;
  checkout_url?: string;
  bank_transfer?: Record<string, unknown>;
}

export interface SasPayCheckoutSessionRequest {
  amount: string;
  currency: string;
  description?: string;
  country?: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  return_url?: string;
  metadata?: Record<string, unknown>;
  fee_charge_mode?: SasPayFeeChargeMode;
  expires_at?: string;
}

export interface SasPayCheckoutSessionResponse {
  id: string;
  slug: string;
  checkout_url: string;
  amount: string;
  currency: string;
  description?: string;
  country?: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | string;
  transaction?: string | null;
  paid_at?: string | null;
  created_at?: string;
}

export interface SasPayCheckoutSessionStatusResponse {
  id: string;
  slug: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | string;
  transaction_id?: string | null;
  transaction_status?: SasPayStatus | string | null;
  transaction_reference?: string | null;
}

export interface SasPayVerifyResponse {
  message?: string;
  id: string;
  reference?: string;
  merchant?: string;
  transaction_type?: string;
  flow_direction?: string;
  description?: string;
  requested_amount?: string;
  fee_charge_mode?: SasPayFeeChargeMode | string;
  client_fee?: string;
  gateway_fee?: string;
  platform_fee?: string;
  debited_amount?: string;
  charged?: string;
  net_amount?: string;
  currency: string;
  status: SasPayStatus | string;
  external_reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SasPayPayoutRequest {
  amount: string;
  currency: string;
  country: string;
  description?: string;
  customer: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  method: string;
  recipient: {
    msisdn: string;
  };
  metadata?: Record<string, unknown>;
  fee_charge_mode?: SasPayFeeChargeMode;
  preferred_gateway?: string;
}

export interface SasPayWalletTransferRequest {
  from_country: string;
  to_country: string;
  from_amount: string;
}

export interface SasPayMerchantBalance {
  id: string;
  merchant: string;
  country: string;
  currency: string;
  available_amount: string;
  pending_amount: string;
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderRecord {
  orderId: string;
  intentType: 'donation' | 'ebook';
  itemId: string;
  itemTitle: string;
  project?: string;
  flow: SasPayFlowType;
  idempotencyKey: string;
  amount: string;
  currency: string;
  country: string;
  network?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentId?: string;
  checkoutSessionId?: string;
  checkoutSessionSlug?: string;
  checkoutUrl?: string;
  bankTransfer?: Record<string, unknown>;
  reference?: string;
  externalReference?: string;
  status: SasPayStatus;
  charged?: string;
  netAmount?: string;
  feeChargeMode?: string;
  delivered: boolean;
  deliveredAt?: string;
  donorRecorded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRecord {
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
}

export interface WalletTransferRecord {
  localId: string;
  transferId?: string;
  idempotencyKey: string;
  fromCountry: string;
  toCountry: string;
  fromAmount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookReceiptRecord {
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
}
