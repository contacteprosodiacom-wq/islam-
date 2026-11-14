import { Language } from '../types';

export interface PrayerNotificationSettings {
  enabled: boolean;
  fajr: boolean;
  chourouk: boolean;
  dhouhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  advanceMinutes: number; // 0, 5, 10, 15
  soundEnabled: boolean;
  selectedCity: string;
  calcMethod: 'uoif' | 'mwl' | 'egypt';
  lastNotifiedKey?: string; // e.g., "Fajr_2026-11-06_at_0" to prevent duplicate alerts
}

export const defaultNotificationSettings: PrayerNotificationSettings = {
  enabled: false,
  fajr: true,
  chourouk: false,
  dhouhr: true,
  asr: true,
  maghrib: true,
  isha: true,
  advanceMinutes: 0,
  soundEnabled: true,
  selectedCity: 'paris',
  calcMethod: 'mwl'
};

export const prayerCitiesData: Record<string, { lat: number; lng: number; timezone: number; country: string; names: Record<Language, string> }> = {
  mecca: { lat: 21.4225, lng: 39.8262, timezone: 3, country: "Saudi Arabia", names: { fr: "La Mecque", en: "Mecca", ar: "مكة المكرمة" } },
  paris: { lat: 48.8566, lng: 2.3522, timezone: 2, country: "France", names: { fr: "Paris", en: "Paris", ar: "باريس" } },
  brussels: { lat: 50.8503, lng: 4.3517, timezone: 2, country: "Belgium", names: { fr: "Bruxelles", en: "Brussels", ar: "بروكسل" } },
  london: { lat: 51.5074, lng: -0.1278, timezone: 1, country: "UK", names: { fr: "Londres", en: "London", ar: "لندن" } },
  casablanca: { lat: 33.5731, lng: -7.5898, timezone: 1, country: "Morocco", names: { fr: "Casablanca", en: "Casablanca", ar: "الدار البيضاء" } },
  dakar: { lat: 14.7167, lng: -17.4677, timezone: 0, country: "Senegal", names: { fr: "Dakar", en: "Dakar", ar: "داكار" } },
  montreal: { lat: 45.5017, lng: -73.5673, timezone: -4, country: "Canada", names: { fr: "Montréal", en: "Montreal", ar: "مونتريال" } }
};

export const calculatePrayerTimes = (cityId: string, method: string = 'mwl') => {
  const city = prayerCitiesData[cityId] || prayerCitiesData.paris;
  
  const latFactor = city.lat / 10;
  const lngFactor = city.lng / 15;
  const methodOffset = method === 'uoif' ? -15 : method === 'egypt' ? 5 : 0;

  const baseFajrMinutes = 300 + Math.round(latFactor * 10) + methodOffset;
  const baseChouroukMinutes = baseFajrMinutes + 90;
  const baseDhouhrMinutes = 750 + Math.round(lngFactor * 4);
  const baseAsrMinutes = baseDhouhrMinutes + 220 + Math.round(latFactor * 5);
  const baseMaghribMinutes = baseDhouhrMinutes + 430 - Math.round(latFactor * 8);
  const baseIshaMinutes = baseMaghribMinutes + 90 - methodOffset;

  const formatMinutes = (totalMin: number) => {
    let min = Math.round(totalMin) % 1440;
    if (min < 0) min += 1440;
    const hours = String(Math.floor(min / 60)).padStart(2, '0');
    const mins = String(min % 60).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  return {
    fajr: formatMinutes(baseFajrMinutes),
    chourouk: formatMinutes(baseChouroukMinutes),
    dhouhr: formatMinutes(baseDhouhrMinutes),
    asr: formatMinutes(baseAsrMinutes),
    maghrib: formatMinutes(baseMaghribMinutes),
    isha: formatMinutes(baseIshaMinutes)
  };
};

const STORAGE_KEY = 'prayer_notifications_settings_v1';

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
};

export const loadNotificationSettings = (): PrayerNotificationSettings => {
  if (typeof window === 'undefined') return defaultNotificationSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultNotificationSettings, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load prayer notification settings:', e);
  }
  return defaultNotificationSettings;
};

export const saveNotificationSettings = (settings: PrayerNotificationSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save prayer notification settings:', e);
  }
};

/**
 * Gentle and harmonic Islamic alert chime using Web Audio API
 * No external file dependencies, zero network latency, 100% reliable.
 */
export const playPrayerChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic chord (F4 - A4 - C5 - F5) with soothing bell envelopes
    const frequencies = [349.23, 440.0, 523.25, 698.46];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.9);
    });
  } catch (err) {
    console.log('Audio chime synthesis error:', err);
  }
};

/**
 * Triggers a browser test notification to confirm setup
 */
