import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { getSasPayWebhookSecret, verifyPayment, verifyPayout } from './saspay-client.ts';
import {
  getOrderByPaymentId,
  recordWebhookIdempotent,
  updateOrder,
  updatePayoutBySasPayId,
} from './saspay-store.ts';
import type { SasPayStatus } from './saspay-types.ts';

const MAX_WEBHOOK_AGE_SECONDS = 300;

export const SUPPORTED_WEBHOOK_EVENTS = new Set([
  'transaction.created',
  'transaction.success',
  'transaction.failed',
  'transaction.cancelled',
  'settlement.requested',
  'settlement.approved',
  'settlement.success',
  'settlement.failed',
  'settlement.cancelled',
  'wallet_transfer.requested',
  'wallet_transfer.completed',
  'wallet_transfer.rejected',
  'webhook.test',
]);

export function verifySasPayWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  timestampHeader: string | undefined,
  secret: string,
): { valid: boolean; reason?: string } {
  if (!secret) {
    return { valid: false, reason: 'webhook_secret_not_configured' };
  }
  if (!signatureHeader || !timestampHeader) {
    return { valid: false, reason: 'missing_webhook_headers' };
  }

  const tsNum = Number(timestampHeader.trim());
  if (!Number.isInteger(tsNum) || tsNum <= 0) {
    return { valid: false, reason: 'invalid_timestamp' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - tsNum) > MAX_WEBHOOK_AGE_SECONDS) {
    return { valid: false, reason: 'timestamp_expired' };
  }

  const signedPayload = Buffer.concat([
    Buffer.from(`${tsNum}.`, 'utf8'),
    rawBody,
  ]);
  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')
    .toLowerCase();

  const receivedHex = signatureHeader.trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(receivedHex)) {
    return { valid: false, reason: 'invalid_signature_format' };
  }

  const expectedBuf = Buffer.from(expectedHex, 'hex');
  const receivedBuf = Buffer.from(receivedHex, 'hex');
  if (expectedBuf.length !== receivedBuf.length) {
    return { valid: false, reason: 'signature_length_mismatch' };
  }

  const match = crypto.timingSafeEqual(expectedBuf, receivedBuf);
  return match ? { valid: true } : { valid: false, reason: 'signature_mismatch' };
}

function normalizeStatus(status: unknown): SasPayStatus | null {
  if (
    status === 'PENDING' ||
    status === 'SUCCESS' ||
    status === 'FAILED' ||
    status === 'CANCELLED' ||
    status === 'EXPIRED'
  ) {
    return status;
  }
  return null;
}

