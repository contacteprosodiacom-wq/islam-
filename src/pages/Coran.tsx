import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Play, Pause, Square, SkipBack, SkipForward, Volume2, RotateCcw, VolumeX, Eye, BookOpen, Sparkles, Loader, Music } from 'lucide-react';
import { Language, Reciter, Surah } from '../types';
import { translations } from '../data/translations';
import { all114Surahs as surahs } from '../data/all-114-surahs';
import { useContentStore } from '../lib/content-store';
import AudioProgressBar from '../components/AudioProgressBar';

interface CoranProps {
  lang: Language;
  preselectedReciterId?: string | null;
}

const everyAyahFolders: Record<string, string> = {
  'ali-djabir': 'Ali_Jaber_64kbps',
  'al-afasy': 'Alafasy_128kbps',
  'al-sudais': 'Abdurrahmaan_As-Sudais_192kbps',
  'al-husary': 'Husary_128kbps',
  'al-minshawi': 'Minshawy_Murattal_128kbps',
  'al-ghamdi': 'Ghamadi_40kbps',
  'al-muaiqly': 'MaherAlMuaiqly128kbps'
};

const mp3QuranServers: Record<string, string> = {
  'ali-djabir': 'https://server11.mp3quran.net/a_jbr',
  'al-afasy': 'https://server8.mp3quran.net/afs',
  'al-sudais': 'https://server11.mp3quran.net/sds',
  'al-husary': 'https://server13.mp3quran.net/husr',
  'al-minshawi': 'https://server10.mp3quran.net/minsh',
  'al-ghamdi': 'https://server7.mp3quran.net/s_gmd',
  'al-muaiqly': 'https://server12.mp3quran.net/maher'
};

const backupSurahServers: Record<string, string[]> = {
  'ali-djabir': [
    'https://download.quranicaudio.com/quran/ali_jaber'
  ],
  'al-afasy': [
    'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee',
    'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy'
  ],
  'al-sudais': [
    'https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays'
  ],
  'al-husary': [
    'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree'
  ],
  'al-minshawi': [
    'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee'
  ],
  'al-ghamdi': [
    'https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/complete',
    'https://server6.mp3quran.net/ghamdi'
  ],
  'al-muaiqly': [
    'https://download.quranicaudio.com/quran/maher_almu3aiqly/year1440'
  ]
};

