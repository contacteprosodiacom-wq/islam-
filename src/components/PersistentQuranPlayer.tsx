import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  RotateCcw, X, ChevronUp, ChevronDown, Music, BookOpen, 
  ExternalLink, Sparkles, Loader2, Gauge, Heart
} from 'lucide-react';
import { useQuranAudio } from '../lib/quran-audio-context';
import { useContentStore } from '../lib/content-store';
import { Language, Route } from '../types';
import AudioProgressBar from './AudioProgressBar';

interface PersistentQuranPlayerProps {
  lang: Language;
  onNavigate?: (route: Route, params?: any) => void;
}

export default function PersistentQuranPlayer({ lang, onNavigate }: PersistentQuranPlayerProps) {
  const {
    currentSurah,
    currentReciter,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    playbackRate,
    isPlayerVisible,
    isMinimized,
    audioNotice,

    // Favorites
    isFavoriteSurah,
    toggleFavoriteSurah,

    togglePlay,
    nextSurah,
    prevSurah,
    seekTo,
    setVolume,
    toggleMute,
    toggleLoop,
    setPlaybackRate,
    setReciter,
    closePlayer,
    toggleMinimize,
    formatTime
  } = useQuranAudio();

  const { reciters } = useContentStore();
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const isAr = lang === 'ar';

  if (!isPlayerVisible) {
    return null;
  }

  // Quick navigation to Coran full page with selected reciter & surah
  const handleOpenFullQuran = () => {
    if (onNavigate) {
      onNavigate('coran', { reciterId: currentReciter.id, surahNumber: currentSurah.number });
    }
  };

  const speedOptions = [0.75, 1, 1.25, 1.5];

  // MINI BANNER WHEN MINIMIZED
  if (isMinimized) {
    return (
      <aside 
        aria-label={lang === 'ar' ? 'مشغل القرآن الصوتي' : 'Lecteur audio du Coran'}
        className="fixed bottom-4 right-4 z-50 animate-bounce-subtle"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-r from-ink via-emerald-950 to-ink text-white border border-gold-main/40 rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-3 backdrop-blur-md"
        >
          {/* Pulsing audio wave icon */}
          <div className="relative flex items-center justify-center">
            <span className={`w-8 h-8 rounded-full bg-gold-main/20 flex items-center justify-center text-gold-light ${isPlaying ? 'animate-pulse' : ''}`}>
              <Music className="w-4 h-4 text-gold-main" />
            </span>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-ink animate-ping" />
            )}
          </div>

          {/* Surah & Reciter brief */}
          <div className="text-left cursor-pointer" onClick={toggleMinimize}>
            <p className="text-xs font-serif font-bold text-gold-light leading-tight">
              {currentSurah.number}. {lang === 'ar' ? currentSurah.name : currentSurah.englishName}
            </p>
            <p className="text-[10px] text-stone-300 font-sans truncate max-w-[130px]">
              {currentReciter.name}
            </p>
          </div>

          {/* Quick Favorite */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteSurah(currentSurah.number);
            }}
            className={`p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
              isFavoriteSurah(currentSurah.number)
                ? 'text-red-400'
                : 'text-stone-400 hover:text-white'
            }`}
            title={isFavoriteSurah(currentSurah.number) ? (lang === 'ar' ? 'في المفضلة' : 'Sourate favorite') : (lang === 'ar' ? 'إضافة للمفضلة' : 'Ajouter aux favoris')}
            aria-label="Favori"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavoriteSurah(currentSurah.number) ? 'fill-current text-red-500' : ''}`} />
          </button>

          {/* Quick Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-gold-main hover:bg-gold-light text-ink flex items-center justify-center transition-all cursor-pointer shadow-md"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Expand Button */}
          <button
            type="button"
            onClick={toggleMinimize}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={lang === 'ar' ? 'توسيع المشغل' : 'Agrandir le lecteur'}
            aria-label={lang === 'ar' ? 'توسيع المشغل' : 'Agrandir le lecteur'}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </motion.div>
      </aside>
    );
  }

  return (
    <aside 
      aria-label={lang === 'ar' ? 'مشغل القرآن الصوتي المستمر' : 'Lecteur audio persistant du Coran'}
      className="fixed bottom-0 left-0 right-0 z-50 print:hidden"
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full bg-[#120E0A]/95 text-white border-t border-gold-main/30 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      >
        {/* LIGNE FINE ARABESQUE DORÉE */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold-main to-transparent opacity-80" />

        {/* NOTIFICATION D'ÉTAT TEMPORAIRE (ex: serveur alternatif) */}
        {audioNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/30 px-4 py-1 text-center text-xs text-emerald-200 flex items-center justify-center gap-2 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-gold-main" />
            <span>{audioNotice}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
            
            {/* GAUCHE : INFOS SOURATE & RÉCITATEUR */}
            <div className="flex items-center justify-between lg:justify-start gap-3 min-w-[240px]">
              
              <div className="flex items-center gap-3">
                {/* Icône du disque Coran */}
                <div 
                  onClick={handleOpenFullQuran}
                  className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-gold-main/30 via-emerald-950/60 to-black/80 border border-gold-main/40 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden shadow-inner"
                  title={lang === 'ar' ? 'فتح صفحة القراءة الكاملة' : 'Ouvrir la page complète du Coran'}
                >
                  <span className={`text-base font-serif font-bold text-gold-light select-none ${isPlaying ? 'animate-pulse' : ''}`}>
                    {currentSurah.number}
                  </span>
                  <div className="absolute inset-0 bg-gold-main/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Titres de la sourate */}
                <div className="text-left select-none">
                  <div className="flex items-center gap-2">
                    <span 
                      onClick={handleOpenFullQuran}
                      className="font-serif font-bold text-sm sm:text-base text-gold-light hover:text-gold-main transition-colors cursor-pointer leading-tight flex items-center gap-1.5"
                    >
                      <span>{currentSurah.number}.</span>
                      <span>{lang === 'ar' ? currentSurah.name : currentSurah.englishName}</span>
                    </span>

                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-stone-300 font-sans uppercase">
                      {currentSurah.revelationType === 'Meccan' ? (lang === 'ar' ? 'مكية' : 'Mecquoise') : (lang === 'ar' ? 'مدنية' : 'Médinoise')}
                    </span>

                    {/* Bouton Favori Sourate */}
                    <button
                      type="button"
                      onClick={() => toggleFavoriteSurah(currentSurah.number)}
                      className={`p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
                        isFavoriteSurah(currentSurah.number)
                          ? 'text-red-400'
                          : 'text-stone-400 hover:text-white'
                      }`}
                      title={
                        isFavoriteSurah(currentSurah.number)
                          ? (lang === 'ar' ? 'إزالة السورة من المفضلة' : 'Retirer des favoris')
                          : (lang === 'ar' ? 'إضافة السورة إلى المفضلة' : 'Ajouter aux favoris')
                      }
                      aria-label="Favori"
                    >
                      <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${isFavoriteSurah(currentSurah.number) ? 'fill-current text-red-500' : ''}`} />
                    </button>
                  </div>

                  {/* Sélecteur de Récitateur en popover */}
                  <div className="relative mt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowReciterMenu(!showReciterMenu)}
                      className="text-xs text-stone-300 hover:text-gold-light transition-colors flex items-center gap-1 cursor-pointer font-sans"
                    >
                      <span>🎙️ {currentReciter.name}</span>
                      <ChevronDown className="w-3 h-3 text-gold-main" />
                    </button>

                    {/* Popover choix récitateur */}
                    {showReciterMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1A140E] border border-gold-main/30 rounded-2xl p-2 shadow-2xl z-50 space-y-1 backdrop-blur-md">
                        <div className="px-2 py-1 text-[10px] uppercase font-bold text-stone-400 border-b border-white/10 mb-1 flex items-center justify-between">
                          <span>{lang === 'ar' ? 'اختر القارئ' : 'Choisir le Récitateur'}</span>
                          <span className="text-gold-main font-mono">114 Sourates</span>
                        </div>
                        {reciters.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setReciter(r);
                              setShowReciterMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              r.id === currentReciter.id 
                                ? 'bg-gold-main text-ink font-bold' 
                                : 'text-stone-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{r.name}</span>
                            <span className="text-[10px] opacity-75 font-amiri">{r.localName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons d'action pour écran mobile (Réduire / Fermer) */}
              <div className="flex lg:hidden items-center gap-1">
                <button
                  type="button"
                  onClick={toggleMinimize}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white transition-colors"
                  title={lang === 'ar' ? 'تصغير' : 'Réduire'}
                  aria-label={lang === 'ar' ? 'تصغير' : 'Réduire'}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={closePlayer}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-300 transition-colors"
                  title={lang === 'ar' ? 'إغلاق' : 'Fermer le lecteur'}
                  aria-label={lang === 'ar' ? 'إغلاق' : 'Fermer le lecteur'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* CENTRE : BOUTONS DE LECTURE (Précédent, Play/Pause, Suivant) & BARRE DE PROGRESSION */}
            <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col items-center gap-1">
              
              {/* Commandes Playback */}
              <div className="flex items-center gap-3 sm:gap-5">
                
                {/* Boucle / Loop */}
                <button
                  type="button"
                  onClick={toggleLoop}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isLooping 
                      ? 'bg-gold-main/20 text-gold-light border border-gold-main/40' 
                      : 'text-stone-400 hover:text-white'
                  }`}
                  title={isLooping ? (lang === 'ar' ? 'تكرار السورة مفعل' : 'Répétition activée') : (lang === 'ar' ? 'تكرار السورة' : 'Répéter la sourate')}
                  aria-label={isLooping ? 'Désactiver la boucle' : 'Activer la boucle'}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Sourate Précédente */}
                <button
                  type="button"
                  onClick={prevSurah}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition-all cursor-pointer"
                  title={lang === 'ar' ? 'السورة السابقة' : 'Sourate précédente'}
                  aria-label={lang === 'ar' ? 'السورة السابقة' : 'Sourate précédente'}
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                {/* Bouton Principal PLAY / PAUSE */}
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-gold-main to-gold-light hover:from-gold-light hover:to-gold-main text-ink flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-gold-main/20 active:scale-95 disabled:opacity-50"
                  aria-label={isPlaying ? 'Pause' : 'Lecture'}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Sourate Suivante */}
                <button
                  type="button"
                  onClick={nextSurah}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition-all cursor-pointer"
                  title={lang === 'ar' ? 'السورة التالية' : 'Sourate suivante'}
                  aria-label={lang === 'ar' ? 'السورة التالية' : 'Sourate suivante'}
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                {/* Vitesse de lecture Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-stone-300 hover:text-gold-light transition-colors cursor-pointer border border-white/10 flex items-center gap-1"
                    title={lang === 'ar' ? 'سرعة التلاوة' : 'Vitesse de récitation'}
                  >
                    <span>{playbackRate}x</span>
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1A140E] border border-gold-main/30 rounded-xl p-1 shadow-xl z-50 flex gap-1">
                      {speedOptions.map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => {
                            setPlaybackRate(rate);
                            setShowSpeedMenu(false);
                          }}
                          className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors ${
                            playbackRate === rate ? 'bg-gold-main text-ink font-bold' : 'text-stone-300 hover:bg-white/10'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Barre de progression avec infobulle & minuteur */}
              <div className="w-full">
                <AudioProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onChange={(val) => seekTo(val)}
                  formatTime={formatTime}
                />
              </div>

            </div>

            {/* DROITE : CONTRÔLE DU VOLUME, LIEN CORAN COMPLET & FENÊTRE */}
            <div className="hidden lg:flex items-center justify-end gap-3 min-w-[240px]">
              
              {/* Slider de Volume */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 text-stone-400 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Activer le son' : 'Couper le son'}
                  aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-stone-300" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1.5 rounded-full accent-gold-main bg-white/20 cursor-pointer"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  aria-label="Volume"
                />
              </div>

              <div className="h-5 w-[1px] bg-white/15 mx-1" />

              {/* Accès complet à la page Coran avec versets et tafsir */}
              <button
                type="button"
                onClick={handleOpenFullQuran}
                className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-gold-main/20 text-gold-light hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                title={lang === 'ar' ? 'فتح صفحة تلاوة الآيات' : 'Ouvrir la lecture intégrale des versets'}
              >
                <BookOpen className="w-3.5 h-3.5 text-gold-main" />
                <span>{lang === 'ar' ? 'المصحف' : 'Versets'}</span>
              </button>

              {/* Réduire le lecteur en pastille flottante */}
              <button
                type="button"
                onClick={toggleMinimize}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={lang === 'ar' ? 'تصغير المشغل' : 'Réduire en bas de l\'écran'}
                aria-label={lang === 'ar' ? 'تصغير المشغل' : 'Réduire le lecteur'}
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Fermer le lecteur */}
              <button
                type="button"
                onClick={closePlayer}
                className="p-2 rounded-xl text-stone-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                title={lang === 'ar' ? 'إغلاق المشغل' : 'Fermer le lecteur'}
                aria-label={lang === 'ar' ? 'إغلاق المشغل' : 'Fermer le lecteur'}
              >
                <X className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>
      </motion.div>
    </aside>
  );
}
