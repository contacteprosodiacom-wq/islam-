import { useState, useEffect, FormEvent } from 'react';
import {
  Wallet,
  RefreshCw,
  Send,
  ArrowLeftRight,
  Webhook,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import { useAdminAuth } from '../../lib/admin-auth-context';
import {
  ApiClientError,
  SasPayAdminOverview,
  SasPayConfigStatus,
  createSasPayWalletTransfer,
  fetchSasPayAdminOverview,
  fetchSasPayStatus,
  initializeSasPayPayout,
  toDecimalString,
  verifySasPayOrder,
  verifySasPayPayout,
} from '../../lib/saspay-api';

interface SasPayAdminPanelProps {
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

export default function SasPayAdminPanel({ onNotify }: SasPayAdminPanelProps) {
  const { firebaseUser, loginWithGoogle } = useAdminAuth();

  const [status, setStatus] = useState<SasPayConfigStatus | null>(null);
  const [overview, setOverview] = useState<SasPayAdminOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Payout form state (stable idempotency key per intent, reset after completion)
  const [payoutCountry, setPayoutCountry] = useState('BJ');
  const [payoutCurrency, setPayoutCurrency] = useState('XOF');
  const [payoutMethod, setPayoutMethod] = useState('mtn_bj');
  const [payoutMsisdn, setPayoutMsisdn] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutDesc, setPayoutDesc] = useState('Retrait Campagne Solidarite');
  const [payoutIdempotencyKey, setPayoutIdempotencyKey] = useState(() => crypto.randomUUID());
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  // Wallet transfer state
  const [fromCountry, setFromCountry] = useState('BJ');
  const [toCountry, setToCountry] = useState('CM');
  const [fromAmount, setFromAmount] = useState('');
  const [transferIdempotencyKey, setTransferIdempotencyKey] = useState(() => crypto.randomUUID());
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const cfg = await fetchSasPayStatus();
      setStatus(cfg);

      if (!firebaseUser) {
        setAuthError(
          'Connectez votre compte Google Firebase Auth pour charger les soldes marchands, transactions et opérations de retrait sécurisées.',
        );
        return;
      }

      const token = await firebaseUser.getIdToken();
      const data = await fetchSasPayAdminOverview(token);
      setOverview(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erreur lors du chargement SasPay.';
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [firebaseUser]);

  const handleCopyWebhook = async () => {
    if (!status?.webhookUrl) return;
    try {
      await navigator.clipboard.writeText(status.webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } catch {
      onNotify('Copiez manuellement l’URL affichée.', 'error');
    }
  };

  const handlePayoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      onNotify('Authentification Google Firebase requise.', 'error');
      return;
    }

    setPayoutSubmitting(true);
    try {
      const token = await firebaseUser.getIdToken();
      await initializeSasPayPayout(token, {
        amount: toDecimalString(payoutAmount),
        currency: payoutCurrency,
        country: payoutCountry,
        method: payoutMethod,
        msisdn: payoutMsisdn.trim(),
        description: payoutDesc.trim(),
        idempotencyKey: payoutIdempotencyKey,
      });
      onNotify('Retrait initialisé avec succès via SasPay (Idempotency-Key envoyé).');
      setPayoutAmount('');
      setPayoutMsisdn('');
      setPayoutIdempotencyKey(crypto.randomUUID());
      await loadData();
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'ip_not_whitelisted') {
        onNotify(
          '403 ip_not_whitelisted : ajoutez l’IP publique du serveur dans la whitelist IP du tableau de bord app.saspay.me.',
          'error',
        );
      } else if (err instanceof ApiClientError && err.code === 'currency_country_mismatch') {
        onNotify(
          '422 currency_country_mismatch : la devise doit correspondre au pays de retrait (aucune conversion automatique côté payout).',
          'error',
        );
      } else {
        onNotify(err instanceof Error ? err.message : 'Échec du retrait.', 'error');
      }
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const handleWalletTransfer = async (e: FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setTransferSubmitting(true);
    try {
      const token = await firebaseUser.getIdToken();
      await createSasPayWalletTransfer(token, {
        from_country: fromCountry,
        to_country: toCountry,
        from_amount: toDecimalString(fromAmount),
        idempotencyKey: transferIdempotencyKey,
      });
      onNotify('Transfert inter-wallets initié avec succès.');
      setFromAmount('');
      setTransferIdempotencyKey(crypto.randomUUID());
      await loadData();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Échec du transfert.', 'error');
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleVerifyOrder = async (orderId: string) => {
    try {
      const res = await verifySasPayOrder(orderId);
      onNotify(`Statut vérifié : ${res.order.status}`);
      await loadData();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Vérification échouée.', 'error');
    }
  };

  const handleVerifyPayout = async (payoutId: string) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await verifySasPayPayout(token, payoutId);
      onNotify('Statut du retrait vérifié.');
      await loadData();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Vérification impossible.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-gold-main flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            <span>Paiements & Trésorerie SasPay</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Encaissements vérifiés, comptabilité (charged / net_amount), webhooks HMAC-SHA256 et retraits.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-gold-main/15 hover:bg-gold-main/25 border border-gold-main/30 text-gold-light text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Config Summary & Webhook URL Card (zero secrets displayed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-400">Environnement API</span>
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-cream-main">
            <ShieldCheck className={`w-4 h-4 ${status?.configured ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>
              {status?.configured
                ? status.mode === 'live'
                  ? 'Production (sk_live)'
                  : status.mode === 'test'
                    ? 'Sandbox (sk_test)'
                    : 'Configuré'
                : 'Non configuré (SASPAY_API_KEY manquante)'}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono">https://api.saspay.me/api/v1</p>
        </div>

        <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-400">Vérification Webhook</span>
          <div className="flex items-center gap-2 text-sm font-bold text-cream-main">
            <Webhook className={`w-4 h-4 ${status?.webhookConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>
              {status?.webhookConfigured ? 'HMAC-SHA256 + 300s Actif' : 'SASPAY_WEBHOOK_SECRET manquante'}
            </span>
          </div>
          <p className="text-[11px] text-stone-400">Signature calculée sur le corps brut</p>
        </div>

        <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
            Endpoint Webhook à déclarer sur app.saspay.me
          </span>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] font-mono bg-black/50 px-2.5 py-1.5 rounded-lg text-gold-light truncate">
              {status?.webhookUrl || '/api/saspay/webhook'}
            </code>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Copier"
            >
              {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Firebase Auth Prompt if admin accessed via local fallback */}
      {authError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
          {!firebaseUser && (
            <button
              type="button"
              onClick={() => loginWithGoogle().then(() => loadData())}
              className="px-3.5 py-2 rounded-xl bg-white text-stone-900 font-bold text-xs shrink-0 cursor-pointer"
            >
              Authentifier Google Firebase
            </button>
          )}
        </div>
      )}

      {/* Warnings from SasPay API sub-calls */}
      {overview?.warnings && overview.warnings.length > 0 && (
        <div className="space-y-2">
          {overview.warnings.map((w, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                [{w.source} • HTTP {w.status}] {w.message} ({w.code})
              </span>
            </div>
          ))}
        </div>
      )}

      {overview && (
        <>
          {/* Accounting Summary (charged & net_amount strictly) + Remote Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
              <h2 className="text-sm font-serif font-bold text-gold-light">
                Comptabilité Locale Vérifiée (SUCCESS)
              </h2>
              {Object.keys(overview.local.accounting).length === 0 ? (
                <p className="text-xs text-stone-400">Aucune transaction vérifiée enregistrée.</p>
              ) : (
                <div className="space-y-2">
                  {(Object.entries(overview.local.accounting) as Array<[string, { totalCharged: string; totalNetAmount: string; count: number }]>).map(([cur, stats]) => (
                    <div
                      key={cur}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-cream-main">{cur}</span>
                        <span className="text-stone-400 ml-2">({stats.count} paiements)</span>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-stone-300">Débité (charged) : {stats.totalCharged}</div>
                        <div className="text-emerald-400 font-bold">Net perçu : {stats.totalNetAmount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
              <h2 className="text-sm font-serif font-bold text-gold-light">
                Soldes Marchand SasPay (/merchant-balances/)
              </h2>
              {overview.remote.balances.length === 0 ? (
                <p className="text-xs text-stone-400">
                  Aucun solde retourné (configurez SASPAY_API_KEY pour consulter vos wallets).
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {overview.remote.balances.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-cream-main">
                          {b.country} • {b.currency}
                        </span>
                        {b.is_frozen && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px]">
                            Gelé
                          </span>
                        )}
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-emerald-400 font-bold">
                          Dispo : {b.available_amount} {b.currency}
                        </div>
                        <div className="text-stone-400">En attente : {b.pending_amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payouts & Wallet Transfers Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payout Form */}
            <form
              onSubmit={handlePayoutSubmit}
              className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4"
            >
              <div>
                <h2 className="text-sm font-serif font-bold text-gold-light flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Initier un Retrait Bénéficiaire (/payouts/initialize/)</span>
                </h2>
                <p className="text-[11px] text-amber-300/90 mt-1">
                  Prérequis : IP serveur whitelistée (sinon 403 ip_not_whitelisted) et devise = devise du pays.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  maxLength={2}
                  value={payoutCountry}
                  onChange={(e) => setPayoutCountry(e.target.value.toUpperCase())}
                  placeholder="Pays (BJ)"
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-mono uppercase"
                />
                <input
                  type="text"
                  maxLength={3}
                  value={payoutCurrency}
                  onChange={(e) => setPayoutCurrency(e.target.value.toUpperCase())}
                  placeholder="Devise (XOF)"
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-mono uppercase"
                />
                <input
                  type="text"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  placeholder="Méthode (mtn_bj)"
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={payoutMsisdn}
                  onChange={(e) => setPayoutMsisdn(e.target.value)}
                  placeholder="Numéro bénéficiaire (ex. 97505050)"
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-mono"
                />
                <input
                  type="text"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Montant (ex. 10000.00)"
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-mono"
                />
              </div>

              <input
                type="text"
                value={payoutDesc}
                onChange={(e) => setPayoutDesc(e.target.value)}
                placeholder="Motif du retrait"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs"
              />

              <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                <span>Idempotency-Key : {payoutIdempotencyKey.slice(0, 18)}...</span>
                <button
                  type="button"
                  onClick={() => setPayoutIdempotencyKey(crypto.randomUUID())}
                  className="underline hover:text-white cursor-pointer"
                >
                  Nouvelle clé
                </button>
              </div>

              <button
                type="submit"
                disabled={payoutSubmitting}
                className="w-full py-2.5 rounded-xl bg-gold-main hover:bg-gold-light text-ink font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {payoutSubmitting ? 'Envoi en cours...' : 'Envoyer le retrait (Idempotent)'}
              </button>
            </form>

            {/* Wallet Transfer Form */}
            <form
              onSubmit={handleWalletTransfer}
              className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4"
            >
              <div>
                <h2 className="text-sm font-serif font-bold text-gold-light flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Transfert Inter-Wallets (/wallet-transfers/)</span>
                </h2>
                <p className="text-[11px] text-stone-400 mt-1">
                  Transfère un montant décimal exact entre deux wallets pays différents.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  maxLength={2}
                  value={fromCountry}
                  onChange={(e) => setFromCountry(e.target.value.toUpperCase())}
                  placeholder="Source (BJ)"
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-mono uppercase"
                />
                <input
                  type="text"
                  maxLength={2}
                  value={toCountry}
                  onChange={(e) => setToCountry(e.target.value.toUpperCase())}
                  placeholder="Cible (CM)"
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-mono uppercase"
                />
                <input
                  type="text"
                  required
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="Montant (50000.00)"
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                <span>Idempotency-Key : {transferIdempotencyKey.slice(0, 18)}...</span>
                <button
                  type="button"
                  onClick={() => setTransferIdempotencyKey(crypto.randomUUID())}
                  className="underline hover:text-white cursor-pointer"
                >
                  Nouvelle clé
                </button>
              </div>

              <button
                type="submit"
                disabled={transferSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-main hover:bg-emerald-med text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {transferSubmitting ? 'Transfert...' : 'Exécuter le transfert'}
              </button>
            </form>
          </div>

          {/* Orders & Payouts Tables */}
          <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
            <h2 className="text-sm font-serif font-bold text-gold-light">
              Commandes & Dons SasPay ({overview.local.orders.length})
            </h2>
            {overview.local.orders.length === 0 ? (
              <p className="text-xs text-stone-400">Aucune commande SasPay initiée pour le moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase text-stone-400 border-b border-white/10">
                    <tr>
                      <th className="py-2 pr-3">Objet</th>
                      <th className="py-2 pr-3">Client</th>
                      <th className="py-2 pr-3">Montant / Net</th>
                      <th className="py-2 pr-3">Statut</th>
                      <th className="py-2 pr-3">Livraison</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {overview.local.orders.slice(0, 20).map((ord) => (
                      <tr key={ord.orderId}>
                        <td className="py-2.5 pr-3">
                          <div className="font-medium text-cream-main">{ord.itemTitle}</div>
                          <div className="text-[10px] font-mono text-stone-400">
                            {ord.flow} • {ord.reference || ord.orderId.slice(0, 8)}
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-stone-300">{ord.customerName}</td>
                        <td className="py-2.5 pr-3 font-mono">
                          <div>{ord.charged || ord.amount} {ord.currency}</div>
                          {ord.netAmount && (
                            <div className="text-[10px] text-emerald-400">net: {ord.netAmount}</div>
                          )}
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-[11px] text-stone-300">
                          {ord.delivered ? 'Délivré (1x)' : '—'}
                        </td>
                        <td className="py-2.5">
                          <button
                            type="button"
                            onClick={() => handleVerifyOrder(ord.orderId)}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] cursor-pointer"
                          >
                            Vérifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payouts + Webhooks Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
              <h2 className="text-sm font-serif font-bold text-gold-light">
                Retraits initiés ({overview.local.payouts.length})
              </h2>
              {overview.local.payouts.length === 0 ? (
                <p className="text-xs text-stone-400">Aucun retrait enregistré.</p>
              ) : (
                <div className="space-y-2">
                  {overview.local.payouts.slice(0, 10).map((p) => (
                    <div
                      key={p.localId}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-cream-main">
                          {p.amount} {p.currency} → {p.recipientMsisdn}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {p.method} • {p.status}
                        </div>
                      </div>
                      {p.payoutId && (
                        <button
                          type="button"
                          onClick={() => handleVerifyPayout(p.payoutId!)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] cursor-pointer"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
              <h2 className="text-sm font-serif font-bold text-gold-light">
                Webhooks reçus & vérifiés ({overview.local.webhooks.length})
              </h2>
              {overview.local.webhooks.length === 0 ? (
                <p className="text-xs text-stone-400">
                  Aucun événement webhook reçu. Utilisez webhook.test depuis app.saspay.me.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {overview.local.webhooks.map((w) => (
                    <div
                      key={w.dedupKey}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-emerald-400">{w.event}</div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {w.reference || w.transactionId || 'webhook'} • {w.status || 'OK'}
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(w.processedAt).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
