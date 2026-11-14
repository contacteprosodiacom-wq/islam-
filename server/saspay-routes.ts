import crypto from 'node:crypto';
import express from 'express';
import type { Request, Response } from 'express';
import { requireAdminAuth } from './auth-admin.ts';
import {
  SasPayHttpError,
  cancelCheckoutSession,
  confirmPaymentOtp,
  createCheckoutSession,
  createWalletTransfer,
  formatDecimalAmount,
  generateIdempotencyKey,
  getCheckoutSessionStatus,
  getMyRates,
  getSasPayConfigSummary,
  initializePayout,
  listCountries,
  listExchangeRates,
  listMerchantBalances,
  listMerchantWebhookSubscriptions,
  listMerchantWebhooks,
  listNetworks,
  listTransactions,
  listWebhookLogs,
  retryPayment,
  softpayPayment,
  verifyPayment,
  verifyPayout,
} from './saspay-client.ts';
import {
  claimOrderDeliveryOnce,
  getOrderById,
  getOrderByPaymentId,
  getOrderBySessionId,
  getStoreSnapshot,
  markDonationRecordedOnce,
  saveOrder,
  savePayout,
  saveWalletTransfer,
  updateOrder,
  updatePayoutBySasPayId,
} from './saspay-store.ts';
import type { OrderRecord, SasPayFeeChargeMode, SasPayStatus } from './saspay-types.ts';

