import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Check, Sparkles, Target, Clock } from 'lucide-react';
import { Language } from '../types';

interface QuizProgressBarProps {
  currentIdx: number;
  totalQuestions: number;
  hasValidated: boolean;
  lang: Language;
}

export default function QuizProgressBar({
  currentIdx,
  totalQuestions,
  hasValidated,
  lang
}: QuizProgressBarProps) {
  const isAr = lang === 'ar';
  const currentNumber = currentIdx + 1;
  const remaining = Math.max(0, totalQuestions - currentNumber);
  const progressPercent = Math.min(100, Math.round((currentNumber / totalQuestions) * 100));

  // Formatted remaining questions label
  const getRemainingLabel = () => {
    if (remaining === 0) {
      if (lang === 'ar') return 'السؤال الأخير !';
      if (lang === 'en') return 'Final question!';
      return 'Dernière question !';
    }
    if (remaining === 1) {
      if (lang === 'ar') return 'سؤال واحد متبقٍ';
      if (lang === 'en') return '1 question left';
      return '1 question restante';
    }
    if (lang === 'ar') return `${remaining} أسئلة متبقية`;
    if (lang === 'en') return `${remaining} questions left`;
    return `${remaining} questions restantes`;
  };

  return (
    <div className="w-full space-y-3.5 mb-2">
      
      {/* Top Info Header with Remaining Questions Badge */}
      <div className={`flex flex-wrap items-center justify-between gap-2.5 text-xs font-sans ${isAr ? 'flex-row-reverse' : ''}`}>
        
        {/* Current Question Badge */}
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-emerald-main/10 text-emerald-med flex items-center justify-center font-bold text-xs border border-emerald-main/20">
            {currentNumber}
          </span>
          <span className="font-serif font-bold text-ink sm:text-sm">
            {lang === 'ar'
              ? `السؤال ${currentNumber} من ${totalQuestions}`
              : lang === 'en'
                ? `Question ${currentNumber} of ${totalQuestions}`
                : `Question ${currentNumber} sur ${totalQuestions}`}
          </span>
        </div>

        {/* QUESTIONS RESTANTES PROMINENT BADGE */}
        <div className="flex items-center gap-2">
          <motion.div
            key={remaining}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm border transition-colors ${
              remaining === 0
                ? 'bg-amber-500/15 text-amber-800 border-amber-500/30 font-bold'
                : 'bg-gold-main/15 text-gold-dark border-gold-main/30'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-gold-dark" />
            <span>{getRemainingLabel()}</span>
          </motion.div>

          {/* Percentage badge */}
          <span className="px-2.5 py-1 rounded-full bg-cream-sec text-text-sec font-mono font-bold text-[11px] border border-gray-100">
            {progressPercent}%
          </span>
        </div>

      </div>

      {/* Main Animated Progress Bar Track */}
      <div className="relative w-full h-3 bg-cream-sec/80 border border-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-med via-gold-main to-emerald-light shadow-sm relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Subtle moving light effect across the bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </motion.div>
      </div>

      {/* Step Indicators / Dots preview */}
      <div className={`flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar pb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isUpcoming = idx > currentIdx;

          return (
            <div
              key={idx}
              className={`flex-1 min-w-[20px] max-w-[48px] h-2 rounded-full transition-all duration-300 ${
                isPassed
                  ? 'bg-emerald-main'
                  : isCurrent
                    ? 'bg-gold-main ring-2 ring-gold-main/40 ring-offset-1 animate-pulse'
                    : 'bg-gray-200/80'
              }`}
              title={
                lang === 'ar'
                  ? `السؤال ${idx + 1}`
                  : `Question ${idx + 1}`
              }
            />
          );
        })}
      </div>

    </div>
  );
}
