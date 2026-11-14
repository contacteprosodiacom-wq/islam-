import { motion } from 'motion/react';
import { BookOpen, Heart, Play, HelpCircle, FileText, Music, ArrowRight, Video, Mail, Sparkles, CheckCircle2, Calculator } from 'lucide-react';
import { Language, Route, Reciter } from '../types';
import { translations } from '../data/translations';
import { useContentStore } from '../lib/content-store';
import { useState, FormEvent } from 'react';
import HijriCalendarWidget from '../components/HijriCalendarWidget';
import IslamicGlossarySearch from '../components/IslamicGlossarySearch';
import ResumeListeningSection from '../components/ResumeListeningSection';
import { useQuranAudio } from '../lib/quran-audio-context';
import { all114Surahs } from '../data/all-114-surahs';

interface HomeProps {
  lang: Language;
  onNavigate: (route: Route, params?: any) => void;
  onSubscribeNewsletter: (email: string) => void;
  hasSubscribed: boolean;
}

export default function Home({ lang, onNavigate, onSubscribeNewsletter, hasSubscribed }: HomeProps) {
  const { articles: blogArticles, quizzes, reciters, donors } = useContentStore();
  const { playSurah, currentReciter, isPlaying, togglePlay } = useQuranAudio();
  const t = translations[lang];
  const [newsEmail, setNewsEmail] = useState('');

  const stats = [
    { value: "120K+", label: t.statSubscribers },
    { value: "350+", label: t.statVideos },
    { value: "3", label: t.statLanguages },
    { value: "720+", label: t.statDonors }
  ];

  const features = [
    {
      id: 'coran' as Route,
      icon: <Music className="w-6 h-6 text-emerald-light" />,
      title: t.featQuranTitle,
      desc: t.featQuranDesc,
    },
    {
      id: 'blog' as Route,
      icon: <FileText className="w-6 h-6 text-gold-main" />,
      title: t.featBlogTitle,
      desc: t.featBlogDesc,
    },
    {
      id: 'ebooks' as Route,
      icon: <BookOpen className="w-6 h-6 text-emerald-light" />,
      title: t.featEbooksTitle,
      desc: t.featEbooksDesc,
    },
    {
      id: 'dons' as Route,
      icon: <Heart className="w-6 h-6 text-red-urge" />,
      title: t.featDonsTitle,
      desc: t.featDonsDesc,
    },
    {
      id: 'zakat' as Route,
      icon: <Calculator className="w-6 h-6 text-gold-main" />,
      title: lang === 'ar' ? '⚖️ حاسبة زكاة المال' : lang === 'en' ? '⚖️ Zakat Calculator' : '⚖️ Calculateur de Zakat',
      desc: lang === 'ar' ? 'احسب زكاة أموالك ومدخراتك بدقة وسهولة وفق نصاب الذهب والفضة والضوابط الشرعية.' : lang === 'en' ? 'Calculate your annual Zakat with exact Nisab thresholds, asset-debt balance, and fiqh rules.' : 'Estimez et calculez votre Zakat annuelle selon le seuil du Nissab et les règles islamiques.',
    },
    {
      id: 'quiz' as Route,
      icon: <HelpCircle className="w-6 h-6 text-gold-main" />,
      title: t.featQuizTitle,
      desc: t.featQuizDesc,
    },
    {
      id: 'videos' as Route,
      icon: <Video className="w-6 h-6 text-emerald-light" />,
      title: t.featVideosTitle,
      desc: t.featVideosDesc,
    },
  ];

  const handleSubmitNews = (e: FormEvent) => {
    e.preventDefault();
    if (newsEmail.trim()) {
      onSubscribeNewsletter(newsEmail);
      setNewsEmail('');
    }
  };

  const isAr = lang === 'ar';

  return (
    <div className={`islamic-pattern min-h-screen pb-16 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {/* SECTION HERO */}
      <section className="relative overflow-hidden bg-ink py-20 lg:py-28 text-white">
        {/* Subtle geometric pattern / ghost texts */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.06)_1px,transparent_0)] bg-[size:32px_32px]"></div>
        <div className="absolute right-10 bottom-6 select-none opacity-2 text-gold-main font-amiri text-9xl">
          الله
        </div>
        <div className="absolute left-12 top-10 select-none opacity-2 text-gold-main font-amiri text-8xl">
          القرآن
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Bismillah */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-amiri text-gold-main text-2xl sm:text-3xl lg:text-4xl tracking-wide mb-6 select-none"
              dir="rtl"
            >
              {t.bismillah}
            </motion.p>

            {/* H1 Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-white mb-6"
            >
              {t.heroTitle}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg text-gray-400 font-sans leading-relaxed mb-8 max-w-2xl mx-auto"
            >
              {t.heroSubtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <button
                onClick={() => onNavigate('videos')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                {t.heroCtaVideos}
              </button>
              <button
                onClick={() => onNavigate('coran')}
                className="w-full sm:w-auto px-8 py-3.5 border border-gold-main hover:bg-gold-main/10 text-gold-main font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Music className="w-4 h-4" />
                {t.heroCtaQuran}
              </button>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-emerald-main/20 border border-gold-main/20 p-6 rounded-2xl backdrop-blur-sm shadow-xl"
            >
              {stats.map((st, i) => (
                <div key={i} className="text-center p-2">
                  <p className="text-2xl sm:text-3xl font-serif font-bold text-gold-main mb-1">
                    {st.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-300 font-sans">
                    {st.label}
                  </p>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* SECTION RECHERCHE GLOSSAIRE ISLAMIQUE RAPIDE */}
      <div className="-mt-8 sm:-mt-10 relative z-20">
        <IslamicGlossarySearch lang={lang} />
      </div>

      {/* SECTION CALENDRIER HIJRI DYNAMIQUE */}
      <HijriCalendarWidget lang={lang} onNavigate={onNavigate} />

      {/* SECTION REPRENDRE VOTRE ÉCOUTE (5 DERNIÈRES SOURATES) */}
      <ResumeListeningSection lang={lang} onNavigate={onNavigate} />

      {/* SECTION FEATURES */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-gold-dark text-xs sm:text-sm font-sans font-semibold tracking-widest uppercase bg-gold-main/10 px-3 py-1 rounded-full inline-block mb-3">
            ✨ {t.featuresTag}
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-ink">
            {t.featuresTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => onNavigate(item.id)}
              className="bg-white border border-gray-100 hover:border-gold-main/40 hover:shadow-lg p-6 rounded-2xl cursor-pointer transition-all relative group flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gold-main scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-t-2xl"></div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-cream-main flex items-center justify-center mb-4 group-hover:bg-gold-main/10 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-lg font-serif font-bold text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-sec leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
              <div className={`mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-med group-hover:text-gold-dark transition-colors ${isAr ? 'flex-row-reverse' : ''}`}>
                <span>{lang === 'fr' ? 'Accéder' : lang === 'en' ? 'Open' : 'دخول'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION CORAN PREVIEW */}
      <section className="bg-emerald-main text-white py-16 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,201,122,0.06)_1px,transparent_0)] bg-[size:40px_40px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Quran Left text and Arabic verset */}
            <div className={`lg:col-span-5 space-y-6 ${isAr ? 'lg:order-2' : ''}`}>
              <span className="text-gold-light text-xs font-semibold tracking-widest uppercase">
                📖 AL-QURAN AL-KAREEM
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-white tracking-tight leading-snug">
                {t.coranSectionTitle}
              </h2>
              
              {/* Display Beautiful Arab verse */}
              <div className="bg-ink/30 border-l-2 border-gold-main px-4 py-3 rounded-r-xl my-4 text-right" dir="rtl">
                <p className="font-amiri text-xl sm:text-2xl leading-relaxed text-gold-light">
                  إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
                </p>
                <p className="text-xs text-slate-300 font-sans mt-2">
                  — سورة الإسراء، آية 9
                </p>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {t.coranSectionSubtitle}
              </p>
              <div>
                <button
                  onClick={() => onNavigate('coran')}
                  className="px-6 py-3 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-semibold rounded-xl text-sm transition-all"
                >
                  {t.coranViewAll}
                </button>
              </div>
            </div>

            {/* Reciters list card layout right */}
            <div className={`lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 ${isAr ? 'lg:order-1' : ''}`}>
              <div className="col-span-1 sm:col-span-2 mb-2">
                <p className="text-gold-light text-sm font-semibold tracking-wider font-sans">
                  {t.recitersLabel} :
                </p>
              </div>
              {reciters.slice(0, 4).map((reciter) => {
                const isThisReciterPlaying = currentReciter.id === reciter.id && isPlaying;
                return (
                  <div
                    key={reciter.id}
                    className="bg-white/10 backdrop-blur-md border border-white/5 hover:border-gold-main/50 p-4 rounded-xl flex items-center justify-between group transition-all"
                  >
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onNavigate('coran', { reciterId: reciter.id })}
                    >
                      <div className="w-10 h-10 rounded-full bg-gold-main text-ink font-serif font-bold text-sm flex items-center justify-center shadow-lg uppercase shrink-0">
                        {reciter.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white leading-tight font-serif truncate">
                          {reciter.name}
                        </p>
                        <p className="text-[11px] text-gold-light font-amiri truncate" dir="rtl">
                          {reciter.localName}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isThisReciterPlaying) {
                          togglePlay();
                        } else {
                          playSurah(all114Surahs[0], reciter);
                        }
                      }}
                      className="w-9 h-9 rounded-full bg-gold-main hover:bg-gold-light text-ink flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
                      title={isThisReciterPlaying ? t.pauseAudio : t.playAudio}
                      aria-label={isThisReciterPlaying ? t.pauseAudio : t.playAudio}
                    >
                      {isThisReciterPlaying ? (
                        <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">❚❚</span>
                      ) : (
                        <Play className="w-4 h-4 fill-ink pl-0.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION QUIZ PREVIEW */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ink text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-main/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="text-gold-main text-xs font-semibold tracking-wider uppercase bg-gold-main/10 px-3 py-1 rounded-full">
              🧠 {t.navQuiz}
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-semibold mt-4 mb-3">
              {t.quizSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed mb-8">
              {t.quizSectionSubtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white/5 border border-white/10 hover:border-gold-main/40 rounded-xl p-4 transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gold-light bg-gold-main/15 px-2 py-0.5 rounded font-sans uppercase">
                      {quiz.questionsCount} Ques
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {quiz.difficulty === 'debutant' ? t.difficultyEasy : t.difficultyMedium}
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-semibold text-white mb-2">
                    {quiz.title[lang]}
                  </h4>
                  <button
                    onClick={() => onNavigate('quiz', { quizId: quiz.id })}
                    className="text-xs text-gold-main hover:text-gold-light font-bold flex items-center gap-1 mt-1 transition-colors"
                  >
                    {t.startQuiz} →
                  </button>
                </div>
              ))}
            </div>

            {/* Special Kids Academy Banner inside Quiz Preview */}
            <div className={`bg-gradient-to-r from-emerald-950/90 to-ink border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg ${
              isAr ? 'sm:flex-row-reverse text-right' : ''
            }`}>
              <div className={`flex items-center gap-3.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 text-2xl flex items-center justify-center border border-amber-400/30 shrink-0">
                  🌟
                </div>
                <div>
                  <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                      {lang === 'ar' ? 'جديد للأطفال' : lang === 'en' ? 'New for Kids' : 'Nouveau Enfants'}
                    </span>
                    <span className="text-[11px] text-gold-light">6-12 ans</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-serif font-bold text-white mt-0.5">
                    {lang === 'ar' ? 'أكاديمية براعم الإسلام والشارات' : lang === 'en' ? 'Kids Islamic Academy & Badges' : 'Académie des Petits Croyants & Badges'}
                  </h4>
                  <p className="text-xs text-gray-300">
                    {lang === 'ar' ? 'موديولات تفاعلية لتعليم العقيدة والأخلاق مع أوسمة شرفية.' : '6 modules interactifs illustrés avec badges de progression et confettis !'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('quiz', { quizId: 'kids' })}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-ink text-xs font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
              >
                {lang === 'ar' ? 'دخول واحة البراعم ➔' : 'Espace Enfants ➔'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION BLOG PREVIEW */}
      <section className="py-16 bg-cream-sec/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-gold-dark text-xs font-semibold tracking-widest uppercase">
                ✍️ L'OUMMAH APPREND
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-ink mt-2">
                {t.blogTitle}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('blog')}
              className="mt-4 sm:mt-0 text-emerald-med hover:text-gold-dark font-bold text-sm flex items-center gap-1 transition-colors"
            >
              {lang === 'fr' ? 'Accéder au blog completo' : lang === 'en' ? 'Open blog page' : 'الصفحة الكاملة'} →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Big story on the left */}
            {blogArticles.filter(a => a.featured).map((article) => (
              <div
                key={article.id}
                onClick={() => onNavigate('blog', { articleId: article.id })}
                className="lg:col-span-7 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-gray-100 group transition-all"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title[lang]}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-emerald-main text-white font-sans text-xs px-3 py-1 rounded-full uppercase font-medium">
                    {article.category[lang]}
                  </span>
                </div>
                <div className="p-6">
                  <div className="text-xs text-text-sec mb-2 flex gap-4">
                    <span>{article.date}</span>
                    <span>• {article.readTime}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-ink mb-3 group-hover:text-emerald-med transition-colors">
                    {article.title[lang]}
                  </h3>
                  <p className="text-sm text-text-sec mb-4 line-clamp-2 leading-relaxed">
                    {article.excerpt[lang]}
                  </p>
                  <span className="text-sm font-bold text-gold-dark flex items-center gap-1 group-hover:underline">
                    {t.blogReadMore}
                  </span>
                </div>
              </div>
            ))}

            {/* Two smaller stories on the right */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {blogArticles.filter(a => !a.featured).slice(0, 2).map((article) => (
                <div
                  key={article.id}
                  onClick={() => onNavigate('blog', { articleId: article.id })}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-gray-100 p-4 flex gap-4 group transition-all"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={article.image}
                      alt={article.title[lang]}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gold-dark font-sans font-bold uppercase tracking-wider">
                        {article.category[lang]}
                      </span>
                      <h4 className="text-sm sm:text-base font-serif font-bold text-ink line-clamp-2 mt-1 mb-2 group-hover:text-emerald-med transition-colors">
                        {article.title[lang]}
                      </h4>
                    </div>
                    <span className="text-xs text-text-sec">
                      {article.date} • {article.readTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION NEWSLETTER SIGNUP */}
      <section className="bg-emerald-main text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Mail className="w-8 h-8 text-gold-light" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-semibold">
            {t.footerNewsletterTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-sans leading-relaxed">
            {t.footerNewsletterSub}
          </p>

          {hasSubscribed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-med/40 border border-gold-light/40 py-4 px-6 rounded-xl max-w-md mx-auto flex items-center justify-center gap-3 font-medium text-gold-light"
            >
              <CheckCircle2 className="w-5 h-5 text-gold-light" />
              <span>{t.contactSuccess.slice(0, 48)}...</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmitNews} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 mt-4">
              <input
                type="email"
                required
                placeholder={lang === 'fr' ? 'Saisir votre adresse email' : lang === 'en' ? 'Enter your email' : 'بريدك الالكتروني'}
                value={newsEmail}
                onChange={(e) => setNewsEmail(e.target.value)}
                className="flex-grow px-4 py-3 bg-white text-ink text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-main font-sans placeholder-gray-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-bold text-sm rounded-xl transition-all font-sans"
              >
                {t.footerNewsletterButton}
              </button>
            </form>
          )}
          <p className="text-xs text-slate-300 italic">
            🌿 {t.footerNewsletterNoSpam}
          </p>
        </div>
      </section>

    </div>
  );
}