async function processWebhookPayloadAsync(
  eventName: string,
  timestamp: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const data =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : {};

  const txId = typeof data.id === 'string' ? data.id : undefined;
  const reference = typeof data.reference === 'string' ? data.reference : undefined;
  const currency = typeof data.currency === 'string' ? data.currency : undefined;
  const netAmount =
    typeof data.net_amount === 'string' ? data.net_amount : undefined;
  const charged =
    typeof data.charged === 'string'
      ? data.charged
      : typeof data.debited_amount === 'string'
        ? data.debited_amount
        : undefined;

  const dedupKey = `${eventName}:${txId || reference || 'none'}:${timestamp}`;
  const isNew = await recordWebhookIdempotent({
    dedupKey,
    event: eventName,
    timestamp,
    validSignature: true,
    transactionId: txId,
    reference,
    status: typeof data.status === 'string' ? data.status : undefined,
    charged,
    netAmount,
    currency,
    processedAt: new Date().toISOString(),
  });

  if (!isNew) {
    return;
  }

  if (eventName === 'webhook.test' || eventName.startsWith('settlement.')) {
    // Note: settlement.* payload data schema is not guaranteed stable by SasPay;
    // record receipt idempotently without relying on internal settlement.* fields.
    return;
  }

  if (
    txId &&
    (eventName === 'transaction.created' ||
      eventName === 'transaction.success' ||
      eventName === 'transaction.failed' ||
      eventName === 'transaction.cancelled')
  ) {
    const existingOrder = await getOrderByPaymentId(txId);
    if (existingOrder) {
      let mappedStatus: SasPayStatus =
        normalizeStatus(data.status) ||
        (eventName === 'transaction.success'
          ? 'SUCCESS'
          : eventName === 'transaction.failed'
            ? 'FAILED'
            : eventName === 'transaction.cancelled'
              ? 'CANCELLED'
              : 'PENDING');

      let verifiedCharged = charged;
      let verifiedNetAmount = netAmount;
      let verifiedRef = reference;
      let verifiedMode: string | undefined;

      // Cross-verify against /payments/{id}/verify/ if status is SUCCESS so delivery
      // and accounting (charged & net_amount) are backed by authoritative gateway data
      if (mappedStatus === 'SUCCESS') {
        try {
          const verified = await verifyPayment(txId);
          mappedStatus = normalizeStatus(verified.status) || mappedStatus;
          verifiedCharged =
            verified.charged || verified.debited_amount || verifiedCharged;
          verifiedNetAmount = verified.net_amount || verifiedNetAmount;
          verifiedRef = verified.reference || verifiedRef;
          verifiedMode = verified.fee_charge_mode;
        } catch {
          // Keep webhook-supplied accounting fields if verify call is transiently rate-limited
        }
      }

      await updateOrder(existingOrder.orderId, (cur) => ({
        ...cur,
        status: mappedStatus,
        charged: verifiedCharged ?? cur.charged,
        netAmount: verifiedNetAmount ?? cur.netAmount,
        reference: verifiedRef ?? cur.reference,
        feeChargeMode: verifiedMode ?? cur.feeChargeMode,
        updatedAt: new Date().toISOString(),
      }));
      return;
    }

    // Check if txId belongs to a tracked payout
    let payoutStatus: SasPayStatus =
      normalizeStatus(data.status) ||
      (eventName === 'transaction.success'
        ? 'SUCCESS'
        : eventName === 'transaction.failed'
          ? 'FAILED'
          : eventName === 'transaction.cancelled'
            ? 'CANCELLED'
            : 'PENDING');

    let payoutCharged = charged;
    let payoutNet = netAmount;
    try {
      const verified = await verifyPayout(txId);
      payoutStatus = normalizeStatus(verified.status) || payoutStatus;
      payoutCharged = verified.charged || verified.debited_amount || payoutCharged;
      payoutNet = verified.net_amount || payoutNet;
    } catch {
      // ignore if not a payout
    }

    await updatePayoutBySasPayId(txId, (cur) => ({
      ...cur,
      status: payoutStatus,
      charged: payoutCharged ?? cur.charged,
      netAmount: payoutNet ?? cur.netAmount,
      reference: reference ?? cur.reference,
      updatedAt: new Date().toISOString(),
    }));
  }
}

export function handleSasPayWebhook(req: Request, res: Response): void {
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(typeof req.body === 'string' ? req.body : '');

  const signature = req.header('X-Webhook-Signature');
  const timestamp = req.header('X-Webhook-Timestamp');
  const headerEvent = req.header('X-Webhook-Event');
  const secret = getSasPayWebhookSecret();

  const verification = verifySasPayWebhookSignature(
    rawBody,
    signature,
    timestamp,
    secret,
  );

  if (!verification.valid) {
    const statusCode =
      verification.reason === 'webhook_secret_not_configured' ? 503 : 401;
    res.status(statusCode).json({
      received: false,
      error: verification.reason,
    });
    return;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>;
  } catch {
    res.status(400).json({ received: false, error: 'invalid_json_body' });
    return;
  }

  const eventName =
    (typeof parsed.event === 'string' && parsed.event) ||
    headerEvent ||
    'unknown';

  // Respond quickly with 2xx before background reconciliation
  res.status(200).json({
    received: true,
    event: eventName,
    supported: SUPPORTED_WEBHOOK_EVENTS.has(eventName),
  });

  if (SUPPORTED_WEBHOOK_EVENTS.has(eventName) && timestamp) {
    setImmediate(() => {
      processWebhookPayloadAsync(eventName, timestamp, parsed).catch(() => {
        // Silent background safeguard: never log secrets or crash request loop
      });
    });
  }
}