function resolveAppOrigin(req: Request): string {
  const configured = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (configured && configured !== 'MY_APP_URL') {
    return configured;
  }
  const proto = (req.header('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim();
  const host = (req.header('x-forwarded-host') || req.get('host') || 'localhost:3000').split(',')[0].trim();
  return `${proto}://${host}`;
}

function sendErrorResponse(res: Response, err: unknown): void {
  if (err instanceof SasPayHttpError) {
    res.status(err.status).json({
      error: {
        status: err.status,
        code: err.code,
        message: err.message,
        retryAfterMs: err.retryAfterMs,
      },
    });
    return;
  }
  const message = err instanceof Error ? err.message : 'Erreur interne du serveur';
  res.status(500).json({
    error: {
      status: 500,
      code: 'internal_error',
      message,
    },
  });
}

function normalizeStatus(status: unknown): SasPayStatus {
  if (
    status === 'PENDING' ||
    status === 'SUCCESS' ||
    status === 'FAILED' ||
    status === 'CANCELLED' ||
    status === 'EXPIRED'
  ) {
    return status;
  }
  return 'PENDING';
}

function sanitizePublicOrder(order: OrderRecord) {
  return {
    orderId: order.orderId,
    intentType: order.intentType,
    itemId: order.itemId,
    itemTitle: order.itemTitle,
    project: order.project,
    flow: order.flow,
    amount: order.amount,
    currency: order.currency,
    country: order.country,
    network: order.network,
    customerName: order.customerName,
    paymentId: order.paymentId,
    checkoutSessionId: order.checkoutSessionId,
    checkoutUrl: order.checkoutUrl || '',
    requiresRedirect: Boolean(order.checkoutUrl && order.checkoutUrl.trim().length > 0),
    bankTransfer: order.bankTransfer,
    reference: order.reference,
    externalReference: order.externalReference,
    status: order.status,
    charged: order.charged,
    netAmount: order.netAmount,
    feeChargeMode: order.feeChargeMode,
    delivered: order.delivered,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function createSasPayRouter(): express.Router {
  const router = express.Router();

  // 1. Non-sensitive configuration status & webhook URL
  router.get('/status', (req: Request, res: Response) => {
    const summary = getSasPayConfigSummary();
    const origin = resolveAppOrigin(req);
    res.json({
      ...summary,
      webhookUrl: `${origin}/api/saspay/webhook`,
      baseUrl: 'https://api.saspay.me/api/v1',
    });
  });

  // 2. Public/merchant reference data (countries + networks + pricing/OTP requirements + FX)
  router.get('/reference', async (_req: Request, res: Response) => {
    try {
      const countries = await listCountries();
      const summary = getSasPayConfigSummary();
      let rates: unknown[] = [];
      let networks: unknown[] = [];
      let exchangeRates: unknown[] = [];
      let authWarning: { code: string; message: string; status: number } | null = null;

      if (summary.configured) {
        const [ratesRes, networksRes, fxRes] = await Promise.allSettled([
          getMyRates(),
          listNetworks(),
          listExchangeRates(),
        ]);

        if (ratesRes.status === 'fulfilled') rates = ratesRes.value;
        else if (ratesRes.reason instanceof SasPayHttpError) {
          authWarning = {
            status: ratesRes.reason.status,
            code: ratesRes.reason.code,
            message: ratesRes.reason.message,
          };
        }

        if (networksRes.status === 'fulfilled') networks = networksRes.value;
        if (fxRes.status === 'fulfilled') exchangeRates = fxRes.value;
      }

      res.json({
        configured: summary.configured,
        mode: summary.mode,
        countries: countries.filter((c) => c.is_active),
        rates,
        networks,
        exchangeRates,
        authWarning,
      });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  // 3. Softpay direct initiation (always with Idempotency-Key)
  router.post('/orders/softpay', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as {
        orderId?: string;
        intentType?: 'donation' | 'ebook';
        itemId?: string;
        itemTitle?: string;
        project?: string;
        amount?: string | number;
        currency?: string;
        country?: string;
        network?: string;
        otp?: string;
        fee_charge_mode?: SasPayFeeChargeMode;
        customer?: {
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
        };
      };

      const intentType = body.intentType === 'ebook' ? 'ebook' : 'donation';
      const itemId = (body.itemId || body.project || 'general-sadaqa').trim();
      const itemTitle = (body.itemTitle || body.project || 'Don Sadaqa Jariya').trim();
      const country = (body.country || '').trim().toUpperCase();
      const currency = (body.currency || '').trim().toUpperCase();
      const network = (body.network || '').trim();
      const amount = formatDecimalAmount(body.amount ?? '');

      if (country.length !== 2) {
        throw new SasPayHttpError(400, 'invalid_country', 'Code pays ISO à 2 lettres requis.');
      }
      if (currency.length !== 3) {
        throw new SasPayHttpError(400, 'invalid_currency', 'Code devise à 3 lettres requis.');
      }
      if (!network) {
        throw new SasPayHttpError(400, 'missing_method', 'Réseau de paiement requis.');
      }

      const cust = body.customer || {};
      const email = (cust.email || '').trim();
      const firstName = (cust.first_name || '').trim();
      const lastName = (cust.last_name || '').trim() || firstName;
      const phone = (cust.phone || '').trim();

      if (!email || !firstName || !phone) {
        throw new SasPayHttpError(
          400,
          'invalid_customer',
          'Email, prénom et numéro de téléphone international requis.',
        );
      }

      // Reuse order's persisted idempotency key if caller retries the exact intent
      const requestedOrderId = (body.orderId || '').trim();
      const existingOrder = requestedOrderId ? await getOrderById(requestedOrderId) : null;
      const orderId = existingOrder?.orderId || requestedOrderId || crypto.randomUUID();
      const idempotencyKey = existingOrder?.idempotencyKey || generateIdempotencyKey();

      const origin = resolveAppOrigin(req);
      const returnRoute = intentType === 'ebook' ? 'ebooks' : 'dons';
      const returnUrl = `${origin}/#${returnRoute}?saspay_order=${encodeURIComponent(orderId)}`;

      const softpayPayload: {
        amount: string;
        currency: string;
        country: string;
        network: string;
        description: string;
        customer: {
          email: string;
          first_name: string;
          last_name: string;
          phone: string;
        };
        metadata: Record<string, unknown>;
        otp?: string;
        fee_charge_mode?: SasPayFeeChargeMode;
        return_url?: string;
      } = {
        amount,
        currency,
        country,
        network,
        description: `${itemTitle} (${orderId.slice(0, 8)})`,
        customer: {
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
        },
        metadata: {
          order_id: orderId,
          intent_type: intentType,
          item_id: itemId,
          project: body.project || undefined,
        },
      };

      if (body.otp && body.otp.trim()) {
        softpayPayload.otp = body.otp.trim();
      }
      if (body.fee_charge_mode === 'ADD_ON' || body.fee_charge_mode === 'DEDUCTED') {
        softpayPayload.fee_charge_mode = body.fee_charge_mode;
      }
      // return_url is required when network is card or crypto
      if (network === 'card' || network === 'crypto') {
        softpayPayload.return_url = returnUrl;
      }

      const now = new Date().toISOString();
      if (!existingOrder) {
        await saveOrder({
          orderId,
          intentType,
          itemId,
          itemTitle,
          project: body.project,
          flow: 'softpay',
          idempotencyKey,
          amount,
          currency,
          country,
          network,
          customerName: `${firstName} ${lastName}`.trim(),
          customerEmail: email,
          customerPhone: phone,
          status: 'PENDING',
          delivered: false,
          createdAt: now,
          updatedAt: now,
        });
      }

      const result = await softpayPayment(softpayPayload, idempotencyKey);
      const updated = await updateOrder(orderId, (cur) => ({
        ...cur,
        paymentId: result.id,
        checkoutUrl: result.checkout_url || '',
        bankTransfer: result.bank_transfer,
        status: normalizeStatus(result.status),
        updatedAt: new Date().toISOString(),
      }));

      res.status(201).json({
        order: sanitizePublicOrder(updated!),
        message: result.message || 'Paiement initié.',
      });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  // 4. Hosted Checkout Session initiation
  router.post('/orders/checkout', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as {
        intentType?: 'donation' | 'ebook';
        itemId?: string;
        itemTitle?: string;
        project?: string;
        amount?: string | number;
        currency?: string;
        country?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        fee_charge_mode?: SasPayFeeChargeMode;
      };

      const intentType = body.intentType === 'ebook' ? 'ebook' : 'donation';
      const itemId = (body.itemId || body.project || 'general-sadaqa').trim();
      const itemTitle = (body.itemTitle || body.project || 'Don Sadaqa Jariya').trim();
      const amount = formatDecimalAmount(body.amount ?? '');
      const currency = (body.currency || 'XOF').trim().toUpperCase();
      const country = (body.country || '').trim().toUpperCase();
      const customerName = (body.customerName || '').trim();
      const customerEmail = (body.customerEmail || '').trim();
      const customerPhone = (body.customerPhone || '').trim();

      if (currency.length !== 3) {
        throw new SasPayHttpError(400, 'invalid_currency', 'Code devise à 3 lettres requis.');
      }
      if (!customerName || !customerEmail) {
        throw new SasPayHttpError(
          400,
          'invalid_customer',
          'Nom complet et adresse e-mail requis.',
        );
      }

      const orderId = crypto.randomUUID();
      const origin = resolveAppOrigin(req);
      const returnRoute = intentType === 'ebook' ? 'ebooks' : 'dons';
      const returnUrl = `${origin}/#${returnRoute}?saspay_order=${encodeURIComponent(orderId)}`;

      const session = await createCheckoutSession({
        amount,
        currency,
        country: country.length === 2 ? country : undefined,
        description: `${itemTitle} (${orderId.slice(0, 8)})`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || undefined,
        return_url: returnUrl,
        fee_charge_mode:
          body.fee_charge_mode === 'ADD_ON' || body.fee_charge_mode === 'DEDUCTED'
            ? body.fee_charge_mode
            : undefined,
        metadata: {
          order_id: orderId,
          intent_type: intentType,
          item_id: itemId,
          project: body.project || undefined,
        },
      });

      const now = new Date().toISOString();
      const saved = await saveOrder({
        orderId,
        intentType,
        itemId,
        itemTitle,
        project: body.project,
        flow: 'checkout_session',
        idempotencyKey: generateIdempotencyKey(),
        amount,
        currency,
        country: country || 'BJ',
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        checkoutSessionId: session.id,
        checkoutSessionSlug: session.slug,
        checkoutUrl: session.checkout_url,
        status: 'PENDING',
        delivered: false,
        createdAt: now,
        updatedAt: now,
      });

      res.status(201).json({
        order: sanitizePublicOrder(saved),
      });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  // 5. Confirm post-push OTP (Coris BJ, Wizall SN)
  router.post('/payments/:paymentId/confirm-otp', async (req: Request, res: Response) => {
    try {
      const paymentId = req.params.paymentId;
      const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
      if (!otp) {
        throw new SasPayHttpError(400, 'missing_otp', 'Code OTP requis.');
      }
      const result = await confirmPaymentOtp(paymentId, otp);
      res.json({ ok: true, result });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  // 6. Retry failed softpay payment (always with Idempotency-Key)
  router.post('/payments/:paymentId/retry', async (req: Request, res: Response) => {
    try {
      const paymentId = req.params.paymentId;
      const body = (req.body || {}) as {
        methods?: string[];
        preferred_gateway?: string;
        retryAttemptKey?: string;
        customer?: {
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
        };
      };

      const idempotencyKey =
        typeof body.retryAttemptKey === 'string' && body.retryAttemptKey.trim()
          ? body.retryAttemptKey.trim()
          : generateIdempotencyKey();

      const retryRes = await retryPayment(
        paymentId,
        {
          methods: Array.isArray(body.methods) && body.methods.length > 0 ? body.methods : undefined,
          customer: body.customer,
          preferred_gateway: body.preferred_gateway,
        },
        idempotencyKey,
      );

      const order = await getOrderByPaymentId(paymentId);
      let updatedOrder = order;
      if (order) {
        updatedOrder = await updateOrder(order.orderId, (cur) => ({
          ...cur,
          status: normalizeStatus(retryRes.status || 'PENDING'),
          checkoutUrl: retryRes.checkout_url ?? cur.checkoutUrl,
          bankTransfer: retryRes.bank_transfer ?? cur.bankTransfer,
          updatedAt: new Date().toISOString(),
        }));
      }

      res.json({
        order: updatedOrder ? sanitizePublicOrder(updatedOrder) : null,
        retry: retryRes,
      });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  // 7. Active authoritative verification before any fulfillment or donor logging
  router.get('/orders/:orderId/verify', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const order = await getOrderById(orderId);
      if (!order) {
        throw new SasPayHttpError(404, 'order_not_found', 'Commande introuvable.');
      }

      let resolvedStatus: SasPayStatus = order.status;
      let resolvedPaymentId = order.paymentId;
      let charged = order.charged;
      let netAmount = order.netAmount;
      let feeChargeMode = order.feeChargeMode;
      let reference = order.reference;
      let externalReference = order.externalReference;

      if (order.paymentId) {
        const verified = await verifyPayment(order.paymentId);
        resolvedStatus = normalizeStatus(verified.status);
        charged = verified.charged || verified.debited_amount || charged;
        netAmount = verified.net_amount || netAmount;
        feeChargeMode = verified.fee_charge_mode || feeChargeMode;
        reference = verified.reference || reference;
        externalReference = verified.external_reference || externalReference;
      } else if (order.checkoutSessionId) {
        const sessionStatus = await getCheckoutSessionStatus(order.checkoutSessionId);
        if (sessionStatus.status === 'EXPIRED') {
          resolvedStatus = 'EXPIRED';
        } else if (sessionStatus.status === 'CANCELLED') {
          resolvedStatus = 'CANCELLED';
        }

        if (sessionStatus.transaction_id) {
          resolvedPaymentId = sessionStatus.transaction_id;
          const verified = await verifyPayment(sessionStatus.transaction_id);
          resolvedStatus = normalizeStatus(verified.status);
          charged = verified.charged || verified.debited_amount || charged;
          netAmount = verified.net_amount || netAmount;
          feeChargeMode = verified.fee_charge_mode || feeChargeMode;
          reference = verified.reference || reference;
          externalReference = verified.external_reference || externalReference;
        } else if (sessionStatus.transaction_status) {
          resolvedStatus = normalizeStatus(sessionStatus.transaction_status);
          reference = sessionStatus.transaction_reference || reference;
        }
      }

      const updated = await updateOrder(order.orderId, (cur) => ({
        ...cur,
        paymentId: resolvedPaymentId,
        status: resolvedStatus,
        charged,
        netAmount,
        feeChargeMode,
        reference,
        externalReference,
        updatedAt: new Date().toISOString(),
      }));

      let shouldRecordDonor = false;
      if (updated && updated.status === 'SUCCESS' && updated.intentType === 'donation') {
        shouldRecordDonor = await markDonationRecordedOnce(updated.orderId);
      }

      res.json({
        order: sanitizePublicOrder(updated!),
        shouldRecordDonor,
        canDeliver: updated?.status === 'SUCCESS',
      });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  // 8. Cancel checkout session
  router.post('/checkout-sessions/:sessionId/cancel', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const result = await cancelCheckoutSession(sessionId);
      const order = await getOrderBySessionId(sessionId);
      if (order && order.status === 'PENDING') {
        await updateOrder(order.orderId, (cur) => ({
          ...cur,
          status: 'CANCELLED',
          updatedAt: new Date().toISOString(),
        }));
      }
      res.json({ cancelled: true, result });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  // 9. Deliver digital ebook ONLY if verified SUCCESS, strictly once per order
  router.post('/orders/:orderId/deliver', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const order = await getOrderById(orderId);
      if (!order) {
        throw new SasPayHttpError(404, 'order_not_found', 'Commande introuvable.');
      }

      // Always verify with SasPay before unlocking delivery if not yet SUCCESS
      if (order.status !== 'SUCCESS') {
        if (order.paymentId) {
          const verified = await verifyPayment(order.paymentId);
          await updateOrder(order.orderId, (cur) => ({
            ...cur,
            status: normalizeStatus(verified.status),
            charged: verified.charged || verified.debited_amount || cur.charged,
            netAmount: verified.net_amount || cur.netAmount,
            reference: verified.reference || cur.reference,
            updatedAt: new Date().toISOString(),
          }));
        } else if (order.checkoutSessionId) {
          const sessionStatus = await getCheckoutSessionStatus(order.checkoutSessionId);
          if (sessionStatus.transaction_id) {
            const verified = await verifyPayment(sessionStatus.transaction_id);
            await updateOrder(order.orderId, (cur) => ({
              ...cur,
              paymentId: sessionStatus.transaction_id || cur.paymentId,
              status: normalizeStatus(verified.status),
              charged: verified.charged || verified.debited_amount || cur.charged,
              netAmount: verified.net_amount || cur.netAmount,
              reference: verified.reference || cur.reference,
              updatedAt: new Date().toISOString(),
            }));
          }
        }
      }

      const claim = await claimOrderDeliveryOnce(orderId);
      if (!claim.order) {
        throw new SasPayHttpError(404, 'order_not_found', 'Commande introuvable.');
      }
      if (claim.alreadyDelivered) {
        res.status(409).json({
          error: {
            status: 409,
            code: 'already_delivered',
            message: 'Ce produit numérique a déjà été délivré une fois pour cette commande.',
          },
          order: sanitizePublicOrder(claim.order),
        });
        return;
      }
      if (!claim.allowed) {
        res.status(403).json({
          error: {
            status: 403,
            code: 'payment_not_verified_success',
            message: `Livraison bloquée : statut SasPay actuel = ${claim.order.status} (SUCCESS requis).`,
          },
          order: sanitizePublicOrder(claim.order),
        });
        return;
      }

      // Generate digital fulfillment document for download
      const fulfillmentDocument = [
        '==============================================================',
        'ISLAM AVEC ABOUBAKAR — CERTIFICAT DE LIVRAISON NUMERIQUE',
        '==============================================================',
        `Ouvrage : ${claim.order.itemTitle}`,
        `Identifiant Commande : ${claim.order.orderId}`,
        `Reference SasPay : ${claim.order.reference || claim.order.paymentId || 'N/A'}`,
        `Montant debite (charged) : ${claim.order.charged || claim.order.amount} ${claim.order.currency}`,
        `Montant net recu (net_amount) : ${claim.order.netAmount || claim.order.amount} ${claim.order.currency}`,
        `Beneficiaire : ${claim.order.customerName} (${claim.order.customerEmail})`,
        `Date de livraison verifiee : ${claim.order.deliveredAt}`,
        '--------------------------------------------------------------',
        'Bismillah ar-Rahman ar-Rahim.',
        'Merci pour votre soutien fraternel. Votre paiement a ete verifie',
        'avec succes via SasPay.',
        '',
        'Ce document atteste de votre acces autorise a l ouvrage numerique',
        'et de votre contribution a la diffusion du savoir benefique.',
        '==============================================================',
      ].join('\n');

      res.json({
        delivered: true,
        order: sanitizePublicOrder(claim.order),
        fileName: `${claim.order.itemId}-aboubakar.txt`,
        content: fulfillmentDocument,
      });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  // =========================================================================
  // ADMIN FINANCIAL ROUTES (Firebase Admin JWT Verified Server-Side)
  // =========================================================================

  router.get('/admin/overview', requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const local = await getStoreSnapshot();
      const summary = getSasPayConfigSummary();

      let balances: unknown[] = [];
      let transactions: unknown[] = [];
      let webhooksConfig: unknown[] = [];
      let webhookSubscriptions: unknown[] = [];
      let remoteWebhookLogs: unknown[] = [];
      const warnings: Array<{ source: string; code: string; message: string; status: number }> = [];

      if (summary.configured) {
        const [balRes, txRes, whRes, subRes, logRes] = await Promise.allSettled([
          listMerchantBalances(),
          listTransactions(),
          listMerchantWebhooks(),
          listMerchantWebhookSubscriptions(),
          listWebhookLogs(),
        ]);

        if (balRes.status === 'fulfilled') balances = balRes.value;
        else if (balRes.reason instanceof SasPayHttpError) {
          warnings.push({ source: 'merchant-balances', status: balRes.reason.status, code: balRes.reason.code, message: balRes.reason.message });
        }

        if (txRes.status === 'fulfilled') transactions = txRes.value.results || [];
        else if (txRes.reason instanceof SasPayHttpError) {
          warnings.push({ source: 'transactions', status: txRes.reason.status, code: txRes.reason.code, message: txRes.reason.message });
        }

        if (whRes.status === 'fulfilled') webhooksConfig = whRes.value;
        if (subRes.status === 'fulfilled') webhookSubscriptions = subRes.value;
        if (logRes.status === 'fulfilled') remoteWebhookLogs = logRes.value;
      }

      res.json({
        config: summary,
        local,
        remote: {
          balances,
          transactions,
          webhooksConfig,
          webhookSubscriptions,
          remoteWebhookLogs,
        },
        warnings,
      });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  router.post('/admin/payouts/initialize', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as {
        amount?: string | number;
        currency?: string;
        country?: string;
        method?: string;
        msisdn?: string;
        description?: string;
        fee_charge_mode?: SasPayFeeChargeMode;
        idempotencyKey?: string;
        customer?: {
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
        };
      };

      const amount = formatDecimalAmount(body.amount ?? '');
      const currency = (body.currency || '').trim().toUpperCase();
      const country = (body.country || '').trim().toUpperCase();
      const method = (body.method || '').trim();
      const msisdn = (body.msisdn || '').trim();
      const idempotencyKey =
        typeof body.idempotencyKey === 'string' && body.idempotencyKey.trim()
          ? body.idempotencyKey.trim()
          : generateIdempotencyKey();

      if (country.length !== 2 || currency.length !== 3 || !method || !msisdn) {
        throw new SasPayHttpError(
          400,
          'invalid_payout_payload',
          'Pays (ISO2), devise (3 lettres), méthode et numéro bénéficiaire (msisdn) requis.',
        );
      }

      const result = await initializePayout(
        {
          amount,
          currency,
          country,
          method,
          recipient: { msisdn },
          description: (body.description || 'Retrait Islam avec Aboubakar').trim(),
          customer: {
            email: body.customer?.email || 'contacteprosodiacom@gmail.com',
            first_name: body.customer?.first_name || 'Beneficiaire',
            last_name: body.customer?.last_name || 'IslamAboubakar',
            phone: body.customer?.phone || msisdn,
          },
          fee_charge_mode: body.fee_charge_mode,
        },
        idempotencyKey,
      );

      const now = new Date().toISOString();
      const saved = await savePayout({
        localId: crypto.randomUUID(),
        payoutId: result.id,
        idempotencyKey,
        amount,
        currency,
        country,
        method,
        recipientMsisdn: msisdn,
        description: body.description,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      });

      res.status(201).json({ payout: saved, result });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  router.get('/admin/payouts/:payoutId/verify', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { payoutId } = req.params;
      const verified = await verifyPayout(payoutId);
      const updated = await updatePayoutBySasPayId(payoutId, (cur) => ({
        ...cur,
        status: normalizeStatus(verified.status),
        charged: verified.charged || verified.debited_amount || cur.charged,
        netAmount: verified.net_amount || cur.netAmount,
        reference: verified.reference || cur.reference,
        updatedAt: new Date().toISOString(),
      }));
      res.json({ verified, payout: updated });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  router.post('/admin/wallet-transfers', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as {
        from_country?: string;
        to_country?: string;
        from_amount?: string | number;
        idempotencyKey?: string;
      };

      const fromCountry = (body.from_country || '').trim().toUpperCase();
      const toCountry = (body.to_country || '').trim().toUpperCase();
      const fromAmount = formatDecimalAmount(body.from_amount ?? '');
      const idempotencyKey =
        typeof body.idempotencyKey === 'string' && body.idempotencyKey.trim()
          ? body.idempotencyKey.trim()
          : generateIdempotencyKey();

      if (fromCountry.length !== 2 || toCountry.length !== 2) {
        throw new SasPayHttpError(
          400,
          'invalid_country',
          'Codes pays ISO2 source et cible requis.',
        );
      }

      const result = await createWalletTransfer(
        {
          from_country: fromCountry,
          to_country: toCountry,
          from_amount: fromAmount,
        },
        idempotencyKey,
      );

      const now = new Date().toISOString();
      const saved = await saveWalletTransfer({
        localId: crypto.randomUUID(),
        transferId: typeof result.id === 'string' ? result.id : undefined,
        idempotencyKey,
        fromCountry,
        toCountry,
        fromAmount,
        status: typeof result.status === 'string' ? result.status : 'PENDING',
        createdAt: now,
        updatedAt: now,
      });

      res.status(201).json({ transfer: saved, result });
    } catch (err) {
      sendErrorResponse(res, err);
    }
  });

  return router;
}
