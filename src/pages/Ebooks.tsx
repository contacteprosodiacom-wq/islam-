import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Award, Download, ShoppingBag, Eye, RefreshCw, ScrollText, CheckCircle } from 'lucide-react';
import { Language, Ebook } from '../types';
import { translations } from '../data/translations';
import { ebooks } from '../data/ebooks';

interface EbooksProps {
  lang: Language;
}

export default function Ebooks({ lang }: EbooksProps) {
  const t = translations[lang];
  const isAr = lang === 'ar';

  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'paid' | 'coran' | 'fiqh' | 'histoire' | 'spiritualite'>('all');
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);
  const [downloadSuccessLogo, setDownloadSuccessLogo] = useState<string | null>(null);

  // Filters logic
  const filteredEbooks = ebooks.filter(eb => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'free') return eb.isFree;
    if (activeFilter === 'paid') return !eb.isFree;
    return eb.category === activeFilter;
  });

  const handleDownload = (book: Ebook) => {
    setDownloadingBookId(book.id);
    setTimeout(() => {
      setDownloadingBookId(null);
      setDownloadSuccessLogo(book.title[lang]);
      setTimeout(() => {
        setDownloadSuccessLogo(null);
      }, 5000);
    }, 1800);
  };

  const categoriesFilters = [
    { id: 'all' as const, label: t.ebookFilteredAll },
    { id: 'free' as const, label: t.ebookFilteredFree },
    { id: 'paid' as const, label: t.ebookFilteredPaid },
    { id: 'coran' as const, label: lang === 'fr' ? 'Coran' : lang === 'en' ? 'Quran' : 'القرآن الكريم' },
    { id: 'fiqh' as const, label: lang === 'fr' ? 'Fiqh / Pratique' : lang === 'en' ? 'Fiqh / Law' : 'الفقة الشريف' },
    { id: 'histoire' as const, label: lang === 'fr' ? 'Histoire islamique' : lang === 'en' ? 'Islamic History' : 'التاريخ والسير' },
    { id: 'spiritualite' as const, label: lang === 'fr' ? 'Spiritualité' : lang === 'en' ? 'Spirituality' : 'التزكية والروحي' }
  ];

  return (
    <div className={`islamic-pattern min-h-screen pb-20 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {/* SECTION HERO */}
      <section className="bg-ink py-16 text-white relative border-b border-gold-main/20">
        <div className="absolute inset-0 bg-gold-main/2 opacity-5 select-none font-amiri text-8xl text-center">
          كتاب مفيد
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-6 h-6 text-gold-light" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {t.ebooksTitle}
          </h1>
          <p className="text-xs sm:text-sm text-text-sec max-w-xl mx-auto leading-relaxed">
            {t.ebooksSubtitle}
          </p>
        </div>
      </section>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {downloadSuccessLogo && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="bg-emerald-main text-white py-4 px-6 rounded-2xl max-w-xl mx-auto my-6 shadow-xl border border-gold-main/20 flex items-start gap-3.5 z-40 relative"
          >
            <CheckCircle className="w-6 h-6 text-gold-light flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-gold-light">
                {lang === 'fr' ? 'Fichier Prêt Pour l\'Apprenti' : lang === 'en' ? 'Ebook Ready for Download' : 'الكتاب جاهز للمطالعة الآن'}
              </h4>
              <p className="text-xs text-slate-100 mt-1 font-sans">
                {t.ebookSuccessDownload} ({downloadSuccessLogo})
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER BUTTONS ROW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`flex flex-wrap gap-2 justify-center sm:justify-start ${isAr ? 'flex-row-reverse' : ''}`}>
          {categoriesFilters.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                activeFilter === btn.id
                  ? 'bg-gold-main text-ink font-bold shadow-md'
                  : 'bg-white border border-gray-100 text-text-sec hover:border-gold-main/30 hover:bg-cream-main/20'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {/* SECTION EBOOK PHARE (FEATURED DETAILED HORIZONTAL CARD) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-emerald-main text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-gold-main/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-main/5 rounded-full blur-3xl"></div>
          
          <div className="lg:col-span-3 flex justify-center">
            {/* Book Spine cover simulation */}
            <div className="w-48 h-64 bg-ink/85 rounded-r-2xl border-l-8 border-gold-main shadow-2xl p-5 flex flex-col justify-between relative group transform hover:rotate-3 transition-transform">
              <div className="absolute right-3 top-3 select-none text-white/5 font-amiri text-6xl">
                أثر
              </div>
              <div>
                <Award className="w-8 h-8 text-gold-light mb-3" />
                <h3 className="text-sm font-serif font-bold text-gold-light tracking-wide leading-tight line-clamp-4">
                  {ebooks[0].title[lang]}
                </h3>
              </div>
              <div className="border-t border-white/10 pt-2 font-sans text-[11px] text-gray-400">
                Aboubakar • Sunnah
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-4">
            <span className="text-gold-main text-xs font-bold uppercase tracking-wider bg-gold-main/10 px-3 py-1 rounded-full inline-block">
              ⭐ {t.ebookFeaturedTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
              {ebooks[0].title[lang]}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans max-w-3xl">
              {t.ebookFeaturedDesc}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className="text-gold-light text-2xl font-mono font-bold">
                {ebooks[0].price} €
              </span>
              <button
                onClick={() => handleDownload(ebooks[0])}
                disabled={downloadingBookId === ebooks[0].id}
                className="px-6 py-3 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow"
              >
                {downloadingBookId === ebooks[0].id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Progression...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.ebookBuy.replace('{price}', ebooks[0].price?.toString() || '15')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE GRID ITEMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEbooks.map((book) => {
            const isDownloading = downloadingBookId === book.id;
            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 hover:border-gold-main/40 hover:shadow-xl rounded-2xl p-6 relative group flex flex-col justify-between transition-all"
              >
                {/* Gold thin top hover bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gold-main scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-t-2xl"></div>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      book.isFree ? 'bg-emerald-main/10 text-emerald-main' : 'bg-gold-main/15 text-gold-dark'
                    }`}>
                      {book.badge[lang]}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono uppercase font-bold">
                      {book.category}
                    </span>
                  </div>

                  {/* Pseudo book cover preview */}
                  <div className="w-full h-40 bg-cream-main/40 rounded-xl mb-4 flex items-center justify-center p-4 border border-dashed border-gray-100">
                    <div className="text-center space-y-2">
                      <ScrollText className="w-7 h-7 text-gold-dark mx-auto" />
                      <p className="text-xs font-serif font-bold text-ink line-clamp-2 max-w-[200px]">
                        {book.title[lang]}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-base font-serif font-bold text-ink mb-1 group-hover:text-emerald-med transition-colors">
                    {book.title[lang]}
                  </h3>
                  <p className="text-xs text-text-sec font-sans leading-relaxed line-clamp-3 mb-4">
                    {book.description[lang]}
                  </p>
                </div>

                <div className="border-t border-gray-50 pt-4 flex items-center justify-between mt-2">
                  <p className="text-[11px] text-gray-400 font-sans italic">
                    Auteur : {book.author}
                  </p>
                  
                  {book.isFree ? (
                    <button
                      onClick={() => handleDownload(book)}
                      disabled={isDownloading}
                      className="px-4 py-2 bg-emerald-main text-white hover:bg-emerald-med rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {isDownloading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{t.ebookDownload}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownload(book)}
                      disabled={isDownloading}
                      className="px-4 py-2 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow"
                    >
                      {isDownloading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      )}
                      <span>{book.price} €</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
