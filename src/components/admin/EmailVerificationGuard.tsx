import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, ShieldCheck, CheckCircle2, AlertTriangle, 
  RefreshCw, ArrowRight, Lock, Eye, EyeOff, Sparkles, Send
} from 'lucide-react';
import { useAdminAuth, DEFAULT_ADMIN_EMAIL } from '../../lib/admin-auth-context';

interface EmailVerificationGuardProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EmailVerificationGuard({ onSuccess, onCancel }: EmailVerificationGuardProps) {
  const { 
    sendFirebaseVerificationEmail, 
    checkEmailVerificationStatus, 
    verifyEmailOtp,
    cancelEmailVerification,
    adminTheme 
  } = useAdminAuth();

  const isDark = adminTheme === 'dark';

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [showMaskedEmail, setShowMaskedEmail] = useState(true);

  // Mask email for zero-leakage display
  const maskedEmail = DEFAULT_ADMIN_EMAIL.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '•••••••••••' + c);

  // Initial auto-send or reminder
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    setResendLoading(true);
    setFeedback(null);

    const res = await sendFirebaseVerificationEmail();
    setResendLoading(false);

    if (res.success) {
      setFeedback({ 
        message: res.message || "Un e-mail officiel de validation Firebase a été envoyé dans votre boîte de réception.", 
        type: 'success' 
      });
      setCountdown(60);
    } else {
      setFeedback({ 
        message: res.error || "Impossible d'envoyer l'e-mail de validation pour le moment.", 
        type: 'error' 
      });
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setFeedback(null);

    const res = await checkEmailVerificationStatus();
    setLoading(false);

    if (res.verified) {
      setFeedback({ 
        message: "Validation confirmée par Firebase Auth ! Accès déverrouillé.", 
        type: 'success' 
      });
      if (onSuccess) onSuccess();
    } else {
      setFeedback({ 
        message: res.error || "L'adresse e-mail n'a pas encore été validée. Cliquez d'abord sur le lien reçu dans votre messagerie.", 
        type: 'info' 
      });
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setLoading(true);
    setFeedback(null);

    const res = await verifyEmailOtp(otpCode);
    setLoading(false);

    if (res.success) {
      setFeedback({ 
        message: "Code e-mail validé avec succès. Accès sécurisé déverrouillé.", 
        type: 'success' 
      });
      if (onSuccess) onSuccess();
    } else {
      setFeedback({ 
        message: res.error || "Code de validation incorrect ou expiré.", 
        type: 'error' 
      });
    }
  };

  const handleAbort = () => {
    cancelEmailVerification();
    if (onCancel) onCancel();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${
      isDark ? 'bg-[#120E0A] text-cream-main' : 'bg-[#FAF7F0] text-ink'
    }`}>
      {/* Fond décoratif islamique discret */}
      <div className="absolute inset-0 islamic-pattern opacity-25 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl p-6 sm:p-8 backdrop-blur-xl ${
          isDark 
            ? 'bg-[#1A140E]/95 border-gold-main/30 shadow-black/80' 
            : 'bg-white/95 border-amber-900/15 shadow-amber-950/20'
        }`}
      >
        {/* En-tête de validation */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-main/20 via-emerald-950/40 to-black/60 border border-gold-main/40 text-gold-main mb-3 shadow-inner">
            <Mail className="w-7 h-7 text-gold-main" />
          </div>

          <h2 className="text-2xl font-serif font-bold text-gold-main tracking-tight">
            Validation de Sécurité par E-mail
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Vérification obligatoire via Firebase Auth pour empêcher tout accès non autorisé à vos données personnelles.
          </p>
        </div>

        {/* Adresse cible protégée */}
        <div className="mb-5 p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-300 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="opacity-80">E-mail officiel vérifié :</span>
            <span className="font-mono font-medium text-gold-light truncate">
              {showMaskedEmail ? maskedEmail : DEFAULT_ADMIN_EMAIL}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowMaskedEmail(!showMaskedEmail)}
            className="text-stone-400 hover:text-white p-1 rounded cursor-pointer shrink-0"
            title={showMaskedEmail ? "Afficher l'e-mail complet" : "Masquer l'e-mail pour la confidentialité"}
          >
            {showMaskedEmail ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Message de notification / feedback */}
        {feedback && (
          <div className={`mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : feedback.type === 'error'
              ? 'bg-red-500/15 border-red-500/40 text-red-300'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 text-amber-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* OPTION 1 : LIEN OFFICIEL FIREBASE AUTH */}
        <div className="p-4 rounded-xl bg-gold-main/10 border border-gold-main/20 text-xs space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gold-light flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-main" />
              <span>Méthode 1 : Lien de validation Firebase Auth</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
              Recommandé
            </span>
          </div>

          <p className="text-[11px] text-stone-300 leading-relaxed">
            Un e-mail de confirmation est envoyé à votre adresse. Cliquez sur le lien reçu dans votre messagerie, puis cliquez sur le bouton ci-dessous pour actualiser.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={loading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gold-main hover:bg-gold-light text-ink font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Vérifier le statut de validation</span>
            </button>

            <button
              type="button"
              onClick={handleResendEmail}
              disabled={countdown > 0 || resendLoading}
              className="py-2.5 px-3 rounded-xl border border-white/15 hover:bg-white/10 text-stone-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              {resendLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{countdown > 0 ? `Renvoyer (${countdown}s)` : "Renvoyer l'e-mail"}</span>
            </button>
          </div>
        </div>

        {/* SÉPARATEUR */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className={`relative px-3 text-[10px] uppercase tracking-wider font-semibold ${
            isDark ? 'bg-[#1A140E] text-stone-500' : 'bg-white text-stone-400'
          }`}>
            Ou saisie du code numérique
          </span>
        </div>

        {/* OPTION 2 : SAISIE DIRECTE DU CODE SECRET DE CONFIRMATION */}
        <form onSubmit={handleOtpSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5 opacity-90">
              Code de sécurité à 6 chiffres
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Ex : 786786 ou code reçu"
                maxLength={8}
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-black/30 border-white/15 focus:border-gold-main focus:outline-none text-sm font-mono tracking-widest text-center"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Vous pouvez saisir le code de validation reçu par e-mail ou votre code confidentiel de fondatrice.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !otpCode.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Valider le code et déverrouiller mes données</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bouton d'annulation / retour */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <button
            type="button"
            onClick={handleAbort}
            className="hover:text-gold-light transition-colors underline cursor-pointer"
          >
            ← Annuler et revenir à l'accueil
          </button>

          <span className="flex items-center gap-1 text-[11px] opacity-75">
            <Lock className="w-3 h-3 text-gold-main" />
            <span>Chiffrement Firebase Actif</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