export default function Coran({ lang, preselectedReciterId }: CoranProps) {
  const { reciters, surahAudios } = useContentStore();
  const t = translations[lang];
  const isAr = lang === 'ar';

  // State
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(
    reciters.find(r => r.id === 'ali-djabir') || reciters[0] || { id: 'ali-djabir', name: 'Sheikh Ali Djabir', apiCode: 'ar.alijaber', initials: 'AD' }
  );
  const [selectedSurah, setSelectedSurah] = useState<Surah>(surahs[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.85);
  const [audioMode, setAudioMode] = useState<'surah' | 'ayah'>('surah');
  const [currentPlayingAyahIndex, setCurrentPlayingAyahIndex] = useState<number | null>(null);
  const [audioErrorCount, setAudioErrorCount] = useState<number>(0);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  // Content viewer state (Quran reading)
  const [versesList, setVersesList] = useState<{ number: number; globalNumber: number; text: string; translationFr: string; translationEn: string; audio: string }[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [versesError, setVersesError] = useState<string | null>(null);
  
  // Custom display preferences
  const [translationMode, setTranslationMode] = useState<'fr' | 'en' | 'both' | 'none'>(lang === 'en' ? 'en' : 'fr');
  const [arabicFontSize, setArabicFontSize] = useState<number>(24);
  const [translationFontSize, setTranslationFontSize] = useState<number>(14);
  const [ayahSearchTerm, setAyahSearchTerm] = useState<string>('');

  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const lastErrorTimestampRef = useRef<number>(0);

  // Deep-link handle for preselected reciter
  useEffect(() => {
    if (preselectedReciterId) {
      const match = reciters.find(r => r.id === preselectedReciterId);
      if (match) setSelectedReciter(match);
    }
  }, [preselectedReciterId, reciters]);

  // Load verses when chosen Surah or selectedReciter changes
  useEffect(() => {
    let active = true;
    const fetchSurahText = async () => {
      setIsLoadingVerses(true);
      setVersesError(null);
      try {
        // Fetch Arabic text with audio URLs for the selected reciter
        const resArabic = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/${selectedReciter.apiCode}`);
        if (!resArabic.ok) throw new Error('Failed to load Arabic verses and audio');
        const dataArabic = await resArabic.json();
 
        // Fetch French translation
        const resFr = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/fr.hamidullah`);
        let dataFr: any = null;
        if (resFr.ok) {
          dataFr = await resFr.json();
        }
 
        // Fetch English translation
        const resEn = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/en.ahmedali`);
        let dataEn: any = null;
        if (resEn.ok) {
          dataEn = await resEn.json();
        }
 
        if (active) {
          const combined = dataArabic.data.ayahs.map((ayah: any, index: number) => {
            const rawAudio = ayah.audio || `https://cdn.islamic.network/quran/audio/128/${selectedReciter.apiCode}/${ayah.number}.mp3`;
            const secureAudio = typeof rawAudio === 'string' ? rawAudio.replace(/^http:/i, 'https:') : rawAudio;
            return {
              number: ayah.numberInSurah,
              globalNumber: ayah.number,
              text: ayah.text,
              translationFr: dataFr?.data?.ayahs[index]?.text || '',
              translationEn: dataEn?.data?.ayahs[index]?.text || '',
              audio: secureAudio
            };
          });
          setVersesList(combined);
        }
      } catch (err: any) {
        console.error(err);
        if (active) {
          setVersesError(lang === 'ar' ? 'حدث خطأ أثناء تحميل الآيات، يرجى المحاولة لاحقاً.' : 'Impossible de charger les versets pour le moment. Veuillez réessayer.');
        }
      } finally {
        if (active) setIsLoadingVerses(false);
      }
    };
 
    fetchSurahText();
    return () => {
      active = false;
    };
  }, [selectedSurah, selectedReciter]);
 
  // Reset active ayah when Surah changes
  useEffect(() => {
    setCurrentPlayingAyahIndex(audioMode === 'ayah' ? 0 : null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [selectedSurah, audioMode]);

  // Handle Audio source change when mode, Surah, Reciter, or currentPlayingAyahIndex changes
  useEffect(() => {
    if (!audioRef.current) return;

    // Reset error tracker
    setAudioErrorCount(0);

    // Stop current playback
    audioRef.current.pause();

    let audioUrl = '';

    if (audioMode === 'surah') {
      let customUrl = surahAudios[selectedReciter.id]?.[selectedSurah.number];
      if (customUrl && typeof customUrl === 'string') {
        customUrl = customUrl
          .replace('server11.mp3quran.net/a_jabr', 'server11.mp3quran.net/a_jbr')
          .replace('server11.mp3quran.net/minsh', 'server10.mp3quran.net/minsh')
          .replace('server7.mp3quran.net/ghamdi', 'server7.mp3quran.net/s_gmd');
      }
      if (customUrl) {
        audioUrl = customUrl;
      } else {
        const server = mp3QuranServers[selectedReciter.id] || 'https://server11.mp3quran.net/a_jbr';
        const paddedNumber = String(selectedSurah.number).padStart(3, '0');
        audioUrl = `${server}/${paddedNumber}.mp3`;
      }
      audioUrl = typeof audioUrl === 'string' ? audioUrl.replace(/^http:/i, 'https:') : audioUrl;
    } else if (audioMode === 'ayah') {
      if (currentPlayingAyahIndex !== null && versesList[currentPlayingAyahIndex]) {
        const activeAyah = versesList[currentPlayingAyahIndex];
        audioUrl = activeAyah.audio;
      }
    }

    if (audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : audioVolume;
      audioRef.current.muted = isMuted;
      audioRef.current.load();

      if (isPlaying) {
        const promise = audioRef.current.play();
        playPromiseRef.current = promise;
        if (promise !== undefined) {
          promise
            .then(() => {
              playPromiseRef.current = null;
            })
            .catch((err) => {
              playPromiseRef.current = null;
              if (err.name === 'NotAllowedError') {
                setIsPlaying(false);
                setAudioNotice(lang === 'ar' ? 'انقر على زر التشغيل للاستماع' : 'Cliquez sur Lecture pour écouter');
                setTimeout(() => setAudioNotice(null), 3500);
                return;
              }
              if (err.name === 'AbortError') {
                return;
              }
              console.warn("Audio play request failed:", err);
              onAudioError();
            });
        }
      }

      // Smooth scroll to card (only in manual ayah mode)
      if (audioMode === 'ayah' && currentPlayingAyahIndex !== null && versesList[currentPlayingAyahIndex]) {
        const activeAyah = versesList[currentPlayingAyahIndex];
        const element = document.getElementById(`ayah-card-${activeAyah.number}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } else {
      if (audioMode === 'ayah' && isPlaying) {
        setIsPlaying(false);
      }
    }
  }, [audioMode, selectedSurah, selectedReciter, currentPlayingAyahIndex, versesList, surahAudios]);

  // Audio loading error handler with robust fallbacks
  const onAudioError = (e?: any) => {
    if (!audioRef.current) return;
    
    // Ignore aborted errors (normal during source switching/seeking/reloads)
    if (audioRef.current.error && audioRef.current.error.code === 1) {
      return;
    }

    const now = Date.now();
    if (now - lastErrorTimestampRef.current < 600) {
      return; // Debounce rapid consecutive error events
    }
    lastErrorTimestampRef.current = now;

    if (audioMode === 'surah') {
      const paddedNumber = String(selectedSurah.number).padStart(3, '0');
      const backups = backupSurahServers[selectedReciter.id] || [];

      if (audioErrorCount < backups.length) {
        const backupBase = backups[audioErrorCount];
        const fallbackUrl = backupBase.includes('islamic.network')
          ? `${backupBase}/${selectedSurah.number}.mp3`
          : `${backupBase}/${paddedNumber}.mp3`;

        console.warn(`Surah primary stream switched to fallback ${audioErrorCount + 1}: ${fallbackUrl}`);
        setAudioErrorCount(prev => prev + 1);
        setAudioNotice(lang === 'ar' ? 'جاري الاتصال بسيرفر صوتي بديل...' : 'Connexion au serveur audio alternatif...');
        setTimeout(() => setAudioNotice(null), 3000);
        
        audioRef.current.src = fallbackUrl;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      } else if (audioErrorCount === backups.length && selectedReciter.id !== 'al-afasy') {
        // Universal high-availability CDN stream (Sheikh Al-Afasy)
        const universalFallback = `https://server8.mp3quran.net/afs/${paddedNumber}.mp3`;
        console.warn(`All reciter fallbacks exhausted. Connecting to universal stream: ${universalFallback}`);
        setAudioErrorCount(prev => prev + 1);
        setAudioNotice(lang === 'ar' ? 'استخدام السيرفر الاحتياطي العام...' : 'Bascule vers le flux audio haute disponibilité...');
        setTimeout(() => setAudioNotice(null), 3500);

        audioRef.current.src = universalFallback;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      } else {
        console.warn("All surah audio fallbacks attempted for current track.");
        setIsPlaying(false);
        setAudioErrorCount(0);
        setAudioNotice(
          lang === 'ar'
            ? 'تعذر تحميل الصوت حالياً. يرجى تجربة قارئ آخر أو إعادة المحاولة.'
            : 'Impossible de lire cet enregistrement. Essayez un autre récitateur ou réessayez.'
        );
        setTimeout(() => setAudioNotice(null), 5000);
      }
      return;
    }

    if (currentPlayingAyahIndex === null) return;
    const activeAyah = versesList[currentPlayingAyahIndex];
    if (!activeAyah) return;

    if (audioErrorCount === 0) {
      // Fallback 1: EveryAyah CDN
      const folder = everyAyahFolders[selectedReciter.id] || 'Alafasy_128kbps';
      const paddedSurah = String(selectedSurah.number).padStart(3, '0');
      const paddedAyah = String(activeAyah.number).padStart(3, '0');
      const fallbackUrl1 = `https://everyayah.com/data/${folder}/${paddedSurah}${paddedAyah}.mp3`;
      
      setAudioErrorCount(1);
      audioRef.current.src = fallbackUrl1;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    } else if (audioErrorCount === 1) {
      // Fallback 2: Islamic Network Direct (using global ayah number)
      const fallbackUrl2 = `https://cdn.islamic.network/quran/audio/128/${selectedReciter.apiCode}/${activeAyah.globalNumber}.mp3`;
      setAudioErrorCount(2);
      audioRef.current.src = fallbackUrl2;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      setAudioErrorCount(0);
      if (currentPlayingAyahIndex < versesList.length - 1) {
        setCurrentPlayingAyahIndex(currentPlayingAyahIndex + 1);
      } else {
        setIsPlaying(false);
      }
    }
  };

  // Play / Pause toggler
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (audioMode === 'ayah' && currentPlayingAyahIndex === null) {
        setCurrentPlayingAyahIndex(0);
      } else {
        const promise = audioRef.current.play();
        playPromiseRef.current = promise;
        if (promise !== undefined) {
          promise
            .then(() => {
              playPromiseRef.current = null;
            })
            .catch(() => {
              playPromiseRef.current = null;
            });
        }
      }
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentPlayingAyahIndex(audioMode === 'ayah' ? 0 : null);
    setCurrentTime(0);
  };

  // Skip Surahs
  const handleNextSurah = () => {
    const currentIndex = surahs.findIndex(s => s.number === selectedSurah.number);
    if (currentIndex < surahs.length - 1) {
      setSelectedSurah(surahs[currentIndex + 1]);
    } else {
      setSelectedSurah(surahs[0]);
    }
    setCurrentPlayingAyahIndex(audioMode === 'ayah' ? 0 : null);
    setIsPlaying(true);
  };

  const handlePrevSurah = () => {
    const currentIndex = surahs.findIndex(s => s.number === selectedSurah.number);
    if (currentIndex > 0) {
      setSelectedSurah(surahs[currentIndex - 1]);
    } else {
      setSelectedSurah(surahs[surahs.length - 1]);
    }
    setCurrentPlayingAyahIndex(audioMode === 'ayah' ? 0 : null);
    setIsPlaying(true);
  };

  // Progress update listeners
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const onAudioEnded = () => {
    if (audioMode === 'surah') {
      if (isLooping) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      } else {
        handleNextSurah();
      }
    } else if (audioMode === 'ayah' && currentPlayingAyahIndex !== null) {
      if (currentPlayingAyahIndex < versesList.length - 1) {
        setCurrentPlayingAyahIndex(currentPlayingAyahIndex + 1);
      } else {
        if (isLooping) {
          setCurrentPlayingAyahIndex(0);
        } else {
          handleNextSurah();
        }
      }
    }
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCurrentTime(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (audioRef.current) {
      audioRef.current.muted = nextState;
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const changeSpeed = () => {
    const rates = [1, 1.15, 1.25, 0.9];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Format second sizes
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter Surahs list
  const filteredSurahs = surahs.filter(s => {
    const matchesSearch = s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.frenchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.name.includes(searchTerm) ||
                          s.number.toString() === searchTerm;
    const matchesCategory = filterType === 'all' || s.revelationType === filterType;
    return matchesSearch && matchesCategory;
  });

  // Filter verses of active surah
  const filteredVerses = versesList.filter(ayah => {
    if (!ayahSearchTerm.trim()) return true;
    const term = ayahSearchTerm.toLowerCase();
    return (
      ayah.text.includes(term) ||
      ayah.translationFr.toLowerCase().includes(term) ||
      ayah.translationEn.toLowerCase().includes(term) ||
      ayah.number.toString() === term
    );
  });

  return (
    <div className={`islamic-pattern min-h-screen pb-40 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onAudioEnded}
        onError={onAudioError}
      />

      {/* HEADER SECTION */}
      <section className="bg-ink py-14 border-b border-gold-main/20 text-white relative">
        <div className="absolute inset-0 bg-gold-main/2 opacity-5 select-none font-amiri text-8xl text-center">
          القرآن الكريم
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <p className="font-amiri text-gold-main text-3xl sm:text-4xl mb-4" dir="rtl">
            {t.bismillah}
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-2">
            {t.coranSectionTitle}
          </h1>
          <p className="text-xs sm:text-sm text-text-sec max-w-xl mx-auto leading-relaxed">
            {t.coranSectionSubtitle}
          </p>
        </div>
      </section>

      {/* RECITERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-ink flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-main"></span>
            {lang === 'fr' ? 'Étape 1 : Choisir le Récitateur' : lang === 'en' ? 'Step 1: Select Reciter' : 'خطوة ١: اختر القارئ المفضل'}
          </h2>
          <span className="text-xs text-text-sec font-mono uppercase bg-gold-main/10 px-2 py-0.5 rounded font-bold">
            {reciters.length} Sheikhs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {reciters.map((reciter) => {
            const isSelected = selectedReciter.id === reciter.id;
            return (
              <div
                key={reciter.id}
                onClick={() => setSelectedReciter(reciter)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-main text-white border-gold-main shadow-lg translate-y-[-2px]'
                    : 'bg-white border-gray-100 text-ink hover:border-gold-main/30 shadow-sm'
                }`}
              >
                <div>
                  <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs font-serif uppercase mb-3 ${
                    isSelected ? 'bg-gold-main text-ink' : 'bg-cream-main text-emerald-main'
                  }`}>
                    {reciter.initials}
                  </div>
                  <h3 className="text-sm font-serif font-bold leading-tight line-clamp-1">
                    {reciter.name}
                  </h3>
                  <p className={`text-xs mt-1 font-mono uppercase tracking-wider ${
                    isSelected ? 'text-gold-light' : 'text-text-sec'
                  }`}>
                    {reciter.style}
                  </p>
                </div>
                <div className={`mt-4 border-t pt-2 flex items-center justify-between text-[11px] ${
                  isSelected ? 'border-white/10 text-emerald-light' : 'border-gray-100 text-gray-400'
                }`}>
                  <span>{reciter.origin}</span>
                  <span className="font-amiri text-xs" dir="rtl">
                    {reciter.localName.split(' ').slice(-1)[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SURAHS SEARCH & SELECT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SURAH LIST LEFT */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-serif font-bold text-ink">
              {lang === 'fr' ? 'Étape 2 : Sélectionner la Sourate' : lang === 'en' ? 'Step 2: Choose Surah' : 'خطوة ٢: حدد السورة الكريمة'}
            </h3>

            {/* Live Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchSurahPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-cream-main focus:bg-white text-sm text-ink rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main placeholder-gray-400 font-sans"
              />
            </div>

            {/* Filter tags */}
            <div className={`flex gap-1.5 text-[11px] font-bold ${isAr ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterType === 'all' ? 'bg-gold-main text-ink' : 'bg-cream-main text-text-sec hover:bg-cream-sec'
                }`}
              >
                {t.filterAll}
              </button>
              <button
                onClick={() => setFilterType('Meccan')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterType === 'Meccan' ? 'bg-gold-main text-ink' : 'bg-cream-main text-text-sec hover:bg-cream-sec'
                }`}
              >
                {t.revelationMeccan}
              </button>
              <button
                onClick={() => setFilterType('Medinan')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterType === 'Medinan' ? 'bg-gold-main text-ink' : 'bg-cream-main text-text-sec hover:bg-cream-sec'
                }`}
              >
                {t.revelationMedinan}
              </button>
            </div>
          </div>

          {/* Surah scroll element */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-h-[480px] overflow-y-auto divide-y divide-gray-50 scrollbar">
            {filteredSurahs.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-sec">
                {lang === 'fr' ? 'Aucun résultat correspondant.' : lang === 'en' ? 'No surahs match.' : 'لا توجد نتائج مطابقة.'}
              </div>
            ) : (
              filteredSurahs.map((surah) => {
                const isSelected = selectedSurah.number === surah.number;
                return (
                  <div
                    key={surah.number}
                    onClick={() => setSelectedSurah(surah)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-main/10 border-l-4 border-gold-main' : 'hover:bg-cream-main'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center ${
                        isSelected ? 'bg-gold-main text-ink' : 'bg-cream-main text-text-sec'
                      }`}>
                        {surah.number}
                      </div>
                      <div>
                        <p className={`text-sm font-serif font-bold ${isSelected ? 'text-emerald-main' : 'text-ink'}`}>
                          {surah.englishName}
                        </p>
                        <p className="text-[11px] text-text-sec">
                          {lang === 'fr' ? surah.frenchName : surah.englishNameTranslation}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-amiri">
                      <p className={`text-base font-bold ${isSelected ? 'text-gold-dark' : 'text-emerald-main'}`} dir="rtl">
                        {surah.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-sans">
                        {surah.numberOfAyahs} {lang === 'ar' ? 'آية' : 'Ayahs'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* STUDY READER VIEWER RIGHT */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 min-h-[500px] flex flex-col justify-between">
            <div>
              
              {/* Surah title details */}
              <div className="border-b border-gray-100 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className={isAr ? 'text-right' : 'text-left'}>
                  <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                    <span className="px-2 py-0.5 bg-emerald-main/10 text-emerald-med rounded-md text-[10px] uppercase font-bold">
                      {selectedSurah.revelationType === 'Meccan' ? t.revelationMeccan : t.revelationMedinan}
                    </span>
                    <span className="text-xs text-text-sec font-mono">
                      {selectedSurah.numberOfAyahs} Versets
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink">
                    {selectedSurah.englishName} • {lang === 'fr' ? selectedSurah.frenchName : selectedSurah.englishNameTranslation}
                  </h2>
                </div>

                {/* Big Arabic Calligraphy Banner */}
                <div className="text-center sm:text-right" dir="rtl">
                  <p className="font-amiri text-3xl text-gold-dark font-bold leading-tight">
                    سُورَةُ {selectedSurah.name}
                  </p>
                  <p className="text-xs text-text-sec mt-1">
                    {lang === 'fr' ? `Chapitre ${selectedSurah.number}` : `Chapter ${selectedSurah.number}`}
                  </p>
                </div>
              </div>
              
              {/* DISPLAY PREFERENCES & SEARCH PANEL */}
              <div className="bg-cream-main/40 border border-cream-sec/60 rounded-2xl p-4 mb-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans">
                  
                  {/* Translation Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">
                      {lang === 'fr' ? 'Traduction :' : lang === 'en' ? 'Translation :' : 'الترجمة :'}
                    </span>
                    <div className="inline-flex bg-white border border-gray-100 rounded-lg p-0.5 shadow-sm">
                      <button
                        onClick={() => setTranslationMode('fr')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                          translationMode === 'fr' ? 'bg-gold-main text-ink shadow-sm' : 'text-text-sec hover:text-ink'
                        }`}
                      >
                        FR
                      </button>
                      <button
                        onClick={() => setTranslationMode('en')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                          translationMode === 'en' ? 'bg-gold-main text-ink shadow-sm' : 'text-text-sec hover:text-ink'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setTranslationMode('both')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                          translationMode === 'both' ? 'bg-gold-main text-ink shadow-sm' : 'text-text-sec hover:text-ink'
                        }`}
                        title="Bilingue Français & Anglais"
                      >
                        {lang === 'fr' ? 'Bilingue' : 'Bilingual'}
                      </button>
                      <button
                        onClick={() => setTranslationMode('none')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                          translationMode === 'none' ? 'bg-gold-main text-ink shadow-sm' : 'text-text-sec hover:text-ink'
                        }`}
                      >
                        {lang === 'fr' ? 'Sans' : 'None'}
                      </button>
                    </div>
                  </div>

                  {/* Font Sizer Controls */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-medium">{lang === 'fr' ? 'Taille Arabe :' : 'Arabic Size :'}</span>
                      <button
                        onClick={() => setArabicFontSize(prev => Math.max(16, prev - 2))}
                        className="w-7 h-7 bg-white hover:bg-cream-sec text-ink rounded-lg border border-gray-100 flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                        title="Diminuer l'arabe"
                      >
                        A-
                      </button>
                      <span className="font-mono text-[10px] w-6 text-center text-gray-500 font-bold">{arabicFontSize}px</span>
                      <button
                        onClick={() => setArabicFontSize(prev => Math.min(44, prev + 2))}
                        className="w-7 h-7 bg-white hover:bg-cream-sec text-ink rounded-lg border border-gray-100 flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                        title="Agrandir l'arabe"
                      >
                        A+
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-medium">{lang === 'fr' ? 'Taille Trad. :' : 'Translation Size :'}</span>
                      <button
                        onClick={() => setTranslationFontSize(prev => Math.max(11, prev - 1))}
                        className="w-7 h-7 bg-white hover:bg-cream-sec text-ink rounded-lg border border-gray-100 flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                        title="Diminuer la traduction"
                      >
                        t-
                      </button>
                      <span className="font-mono text-[10px] w-6 text-center text-gray-500 font-bold">{translationFontSize}px</span>
                      <button
                        onClick={() => setTranslationFontSize(prev => Math.min(24, prev + 1))}
                        className="w-7 h-7 bg-white hover:bg-cream-sec text-ink rounded-lg border border-gray-100 flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                        title="Agrandir la traduction"
                      >
                        t+
                      </button>
                    </div>
                  </div>

                </div>

                {/* Mode d'écoute Toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3.5 border-t border-cream-sec/60 text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">
                      {lang === 'fr' ? "Mode d'écoute :" : lang === 'en' ? "Listening Mode :" : "طريقة الاستماع :"}
                    </span>
                    <div className="inline-flex bg-white border border-gray-100 rounded-lg p-0.5 shadow-sm">
                      <button
                        onClick={() => {
                          setAudioMode('surah');
                          setCurrentPlayingAyahIndex(null);
                        }}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          audioMode === 'surah' ? 'bg-emerald-main text-white shadow-sm' : 'text-text-sec hover:text-ink'
                        }`}
                      >
                        <BookOpen className="w-3 h-3" />
                        {lang === 'fr' ? 'Toute la Sourate (Recommandé)' : lang === 'en' ? 'Full Surah (Recommended)' : 'السورة كاملة'}
                      </button>
                      <button
                        onClick={() => {
                          setAudioMode('ayah');
                          if (currentPlayingAyahIndex === null) {
                            setCurrentPlayingAyahIndex(0);
                          }
                        }}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          audioMode === 'ayah' ? 'bg-gold-main text-ink shadow-sm' : 'text-text-sec hover:text-ink'
                        }`}
                      >
                        <Music className="w-3 h-3" />
                        {lang === 'fr' ? 'Verset par Verset' : lang === 'en' ? 'Verse by Verse' : 'آية آية'}
                      </button>
                    </div>
                  </div>

                  <div className="text-gray-500 text-[11px] italic flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-main" />
                    <span>
                      {audioMode === 'surah' 
                        ? (lang === 'fr' ? "Lecture fluide et continue de toute la sourate en un fichier unique." : lang === 'en' ? "Smooth single-file playback of the whole Surah." : "قراءة مستمرة خالية من التقطيع.") 
                        : (lang === 'fr' ? "Lecture segmentée avec possibilité de répétition et suivi par verset." : lang === 'en' ? "Segmented playback with verse-by-verse repetition options." : "تلاوة آية تلو الأخرى.")
                      }
                    </span>
                  </div>
                </div>

                {/* Search in active surah */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                      lang === 'fr' 
                        ? "Rechercher un verset par mot-clé ou par numéro..." 
                        : lang === 'en' 
                          ? "Search ayah by keyword or verse number..." 
                          : "البحث في آيات السورة الكريمة..."
                    }
                    value={ayahSearchTerm}
                    onChange={(e) => setAyahSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-24 py-2 bg-white text-xs text-ink rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-gold-main placeholder-gray-400 font-sans shadow-inner"
                  />
                  {ayahSearchTerm && (
                    <button 
                      onClick={() => setAyahSearchTerm('')}
                      className="absolute right-2 top-1.5 text-[10px] text-gray-400 hover:text-ink bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg border border-gray-100 font-sans transition-colors"
                    >
                      {lang === 'fr' ? 'Effacer' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Bismillah for except Surah Al-Tawbah */}
              {selectedSurah.number !== 9 && !ayahSearchTerm && (
                <div className="text-center font-amiri text-2xl text-emerald-main mb-8 font-semibold tracking-wide py-1 select-none" dir="rtl">
                  {t.bismillah}
                </div>
              )}

              {/* VERSES LIST LOADER/ERROR */}
              <div className="space-y-6">
                {isLoadingVerses ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-sec text-sm">
                    <Loader className="w-8 h-8 animate-spin text-gold-main" />
                    <span>{lang === 'fr' ? 'Traduction et translittération en cours...' : lang === 'en' ? 'Fetching Quranic translation...' : 'جاري تحميل الآيات العطرة...'}</span>
                  </div>
                ) : versesError ? (
                  <div className="py-16 text-center text-sm text-red-500 bg-red-50 rounded-xl p-4">
                    {versesError}
                  </div>
                ) : filteredVerses.length === 0 ? (
                  <div className="py-20 text-center text-sm text-text-sec bg-cream-main/20 rounded-2xl p-6 border border-dashed border-cream-sec">
                    {lang === 'fr' 
                      ? "Aucun verset ne correspond à votre recherche dans cette sourate." 
                      : "No ayah matching your search inside this surah."}
                  </div>
                ) : (
                  filteredVerses.map((ayah) => {
                    const realIndex = versesList.findIndex(v => v.number === ayah.number);
                    const isCurrentPlaying = audioMode === 'ayah' && currentPlayingAyahIndex === realIndex && isPlaying;

                    const handlePlayAyah = () => {
                      if (realIndex !== -1) {
                        setAudioMode('ayah');
                        setCurrentPlayingAyahIndex(realIndex);
                        setIsPlaying(true);
                      }
                    };

                    const handlePauseAyah = () => {
                      setIsPlaying(false);
                      if (audioRef.current) {
                        audioRef.current.pause();
                      }
                    };

                    return (
                      <div
                        key={ayah.number}
                        id={`ayah-card-${ayah.number}`}
                        className={`group border-b border-gray-100 pb-5 pt-4 last:border-0 px-4 rounded-2xl transition-all duration-300 ${
                          isCurrentPlaying 
                            ? 'bg-emerald-main/[0.03] border-l-4 border-gold-main ring-1 ring-gold-main/10 shadow-sm' 
                            : 'hover:bg-cream-main/20'
                        }`}
                      >
                        {/* Header of Ayah Card */}
                        <div className="flex justify-between items-start gap-4 mb-3">
                          {/* Play/Pause Button on the Left */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={isCurrentPlaying ? handlePauseAyah : handlePlayAyah}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                isCurrentPlaying 
                                  ? 'bg-emerald-main text-white shadow-md ring-2 ring-emerald-med/20' 
                                  : 'bg-cream-main text-text-sec hover:bg-gold-main hover:text-ink'
                              }`}
                              title={isCurrentPlaying ? "Pause" : "Reciter ce verset"}
                            >
                              {isCurrentPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current pl-0.5" />
                              )}
                            </button>
                            
                            {isCurrentPlaying && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-med font-bold font-sans animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-main inline-block"></span>
                                Récitation...
                              </span>
                            )}
                          </div>

                          {/* Arabic Verse on the Right */}
                          <div className="text-right flex-grow" dir="rtl">
                            <span className="inline-flex w-7 h-7 rounded-full bg-cream-sec text-ink font-mono text-[10px] items-center justify-center font-bold mr-3 shadow-inner">
                              {ayah.number}
                            </span>
                            <p 
                              className="font-amiri text-ink leading-relaxed inline"
                              style={{ fontSize: `${arabicFontSize}px` }}
                            >
                              {ayah.text}
                            </p>
                          </div>
                        </div>

                        {/* Translations */}
                        <div className="space-y-1.5 pl-9" style={{ fontSize: `${translationFontSize}px` }}>
                          {(translationMode === 'fr' || translationMode === 'both') && ayah.translationFr && (
                            <p className="text-text-sec font-sans leading-relaxed text-left" dir="ltr">
                              <span className="font-mono text-[9px] bg-emerald-main/10 text-emerald-dark px-1.5 py-0.5 rounded mr-1.5 uppercase tracking-wider font-bold">FR</span>
                              {ayah.translationFr}
                            </p>
                          )}
                          {(translationMode === 'en' || translationMode === 'both') && ayah.translationEn && (
                            <p className="text-text-sec font-sans leading-relaxed text-left" dir="ltr">
                              <span className="font-mono text-[9px] bg-gold-main/20 text-gold-dark px-1.5 py-0.5 rounded mr-1.5 uppercase tracking-wider font-bold">EN</span>
                              {ayah.translationEn}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Footer wisdom note */}
            <div className="border-t border-gray-50 mt-8 pt-4 flex items-center justify-between text-xs text-text-sec">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-main" />
                <span>API Alquran.cloud verified data</span>
              </span>
              <span>Prophetic Sira & Noble Sunnah</span>
            </div>
          </div>
        </div>

      </section>

      {/* AUDIO BAR (STICKY AT BOTTOM) */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 bg-ink border-t border-gold-main/20 text-white z-50 py-3.5 px-4 shadow-xl backdrop-blur-lg"
        >
          {audioNotice && (
            <div className="max-w-7xl mx-auto mb-2 text-center">
              <span className="inline-block px-3 py-1 bg-gold-main/20 text-gold-light border border-gold-main/30 rounded-full text-xs font-medium animate-pulse">
                {audioNotice}
              </span>
            </div>
          )}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Info Col */}
            <div className="md:col-span-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-main text-ink flex items-center justify-center text-sm font-bold font-serif uppercase">
                {selectedReciter.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gold-light tracking-wide truncate">
                  {selectedReciter.name}
                </p>
                <p className="text-xs font-serif font-semibold text-white truncate">
                  Sourate {selectedSurah.number}. {selectedSurah.englishName}
                  {audioMode === 'surah' ? ' • Mode Continu' : currentPlayingAyahIndex !== null && ` • Verset ${currentPlayingAyahIndex + 1}/${versesList.length}`}
                </p>
              </div>
            </div>

            {/* Central Controls */}
            <div className="md:col-span-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                
                {/* Prev Surah */}
                <button
                  onClick={handlePrevSurah}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  title="Précédent"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                {/* Main Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink flex items-center justify-center cursor-pointer shadow transition-transform hover:scale-105"
                  title={isPlaying ? t.pauseAudio : t.playAudio}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-ink" /> : <Play className="w-5 h-5 fill-ink pl-0.5" />}
                </button>

                {/* Stop */}
                <button
                  onClick={handleStop}
                  className="p-1.5 text-gray-400 hover:text-red-urge transition-colors"
                  title={t.stopAudio}
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>

                {/* Next Surah */}
                <button
                  onClick={handleNextSurah}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  title="Suivant"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>

              </div>

              {/* Custom Progress Bar Component with hover, drag and time feedback */}
              <AudioProgressBar
                currentTime={currentTime}
                duration={audioDuration}
                onChange={(value) => {
                  setCurrentTime(value);
                  if (audioRef.current) {
                    audioRef.current.currentTime = value;
                  }
                }}
                formatTime={formatTime}
              />
            </div>

            {/* Extra Controls */}
            <div className="md:col-span-3 flex items-center justify-end gap-3.5">
              
              {/* Loop trigger */}
              <button
                onClick={toggleLoop}
                className={`p-1.5 rounded text-xs px-2 py-0.5 font-bold transition-all flex items-center gap-1 ${
                  isLooping ? 'bg-gold-main text-ink' : 'text-gray-400 hover:text-white'
                }`}
                title="Répéter la sourate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[10px]">Loop</span>
              </button>

              {/* Speed trigger */}
              <button
                onClick={changeSpeed}
                className="p-1 text-xs text-gray-300 hover:text-gold-light font-bold"
                title="Vitesse de lecture"
              >
                Vitesse {playbackRate}x
              </button>

              {/* Mute and volume */}
              <div className="flex items-center gap-1.5">
                <button onClick={toggleMute} className="text-gray-400 hover:text-white">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : audioVolume}
                  onChange={handleVolumeChange}
                  className="w-14 accent-gold-main h-1 bg-white/20 rounded-lg"
                />
              </div>

            </div>

          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
