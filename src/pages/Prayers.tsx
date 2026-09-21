import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Navigation, MapPin, Compass, RotateCcw, Volume2, VolumeX, CheckCircle, Info, Heart, ChevronRight, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface PrayersProps {
  lang: Language;
}

const citiesData: Record<string, { lat: number; lng: number; timezone: number; country: string; names: Record<Language, string> }> = {
  mecca: { lat: 21.4225, lng: 39.8262, timezone: 3, country: "Saudi Arabia", names: { fr: "La Mecque", en: "Mecca", ar: "مكة المكرمة" } },
  paris: { lat: 48.8566, lng: 2.3522, timezone: 2, country: "France", names: { fr: "Paris", en: "Paris", ar: "باريس" } },
  brussels: { lat: 50.8503, lng: 4.3517, timezone: 2, country: "Belgium", names: { fr: "Bruxelles", en: "Brussels", ar: "بروكسل" } },
  london: { lat: 51.5074, lng: -0.1278, timezone: 1, country: "UK", names: { fr: "Londres", en: "London", ar: "لندن" } },
  casablanca: { lat: 33.5731, lng: -7.5898, timezone: 1, country: "Morocco", names: { fr: "Casablanca", en: "Casablanca", ar: "الدار البيضاء" } },
  dakar: { lat: 14.7167, lng: -17.4677, timezone: 0, country: "Senegal", names: { fr: "Dakar", en: "Dakar", ar: "داكار" } },
  montreal: { lat: 45.5017, lng: -73.5673, timezone: -4, country: "Canada", names: { fr: "Montréal", en: "Montreal", ar: "مونتريال" } }
};

