import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ebook, Article, Video, Reciter, Quiz, Donor, DonationCampagne } from '../types';
import { ebooks as initialEbooks } from '../data/ebooks';
import { blogArticles as initialArticles } from '../data/blog';
import { videos as initialVideos } from '../data/videos';
import { reciters as initialReciters } from '../data/reciters';
import { quizzes as initialQuizzes } from '../data/quiz';

// Default mock donors for the donor export and campaign stats
const initialDonors: Donor[] = [
  { id: 'd1', name: 'Myriem B.', email: 'myriem.b@example.com', amount: 20, date: '2026-06-28', project: 'Puits Mali #3' },
  { id: 'd2', name: 'Youssef K.', email: 'youssef.k@example.com', amount: 50, date: '2026-06-27', project: 'Puits Mali #3' },
  { id: 'd3', name: 'Sarah J.', email: 'sarah.j@example.com', amount: 100, date: '2026-06-25', project: 'Sadaqa Jariya' },
  { id: 'd4', name: 'Ibrahim D.', email: 'ibrahim.d@example.com', amount: 200, date: '2026-06-24', project: 'Puits Niger #1' },
  { id: 'd5', name: 'Amina S.', email: 'amina.s@example.com', amount: 30, date: '2026-06-22', project: 'Sadaqa Jariya' },
  { id: 'd6', name: 'Bilal M.', email: 'bilal.m@example.com', amount: 15, date: '2026-06-20', project: 'Puits Mali #3' },
];

const defaultCampaign: DonationCampagne = {
  collected: 1440,
  target: 2000,
  donorsCount: 72,
  lastUpdate: '2026-06-29'
};

// Map of custom MP3/YouTube audios: reciterId -> surahNumber -> url
type SurahAudios = Record<string, Record<number, string>>;

const defaultMp3QuranServers: Record<string, string> = {
  'ali-djabir': 'https://server11.mp3quran.net/a_jbr',
  'al-afasy': 'https://server8.mp3quran.net/afs',
  'al-sudais': 'https://server11.mp3quran.net/sds',
  'al-husary': 'https://server13.mp3quran.net/husr',
  'al-minshawi': 'https://server10.mp3quran.net/minsh',
  'al-ghamdi': 'https://server7.mp3quran.net/s_gmd',
  'al-muaiqly': 'https://server12.mp3quran.net/maher'
};

const getInitialSurahAudios = (): SurahAudios => {
  const initial: SurahAudios = {};
  
  Object.entries(defaultMp3QuranServers).forEach(([reciterId, serverUrl]) => {
    initial[reciterId] = {};
    for (let i = 1; i <= 114; i++) {
      const padded = String(i).padStart(3, '0');
      initial[reciterId][i] = `${serverUrl}/${padded}.mp3`;
    }
  });
  
  return initial;
};

interface ContentContextType {
  ebooks: Ebook[];
  articles: Article[];
  videos: Video[];
  reciters: Reciter[];
  quizzes: Quiz[];
  donors: Donor[];
  donsCampaign: DonationCampagne;
  surahAudios: SurahAudios;
  
  // Ebooks actions
  addEbook: (ebook: Ebook) => void;
  updateEbook: (id: string, ebook: Ebook) => void;
  deleteEbook: (id: string) => void;
  
  // Articles actions
  addArticle: (article: Article) => void;
  updateArticle: (id: string, article: Article) => void;
  deleteArticle: (id: string) => void;
  
  // Videos actions
  addVideo: (video: Video) => void;
  updateVideo: (id: string, video: Video) => void;
  deleteVideo: (id: string) => void;
  
  // Reciters actions
  addReciter: (reciter: Reciter) => void;
  updateReciter: (id: string, reciter: Reciter) => void;
  deleteReciter: (id: string) => void;
  
  // Quiz actions
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (id: string, quiz: Quiz) => void;
  deleteQuiz: (id: string) => void;
  
  // Donation actions
  addDonor: (name: string, email: string, amount: number, project: string) => void;
  updateDonsCampaignTarget: (target: number) => void;
  
