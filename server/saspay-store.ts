import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  OrderRecord,
  PayoutRecord,
  WalletTransferRecord,
  WebhookReceiptRecord,
} from './saspay-types.ts';

interface SasPayStoreData {
  orders: Record<string, OrderRecord>;
  paymentToOrder: Record<string, string>;
  sessionToOrder: Record<string, string>;
  payouts: Record<string, PayoutRecord>;
  walletTransfers: Record<string, WalletTransferRecord>;
  webhooks: WebhookReceiptRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), '.saspay-data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

const EMPTY_STORE: SasPayStoreData = {
  orders: {},
  paymentToOrder: {},
  sessionToOrder: {},
  payouts: {},
  walletTransfers: {},
  webhooks: [],
};

let mutex: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = mutex.then(fn, fn);
  mutex = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readStoreUnlocked(): Promise<SasPayStoreData> {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SasPayStoreData>;
    return {
      orders: parsed.orders || {},
      paymentToOrder: parsed.paymentToOrder || {},
      sessionToOrder: parsed.sessionToOrder || {},
      payouts: parsed.payouts || {},
      walletTransfers: parsed.walletTransfers || {},
      webhooks: Array.isArray(parsed.webhooks) ? parsed.webhooks : [],
    };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'ENOENT') {
      return {
        orders: {},
        paymentToOrder: {},
        sessionToOrder: {},
        payouts: {},
        walletTransfers: {},
        webhooks: [],
      };
    }
    throw err;
  }
}

async function writeStoreUnlocked(data: SasPayStoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${STORE_FILE}.tmp.${process.pid}.${Date.now()}`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tempFile, STORE_FILE);
}

export function saveOrder(order: OrderRecord): Promise<OrderRecord> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    store.orders[order.orderId] = order;
    if (order.paymentId) {
      store.paymentToOrder[order.paymentId] = order.orderId;
    }
    if (order.checkoutSessionId) {
      store.sessionToOrder[order.checkoutSessionId] = order.orderId;
    }
    await writeStoreUnlocked(store);
    return order;
  });
}

export function updateOrder(
  orderId: string,
  updater: (current: OrderRecord) => OrderRecord,
): Promise<OrderRecord | null> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    const existing = store.orders[orderId];
    if (!existing) return null;
    const next = updater(existing);
    store.orders[orderId] = next;
    if (next.paymentId) {
      store.paymentToOrder[next.paymentId] = next.orderId;
    }
    if (next.checkoutSessionId) {
      store.sessionToOrder[next.checkoutSessionId] = next.orderId;
    }
    await writeStoreUnlocked(store);
    return next;
  });
}

export function getOrderById(orderId: string): Promise<OrderRecord | null> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    return store.orders[orderId] || null;
  });
}

export function getOrderByPaymentId(paymentId: string): Promise<OrderRecord | null> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    const orderId = store.paymentToOrder[paymentId];
    if (!orderId) return null;
    return store.orders[orderId] || null;
  });
}

export function getOrderBySessionId(sessionId: string): Promise<OrderRecord | null> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    const orderId = store.sessionToOrder[sessionId];
    if (!orderId) return null;
    return store.orders[orderId] || null;
  });
}

/**
 * Atomically enforces delivery-only-once on verified SUCCESS orders.
 * Returns { allowed, alreadyDelivered, order }.
 */
export function claimOrderDeliveryOnce(orderId: string): Promise<{
  allowed: boolean;
  alreadyDelivered: boolean;
  order: OrderRecord | null;
}> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    const order = store.orders[orderId] || null;
    if (!order) {
      return { allowed: false, alreadyDelivered: false, order: null };
    }
    if (order.status !== 'SUCCESS') {
      return { allowed: false, alreadyDelivered: false, order };
    }
    if (order.delivered) {
      return { allowed: false, alreadyDelivered: true, order };
    }
    const now = new Date().toISOString();
    const updated: OrderRecord = {
      ...order,
      delivered: true,
      deliveredAt: now,
      updatedAt: now,
    };
    store.orders[orderId] = updated;
    await writeStoreUnlocked(store);
    return { allowed: true, alreadyDelivered: false, order: updated };
  });
}

export function markDonationRecordedOnce(orderId: string): Promise<boolean> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    const order = store.orders[orderId];
    if (!order || order.status !== 'SUCCESS' || order.donorRecorded) {
      return false;
    }
    store.orders[orderId] = {
      ...order,
      donorRecorded: true,
      updatedAt: new Date().toISOString(),
    };
    await writeStoreUnlocked(store);
    return true;
  });
}

export function savePayout(payout: PayoutRecord): Promise<PayoutRecord> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    store.payouts[payout.localId] = payout;
    await writeStoreUnlocked(store);
    return payout;
  });
}

export function updatePayoutBySasPayId(
  payoutId: string,
  updater: (current: PayoutRecord) => PayoutRecord,
): Promise<PayoutRecord | null> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    const entry = Object.values(store.payouts).find((p) => p.payoutId === payoutId);
    if (!entry) return null;
    const updated = updater(entry);
    store.payouts[entry.localId] = updated;
    await writeStoreUnlocked(store);
    return updated;
  });
}

export function saveWalletTransfer(transfer: WalletTransferRecord): Promise<WalletTransferRecord> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    store.walletTransfers[transfer.localId] = transfer;
    await writeStoreUnlocked(store);
    return transfer;
  });
}

/**
 * Records a webhook idempotently. Returns `true` if newly recorded, `false` if duplicate.
 */
export function recordWebhookIdempotent(receipt: WebhookReceiptRecord): Promise<boolean> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    const alreadyExists = store.webhooks.some((w) => w.dedupKey === receipt.dedupKey);
    if (alreadyExists) {
      return false;
    }
    store.webhooks = [receipt, ...store.webhooks].slice(0, 200);
    await writeStoreUnlocked(store);
    return true;
  });
}

export function getStoreSnapshot(): Promise<{
  orders: OrderRecord[];
  payouts: PayoutRecord[];
  walletTransfers: WalletTransferRecord[];
  webhooks: WebhookReceiptRecord[];
  accounting: Record<string, { totalCharged: string; totalNetAmount: string; count: number }>;
}> {
  return withLock(async () => {
    const store = await readStoreUnlocked();
    const orders = Object.values(store.orders).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const payouts = Object.values(store.payouts).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const walletTransfers = Object.values(store.walletTransfers).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Accounting computed strictly using charged (debited_amount) and net_amount on SUCCESS orders
    const totals: Record<string, { chargedCents: number; netCents: number; count: number }> = {};
    for (const order of orders) {
      if (order.status !== 'SUCCESS') continue;
      const cur = order.currency || 'XOF';
      if (!totals[cur]) totals[cur] = { chargedCents: 0, netCents: 0, count: 0 };
      const chargedVal = order.charged ?? order.amount;
      const netVal = order.netAmount ?? order.amount;
      totals[cur].chargedCents += Math.round(parseFloat(chargedVal) * 100);
      totals[cur].netCents += Math.round(parseFloat(netVal) * 100);
      totals[cur].count += 1;
    }

    const accounting: Record<string, { totalCharged: string; totalNetAmount: string; count: number }> = {};
    for (const [currency, vals] of Object.entries(totals)) {
      accounting[currency] = {
        totalCharged: (vals.chargedCents / 100).toFixed(2),
        totalNetAmount: (vals.netCents / 100).toFixed(2),
        count: vals.count,
      };
    }

    return {
      orders,
      payouts,
      walletTransfers,
      webhooks: store.webhooks,
      accounting,
    };
  });
}

export const _EMPTY_STORE_FOR_TEST = EMPTY_STORE;
