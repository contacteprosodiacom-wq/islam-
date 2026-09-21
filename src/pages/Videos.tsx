import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Search, Video, ArrowRight, ExternalLink, X, Clock, HelpCircle, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { videos } from '../data/videos';

interface VideosProps {
  lang: Language;
}

export default function Videos({ lang }: VideosProps) {
  const t = translations[lang];
  const isAr = lang === 'ar';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedYtId, setSelectedYtId] = useState<string | null>(null);

  // Filter video list
  const filteredVideos = videos.filter(v => {
    if (activeCategory === 'all') return true;
    return v.category === activeCategory;
  });

  const categories = [
    { id: 'all', label: t.filterAll },
    { id: 'geopolitique', label: t.filterGeopolitics },
    { id: 'education', label: t.filterEducation },
    { id: 'histoires', label: t.filterStories },
    { id: 'analyse', label: t.filterAnalysis },
    { id: 'ramadan', label: t.filterRamadan },
  ];

  return (
    <div className={`islamic-pattern min-h-screen pb-20 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {/* HEADER HERO */}
      <section className="bg-ink py-16 text-white border-b border-gold-main/20 relative">
        <div className="absolute inset-0 bg-gold-main/2 opacity-5 select-none font-amiri text-8xl text-center">
          دروس مرئية
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Video className="w-6 h-6 text-gold-light" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {t.videosTitle}
          </h1>
          <p className="text-xs sm:text-sm text-text-sec max-w-xl mx-auto leading-relaxed">
            {t.videosSubtitle}
          </p>
          <div className="pt-2">
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-urge text-white rounded-xl text-xs font-bold font-sans shadow hover:opacity-90"
            >
              {t.viewChannelCta}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORIES BUTTON FILTER ROW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`flex flex-wrap gap-2 justify-center sm:justify-start ${isAr ? 'flex-row-reverse' : ''}`}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                activeCategory === cat.id
                  ? 'bg-gold-main text-ink font-bold shadow-md'
                  : 'bg-white border border-gray-100 text-text-sec hover:border-gold-main/30 hover:bg-cream-main/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* CORE VIDEOS GRID DISPLAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setSelectedYtId(vid.youtubeId)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gold-main/40 hover:shadow-xl cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Simulated Thumbnail cover with a deep forest background overlay with a gold play logo */}
                <div className="relative h-48 bg-emerald-main flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-ink/30 z-10 transition-opacity group-hover:opacity-20"></div>
                  {/* Subtle geometric vectors in background for premium thumbnails */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.1)_1px,transparent_0)] bg-[size:16px_16px]"></div>
                  
                  {/* Central premium gold play icon banner */}
                  <div className="w-14 h-14 rounded-full bg-gold-main/90 group-hover:bg-gold-light group-hover:scale-110 text-ink flex items-center justify-center shadow-lg transition-transform z-20">
                    <Play className="w-6 h-6 fill-ink pl-0.5" />
                  </div>

                  {/* Absolute category badge bottom left */}
                  <span className="absolute bottom-3 left-3 bg-ink/65 text-gold-light text-[9px] uppercase tracking-widest font-mono font-bold px-2.5 py-1 rounded-md z-20 border border-gold-main/20">
                    {vid.category}
                  </span>

                  {/* Duration badge bottom right */}
                  <span className="absolute bottom-3 right-3 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 z-20">
                    <Clock className="w-3 h-3" />
                    {vid.duration}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">
                    {vid.date}
                  </span>
                  <h3 className="text-sm font-serif sm:text-base font-bold text-ink group-hover:text-emerald-med line-clamp-2 transition-colors">
                    {vid.title[lang]}
                  </h3>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-5 pt-0 mt-2 flex items-center justify-between text-xs text-gold-dark font-bold font-sans">
                <span>{lang === 'fr' ? 'Lancer la vidéo' : lang === 'en' ? 'Launch video' : 'تشغيل المقطع'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* THE EMBED VIDEOS OVERLAY CINEMATIC DIALOG */}
      <AnimatePresence>
        {selectedYtId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setSelectedYtId(null)}
                className="w-11 h-11 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                title="Quitter"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative border border-white/10"
            >
              {/* Native Iframe embed */}
              <iframe
                src={`https://www.youtube.com/embed/${selectedYtId}?autoplay=1`}
                title="Islam avec Aboubakar Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="no-referrer"
                className="w-full h-full border-0"
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
