import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, Mail, KeyRound, AlertTriangle, 
  CheckCircle2, ArrowRight, Eye, EyeOff, RefreshCw, Sparkles, Send
} from 'lucide-react';
import { useAdminAuth } from '../../lib/admin-auth-context';
import EmailVerificationGuard from './EmailVerificationGuard';

export default function AdminLogin() {
  const { 
    loginWithGoogle,
    login, 
    isLocked, 
    lockoutRemainingSeconds,
    adminTheme,
    isEmailVerificationPending,
    initiateEmailValidationFlow
  } = useAdminAuth();

  // Mode: par défaut uniquement Google (aucun champ mot de passe visible pour empêcher tout pré-remplissage du navigateur)
  const [showManualForm, setShowManualForm] = useState(false);
  const [emailLinkLoading, setEmailLinkLoading] = useState(false);

  // Champs de saisie manuelle (vides par défaut)
  const [email, setEmail] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Authentification Google (Méthode officielle & unique, strictement verrouillée)
  const handleGoogleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const res = await loginWithGoogle();
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Connexion Google indisponible dans ce navigateur.');
    }
  };

  // 2. Authentification manuelle de secours (avec protection anti-autofill)
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanSecret = secretCode.trim();

    if (!cleanEmail || !cleanSecret) {
      setErrorMessage('Veuillez renseigner votre adresse e-mail et votre code secret.');
      return;
    }

    setLoading(true);
    const res = await login(cleanEmail, cleanSecret, rememberMe);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Identifiants non reconnus. Accès refusé.');
    }
  };

  // 3. Authentification directe par validation d'e-mail Firebase Auth
  const handleEmailVerificationDirect = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailLinkLoading(true);

    const res = await initiateEmailValidationFlow();
    setEmailLinkLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || "Impossible d'initier la validation par e-mail.");
    }
  };

  const isDark = adminTheme === 'dark';

  // Si une validation e-mail Firebase Auth est requise ou en cours, afficher le sas de sécurité
  if (isEmailVerificationPending) {
    return <EmailVerificationGuard />;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${
      isDark ? 'bg-[#120E0A] text-cream-main' : 'bg-[#FAF7F0] text-ink'
    }`}>
      {/* Motif décoratif d'arrière-plan */}
      <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 sm:p-8 backdrop-blur-xl transition-all ${
          isDark 
            ? 'bg-[#1A140E]/95 border-gold-main/25 shadow-black/80' 
            : 'bg-white/95 border-amber-900/15 shadow-amber-950/15'
        }`}
      >
        {/* En-tête sécurisé et anonyme - AUCUNE donnée personnelle affichée */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-main/20 via-emerald-950/30 to-black/40 border border-gold-main/40 text-gold-main mb-3 shadow-inner">
            <Lock className="w-7 h-7 text-gold-main" />
          </div>

          <h1 className="text-2xl font-serif font-bold tracking-tight text-gold-main">
            Espace d'Administration
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Portail d'accès confidentiel et sécurisé
          </p>
        </div>

        {/* Bannière de verrouillage en cas d'abus */}
        {isLocked && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-900/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold">Accès temporairement suspendu</p>
              <p className="text-[11px] opacity-80">
                Patientez encore {lockoutRemainingSeconds}s avant de réessayer.
              </p>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* OPTION PRINCIPALE & UNIQUE : CONNEXION SÉCURISÉE GOOGLE */}
          {!showManualForm ? (
            <motion.div
              key="google-mode"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              {/* Carte explicative de protection */}
              <div className="p-4 rounded-xl bg-gold-main/10 border border-gold-main/25 text-xs text-stone-300 space-y-2">
                <div className="flex items-center gap-2 text-gold-light font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Accès Réservé Exclusivement à la Fondatrice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-300">
                  Seule votre adresse e-mail officielle enregistrée a le droit d'ouvrir ce panneau. Toute tentative de connexion avec un autre compte Google sera <strong>automatiquement rejetée</strong>.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Vos identifiants et mots de passe ne sont jamais exposés à l'écran.</span>
                </div>
              </div>

              {/* Bouton Google principal */}
              <button
                type="button"
                onClick={handleGoogleSubmit}
                disabled={loading || isLocked}
                className="w-full py-4 px-5 rounded-xl bg-white hover:bg-stone-50 text-stone-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 border border-stone-200 active:scale-[0.99]"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-stone-700" />
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="text-base font-medium">Se connecter avec mon compte Google</span>
                  </>
                )}
              </button>

              {/* Option 2 : Validation par E-mail via Firebase Auth */}
              <button
                type="button"
                onClick={handleEmailVerificationDirect}
                disabled={emailLinkLoading || isLocked}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-black/60 hover:from-emerald-900/60 hover:to-black/80 text-emerald-200 border border-emerald-500/40 font-semibold text-xs flex items-center justify-center gap-2.5 shadow transition-all cursor-pointer disabled:opacity-50"
              >
                {emailLinkLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>Valider mon identité par e-mail Firebase Auth</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </>
                )}
              </button>

              {/* Lien discret de secours manuel si nécessaire */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setShowManualForm(true); setErrorMessage(null); }}
                  className="text-xs text-stone-400 hover:text-gold-light transition-colors underline cursor-pointer"
                >
                  Ou connexion manuelle par e-mail et code secret →
                </button>
              </div>
            </motion.div>
          ) : (
            /* FORMULAIRE MANUEL DE SECOURS (AVEC PROTECTION TOTALE CONTRE LE PRÉ-REMPLISSAGE CHROME) */
            <motion.form
              key="manual-mode"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleManualSubmit}
              autoComplete="off"
              className="space-y-4"
            >
              {/* Champ d'e-mail vierge avec autoComplete désactivé */}
              <div>
                <label className="block text-xs font-medium mb-1.5 opacity-90">
                  Votre adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    name="admin_user_login_custom"
                    autoComplete="new-password"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Saisissez votre e-mail"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-black/30 border-white/15 focus:border-gold-main focus:outline-none text-sm font-sans"
                  />
                </div>
              </div>

              {/* Champ code secret sans attribut type='password' standard pour bloquer l'injection Chrome */}
              <div>
                <label className="block text-xs font-medium mb-1.5 opacity-90">
                  Votre code d'accès secret ou mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    name="admin_sec_code_custom"
                    autoComplete="new-password"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="Saisissez votre code"
                    required
                    style={{
                      WebkitTextSecurity: showPassword ? 'none' : 'disc'
                    }}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border bg-black/30 border-white/15 focus:border-gold-main focus:outline-none text-sm tracking-widest font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Ce champ est vierge et n'est pas enregistré automatiquement pour votre sécurité.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !email || !secretCode || isLocked}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-main to-gold-light hover:from-gold-light hover:to-gold-main text-ink font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold-main/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Déverrouiller mon espace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setShowManualForm(false); setErrorMessage(null); }}
                  className="text-xs text-stone-400 hover:text-gold-light transition-colors underline cursor-pointer"
                >
                  ← Revenir à la connexion sécurisée via Google
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Pied de carte avec garanties de sécurité */}
        <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] opacity-60">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-gold-main" />
            <span>Chiffrement SHA-256</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Accès Strictement Privé</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
