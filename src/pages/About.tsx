import { motion } from 'motion/react';
import { BookOpen, Award, Users, Heart, ExternalLink, Calendar, Check, Play, Star, Sparkles, Feather } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface AboutProps {
  lang: Language;
}

export default function About({ lang }: AboutProps) {
  const t = translations[lang];
  const isAr = lang === 'ar';

  const pillars = [
    {
      title: t.aboutValue1Title,
      desc: t.aboutValue1Desc,
      icon: <BookOpen className="w-6 h-6 text-emerald-light" />,
      arabic: "العِلم الشرعي"
    },
    {
      title: t.aboutValue2Title,
      desc: t.aboutValue2Desc,
      icon: <Users className="w-6 h-6 text-gold-main" />,
      arabic: "الأخوة والتكافل"
    },
    {
      title: t.aboutValue3Title,
      desc: t.aboutValue3Desc,
      icon: <Feather className="w-6 h-6 text-emerald-light" />,
      arabic: "الحكمة والبيان"
    }
  ];

  return (
    <div className={`islamic-pattern min-h-screen pb-20 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {/* SECTION HERO HEADER */}
      <section className="bg-ink py-16 text-white border-b border-gold-main/20 relative">
        <div className="absolute inset-0 bg-gold-main/2 opacity-5 select-none font-amiri text-8xl text-center">
          نبذة عنا
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Feather className="w-6 h-6 text-gold-light" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {t.aboutTitle}
          </h1>
          <p className="text-xs sm:text-sm text-text-sec max-w-xl mx-auto leading-relaxed">
            {t.aboutSubtitle}
          </p>
        </div>
      </section>

      {/* SECTION MISSION (GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* TEXT RIGHT OR LEFT */}
        <div className={`lg:col-span-7 space-y-6 ${isAr ? 'lg:order-2' : ''}`}>
          <span className="text-gold-dark text-xs font-semibold tracking-wider uppercase bg-gold-main/10 px-3 py-1 rounded-full inline-block">
            🌱 {lang === 'fr' ? 'QUI SOMMES-NOUS' : lang === 'en' ? 'OUR BACKGROUND' : 'من نحن وجذور مبادرتنا'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-ink leading-tight">
            {t.aboutMissionTitle}
          </h2>
          <p className="text-sm sm:text-base text-text-sec leading-relaxed font-sans">
            {t.aboutMissionDesc1}
          </p>
          <p className="text-sm sm:text-base text-text-sec leading-relaxed font-sans">
            {t.aboutMissionDesc2}
          </p>

          <div className="border-t border-gray-150 pt-4 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between text-xs text-text-sec">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-med" />
              <span>Lancé officiellement en Avril 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold-dark" />
              <span>Contenu révisé par des théologiens renommés</span>
            </div>
          </div>
        </div>

        {/* IMAGE/VECTOR REPRESENTATION LEFT/RIGHT */}
        <div className={`lg:col-span-5 flex justify-center ${isAr ? 'lg:order-1' : ''}`}>
          <div className="relative w-72 h-96 sm:w-80 sm:h-[420px]">
            {/* Ambient gold halo */}
            <div className="absolute inset-0 bg-gold-main/5 rounded-3xl transform rotate-3 scale-102"></div>
            
            {/* Visual vector wrapper card */}
            <div className="absolute inset-0 bg-emerald-main/20 border border-gold-main/30 rounded-3xl shadow-xl flex flex-col justify-between p-6 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.15)_1px,transparent_0)] bg-[size:24px_24px] z-0"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <Star className="w-8 h-8 text-gold-light fill-gold-light" />
                <span className="text-[10px] text-white bg-ink/70 px-2 rounded tracking-widest font-mono">
                  INFO PORTAL
                </span>
              </div>

              <div className="text-center relative z-10 space-y-4">
                <p className="font-amiri text-6xl text-gold-main leading-none drop-shadow-md select-none">
                  الله
                </p>
                <p className="text-sm text-ink font-serif font-bold tracking-tight">
                  Connaissance • Foi • Guidance
                </p>
              </div>

              <div className="relative z-10 border-t border-gold-main/25 pt-2 text-center text-[11px] text-emerald-main font-mono">
                Islam avec Aboubakar
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* YOUTUBE AUDIENCE DASHBOARD */}
      <section className="bg-ink text-white py-14 border-y border-gold-main/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className={`lg:col-span-7 space-y-4 ${isAr ? 'lg:order-2' : ''}`}>
              <span className="text-red-urge text-xs font-bold uppercase tracking-widest">
                🔴 INTERFACE YOUTUBE
              </span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {t.aboutChannelStats}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {lang === 'fr' 
                  ? "Suivie par une oummah active de 120 000 frères et sœurs, Aboubakar produit deux cours détaillés et analyses par semaine. Notre contenu est 100% gratuit d'accès pour propager la Sunnah."
                  : lang === 'en'
                  ? "Followed by an active community of 120,000 believers, Aboubakar edits 2 deep theological webinars per week. Safe, referenced dawah for everyone."
                  : "تضم أسرتنا المترابطة على اليوتيوب أكثر من 120 ألف طالب علم، نبث من خلالها دروساً دورية في الفقه والتفسير وقضايا الساعة."
                }
              </p>
              <div className="pt-2">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-red-urge hover:bg-red-700 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center sm:inline-flex gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{lang === 'fr' ? "Prendre un abonnement gratuit →" : lang === 'en' ? "Subscribe free now →" : "اشترك في القناة مجانًا الآن"}</span>
                </a>
              </div>
            </div>

            <div className={`lg:col-span-5 grid grid-cols-2 gap-4 ${isAr ? 'lg:order-1' : ''}`}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-serif font-bold text-gold-main">120K+</p>
                <p className="text-xs text-gray-400 font-sans mt-1">Abonnés fidèles</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-serif font-bold text-gold-main">350+</p>
                <p className="text-xs text-gray-400 font-sans mt-1">Vidéos publiées</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-serif font-bold text-gold-main">8.5M</p>
                <p className="text-xs text-gray-400 font-sans mt-1">Vues cumulées</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-serif font-bold text-gold-main">15</p>
                <p className="text-xs text-gray-400 font-sans mt-1">Séries complètes</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE VALUES PILLARS (3 COLS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3.5xl font-serif font-semibold text-ink leading-tight">
            {t.aboutValuesTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pil, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-gold-main/30 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-cream-main flex items-center justify-center rounded-xl text-emerald-main">
                    {pil.icon}
                  </div>
                  <span className="text-[12px] text-gold-dark font-amiri font-bold" dir="rtl">
                    {pil.arabic}
                  </span>
                </div>
                <h3 className="text-base font-serif font-bold text-ink">
                  {idx + 1}. {pil.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-sec leading-relaxed font-sans">
                  {pil.desc}
                </p>
              </div>
              
              <div className="border-t border-gray-50 pt-3 mt-6 text-[10px] text-gray-400 font-mono tracking-wider">
                PILLARS OF DAWAH
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
