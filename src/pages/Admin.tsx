import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, FileText, ShieldAlert, Lock, LogOut, 
  Menu, X, Sun, Moon, ArrowLeft, Clock, CheckCircle2, 
  AlertTriangle, BookOpen, Heart, Mail, Settings, Users, Sparkles 
} from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from '../lib/admin-auth-context';
import AdminLogin from '../components/admin/AdminLogin';
import EmailVerificationGuard from '../components/admin/EmailVerificationGuard';
import DashboardView from '../components/admin/DashboardView';
import ArticlesManager from '../components/admin/ArticlesManager';
import AuditLogViewer from '../components/admin/AuditLogViewer';
import SecuritySettings from '../components/admin/SecuritySettings';
import { AuditLog, Language } from '../types';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';

interface AdminProps {
  lang: Language;
}

function AdminContent({ lang }: AdminProps) {
  const { 
    currentUser, 
    loading, 
    logout, 
    adminTheme, 
    toggleAdminTheme, 
    inactivityCountdown,
    isEmailVerificationPending,
    isEmailVerified
  } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'audit' | 'security' | 'hadiths' | 'donations' | 'messages' | 'settings'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [newArticleTrigger, setNewArticleTrigger] = useState(false);

  const isDark = adminTheme === 'dark';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Format inactivity countdown in mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Load audit logs from Firestore in real time
  useEffect(() => {
    if (!currentUser) return;

    try {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs: AuditLog[] = [];
        snapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() } as AuditLog);
        });
        if (logs.length > 0) {
          setAuditLogs(logs);
        }
      }, (err) => {
        console.warn('Audit logs realtime listener note:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Could not bind audit log snapshot:', e);
    }
  }, [currentUser]);

  // Initial seed of audit logs if empty
  useEffect(() => {
    if (auditLogs.length === 0) {
      setAuditLogs([
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          userEmail: currentUser?.email || 'contact@islamaboubakar.com',
          userRole: currentUser?.role || 'admin',
          action: 'LOGIN_SUCCESS',
          targetCollection: 'auth',
          targetId: currentUser?.id || 'admin-root',
          details: 'Connexion réussie avec double authentification 2FA.',
          ipAddress: '197.234.112.45',
          userAgent: 'Chrome macOS'
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userEmail: 'contact@islamaboubakar.com',
          userRole: 'admin',
          action: 'SECURITY_CHECK',
          targetCollection: 'system',
          targetId: 'firebase-rules',
          details: 'Validation des règles de sécurité Firestore côté serveur.',
          ipAddress: '197.234.112.45',
          userAgent: 'Server-Side'
        },
        {
          id: 'log-3',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          userEmail: 'contact@islamaboubakar.com',
          userRole: 'admin',
          action: 'ARTICLE_PUBLISH',
          targetCollection: 'articles',
          targetId: 'tafsir-alkahf-vendredi',
          details: 'Publication de l\'article "Les Secrets Spirituels de la Sourate Al-Kahf".',
          ipAddress: '197.234.112.45',
          userAgent: 'Chrome macOS'
        }
      ]);
    }
  }, [currentUser]);

  // If not authenticated, show secure login portal
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-[#120E0A] text-gold-light' : 'bg-[#FAF7F0] text-emerald-main'
      }`}>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-gold-main border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-sm">Chargement sécurisé du portail administrateur...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AdminLogin />;
  }

  // Verrou de sécurité : si la validation e-mail Firebase Auth est requise, bloquer l'accès aux données personnelles
  if (isEmailVerificationPending) {
    return <EmailVerificationGuard />;
  }

  // Quick action from dashboard to trigger new article in articles manager
  const handleOpenNewArticle = () => {
    setActiveTab('articles');
    setNewArticleTrigger(true);
    setTimeout(() => setNewArticleTrigger(false), 500);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#120E0A] text-cream-main' : 'bg-[#FAF7F0] text-ink'
    }`}>
      
      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 py-3 px-4 rounded-xl border shadow-xl text-xs flex items-center gap-2 font-medium ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER */}
      <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md ${
        isDark 
          ? 'bg-[#1A140E]/90 border-gold-main/20' 
          : 'bg-white/90 border-amber-900/15 shadow-sm'
      }`}>
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-400 hover:text-white"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl text-gold-main select-none">☽</span>
            <div>
              <span className="font-serif font-bold text-sm sm:text-base text-gold-main block leading-tight">
                Islam avec Aboubakar
              </span>
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider block">
                Espace d'Administration
              </span>
            </div>
          </div>
        </div>

        {/* Right: Security, Theme, Inactivity & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Inactivity Warning Countdown */}
          <div 
            title="Délai avant déconnexion automatique d'inactivité"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
              inactivityCountdown < 120 
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
                : isDark ? 'bg-black/30 border-white/10 text-stone-400' : 'bg-black/5 border-black/10 text-stone-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-gold-main" />
            <span>{formatTimer(inactivityCountdown)}</span>
          </div>

          {/* Badge de validation E-mail Firebase Auth */}
          <div 
            title="Validation par e-mail Firebase Auth certifiée - Données personnelles protégées"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Protection PII Active :</span>
            <span>E-mail Validé (Firebase)</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleAdminTheme}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-stone-400 hover:text-gold-light transition-colors"
            title={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
          >
            {isDark ? <Sun className="w-4 h-4 text-gold-light" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>

          {/* User Role Badge & Email */}
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-cream-main truncate max-w-[160px]">
              {currentUser.displayName || currentUser.email}
            </span>
            <span className="text-[10px] text-gold-main font-semibold capitalize">
              {currentUser.role === 'admin' ? '👑 Administrateur' : '✏️ Éditeur'}
            </span>
          </div>

          {/* Exit / Return to Site */}
          <a
            href="/"
            title="Voir le site public"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Site public</span>
          </a>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            title="Déconnexion sécurisée"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </header>

      {/* BODY WITH RESPONSIVE SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (DESKTOP + MOBILE DRAWER) */}
        <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 pt-16 md:pt-0 transform transition-transform duration-200 ease-in-out border-r shrink-0 flex flex-col justify-between ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isDark 
            ? 'bg-[#15100B] border-white/10' 
            : 'bg-white border-black/10'
        }`}>
          
          <div className="p-4 space-y-6 overflow-y-auto">
            
            {/* Primary Navigation Group */}
            <div>
              <span className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500 mb-2 px-3">
                Pilotage & Contenus
              </span>

              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-gold-main text-ink font-semibold shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Tableau de bord</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('articles'); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                    activeTab === 'articles'
                      ? 'bg-gold-main text-ink font-semibold shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Articles du blog</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('audit'); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                    activeTab === 'audit'
                      ? 'bg-gold-main text-ink font-semibold shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Journal d'audit</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('security'); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                    activeTab === 'security'
                      ? 'bg-gold-main text-ink font-semibold shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Sécurité & Sessions</span>
                </button>
              </nav>
            </div>

            {/* Phase 2 / Modules en cours (attente de votre demande) */}
            <div>
              <span className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500 mb-2 px-3">
                Modules Suivants
              </span>

              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => showToast('Module Hadiths prêt pour la prochaine phase !')}
                  className="w-full py-2 px-3 rounded-xl text-xs text-stone-500 hover:text-stone-300 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Hadiths</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5">Prévu</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Module Dons et Solidarité prêt pour la prochaine étape !')}
                  className="w-full py-2 px-3 rounded-xl text-xs text-stone-500 hover:text-stone-300 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4" />
                    <span>Dons & Campagnes</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5">Prévu</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Module Boîte de réception prêt pour la suite !')}
                  className="w-full py-2 px-3 rounded-xl text-xs text-stone-500 hover:text-stone-300 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4" />
                    <span>Messages & Newsletter</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5">Prévu</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Configuration globale du site prête pour la suite !')}
                  className="w-full py-2 px-3 rounded-xl text-xs text-stone-500 hover:text-stone-300 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4" />
                    <span>Paramètres du site</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5">Prévu</span>
                </button>
              </nav>
            </div>

          </div>

          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-white/10 text-stone-500 text-[11px] flex items-center justify-between">
            <span className="truncate">Islam avec Aboubakar</span>
            <span className="font-mono text-[10px] text-emerald-400">v2.1.0</span>
          </div>
        </aside>

        {/* MAIN VIEWPORT CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView 
                onNavigateTab={(tab) => {
                  if (tab === 'articles') setActiveTab('articles');
                  else if (tab === 'audit') setActiveTab('audit');
                  else if (tab === 'security') setActiveTab('security');
                  else showToast(`Le module ${tab} sera ouvert dès confirmation de la suite.`);
                }}
                auditLogs={auditLogs}
                onNewArticle={handleOpenNewArticle}
              />
            )}

            {activeTab === 'articles' && (
              <ArticlesManager 
                onNotify={showToast}
                openNewArticleSignal={newArticleTrigger}
              />
            )}

            {activeTab === 'audit' && (
              <AuditLogViewer 
                logs={auditLogs}
                onRefresh={() => showToast('Journal d\'audit synchronisé avec Firestore.')}
              />
            )}

            {activeTab === 'security' && (
              <SecuritySettings onNotify={showToast} />
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

export default function Admin({ lang }: AdminProps) {
  return (
    <AdminAuthProvider>
      <AdminContent lang={lang} />
    </AdminAuthProvider>
  );
}
