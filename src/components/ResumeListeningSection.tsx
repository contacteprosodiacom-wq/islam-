import React from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Headphones, Music, Sparkles, Clock, Trash2, ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import { Language, Route, Reciter, Surah } from '../types';
import { useQuranAudio, ListeningHistoryItem } from '../lib/quran-audio-context';
import { useContentStore } from '../lib/content-store';
import { all114Surahs } from '../data/all-114-surahs';

interface ResumeListeningSectionProps {
  lang: Language;
  onNavigate: (route: Route, params?: any) => void;
}

export default function ResumeListeningSection({ lang, onNavigate }: ResumeListeningSectionProps) {
  const {
    listeningHistory,
    currentSurah,
    currentReciter,
    isPlaying,
    playSurah,
    togglePlay,
    clearHistory,
    removeFromHistory
  } = useQuranAudio();

  const { reciters } = useContentStore();
  const isAr = lang === 'ar';

  // Take up to the 5 most recent surahs
  const recentSurahs = listeningHistory.slice(0, 5);

  // Helper format relative time
  const getRelativeTime = (timestamp: number) => {
    if (!timestamp) return '';
    const diff = Math.max(0, Date.now() - timestamp);
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (lang === 'ar') {
      if (mins < 5) return 'الآن';
      if (mins < 60) return `منذ ${mins} دقيقة`;
      if (hours < 24) return `منذ ${hours} ساعة`;
      return `منذ ${days} يوم`;
    }
    if (lang === 'en') {
      if (mins < 5) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
    // French default
    if (mins < 5) return 'À l’instant';
    if (mins < 60) return `Il y a ${mins} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    return `Il y a ${days} j`;
  };

  const handlePlayItem = (item: ListeningHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();

    // If already playing this exact surah, toggle play/pause
    if (currentSurah.number === item.surahNumber && currentReciter.id === item.reciterId) {
      togglePlay();
      return;
    }

    // Find surah object from full catalogue
    const surahObj = all114Surahs.find(s => s.number === item.surahNumber) || {
      number: item.surahNumber,
      name: item.surahNameArabic,
      englishName: item.surahName,
      englishNameTranslation: '',
      numberOfAyahs: item.numberOfAyahs,
      revelationType: item.revelationType,
      frenchName: item.frenchName
    } as Surah;

    // Find reciter object
    const reciterObj = reciters.find(r => r.id === item.reciterId) || {
      id: item.reciterId,
      name: item.reciterName,
      localName: item.reciterLocalName || item.reciterName,
      style: 'Murattal',
      origin: '',
      initials: item.reciterName.substring(0, 2),
      apiCode: ''
    } as Reciter;

    playSurah(surahObj, reciterObj);
  };

  const handleOpenSurah = (item: ListeningHistoryItem) => {
    onNavigate('coran', {
      surahNumber: item.surahNumber,
      reciterId: item.reciterId
    });
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Container with subtle luxury frame */}
      <div className="bg-gradient-to-b from-white to-cream-main/40 border border-gold-main/20 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        
        {/* Decorative corner calligraphy watermark */}
        <div 
          className="absolute -top-6 -right-6 select-none opacity-[0.03] text-gold-dark font-amiri text-9xl pointer-events-none"
          aria-hidden="true"
        >
          اقرأ
        </div>

        {/* Section Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${isAr ? 'md:flex-row-reverse text-right' : 'text-left'}`}>
          <div className="space-y-1.5">
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-main/10 text-emerald-med text-xs font-semibold border border-emerald-main/20">
                <Headphones className="w-3.5 h-3.5 text-emerald-med" />
                <span>
                  {lang === 'ar' ? 'سجل التلاوات' : lang === 'en' ? 'Listening History' : 'Historique d’écoute'}
                </span>
              </span>
              <span className="text-[11px] font-mono font-bold text-gold-dark bg-gold-main/15 px-2.5 py-0.5 rounded-full border border-gold-main/30">
                {recentSurahs.length} / 5
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <span>
                {lang === 'ar' ? 'استئناف الاستماع' : lang === 'en' ? 'Resume Listening' : 'Reprendre votre écoute'}
              </span>
              <Sparkles className="w-5 h-5 text-gold-main hidden sm:inline" />
            </h2>

            <p className="text-xs sm:text-sm text-text-sec font-sans max-w-2xl leading-relaxed">
              {lang === 'ar'
                ? 'آخر ٥ سور استمعت إليها. تابع تلاوتك وتدبرك لآيات الذكر الحكيم بنقرة واحدة.'
                : lang === 'en'
                  ? 'Your last 5 listened Surahs. Resume recitation right where you left off.'
                  : 'Retrouvez vos 5 dernières sourates écoutées et reprenez la récitation d’un simple clic.'}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className={`flex items-center gap-3 shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
            {recentSurahs.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-text-sec hover:text-red-urge font-sans font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-urge/5 transition-colors"
                title={lang === 'ar' ? 'مسح السجل' : lang === 'en' ? 'Clear history' : 'Effacer l’historique'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'مسح' : lang === 'en' ? 'Clear' : 'Effacer'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('coran')}
              className={`text-xs sm:text-sm font-bold text-emerald-med hover:text-gold-dark flex items-center gap-1.5 bg-white border border-gray-100 hover:border-gold-main/30 px-3.5 py-2 rounded-xl shadow-xs transition-all ${
                isAr ? 'flex-row-reverse' : ''
              }`}
            >
              <span>{lang === 'ar' ? 'جميع السور' : lang === 'en' ? 'All Surahs' : 'Tout le Coran'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* 5 Surahs Grid Cards */}
        {recentSurahs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentSurahs.map((item, index) => {
              const isCurrentlyPlayingThis = 
                currentSurah.number === item.surahNumber && 
                currentReciter.id === item.reciterId && 
                isPlaying;

              const isCurrentlySelected = 
                currentSurah.number === item.surahNumber && 
                currentReciter.id === item.reciterId;

              const displayName = lang === 'ar' 
                ? item.surahNameArabic 
                : lang === 'en' 
                  ? item.surahName 
                  : (item.frenchName || item.surahName);

              return (
                <motion.div
                  key={`${item.surahNumber}-${item.reciterId}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  onClick={() => handleOpenSurah(item)}
                  className={`group relative rounded-2xl p-4.5 cursor-pointer transition-all flex flex-col justify-between border ${
                    isCurrentlyPlayingThis
                      ? 'bg-emerald-main/5 border-gold-main shadow-md ring-2 ring-gold-main/30'
                      : isCurrentlySelected
                        ? 'bg-white border-gold-main/40 shadow-xs'
                        : 'bg-white border-gray-100 hover:border-gold-main/40 hover:shadow-md'
                  }`}
                >
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item.surahNumber);
                    }}
                    className={`absolute top-2.5 ${isAr ? 'left-2.5' : 'right-2.5'} opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-urge p-1 rounded-md hover:bg-gray-100 transition-all z-10`}
                    title={lang === 'ar' ? 'حذف من السجل' : 'Retirer de l’historique'}
                    aria-label="Remove"
                  >
                    <span className="text-xs font-bold leading-none">✕</span>
                  </button>

                  {/* Top card info: Surah badge & relative time */}
                  <div>
                    <div className={`flex items-center justify-between gap-2 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-xl bg-gold-main/15 border border-gold-main/30 text-gold-dark font-serif font-bold text-xs flex items-center justify-center shrink-0">
                        {item.surahNumber}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-text-sec font-mono">
                        <Clock className="w-3 h-3 text-gold-main" />
                        <span>{getRelativeTime(item.timestamp)}</span>
                      </div>
                    </div>

                    {/* Surah Titles */}
                    <div className="space-y-1 mb-3">
                      <h3 className="font-serif font-bold text-ink text-base group-hover:text-gold-dark transition-colors truncate">
                        {displayName}
                      </h3>
                      <p className="font-amiri text-gold-dark font-bold text-lg leading-tight select-none truncate" dir="rtl">
                        {item.surahNameArabic}
                      </p>
                    </div>

                    {/* Metadata chips: verses & revelation */}
                    <div className={`flex flex-wrap items-center gap-1.5 text-[11px] text-text-sec mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span className="px-2 py-0.5 rounded-md bg-cream-main font-sans border border-gray-100">
                        {item.numberOfAyahs} {lang === 'ar' ? 'آيات' : lang === 'en' ? 'verses' : 'versets'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-cream-main font-sans border border-gray-100">
                        {item.revelationType === 'Meccan' 
                          ? (lang === 'ar' ? 'مكية' : lang === 'en' ? 'Meccan' : 'Mecquoise')
                          : (lang === 'ar' ? 'مدنية' : lang === 'en' ? 'Medinan' : 'Médinoise')}
                      </span>
                    </div>

                    {/* Reciter badge */}
                    <p className={`text-xs text-emerald-med font-medium truncate flex items-center gap-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-main shrink-0" />
                      <span className="truncate">{item.reciterName}</span>
                    </p>
                  </div>

                  {/* Bottom Action Footer with Play Button & Wave Equalizer */}
                  <div className={`pt-3.5 mt-3 border-t border-gray-100 flex items-center justify-between gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-2">
                      {isCurrentlyPlayingThis ? (
                        <div className="flex items-end gap-0.5 h-4 px-1" title="En cours de lecture">
                          <span className="w-1 bg-gold-main rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                          <span className="w-1 bg-emerald-main rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                          <span className="w-1 bg-gold-main rounded-full animate-bounce h-2" />
                        </div>
                      ) : (
                        <span className="text-[11px] font-sans text-text-sec group-hover:text-ink transition-colors flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-gold-dark" />
                          <span>{lang === 'ar' ? 'قراءة' : lang === 'en' ? 'Read' : 'Consulter'}</span>
                        </span>
                      )}
                    </div>

                    {/* Play/Pause round CTA button */}
                    <button
                      type="button"
                      onClick={(e) => handlePlayItem(item, e)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer active:scale-90 ${
                        isCurrentlyPlayingThis
                          ? 'bg-emerald-main hover:bg-emerald-med text-white ring-2 ring-emerald-main/20'
                          : 'bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink shadow-gold-main/20 hover:scale-105'
                      }`}
                      title={isCurrentlyPlayingThis ? 'Mettre en pause' : 'Écouter maintenant'}
                      aria-label="Lecture audio"
                    >
                      {isCurrentlyPlayingThis ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-ink pl-0.5 text-ink" />
                      )}
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-10 px-4 bg-white/70 rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-full bg-cream-main flex items-center justify-center mx-auto mb-3 text-gold-dark">
              <Headphones className="w-6 h-6" />
            </div>
            <p className="text-sm font-serif font-bold text-ink mb-1">
              {lang === 'ar' ? 'لا يوجد سجل استماع بعد' : lang === 'en' ? 'No recent listening history yet' : 'Aucun historique d’écoute pour le moment'}
            </p>
            <p className="text-xs text-text-sec max-w-md mx-auto mb-4 font-sans">
              {lang === 'ar'
                ? 'ابدأ بالاستماع إلى أي سورة من القرآن الكريم وستظهر هنا تلقائيًا لتتمكن من متابعتها بسهولة.'
                : lang === 'en'
                  ? 'Start listening to any Surah and it will appear here automatically for quick access.'
                  : 'Commencez l’écoute d’une sourate et elle apparaîtra ici pour reprendre à tout moment.'}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('coran')}
              className="px-5 py-2.5 bg-gold-main hover:bg-gold-light text-ink text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
            >
              <Music className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'استكشف سور القرآن' : lang === 'en' ? 'Explore Surahs' : 'Explorer les sourates'}</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
