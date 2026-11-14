import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Surah, Reciter, Language } from '../types';
import { all114Surahs } from '../data/all-114-surahs';
import { reciters as defaultReciters } from '../data/reciters';
import { useContentStore } from './content-store';

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

export interface FavoriteAyah {
  surahNumber: number;
  ayahNumber: number;
  surahName?: string;
  text?: string;
  translationFr?: string;
  translationEn?: string;
  addedAt?: number;
}

export interface ListeningHistoryItem {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  frenchName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  reciterId: string;
  reciterName: string;
  reciterLocalName?: string;
  timestamp: number;
}

export interface QuranAudioContextType {
  // Current playback track info
  currentSurah: Surah;
  currentReciter: Reciter;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  playbackRate: number;
  isPlayerVisible: boolean;
  isMinimized: boolean;
  audioNotice: string | null;

  // Favorites (persisted via localStorage)
  favoriteSurahs: number[];
  favoriteAyahs: FavoriteAyah[];
  toggleFavoriteSurah: (surahNumber: number) => void;
  isFavoriteSurah: (surahNumber: number) => boolean;
  toggleFavoriteAyah: (ayah: {
    surahNumber: number;
    ayahNumber: number;
    surahName?: string;
    text?: string;
    translationFr?: string;
    translationEn?: string;
  }) => void;
  isFavoriteAyah: (surahNumber: number, ayahNumber: number) => boolean;
  clearAllFavorites: () => void;

  // Listening History (persisted via localStorage)
  listeningHistory: ListeningHistoryItem[];
  addToHistory: (surah: Surah, reciter?: Reciter) => void;
  clearHistory: () => void;
  removeFromHistory: (surahNumber: number) => void;

  // Controls
  playSurah: (surah: Surah, reciter?: Reciter) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextSurah: () => void;
  prevSurah: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  setPlaybackRate: (rate: number) => void;
  setReciter: (reciter: Reciter) => void;
  closePlayer: () => void;
  toggleMinimize: () => void;
  openPlayer: () => void;
  formatTime: (secs: number) => string;
}

const QuranAudioContext = createContext<QuranAudioContextType | undefined>(undefined);

