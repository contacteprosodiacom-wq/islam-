import { useState, useEffect, useRef, type TouchEvent, type MouseEvent } from 'react';
import { Menu, X, Heart, ArrowRight, Lock } from 'lucide-react';
import { Language, Route } from '../types';
import { translations } from '../data/translations';
import { useContentStore } from '../lib/content-store';

interface NavbarProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

export default function Navbar({ lang, onLangChange, currentRoute, onNavigate }: NavbarProps) {
  const { donsCampaign } = useContentStore();
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(true);
  const lastTouchNavRef = useRef<number>(0);

  // Fundraiser variables synced with Store!
  const collected = donsCampaign.collected;
  const target = donsCampaign.target;
  const percentage = Math.min(Math.round((collected / target) * 100), 100);

  const navLinks: { id: Route; label: string }[] = [
    { id: 'home', label: t.navHome },
    { id: 'coran', label: t.navQuran },
    { id: 'hadiths', label: t.navHadiths },
    { id: 'prayers', label: t.navPrayers },
    { id: 'prophets', label: t.navProphets },
    { id: 'islam', label: t.navIslam },
    { id: 'medias', label: t.navMedias },
    { id: 'dons', label: t.navDons },
    { id: 'zakat', label: t.navZakat },
    { id: 'ebooks', label: t.navEbooks },
    { id: 'blog', label: t.navBlog },
    { id: 'videos', label: t.navVideos },
    { id: 'quiz', label: t.navQuiz },
    { id: 'contact', label: t.navContact },
    { id: 'about', label: t.navAbout }
  ];

  const handleLinkClick = (id: Route, _e?: MouseEvent<HTMLElement>) => {
    if (Date.now() - lastTouchNavRef.current < 500) {
      return;
    }
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  const handleLinkTouchStart = (id: Route, e: TouchEvent<HTMLElement>) => {
    if (e.touches && e.touches.length > 1) {
      return;
    }
    lastTouchNavRef.current = Date.now();
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  // Close mobile menu when route changes externally (e.g. emergency CTA or back button)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentRoute]);

  // Lock background page scroll on touch devices while mobile drawer is open,
  // handle Escape key, and auto-close when resizing to desktop breakpoint (xl: 1280px).
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    const desktopMedia = window.matchMedia('(min-width: 1280px)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    desktopMedia.addEventListener('change', handleMediaChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      desktopMedia.removeEventListener('change', handleMediaChange);
    };
  }, [mobileMenuOpen]);

  const isAr = lang === 'ar';

  return (
    <header className="relative z-[60]">
      
      {/* FIXED NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 h-[68px] bg-[#1A1209]/95 backdrop-blur-md border-b border-gold-main/20 flex items-center justify-between gap-2 px-3 sm:px-6 lg:px-8 text-white z-[60]">
        
        {/* Logo Left */}
        <button
          type="button"
          onClick={(e) => handleLinkClick('home', e)}
          onTouchStart={(e) => handleLinkTouchStart('home', e)}
          className="flex items-center gap-1.5 sm:gap-2 min-w-0 cursor-pointer group text-left focus:outline-none touch-manipulation"
        >
          <span className="text-xl sm:text-2xl text-gold-main transition-transform group-hover:rotate-12 select-none shrink-0">
            ☽
          </span>
          <span className="font-serif font-semibold text-xs sm:text-base tracking-tight text-gold-main group-hover:text-gold-light transition-colors truncate">
            {t.logoTitle}
          </span>
        </button>

        {/* Links Center (Hidden on Mobile) */}
        <div className="hidden xl:flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 max-w-[55%] py-1">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={(e) => handleLinkClick(link.id, e)}
                onTouchStart={(e) => handleLinkTouchStart(link.id, e)}
                className={`text-xs font-semibold uppercase tracking-wider relative py-1 transition-all focus:outline-none touch-manipulation cursor-pointer ${
                  isActive
                    ? 'text-gold-main font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-gold-main rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Languages & Burger Right */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Languages buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#1A1209] border border-gold-main/15 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onLangChange('fr')}
              className={`px-1.5 sm:px-2 py-1 rounded text-[10px] font-bold font-sans transition-all focus:outline-none touch-manipulation cursor-pointer ${
                lang === 'fr' ? 'bg-gold-main text-ink' : 'text-gray-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => onLangChange('en')}
              className={`px-1.5 sm:px-2 py-1 rounded text-[10px] font-bold font-sans transition-all focus:outline-none touch-manipulation cursor-pointer ${
                lang === 'en' ? 'bg-gold-main text-ink' : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLangChange('ar')}
              className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-amiri font-bold transition-all focus:outline-none touch-manipulation cursor-pointer ${
                lang === 'ar' ? 'bg-gold-main text-ink' : 'text-gray-400 hover:text-white'
              }`}
              dir="rtl"
            >
              عر
            </button>
          </div>

          {/* Admin shortcut button */}
          <button
            id="nav-admin-btn"
            type="button"
            onClick={(e) => handleLinkClick('admin', e)}
            onTouchStart={(e) => handleLinkTouchStart('admin', e)}
            className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none touch-manipulation min-h-[36px] ${
              currentRoute === 'admin'
                ? 'bg-gold-main text-ink border-gold-main font-bold shadow-md'
                : 'bg-[#1A1209] border-gold-main/20 text-gold-main/80 hover:text-gold-main hover:border-gold-main/50'
            }`}
            title="Espace Administrateur"
            aria-label="Espace Administrateur"
          >
            <Lock className="w-3.5 h-3.5 text-gold-main" />
            <span className="hidden lg:inline text-[11px] font-semibold tracking-wide">Admin</span>
          </button>

          {/* Toggle Burger on mobile */}
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="xl:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl text-gold-main hover:text-white hover:bg-white/10 active:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-main touch-manipulation cursor-pointer select-none"
            title={mobileMenuOpen ? (t.close || 'Fermer le menu') : 'Menu'}
            aria-label={mobileMenuOpen ? (t.close || 'Fermer le menu') : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

      </nav>

      {/* MOBILE DRAWER BACKDROP & SCROLLABLE PANEL */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-x-0 top-[68px] bottom-0 bg-black/60 backdrop-blur-xs z-40 xl:hidden cursor-pointer touch-manipulation"
            aria-label={t.close || 'Fermer le menu'}
          />
          <nav
            id="mobile-nav-drawer"
            aria-label="Navigation mobile"
            className={`fixed top-[68px] bottom-0 ${
              isAr ? 'left-0 border-r' : 'right-0 border-l'
            } w-72 max-w-[85vw] max-h-[calc(100dvh-68px)] bg-[#1A1209] text-white border-gold-main/20 z-50 px-5 pt-4 pb-24 flex flex-col gap-1 overflow-y-auto overscroll-contain touch-pan-y xl:hidden shadow-2xl`}
          >
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={(e) => handleLinkClick(link.id, e)}
                  onTouchStart={(e) => handleLinkTouchStart(link.id, e)}
                  className={`text-sm font-semibold uppercase tracking-wider ${
                    isAr ? 'text-right' : 'text-left'
                  } py-3 px-2 border-b border-white/10 shrink-0 cursor-pointer touch-manipulation transition-colors ${
                    isActive ? 'text-gold-main font-bold bg-gold-main/10 rounded-lg border-gold-main/20' : 'text-gray-200 hover:text-gold-light'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            <button
              id="mobile-admin-btn"
              type="button"
              onClick={(e) => handleLinkClick('admin', e)}
              onTouchStart={(e) => handleLinkTouchStart('admin', e)}
              className={`text-sm font-semibold uppercase tracking-wider ${
                isAr ? 'text-right' : 'text-left'
              } py-3 px-2 border-b border-gold-main/30 text-gold-main flex items-center gap-2 mt-2 shrink-0 cursor-pointer touch-manipulation`}
            >
              <Lock className="w-4 h-4 text-gold-main" />
              <span>Espace Administration</span>
            </button>
          </nav>
        </>
      )}

      {/* Spacer for fixed 68px top navbar */}
      <div className="h-[68px]" />

      {/* EMERGENCY CAMPAIGN BAR (In normal flow below fixed navbar so it never covers content on mobile) */}
      {emergencyOpen && (
        <div className="bg-[#991B1B] text-white text-xs z-30 py-2.5 px-4 shadow flex flex-col sm:flex-row justify-between items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-gold-light fill-gold-light animate-pulse shrink-0" />
            <span className="font-semibold tracking-wide font-sans text-center sm:text-left">{t.urgentTitle}</span>
          </div>

          {/* Animating progress bar info */}
          <div className="flex items-center gap-3 w-full sm:w-auto max-w-md flex-grow justify-center">
            <span className="text-[10px] text-zinc-200 uppercase font-mono">
              {percentage}%
            </span>
            <div className="flex-grow h-2 bg-white/20 rounded-full overflow-hidden min-w-[100px]">
              <div
                className="h-full bg-gold-main rounded-full animate-bar-grow"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-mono text-zinc-200 whitespace-nowrap">
              {t.urgentProgress.replace('{collected}', collected.toString()).replace('{target}', target.toString())}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('dons')}
              className="px-4 py-1.5 bg-gold-main hover:bg-gold-light text-ink font-bold font-sans rounded-lg transition-transform hover:scale-102 cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <span>{t.urgentCta}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setEmergencyOpen(false)}
              className="p-1 text-white/75 hover:text-white cursor-pointer"
              title={t.close}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
