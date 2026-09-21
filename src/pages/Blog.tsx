import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Clock, ArrowLeft, ArrowRight, Share2, MessageCircle, Sparkles } from 'lucide-react';
import { Language, Article } from '../types';
import { translations } from '../data/translations';
import { blogArticles } from '../data/blog';

interface BlogProps {
  lang: Language;
  preselectedArticleId?: string | null;
}

export default function Blog({ lang, preselectedArticleId }: BlogProps) {
  const t = translations[lang];
  const isAr = lang === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  // Deep-linking hook from home click
  useEffect(() => {
    if (preselectedArticleId) {
      const match = blogArticles.find(a => a.id === preselectedArticleId);
      if (match) {
        setReadingArticle(match);
        // Scroll to top of container
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [preselectedArticleId]);

  // Categories helper
  const availableCategories = [
    { id: 'all', label: t.filterAll },
    { id: 'coran', label: lang === 'fr' ? 'Coran & Tafsir' : lang === 'en' ? 'Quran & Tafsir' : 'القرآن والتفسير' },
    { id: 'spiritualite', label: lang === 'fr' ? 'Spiritualité & Bienfaisance' : lang === 'en' ? 'Spirituality & Charity' : 'التربية الروحية والإنفاق' },
    { id: 'histoire', label: lang === 'fr' ? 'Histoire & Spiritualité' : lang === 'en' ? 'History & Ethics' : 'سيرة وأخلاق' }
  ];

  // Filtering articles
  const filteredArticles = blogArticles.filter(art => {
    const matchesSearch = art.title[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
                          art.excerpt[lang].toLowerCase().includes(searchTerm.toLowerCase());
    const matchedCat = selectedCategory === 'all' || art.id.includes(selectedCategory) || art.category[lang].toLowerCase().includes(selectedCategory);
    return matchesSearch && matchedCat;
  });

  return (
    <div className={`islamic-pattern min-h-screen pb-20 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {readingArticle ? (
        /* FULL ARTICLE VIEW MODE */
        <motion.article
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        >
          {/* Back button */}
          <button
            onClick={() => setReadingArticle(null)}
            className={`mb-6 py-2.5 px-4 bg-white border border-gray-100 hover:border-gold-main/30 rounded-xl text-xs sm:text-sm font-bold text-emerald-med flex items-center gap-2 cursor-pointer shadow-sm ${
              isAr ? 'flex-row-reverse float-right' : 'float-left'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.blogBackToList}</span>
          </button>
          <div className="clear-both"></div>

          {/* Featured Large Image */}
          <div className="relative h-64 sm:h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100 mb-8 mt-4">
            <img
              src={readingArticle.image}
              alt={readingArticle.title[lang]}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-emerald-main text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase font-sans shadow">
              {readingArticle.category[lang]}
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <div className={`flex flex-wrap items-center gap-4 text-xs text-text-sec font-mono ${isAr ? 'justify-end' : ''}`}>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                {readingArticle.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-dark" />
                {readingArticle.readTime ?? '5 min'} de lecture
              </span>
            </div>

            <h1 className="text-3xl sm:text-4.5xl font-serif font-bold text-ink leading-tight tracking-tight">
              {readingArticle.title[lang]}
            </h1>

            <p className="text-base text-text-sec leading-relaxed italic font-sans border-l-4 border-gold-main pl-4 py-1">
              " {readingArticle.excerpt[lang]} "
            </p>
          </div>

          {/* Complete main textual elements */}
          <div className="mt-8 font-sans text-ink text-sm sm:text-base leading-relaxed space-y-6 whitespace-pre-wrap max-w-none border-t border-gray-50 pt-8" dir={isAr ? 'rtl' : 'ltr'}>
            {readingArticle.content[lang]}
          </div>

          {/* Article bottom author card */}
          <div className="bg-cream-main/40 rounded-2xl p-6 border border-gray-150/50 mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-main text-white font-serif font-bold text-lg flex items-center justify-center rounded-full shadow">
                AB
              </div>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <h4 className="text-sm font-serif font-bold text-ink">Aboubakar Al-Hafidh</h4>
                <p className="text-xs text-text-sec font-sans">{lang === 'fr' ? 'Créateur & Enseignant' : lang === 'en' ? 'Creator & Islamic Tutor' : 'مشرف القناة الكاتب الدعوي'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">Partager :</span>
              <button
                onClick={() => alert('Lien copié dans votre presse-papiers avec succès.')}
                className="p-2 rounded-full hover:bg-gold-main/10 text-emerald-med hover:text-gold-dark border border-gray-100 bg-white"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.article>
      ) : (
        /* STANDARD BLOG LIST VIEW MODE */
        <div>
          {/* INTRO HERO HEADER */}
          <section className="bg-ink py-16 text-white border-b border-gold-main/20 relative">
            <div className="absolute inset-0 bg-gold-main/2 opacity-5 select-none font-amiri text-8xl text-center">
              مدونة مفيدة
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-gold-light" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                {t.blogTitle}
              </h1>
              <p className="text-xs sm:text-sm text-text-sec max-w-xl mx-auto leading-relaxed">
                {t.blogSubtitle}
              </p>
            </div>
          </section>

          {/* BARRE DE RECHERCHE & DYNAMIC CATEGORIES ROW */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Category selector left */}
              <div className="md:col-span-8 flex flex-wrap gap-2">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                      selectedCategory === cat.id
                        ? 'bg-gold-main text-ink font-bold shadow-md'
                        : 'bg-white border border-gray-100 text-text-sec hover:border-gold-main/30 hover:bg-cream-main/20'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Instant Search input right */}
              <div className="md:col-span-4 relative mt-2 md:mt-0">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.blogSearch}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 hover:border-gold-main/30 text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main placeholder-gray-400 font-sans shadow-sm"
                />
              </div>

            </div>
          </section>

          {/* MAIN ARTICLES GRID */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-8 border border-gray-100 max-w-xl mx-auto">
                <p className="text-text-sec text-sm">
                  Aucun article ne correspond à votre recherche d'apprentissage. Essayez d'autres mots-clés.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredArticles.map((article) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setReadingArticle(article)}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gold-main/40 hover:shadow-xl cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image block */}
                      <div className="relative h-48 sm:h-52 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title[lang]}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3.5 left-3.5 bg-emerald-main text-white font-sans text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow">
                          {article.category[lang]}
                        </span>
                      </div>

                      {/* Content details description */}
                      <div className="p-5 space-y-2.5">
                        <div className="text-[11px] text-gray-400 font-mono flex gap-4">
                          <span>{article.date}</span>
                          <span>• {article.readTime}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-serif font-bold text-ink group-hover:text-emerald-med line-clamp-2 transition-colors">
                          {article.title[lang]}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-sec font-sans leading-relaxed line-clamp-2">
                          {article.excerpt[lang]}
                        </p>
                      </div>
                    </div>

                    {/* Bottom read button */}
                    <div className="p-5 pt-0 border-t border-gray-100/50 mt-2 flex items-center justify-between text-xs text-gold-dark font-bold font-sans">
                      <span className="group-hover:underline">{t.blogReadMore}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>

                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

    </div>
  );
}
