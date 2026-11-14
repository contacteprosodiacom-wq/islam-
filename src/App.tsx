import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, Route } from './types';
import { translations } from './data/translations';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PersistentQuranPlayer from './components/PersistentQuranPlayer';
import { QuranAudioProvider } from './lib/quran-audio-context';
import { checkPrayerNotifications, loadNotificationSettings } from './lib/prayer-notification-service';

// Pages
import Home from './pages/Home';
import Coran from './pages/Coran';
import Hadiths from './pages/Hadiths';
import Prayers from './pages/Prayers';
import Prophets from './pages/Prophets';
import Islam from './pages/Islam';
import Medias from './pages/Medias';
import Dons from './pages/Dons';
import Ebooks from './pages/Ebooks';
import Blog from './pages/Blog';
import Videos from './pages/Videos';
import Quiz from './pages/Quiz';
import Contact from './pages/Contact';
import About from './pages/About';
import Zakat from './pages/Zakat';
import Admin from './pages/Admin';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [navParams, setNavParams] = useState<any>(null);
  const [hasSubscribed, setHasSubscribed] = useState(false);

  // Synced hash navigation wrapper for browser backward/forward support
  useEffect(() => {
    const handleHashChange = () => {
      const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const hash = window.location.hash.substring(1);

      if (pathname === 'admin' || hash === 'admin' || hash.startsWith('admin?')) {
        setCurrentRoute('admin');
        return;
      }

      if (hash) {
        // Simple hash router query (e.g., #coran?reciterId=al-afasy)
        const [routeStr, paramStr] = hash.split('?');
        const r = routeStr as Route;
        
        // Validate route
        const validRoutes: Route[] = ['home', 'coran', 'hadiths', 'prayers', 'prophets', 'islam', 'medias', 'dons', 'zakat', 'ebooks', 'blog', 'videos', 'quiz', 'contact', 'about', 'admin'];
        if (validRoutes.includes(r)) {
          setCurrentRoute(r);
          
          if (paramStr) {
            const params: any = {};
            const urlParams = new URLSearchParams(paramStr);
            urlParams.forEach((value, key) => {
              params[key] = value;
            });
            setNavParams(params);
          } else {
            setNavParams(null);
          }
        }
      } else {
        setCurrentRoute('home');
        setNavParams(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check on load
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // RTL alignment side-effect when Arabic is enabled
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
    
    // Inject custom Google font dynamic styling
    if (currentLang === 'ar') {
      document.body.style.fontFamily = '"Amiri", "DM Sans", sans-serif';
    } else {
      document.body.style.fontFamily = '"DM Sans", "Inter", sans-serif';
    }
  }, [currentLang]);

  // Periodic background check for prayer notifications
  useEffect(() => {
    const runCheck = () => {
      const settings = loadNotificationSettings();
      if (settings && settings.enabled) {
        checkPrayerNotifications(settings, currentLang);
      }
    };

    runCheck();
    const interval = setInterval(runCheck, 30000);
    return () => clearInterval(interval);
  }, [currentLang]);

  const handleNavigate = (route: Route, params?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Build path parameters string
    let path = `#${route}`;
    if (params) {
      const search = new URLSearchParams(params).toString();
      path += `?${search}`;
    }
    
    // Set URL hash which triggers the listener above
    window.location.hash = path;
  };

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
  };

  const handleSubscribeNewsletter = (email: string) => {
    console.log("Subscribed email to newsletter:", email);
    setHasSubscribed(true);
    setTimeout(() => {
      setHasSubscribed(false);
    }, 7000);
  };

  const handleDonateSubmit = (amount: number) => {
    console.log(`Donation of ${amount}€ submitted for cleaner wells.`);
  };

  // Render correct page
  const renderPage = () => {
    switch (currentRoute) {
      case 'home':
        return (
          <Home
            lang={currentLang}
            onNavigate={handleNavigate}
            onSubscribeNewsletter={handleSubscribeNewsletter}
            hasSubscribed={hasSubscribed}
          />
        );
      case 'coran':
        return (
          <Coran
            lang={currentLang}
            preselectedReciterId={navParams?.reciterId}
            preselectedSurahNumber={navParams?.surahNumber}
          />
        );
      case 'hadiths':
        return <Hadiths lang={currentLang} />;
      case 'prayers':
        return <Prayers lang={currentLang} />;
      case 'prophets':
        return <Prophets lang={currentLang} />;
      case 'islam':
        return <Islam lang={currentLang} />;
      case 'medias':
        return <Medias lang={currentLang} />;
      case 'dons':
        return (
          <Dons
            lang={currentLang}
            onDonateSubmit={handleDonateSubmit}
            resumeOrderId={navParams?.saspay_order || null}
          />
        );
      case 'ebooks':
        return (
          <Ebooks
            lang={currentLang}
            resumeOrderId={navParams?.saspay_order || null}
          />
        );
      case 'blog':
        return (
          <Blog
            lang={currentLang}
            preselectedArticleId={navParams?.articleId}
          />
        );
      case 'videos':
        return <Videos lang={currentLang} />;
      case 'quiz':
        return (
          <Quiz
            lang={currentLang}
            preselectedQuizId={navParams?.quizId}
          />
        );
      case 'contact':
        return <Contact lang={currentLang} />;
      case 'about':
        return <About lang={currentLang} />;
      case 'zakat':
        return <Zakat lang={currentLang} onNavigate={handleNavigate} />;
      default:
        return (
          <Home
            lang={currentLang}
            onNavigate={handleNavigate}
            onSubscribeNewsletter={handleSubscribeNewsletter}
            hasSubscribed={hasSubscribed}
          />
        );
    }
  };

  if (currentRoute === 'admin') {
    return <Admin lang={currentLang} />;
  }

  return (
    <QuranAudioProvider>
      <div className="min-h-screen flex flex-col justify-between">
        <div>
          {/* Multilingual standard Navbar */}
          <Navbar
            lang={currentLang}
            onLangChange={handleLangChange}
            currentRoute={currentRoute}
            onNavigate={(r) => handleNavigate(r)}
          />

          {/* Animated Page Main viewport */}
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRoute + '-' + currentLang}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Multilingual standard Footer */}
        <Footer
          lang={currentLang}
          onNavigate={(r) => handleNavigate(r)}
        />

        {/* Persistent bottom audio player for the Quran */}
        <PersistentQuranPlayer
          lang={currentLang}
          onNavigate={handleNavigate}
        />
      </div>
    </QuranAudioProvider>
  );
}
