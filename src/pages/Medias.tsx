import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Tv, Gamepad2, Volume2, ShieldAlert, CheckCircle, RefreshCw, Key, ArrowRight, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface MediasProps {
  lang: Language;
}

export default function Medias({ lang }: MediasProps) {
  const [activeTab, setActiveTab] = useState<'escape' | 'live' | 'podcasts'>('escape');
  
  // Escape Game State
  const [currentRoom, setCurrentRoom] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [roomError, setRoomError] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const isAr = lang === 'ar';

  const t = {
    fr: {
      title: "Médias, Live & Jeux Islamiques",
      subtitle: "Vivez une immersion spirituelle avec La Mecque en direct, écoutez nos podcasts instructifs et testez votre logique dans l'Escape Game.",
      tabEscape: "Escape Game Islam",
      tabLive: "Mecque en Direct",
      tabPodcasts: "Podcasts & Audios",
      escapeTitle: "L'Énigme des Sages — Escape Game",
      escapeDesc: "Résolvez les 5 énigmes théologiques et historiques pour déverrouiller la Porte de la Sagesse !",
      room: "Salle",
      checkAnswer: "Valider la clé",
      nextRoom: "Passer à la salle suivante",
      congrats: "Macha'Allah ! Vous avez résolu toutes les énigmes et déverrouillé la Porte de la Sagesse !",
      restartGame: "Rejouer",
      wrongKey: "La clé est incorrecte. Réfléchissez bien et réessayez !",
      liveTitle: "Diffusion en direct de la Noble Kaaba (Makkah Live)",
      podcastTitle: "Podcasts & Conférences Spirituelles"
    },
    en: {
      title: "Islamic Medias, Live & Games",
      subtitle: "Experience a spiritual journey with Makkah Live, listen to educational podcasts, and test your mind in our Escape Game.",
      tabEscape: "Islamic Escape Game",
      tabLive: "Makkah Live Stream",
      tabPodcasts: "Podcasts & Audios",
      escapeTitle: "The Riddle of the Sages — Escape Game",
      escapeDesc: "Solve the 5 theological and historical riddles to unlock the Gate of Wisdom!",
      room: "Room",
      checkAnswer: "Validate Key",
      nextRoom: "Proceed to next room",
      congrats: "Masha'Allah! You have solved all riddles and unlocked the Gate of Wisdom!",
      restartGame: "Play Again",
      wrongKey: "The key is incorrect. Think carefully and try again!",
      liveTitle: "Makkah Live Stream — Holy Kaaba",
      podcastTitle: "Spiritual Podcasts & Lectures"
    },
    ar: {
      title: "الإعلام والبث الحي والألعاب التثقيفية",
      subtitle: "عش رحلة إيمانية مع البث المباشر للحرم المكي، واستمع للدروس النافعة واختبر ذكاءك في لعبة الهروب الإسلامية.",
      tabEscape: "لعبة الهروب الإسلامية",
      tabLive: "البث الحي لمكة المكرمة",
      tabPodcasts: "البودكاست والخطب المسموعة",
      escapeTitle: "لغز الحكماء — لعبة الهروب والتحدي",
      escapeDesc: "حل الألغاز الخمسة العقائدية والتاريخية لتفتح بوابة الحكمة العظيمة !",
      room: "الغرفة رقم",
      checkAnswer: "التحقق من المفتاح",
      nextRoom: "العبور للغرفة التالية",
      congrats: "ما شاء الله! لقد نجحت في حل كافة الألغاز وفتحت بوابة الحكمة بنجاح تبارك الرحمن.",
      restartGame: "اللعب مجدداً",
      wrongKey: "المفتاح غير صحيح ! تأمل في الدليل الإيماني وحاول مرة أخرى.",
      liveTitle: "البث المباشر للمسجد الحرام والكعبة المشرفة",
      podcastTitle: "بودكاست ومحاضرات روحية مسموعة"
    }
  }[lang];

  // Escape Game riddles data
  const escapeRiddles = [
    {
      id: 1,
      question: {
        fr: "Combien y a-t-il de Piliers de l'Islam et de Piliers de la Foi combinés ?",
        en: "How many Pillars of Islam and Pillars of Faith are there combined?",
        ar: "ما هو مجموع عدد أركان الإسلام وأركان الإيمان معاً ؟"
      },
      options: ["10", "11", "12", "5"],
      correct: "11", // 5 pillars + 6 pillars = 11
      hint: {
        fr: "Piliers de l'Islam = 5. Piliers de la Foi = 6.",
        en: "Pillars of Islam = 5. Pillars of Faith = 6.",
        ar: "أركان الإسلام خمسة، وأركان الإيمان ستة."
      }
    },
    {
      id: 2,
      question: {
        fr: "Quel Prophète fut miraculeusement épargné d'un immense brasier par commandement divin ?",
        en: "Which Prophet was miraculously spared from a massive fire by divine order?",
        ar: "من هو النبي الذي جعل الله النار عليه برداً وسلاماً ؟"
      },
      options: ["Moussa", "Nuh", "Ibrahim", "Youssouf"],
      correct: "Ibrahim",
      hint: {
        fr: "Il est surnommé Khalil Allah (l'ami intime d'Allah).",
        en: "He is known as Khalil Allah (the close friend of Allah).",
        ar: "يلقب بخليل الرحمن وأبو الأنبياء."
      }
    },
    {
      id: 3,
      question: {
        fr: "Complétez le verset de la Sourate Al-Ikhlas : 'Lam yalid wa lam...'",
        en: "Complete the verse from Surah Al-Ikhlas: 'Lam yalid wa lam...'",
        ar: "أكمل الآية الكريمة من سورة الإخلاص: «لَمْ يَلِدْ وَلَمْ...»"
      },
      options: ["yakun", "yulad", "yushrak", "ahad"],
      correct: "yulad",
      hint: {
        fr: "« Il n'a jamais engendré, n'a pas été engendré non plus. »",
        en: "« He neither begets nor is born. »",
        ar: "«لَمْ يَلِدْ وَلَمْ يُولَدْ»"
      }
    },
    {
      id: 4,
      question: {
        fr: "En quelle année chrétienne (approximative) s'est produite l'Hégire (émigration à Médine) ?",
        en: "In which Christian year (approximate) did the Hijrah (migration to Medina) occur?",
        ar: "في أي عام ميلادي حدثت الهجرة النبوية المباركة إلى المدينة المنورة ؟"
      },
      options: ["570 CE", "610 CE", "622 CE", "632 CE"],
      correct: "622 CE",
      hint: {
        fr: "C'est l'an 1 du calendrier musulman.",
        en: "This represents year 1 of the Islamic lunar calendar.",
        ar: "هو العام الأول لبدء التاريخ الهجري للمسلمين."
      }
    },
    {
      id: 5,
      question: {
        fr: "Quel Nom d'Allah signifie 'Celui qui accorde la paix et la sécurité' ?",
        en: "Which Name of Allah means 'The Giver of Peace and Security' ?",
        ar: "أي من أسماء الله الحسنى يعني السلاّمة والأمان والصلح ؟"
      },
      options: ["As-Salam", "Ar-Rahman", "Al-Malik", "Al-Mu'min"],
      correct: "As-Salam",
      hint: {
        fr: "C'est la racine du mot 'Islam' et de la salutation pacifique.",
        en: "This shares the root of the word 'Islam' and the greetings of peace.",
        ar: "هو مصدر تحية أهل الإسلام ومفتاح السلام في الصدور."
      }
    }
  ];

  const handleVerifyKey = () => {
    const currentRiddle = escapeRiddles[currentRoom - 1];
    if (selectedAnswer === currentRiddle.correct) {
      setRoomError(false);
      setSelectedAnswer(null);
      if (currentRoom < 5) {
        setCurrentRoom(prev => prev + 1);
      } else {
        setGameWon(true);
      }
    } else {
      setRoomError(true);
    }
  };

  const handleRestartGame = () => {
    setCurrentRoom(1);
    setSelectedAnswer(null);
    setRoomError(false);
    setGameWon(false);
  };

  const currentRiddle = escapeRiddles[currentRoom - 1];

  return (
    <div className={`islamic-pattern min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white ${isAr ? 'text-right' : 'text-left'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-gold-main uppercase bg-gold-main/10 px-3.5 py-1 rounded-full border border-gold-main/20 inline-block">
            🎮 AL-MEDIA & JEUX
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-2 rounded-2xl flex flex-wrap gap-1 items-center justify-center shadow-lg backdrop-blur-md">
          {[
            { id: 'escape', label: t.tabEscape, icon: <Gamepad2 className="w-4 h-4" /> },
            { id: 'live', label: t.tabLive, icon: <Tv className="w-4 h-4" /> },
            { id: 'podcasts', label: t.tabPodcasts, icon: <Volume2 className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-main text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* VIEWPORTS */}
        <div className="space-y-6">
          
          {/* TAB 1: ESCAPE GAME ISLAM */}
          {activeTab === 'escape' && (
            <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-main/5 rounded-full blur-2xl"></div>
              
              {gameWon ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  <div className="w-16 h-16 bg-emerald-main/20 text-emerald-light rounded-full flex items-center justify-center mx-auto border border-emerald-main/30 animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-white">Macha'Allah !</h3>
                    <p className="text-sm text-zinc-300 font-sans leading-relaxed px-4">
                      {t.congrats}
                    </p>
                  </div>
                  <button
                    onClick={handleRestartGame}
                    className="px-6 py-3 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-semibold rounded-xl text-xs sm:text-sm transition-all shadow"
                  >
                    {t.restartGame}
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Progress Indicator */}
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                    <span className="text-xs font-bold text-gold-main uppercase tracking-widest flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-gold-light" />
                      {t.escapeTitle}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {t.room} <span className="text-emerald-light font-bold font-mono">{currentRoom}</span> / 5
                    </span>
                  </div>

                  {/* Room Question Card */}
                  <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-850 space-y-4">
                    <p className="text-xs text-zinc-500 font-sans uppercase font-bold tracking-wider">{t.room} {currentRoom}</p>
                    <h3 className="text-base sm:text-lg font-serif font-semibold text-white leading-relaxed">
                      {currentRiddle.question[lang]}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-2 gap-3">
                    {currentRiddle.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedAnswer(opt);
                          setRoomError(false);
                        }}
                        className={`p-3.5 rounded-xl border text-center font-sans font-medium text-xs sm:text-sm transition-all ${
                          selectedAnswer === opt
                            ? 'bg-emerald-main/10 border-emerald-main text-white'
                            : 'bg-zinc-950/40 border-zinc-850/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {/* Hints */}
                  <div className="bg-zinc-950/30 p-3.5 rounded-xl border border-zinc-850 flex items-start gap-2 text-zinc-500 text-xs font-sans">
                    <HelpCircle className="w-4 h-4 text-gold-dark mt-0.5 flex-shrink-0" />
                    <p className="font-sans font-light italic">
                      Indices : {currentRiddle.hint[lang]}
                    </p>
                  </div>

                  {/* Submit verifications */}
                  <AnimatePresence mode="wait">
                    {roomError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="bg-red-950/20 border border-red-900/40 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs font-sans"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span>{t.wrongKey}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    disabled={!selectedAnswer}
                    onClick={handleVerifyKey}
                    className="w-full py-3.5 bg-emerald-main hover:bg-emerald-med disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-sans font-semibold rounded-xl text-xs sm:text-sm transition-all"
                  >
                    {t.checkAnswer} →
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LIVE MECCA STREAM */}
          {activeTab === 'live' && (
            <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="border-b border-zinc-850 pb-3 flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                  📺 {t.liveTitle}
                </h3>
                <span className="text-[10px] uppercase font-bold text-red-500 bg-red-950/20 border border-red-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  LIVE 1080p
                </span>
              </div>

              {/* HD Player Mockup with responsive preview container */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-inner flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=1200"
                  alt="Makkah live stream"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                />
                
                {/* Simulated live video player layout with play overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10 p-4 flex flex-col justify-between">
                  <div></div>
                  <div className="flex justify-between items-center text-xs font-sans">
                    <p className="text-white drop-shadow font-light">Makkah Al-Mukarramah Live - Holy Kaaba</p>
                    <p className="text-emerald-light font-bold drop-shadow">98,245 spectateurs en ligne</p>
                  </div>
                </div>

                <div className="relative z-20 text-center space-y-4 max-w-sm px-6">
                  <button
                    onClick={() => window.open('https://www.youtube.com/results?search_query=makkah+live+stream', '_blank')}
                    className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all shadow-lg mx-auto"
                  >
                    <Play className="w-6 h-6 fill-white pl-0.5" />
                  </button>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Cliquez pour lancer le flux de diffusion en direct officiel de la Kaaba à La Mecque sur YouTube dans un nouvel onglet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPIRITUAL PODCASTS */}
          {activeTab === 'podcasts' && (
            <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="border-b border-zinc-850 pb-3">
                <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                  🎙️ {t.podcastTitle}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Comprendre le Tafsir de la Sourate Al-Mulk", duration: "18:42 min", speaker: "Aboubakar", topic: "Tafsir", desc: "Une étude approfondie des secrets de rédemption et de protection de la sourate de la Royauté." },
                  { title: "Comment acquérir la sérénité du cœur (Khoshou')", duration: "12:15 min", speaker: "Aboubakar", topic: "Spiritualité", desc: "Conseils pratiques et dalils spirituels pour atteindre l'apaisement intérieur dans la prière." },
                  { title: "La patience du Prophète Ayyoub (Job)", duration: "22:08 min", speaker: "Aboubakar", topic: "Histoire des Prophètes", desc: "L'enseignement ultime sur l'endurance absolue et la certitude de la délivrance d'Allah." },
                  { title: "La valeur sacrée de la Sadaqa Jariya", duration: "14:50 min", speaker: "Aboubakar", topic: "Sermon", desc: "Comprendre l'impact éternel du don continu sur notre balance de bonnes actions." }
                ].map((pod, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-950/40 border border-zinc-850 p-5 rounded-xl hover:border-gold-main/20 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-emerald-light bg-emerald-main/10 px-2 py-0.5 rounded border border-emerald-main/20 uppercase tracking-wide">
                          {pod.topic}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">{pod.duration}</span>
                      </div>
                      <h4 className="text-sm font-serif font-bold text-white leading-snug hover:text-gold-light transition-colors">
                        {pod.title}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans font-light line-clamp-2 leading-relaxed">
                        {pod.desc}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-900 pt-3">
                      <span className="text-[10px] font-mono text-zinc-500">Par {pod.speaker}</span>
                      <button
                        onClick={() => alert('Lecture en cours de simulation...')}
                        className="px-3.5 py-1.5 bg-emerald-main hover:bg-emerald-med text-white font-sans text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        Écouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
