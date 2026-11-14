import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, Moon, Sparkles, ChevronLeft, ChevronRight, 
  Star, Compass, Clock, CheckCircle2, Info, BookOpen, ArrowRight, Shield
} from 'lucide-react';
import { Language, Route } from '../types';
import { 
  getHijriMonthGrid, 
  getHijriDateFromGregorian, 
  formatGregorianDate, 
  IslamicEvent 
} from '../data/islamic-calendar';

interface HijriCalendarWidgetProps {
  lang: Language;
  onNavigate?: (route: Route, params?: any) => void;
}

export default function HijriCalendarWidget({ lang, onNavigate }: HijriCalendarWidgetProps) {
  // Month navigation offset relative to today (0 = current month)
  const [monthOffset, setMonthOffset] = useState(0);

  // Reference date computed with monthOffset (approx 29.5 days per Hijri month)
  const referenceDate = useMemo(() => {
    const today = new Date();
    if (monthOffset === 0) return today;
    return new Date(today.getTime() + monthOffset * 29.53 * 86400000);
  }, [monthOffset]);

  // Calendar month grid calculation
  const calendarData = useMemo(() => {
    return getHijriMonthGrid(referenceDate);
  }, [referenceDate]);

  // Selected day for the event inspector (defaults to today if viewing current month, or 1st day)
  const todayHijri = useMemo(() => getHijriDateFromGregorian(new Date()), []);
  const isViewingCurrentMonth = calendarData.hijriMonth === todayHijri.month && calendarData.hijriYear === todayHijri.year;

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => {
    return isViewingCurrentMonth ? todayHijri.day : 1;
  });

  // Keep selectedDay within bounds when navigating months
  const activeDayNumber = Math.min(selectedDayNumber, calendarData.days.length || 30);
  const activeDayData = calendarData.days.find(d => d.hijriDay === activeDayNumber) || calendarData.days[0];

  const isAr = lang === 'ar';

  // Weekday abbreviations
  const weekdaysLabels = useMemo(() => {
    if (lang === 'ar') {
      return ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    }
    if (lang === 'en') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }
    return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  }, [lang]);

  // Padding empty cells for the first day of the Hijri month based on Gregorian weekday (0=Sun)
  const firstDayWeekday = calendarData.days[0]?.gregorianDate.getDay() ?? 0;

  // Static text dictionary
  const uiTexts = {
    badge: {
      fr: "CALENDRIER HÉGIRIEN DYNAMIQUE",
      en: "DYNAMIC HIJRI CALENDAR",
      ar: "التقويم الهجري التفاعلي"
    },
    title: {
      fr: "Le Mois Lunaire & ses Temps Forts Spirituels",
      en: "The Lunar Month & Spiritual Milestones",
      ar: "الشهر القمري والمحطات الإيمانية الكبرى"
    },
    subtitle: {
      fr: "Suivez le calendrier islamique officiel en temps réel, les jours de jeûne Sunnah (Jours Blancs, lundis, jeudis) et les grands repères prophétiques.",
      en: "Track the official Islamic calendar in real time, Sunnah fasting days (White Days, Mondays, Thursdays), and great prophetic milestones.",
      ar: "تابع التقويم الإسلامي لحظة بلحظة، وتعرّف على سنن الصيام والأيام البيض والجمعة المباركة وذكريات السيرة العطرة."
    },
    todayBadge: {
      fr: "Aujourd'hui",
      en: "Today",
      ar: "اليوم"
    },
    sacredMonthBadge: {
      fr: "Mois Sacré (حرام)",
      en: "Sacred Month (Haram)",
      ar: "شهر حرام معظّم"
    },
    currentDayDetailsTitle: {
      fr: "Repères & Événements du jour sélectionné",
      en: "Milestones & Events for Selected Day",
      ar: "محطات ومناسبات اليوم المختار"
    },
    whiteDaysNote: {
      fr: "Les Jours Blancs (13, 14, 15) correspondent à la pleine lune : leur jeûne équivaut au jeûne d'une année entière.",
      en: "The White Days (13th, 14th, 15th) correspond to the full moon: fasting them is rewarded like fasting a full year.",
      ar: "صيام الأيام البيض (١٣، ١٤، ١٥) عند اكتمال البدر، وثواب صيامها يعدل صيام الدهر كاملاً."
    },
    eventsInMonthTitle: {
      fr: "Événements & Sunan du mois",
      en: "Month's Events & Sunan",
      ar: "أهم مناسبات وسنن هذا الشهر"
    },
    noEventsToday: {
      fr: "Journée propice aux invocations quotidiennes, au Dhikr du matin et du soir, et à la lecture du Noble Coran.",
      en: "An auspicious day for daily invocations, morning & evening Dhikr, and recitation of the Holy Quran.",
      ar: "يوم مبارك طيب، اغتنمه في أذكار الصباح والمساء وتلاوة القرآن وملازمة الاستغفار."
    },
    prayersCta: {
      fr: "Voir les horaires de prières & Qibla →",
      en: "View Prayer Times & Qibla →",
      ar: "عرض مواقيت الصلاة واتجاه القبلة ←"
    },
    resetToToday: {
      fr: "Mois en cours",
      en: "Current Month",
      ar: "الشهر الحالي"
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-cream-main/70 via-white to-cream-main/40 border-y border-amber-900/10 relative overflow-hidden">
      {/* Motifs arabesques décoratifs en fond */}
      <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />
      <div className="absolute right-0 top-0 w-96 h-96 bg-gold-main/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-emerald-main/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* EN-TÊTE DE SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-main/15 border border-gold-main/30 text-gold-dark text-xs font-semibold tracking-wider uppercase mb-3 shadow-sm">
            <Moon className="w-4 h-4 text-gold-dark" />
            <span>{uiTexts.badge[lang]}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight mb-4">
            {uiTexts.title[lang]}
          </h2>

          <p className="text-sm sm:text-base text-text-sec font-sans leading-relaxed">
            {uiTexts.subtitle[lang]}
          </p>
        </div>

        {/* CONTENEUR PRINCIPAL DU WIDGET */}
        <div className="bg-white rounded-3xl border border-amber-900/15 shadow-xl shadow-amber-950/5 overflow-hidden">
          
          {/* BARRE DE CONTRÔLE ET NAVIGATION DE MOIS */}
          <div className="p-5 sm:p-7 bg-gradient-to-r from-emerald-950 via-ink to-emerald-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-main/30">
            
            {/* Nom du Mois Hégirien & Année */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-main/30 to-emerald-900/40 border border-gold-main/40 flex items-center justify-center text-gold-light shrink-0 shadow-inner">
                <Moon className="w-7 h-7 text-gold-main" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gold-light">
                    {calendarData.monthMeta.name[lang]} {calendarData.hijriYear} <span className="text-sm text-gold-main font-sans">AH</span>
                  </h3>
                  
                  {calendarData.monthMeta.isSacred && (
                    <span className="px-2.5 py-0.5 rounded-full bg-gold-main/20 border border-gold-main/40 text-gold-light text-[10px] font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3 text-gold-main" />
                      <span>{uiTexts.sacredMonthBadge[lang]}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-300 mt-1 font-amiri text-base sm:text-lg opacity-90">
                  {calendarData.monthMeta.arabicSpelling} • {calendarData.days.length} {lang === 'fr' ? 'jours' : lang === 'en' ? 'days' : 'يوماً'}
                </p>
              </div>
            </div>

            {/* Boutons de navigation mois précédent / suivant */}
            <div className="flex items-center gap-2 self-start md:self-center">
              {monthOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMonthOffset(0);
                    setSelectedDayNumber(todayHijri.day);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gold-light text-xs font-medium transition-colors cursor-pointer border border-white/15"
                >
                  {uiTexts.resetToToday[lang]}
                </button>
              )}

              <div className="flex items-center gap-1 bg-black/40 border border-white/15 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMonthOffset(prev => prev - 1);
                    setSelectedDayNumber(1);
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                  title="Mois précédent"
                  aria-label="Mois précédent"
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <span className="px-2 text-xs font-mono text-gold-light font-semibold">
                  {calendarData.hijriMonth}/12
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setMonthOffset(prev => prev + 1);
                    setSelectedDayNumber(1);
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                  title="Mois suivant"
                  aria-label="Mois suivant"
                >
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* BANDEAU DE SIGNIFICATION SPIRITUELLE DU MOIS */}
          <div className="bg-emerald-900/10 border-b border-amber-900/10 px-5 sm:px-7 py-3 text-xs text-stone-700 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-ink font-serif">{calendarData.monthMeta.name[lang]} :</strong> {calendarData.monthMeta.spiritualSignificance[lang]}
            </p>
          </div>

          {/* CORPS : GRILLE CALENDRIER + INSPECTEUR D'ÉVÉNEMENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* GAUCHE (7 cols) : GRILLE MENSUELLE */}
            <div className="lg:col-span-7 p-4 sm:p-6 sm:border-r border-amber-900/10">
              
              {/* En-têtes des jours de la semaine */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">
                {weekdaysLabels.map((wd, i) => (
                  <div 
                    key={i} 
                    className={`py-1.5 rounded-lg ${i === 5 ? 'text-emerald-700 bg-emerald-500/10' : ''}`}
                  >
                    {wd}
                  </div>
                ))}
              </div>

              {/* Grille des jours */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Espaces vides avant le premier jour */}
                {Array.from({ length: firstDayWeekday }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-xl bg-stone-50/50 opacity-40 border border-transparent" />
                ))}

                {/* Boutons des jours du mois hégirien */}
                {calendarData.days.map((dayItem) => {
                  const isSelected = dayItem.hijriDay === activeDayNumber;
                  const hasEvents = dayItem.events.length > 0;
                  const hasMajorEvent = dayItem.events.some(e => e.type === 'major');

                  return (
                    <motion.button
                      key={dayItem.hijriDay}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDayNumber(dayItem.hijriDay)}
                      className={`h-14 sm:h-16 p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all relative cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-br from-gold-main via-gold-light to-amber-200 border-gold-dark text-ink shadow-md scale-[1.02] z-10' 
                          : dayItem.isToday 
                          ? 'bg-emerald-950 text-white border-emerald-600 shadow'
                          : dayItem.isWhiteDay
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/40 text-ink'
                          : dayItem.isJumuah
                          ? 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 text-ink'
                          : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      {/* En-tête de case : Jour Hégirien + Indicateur d'événement */}
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-serif font-bold text-sm sm:text-base leading-none ${
                          isSelected ? 'text-ink' : dayItem.isToday ? 'text-gold-light' : 'text-ink'
                        }`}>
                          {dayItem.hijriDay}
                        </span>

                        {/* Pastille événement */}
                        {hasMajorEvent ? (
                          <span className="w-2 h-2 rounded-full bg-gold-dark ring-2 ring-gold-light" />
                        ) : hasEvents ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        ) : dayItem.isWhiteDay ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        ) : null}
                      </div>

                      {/* Bas de case : Date grégorienne correspondante */}
                      <div className="w-full flex items-center justify-between text-[10px] leading-tight">
                        <span className={`truncate font-mono ${
                          isSelected ? 'text-ink/80 font-semibold' : dayItem.isToday ? 'text-stone-300' : 'text-stone-400'
                        }`}>
                          {dayItem.gregorianDate.getDate()}/{dayItem.gregorianDate.getMonth() + 1}
                        </span>

                        {dayItem.isToday && (
                          <span className="text-[9px] px-1 rounded bg-emerald-500/30 text-emerald-300 font-sans font-semibold">
                            ●
                          </span>
                        )}
                        {dayItem.isWhiteDay && !dayItem.isToday && (
                          <span className="text-[9px] text-amber-700 font-bold" title="Jour Blanc">
                            🌕
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* LÉGENDE RAPIDE */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-600 inline-block" />
                  <span>{uiTexts.todayBadge[lang]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
                  <span>{lang === 'fr' ? 'Jours Blancs (13-15)' : lang === 'en' ? 'White Days' : 'الأيام البيض'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300 inline-block" />
                  <span>{lang === 'fr' ? 'Vendredi (Jumu\'ah)' : lang === 'en' ? 'Friday' : 'الجمعة'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold-dark inline-block" />
                  <span>{lang === 'fr' ? 'Événement majeur' : lang === 'en' ? 'Major Event' : 'حدث إسلامي'}</span>
                </div>
              </div>

            </div>

            {/* DROITE (5 cols) : INSPECTEUR DU JOUR SÉLECTIONNÉ & ÉVÉNEMENTS DU MOIS */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-stone-50/60 flex flex-col justify-between space-y-6">
              
              {/* CARTE D'IDENTITÉ DU JOUR ACTIF */}
              <div className="space-y-4">
                
                <div className="p-4 rounded-2xl bg-white border border-amber-900/15 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      {uiTexts.currentDayDetailsTitle[lang]}
                    </span>
                    {activeDayData.isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold border border-emerald-500/30">
                        {uiTexts.todayBadge[lang]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-ink">
                      {activeDayData.hijriDay} {calendarData.monthMeta.name[lang]} {calendarData.hijriYear}
                    </span>
                  </div>

                  {/* Date grégorienne équivalente */}
                  <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-100/70 p-2.5 rounded-xl border border-stone-200/60">
                    <CalendarIcon className="w-4 h-4 text-gold-dark shrink-0" />
                    <span className="font-medium capitalize">
                      {formatGregorianDate(activeDayData.gregorianDate, lang)}
                    </span>
                  </div>
                </div>

                {/* ÉVÉNEMENTS ASSOCIÉS AU JOUR CHOISI */}
                <div className="space-y-2.5">
                  <AnimatePresence mode="wait">
                    {activeDayData.events.length > 0 ? (
                      activeDayData.events.map((ev) => (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className={`p-4 rounded-2xl border transition-all ${
                            ev.type === 'major'
                              ? 'bg-gradient-to-br from-gold-main/15 via-white to-amber-500/10 border-gold-main/40 shadow-sm'
                              : ev.isJumuah
                              ? 'bg-emerald-50/80 border-emerald-300'
                              : 'bg-white border-amber-900/10'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h4 className="font-serif font-bold text-sm text-ink flex items-center gap-1.5">
                              {ev.type === 'major' ? (
                                <Star className="w-4 h-4 text-gold-dark fill-gold-main/30 shrink-0" />
                              ) : ev.isJumuah ? (
                                <Moon className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                              )}
                              <span>{ev.name[lang]}</span>
                            </h4>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              ev.type === 'major'
                                ? 'bg-gold-main/30 text-amber-950 border border-gold-main/50'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {ev.badge[lang]}
                            </span>
                          </div>

                          <p className="text-xs text-text-sec leading-relaxed font-sans">
                            {ev.description[lang]}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      /* Aucun événement spécifique ce jour-là */
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-600 space-y-2"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{lang === 'fr' ? 'Journée de constance et de foi' : lang === 'en' ? 'Day of devotion' : 'يوم ذكر وبركة'}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-relaxed">
                          {uiTexts.noEventsToday[lang]}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* RAPPEL SUR LES JOURS BLANCS */}
                {activeDayData.isWhiteDay && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      {uiTexts.whiteDaysNote[lang]}
                    </p>
                  </div>
                )}

              </div>

              {/* LISTE RÉCAPITULATIVE DES GRANDS ÉVÉNEMENTS DU MOIS EN COURS */}
              <div className="pt-4 border-t border-stone-200/80 space-y-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  {uiTexts.eventsInMonthTitle[lang]}
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {calendarData.allMonthEvents.map(({ hijriDay, events }) => {
                    const firstEv = events[0];
                    if (!firstEv) return null;

                    return (
                      <button
                        key={`${hijriDay}-${firstEv.id}`}
                        type="button"
                        onClick={() => setSelectedDayNumber(hijriDay)}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                          hijriDay === activeDayNumber
                            ? 'bg-gold-main/20 border-gold-main/50 font-bold text-ink'
                            : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center font-serif font-bold text-xs shrink-0 text-ink">
                            {hijriDay}
                          </span>
                          <span className="truncate">{firstEv.name[lang]}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">
                          {calendarData.days.find(d => d.hijriDay === hijriDay)?.gregorianDate.getDate()}/{calendarData.days.find(d => d.hijriDay === hijriDay)?.gregorianDate.getMonth() + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* LIEN VERS LES PRIÈRES & LA QIBLA */}
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('prayers')}
                    className="w-full mt-2 py-2.5 px-3 rounded-xl bg-ink hover:bg-emerald-950 text-gold-light text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5 text-gold-main" />
                    <span>{uiTexts.prayersCta[lang]}</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
