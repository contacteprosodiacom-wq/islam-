import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, HelpCircle, ArrowLeft, RotateCcw, CheckCircle2, AlertCircle, BookOpen, ChevronRight, Activity } from 'lucide-react';
import { Language, Quiz as QuizType, QuizQuestion } from '../types';
import { translations } from '../data/translations';
import { useContentStore } from '../lib/content-store';

interface QuizProps {
  lang: Language;
  preselectedQuizId?: string | null;
}

export default function Quiz({ lang, preselectedQuizId }: QuizProps) {
  const { quizzes: quizList } = useContentStore();
  const t = translations[lang];
  const isAr = lang === 'ar';

  // Game state
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Filter state
  const [activeTab, setActiveTab] = useState<string>('all');

  // Handle deep linking from Home preview
  useEffect(() => {
    if (preselectedQuizId && quizList && quizList.length > 0) {
      const match = quizList.find(q => q.id === preselectedQuizId);
      if (match) {
        startQuiz(match);
      }
    }
  }, [preselectedQuizId, quizList]);

  const startQuiz = (quiz: QuizType) => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return;
    }
    setActiveQuiz(quiz);
    setCurrentIdx(0);
    setSelectedOptIdx(null);
    setHasValidated(false);
    setScore(0);
    setShowResults(false);
  };

  const currentQuestion = activeQuiz?.questions?.[currentIdx];

  const handleSelectOption = (index: number) => {
    if (hasValidated || !currentQuestion) return;
    setSelectedOptIdx(index);
    setHasValidated(true);

    if (index === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOptIdx(null);
    setHasValidated(false);

    if (activeQuiz && currentIdx < activeQuiz.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartActiveQuiz = () => {
    setCurrentIdx(0);
    setSelectedOptIdx(null);
    setHasValidated(false);
    setScore(0);
    setShowResults(false);
  };

  const exitQuizGame = () => {
    setActiveQuiz(null);
  };

  // Filter quizzes by categories
  const filteredQuizList = quizList.filter(q => {
    if (activeTab === 'all') return true;
    return q.category === activeTab;
  });

  const categories = [
    { id: 'all', label: t.filterAll },
    { id: 'piliers', label: lang === 'fr' ? 'Piliers de l\'Islam' : lang === 'en' ? 'Pillars of Islam' : 'أركان الإسلام' },
    { id: 'prophetes', label: lang === 'fr' ? 'Sira & Prophètes' : lang === 'en' ? 'Prophets & Sira' : 'سير الأنبياء والسيرة' },
  ];

  return (
    <div className={`islamic-pattern min-h-screen pb-20 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {/* HEADER SECTION */}
      {!activeQuiz && (
        <section className="bg-ink py-16 text-white border-b border-gold-main/20 relative">
          <div className="absolute inset-0 bg-gold-main/2 opacity-5 select-none font-amiri text-8xl text-center">
            مسابقة دينية
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <HelpCircle className="w-6 h-6 text-gold-light" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              {t.quizSectionTitle}
            </h1>
            <p className="text-xs sm:text-sm text-text-sec max-w-xl mx-auto leading-relaxed">
              {t.quizSectionSubtitle}
            </p>
          </div>
        </section>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ACTIVE GAME FRAMEPLAY PANEL */}
        {activeQuiz ? (
          <div>
            
            {/* Upper game header */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={exitQuizGame}
                className={`py-2 px-3.5 bg-white border border-gray-100 hover:border-gold-main/30 rounded-xl text-xs sm:text-sm font-bold text-emerald-med flex items-center gap-1.5 shadow-sm ${
                  isAr ? 'flex-row-reverse' : ''
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Quitter' : lang === 'en' ? 'Exit' : 'الخروج والقائمة'}</span>
              </button>

              <span className="text-xs font-serif font-bold text-ink uppercase bg-gold-main/15 px-3 py-1 rounded-full">
                {activeQuiz.title[lang]}
              </span>
            </div>

            {showResults ? (
              /* RESULTS SCORE CARD VIEW */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-gold-main/10 rounded-full flex items-center justify-center mx-auto border border-gold-main/30">
                  <Award className="w-10 h-10 text-gold-dark" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                    {t.quizCongrats}
                  </h2>
                  <p className="text-sm text-text-sec font-sans">
                    {t.quizScore} <strong className="text-xl text-emerald-main font-mono">{score} / {activeQuiz.questions.length}</strong>
                  </p>
                </div>

                {/* Progress Circle visual bar */}
                <div className="max-w-[240px] mx-auto bg-cream-main/40 border border-gray-100 rounded-2xl p-4 text-xs text-text-sec leading-relaxed italic">
                  🌿 {lang === 'fr' ? '« Celui qui emprunte un chemin par lequel il recherche une science, Allah lui facilite un chemin vers le Paradis » — Hadith authentique' : lang === 'en' ? '“Whoever takes a path in search of knowledge, Allah will make a path to Paradise easy for him” — Authentic Hadith' : '« مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ »'}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button
                    onClick={restartActiveQuiz}
                    className="px-6 py-3 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t.quizRestart}
                  </button>
                  <button
                    onClick={exitQuizGame}
                    className="px-6 py-3 border border-gray-200 hover:bg-cream-main text-ink font-bold text-sm rounded-xl cursor-pointer transition-all"
                  >
                    {lang === 'fr' ? 'Retourner aux quiz' : lang === 'en' ? 'Back to list' : 'الرجوع ومسابقات أخرى'}
                  </button>
                </div>

              </motion.div>
            ) : (
              /* ACTIVE QUESTION FRAME */
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
                
                {/* Progress bar info header */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-text-sec uppercase font-bold">
                    <span>{lang === 'fr' ? `Question ${currentIdx + 1} sur ${activeQuiz.questions.length}` : lang === 'en' ? `Question ${currentIdx + 1} of ${activeQuiz.questions.length}` : `السؤال ${currentIdx + 1} من أصل ${activeQuiz.questions.length}`}</span>
                    <span>{Math.round(((currentIdx + 1) / activeQuiz.questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-emerald-main rounded-lg transition-all duration-300"
                      style={{ width: `${((currentIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Main Question Label */}
                {currentQuestion && (
                  <div className="bg-cream-main/20 p-5 rounded-2xl border border-gray-50/50">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-ink leading-relaxed">
                      {currentQuestion.question[lang] || currentQuestion.question['fr'] || ''}
                    </h3>
                  </div>
                )}

                {/* 4 Choices list buttons */}
                {currentQuestion && (
                  <div className="grid grid-cols-1 gap-3">
                    {(currentQuestion.options[lang] || currentQuestion.options['fr'] || []).map((opt, oIdx) => {
                      const isSelected = selectedOptIdx === oIdx;
                      const isCorrect = oIdx === currentQuestion.correctAnswerIndex;
                      
                      // Style indicators
                      let layoutStyle = 'bg-white border-gray-100 text-ink hover:border-gold-main/40';
                      let markerBg = 'bg-cream-main text-text-sec';

                      if (hasValidated) {
                        if (isCorrect) {
                          layoutStyle = 'bg-emerald-main/10 border-emerald-med text-emerald-main font-bold';
                          markerBg = 'bg-emerald-main text-white';
                        } else if (isSelected) {
                          layoutStyle = 'bg-red-urge/10 border-red-urge text-red-urge';
                          markerBg = 'bg-red-urge text-white';
                        } else {
                          layoutStyle = 'bg-white border-gray-50 opacity-55 text-gray-400';
                        }
                      } else if (isSelected) {
                        layoutStyle = 'bg-gold-main border-gold-main text-ink';
                        markerBg = 'bg-ink text-gold-main';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(oIdx)}
                          disabled={hasValidated}
                          className={`w-full p-4 rounded-xl border transition-all focus:outline-none flex items-center justify-between gap-4 ${
                            isAr ? 'text-right flex-row-reverse' : 'text-left'
                          } text-xs sm:text-sm ${layoutStyle}`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-[10px] font-bold font-mono flex items-center justify-center flex-shrink-0 ${markerBg}`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="flex-grow">{opt}</span>
                          {hasValidated && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-main flex-shrink-0" />}
                          {hasValidated && !isCorrect && isSelected && <AlertCircle className="w-4 h-4 text-red-urge flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* TAFSIR / HADITH EXPLANATION CARD (SHOWS ONLY AFTER SELECTION) */}
                <AnimatePresence>
                  {hasValidated && currentQuestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-cream-main/50 border border-gold-main/20 p-5 rounded-2xl space-y-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-serif font-bold text-gold-dark">
                        <BookOpen className="w-4 h-4" />
                        <span>{t.quizExplanation}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-text-sec leading-relaxed font-sans">
                        {currentQuestion.explanation[lang] || currentQuestion.explanation['fr'] || ''}
                      </p>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleNext}
                          className="px-5 py-2.5 bg-emerald-main hover:bg-emerald-med text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <span>{t.quizNext}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            )}

          </div>
        ) : (
          /* STANDARD QUIZ DISCOVERING LIST GRID */
          <div className="space-y-8">
            
            {/* Categories filter tabs */}
            <div className={`flex flex-wrap gap-2 justify-center sm:justify-start ${isAr ? 'flex-row-reverse' : ''}`}>
              {categories.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                    activeTab === tab.id
                      ? 'bg-gold-main text-ink font-bold shadow-md'
                      : 'bg-white border border-gray-100 text-text-sec hover:border-gold-main/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quizzes 4x mesh grid cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredQuizList.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => startQuiz(quiz)}
                  className="bg-white border border-gray-100 hover:border-gold-main/40 hover:shadow-xl rounded-2xl p-6 flex flex-col justify-between group transition-all cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-bold">
                      <span className="text-gold-dark bg-gold-main/15 px-2.5 py-0.5 rounded-lg">
                        {quiz.questionsCount} QUESTIONS
                      </span>
                      <span className="text-gray-400 capitalize">
                        {quiz.difficulty === 'debutant' ? t.difficultyEasy : t.difficultyMedium}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-serif font-bold text-ink group-hover:text-emerald-med transition-colors">
                      {quiz.title[lang]}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-sec leading-relaxed font-sans line-clamp-3">
                      {quiz.description[lang]}
                    </p>
                  </div>

                  <div className="border-t border-gray-50 pt-4 mt-6 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-sans uppercase">
                      Cat : {quiz.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startQuiz(quiz);
                      }}
                      className="px-4.5 py-2.5 bg-emerald-main hover:bg-emerald-med text-white rounded-xl text-xs font-bold transition-all"
                    >
                      {t.startQuiz} →
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
