import { useState } from 'react';
import { Menu, X, Landmark, Heart, Languages, ArrowRight, Lock } from 'lucide-react';
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
    { id: 'ebooks', label: t.navEbooks },
    { id: 'blog', label: t.navBlog },
    { id: 'videos', label: t.navVideos },
    { id: 'quiz', label: t.navQuiz },
    { id: 'contact', label: t.navContact },
    { id: 'about', label: t.navAbout }
  ];

  const handleLinkClick = (id: Route) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const isAr = lang === 'ar';

  return (
    <header className="relative z-50">
      
      {/* FIXED NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 h-[68px] bg-[#1A1209]/96 backdrop-blur-md border-b border-gold-main/20 flex items-center justify-between px-4 sm:px-6 lg:px-8 text-white z-50">
        
        {/* Logo Left */}
        <div
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-xl sm:text-2xl text-gold-main transition-transform group-hover:rotate-12 select-none">
            ☽
          </span>
          <span className="font-serif font-semibold text-sm sm:text-base tracking-tight text-gold-main group-hover:text-gold-light transition-colors">
            {t.logoTitle}
          </span>
        </div>

        {/* Links Center (Hidden on Mobile) */}
        <div className="hidden xl:flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 max-w-[55%] py-1">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-xs font-semibold uppercase tracking-wider relative py-1 transition-all focus:outline-none ${
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
        <div className="flex items-center gap-3">
          
          {/* Languages buttons */}
          <div className="flex items-center gap-1 bg-[#1A1209] border border-gold-main/15 p-1 rounded-xl">
            <button
              onClick={() => onLangChange('fr')}
              className={`px-2 py-1 rounded text-[10px] font-bold font-sans transition-all focus:outline-none ${
                lang === 'fr' ? 'bg-gold-main text-ink' : 'text-gray-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onLangChange('en')}
              className={`px-2 py-1 rounded text-[10px] font-bold font-sans transition-all focus:outline-none ${
                lang === 'en' ? 'bg-gold-main text-ink' : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('ar')}
              className={`px-2.5 py-1 rounded text-[11px] font-amiri font-bold transition-all focus:outline-none ${
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
            onClick={() => handleLinkClick('admin')}
            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none ${
              currentRoute === 'admin'
                ? 'bg-gold-main text-ink border-gold-main font-bold shadow-md'
                : 'bg-[#1A1209] border-gold-main/20 text-gold-main/80 hover:text-gold-main hover:border-gold-main/50'
            }`}
            title="Espace Administrateur"
          >
            <Lock className="w-3.5 h-3.5 text-gold-main" />
            <span className="hidden lg:inline text-[11px] font-semibold tracking-wide">Admin</span>
          </button>

          {/* Toggle Burger on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-gold-main hover:text-white focus:outline-none"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </nav>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-y-0 right-0 w-64 bg-[#1A1209] text-white border-l border-gold-main/20 z-40 p-6 flex flex-col pt-24 gap-4 xl:hidden shadow-2xl">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-sm font-semibold uppercase tracking-wider text-left py-2.5 border-b border-white/5 ${
                  isActive ? 'text-gold-main font-bold pl-1 border-gold-main/20' : 'text-gray-300'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          <button
            id="mobile-admin-btn"
            onClick={() => handleLinkClick('admin')}
            className="text-sm font-semibold uppercase tracking-wider text-left py-2.5 border-b border-gold-main/30 text-gold-main flex items-center gap-2 mt-2"
          >
            <Lock className="w-4 h-4 text-gold-main" />
            <span>Espace Administration</span>
          </button>
        </div>
      )}

      {/* EMERGENCY CAMPAIGN BAR (ABSOLUTE PLACED BELOW FIXED HEIGHT) */}
      {emergencyOpen && (
        <div className="fixed top-[68px] left-0 right-0 bg-[#991B1B] text-white text-xs z-30 py-3 px-4 shadow flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-gold-light fill-gold-light animate-pulse" />
            <span className="font-semibold tracking-wide font-sans">{t.urgentTitle}</span>
          </div>

          {/* Animating progress bar info */}
          <div className="flex items-center gap-4 w-full sm:w-auto max-w-md flex-grow justify-center">
            <span className="text-[10px] text-zinc-200 uppercase font-mono">
              {percentage}%
            </span>
            <div className="flex-grow h-2 bg-white/20 rounded-full overflow-hidden min-w-[120px]">
              <div
                className="h-full bg-gold-main rounded-full animate-bar-grow"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-mono text-zinc-200">
              {t.urgentProgress.replace('{collected}', collected.toString()).replace('{target}', target.toString())}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('dons')}
              className="px-4 py-1.5 bg-gold-main hover:bg-gold-light text-ink font-bold font-sans rounded-lg transition-transform hover:scale-102 cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <span>{t.urgentCta}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setEmergencyOpen(false)}
              className="p-1 text-white/75 hover:text-white"
              title={t.close}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* spacer to prevent layout overlap */}
      <div className={`h-[68px] ${emergencyOpen ? 'mb-[52px] sm:mb-[46px]' : ''}`}></div>

    </header>
  );
}
