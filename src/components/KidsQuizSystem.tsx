import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Lock, 
  Heart, 
  Shield, 
  Trophy, 
  User, 
  Share2, 
  Printer, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { Language } from '../types';
import { kidsLearningModules, KidLearningModule, KidBadge } from '../data/kids-quiz-modules';
import { kidSoundManager } from '../lib/audio-effects';
import QuizConfetti from './QuizConfetti';

interface KidsQuizSystemProps {
  lang: Language;
}

interface ModuleProgress {
  score: number;
  total: number;
  stars: number;
  unlockedAt: number;
}

interface KidsProgressState {
  completedModules: Record<string, ModuleProgress>;
  unlockedBadges: string[];
  totalStars: number;
  kidName: string;
}

const STORAGE_KEY = 'islam_kids_academy_progress_v1';

export default function KidsQuizSystem({ lang }: KidsQuizSystemProps) {
  const isAr = lang === 'ar';

  // Persistence State
  const [progress, setProgress] = useState<KidsProgressState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            completedModules: parsed.completedModules || {},
            unlockedBadges: parsed.unlockedBadges || [],
            totalStars: parsed.totalStars || 0,
            kidName: parsed.kidName || (lang === 'ar' ? 'البطل الصغير' : 'Petit Croyant')
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse kids quiz progress:', e);
    }
    return {
      completedModules: {},
      unlockedBadges: [],
      totalStars: 0,
      kidName: lang === 'ar' ? 'البطل الصغير' : 'Petit Croyant'
    };
  });

  // Sound preference
  const [isMuted, setIsMuted] = useState<boolean>(() => kidSoundManager.getMuted());

  // Editing name inline
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(progress.kidName);

  // Active module gameplay
  const [activeModule, setActiveModule] = useState<KidLearningModule | null>(null);
  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasValidated, setHasValidated] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [freshlyUnlockedBadge, setFreshlyUnlockedBadge] = useState<KidBadge | null>(null);

  // Inspection modal for badge
  const [inspectedBadge, setInspectedBadge] = useState<{ badge: KidBadge; progress?: ModuleProgress } | null>(null);

  // Persist progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save kids quiz progress:', e);
    }
  }, [progress]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    kidSoundManager.setMuted(next);
  };

  const handleSaveName = () => {
    const clean = nameInput.trim();
    if (clean) {
      setProgress(prev => ({ ...prev, kidName: clean }));
    }
    setIsEditingName(false);
  };

  // Start a module
  const startModule = (mod: KidLearningModule) => {
    setActiveModule(mod);
    setQuestionIdx(0);
    setSelectedOption(null);
    setHasValidated(false);
    setCurrentScore(0);
    setShowCelebration(false);
    setFreshlyUnlockedBadge(null);
  };

  const exitModule = () => {
    setActiveModule(null);
    setShowCelebration(false);
  };

  const currentQ = activeModule?.questions[questionIdx];

  // Select an option
  const handleAnswer = (optIndex: number) => {
    if (hasValidated || !currentQ) return;
    setSelectedOption(optIndex);
    setHasValidated(true);

    const isCorrect = optIndex === currentQ.correctAnswerIndex;
    if (isCorrect) {
      setCurrentScore(prev => prev + 1);
      kidSoundManager.playCorrect();
    } else {
      kidSoundManager.playGentle();
    }
  };

  // Proceed to next question or celebrate completion
  const handleNextQuestion = () => {
    if (!activeModule) return;

    if (questionIdx < activeModule.questions.length - 1) {
      setQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setHasValidated(false);
    } else {
      // Complete module!
      completeModule();
    }
  };

  const completeModule = () => {
    if (!activeModule) return;

    const total = activeModule.questions.length;
    const finalScore = currentScore;
    const ratio = finalScore / total;

    // Calculate stars: 3 for 100%, 2 for >= 75%, 1 for >= 50%
    let starsEarned = 1;
    if (ratio === 1) starsEarned = 3;
    else if (ratio >= 0.75) starsEarned = 2;

    const isSuccess = ratio >= 0.5; // Success threshold (at least half)
    const isNewBadge = isSuccess && !progress.unlockedBadges.includes(activeModule.badge.id);

    // Update progress state
    setProgress(prev => {
      const existing = prev.completedModules[activeModule.id];
      const bestStars = existing ? Math.max(existing.stars, starsEarned) : starsEarned;
      const bestScore = existing ? Math.max(existing.score, finalScore) : finalScore;

      const updatedCompleted = {
        ...prev.completedModules,
        [activeModule.id]: {
          score: bestScore,
          total,
          stars: bestStars,
          unlockedAt: existing?.unlockedAt || Date.now()
        }
      };

      const updatedBadges = isNewBadge
        ? [...prev.unlockedBadges, activeModule.badge.id]
        : prev.unlockedBadges;

      // Calculate total stars
      const newTotalStars = (Object.values(updatedCompleted) as ModuleProgress[]).reduce((sum, item) => sum + item.stars, 0);

      return {
        ...prev,
        completedModules: updatedCompleted,
        unlockedBadges: updatedBadges,
        totalStars: newTotalStars
      };
    });

    if (isSuccess) {
      if (isNewBadge) {
        setFreshlyUnlockedBadge(activeModule.badge);
      }
      setShowCelebration(true);
      kidSoundManager.playFanfare();
    } else {
      // Just show regular results
      setShowCelebration(true);
    }
  };

  // Reset all kids progress
  const handleResetProgress = () => {
    if (window.confirm(lang === 'ar' ? 'هل ترغب في إعادة ضبط شاراتك ونجومك؟' : 'Veux-tu réinitialiser tes étoiles et badges pour recommencer l’aventure ?')) {
      setProgress({
        completedModules: {},
        unlockedBadges: [],
        totalStars: 0,
        kidName: lang === 'ar' ? 'البطل الصغير' : 'Petit Croyant'
      });
      setShowCelebration(false);
      setActiveModule(null);
    }
  };

  // Badges count
  const unlockedCount = progress.unlockedBadges.length;
  const totalBadges = kidsLearningModules.length;

  return (
    <div className="space-y-8 font-sans">
      
      {/* KID ACADEMY TOP BANNER & PROFILE CARD */}
      {!activeModule && (
        <div className="bg-gradient-to-r from-emerald-900 via-ink to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-main/30 shadow-xl relative overflow-hidden">
          
          {/* Playful background constellations */}
          <div className="absolute top-2 right-4 text-gold-main/20 text-7xl select-none font-amiri pointer-events-none">
            ⭐
          </div>
          <div className="absolute bottom-2 left-4 text-emerald-400/10 text-8xl select-none font-amiri pointer-events-none">
            🌙
          </div>

          <div className={`flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 ${isAr ? 'md:flex-row-reverse text-right' : 'text-left'}`}>
            
            {/* Left title & child name badge */}
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <div className={`flex flex-wrap items-center justify-center md:justify-start gap-2 ${isAr ? 'md:flex-row-reverse' : ''}`}>
                <span className="px-3 py-1 rounded-full bg-gold-main/20 text-gold-light border border-gold-main/30 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-gold-main" />
                  <span>{lang === 'ar' ? 'أكاديمية براعم الإسلام' : lang === 'en' ? 'Kids Islamic Academy' : 'Académie des Petits Croyants'}</span>
                </span>
                
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                  {lang === 'ar' ? 'للبنين والبنات ٦-١٢ سنة' : 'Pour enfants 6-12 ans'}
                </span>
              </div>

              {/* Child personalized greeting */}
              <div className={`flex items-center justify-center md:justify-start gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={20}
                      className="px-3 py-1 bg-white text-ink text-sm font-bold rounded-lg focus:outline-gold-main"
                      placeholder="Ton prénom"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="px-3 py-1 bg-gold-main text-ink text-xs font-bold rounded-lg hover:bg-gold-light"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => { setNameInput(progress.kidName); setIsEditingName(true); }}
                    className="cursor-pointer group flex items-center gap-2"
                    title="Clique pour changer ton prénom !"
                  >
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white group-hover:text-gold-light transition-colors">
                      {lang === 'ar' ? `مرحباً بك يا ${progress.kidName} ! 🌟` : `Bienvenue, ${progress.kidName} ! 🌟`}
                    </h2>
                    <span className="text-xs text-gold-main underline opacity-70 group-hover:opacity-100">
                      ✎
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                {lang === 'ar'
                  ? 'أجب عن الأسئلة الممتعة، واجمع النجوم الذهبية، وافتح شارات الشرف الستة لتصبح بطل الأكاديمية !'
                  : lang === 'en'
                    ? 'Answer joyful questions, collect shiny stars, and unlock all 6 Islamic honor badges!'
                    : 'Réponds aux questions illustrées, gagne des étoiles dorées et collectionne tes 6 badges d’honneur islamiques !'}
              </p>
            </div>

            {/* Right progress counters & Sound control */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              
              {/* Star Counter */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl font-bold border border-amber-400/30">
                  ⭐
                </div>
                <div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider block font-bold">
                    {lang === 'ar' ? 'مجموع النجوم' : 'Étoiles gagnées'}
                  </span>
                  <span className="text-xl font-mono font-bold text-gold-main">
                    {progress.totalStars}
                  </span>
                </div>
              </div>

              {/* Badges Counter */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl font-bold border border-emerald-400/30">
                  🏆
                </div>
                <div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider block font-bold">
                    {lang === 'ar' ? 'الشارات المفتوحة' : 'Badges débloqués'}
                  </span>
                  <span className="text-xl font-mono font-bold text-emerald-300">
                    {unlockedCount} / {totalBadges}
                  </span>
                </div>
              </div>

              {/* Sound toggle button */}
              <button
                type="button"
                onClick={toggleSound}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-gold-light border border-white/15 transition-all shadow-xs"
                title={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

            </div>

          </div>

          {/* Reset Progress mini link */}
          {unlockedCount > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={handleResetProgress}
                className="text-[11px] text-gray-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'ar' ? 'إعادة تعيين التقدم' : 'Recommencer l’aventure à zéro'}</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* ACTIVE GAMEPLAY VIEW */}
      {activeModule ? (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Top navigation within game */}
          <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={exitModule}
              className={`px-3.5 py-2 bg-white border border-gray-100 hover:border-gold-main/40 rounded-xl text-xs sm:text-sm font-bold text-emerald-med flex items-center gap-1.5 shadow-xs transition-all ${
                isAr ? 'flex-row-reverse' : ''
              }`}
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              <span>{lang === 'ar' ? 'العودة للواحة' : 'Quitter le module'}</span>
            </button>

            {/* Current Module Title Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeModule.icon}</span>
              <span className="text-xs sm:text-sm font-serif font-bold text-ink">
                {activeModule.title[lang] || activeModule.title.fr}
              </span>
            </div>

            {/* Sound toggle in game */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-xl bg-white border border-gray-100 text-gold-dark hover:border-gold-main/30"
              title="Son"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* CELEBRATION MODAL OR ACTIVE QUESTION */}
          {showCelebration ? (
            /* CELEBRATION RESULT VIEW WITH CONFETTI */
            <>
              <QuizConfetti />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gold-main/30 shadow-2xl p-6 sm:p-10 text-center space-y-6 relative overflow-hidden z-10"
              >
                {/* Glow behind badge */}
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-main/20 rounded-full blur-3xl pointer-events-none" />

                {/* Big Animated Stars */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {[1, 2, 3].map((starIdx) => {
                    const ratio = currentScore / activeModule.questions.length;
                    const isEarned = 
                      (starIdx === 1 && ratio >= 0.5) ||
                      (starIdx === 2 && ratio >= 0.75) ||
                      (starIdx === 3 && ratio === 1);

                    return (
                      <motion.div
                        key={starIdx}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: isEarned ? 1.2 : 0.9, rotate: 0 }}
                        transition={{ delay: starIdx * 0.2, type: 'spring' }}
                        className={`text-4xl sm:text-5xl ${isEarned ? 'text-amber-400 drop-shadow-md' : 'text-gray-200 opacity-40'}`}
                      >
                        ⭐
                      </motion.div>
                    );
                  })}
                </div>

                {/* Big Title */}
                <div className="space-y-1">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-main/10 text-emerald-med text-xs font-mono font-bold uppercase tracking-wider inline-block">
                    {lang === 'ar' ? '🎉 ما شاء الله ! أحسنت يا بطل' : `🎉 Félicitations ${progress.kidName} !`}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-serif font-bold text-ink tracking-tight">
                    {currentScore === activeModule.questions.length
                      ? (lang === 'ar' ? 'علامة كاملة مباركة !' : 'Score Parfait ! 🌟')
                      : currentScore >= Math.ceil(activeModule.questions.length * 0.7)
                        ? (lang === 'ar' ? 'إنجاز رائع وممتاز !' : 'Très Beau Travail ! 👏')
                        : (lang === 'ar' ? 'محاولة طيبة، استمر !' : 'Bel effort ! Continue ainsi ! 💖')}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-sec max-w-md mx-auto">
                    {lang === 'ar'
                      ? `لقد أجبت بشكل صحيح على ${currentScore} من ${activeModule.questions.length} أسئلة.`
                      : `Tu as répondu correctement à ${currentScore} questions sur ${activeModule.questions.length} !`}
                  </p>
                </div>

                {/* UNLOCKED BADGE SHOWCASE CARD */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="max-w-md mx-auto bg-gradient-to-br from-cream-main via-white to-gold-main/10 border-2 border-gold-main rounded-3xl p-6 shadow-lg space-y-3"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-gold-main via-amber-400 to-yellow-300 text-white mx-auto flex items-center justify-center text-4xl shadow-md border-2 border-white animate-pulse">
                    {activeModule.badge.icon}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-gold-dark tracking-wider">
                      {lang === 'ar' ? 'وسام الشرف المكتسب' : 'Badge d’honneur débloqué'}
                    </span>
                    <h4 className="text-lg font-serif font-bold text-ink">
                      {activeModule.badge.name[lang] || activeModule.badge.name.fr}
                    </h4>
                    <p className="text-xs text-text-sec mt-1">
                      {activeModule.badge.description[lang] || activeModule.badge.description.fr}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-med">
                    <CheckCircle2 className="w-4 h-4 text-emerald-main" />
                    <span>{activeModule.badge.virtue[lang] || activeModule.badge.virtue.fr}</span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => startModule(activeModule)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cream-main hover:bg-cream-sec text-ink font-bold text-xs sm:text-sm border border-gray-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4 text-gold-dark" />
                    <span>{lang === 'ar' ? 'إعادة اللعب' : 'Rejouer pour 3 étoiles'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={exitModule}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{lang === 'ar' ? 'استكشاف سائر الشارات' : 'Retour aux modules'}</span>
                    <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                  </button>
                </div>

              </motion.div>
            </>
          ) : (
            /* ACTIVE QUESTION CARD */
            currentQ && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
                
                {/* Child-friendly Step Progress with Walking Star Emoji */}
                <div className="space-y-2">
                  <div className={`flex justify-between items-center text-xs font-bold text-ink ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="flex items-center gap-1.5 text-emerald-med">
                      <span>{currentQ.emoji}</span>
                      <span>
                        {lang === 'ar'
                          ? `السؤال ${questionIdx + 1} من ${activeModule.questions.length}`
                          : `Question ${questionIdx + 1} sur ${activeModule.questions.length}`}
                      </span>
                    </span>

                    <span className="font-mono text-gold-dark bg-gold-main/15 px-2.5 py-0.5 rounded-full text-[11px]">
                      ⭐ {currentScore} {lang === 'ar' ? 'نقاط' : 'pts'}
                    </span>
                  </div>

                  {/* Visual Progress bar with moving Star */}
                  <div className="relative w-full h-3 bg-cream-sec rounded-full overflow-hidden p-0.5 border border-gray-100">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-med via-gold-main to-emerald-light shadow-xs"
                      initial={{ width: 0 }}
                      animate={{ width: `${((questionIdx + 1) / activeModule.questions.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Big Question Prompt Box */}
                <div className="bg-gradient-to-br from-cream-main/40 to-white p-5 sm:p-6 rounded-2xl border border-gold-main/20 shadow-xs text-center space-y-2">
                  <span className="text-4xl inline-block mb-1">{currentQ.emoji}</span>
                  <h3 className="text-base sm:text-xl font-serif font-bold text-ink leading-relaxed">
                    {currentQ.question[lang] || currentQ.question.fr}
                  </h3>
                </div>

                {/* Choices Buttons */}
                <div className="grid grid-cols-1 gap-3">
                  {(currentQ.options[lang] || currentQ.options.fr).map((optionText, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrect = optIdx === currentQ.correctAnswerIndex;

                    let btnStyle = 'bg-white border-gray-200 text-ink hover:border-gold-main/60 hover:bg-cream-main/30 shadow-xs';
                    let badgeStyle = 'bg-cream-sec text-text-sec';

                    if (hasValidated) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-main/15 border-emerald-med text-emerald-main font-bold shadow-sm ring-2 ring-emerald-main/30';
                        badgeStyle = 'bg-emerald-main text-white';
                      } else if (isSelected) {
                        btnStyle = 'bg-amber-500/15 border-amber-500 text-amber-900 shadow-sm';
                        badgeStyle = 'bg-amber-500 text-white';
                      } else {
                        btnStyle = 'bg-white border-gray-100 opacity-50 text-gray-400';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-gold-main border-gold-main text-ink shadow-sm';
                      badgeStyle = 'bg-ink text-gold-main';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleAnswer(optIdx)}
                        disabled={hasValidated}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer select-none ${btnStyle} ${
                          isAr ? 'flex-row-reverse text-right' : ''
                        }`}
                      >
                        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                            {['A', 'B', 'C', 'D'][optIdx]}
                          </span>
                          <span className="font-sans font-medium">{optionText}</span>
                        </div>

                        {hasValidated && isCorrect && (
                          <span className="text-emerald-main text-lg shrink-0">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation & Affirmation Banner */}
                <AnimatePresence>
                  {hasValidated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-5 rounded-2xl border space-y-3 ${
                        selectedOption === currentQ.correctAnswerIndex
                          ? 'bg-emerald-main/10 border-emerald-main/30'
                          : 'bg-amber-500/10 border-amber-500/30'
                      }`}
                    >
                      <div className={`flex items-center gap-2 font-serif font-bold text-xs sm:text-sm ${
                        selectedOption === currentQ.correctAnswerIndex ? 'text-emerald-med' : 'text-amber-800'
                      } ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <Sparkles className="w-4 h-4 text-gold-dark shrink-0" />
                        <span>
                          {selectedOption === currentQ.correctAnswerIndex
                            ? (currentQ.praise[lang] || currentQ.praise.fr)
                            : (lang === 'ar' ? 'محاولة طيبة ! إليك التوضيح الجميل :' : 'Presque ! Découvre cette belle sagesse :')}
                        </span>
                      </div>

                      <p className={`text-xs sm:text-sm text-text-sec font-sans leading-relaxed ${isAr ? 'text-right' : ''}`}>
                        {currentQ.explanation[lang] || currentQ.explanation.fr}
                      </p>

                      <div className={`pt-2 flex ${isAr ? 'justify-start' : 'justify-end'}`}>
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="px-6 py-2.5 rounded-xl bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>
                            {questionIdx < activeModule.questions.length - 1
                              ? (lang === 'ar' ? 'السؤال التالي' : 'Question suivante')
                              : (lang === 'ar' ? 'عرض النتيجة والشارة 🏆' : 'Découvrir ma récompense ! 🏆')}
                          </span>
                          <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            )
          )}

        </div>
      ) : (
        /* DISCOVERY OVERVIEW: TROPHY ROOM & MODULES GRID */
        <div className="space-y-12">
          
          {/* 1. BADGES TROPHY CASE SHOWCASE */}
          <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
              <div>
                <div className={`flex items-center gap-2 mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <Trophy className="w-4 h-4 text-gold-dark" />
                  <span className="text-xs font-mono font-bold uppercase text-gold-dark tracking-wider">
                    {lang === 'ar' ? 'خزانة الكؤوس والشارات' : 'Vitrine des Trophées & Badges'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-ink">
                  {lang === 'ar' ? 'شاراتك الشرفية الستة' : 'Tes Badges d’Honneur'}
                </h3>
              </div>

              {/* Progress counter pill */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-sec font-sans font-medium">
                  {lang === 'ar' ? 'تم الفوز بـ' : 'Progression :'}
                </span>
                <span className="px-3 py-1 rounded-full bg-gold-main/15 text-gold-dark font-mono font-bold text-xs border border-gold-main/30">
                  {unlockedCount} / {totalBadges}
                </span>
              </div>
            </div>

            {/* 6 Badges grid in cabinet rack */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {kidsLearningModules.map((mod) => {
                const isUnlocked = progress.unlockedBadges.includes(mod.badge.id);
                const modProgress = progress.completedModules[mod.id];

                return (
                  <motion.div
                    key={mod.badge.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setInspectedBadge({ badge: mod.badge, progress: modProgress })}
                    className={`relative rounded-2xl p-4 text-center cursor-pointer transition-all border flex flex-col items-center justify-between gap-2.5 ${
                      isUnlocked
                        ? 'bg-gradient-to-b from-white to-gold-main/10 border-gold-main/40 shadow-sm hover:shadow-md'
                        : 'bg-cream-sec/30 border-gray-200/80 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {/* Badge Icon Emblem */}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${
                        isUnlocked
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-white text-white drop-shadow-sm'
                          : 'bg-gray-100 border-gray-200 text-gray-400 grayscale'
                      }`}>
                        {mod.badge.icon}
                      </div>

                      {/* Lock or Checkmark indicator */}
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-white ${
                        isUnlocked ? 'bg-emerald-main text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {isUnlocked ? '✓' : '🔒'}
                      </span>
                    </div>

                    {/* Badge Name */}
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-serif font-bold text-ink line-clamp-1">
                        {mod.badge.name[lang] || mod.badge.name.fr}
                      </h4>
                      <p className="text-[10px] text-text-sec line-clamp-1">
                        {isUnlocked 
                          ? (modProgress ? `⭐ x${modProgress.stars}` : 'Débloqué')
                          : (lang === 'ar' ? 'مقفل' : 'À débloquer')}
                      </p>
                    </div>

                  </motion.div>
                );
              })}
            </div>

          </section>

          {/* 2. LEARNING MODULES GRID */}
          <section className="space-y-6">
            <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
              <div>
                <span className="text-xs font-mono font-bold uppercase text-emerald-med tracking-wider">
                  {lang === 'ar' ? 'المسار التعليمي التفاعلي' : 'Parcours d’Apprentissage'}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-ink mt-1">
                  {lang === 'ar' ? 'اختر موديولاً وابدأ المغامرة' : 'Choisis un Module & Gagne tes Étoiles'}
                </h3>
              </div>
              <p className="text-xs text-text-sec font-sans max-w-sm">
                {lang === 'ar'
                  ? 'كل موديول يحتوي على ٤ أسئلة ممتعة تشرح أساسيات الدين برفق وحب.'
                  : 'Chaque module comprend 4 questions éducatives illustrées avec des explications douces.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kidsLearningModules.map((mod, mIdx) => {
                const modProgress = progress.completedModules[mod.id];
                const isCompleted = !!modProgress;
                const isAllStars = modProgress?.stars === 3;

                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: mIdx * 0.08 }}
                    className={`bg-white rounded-3xl border p-6 flex flex-col justify-between group transition-all relative overflow-hidden ${
                      isCompleted
                        ? 'border-emerald-main/30 shadow-xs hover:shadow-md'
                        : 'border-gray-100 hover:border-gold-main/40 hover:shadow-md'
                    }`}
                  >
                    {/* Top Accent Ribbon */}
                    <div className="space-y-4">
                      
                      {/* Header with icon and stars */}
                      <div className={`flex items-start justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className="w-12 h-12 rounded-2xl bg-cream-main flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-xs">
                          {mod.icon}
                        </div>

                        {/* Stars earned badge */}
                        <div className="flex items-center gap-1 bg-cream-sec px-2.5 py-1 rounded-full border border-gray-100">
                          {[1, 2, 3].map((s) => (
                            <span 
                              key={s} 
                              className={`text-xs ${modProgress && s <= modProgress.stars ? 'text-amber-400' : 'text-gray-300'}`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <div className={`space-y-1 ${isAr ? 'text-right' : 'text-left'}`}>
                        <h4 className="text-base sm:text-lg font-serif font-bold text-ink group-hover:text-gold-dark transition-colors">
                          {mod.title[lang] || mod.title.fr}
                        </h4>
                        <p className="text-xs text-text-sec line-clamp-2 leading-relaxed">
                          {mod.subtitle[lang] || mod.subtitle.fr}
                        </p>
                      </div>

                      {/* Associated Badge Preview */}
                      <div className={`p-3 rounded-2xl bg-cream-main/40 border border-gold-main/20 flex items-center gap-2.5 text-xs ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <span className="text-xl">{mod.badge.icon}</span>
                        <div className="min-w-0">
                          <span className="text-[10px] text-text-sec block">
                            {lang === 'ar' ? 'الشارة المرتبطة :' : 'Badge à gagner :'}
                          </span>
                          <span className="font-bold text-ink truncate block">
                            {mod.badge.name[lang] || mod.badge.name.fr}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Bottom CTA Button */}
                    <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-mono text-text-sec">
                        4 {lang === 'ar' ? 'أسئلة' : 'questions'}
                      </span>

                      <button
                        type="button"
                        onClick={() => startModule(mod)}
                        className={`px-4.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isCompleted
                            ? 'bg-cream-sec hover:bg-gold-main hover:text-ink text-ink border border-gray-200'
                            : 'bg-emerald-main hover:bg-emerald-med text-white'
                        }`}
                      >
                        <span>
                          {isCompleted
                            ? (lang === 'ar' ? 'إعادة المحاولة' : 'Rejouer')
                            : (lang === 'ar' ? 'بدء التعلم ➔' : 'Commencer ➔')}
                        </span>
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </div>

          </section>

        </div>
      )}

      {/* INSPECT BADGE DIALOG */}
      <AnimatePresence>
        {inspectedBadge && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl border-2 border-gold-main/40 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setInspectedBadge(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-ink p-1 rounded-lg"
              >
                ✕
              </button>

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-white mx-auto flex items-center justify-center text-4xl shadow-md border-2 border-white">
                {inspectedBadge.badge.icon}
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-gold-dark tracking-wider">
                  {inspectedBadge.progress ? '✓ Badge Débloqué' : '🔒 Badge à Débloquer'}
                </span>
                <h3 className="text-xl font-serif font-bold text-ink mt-0.5">
                  {inspectedBadge.badge.name[lang] || inspectedBadge.badge.name.fr}
                </h3>
                <p className="text-xs text-text-sec mt-2 leading-relaxed">
                  {inspectedBadge.badge.description[lang] || inspectedBadge.badge.description.fr}
                </p>
              </div>

              <div className="p-3 bg-cream-main/60 rounded-xl border border-gray-100 text-xs">
                <span className="text-text-sec block text-[10px]">Vertu islamique enseignée :</span>
                <span className="font-bold text-emerald-med">
                  {inspectedBadge.badge.virtue[lang] || inspectedBadge.badge.virtue.fr}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setInspectedBadge(null)}
                className="w-full py-2.5 bg-gold-main hover:bg-gold-light text-ink font-bold text-xs rounded-xl shadow-xs"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
