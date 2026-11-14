import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, BookOpen, Sparkles, Copy, Check, 
  ExternalLink, Volume2, ArrowRight, Filter, ChevronRight, Tag
} from 'lucide-react';
import { Language } from '../types';
import { islamicGlossaryData, GlossaryTerm } from '../data/islamic-glossary';

interface IslamicGlossarySearchProps {
  lang: Language;
  className?: string;
}

export default function IslamicGlossarySearch({ lang, className = '' }: IslamicGlossarySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isAr = lang === 'ar';

  // Popular quick tags to display under search bar
  const quickTags = [
    { label: 'Tawḥīd (التوحيد)', query: 'tawhid' },
    { label: 'Taqwā (التقوى)', query: 'taqwa' },
    { label: 'Iḥsān (الإحسان)', query: 'ihsan' },
    { label: 'Barakah (البركة)', query: 'barakah' },
    { label: 'Ṣabr (الصبر)', query: 'sabr' },
    { label: 'Tawakkul (التوكل)', query: 'tawakkul' },
    { label: 'Zakāt (الزكاة)', query: 'zakat' }
  ];

  // Keyboard shortcut listener (Cmd+K / Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Normalize text for search comparison (stripping accents and arabic diacritics)
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u064B-\u065F\u0670]/g, ''); // strip Arabic tashkeel
  };

  // Filtered glossary list
  const filteredTerms = useMemo(() => {
    let list = islamicGlossaryData;

    // Filter by category
    if (selectedCategory !== 'all') {
      list = list.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = normalize(searchQuery.trim());
      list = list.filter(item => {
        const matchAr = normalize(item.termAr).includes(q);
        const matchTranslit = normalize(item.transliteration).includes(q);
        const matchFr = normalize(item.definitionFr).includes(q);
        const matchEn = normalize(item.definitionEn).includes(q);
        const matchRoot = item.rootAr ? normalize(item.rootAr).includes(q) : false;
        const matchTags = item.tags.some(t => normalize(t).includes(q));

        return matchAr || matchTranslit || matchFr || matchEn || matchRoot || matchTags;
      });
    }

    return list;
  }, [searchQuery, selectedCategory]);

  // Categories list with counts
  const categories = useMemo(() => {
    return [
      { id: 'all', labelFr: 'Tous les termes', labelEn: 'All terms', labelAr: 'جميع المصطلحات' },
      { id: 'Aqidah', labelFr: 'Croyance (Aqidah)', labelEn: 'Creed (Aqidah)', labelAr: 'العقيدة' },
      { id: 'Ibadah', labelFr: 'Adoration (Ibadah)', labelEn: 'Worship (Ibadah)', labelAr: 'العبادات' },
      { id: 'Akhlaq', labelFr: 'Éthique & Sagesse', labelEn: 'Ethics & Virtues', labelAr: 'الأخلاق' },
      { id: 'Fiqh', labelFr: 'Jurisprudence (Fiqh)', labelEn: 'Jurisprudence (Fiqh)', labelAr: 'الفقه' },
      { id: 'Quran & Sunnah', labelFr: 'Coran & Hadith', labelEn: 'Quran & Hadith', labelAr: 'القرآن والحديث' },
      { id: 'Concept', labelFr: 'Concepts clés', labelEn: 'Key Concepts', labelAr: 'مفاهيم إسلامية' }
    ];
  }, []);

  // Copy definition to clipboard
  const handleCopy = (term: GlossaryTerm) => {
    const textToCopy = `${term.termAr} (${term.transliteration}) : ${lang === 'en' ? term.definitionEn : term.definitionFr}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Pronounce Arabic term using speech synthesis
  const handleSpeak = (arabicText: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(arabicText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOpenSearchWithTag = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory('all');
    setIsOpen(true);
  };

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      
      {/* QUICK SEARCH BAR COMPONENT EMBEDDED IN HOME PAGE */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1A140E] via-[#120E0A] to-[#0A1A12] border border-gold-main/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        
        {/* Subtle background arabesque glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-main/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold-main animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold-light">
                  {lang === 'ar' ? 'معجم المصطلحات الإسلامية' : lang === 'en' ? 'Islamic Lexicon & Glossary' : 'Glossaire & Vocabulaire Islamique'}
                </span>
                <span className="text-[10px] bg-white/10 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                  {islamicGlossaryData.length} {lang === 'ar' ? 'مصطلح' : 'termes'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white tracking-tight">
                {lang === 'ar'
                  ? 'ابحث عن معاني ومفاهيم الكلمات العربية والإسلامية'
                  : lang === 'en'
                    ? 'Search Islamic Terms & Arabic Meanings (FR / EN)'
                    : 'Rechercher un mot-clé arabe avec sa définition complète'}
              </h2>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-stone-400 text-xs font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-gold-main">Raccourci</span>
              <kbd className="bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-white text-[11px]">⌘K</kbd>
              <span>ou</span>
              <kbd className="bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-white text-[11px]">Ctrl+K</kbd>
            </div>
          </div>

          {/* Trigger Input Bar */}
          <div 
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center bg-white/5 hover:bg-white/10 border border-gold-main/40 hover:border-gold-main rounded-2xl px-4 py-3.5 sm:py-4 transition-all duration-300 cursor-pointer shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-main/20 group-hover:bg-gold-main/30 text-gold-light flex items-center justify-center shrink-0 transition-colors mr-3">
              <Search className="w-5 h-5 text-gold-main" />
            </div>

            <span className="text-sm sm:text-base text-stone-400 font-sans flex-1 truncate">
              {lang === 'ar'
                ? 'ابحث هنا (مثال: التوحيد، الإحسان، التقوى، البركة، الصبر)...'
                : lang === 'en'
                  ? 'Search keywords (e.g., Tawhid, Taqwa, Ihsan, Barakah, Sabr)...'
                  : 'Rechercher un terme (ex: Tawhid, Taqwa, Ihsan, Barakah, Sabr)...'}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-flex text-xs px-3 py-1.5 rounded-xl bg-gold-main text-ink font-bold font-sans shadow-md group-hover:bg-gold-light transition-colors">
                {lang === 'ar' ? 'فتح المعجم' : lang === 'en' ? 'Open Lexicon' : 'Explorer le lexique'}
              </span>
              <span className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center md:hidden">
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Trending Quick Search Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-main" />
              <span>{lang === 'ar' ? 'شائع :' : lang === 'en' ? 'Popular :' : 'Mots-clés fréquents :'}</span>
            </span>
            {quickTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOpenSearchWithTag(tag.query)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-gold-main/20 hover:text-gold-light text-stone-300 border border-white/10 text-xs font-sans transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>{tag.label}</span>
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* FULL INTERACTIVE MODAL / DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#120E0A] border border-gold-main/40 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
            >
              
              {/* Modal Header & Live Search Input */}
              <div className="p-4 sm:p-6 border-b border-gold-main/20 bg-[#1A140E]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gold-main" />
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-gold-light">
                      {lang === 'ar' ? 'معجم المصطلحات الإسلامية' : lang === 'en' ? 'Islamic Lexicon & Dictionary' : 'Glossaire des Termes Islamiques'}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gold-main pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'ابحث بالاسم العربي، النطق اللاتيني، أو المعنى...'
                        : lang === 'en'
                          ? 'Search by Arabic, transliteration, English or French definition...'
                          : 'Tapez un mot arabe, transcription phonétique ou sens (ex: Taqwa, Ihsan, Fiqh)...'
                    }
                    className="w-full pl-12 pr-10 py-3 bg-white/5 focus:bg-white/10 border border-gold-main/40 focus:border-gold-main rounded-2xl text-white placeholder-stone-400 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-gold-main font-sans transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3 text-stone-400 hover:text-white p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar text-xs">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer font-sans ${
                          isSelected
                            ? 'bg-gold-main text-ink font-bold shadow-md'
                            : 'bg-white/5 hover:bg-white/10 text-stone-300'
                        }`}
                      >
                        {lang === 'ar' ? cat.labelAr : lang === 'en' ? cat.labelEn : cat.labelFr}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Content: Split list and detailed view */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Results List Left */}
                <div className="md:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar">
                  <div className="flex items-center justify-between text-xs text-stone-400 px-1 pb-1">
                    <span>{filteredTerms.length} {filteredTerms.length > 1 ? 'résultats' : 'résultat'}</span>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-gold-light hover:underline text-[11px]"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  {filteredTerms.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-stone-400">
                      <Search className="w-8 h-8 text-stone-500 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">
                        {lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك' : 'Aucun terme correspondant.'}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        {lang === 'ar' ? 'جرب البحث بكلمة أخرى' : 'Essayez avec une autre orthographe ou catégorie.'}
                      </p>
                    </div>
                  ) : (
                    filteredTerms.map((term) => {
                      const isSelected = activeTerm?.id === term.id || (!activeTerm && filteredTerms[0]?.id === term.id);
                      return (
                        <div
                          key={term.id}
                          onClick={() => setActiveTerm(term)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-gradient-to-r from-gold-main/20 via-emerald-950/40 to-transparent border-gold-main shadow-md'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-gold-light">
                                {term.transliteration}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-stone-400 font-sans">
                                {term.category}
                              </span>
                            </div>
                            <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                              {lang === 'en' ? term.definitionEn : term.definitionFr}
                            </p>
                          </div>

                          <span className="font-amiri text-lg text-gold-main font-bold shrink-0" dir="rtl">
                            {term.termAr}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Term Details Preview Right */}
                <div className="md:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[350px]">
                  {(() => {
                    const current = activeTerm || filteredTerms[0];
                    if (!current) {
                      return (
                        <div className="h-full flex items-center justify-center text-center text-stone-500 text-sm">
                          Sélectionnez un terme dans la liste pour afficher tous ses détails théologiques.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-5">
                        
                        {/* Top banner: Arabic Calligraphy, Vocalisation & Root */}
                        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-gold-main/20 text-gold-light border border-gold-main/30 text-[10px] font-mono uppercase font-bold">
                                {lang === 'ar' ? current.categoryAr : lang === 'en' ? current.categoryEn : current.categoryFr}
                              </span>
                              {current.rootAr && (
                                <span className="text-xs text-stone-400 font-sans flex items-center gap-1">
                                  <span>{lang === 'ar' ? 'الجذر :' : 'Racine :'}</span>
                                  <span className="font-amiri text-gold-main font-bold" dir="rtl">{current.rootAr}</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                              {current.transliteration}
                            </h4>
                          </div>

                          {/* Arabic Term with Audio Pronunciation Button */}
                          <div className="flex items-center gap-3" dir="rtl">
                            <span className="font-amiri text-3xl sm:text-4xl font-bold text-gold-main select-none leading-none">
                              {current.termAr}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSpeak(current.termAr, current.id)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                speakingId === current.id
                                  ? 'bg-gold-main text-ink animate-pulse'
                                  : 'bg-white/10 text-stone-300 hover:text-white hover:bg-white/20'
                              }`}
                              title="Écouter la prononciation arabe"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Definitions French & English */}
                        <div className="space-y-3">
                          {/* Primary Language Definition */}
                          <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-1.5 text-xs text-gold-light font-bold">
                              <span>{lang === 'en' ? 'Definition (English)' : 'Définition théologique (Français)'}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-gold-main/20 text-gold-main uppercase font-mono">
                                {lang === 'en' ? 'EN' : 'FR'}
                              </span>
                            </div>
                            <p className="text-sm text-stone-200 leading-relaxed font-sans">
                              {lang === 'en' ? current.definitionEn : current.definitionFr}
                            </p>
                          </div>

                          {/* Secondary Language Definition */}
                          <div className="bg-black/20 border border-white/5 rounded-2xl p-3.5">
                            <div className="flex items-center justify-between mb-1 text-[11px] text-stone-400 font-semibold">
                              <span>{lang === 'en' ? 'French Definition' : 'Définition en Anglais (English)'}</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-stone-300 uppercase font-mono">
                                {lang === 'en' ? 'FR' : 'EN'}
                              </span>
                            </div>
                            <p className="text-xs text-stone-300 leading-relaxed font-sans">
                              {lang === 'en' ? current.definitionFr : current.definitionEn}
                            </p>
                          </div>
                        </div>

                        {/* Quranic or Hadith Source Reference if available */}
                        {current.referenceQuoteAr && (
                          <div className="bg-gradient-to-br from-emerald-950/40 via-ink to-black/60 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-gold-main" />
                                <span>{lang === 'ar' ? 'الشاهد القرآني أو النبوي' : 'Référence coranique / prophétique'}</span>
                              </span>
                              {current.referenceSource && (
                                <span className="text-[11px] text-gold-light font-mono font-normal">
                                  {current.referenceSource}
                                </span>
                              )}
                            </div>

                            <p className="font-amiri text-lg text-gold-light text-right leading-relaxed" dir="rtl">
                              « {current.referenceQuoteAr} »
                            </p>

                            <p className="text-xs text-stone-300 italic">
                              « {lang === 'en' ? current.referenceQuoteEn : current.referenceQuoteFr} »
                            </p>
                          </div>
                        )}

                        {/* Bottom Actions: Copy / Share */}
                        <div className="pt-2 flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-1 text-[11px] text-stone-400">
                            <Tag className="w-3 h-3 text-stone-500 mr-1" />
                            {current.tags.map((t, idx) => (
                              <span key={idx} className="bg-white/5 px-2 py-0.5 rounded-md">
                                #{t}
                              </span>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(current)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gold-main hover:text-ink text-xs text-stone-200 font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                          >
                            {copiedId === current.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copié !</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier la définition</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-3 sm:p-4 bg-[#0E0A07] border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-gold-main" />
                  <span>Vocabulaire validé selon les sources reconnues (Coran & Sunnah)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-gold-main hover:bg-gold-light text-ink font-bold transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