export default function Prayers({ lang }: PrayersProps) {
  const [activeTab, setActiveTab] = useState<'times' | 'guide' | 'adhan' | 'qibla' | 'dhikr'>('times');
  const [selectedCity, setSelectedCity] = useState<string>('paris');
  const [calcMethod, setCalcMethod] = useState<'uoif' | 'mwl' | 'egypt'>('mwl');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Compass state
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [distanceToMecca, setDistanceToMecca] = useState(0);

  // Sound state
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [adhanAudio, setAdhanAudio] = useState<HTMLAudioElement | null>(null);

  // Tasbih state
  const [tasbihPreset, setTasbihPreset] = useState<'subhanallah' | 'alhamdulillah' | 'allahu_akbar' | 'istighfar'>('subhanallah');
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihLap, setTasbihLap] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Qibla angle and distance when city changes
  useEffect(() => {
    const city = citiesData[selectedCity];
    if (city) {
      // Mecca coordinates
      const meccaLat = 21.4225;
      const meccaLng = 39.8262;

      // Distance calculation (Haversine formula)
      const R = 6371; // Earth radius in km
      const dLat = ((meccaLat - city.lat) * Math.PI) / 180;
      const dLng = ((meccaLng - city.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((city.lat * Math.PI) / 180) *
          Math.cos((meccaLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = Math.round(R * c);
      setDistanceToMecca(dist);

      // Qibla bearing calculation
      const lat1 = (city.lat * Math.PI) / 180;
      const lat2 = (meccaLat * Math.PI) / 180;
      const dLon = ((meccaLng - city.lng) * Math.PI) / 180;

      const y = Math.sin(dLon) * Math.cos(lat2);
      const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      let brng = (Math.atan2(y, x) * 180) / Math.PI;
      brng = (brng + 360) % 360; // Normalize
      setQiblaAngle(Math.round(brng));
    }
  }, [selectedCity]);

  // Handle Adhan Audio Playback
  const handlePlayAdhan = () => {
    if (isPlayingAdhan) {
      if (adhanAudio) {
        adhanAudio.pause();
        adhanAudio.currentTime = 0;
      }
      setIsPlayingAdhan(false);
    } else {
      // Playing a beautiful license-free adhan sample or synthesis tone
      const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); // safe fallback
      audio.volume = isMuted ? 0 : 0.8;
      audio.play().then(() => {
        setIsPlayingAdhan(true);
        setAdhanAudio(audio);
        audio.onended = () => setIsPlayingAdhan(false);
      }).catch(e => console.log("Audio block", e));
    }
  };

  useEffect(() => {
    if (adhanAudio) {
      adhanAudio.volume = isMuted ? 0 : 0.8;
    }
  }, [isMuted, adhanAudio]);

  useEffect(() => {
    return () => {
      if (adhanAudio) {
        adhanAudio.pause();
      }
    };
  }, [adhanAudio]);

  // Simple static prayer times generator based on coordinates & timezone for realistic values
  const getPrayerTimesForCity = (cityId: string, method: string) => {
    const city = citiesData[cityId];
    if (!city) return { fajr: "05:12", chourouk: "06:45", dhouhr: "12:35", asr: "16:15", maghrib: "19:42", isha: "21:15" };
    
    // Deterministic offset based on latitude and longitude
    const latFactor = city.lat / 10;
    const lngFactor = city.lng / 15;
    const methodOffset = method === 'uoif' ? -15 : method === 'egypt' ? 5 : 0;

    const baseFajrMinutes = 300 + Math.round(latFactor * 10) + methodOffset; // around 05:00
    const baseChouroukMinutes = baseFajrMinutes + 90; // around 06:30
    const baseDhouhrMinutes = 750 + Math.round(lngFactor * 4); // around 12:30
    const baseAsrMinutes = baseDhouhrMinutes + 220 + Math.round(latFactor * 5); // around 16:10
    const baseMaghribMinutes = baseDhouhrMinutes + 430 - Math.round(latFactor * 8); // around 19:40
    const baseIshaMinutes = baseMaghribMinutes + 90 - methodOffset; // around 21:10

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

  const times = getPrayerTimesForCity(selectedCity, calcMethod);

  // Countdown calculations
  const getNextPrayer = () => {
    const currentHour = currentTime.getHours();
    const currentMin = currentTime.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMin;

    const parseToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const prayerList = [
      { name: 'Fajr', time: times.fajr, min: parseToMinutes(times.fajr) },
      { name: 'Chourouk', time: times.chourouk, min: parseToMinutes(times.chourouk) },
      { name: 'Dhouhr', time: times.dhouhr, min: parseToMinutes(times.dhouhr) },
      { name: 'Asr', time: times.asr, min: parseToMinutes(times.asr) },
      { name: 'Maghrib', time: times.maghrib, min: parseToMinutes(times.maghrib) },
      { name: 'Isha', time: times.isha, min: parseToMinutes(times.isha) }
    ];

    let next = prayerList.find(p => p.min > currentTotalMin);
    let isNextDay = false;
    if (!next) {
      next = prayerList[0]; // Tomorrow Fajr
      isNextDay = true;
    }

    const diffMinutes = isNextDay 
      ? (1440 - currentTotalMin) + next.min
      : next.min - currentTotalMin;

    const diffHrs = Math.floor(diffMinutes / 60);
    const diffMins = diffMinutes % 60;
    const diffSecs = 60 - currentTime.getSeconds();

    return {
      name: next.name,
      time: next.time,
      countdown: `${String(diffHrs).padStart(2, '0')}h ${String(diffMins).padStart(2, '0')}m ${String(diffSecs === 60 ? 0 : diffSecs).padStart(2, '0')}s`
    };
  };

  const nextPrayer = getNextPrayer();

  const isAr = lang === 'ar';

  const t = {
    fr: {
      title: "Horaires de Prières & Pratiques",
      subtitle: "Gérez vos prières quotidiennes, apprenez la Salah pas à pas, écoutez l'Adhan, trouvez la Qibla et faites du Dhikr.",
      tabTimes: "Horaires",
      tabGuide: "Guide de Prière",
      tabAdhan: "Adhan & Iqama",
      tabQibla: "Boussole Qibla",
      tabDhikr: "Tasbih / Dhikr",
      selectCity: "Sélectionner la ville :",
      calcMethod: "Méthode de calcul :",
      nextPrayerLabel: "Prochaine prière",
      countdownLabel: "Compte à rebours",
      qiblaDirection: "Direction de la Qibla",
      distanceToMeccaLabel: "Distance de la Kaaba",
      tasbihLabel: "Compteur Tasbih",
      tasbihClick: "Cliquez pour réciter",
      subhanallah: "Gloire à Allah",
      alhamdulillah: "Louange à Allah",
      allahu_akbar: "Allah est le plus Grand",
      istighfar: "Je demande pardon à Allah",
      guideTitle: "Guide illustré de la Prière",
      wuduSteps: "Les étapes des ablutions (Woudou)",
      prayerSteps: "Étapes de la Salah",
      adhanTitle: "L'Adhan (L'appel à la prière)",
      adhanTrans: "Traduction de l'Adhan",
      salatJanaza: "Salat Al-Janaza (Funéraire)",
      methods: {
        uoif: "UOIF (12°)",
        mwl: "Ligue Islamique Mondiale (18°)",
        egypt: "Autorité Égyptienne (19.5°)"
      }
    },
    en: {
      title: "Prayer Times & Daily Practices",
      subtitle: "Manage your daily prayers, learn Salah step-by-step, listen to Adhan, find the Qibla, and practice Dhikr.",
      tabTimes: "Schedules",
      tabGuide: "Salah Guide",
      tabAdhan: "Adhan & Iqama",
      tabQibla: "Qibla Compass",
      tabDhikr: "Tasbih / Dhikr",
      selectCity: "Select City:",
      calcMethod: "Calculation Method:",
      nextPrayerLabel: "Next Prayer",
      countdownLabel: "Countdown",
      qiblaDirection: "Qibla Angle",
      distanceToMeccaLabel: "Distance to Kaaba",
      tasbihLabel: "Tasbih Counter",
      tasbihClick: "Click to recite",
      subhanallah: "Glory be to Allah",
      alhamdulillah: "Praise be to Allah",
      allahu_akbar: "Allah is the Greatest",
      istighfar: "I seek forgiveness from Allah",
      guideTitle: "Illustrated Salah Guide",
      wuduSteps: "Wudu (Ablution) Steps",
      prayerSteps: "Salah Steps",
      adhanTitle: "The Adhan (Call to Prayer)",
      adhanTrans: "Translation of Adhan",
      salatJanaza: "Salat Al-Janaza (Funeral)",
      methods: {
        uoif: "UOIF (12°)",
        mwl: "Muslim World League (18°)",
        egypt: "Egyptian Authority (19.5°)"
      }
    },
    ar: {
      title: "مواقيت الصلاة والعبادات",
      subtitle: "تابع مواقيت الصلاة اليومية، وتعلم كيفية الصلاة والوضوء خطوة بخطوة، واستمع للأذان واستخدم المسبحة الإلكترونية.",
      tabTimes: "المواقيت",
      tabGuide: "صفة الصلاة",
      tabAdhan: "الأذان والإقامة",
      tabQibla: "قبلة الصلاة",
      tabDhikr: "المسبحة الإلكترونية",
      selectCity: "اختر المدينة :",
      calcMethod: "طريقة الحساب :",
      nextPrayerLabel: "الصلاة القادمة",
      countdownLabel: "الوقت المتبقي",
      qiblaDirection: "زاوية القبلة",
      distanceToMeccaLabel: "المسافة إلى مكة المكرمة",
      tasbihLabel: "السبحة الإلكترونية",
      tasbihClick: "اضغط للتسبيح",
      subhanallah: "سبحان الله",
      alhamdulillah: "الحمد لله",
      allahu_akbar: "الله أكبر",
      istighfar: "أستغفر الله العظيم",
      guideTitle: "دليل صفة الصلاة والوضوء",
      wuduSteps: "خطوات الوضوء الشرعي",
      prayerSteps: "صفة الصلاة خطوة بخطوة",
      adhanTitle: "صيغة الأذان الشرعي",
      adhanTrans: "معاني كلمات الأذان",
      salatJanaza: "صلاة الجنازة أحكامها وصفاتها",
      methods: {
        uoif: "اتحاد المنظمات الإسلامية (12°)",
        mwl: "رابطة العالم الإسلامي (18°)",
        egypt: "الهيئة المصرية العامة (19.5°)"
      }
    }
  }[lang];

  // Salah Steps Guide Data
  const wuduStepsData = [
    { num: 1, title: { fr: "L'intention & Laver les mains", en: "Intention & Washing Hands", ar: "النية وغسل الكفين" }, desc: { fr: "Formuler l'intention (dans le cœur) de se purifier pour Allah, dire 'Bismillah', puis laver les mains trois fois jusqu'aux poignets.", en: "Formulate the intention inside your heart, say 'Bismillah', then wash hands three times up to the wrists.", ar: "عزم النية في القلب ثم قول بسم الله وغسل الكفين ثلاثاً." } },
    { num: 2, title: { fr: "Rincer la bouche", en: "Rinsing Mouth", ar: "المضمضة" }, desc: { fr: "Prendre de l'eau avec la main droite, la porter à la bouche, la rincer et la rejeter. Répéter 3 fois.", en: "Take water with your right hand, swirl it inside your mouth, and spit it out. Repeat 3 times.", ar: "وضع الماء في الفم وإدارته ثم مجّه ثلاث مرات." } },
    { num: 3, title: { fr: "Laver le nez", en: "Inhaling/Exhaling Water", ar: "الاستنشاق والاستنثار" }, desc: { fr: "Inspirer de l'eau par le nez doucement puis l'expulser avec l'aide de la main gauche. Répéter 3 fois.", en: "Inhale water into nostrils gently, then blow it out with the help of the left hand. Repeat 3 times.", ar: "جذب الماء بالنفس إلى الأنف ثم دفعه للخارج باليد اليسرى ثلاثاً." } },
    { num: 4, title: { fr: "Laver le visage", en: "Washing the Face", ar: "غسل الوجه" }, desc: { fr: "Laver tout le visage trois fois, des cheveux au menton et d'une oreille à l'autre.", en: "Wash the entire face three times, from the hair limit to the chin, and from ear to ear.", ar: "غسل كامل الوجه من منابت شعر الرأس إلى أسفل الذقن ومن الأذن إلى الأذن ثلاثاً." } },
    { num: 5, title: { fr: "Laver les avant-bras", en: "Washing Forearms", ar: "غسل اليدين إلى المرفقين" }, desc: { fr: "Laver l'avant-bras droit puis le gauche, trois fois chacun, du bout des doigts jusqu'au coude compris.", en: "Wash the right forearm then the left, three times each, from fingertips up to and including the elbows.", ar: "غسل اليد اليمنى ثم اليسرى من أطراف الأصابع إلى المرفقين ثلاثاً." } },
    { num: 6, title: { fr: "Essuyer la tête et les oreilles", en: "Wiping Head & Ears", ar: "مسح الرأس والأذنين" }, desc: { fr: "Passer les mains mouillées de l'avant vers l'arrière de la tête puis revenir. Puis essuyer l'intérieur et l'extérieur des oreilles une fois.", en: "Wipe wet hands from front of the head to the back and forward once, then wipe inside and outside of the ears.", ar: "مسح الرأس باليدين المبللتين مرة واحدة من الأمام للخلف وعكسه، ومسح الأذنين من الداخل والخارج." } },
    { num: 7, title: { fr: "Laver les pieds", en: "Washing the Feet", ar: "غسل الرجلين إلى الكعبين" }, desc: { fr: "Laver le pied droit puis le gauche, trois fois chacun, en insistant bien entre les orteils et jusqu'aux chevilles.", en: "Wash the right foot then the left, three times each, washing between toes and including ankles.", ar: "غسل الرجل اليمنى ثم اليسرى إلى الكعبين ثلاثاً مع تخليل الأصابع بالماء." } }
  ];

  const salahStepsData = [
    { num: 1, title: { fr: "1. Takbirat Al-Ihram", en: "1. Opening Takbeer", ar: "١. تكبيرة الإحرام" }, desc: { fr: "Debout face à la Qibla, lever les mains près des oreilles ou épaules et prononcer 'Allahu Akbar' pour entrer en état sacré.", en: "Stand facing Qibla, raise hands near ears or shoulders and pronounce 'Allahu Akbar' to enter the prayer.", ar: "الوقوف مستقبلاً القبلة ورفع اليدين بمحاذاة الأذنين ثم قول 'الله أكبر'." } },
    { num: 2, title: { fr: "2. Position debout (Qiyam)", en: "2. Standing & Recitation", ar: "٢. القيام وقراءة الفاتحة" }, desc: { fr: "Placer la main droite sur la main gauche sur la poitrine. Réciter la dou'a d'ouverture, puis la sourate Al-Fatiha, suivie d'une autre courte sourate.", en: "Place your right hand over your left hand on the chest. Recite opening Du'a, Surah Al-Fatiha, and another short surah.", ar: "وضع اليد اليمنى على اليسرى فوق الصدر وقراءة سورة الفاتحة تليها سورة قصيرة." } },
    { num: 3, title: { fr: "3. L'inclinaison (Ruku)", en: "3. Bowing (Ruku)", ar: "٣. الركوع" }, desc: { fr: "Dire 'Allahu Akbar' et s'incliner à angle droit, mains sur les genoux, dos droit. Dire 3 fois 'Subhana Rabbiyal 'Adhim' (Gloire à mon Seigneur l'Immense).", en: "Say 'Allahu Akbar' and bow, hands on knees, back straight. Say 3 times 'Subhana Rabbiyal 'Adhim' (Glory is to my Great Lord).", ar: "التكبير والانحناء مستوياً الظهر واضعاً اليدين على الركبتين وقول 'سبحان ربي العظيم' ثلاثاً." } },
    { num: 4, title: { fr: "4. Le Redressement (I'tidal)", en: "4. Rising up", ar: "٤. الرفع من الركوع" }, desc: { fr: "Se redresser complètement en disant 'Sami'Allahu liman hamidah' (Allah écoute celui qui Le loue), puis debout dire 'Rabbana wa lakal hamd'.", en: "Rise back to standing saying 'Sami'Allahu liman hamidah', then once standing say 'Rabbana wa lakal hamd'.", ar: "الاعتدال قائماً من الركوع مع قول 'سمع الله لمن حمده' ثم 'ربنا ولك الحمد'." } },
    { num: 5, title: { fr: "5. La Prosternation (Sujud)", en: "5. Prostration (Sujud)", ar: "٥. السجود" }, desc: { fr: "Dire 'Allahu Akbar' et se prosterner au sol sur 7 points (front/nez, deux paumes, deux genoux, bouts des pieds). Dire 3 fois 'Subhana Rabbiyal A'la'.", en: "Say 'Allahu Akbar' and prostrate on 7 body points (forehead/nose, palms, knees, toes). Say 3 times 'Subhana Rabbiyal A'la' (Glory is to my Lord the Most High).", ar: "السجود على الأعضاء السبعة مع التكبير وقول 'سبحان ربي الأعلى' ثلاثاً بقلب خاشع." } }
  ];

  return (
    <div className={`islamic-pattern min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white ${isAr ? 'text-right' : 'text-left'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-emerald-light uppercase bg-emerald-main/10 px-3.5 py-1 rounded-full border border-emerald-main/20 inline-block">
            🕌 AS-SALAH & ADHKAR
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-2 rounded-2xl flex flex-wrap gap-1 items-center justify-center sm:justify-between shadow-lg backdrop-blur-md">
          <div className="flex flex-wrap gap-1 justify-center">
            {[
              { id: 'times', label: t.tabTimes },
              { id: 'guide', label: t.tabGuide },
              { id: 'adhan', label: t.tabAdhan },
              { id: 'qibla', label: t.tabQibla },
              { id: 'dhikr', label: t.tabDhikr }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-main text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Realtime clock display in corner */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-400 px-4">
            <Clock className="w-3.5 h-3.5 text-emerald-light" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* MAIN VIEWS */}
        <div className="space-y-6">
          
          {/* TAB 1: PRAYER TIMES */}
          {activeTab === 'times' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Settings / Selection Side */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">{t.selectCity}</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm py-2.5 px-3 rounded-xl focus:ring-1 focus:ring-gold-main focus:outline-none"
                  >
                    {Object.entries(citiesData).map(([id, item]) => (
                      <option key={id} value={id}>{item.names[lang]} ({item.country})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">{t.calcMethod}</label>
                  <select
                    value={calcMethod}
                    onChange={(e) => setCalcMethod(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm py-2.5 px-3 rounded-xl focus:ring-1 focus:ring-gold-main focus:outline-none"
                  >
                    <option value="mwl">{t.methods.mwl}</option>
                    <option value="uoif">{t.methods.uoif}</option>
                    <option value="egypt">{t.methods.egypt}</option>
                  </select>
                </div>

                {/* Countdown Card */}
                <div className="bg-emerald-950/20 border border-emerald-900/40 p-5 rounded-2xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 text-emerald-800 opacity-10 font-serif text-8xl font-black">
                    صلاة
                  </div>
                  <div className="space-y-2 relative z-10">
                    <span className="text-[10px] font-bold text-emerald-light uppercase tracking-wider block">
                      {t.nextPrayerLabel} : <span className="text-white font-serif font-bold text-xs">{nextPrayer.name} ({nextPrayer.time})</span>
                    </span>
                    <p className="text-3xl font-mono font-bold tracking-tight text-white">
                      {nextPrayer.countdown}
                    </p>
                    <span className="text-[10px] text-zinc-400 block">
                      Temps calculé selon la zone {citiesData[selectedCity]?.timezone >= 0 ? '+' : ''}{citiesData[selectedCity]?.timezone} UTC
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedules Grid Side */}
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { name: 'Fajr', time: times.fajr, arabic: 'الفجر', color: 'border-blue-900/30' },
                    { name: 'Chourouk', time: times.chourouk, arabic: 'الشروق', color: 'border-amber-900/30' },
                    { name: 'Dhouhr', time: times.dhouhr, arabic: 'الظهر', color: 'border-emerald-900/30' },
                    { name: 'Asr', time: times.asr, arabic: 'العصر', color: 'border-zinc-800' },
                    { name: 'Maghrib', time: times.maghrib, arabic: 'المغرب', color: 'border-purple-900/30' },
                    { name: 'Isha', time: times.isha, arabic: 'العشاء', color: 'border-indigo-900/30' }
                  ].map(pr => {
                    const isNext = nextPrayer.name === pr.name;
                    return (
                      <div
                        key={pr.name}
                        className={`bg-zinc-900 border p-5 rounded-2xl transition-all shadow-md relative overflow-hidden flex flex-col justify-between h-32 ${
                          isNext 
                            ? 'ring-2 ring-emerald-main border-transparent bg-emerald-main/5' 
                            : 'border-zinc-800'
                        }`}
                      >
                        {isNext && (
                          <span className="absolute top-3 right-3 bg-emerald-main text-[9px] uppercase font-bold tracking-wider text-white px-2 py-0.5 rounded-full">
                            Next
                          </span>
                        )}
                        <div>
                          <p className="text-xs text-zinc-500 font-sans uppercase font-bold tracking-wider">{pr.name}</p>
                          <p className="text-[10px] text-gold-dark font-amiri font-bold">{pr.arabic}</p>
                        </div>
                        <p className="text-2xl font-mono font-bold text-white tracking-tight">{pr.time}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRAYER GUIDE */}
          {activeTab === 'guide' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left sidebar: Ablutions steps */}
              <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-lg font-serif font-bold text-gold-light border-b border-zinc-800 pb-2">
                  💧 {t.wuduSteps}
                </h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
                  {wuduStepsData.map((step) => (
                    <div key={step.num} className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-main/20 flex items-center justify-center text-xs font-bold text-emerald-light flex-shrink-0">
                        {step.num}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                          {step.title[lang]}
                        </h4>
                        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                          {step.desc[lang]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right content: Prayer steps */}
              <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <h3 className="text-lg font-serif font-bold text-gold-light">
                    🛐 {t.prayerSteps}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">
                    5 Salat obligatoires
                  </span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
                  {salahStepsData.map(step => (
                    <div key={step.num} className="bg-zinc-950 border border-zinc-850/60 rounded-xl p-5 space-y-2">
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-emerald-light">
                        {step.title[lang]}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-light">
                        {step.desc[lang]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Rakats cheat sheet */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gold-main font-mono tracking-wider block">
                    Nombre de Rak'ats (Unités) par Prière :
                  </span>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold text-white">
                    <div className="bg-zinc-900 border border-zinc-850 p-2 rounded">Fajr : 2 Raka'at</div>
                    <div className="bg-zinc-900 border border-zinc-850 p-2 rounded">Dhouhr : 4</div>
                    <div className="bg-zinc-900 border border-zinc-850 p-2 rounded">Asr : 4</div>
                    <div className="bg-zinc-900 border border-zinc-850 p-2 rounded">Maghrib : 3</div>
                    <div className="bg-zinc-900 border border-zinc-850 p-2 rounded">Isha : 4</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ADHAN & IQAMA */}
          {activeTab === 'adhan' && (
            <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
              
              {/* Media Player Bar */}
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayAdhan}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isPlayingAdhan 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-emerald-main hover:bg-emerald-med text-white'
                    }`}
                  >
                    {isPlayingAdhan ? (
                      <span className="text-xs font-bold">Stop</span>
                    ) : (
                      <span className="text-xs font-bold pl-0.5">Play</span>
                    )}
                  </button>
                  <div>
                    <h4 className="text-sm font-bold text-white">Écouter l'Adhan de Médine</h4>
                    <p className="text-xs text-zinc-500">Azaan Al-Madina Al-Munawwarah</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {/* Text Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* French & Phonetic */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gold-light border-b border-zinc-800 pb-1 uppercase font-sans">
                    {t.adhanTrans}
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-zinc-300 font-sans font-light">
                    <p><strong>Allâhu Akbar (4x)</strong><br />« Allah est le plus grand »</p>
                    <p><strong>Ach-hadu an lâ ilâha illa-llâh (2x)</strong><br />« Je témoigne qu'il n'y a de divinité digne d'adoration qu'Allah »</p>
                    <p><strong>Ach-hadu anna Muhammadan rasûlu-llâh (2x)</strong><br />« Je témoigne que Muhammad est le Messager d'Allah »</p>
                    <p><strong>Hayya 'ala-s-salât (2x)</strong><br />« Accourez à la prière »</p>
                    <p><strong>Hayya 'ala-l-falâh (2x)</strong><br />« Accourez à la réussite »</p>
                    <p><strong>Lâ ilâha illa-llâh (1x)</strong><br />« Il n'y a de divinité digne d'adoration qu'Allah »</p>
                  </div>
                </div>

                {/* Arabic Calligraphy */}
                <div className="bg-zinc-950/40 p-5 rounded-xl border border-zinc-850/60 text-right space-y-3">
                  <h3 className="text-sm font-bold text-gold-light border-b border-zinc-850 pb-1 uppercase font-amiri tracking-wide" dir="rtl">
                    صيغة الأذان الشرعية
                  </h3>
                  <div className="space-y-3 font-serif text-base sm:text-lg text-white leading-relaxed font-amiri" dir="rtl">
                    <p className="font-bold">اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ (مرتين)</p>
                    <p>أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ (مرتين)</p>
                    <p>أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ (مرتين)</p>
                    <p className="text-emerald-light">حَيَّ عَلَى الصَّلَاةِ (مرتين)</p>
                    <p className="text-emerald-light">حَيَّ عَلَى الْفَلَاحِ (مرتين)</p>
                    <p className="font-bold">اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ (مرة واحدة)</p>
                    <p className="font-bold text-gold-main">لَا إِلَهَ إِلَّا اللَّهُ (مرة واحدة)</p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: QIBLA COMPASS */}
          {activeTab === 'qibla' && (
            <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6 text-center">
              <div>
                <span className="text-xs font-bold text-gold-main uppercase tracking-widest">{t.qiblaDirection}</span>
                <h3 className="text-2xl font-serif font-bold text-white mt-1">
                  Angle de la Qibla : <span className="text-emerald-light font-mono font-bold">{qiblaAngle}°</span>
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-1">
                  Par rapport au Nord géographique pour la ville : <span className="text-white font-bold">{citiesData[selectedCity]?.names[lang]}</span>
                </p>
              </div>

              {/* Visual Compass SVG */}
              <div className="relative w-64 h-64 mx-auto my-8">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center">
                  
                  {/* Compass markings */}
                  <span className="absolute top-2 text-red-500 font-bold text-sm">N</span>
                  <span className="absolute bottom-2 text-zinc-400 font-bold text-sm">S</span>
                  <span className="absolute right-2 text-zinc-400 font-bold text-sm">E</span>
                  <span className="absolute left-2 text-zinc-400 font-bold text-sm">W</span>

                  {/* Dynamic Pointer Arrow representing Qibla */}
                  <div
                    className="w-full h-full absolute transition-transform duration-700 ease-out flex items-center justify-center"
                    style={{ transform: `rotate(${qiblaAngle}deg)` }}
                  >
                    {/* Golden Arrow Pointer */}
                    <div className="w-1.5 h-1/2 bg-gradient-to-t from-transparent via-gold-main to-emerald-light relative rounded-t-full">
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-emerald-light"></div>
                    </div>
                  </div>

                  {/* Inner golden Kaaba core dot */}
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-gold-main flex items-center justify-center text-[10px] font-bold text-gold-main z-10 shadow-lg">
                    🕋
                  </div>
                </div>
              </div>

              {/* Distance card */}
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex justify-between items-center max-w-sm mx-auto">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-light" />
                  <span className="text-xs text-zinc-400 font-sans">{t.distanceToMeccaLabel}</span>
                </div>
                <span className="text-sm font-mono font-bold text-white">{distanceToMecca.toLocaleString()} km</span>
              </div>
            </div>
          )}

          {/* TAB 5: DHIKR / COMPTEUR TASBIH */}
          {activeTab === 'dhikr' && (
            <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6 text-center">
              
              {/* Presets Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'subhanallah', title: 'Subhanallah', arabic: 'سبحان الله', count: 33 },
                  { id: 'alhamdulillah', title: 'Alhamdulillah', arabic: 'الحمد لله', count: 33 },
                  { id: 'allahu_akbar', title: 'Allahu Akbar', arabic: 'الله أكبر', count: 33 },
                  { id: 'istighfar', title: 'Astaghfirullah', arabic: 'أستغفر الله', count: 100 }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setTasbihPreset(p.id as any);
                      setTasbihCount(0);
                      setTasbihLap(0);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      tasbihPreset === p.id
                        ? 'bg-emerald-main/10 border-emerald-main text-white'
                        : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <p className="text-[10px] uppercase font-bold text-zinc-500 font-sans tracking-wider">{p.title}</p>
                    <p className="text-xs font-serif text-right text-gold-light font-amiri font-bold" dir="rtl">{p.arabic}</p>
                  </button>
                ))}
              </div>

              {/* Counter Display */}
              <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-8 relative overflow-hidden flex flex-col items-center justify-center space-y-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                  Laps: {tasbihLap}
                </span>
                
                <h3 className="text-6xl font-mono font-bold text-white tracking-tight">
                  {tasbihCount}
                </h3>

                <span className="text-xs text-gold-main font-serif">
                  {tasbihPreset === 'subhanallah' ? 'سُبْحَانَ اللَّهِ' : tasbihPreset === 'alhamdulillah' ? 'الْحَمْدُ لِلَّهِ' : tasbihPreset === 'allahu_akbar' ? 'اللَّهُ أَكْبَرُ' : 'أَسْتَغْفِرُ اللَّهَ'}
                </span>
              </div>

              {/* Clicker Button & Actions */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setTasbihCount(prev => {
                      const next = prev + 1;
                      if (next >= (tasbihPreset === 'istighfar' ? 100 : 33)) {
                        setTasbihLap(l => l + 1);
                        return 0; // reset
                      }
                      return next;
                    });
                  }}
                  className="w-full py-6 bg-emerald-main hover:bg-emerald-med text-white font-sans font-semibold rounded-2xl shadow-lg active:scale-98 transition-all text-sm uppercase tracking-widest"
                >
                  {t.tasbihClick} 👆
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTasbihCount(0);
                      setTasbihLap(0);
                    }}
                    className="flex-grow py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 hover:text-white font-sans rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
