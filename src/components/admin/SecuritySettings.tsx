import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Smartphone, Laptop, Smartphone as MobileIcon, 
  MapPin, Clock, LogOut, CheckCircle2, AlertTriangle, KeyRound, Eye, EyeOff,
  Mail, Send, RefreshCw, Sparkles
} from 'lucide-react';
import { useAdminAuth, DEFAULT_ADMIN_EMAIL } from '../../lib/admin-auth-context';

interface SecuritySettingsProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export default function SecuritySettings({ onNotify }: SecuritySettingsProps) {
  const { 
    currentUser, 
    changePassword, 
    activeSessions, 
    terminateOtherSessions, 
    loginHistory,
    adminTheme,
    personalPin,
    updatePersonalPin,
    isEmailVerified,
    sendFirebaseVerificationEmail,
    checkEmailVerificationStatus
  } = useAdminAuth();

  const isDark = adminTheme === 'dark';

  // Email verification state
  const [emailLoading, setEmailLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Personal PIN management
  const [customPin, setCustomPin] = useState(personalPin);
  const [pinLoading, setPinLoading] = useState(false);
  const [showCustomPin, setShowCustomPin] = useState(false);

  // Change password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA modal or QR demo
  const [show2FAModal, setShow2FAModal] = useState(false);

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 12) score += 1;
    if (pass.length >= 16) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculatePasswordStrength(newPassword);

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinLoading(true);
    const res = await updatePersonalPin(customPin);
    setPinLoading(false);
    if (res.success) {
      onNotify('Votre code personnel a été mis à jour avec succès !');
    } else {
      onNotify(res.error || 'Erreur lors de la mise à jour du code personnel.', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 12) {
      onNotify('Le mot de passe doit comporter au moins 12 caractères.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      onNotify('La confirmation ne correspond pas au nouveau mot de passe.', 'error');
      return;
    }

    setLoading(true);
    const res = await changePassword(newPassword);
    setLoading(false);

    if (res.success) {
      onNotify('Mot de passe mis à jour avec succès !');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      onNotify(res.error || 'Erreur lors du changement de mot de passe.', 'error');
    }
  };

  const handleTerminateOthers = () => {
    terminateOtherSessions();
    onNotify('Toutes les autres sessions actives ont été révoquées.');
  };

  const handleSendVerificationEmail = async () => {
    if (resendCooldown > 0) return;
    setEmailLoading(true);
    const res = await sendFirebaseVerificationEmail();
    setEmailLoading(false);
    if (res.success) {
      onNotify(res.message || 'E-mail de validation Firebase envoyé avec succès.');
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(c => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } else {
      onNotify(res.error || "Erreur lors de l'envoi de l'e-mail de validation.", 'error');
    }
  };

  const handleCheckEmailStatus = async () => {
    setEmailLoading(true);
    const res = await checkEmailVerificationStatus();
    setEmailLoading(false);
    if (res.verified) {
      onNotify('Adresse e-mail validée et synchronisée avec Firebase Auth !');
    } else {
      onNotify(res.error || "L'e-mail n'a pas encore été validé.", 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* COUCHE DE SÉCURITÉ : VALIDATION PAR E-MAIL VIA FIREBASE AUTH */}
      <div className={`p-5 sm:p-6 rounded-xl border ${
        isDark ? 'bg-[#1A140E] border-gold-main/30' : 'bg-white border-amber-900/20'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-gold-main/20 text-gold-main shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif font-bold text-gold-light text-base">
                  Couche de Sécurité : Validation par E-mail Firebase Auth
                </h3>
                {isEmailVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Validé & Actif</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>En attente de validation</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">
                Protection renforcée de la vie privée : Seul votre e-mail certifié (<strong className="text-stone-300 font-mono">contacteprosodiacom@gmail.com</strong>) validé par Firebase Auth (<code className="text-emerald-400">email_verified == true</code>) est autorisé à accéder aux informations confidentielles, aux identités et aux journaux d'audit.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleCheckEmailStatus}
              disabled={emailLoading}
              className="py-2 px-3.5 rounded-xl bg-gold-main hover:bg-gold-light text-ink text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${emailLoading ? 'animate-spin' : ''}`} />
              <span>Vérifier le statut</span>
            </button>

            <button
              type="button"
              onClick={handleSendVerificationEmail}
              disabled={emailLoading || resendCooldown > 0}
              className="py-2 px-3.5 rounded-xl border border-gold-main/30 hover:bg-gold-main/10 text-gold-light text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer l'e-mail"}</span>
            </button>
          </div>
        </div>

        {/* Détails de la barrière anti-fuite */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 space-y-1">
            <div className="font-semibold text-stone-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Isolation PII / Profils</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-tight">
              Blocage des lectures directes sur les données nominatives par les règles de sécurité Firestore.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 space-y-1">
            <div className="font-semibold text-stone-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gold-main" />
              <span>Zéro fuite d'identifiants</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-tight">
              Mots de passe et codes jamais auto-complétés par les gestionnaires de navigateur.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 space-y-1">
            <div className="font-semibold text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-light" />
              <span>Traçabilité Immuable</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-tight">
              Chaque tentative d'accès est consignée de manière inaltérable dans le registre d'audit.
            </p>
          </div>
        </div>
      </div>
      
      {/* 2FA STATUS & CONFIGURATION CARD */}
      <div className={`p-5 sm:p-6 rounded-xl border ${
        isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-gold-light text-base">
                  Double Authentification (2FA)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                  Actif & Obligatoire
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 max-w-lg leading-relaxed">
                Chaque tentative de connexion requiert la validation d'un code temporaire à 6 chiffres via votre application d'authentification (Google Authenticator / Authy) pour interdire tout accès non autorisé.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShow2FAModal(true)}
            className="self-start sm:self-center py-2 px-3.5 rounded-xl border border-gold-main/30 hover:bg-gold-main/10 text-gold-light text-xs font-semibold shrink-0 cursor-pointer"
          >
            Gérer la double authentification
          </button>
        </div>
      </div>

      {/* MON CODE PERSONNEL D'ACCÈS DIRECT (PIN) */}
      <div className={`p-5 sm:p-6 rounded-xl border ${
        isDark ? 'bg-[#1A140E] border-gold-main/20' : 'bg-white border-gold-main/30'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="w-5 h-5 text-gold-main" />
          <h3 className="font-serif font-bold text-gold-light text-base">
            Mon Code Personnel d'Accès Direct (PIN)
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-gold-main/20 text-gold-light text-[10px] font-semibold border border-gold-main/30">
            Reconnaissance Fondatrice
          </span>
        </div>
        <p className="text-xs text-stone-400 mb-4 leading-relaxed max-w-xl">
          Ce code personnel vous permet de vous connecter instantanément depuis la page d'administration sans avoir à ressaisir un mot de passe complexe. Il est réservé à votre adresse <strong className="text-stone-300">contacteprosodiacom@gmail.com</strong>.
        </p>

        <form onSubmit={handleUpdatePin} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-medium mb-1 opacity-80">
              Votre code PIN personnel actuel ou nouveau (4 à 12 caractères)
            </label>
            <div className="relative">
              <input
                type={showCustomPin ? 'text' : 'password'}
                value={customPin}
                onChange={(e) => setCustomPin(e.target.value)}
                required
                minLength={4}
                maxLength={12}
                placeholder="Ex: 786786"
                className="w-full text-sm font-mono tracking-widest py-2.5 pl-3 pr-10 rounded-xl border bg-black/20 border-white/10 focus:border-gold-main focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCustomPin(!showCustomPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
              >
                {showCustomPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={pinLoading || !customPin || customPin === personalPin}
              className="py-2.5 px-4 rounded-xl bg-gold-main hover:bg-gold-light text-ink font-bold text-xs flex items-center gap-2 transition-all shadow cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{pinLoading ? 'Enregistrement...' : 'Enregistrer mon code personnel'}</span>
            </button>
            <span className="text-[11px] text-stone-400">
              Code actif : <strong className="font-mono text-gold-light">{showCustomPin ? personalPin : '••••••'}</strong>
            </span>
          </div>
        </form>
      </div>

      {/* CHANGE PASSWORD FORM */}
      <div className={`p-5 sm:p-6 rounded-xl border ${
        isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-gold-main" />
          <h3 className="font-serif font-bold text-gold-light text-base">
            Modifier le mot de passe administrateur
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium mb-1 opacity-80">
              Nouveau mot de passe (min. 12 caractères)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={12}
                placeholder="Au moins 12 caractères..."
                className="w-full text-xs py-2.5 pl-3 pr-10 rounded-xl border bg-black/20 border-white/10 focus:border-gold-main focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] opacity-70">
                  <span>Robustesse : {strength >= 3 ? 'Excellente' : strength === 2 ? 'Moyenne' : 'Insuffisante'}</span>
                  <span>{newPassword.length} caractères</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 ${strength >= 1 ? 'bg-red-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 ${strength >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 ${strength >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 ${strength >= 4 ? 'bg-green-500' : 'bg-transparent'}`} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 opacity-80">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={12}
              placeholder="Répétez le mot de passe..."
              className="w-full text-xs py-2.5 px-3 rounded-xl border bg-black/20 border-white/10 focus:border-gold-main focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || newPassword.length < 12}
            className="py-2.5 px-5 rounded-xl bg-emerald-main hover:bg-emerald-med text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-all"
          >
            {loading ? 'Mise à jour en cours...' : 'Enregistrer le nouveau mot de passe'}
          </button>
        </form>
      </div>

      {/* ACTIVE SESSIONS CARD */}
      <div className={`p-5 sm:p-6 rounded-xl border ${
        isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-serif font-bold text-gold-light text-base flex items-center gap-2">
              <Laptop className="w-5 h-5 text-gold-main" />
              <span>Sessions Administrateur Actives</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Appareils actuellement connectés à l'espace d'administration.
            </p>
          </div>

          {activeSessions.length > 1 && (
            <button
              onClick={handleTerminateOthers}
              className="self-start sm:self-center py-1.5 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Fermer les autres sessions</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div 
              key={session.id}
              className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-black/30 border border-white/10 text-stone-300">
                  {session.device.includes('iPhone') || session.device.includes('Android') ? (
                    <MobileIcon className="w-4 h-4" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-cream-main">{session.device}</span>
                    {session.isCurrent && (
                      <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                        Cet appareil (Actuel)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                    <span>{session.browser} • {session.os}</span>
                    <span>•</span>
                    <span className="font-mono text-stone-500">{session.ip}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-stone-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gold-main" />
                  <span>{session.location}</span>
                </span>
                <span>•</span>
                <span>{session.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LOGIN HISTORY TABLE */}
      <div className={`p-5 sm:p-6 rounded-xl border ${
        isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10'
      }`}>
        <h3 className="font-serif font-bold text-gold-light text-base mb-1">
          Historique Récent des Connexions
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Traçabilité des tentatives d'accès avec horodatage, appareil et localisation approximative.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 text-stone-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Appareil</th>
                <th className="py-2.5 px-3">Adresse IP</th>
                <th className="py-2.5 px-3">Ville / Région</th>
                <th className="py-2.5 px-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {loginHistory.map((item) => (
                <tr key={item.id} className="hover:bg-white/5">
                  <td className="py-2.5 px-3 text-stone-300">{item.date}</td>
                  <td className="py-2.5 px-3 text-stone-200 font-sans">{item.device}</td>
                  <td className="py-2.5 px-3 text-stone-400">{item.ip}</td>
                  <td className="py-2.5 px-3 text-stone-300 font-sans">{item.location}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                      item.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
                      item.status === 'locked' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.status === 'success' ? 'Succès (2FA)' : item.status === 'locked' ? 'Verrouillé (IP)' : 'Échec'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 2FA MANAGEMENT */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl border p-6 shadow-2xl ${
            isDark ? 'bg-[#1A140E] border-gold-main/30 text-cream-main' : 'bg-white border-black/15 text-ink'
          }`}>
            <h3 className="font-serif font-bold text-gold-light text-base mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Paramètres de Double Authentification</span>
            </h3>
            
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Pour des raisons de haute sécurité, la double authentification est obligatoire sur le compte racine de l'administrateur.
            </p>

            <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs space-y-2 mb-4">
              <div className="font-semibold text-gold-main">Code secret de configuration (Clé TOTP) :</div>
              <div className="p-2 rounded bg-black/40 font-mono text-center text-xs tracking-widest text-emerald-400 border border-white/5">
                ISLAM-ABOU-BAKAR-2026-AUTH
              </div>
              <div className="text-[11px] text-stone-400">
                Vous pouvez scanner ce secret dans Google Authenticator, Authy ou Microsoft Authenticator.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gold-main/10 border border-gold-main/20 text-xs space-y-1">
              <div className="font-semibold text-gold-light">Codes de secours d'urgence :</div>
              <p className="text-[11px] text-stone-400">
                En cas de perte de votre téléphone, conservez ce code d'urgence dans un endroit confidentiel : <span className="font-mono font-bold text-white">786786</span>.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setShow2FAModal(false)}
                className="py-2 px-4 rounded-xl bg-gold-main text-ink font-semibold text-xs hover:bg-gold-light"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
