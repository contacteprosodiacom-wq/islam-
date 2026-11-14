import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, BellOff, BellRing, Check, CheckCircle2, AlertCircle, 
  Volume2, VolumeX, Sparkles, Clock, ShieldCheck, Play, Settings
} from 'lucide-react';
import { Language } from '../types';
import { 
  PrayerNotificationSettings as SettingsType,
  loadNotificationSettings,
  saveNotificationSettings,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  playPrayerChime,
  calculatePrayerTimes,
  prayerCitiesData
} from '../lib/prayer-notification-service';

interface PrayerNotificationSettingsProps {
  lang: Language;
  selectedCity?: string;
  calcMethod?: 'uoif' | 'mwl' | 'egypt';
  onSettingsChange?: (settings: SettingsType) => void;
  className?: string;
}

export default function PrayerNotificationSettings({
  lang,
  selectedCity = 'paris',
  calcMethod = 'mwl',
  onSettingsChange,
  className = ''
}: PrayerNotificationSettingsProps) {
  const [settings, setSettings] = useState<SettingsType>(() => loadNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'success' | 'failed' | null>(null);
  const [isPlayingChime, setIsPlayingChime] = useState(false);

  const isAr = lang === 'ar';

  // Check permission on mount
  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  // Sync city & method into settings if passed from parent
  useEffect(() => {
    setSettings(prev => {
      if (prev.selectedCity !== selectedCity || prev.calcMethod !== calcMethod) {
        const next = { ...prev, selectedCity, calcMethod };
        saveNotificationSettings(next);
        return next;
      }
      return prev;
    });
  }, [selectedCity, calcMethod]);

  // Handle master toggle
  const handleToggleMaster = async () => {
    if (!settings.enabled) {
      // If turning on, check or ask permission
      if (permission !== 'granted') {
        const res = await requestNotificationPermission();
        setPermission(res);
        if (res !== 'granted') {
          return;
        }
      }
    }

    const next = { ...settings, enabled: !settings.enabled };
    setSettings(next);
    saveNotificationSettings(next);
    if (onSettingsChange) onSettingsChange(next);
  };

  // Toggle single prayer
  const handleTogglePrayer = (key: 'fajr' | 'chourouk' | 'dhouhr' | 'asr' | 'maghrib' | 'isha') => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveNotificationSettings(next);
    if (onSettingsChange) onSettingsChange(next);
  };

  // Change advance minutes
  const handleAdvanceChange = (minutes: number) => {
    const next = { ...settings, advanceMinutes: minutes };
    setSettings(next);
    saveNotificationSettings(next);
    if (onSettingsChange) onSettingsChange(next);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(next);
    saveNotificationSettings(next);
    if (onSettingsChange) onSettingsChange(next);
  };

  // Preview sound
  const handleTestSound = () => {
    setIsPlayingChime(true);
    playPrayerChime();
    setTimeout(() => setIsPlayingChime(false), 2000);
  };

  // Send browser test notification
  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestStatus(null);
    const success = await sendTestNotification(lang);
    setPermission(getNotificationPermission());
    setIsTesting(false);
    setTestStatus(success ? 'success' : 'failed');
    setTimeout(() => setTestStatus(null), 4000);
  };

  // Request browser permission explicitly
  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted' && !settings.enabled) {
      const next = { ...settings, enabled: true };
      setSettings(next);
      saveNotificationSettings(next);
      if (onSettingsChange) onSettingsChange(next);
    }
  };

  // Computed prayer times for display in settings
  const currentTimes = calculatePrayerTimes(selectedCity, calcMethod);

  const prayersList: Array<{ key: 'fajr' | 'chourouk' | 'dhouhr' | 'asr' | 'maghrib' | 'isha'; labelFr: string; labelEn: string; labelAr: string; time: string }> = [
    { key: 'fajr', labelFr: 'Fajr (Aube)', labelEn: 'Fajr (Dawn)', labelAr: 'الفجر', time: currentTimes.fajr },
    { key: 'chourouk', labelFr: 'Chourouk (Lever du soleil)', labelEn: 'Sunrise', labelAr: 'الشروق', time: currentTimes.chourouk },
    { key: 'dhouhr', labelFr: 'Dhouhr (Midi)', labelEn: 'Dhuhr (Noon)', labelAr: 'الظهر', time: currentTimes.dhouhr },
    { key: 'asr', labelFr: 'Asr (Après-midi)', labelEn: 'Asr (Afternoon)', labelAr: 'العصر', time: currentTimes.asr },
    { key: 'maghrib', labelFr: 'Maghrib (Coucher)', labelEn: 'Maghrib (Sunset)', labelAr: 'المغرب', time: currentTimes.maghrib },
    { key: 'isha', labelFr: 'Isha (Nuit)', labelEn: 'Isha (Night)', labelAr: 'العشاء', time: currentTimes.isha }
  ];

  const advanceOptions = [
    { value: 0, labelFr: "À l'heure exacte", labelEn: "At exact time", labelAr: "في الوقت المحدد" },
    { value: 5, labelFr: "5 min avant", labelEn: "5 min before", labelAr: "قبل ٥ دقائق" },
    { value: 10, labelFr: "10 min avant", labelEn: "10 min before", labelAr: "قبل ١٠ دقائق" },
    { value: 15, labelFr: "15 min avant", labelEn: "15 min before", labelAr: "قبل ١٥ دقيقة" }
  ];

  return (
    <div className={`rounded-3xl bg-[#120E0A]/90 border border-gold-main/30 text-white p-5 sm:p-7 shadow-2xl backdrop-blur-xl ${className}`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-gold-main/20 text-gold-light border border-gold-main/30">
              <BellRing className="w-4 h-4 text-gold-main" />
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
              {lang === 'ar' ? 'إعدادات تنبيهات الأذان ومواقيت الصلاة' : lang === 'en' ? 'Prayer Times Notification Settings' : 'Rappels & Notifications des Prières'}
            </h3>
          </div>
          <p className="text-xs text-stone-400 font-sans">
            {lang === 'ar'
              ? 'تلقي إشعارات محلية على جهازك عبر المتصفح للتنبيه بدخول أوقات الصلاة'
              : lang === 'en'
                ? 'Receive local browser notifications on your device when prayer times arrive'
                : 'Recevez des alertes locales dans votre navigateur pour ne manquer aucune prière'}
          </p>
        </div>

        {/* MASTER SWITCH */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-stone-300">
            {settings.enabled
              ? (lang === 'ar' ? 'التنبيهات مفعلة' : 'Rappels actifs')
              : (lang === 'ar' ? 'التنبيهات معطلة' : 'Rappels désactivés')}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.enabled}
            onClick={handleToggleMaster}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold-main ${
              settings.enabled ? 'bg-gold-main' : 'bg-white/20'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-ink shadow-lg ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* PERMISSION STATUS BANNER */}
      <div className="mb-6">
        {permission === 'unsupported' ? (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'متصفحك الحالي لا يدعم إشعارات سطح المكتب المحلية.'
                : 'Votre navigateur actuel ne supporte pas les notifications locales du système.'}
            </span>
          </div>
        ) : permission === 'denied' ? (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BellOff className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'تم حظر الإشعارات في إعدادات المتصفح. يرجى النقر على قفل شريط العنوان والسماح بالإشعارات.'
                  : 'Notifications bloquées par votre navigateur. Cliquez sur le cadenas à côté de l\'URL pour autoriser les notifications de ce site.'}
              </span>
            </div>
          </div>
        ) : permission === 'granted' ? (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'إذن الإشعارات مفعّل في المتصفح بنجاح.'
                  : 'Autorisation accordée : Votre navigateur est prêt à envoyer les alertes de prière.'}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full font-bold">
              AUTORISÉ
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-gold-main/10 border border-gold-main/30 text-gold-light text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-main shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'يتطلب المتصفح إذنك لإرسال تنبيهات الصلاة.'
                  : 'Votre autorisation est requise pour afficher les rappels des prières à l\'écran.'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-xl bg-gold-main hover:bg-gold-light text-ink font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-md"
            >
              {lang === 'ar' ? 'سماح بالإشعارات' : 'Autoriser'}
            </button>
          </div>
        )}
      </div>

      {/* DETAILED PRAYERS TOGGLES GRID */}
      <div className="space-y-6">
        
        {/* Step 1: Prayer selection */}
        <div>
          <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-300 mb-3">
            {lang === 'ar' ? '١. اختيار الصلوات المراد التذكير بها :' : '1. Choisir les prières à notifier :'}
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {prayersList.map((p) => {
              const isChecked = settings[p.key];
              return (
                <div
                  key={p.key}
                  onClick={() => handleTogglePrayer(p.key)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isChecked
                      ? 'bg-gradient-to-b from-gold-main/20 via-emerald-950/30 to-black/40 border-gold-main shadow-md'
                      : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-gold-light">
                      {p.time}
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-gold-main text-ink font-bold' : 'bg-white/10 text-transparent'
                    }`}>
                      ✓
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-serif font-bold text-white leading-tight">
                      {lang === 'ar' ? p.labelAr : lang === 'en' ? p.labelEn : p.labelFr.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-stone-400 font-amiri" dir="rtl">
                      {p.labelAr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Reminder Advance Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-white/10">
          
          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-300 mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-main" />
              <span>{lang === 'ar' ? '٢. وقت التذكير بالصلاة :' : '2. Moment du rappel :'}</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {advanceOptions.map((opt) => {
                const isSelected = settings.advanceMinutes === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAdvanceChange(opt.value)}
                    className={`py-2 px-3 rounded-xl border text-xs font-sans transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gold-main text-ink font-bold border-gold-main shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-stone-300 border-white/10'
                    }`}
                  >
                    {lang === 'ar' ? opt.labelAr : lang === 'en' ? opt.labelEn : opt.labelFr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Sound Alert Settings */}
          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-300 mb-2.5 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-gold-main" />
              <span>{lang === 'ar' ? '٣. التنبيه الصوتي (أذان / نغمة هادئة) :' : '3. Signal sonore :'}</span>
            </label>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    settings.soundEnabled ? 'bg-gold-main/20 text-gold-light' : 'bg-white/10 text-stone-400'
                  }`}
                >
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-white">
                    {settings.soundEnabled
                      ? (lang === 'ar' ? 'الصوت مفعّل' : 'Signal sonore actif')
                      : (lang === 'ar' ? 'وضع صامت' : 'Mode silencieux')}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {lang === 'ar' ? 'نغمة هادئة ومريحة' : 'Carillon apaisant sans fichier lourd'}
                  </p>
                </div>
              </div>

              {settings.soundEnabled && (
                <button
                  type="button"
                  onClick={handleTestSound}
                  disabled={isPlayingChime}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Écouter le carillon"
                >
                  <Play className={`w-3 h-3 ${isPlayingChime ? 'animate-spin' : ''}`} />
                  <span>{lang === 'ar' ? 'تجربة' : 'Tester'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION: TEST NOTIFICATION BUTTON */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-main" />
            <span>
              {lang === 'ar'
                ? `المدينة المختارة: ${prayerCitiesData[selectedCity]?.names[lang] || selectedCity}`
                : `Ville configurée : ${prayerCitiesData[selectedCity]?.names[lang] || selectedCity}`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {testStatus === 'success' && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fadeIn">
                <Check className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تم إرسال التنبيه !' : 'Notification envoyée !'}</span>
              </span>
            )}
            {testStatus === 'failed' && (
              <span className="text-xs text-red-400 font-semibold flex items-center gap-1 animate-fadeIn">
                <AlertCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'فشل الإرسال (تحقق من الأذونات)' : 'Échec (vérifiez les permissions)'}</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleTestNotification}
              disabled={isTesting}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-gold-main to-gold-light hover:from-gold-light hover:to-gold-main text-ink font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              <Bell className="w-3.5 h-3.5 fill-current" />
              <span>
                {isTesting
                  ? (lang === 'ar' ? 'جاري الإرسال...' : 'Envoi...')
                  : (lang === 'ar' ? 'إرسال إشعار تجريبي' : 'Tester une notification')}
              </span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
