import 'dotenv/config';
import {
  getMyRates,
  getSasPayConfigSummary,
  listCountries,
} from '../server/saspay-client.ts';
import { verifySasPayWebhookSignature } from '../server/saspay-webhook.ts';
import crypto from 'node:crypto';

async function main() {
  console.log('--- Verification de configuration SasPay ---');
  const summary = getSasPayConfigSummary();
  console.log('Mode cle API :', summary.mode);
  console.log('SASPAY_API_KEY presente :', summary.configured);
  console.log('SASPAY_WEBHOOK_SECRET present :', summary.webhookConfigured);

  // 1. Public reference check: GET /countries/
  const countries = await listCountries();
  console.log(`GET /countries/ -> OK (${countries.length} pays recenses)`);

  // 2. Local HMAC webhook verification self-test (without printing any secret)
  const testSecret = 'whsec_local_selftest_key';
  const ts = String(Math.floor(Date.now() / 1000));
  const sampleBody = Buffer.from(JSON.stringify({ event: 'webhook.test', data: {} }), 'utf8');
  const sig = crypto
    .createHmac('sha256', testSecret)
    .update(Buffer.concat([Buffer.from(`${ts}.`, 'utf8'), sampleBody]))
    .digest('hex');
  const checkValid = verifySasPayWebhookSignature(sampleBody, sig, ts, testSecret);
  const checkStale = verifySasPayWebhookSignature(
    sampleBody,
    sig,
    String(Number(ts) - 301),
    testSecret,
  );
  if (!checkValid.valid || checkStale.valid) {
    throw new Error('Echec auto-test verification signature webhook HMAC-SHA256');
  }
  console.log('Verification signature HMAC-SHA256 + fenetre 300s -> OK');

  // 3. Authenticated pricing/rates check if SASPAY_API_KEY is present
  if (!summary.configured) {
    console.log(
      'NOTE: SASPAY_API_KEY absente de l environnement — appel authentifie GET /pricing/my-rates/ ignore.',
    );
    return;
  }

  try {
    const rates = await getMyRates();
    console.log(`GET /pricing/my-rates/ -> OK (${rates.length} canaux actifs)`);
  } catch (err: unknown) {
    console.error(
      'GET /pricing/my-rates/ -> ECHEC :',
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Erreur verification SasPay :', err instanceof Error ? err.message : err);
  process.exit(1);
});