export const QuranAudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { reciters, surahAudios } = useContentStore();

  const [currentSurah, setCurrentSurah] = useState<Surah>(all114Surahs[0]); // Al-Fatihah
  const [currentReciter, setCurrentReciter] = useState<Reciter>(() => {
    return reciters.find(r => r.id === 'ali-djabir') || defaultReciters[0];
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  // Favorites persisted via localStorage
  const STORAGE_KEY_SURAHS = 'quran_favorite_surahs_v1';
  const STORAGE_KEY_AYAHS = 'quran_favorite_ayahs_v1';

  const [favoriteSurahs, setFavoriteSurahs] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SURAHS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse favorite surahs from localStorage:', e);
    }
    return [1, 36, 67, 112]; // Default beloved Surahs (Al-Fatihah, Ya-Sin, Al-Mulk, Al-Ikhlas)
  });

  const [favoriteAyahs, setFavoriteAyahs] = useState<FavoriteAyah[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AYAHS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse favorite ayahs from localStorage:', e);
    }
    return [
      {
        surahNumber: 2,
        ayahNumber: 255,
        surahName: 'Al-Baqarah',
        text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
        translationFr: 'Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même "al-Qayyum".',
        translationEn: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence.'
      }
    ];
  });

  // Persist favorite changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SURAHS, JSON.stringify(favoriteSurahs));
    } catch (e) {
      console.warn('Failed to save favorite surahs to localStorage:', e);
    }
  }, [favoriteSurahs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AYAHS, JSON.stringify(favoriteAyahs));
    } catch (e) {
      console.warn('Failed to save favorite ayahs to localStorage:', e);
    }
  }, [favoriteAyahs]);

  const toggleFavoriteSurah = useCallback((surahNumber: number) => {
    setFavoriteSurahs(prev => {
      if (prev.includes(surahNumber)) {
        return prev.filter(n => n !== surahNumber);
      } else {
        return [...prev, surahNumber];
      }
    });
  }, []);

  const isFavoriteSurah = useCallback((surahNumber: number) => {
    return favoriteSurahs.includes(surahNumber);
  }, [favoriteSurahs]);

  const toggleFavoriteAyah = useCallback((ayah: {
    surahNumber: number;
    ayahNumber: number;
    surahName?: string;
    text?: string;
    translationFr?: string;
    translationEn?: string;
  }) => {
    setFavoriteAyahs(prev => {
      const exists = prev.some(
        a => a.surahNumber === ayah.surahNumber && a.ayahNumber === ayah.ayahNumber
      );
      if (exists) {
        return prev.filter(
          a => !(a.surahNumber === ayah.surahNumber && a.ayahNumber === ayah.ayahNumber)
        );
      } else {
        return [
          ...prev,
          {
            ...ayah,
            addedAt: Date.now()
          }
        ];
      }
    });
  }, []);

  const isFavoriteAyah = useCallback((surahNumber: number, ayahNumber: number) => {
    return favoriteAyahs.some(
      a => a.surahNumber === surahNumber && a.ayahNumber === ayahNumber
    );
  }, [favoriteAyahs]);

  const clearAllFavorites = useCallback(() => {
    setFavoriteSurahs([]);
    setFavoriteAyahs([]);
  }, []);

  // Listening History persisted via localStorage
  const STORAGE_KEY_HISTORY = 'quran_listening_history_v1';

  const defaultListeningHistory: ListeningHistoryItem[] = [
    {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      surahNameArabic: 'الفاتحة',
      frenchName: "L'Ouverture",
      numberOfAyahs: 7,
      revelationType: 'Meccan',
      reciterId: 'ali-djabir',
      reciterName: 'Cheikh Ali Djabir',
      reciterLocalName: 'علي جابر',
      timestamp: Date.now() - 1000 * 60 * 15,
    },
    {
      surahNumber: 36,
      surahName: 'Ya-Sin',
      surahNameArabic: 'يس',
      frenchName: 'Ya-Sin',
      numberOfAyahs: 83,
      revelationType: 'Meccan',
      reciterId: 'al-afasy',
      reciterName: 'Mishary Rashid Al-Afasy',
      reciterLocalName: 'مشاري راشد العفاسي',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
      surahNumber: 67,
      surahName: 'Al-Mulk',
      surahNameArabic: 'الملك',
      frenchName: 'La Royauté',
      numberOfAyahs: 30,
      revelationType: 'Meccan',
      reciterId: 'al-ghamdi',
      reciterName: 'Saad Al-Ghamdi',
      reciterLocalName: 'سعد الغامدي',
      timestamp: Date.now() - 1000 * 60 * 60 * 8,
    },
    {
      surahNumber: 18,
      surahName: 'Al-Kahf',
      surahNameArabic: 'الكهف',
      frenchName: 'La Caverne',
      numberOfAyahs: 110,
      revelationType: 'Meccan',
      reciterId: 'al-muaiqly',
      reciterName: 'Maher Al-Muaiqly',
      reciterLocalName: 'ماهر المعيقلي',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      surahNumber: 55,
      surahName: 'Ar-Rahman',
      surahNameArabic: 'الرحمن',
      frenchName: 'Le Tout Miséricordieux',
      numberOfAyahs: 78,
      revelationType: 'Medinan',
      reciterId: 'al-sudais',
      reciterName: 'Abdur-Rahman As-Sudais',
      reciterLocalName: 'عبد الرحمن السديس',
      timestamp: Date.now() - 1000 * 60 * 60 * 36,
    }
  ];

  const [listeningHistory, setListeningHistory] = useState<ListeningHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse listening history from localStorage:', e);
    }
    return defaultListeningHistory;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(listeningHistory));
    } catch (e) {
      console.warn('Failed to save listening history to localStorage:', e);
    }
  }, [listeningHistory]);

  const addToHistory = useCallback((surah: Surah, reciter?: Reciter) => {
    const targetReciter = reciter || currentReciter;
    setListeningHistory(prev => {
      const filtered = prev.filter(item => item.surahNumber !== surah.number);
      const newItem: ListeningHistoryItem = {
        surahNumber: surah.number,
        surahName: surah.englishName,
        surahNameArabic: surah.name,
        frenchName: surah.frenchName || surah.englishName,
        numberOfAyahs: surah.numberOfAyahs,
        revelationType: surah.revelationType,
        reciterId: targetReciter.id,
        reciterName: targetReciter.name,
        reciterLocalName: targetReciter.localName,
        timestamp: Date.now()
      };
      return [newItem, ...filtered].slice(0, 20);
    });
  }, [currentReciter]);

  const clearHistory = useCallback(() => {
    setListeningHistory([]);
  }, []);

  const removeFromHistory = useCallback((surahNumber: number) => {
    setListeningHistory(prev => prev.filter(item => item.surahNumber !== surahNumber));
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioErrorCountRef = useRef(0);
  const lastErrorTimestampRef = useRef(0);

  // Helper format time mm:ss
  const formatTime = useCallback((seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${formattedMins}:${formattedSecs}`;
  }, []);

  // Compute Audio URL for Surah
  const computeAudioUrl = useCallback((surahNum: number, reciterId: string) => {
    let customUrl = surahAudios[reciterId]?.[surahNum];
    if (customUrl && typeof customUrl === 'string') {
      customUrl = customUrl
        .replace('server11.mp3quran.net/a_jabr', 'server11.mp3quran.net/a_jbr')
        .replace('server11.mp3quran.net/minsh', 'server10.mp3quran.net/minsh')
        .replace('server7.mp3quran.net/ghamdi', 'server7.mp3quran.net/s_gmd');
      return customUrl.replace(/^http:/i, 'https:');
    }
    const server = mp3QuranServers[reciterId] || 'https://server11.mp3quran.net/a_jbr';
    const paddedNumber = String(surahNum).padStart(3, '0');
    return `${server}/${paddedNumber}.mp3`.replace(/^http:/i, 'https:');
  }, [surahAudios]);

  // Audio element initialization (single persistent instance)
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onDurationChange = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onEnded = () => {
      if (audio.loop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      // Auto-play next Surah
      nextSurahInternal();
    };

    const onError = () => {
      setIsLoading(false);
      handleAudioError();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Handle errors with server fallbacks
  const handleAudioError = () => {
    if (!audioRef.current) return;
    const now = Date.now();
    if (now - lastErrorTimestampRef.current < 600) return;
    lastErrorTimestampRef.current = now;

    const paddedNumber = String(currentSurah.number).padStart(3, '0');
    const backups = backupSurahServers[currentReciter.id] || [];
    const count = audioErrorCountRef.current;

    if (count < backups.length) {
      const backupBase = backups[count];
      const fallbackUrl = backupBase.includes('islamic.network')
        ? `${backupBase}/${currentSurah.number}.mp3`
        : `${backupBase}/${paddedNumber}.mp3`;

      audioErrorCountRef.current += 1;
      setAudioNotice('Connexion au serveur audio alternatif...');
      setTimeout(() => setAudioNotice(null), 3000);

      audioRef.current.src = fallbackUrl;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    } else if (count === backups.length && currentReciter.id !== 'al-afasy') {
      const universalFallback = `https://server8.mp3quran.net/afs/${paddedNumber}.mp3`;
      audioErrorCountRef.current += 1;
      setAudioNotice('Bascule vers le flux audio haute disponibilité...');
      setTimeout(() => setAudioNotice(null), 3500);

      audioRef.current.src = universalFallback;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    } else {
      setIsPlaying(false);
      audioErrorCountRef.current = 0;
      setAudioNotice('Impossible de lire cet enregistrement. Réessayez ou choisissez un autre récitateur.');
      setTimeout(() => setAudioNotice(null), 5000);
    }
  };

  // Play a specific Surah
  const playSurah = (surah: Surah, reciter?: Reciter) => {
    const targetReciter = reciter || currentReciter;
    setCurrentSurah(surah);
    if (reciter) setCurrentReciter(reciter);

    // Persist to listening history
    addToHistory(surah, targetReciter);

    setIsPlayerVisible(true);
    setIsMinimized(false);
    setIsLoading(true);
    audioErrorCountRef.current = 0;

    const url = computeAudioUrl(surah.number, targetReciter.id);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
      audioRef.current.loop = isLooping;
      audioRef.current.load();

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            if (err.name === 'NotAllowedError') {
              setIsPlaying(false);
              setAudioNotice('Cliquez sur Lecture pour lancer la récitation.');
              setTimeout(() => setAudioNotice(null), 3500);
            } else if (err.name !== 'AbortError') {
              handleAudioError();
            }
          });
      }
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlayerVisible(true);
      if (!audioRef.current.src) {
        playSurah(currentSurah, currentReciter);
      } else {
        const promise = audioRef.current.play();
        if (promise !== undefined) {
          promise
            .then(() => setIsPlaying(true))
            .catch(() => handleAudioError());
        }
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const nextSurahInternal = () => {
    const nextIndex = currentSurah.number < 114 ? currentSurah.number : 0;
    const next = all114Surahs[nextIndex];
    if (next) {
      playSurah(next, currentReciter);
    }
  };

  const nextSurah = () => {
    nextSurahInternal();
  };

  const prevSurah = () => {
    const prevIndex = currentSurah.number > 1 ? currentSurah.number - 2 : 113;
    const prev = all114Surahs[prevIndex];
    if (prev) {
      playSurah(prev, currentReciter);
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      if (clamped > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const next = !isMuted;
      setIsMuted(next);
      audioRef.current.muted = next;
    }
  };

  const toggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) {
      audioRef.current.loop = next;
    }
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const setReciter = (reciter: Reciter) => {
    setCurrentReciter(reciter);
    if (isPlaying || isPlayerVisible) {
      playSurah(currentSurah, reciter);
    }
  };

  const closePlayer = () => {
    pause();
    setIsPlayerVisible(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  const openPlayer = () => {
    setIsPlayerVisible(true);
    setIsMinimized(false);
  };

  return (
    <QuranAudioContext.Provider
      value={{
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
        favoriteSurahs,
        favoriteAyahs,
        toggleFavoriteSurah,
        isFavoriteSurah,
        toggleFavoriteAyah,
        isFavoriteAyah,
        clearAllFavorites,

        // Listening History
        listeningHistory,
        addToHistory,
        clearHistory,
        removeFromHistory,

        playSurah,
        togglePlay,
        pause,
        resume,
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
        openPlayer,
        formatTime
      }}
    >
      {children}
    </QuranAudioContext.Provider>
  );
};

export const useQuranAudio = () => {
  const context = useContext(QuranAudioContext);
  if (!context) {
    throw new Error('useQuranAudio must be used within a QuranAudioProvider');
  }
  return context;
};