  // Quran Audios actions
  setSurahAudio: (reciterId: string, surahNumber: number, url: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  // Load initial states from localStorage or use files defaults
  const [ebooks, setEbooks] = useState<Ebook[]>(() => {
    const saved = localStorage.getItem('islam_aboubakar_ebooks');
    return saved ? JSON.parse(saved) : initialEbooks;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('islam_aboubakar_articles');
    return saved ? JSON.parse(saved) : initialArticles;
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('islam_aboubakar_videos');
    return saved ? JSON.parse(saved) : initialVideos;
  });

  const [reciters, setReciters] = useState<Reciter[]>(() => {
    const saved = localStorage.getItem('islam_aboubakar_reciters');
    if (!saved) return initialReciters;
    try {
      const parsed = JSON.parse(saved) as Reciter[];
      const merged = [...initialReciters];
      parsed.forEach(p => {
        if (!merged.some(m => m.id === p.id)) {
          merged.push(p);
        }
      });
      return merged;
    } catch {
      return initialReciters;
    }
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('islam_aboubakar_quizzes');
    return saved ? JSON.parse(saved) : initialQuizzes;
  });

  const [donors, setDonors] = useState<Donor[]>(() => {
    const saved = localStorage.getItem('islam_aboubakar_donors');
    return saved ? JSON.parse(saved) : initialDonors;
  });

  const [donsCampaign, setDonsCampaign] = useState<DonationCampagne>(() => {
    const saved = localStorage.getItem('islam_aboubakar_dons_campaign');
    return saved ? JSON.parse(saved) : defaultCampaign;
  });

  const [surahAudios, setSurahAudios] = useState<SurahAudios>(() => {
    const defaults = getInitialSurahAudios();
    const saved = localStorage.getItem('islam_aboubakar_surah_audios');
    if (!saved) return defaults;
    try {
      const parsed = JSON.parse(saved) as SurahAudios;
      const merged = { ...defaults };
      Object.keys(parsed).forEach(reciterId => {
        if (!merged[reciterId]) {
          merged[reciterId] = {};
        }
        Object.keys(parsed[reciterId]).forEach(sNumStr => {
          const sNum = parseInt(sNumStr);
          let rawUrl = parsed[reciterId][sNum];
          if (rawUrl && typeof rawUrl === 'string') {
            rawUrl = rawUrl
              .replace('server11.mp3quran.net/a_jabr', 'server11.mp3quran.net/a_jbr')
              .replace('server11.mp3quran.net/minsh', 'server10.mp3quran.net/minsh')
              .replace('server7.mp3quran.net/ghamdi', 'server7.mp3quran.net/s_gmd');
            merged[reciterId][sNum] = rawUrl;
          }
        });
      });
      return merged;
    } catch {
      return defaults;
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('islam_aboubakar_ebooks', JSON.stringify(ebooks));
  }, [ebooks]);

  useEffect(() => {
    localStorage.setItem('islam_aboubakar_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('islam_aboubakar_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('islam_aboubakar_reciters', JSON.stringify(reciters));
  }, [reciters]);

  useEffect(() => {
    localStorage.setItem('islam_aboubakar_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('islam_aboubakar_donors', JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    localStorage.setItem('islam_aboubakar_dons_campaign', JSON.stringify(donsCampaign));
  }, [donsCampaign]);

  useEffect(() => {
    localStorage.setItem('islam_aboubakar_surah_audios', JSON.stringify(surahAudios));
  }, [surahAudios]);

  // CRUD Implementations
  const addEbook = (ebook: Ebook) => {
    setEbooks(prev => [ebook, ...prev]);
  };
  const updateEbook = (id: string, updated: Ebook) => {
    setEbooks(prev => prev.map(item => item.id === id ? updated : item));
  };
  const deleteEbook = (id: string) => {
    setEbooks(prev => prev.filter(item => item.id !== id));
  };

  const addArticle = (article: Article) => {
    setArticles(prev => [article, ...prev]);
  };
  const updateArticle = (id: string, updated: Article) => {
    setArticles(prev => prev.map(item => item.id === id ? updated : item));
  };
  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(item => item.id !== id));
  };

  const addVideo = (video: Video) => {
    setVideos(prev => [video, ...prev]);
  };
  const updateVideo = (id: string, updated: Video) => {
    setVideos(prev => prev.map(item => item.id === id ? updated : item));
  };
  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(item => item.id !== id));
  };

  const addReciter = (reciter: Reciter) => {
    setReciters(prev => [...prev, reciter]);
  };
  const updateReciter = (id: string, updated: Reciter) => {
    setReciters(prev => prev.map(item => item.id === id ? updated : item));
  };
  const deleteReciter = (id: string) => {
    setReciters(prev => prev.filter(item => item.id !== id));
  };

  const addQuiz = (quiz: Quiz) => {
    setQuizzes(prev => [quiz, ...prev]);
  };
  const updateQuiz = (id: string, updated: Quiz) => {
    setQuizzes(prev => prev.map(item => item.id === id ? updated : item));
  };
  const deleteQuiz = (id: string) => {
    setQuizzes(prev => prev.filter(item => item.id !== id));
  };

  const addDonor = (name: string, email: string, amount: number, project: string) => {
    const newDonor: Donor = {
      id: 'd-' + Date.now(),
      name,
      email,
      amount,
      date: new Date().toISOString().split('T')[0],
      project
    };
    setDonors(prev => [newDonor, ...prev]);
    setDonsCampaign(prev => ({
      ...prev,
      collected: prev.collected + amount,
      donorsCount: prev.donorsCount + 1,
      lastUpdate: new Date().toISOString().split('T')[0]
    }));
  };

  const updateDonsCampaignTarget = (target: number) => {
    setDonsCampaign(prev => ({ ...prev, target }));
  };

  const setSurahAudio = (reciterId: string, surahNumber: number, url: string) => {
    setSurahAudios(prev => {
      const reciterMap = prev[reciterId] || {};
      return {
        ...prev,
        [reciterId]: {
          ...reciterMap,
          [surahNumber]: url
        }
      };
    });
  };

  return (
    <ContentContext.Provider value={{
      ebooks,
      articles,
      videos,
      reciters,
      quizzes,
      donors,
      donsCampaign,
      surahAudios,
      
      addEbook,
      updateEbook,
      deleteEbook,
      addArticle,
      updateArticle,
      deleteArticle,
      addVideo,
      updateVideo,
      deleteVideo,
      addReciter,
      updateReciter,
      deleteReciter,
      addQuiz,
      updateQuiz,
      deleteQuiz,
      addDonor,
      updateDonsCampaignTarget,
      setSurahAudio
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContentStore() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContentStore must be used within a ContentProvider');
  }
  return context;
}
