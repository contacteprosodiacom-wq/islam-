export type Language = 'fr' | 'en' | 'ar';

export type Route = 'home' | 'coran' | 'hadiths' | 'prayers' | 'prophets' | 'islam' | 'medias' | 'dons' | 'ebooks' | 'blog' | 'videos' | 'quiz' | 'contact' | 'about' | 'admin';

export interface Donor {
  id: string;
  name: string;
  email: string;
  amount: number;
  date: string;
  project: string;
}

export interface Reciter {
  id: string;
  name: string;
  localName: string;
  style: string;
  origin: string;
  initials: string;
  apiCode: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  frenchName: string;
}

export interface Article {
  id: string;
  category: {
    fr: string;
    en: string;
    ar: string;
  };
  title: {
    fr: string;
    en: string;
    ar: string;
  };
  excerpt: {
    fr: string;
    en: string;
    ar: string;
  };
  content: {
    fr: string;
    en: string;
    ar: string;
  };
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export interface Ebook {
  id: string;
  title: {
    fr: string;
    en: string;
    ar: string;
  };
  description: {
    fr: string;
    en: string;
    ar: string;
  };
  author: string;
  isFree: boolean;
  price?: number;
  badge: {
    fr: string;
    en: string;
    ar: string;
  };
  category: 'coran' | 'fiqh' | 'histoire' | 'spiritualite';
}

export interface Video {
  id: string;
  youtubeId: string;
  title: {
    fr: string;
    en: string;
    ar: string;
  };
  duration: string;
  category: 'geopolitique' | 'education' | 'histoires' | 'analyse' | 'ramadan';
  date: string;
}

export interface QuizQuestion {
  id: number;
  question: {
    fr: string;
    en: string;
    ar: string;
  };
  options: {
    fr: string[];
    en: string[];
    ar: string[];
  };
  correctAnswerIndex: number;
  explanation: {
    fr: string;
    en: string;
    ar: string;
  };
}

export interface Quiz {
  id: string;
  title: {
    fr: string;
    en: string;
    ar: string;
  };
  description: {
    fr: string;
    en: string;
    ar: string;
  };
  difficulty: 'debutant' | 'intermediaire' | 'avance';
  category: 'coran' | 'prophetes' | 'piliers' | 'hadiths' | 'histoire';
  questionsCount: number;
  questions: QuizQuestion[];
}

export interface DonationCampagne {
  collected: number;
  target: number;
  donorsCount: number;
  lastUpdate: string;
}
