import { Video, Facebook, Instagram, MessageCircle, Send, Mail, Star, Heart } from 'lucide-react';
import { Language, Route } from '../types';
import { translations } from '../data/translations';

interface FooterProps {
  lang: Language;
  onNavigate: (route: Route) => void;
}

export default function Footer({ lang, onNavigate }: FooterProps) {
  const t = translations[lang];

  const columnsPages: { label: string; id: Route }[] = [
    { label: t.navHome, id: 'home' },
    { label: t.navQuran, id: 'coran' },
    { label: t.navDons, id: 'dons' },
    { label: t.navZakat, id: 'zakat' },
    { label: t.navEbooks, id: 'ebooks' },
    { label: t.navBlog, id: 'blog' },
    { label: t.navVideos, id: 'videos' },
    { label: t.navQuiz, id: 'quiz' }
  ];

  const columnsResources: { label: string; id: Route }[] = [
    { label: t.navZakat, id: 'zakat' },
    { label: t.navEbooks, id: 'ebooks' },
    { label: t.navQuiz, id: 'quiz' },
    { label: t.navBlog, id: 'blog' },
    { label: t.navAbout, id: 'about' }
  ];

  const socials = [
    { name: "YouTube", icon: <Video className="w-4 h-4 text-red-500" />, href: "https://youtube.com" },
    { name: "Facebook", icon: <Facebook className="w-4 h-4 text-blue-500 fill-current" />, href: "https://facebook.com" },
    { name: "Instagram", icon: <Instagram className="w-4 h-4 text-pink-500" />, href: "https://instagram.com" },
    { name: "WhatsApp", icon: <MessageCircle className="w-4 h-4 text-green-500 fill-current" />, href: "https://whatsapp.com" },
    { name: "Telegram", icon: <Send className="w-4 h-4 text-cyan-400" />, href: "https://telegram.org" },
    { name: "Mail", icon: <Mail className="w-4 h-4 text-gold-light" />, href: "mailto:contact@islamaboubakar.com" }
  ];

  const isAr = lang === 'ar';

  return (
    <footer className="bg-[#1A1209] text-white pt-16 pb-8 border-t border-gold-main/20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Col 1: Logo & Desc */}
        <div className={`lg:col-span-4 space-y-4 ${isAr ? 'lg:order-4 text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 ${isAr ? 'justify-end' : ''}`}>
            <span className="text-2xl text-gold-main select-none">☽</span>
            <span className="font-serif font-bold text-lg tracking-tight text-gold-main">
              {t.logoTitle}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
            {t.footerDesc}
          </p>

          {/* Social icons, square rounded, dark background, color on hover */}
          <div className={`flex gap-2.5 pt-2 ${isAr ? 'justify-end' : ''}`}>
            {socials.map((soc, i) => (
              <a
                key={i}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                title={soc.name}
                className="w-8 h-8 rounded-lg bg-black/40 hover:bg-black/80 border border-white/5 hover:border-gold-main/30 flex items-center justify-center transition-all group"
              >
                <span className="group-hover:scale-110 transition-transform">{soc.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Platform Links */}
        <div className={`lg:col-span-2 space-y-3 ${isAr ? 'lg:order-3 text-right' : 'text-left'}`}>
          <h4 className="text-xs sm:text-sm font-serif font-bold text-gold-main uppercase tracking-wider">
            {t.footerPages}
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            {columnsPages.map((col, idx) => (
              <li key={idx}>
                <button
                  onClick={() => onNavigate(col.id)}
                  className="hover:text-gold-light hover:underline focus:outline-none transition-colors"
                >
                  {col.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Resources Links */}
        <div className={`lg:col-span-2 space-y-3 ${isAr ? 'lg:order-2 text-right' : 'text-left'}`}>
          <h4 className="text-xs sm:text-sm font-serif font-bold text-gold-main uppercase tracking-wider">
            {t.footerResources}
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            {columnsResources.map((col, idx) => (
              <li key={idx}>
                <button
                  onClick={() => onNavigate(col.id)}
                  className="hover:text-gold-light hover:underline focus:outline-none transition-colors"
                >
                  {col.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Contact card info */}
        <div className={`lg:col-span-4 space-y-4 ${isAr ? 'lg:order-1 text-right' : 'text-left'}`}>
          <h4 className="text-xs sm:text-sm font-serif font-bold text-gold-main uppercase tracking-wider">
            {t.footerContact}
          </h4>
          <div className="space-y-2.5 text-xs text-gray-400">
            <p className="leading-relaxed">
              📍 {lang === 'fr' ? 'Sira Publication SAS — Paris, France' : lang === 'en' ? 'Sira Publishing Corp — Paris, France' : 'منشورات السيرة والقرآن — فرنسا'}
            </p>
            <p>
              📨 contact@islamaboubakar.com
            </p>
            <p>
              💬 WhatsApp : +33 6 00 00 00 00
            </p>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-main text-ink flex items-center justify-center text-xs">
              ★
            </div>
            <div>
              <p className="text-[11px] font-bold text-white">Sadaqa Jariya 2026</p>
              <p className="text-[10px] text-gray-400 font-sans">
                {lang === 'fr' ? '1 puit creusé par mois' : lang === 'en' ? '1 Well dug every month' : 'مشروع بئر ماء شهرياً'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Bottom copyright Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-mono">
        <p className={isAr ? 'text-right' : 'text-left'}>
          {t.footerRights}
        </p>
        <div className="flex items-center flex-wrap gap-4">
          <a href="#" className="hover:text-gold-light">Mentions légales</a>
          <span>•</span>
          <a href="#" className="hover:text-gold-light">Politique de confidentialité</a>
          <span>•</span>
          <button
            id="footer-admin-btn"
            onClick={() => onNavigate('admin')}
            className="hover:text-gold-main text-gold-main/80 hover:underline flex items-center gap-1.5 transition-colors cursor-pointer font-sans text-xs font-semibold"
            title="Accéder au portail d'administration sécurisé"
          >
            <span>🔐</span>
            <span>Espace Administration</span>
          </button>
        </div>
      </div>

    </footer>
  );
}