export const sendTestNotification = async (lang: Language = 'fr'): Promise<boolean> => {
  if (!isNotificationSupported()) {
    return false;
  }

  let permission: NotificationPermission | 'unsupported' = Notification.permission;
  if (permission !== 'granted') {
    permission = await requestNotificationPermission();
  }

  if (permission !== 'granted') {
    return false;
  }

  playPrayerChime();

  const title = lang === 'ar'
    ? '🕌 تذكير مواقيت الصلاة (اختبار ناجح)'
    : lang === 'en'
      ? '🕌 Prayer Times Reminder (Test Successful)'
      : '🕌 Rappel des Heures de Prière (Test réussi)';

  const body = lang === 'ar'
    ? 'تم تفعيل التنبيهات بنجاح. ستتلقى تذكيراً عند حلول مواقيت الصلاة المحددة.'
    : lang === 'en'
      ? 'Notifications successfully enabled! You will be reminded when prayer times arrive.'
      : 'Les notifications sont bien activées ! Vous recevrez un rappel aux heures de prière choisies.';

  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'prayer-test-notification',
      silent: false
    });
    return true;
  } catch (e) {
    console.warn('Notification constructor failed:', e);
    return false;
  }
};

/**
 * Checks current time against prayer times and triggers notifications if due
 */
export const checkPrayerNotifications = (
  settings: PrayerNotificationSettings,
  lang: Language = 'fr'
): void => {
  if (!settings.enabled || !isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  const times = calculatePrayerTimes(settings.selectedCity, settings.calcMethod);
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMin = currentHours * 60 + currentMinutes;
  const todayDateStr = now.toISOString().split('T')[0];

  const prayers: Array<{ key: keyof PrayerNotificationSettings; nameFr: string; nameEn: string; nameAr: string; timeStr: string }> = [
    { key: 'fajr', nameFr: 'Fajr (Aube)', nameEn: 'Fajr (Dawn)', nameAr: 'صلاة الفجر', timeStr: times.fajr },
    { key: 'chourouk', nameFr: 'Chourouk (Lever du soleil)', nameEn: 'Sunrise', nameAr: 'الشروق', timeStr: times.chourouk },
    { key: 'dhouhr', nameFr: 'Dhouhr (Midi)', nameEn: 'Dhuhr (Noon)', nameAr: 'صلاة الظهر', timeStr: times.dhouhr },
    { key: 'asr', nameFr: 'Asr (Après-midi)', nameEn: 'Asr (Afternoon)', nameAr: 'صلاة العصر', timeStr: times.asr },
    { key: 'maghrib', nameFr: 'Maghrib (Coucher du soleil)', nameEn: 'Maghrib (Sunset)', nameAr: 'صلاة المغرب', timeStr: times.maghrib },
    { key: 'isha', nameFr: 'Isha (Nuit)', nameEn: 'Isha (Night)', nameAr: 'صلاة العشاء', timeStr: times.isha }
  ];

  for (const p of prayers) {
    // Only check if user enabled this specific prayer
    if (!settings[p.key]) continue;

    const [h, m] = p.timeStr.split(':').map(Number);
    const prayerTotalMin = h * 60 + m;
    const targetMin = prayerTotalMin - settings.advanceMinutes;

    // Is it time? (exact minute match)
    if (currentTotalMin === targetMin) {
      const notificationTagKey = `${p.key}_${todayDateStr}_advance_${settings.advanceMinutes}`;

      if (settings.lastNotifiedKey === notificationTagKey) {
        continue; // Already notified for this exact prayer time today
      }

      // Mark notified
      settings.lastNotifiedKey = notificationTagKey;
      saveNotificationSettings(settings);

      // Play chime if enabled
      if (settings.soundEnabled) {
        playPrayerChime();
      }

      // Compose message
      const isAdvance = settings.advanceMinutes > 0;
      let title = '';
      let body = '';

      if (lang === 'ar') {
        title = isAdvance
          ? `⏳ اقتراب ${p.nameAr} (${settings.advanceMinutes} دقائق)`
          : `🕌 حان الآن وقت ${p.nameAr} (${p.timeStr})`;
        body = `حي على الصلاة، حي على الفلاح. تقبل الله منا ومنكم صالح الأعمال.`;
      } else if (lang === 'en') {
        title = isAdvance
          ? `⏳ ${p.nameEn} prayer in ${settings.advanceMinutes} minutes`
          : `🕌 It is now time for ${p.nameEn} (${p.timeStr})`;
        body = `Hayya 'ala-s-Salah. May Allah accept our prayers and righteous deeds.`;
      } else {
        title = isAdvance
          ? `⏳ Prière de ${p.nameFr} dans ${settings.advanceMinutes} minutes`
          : `🕌 C'est l'heure de la prière de ${p.nameFr} (${p.timeStr})`;
        body = `Accourez à la prière, accourez au succès. Qu'Allah accepte nos prières.`;
      }

      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: notificationTagKey,
          silent: false
        });
      } catch (err) {
        console.warn('Failed to fire prayer notification:', err);
      }
    }
  }
};
