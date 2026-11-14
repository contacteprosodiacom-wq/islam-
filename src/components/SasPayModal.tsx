import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { Language } from '../types';
import {
  ApiClientError,
  PublicSasPayOrder,
  createCheckoutOrder,
  verifySasPayOrder,
} from '../lib/saspay-api';

interface SasPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  intentType: 'donation' | 'ebook';
  itemId: string;
  itemTitle: string;
  project?: string;
  baseAmountEur: number;
  initialName?: string;
  initialEmail?: string;
  resumeOrderId?: string | null;
  onPaymentSuccess: (result: {
    order: PublicSasPayOrder;
    shouldRecordDonor: boolean;
  }) => void;
}

const EUR_TO_XOF_RATE = 655.96;

function toXofDecimal(eurAmount: number): string {
  const xof = Math.max(100, Math.round(eurAmount * EUR_TO_XOF_RATE));
  return `${xof}.00`;
}

export default function SasPayModal({
  isOpen,
  onClose,
  lang,
  intentType,
  itemId,
  itemTitle,
  project,
  baseAmountEur,
  initialName = '',
  initialEmail = '',
  resumeOrderId,
  onPaymentSuccess,
}: SasPayModalProps) {
  const isAr = lang === 'ar';

  const [activeOrder, setActiveOrder] = useState<PublicSasPayOrder | null>(null);
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotifiedOrderId, setSuccessNotifiedOrderId] = useState<string | null>(null);

  const notifyIfSuccess = useCallback(
    (order: PublicSasPayOrder, shouldRecordDonor: boolean) => {
      if (order.status === 'SUCCESS' && successNotifiedOrderId !== order.orderId) {
        setSuccessNotifiedOrderId(order.orderId);
        onPaymentSuccess({ order, shouldRecordDonor });
      }
    },
    [onPaymentSuccess, successNotifiedOrderId],
  );

  const initiateSasPayCheckout = useCallback(async () => {
    setCreating(true);
    setErrorMsg(null);
    setActiveOrder(null);

    const safeName =
      initialName.trim() ||
      (intentType === 'donation' ? 'Bienfaiteur IslamAvecAboubakar' : 'Lecteur IslamAvecAboubakar');
    const safeEmail =
      initialEmail.trim() && initialEmail.includes('@')
        ? initialEmail.trim()
        : 'contact@islamavecaboubakar.com';

    try {
      const res = await createCheckoutOrder({
        intentType,
        itemId,
        itemTitle,
        project,
        amount: toXofDecimal(baseAmountEur),
        currency: 'XOF',
        customerName: safeName,
        customerEmail: safeEmail,
      });
      if (!res?.order?.checkoutUrl) {
        throw new Error('Lien de paiement SasPay manquant dans la réponse du serveur.');
      }
      setActiveOrder(res.order);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        setErrorMsg(
          lang === 'fr'
            ? 'Le service de paiement est momentanément indisponible. Réessayez dans un instant.'
            : lang === 'en'
              ? 'Payment service is temporarily unavailable. Please try again shortly.'
              : 'خدمة الدفع غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.',
        );
      } else {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : lang === 'fr'
              ? 'Impossible de préparer le lien de paiement.'
              : 'Unable to prepare payment link.',
        );
      }
    } finally {
      setCreating(false);
    }
  }, [baseAmountEur, initialEmail, initialName, intentType, itemId, itemTitle, lang, project]);

  // Automatically prepare SasPay checkout link or resume verification on open
  useEffect(() => {
    if (!isOpen) {
      setActiveOrder(null);
      setErrorMsg(null);
      setCreating(false);
      setVerifying(false);
      return;
    }

    if (resumeOrderId) {
      setVerifying(true);
      setErrorMsg(null);
      verifySasPayOrder(resumeOrderId)
        .then((res) => {
          setActiveOrder(res.order);
          notifyIfSuccess(res.order, res.shouldRecordDonor);
        })
        .catch((err) => {
          setErrorMsg(
            err instanceof Error ? err.message : 'Impossible de vérifier le paiement.',
          );
        })
        .finally(() => setVerifying(false));
      return;
    }

    initiateSasPayCheckout();
  }, [isOpen, resumeOrderId]);

  // Poll verification gently every 5 seconds while payment is PENDING
  useEffect(() => {
    if (!isOpen || !activeOrder || activeOrder.status !== 'PENDING') return;
    const timer = setInterval(async () => {
      try {
        const res = await verifySasPayOrder(activeOrder.orderId);
        setActiveOrder(res.order);
        notifyIfSuccess(res.order, res.shouldRecordDonor);
      } catch {
        // Keep silent during background polling; respect rate limits cleanly
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isOpen, activeOrder?.orderId, activeOrder?.status, notifyIfSuccess]);

  const handleManualVerify = async () => {
    if (!activeOrder) return;
    setVerifying(true);
    setErrorMsg(null);
    try {
      const res = await verifySasPayOrder(activeOrder.orderId);
      setActiveOrder(res.order);
      notifyIfSuccess(res.order, res.shouldRecordDonor);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Vérification momentanément impossible.',
      );
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  const formattedXof = Math.max(100, Math.round(baseAmountEur * EUR_TO_XOF_RATE)).toLocaleString(
    'fr-FR',
  );

  const primaryCtaText =
    intentType === 'donation'
      ? lang === 'fr'
        ? `Faire un don de ${baseAmountEur} €`
        : lang === 'en'
          ? `Donate €${baseAmountEur}`
          : `تبرع بمبلغ ${baseAmountEur} يورو`
      : lang === 'fr'
        ? `Payer ${baseAmountEur} € avec SasPay`
        : lang === 'en'
          ? `Pay €${baseAmountEur} with SasPay`
          : `ادفع ${baseAmountEur} يورو عبر SasPay`;

  const isInIframe = (() => {
    try {
      return typeof window !== 'undefined' && window.self !== window.top;
    } catch {
      return true;
    }
  })();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className={`bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gold-main/30 overflow-hidden ${
            isAr ? 'text-right' : 'text-left'
          }`}
        >
          {/* Simple Branded Header */}
          <div className="bg-ink text-white px-6 py-4 flex items-center justify-between border-b border-gold-main/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gold-main/15 border border-gold-main/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gold-light" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-gold-light">
                  SasPay
                </h3>
                <p className="text-[11px] text-stone-300 truncate max-w-[260px]">
                  {itemTitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Loading State */}
            {(creating || (verifying && !activeOrder)) && (
              <div className="py-10 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-gold-main animate-spin mx-auto" />
                <p className="text-sm font-serif font-semibold text-ink">
                  {lang === 'fr'
                    ? 'Préparation de votre paiement SasPay...'
                    : lang === 'en'
                      ? 'Preparing your SasPay payment...'
                      : 'جاري تجهيز رابط الدفع عبر SasPay...'}
                </p>
              </div>
            )}

            {/* Error State */}
            {!creating && errorMsg && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={initiateSasPayCheckout}
                  className="w-full py-3 bg-gold-main hover:bg-gold-light text-ink font-serif font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Réessayer' : 'Try again'}</span>
                </button>
              </div>
            )}

            {/* Ready to Pay (1 direct link button) */}
            {!creating && activeOrder && activeOrder.status === 'PENDING' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-cream-main/70 border border-gold-main/25 text-center space-y-1">
                  <span className="text-xs text-text-sec block">
                    {lang === 'fr'
                      ? 'Montant à régler'
                      : lang === 'en'
                        ? 'Amount due'
                        : 'المبلغ المطلوب'}
                  </span>
                  <div className="text-2xl font-serif font-bold text-ink">
                    {baseAmountEur} €
                  </div>
                  <div className="text-xs font-mono text-emerald-main font-semibold">
                    ≈ {formattedXof} FCFA (XOF)
                  </div>
                </div>

                {activeOrder.checkoutUrl && (
                  <a
                    href={activeOrder.checkoutUrl}
                    target={isInIframe ? '_blank' : '_self'}
                    rel={isInIframe ? 'noopener noreferrer' : undefined}
                    className="w-full py-4 px-5 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-serif font-bold text-base rounded-2xl shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2.5"
                  >
                    <span>{primaryCtaText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <p className="text-[11px] text-center text-text-sec leading-relaxed">
                  {lang === 'fr'
                    ? 'Cliquez sur le bouton ci-dessus pour payer par Mobile Money ou Carte bancaire sur la page sécurisée SasPay.'
                    : lang === 'en'
                      ? 'Click the button above to pay with Mobile Money or Card on SasPay’s secure page.'
                      : 'انقر على الزر أعلاه للدفع عبر الهاتف أو البطاقة البنكية بأمان عبر SasPay.'}
                </p>

                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={verifying}
                  className="w-full py-2.5 px-4 bg-cream-main hover:bg-cream-sec text-ink font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-gray-200 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                  <span>
                    {lang === 'fr'
                      ? 'J’ai déjà payé — Vérifier'
                      : lang === 'en'
                        ? 'I already paid — Verify'
                        : 'لقد دفعت بالفعل — تحقق'}
                  </span>
                </button>
              </div>
            )}

            {/* Verified SUCCESS */}
            {!creating && activeOrder && activeOrder.status === 'SUCCESS' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-lg text-emerald-main">
                    {lang === 'fr'
                      ? 'Paiement confirmé !'
                      : lang === 'en'
                        ? 'Payment confirmed!'
                        : 'تم تأكيد الدفع بنجاح!'}
                  </h4>
                  <p className="text-xs text-text-sec">
                    {intentType === 'ebook'
                      ? lang === 'fr'
                        ? 'Votre ouvrage a été débloqué et téléchargé.'
                        : 'Your ebook has been unlocked and downloaded.'
                      : lang === 'fr'
                        ? 'BarakAllahu fik, votre don a bien été enregistré.'
                        : 'Thank you, your donation has been recorded.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-emerald-main hover:bg-emerald-med text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {lang === 'fr' ? 'Fermer' : 'Close'}
                </button>
              </div>
            )}

            {/* FAILED / CANCELLED / EXPIRED */}
            {!creating &&
              activeOrder &&
              (activeOrder.status === 'FAILED' ||
                activeOrder.status === 'CANCELLED' ||
                activeOrder.status === 'EXPIRED') && (
                <div className="space-y-4 text-center py-2">
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {lang === 'fr'
                      ? `Le paiement n’a pas abouti (${activeOrder.status}).`
                      : `Payment did not complete (${activeOrder.status}).`}
                  </div>
                  <button
                    type="button"
                    onClick={initiateSasPayCheckout}
                    className="w-full py-3 bg-gold-main hover:bg-gold-light text-ink font-serif font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Réessayer le paiement' : 'Retry payment'}</span>
                  </button>
                </div>
              )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
