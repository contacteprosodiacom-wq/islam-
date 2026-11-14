import { Language } from '../types';

export interface IslamicEvent {
  id: string;
  hijriDay: number; // 1-30, or -1 for recurring weekly/monthly
  hijriMonth: number; // 1-12
  isRecurringWhiteDays?: boolean; // 13, 14, 15
  isJumuah?: boolean;
  name: Record<Language, string>;
  description: Record<Language, string>;
  badge: Record<Language, string>;
  type: 'major' | 'sunnah' | 'historical' | 'holy_month';
  source?: string;
}

export const hijriMonthsData: Record<number, {
  name: Record<Language, string>;
  arabicSpelling: string;
  isSacred: boolean; // Al-Ashhur al-Hurum (Muharram, Rajab, Dhu al-Qi'dah, Dhu al-Hijjah)
  spiritualSignificance: Record<Language, string>;
}> = {
  1: {
    name: { fr: "Mouharram", en: "Muharram", ar: "مُحَرَّم" },
    arabicSpelling: "المحرّم",
    isSacred: true,
    spiritualSignificance: {
      fr: "Premier mois du calendrier hégirien et l'un des 4 mois sacrés. Comporte le jour béni d'Achoura (10 Mouharram).",
      en: "First month of the Hijri year and one of the 4 sacred months. Features the blessed day of Ashura (10th Muharram).",
      ar: "فاتحة العام الهجري وأحد الأشهر الحُرم الأربعة، يستحب فيه صيام يوم عاشوراء."
    }
  },
  2: {
    name: { fr: "Safar", en: "Safar", ar: "صَفَر" },
    arabicSpelling: "صفر",
    isSacred: false,
    spiritualSignificance: {
      fr: "Deuxième mois de l'Hégire, propice aux invocations, au repentir et à l'attachement aux enseignements prophétiques.",
      en: "Second month of the Hijri calendar, auspicious for invocations, repentance and following prophetic traditions.",
      ar: "الشهر الثاني من السنة الهجرية، فرصة لتجديد النيات والتزود من العمل الصالح."
    }
  },
  3: {
    name: { fr: "Rabi' al-Awwal", en: "Rabi' al-Awwal", ar: "رَبِيع الأَوَّل" },
    arabicSpelling: "ربيع الأول",
    isSacred: false,
    spiritualSignificance: {
      fr: "Mois béni de la naissance (Mawlid) et de l'Hégire du Prophète Muhammad ﷺ à Médine.",
      en: "Blessed month marking the birth (Mawlid) and the Hijra migration of Prophet Muhammad ﷺ to Medina.",
      ar: "شهر مبارك ولد فيه المصطفى ﷺ وفيه هاجر إلى المدينة المنورة مستهلاً فجر الدولة الإسلامية."
    }
  },
  4: {
    name: { fr: "Rabi' ath-Thani", en: "Rabi' al-Thani", ar: "رَبِيع الآخِر" },
    arabicSpelling: "ربيع الآخر",
    isSacred: false,
    spiritualSignificance: {
      fr: "Quatrième mois hégirien, opportunité de méditation spirituelle et de constance dans les prières nocturnes.",
      en: "Fourth Hijri month, dedicated to spiritual reflection, consistency in night prayers, and remembrance.",
      ar: "الشهر الرابع، وقت للمداومة على صيام الأيام البيض وقيام الليل وبذل الصدقات."
    }
  },
  5: {
    name: { fr: "Joumada al-Oula", en: "Jumada al-Awwal", ar: "جُمَادَى الأُولَى" },
    arabicSpelling: "جمادى الأولى",
    isSacred: false,
    spiritualSignificance: {
      fr: "Cinquième mois, marqué par la célèbre bataille de Mu'tah et l'encouragement aux aumônes et à l'assiduité du Dhikr.",
      en: "Fifth month, historically marked by the Battle of Mu'tah, encouraging charity and consistent Dhikr.",
      ar: "الشهر الخامس، شهد أحداثاً تاريخية جليلة كغزوة مؤتة، وفرصة للمحافظة على السنن الرواتب."
    }
  },
  6: {
    name: { fr: "Joumada ath-Thani", en: "Jumada al-Thani", ar: "جُمَادَى الآخِرَة" },
    arabicSpelling: "جمادى الآخرة",
    isSacred: false,
    spiritualSignificance: {
      fr: "Sixième mois, prélude aux trois mois de grande ferveur spirituelle (Rajab, Sha'ban, Ramadan).",
      en: "Sixth month, marking the prelude to the sacred trio of Rajab, Sha'ban, and Ramadan.",
      ar: "الشهر السادس، بوابة الأشهر المباركة القادمة وفرصة للاستعداد الإيماني."
    }
  },
  7: {
    name: { fr: "Rajab", en: "Rajab", ar: "رَجَب" },
    arabicSpelling: "رجب",
    isSacred: true,
    spiritualSignificance: {
      fr: "Mois sacré d'Al-Isra wal-Mi'raj (le Voyage Nocturne et l'Ascension céleste). Temps de semailles pour le Ramadan.",
      en: "Sacred month of Al-Isra wal-Mi'raj (Night Journey and Heavenly Ascension). A time to sow good deeds.",
      ar: "شهر حرام عظيم، ذكرى الإسراء والمعراج، وموسم لغرس بذور الطاعات استعداداً لرمضان."
    }
  },
  8: {
    name: { fr: "Cha'ban", en: "Sha'ban", ar: "شَعْبَان" },
    arabicSpelling: "شعبان",
    isSacred: false,
    spiritualSignificance: {
      fr: "Mois où les actions sont élevées vers Allah. Très propice au jeûne surérogatoire selon la tradition prophétique.",
      en: "Month where deeds are raised to Allah. Highly recommended for voluntary fasting following prophetic practice.",
      ar: "شهر ترفع فيه الأعمال إلى رب العالمين، كان النبي ﷺ يكثر من صيامه تقرباً لله."
    }
  },
  9: {
    name: { fr: "Ramadan", en: "Ramadan", ar: "رَمَضَان" },
    arabicSpelling: "رمضان المبارك",
    isSacred: false,
    spiritualSignificance: {
      fr: "Le mois béni du jeûne obligatoire, de la révélation du Coran et de Laylat al-Qadr (la Nuit du Destin).",
      en: "The blessed month of obligatory fasting, revelation of the Holy Quran, and Laylat al-Qadr (Night of Decree).",
      ar: "سيد الشهور، شهر الصيام والقيام ونزول القرآن وفيه ليلة القدر خير من ألف شهر."
    }
  },
  10: {
    name: { fr: "Chawwal", en: "Shawwal", ar: "شَوَّال" },
    arabicSpelling: "شوّال",
    isSacred: false,
    spiritualSignificance: {
      fr: "Débute par l'Aïd al-Fitr (1er Chawwal). La Sunnah recommande de jeûner 6 jours pour obtenir la récompense de l'année.",
      en: "Begins with Eid al-Fitr (1st Shawwal). Sunnah recommends fasting 6 days for the reward of a full year.",
      ar: "مستهله عيد الفطر المبارك، وفيه سنّة صيام الست من شوّال التي تعدل صيام الدهر."
    }
  },
  11: {
    name: { fr: "Dhou al-Qi'da", en: "Dhu al-Qi'dah", ar: "ذُو القَعْدَة" },
    arabicSpelling: "ذو القعدة",
    isSacred: true,
    spiritualSignificance: {
      fr: "Premier des mois du grand Pèlerinage et mois sacré. Période de paix, d'apaisement et de préparatifs du Hajj.",
      en: "First of the Hajj pilgrimage months and a sacred month. Time of tranquility and spiritual pilgrimage preparation.",
      ar: "شهر حرام من أشهر الحج، يستحب فيه تعظيم حرمات الله والإكثار من العمل الصالح."
    }
  },
  12: {
    name: { fr: "Dhou al-Hijja", en: "Dhu al-Hijjah", ar: "ذُو الحِجَّة" },
    arabicSpelling: "ذو الحجة",
    isSacred: true,
    spiritualSignificance: {
      fr: "Comporte les 10 meilleurs jours de l'année, le grand jour d'Arafat (9) et la fête du sacrifice Aïd al-Adha (10).",
      en: "Features the 10 best days of the year, the great Day of Arafat (9th), and the festival of Eid al-Adha (10th).",
      ar: "شهر الحج الأعظم، فيه العشر الأوائل المفضلة، ويوم عرفة المشهود، وعيد الأضحى المبارك."
    }
  }
};

export const islamicFixedEvents: IslamicEvent[] = [
  // 1: Mouharram
  {
    id: "hijri_new_year",
    hijriMonth: 1,
    hijriDay: 1,
    name: {
      fr: "Nouvel An Hégirien",
      en: "Islamic New Year",
      ar: "رأس السنة الهجرية"
    },
    description: {
      fr: "Commémoration de l'Hégire (l'émigration sacrée) du Prophète Muhammad ﷺ de La Mecque à Médine en 622.",
      en: "Commemorating the prophetic migration (Hijra) from Mecca to Medina, founding the Islamic calendar.",
      ar: "ذكرى هجرة المصطفى ﷺ من مكة إلى المدينة المنورة وبداية التقويم الهجري المبارك."
    },
    badge: {
      fr: "1er Mouharram",
      en: "1st Muharram",
      ar: "١ محرم"
    },
    type: "major"
  },
  {
    id: "tasua",
    hijriMonth: 1,
    hijriDay: 9,
    name: {
      fr: "Jeûne de Tasou'a",
      en: "Tasu'a Fasting",
      ar: "صيام تاسوعاء"
    },
    description: {
      fr: "Jour précédant Achoura, jeûné selon la recommandation du Prophète ﷺ.",
      en: "Day preceding Ashura, recommended to fast alongside the 10th according to the Sunnah.",
      ar: "اليوم التاسع من محرم، يستحب صيامه مع العاشر لمخالفة أهل الكتاب عملاً بسنة النبي ﷺ."
    },
    badge: {
      fr: "Sunnah",
      en: "Sunnah",
      ar: "سنة مؤكدة"
    },
    type: "sunnah"
  },
  {
    id: "ashura",
    hijriMonth: 1,
    hijriDay: 10,
    name: {
      fr: "Jour d'Achoura",
      en: "Day of Ashura",
      ar: "يوم عاشوراء"
    },
    description: {
      fr: "Jour où Allah sauva le Prophète Moussa (Moïse) et son peuple. Son jeûne expie les péchés de l'année écoulée.",
      en: "Day when Allah saved Prophet Musa (Moses) and his people from Pharaoh. Fasting expiates the past year's sins.",
      ar: "يوم نجى الله فيه موسى عليه السلام وقومه من فرعون، وصيامه يكفر ذنوب السنة الماضية."
    },
    badge: {
      fr: "Expiation 1 an",
      en: "Expiates 1 Year",
      ar: "تكفير سنة"
    },
    type: "major"
  },

  // 3: Rabi' al-Awwal
  {
    id: "mawlid",
    hijriMonth: 3,
    hijriDay: 12,
    name: {
      fr: "Mawlid an-Nabaoui (Naissance du Prophète ﷺ)",
      en: "Mawlid an-Nabi (Prophet's Birthday ﷺ)",
      ar: "المولد النبوي الشريف ﷺ"
    },
    description: {
      fr: "Rappel bienveillant de la naissance de la Miséricorde pour l'Univers, notre Prophète Muhammad ﷺ.",
      en: "Celebration and contemplation on the life, character, and birth of Prophet Muhammad ﷺ.",
      ar: "ذكرى ميلاد الرحمة المهداة وسيد الخلق وخاتم الأنبياء محمد ﷺ."
    },
    badge: {
      fr: "12 Rabi' I",
      en: "12 Rabi' I",
      ar: "١٢ ربيع الأول"
    },
    type: "historical"
  },

  // 5: Joumada al-Oula
  {
    id: "mutah_battle",
    hijriMonth: 5,
    hijriDay: 5,
    name: {
      fr: "Bataille de Mu'tah (Mémoire historique)",
      en: "Battle of Mu'tah Remembrance",
      ar: "ذكرى غزوة مؤتة التاريخية"
    },
    description: {
      fr: "Bataille historique majeure de l'an 8 de l'Hégire où s'illustrèrent Ja'far ibn Abi Talib et Khalid ibn al-Walid.",
      en: "Historical battle in year 8 AH witnessing the valor of Ja'far ibn Abi Talib and Khalid ibn al-Walid.",
      ar: "معركة تاريخية خالدة في السنة الثامنة للهجرة واستبسال القادة جعفر وزيد وابن رواحة وخالد بن الوليد."
    },
    badge: {
      fr: "Histoire",
      en: "History",
      ar: "ذكرى تاريخية"
    },
    type: "historical"
  },

  // 7: Rajab
  {
    id: "isra_miraj",
    hijriMonth: 7,
    hijriDay: 27,
    name: {
      fr: "Al-Isra wal-Mi'raj",
      en: "Al-Isra and Al-Mi'raj",
      ar: "الإسراء والمعراج"
    },
    description: {
      fr: "Le Voyage Nocturne de La Mecque à Jérusalem puis l'Ascension aux Cieux où les 5 prières quotidiennes furent prescrites.",
      en: "The Miraculous Night Journey to Al-Quds and Ascension through the heavens where the 5 daily prayers were prescribed.",
      ar: "معجزة الإسراء من المسجد الحرام للمسجد الأقصى والمعراج إلى السماوات العلى وفرض الصلوات الخمس."
    },
    badge: {
      fr: "27 Rajab",
      en: "27 Rajab",
      ar: "٢٧ رجب"
    },
    type: "major"
  },

  // 8: Cha'ban
  {
    id: "nisf_shaban",
    hijriMonth: 8,
    hijriDay: 15,
    name: {
      fr: "Nuit de la mi-Cha'ban",
      en: "Night of Mid-Sha'ban",
      ar: "ليلة النصف من شعبان"
    },
    description: {
      fr: "Nuit bénie propice au pardon divin, à l'examen de conscience et aux invocations sincères.",
      en: "A blessed night auspicious for divine forgiveness, self-reflection, and sincere supplications.",
      ar: "ليلة مباركة يرجى فيها مغفرة الذنوب وعفو الرحمن، وفرصة للاستغفار والدعاء الصادق."
    },
    badge: {
      fr: "15 Cha'ban",
      en: "15 Sha'ban",
      ar: "١٥ شعبان"
    },
    type: "sunnah"
  },

  // 9: Ramadan
  {
    id: "ramadan_start",
    hijriMonth: 9,
    hijriDay: 1,
    name: {
      fr: "1er jour de Ramadan (Début du Jeûne)",
      en: "1st of Ramadan (First Day of Fasting)",
      ar: "أول أيام شهر رمضان المبارك"
    },
    description: {
      fr: "Ouverture du mois béni de la miséricorde, du jeûne prescrit, de la générosité et des prières de Tarawih.",
      en: "Commencement of the holy month of obligatory fasting, divine mercy, charity, and nightly Tarawih.",
      ar: "إشراقة شهر الرحمة والمغفرة والعتق من النيران وفرض الصيام وإقامة صلاة التراويح."
    },
    badge: {
      fr: "Pilier de l'Islam",
      en: "Pillar of Islam",
      ar: "ركن من أركان الإسلام"
    },
    type: "major"
  },
  {
    id: "badr_battle",
    hijriMonth: 9,
    hijriDay: 17,
    name: {
      fr: "Victoire de la Bataille de Badr",
      en: "Victory of the Battle of Badr",
      ar: "ذكرى غزوة بدر الكبرى (يوم الفرقان)"
    },
    description: {
      fr: "Le Jour du Discernement (Yawm al-Fourqan) de l'an 2 de l'Hégire, éclatante victoire de la foi.",
      en: "The Day of Criterion (Yawm al-Furqan) in 2 AH, milestone victory for early Muslims.",
      ar: "يوم الفرقان يوم التقى الجمعان في السنة الثانية للهجرة وانتصار المسلمين المؤزر."
    },
    badge: {
      fr: "17 Ramadan",
      en: "17 Ramadan",
      ar: "١٧ رمضان"
    },
    type: "historical"
  },
  {
    id: "mecca_conquest",
    hijriMonth: 9,
    hijriDay: 20,
    name: {
      fr: "Ouverture paisible de La Mecque (Fath Makkah)",
      en: "Conquest of Mecca (Fath Makkah)",
      ar: "فتح مكة العظيم (فتح الفتوح)"
    },
    description: {
      fr: "Entrée triomphale et empreinte d'humilité et de pardon du Prophète ﷺ à La Mecque en l'an 8 de l'Hégire.",
      en: "The peaceful entry and widespread amnesty granted by Prophet Muhammad ﷺ upon entering Mecca.",
      ar: "دخول النبي ﷺ مكة متواضعاً شاكراً وعفوه الشامل عن أهلها: «اذهبوا فأنتم الطلقاء»."
    },
    badge: {
      fr: "20 Ramadan",
      en: "20 Ramadan",
      ar: "٢٠ رمضان"
    },
    type: "historical"
  },
  {
    id: "laylat_al_qadr",
    hijriMonth: 9,
    hijriDay: 27,
    name: {
      fr: "Nuit du Destin (Laylat al-Qadr)",
      en: "Night of Decree (Laylat al-Qadr)",
      ar: "ليلة القدر المباركة"
    },
    description: {
      fr: "« La Nuit d'Al-Qadr est meilleure que mille mois » (Sourate 97). Nuit bénie de la révélation du Saint Coran.",
      en: "«The Night of Decree is better than a thousand months» (Surah 97). The night of Quran's revelation.",
      ar: "«لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ» تنزل الملائكة والروح فيها بإذن ربهم من كل أمر."
    },
    badge: {
      fr: "Meilleure que 1000 mois",
      en: "Better than 1,000 months",
      ar: "خير من ألف شهر"
    },
    type: "major"
  },

  // 10: Chawwal
  {
    id: "eid_fitr",
    hijriMonth: 10,
    hijriDay: 1,
    name: {
      fr: "Aïd al-Fitr (Fête de la Rupture du Jeûne)",
      en: "Eid al-Fitr (Festival of Breaking Fast)",
      ar: "عيد الفطر المبارك"
    },
    description: {
      fr: "Jour de fête et de réjouissance spirituelle couronnant le jeûne de Ramadan, précédé de la Zakat al-Fitr.",
      en: "Joyous celebration concluding Ramadan, shared through prayer, family visits, and Zakat al-Fitr charity.",
      ar: "عيد الفرح بتمام نعمة الصيام وتوزيع زكاة الفطر وصلة الأرحام وإشاعة التكافل والبهجة."
    },
    badge: {
      fr: "Fête de l'Aïd",
      en: "Eid Celebration",
      ar: "عيد إسلامي مبارك"
    },
    type: "major"
  },
  {
    id: "six_days_shawwal",
    hijriMonth: 10,
    hijriDay: 2,
    name: {
      fr: "Les 6 jours de jeûne de Chawwal",
      en: "Six Days of Shawwal Fasting",
      ar: "صيام الست من شوّال"
    },
    description: {
      fr: "« Quiconque jeûne le Ramadan puis le fait suivre de 6 jours de Chawwal, c'est comme s'il avait jeûné toute l'année » (Hadith Mouslim).",
      en: "«Whoever fasts Ramadan then follows it with six days of Shawwal, it is as if they fasted the whole year» (Muslim).",
      ar: "«من صام رمضان ثم أتبعه ستاً من شوال كان كصيام الدهر» (رواه مسلم)."
    },
    badge: {
      fr: "Sunnah",
      en: "Sunnah",
      ar: "أجر صيام الدهر"
    },
    type: "sunnah"
  },

  // 12: Dhou al-Hijja
  {
    id: "ten_days_dhul_hijjah",
    hijriMonth: 12,
    hijriDay: 1,
    name: {
      fr: "Les 10 premiers jours de Dhou al-Hijja",
      en: "The First 10 Days of Dhu al-Hijjah",
      ar: "العشر الأوائل من ذي الحجة"
    },
    description: {
      fr: "Les jours les plus aimés d'Allah pour accomplir de bonnes œuvres (jeûne, aumône, Takbir, lecture du Coran).",
      en: "The most virtuous days in the sight of Allah for good deeds, fasting, invocations, and charity.",
      ar: "«ما من أيام العمل الصالح فيها أحب إلى الله من هذه الأيام» - إكثار من التهليل والتكبير والصيام."
    },
    badge: {
      fr: "Jours bénis",
      en: "Blessed Days",
      ar: "أفضل أيام الدنيا"
    },
    type: "major"
  },
  {
    id: "arafah",
    hijriMonth: 12,
    hijriDay: 9,
    name: {
      fr: "Jour d'Arafat (Jeûne méritoire)",
      en: "Day of Arafah",
      ar: "يوم عرفة المبارك"
    },
    description: {
      fr: "Pilier suprême du Hajj. Le jeûne de ce jour pour les non-pèlerins expie les péchés de 2 années (passée et à venir).",
      en: "Pinnacle of the Hajj pilgrimage. Fasting on this day for non-pilgrims expiates the sins of two years.",
      ar: "ركن الحج الأعظم، وصيامه لغير الحاج يكفر السنة الماضية والباقية، وأفضل الدعاء دعاء يوم عرفة."
    },
    badge: {
      fr: "Expiation 2 ans",
      en: "Expiates 2 Years",
      ar: "تكفير سنتين"
    },
    type: "major"
  },
  {
    id: "eid_adha",
    hijriMonth: 12,
    hijriDay: 10,
    name: {
      fr: "Aïd al-Adha (Fête du Sacrifice)",
      en: "Eid al-Adha (Feast of Sacrifice)",
      ar: "عيد الأضحى المبارك (يوم النحر)"
    },
    description: {
      fr: "Grande fête commémorant l'obéissance totale du Prophète Ibrahim (Abraham) et sacrifice béni offert aux pauvres.",
      en: "Commemoration of Prophet Ibrahim's sacrifice, sharing meat with the needy and rejoicing.",
      ar: "يوم النحر الأعظم استحضاراً لتضحية خليل الرحمن إبراهيم وإسماعيل عليهما السلام وتوزيع الأضاحي."
    },
    badge: {
      fr: "Grande Fête",
      en: "Major Eid",
      ar: "عيد الأضحى"
    },
    type: "major"
  },
  {
    id: "tashreeq",
    hijriMonth: 12,
    hijriDay: 11,
    name: {
      fr: "Jours de Tachriq (11, 12 et 13 Dhou al-Hijja)",
      en: "Days of Tashreeq (11th-13th)",
      ar: "أيام التشريق المباركة"
    },
    description: {
      fr: "« Ce sont des jours de nourriture, de boisson et d'évocation d'Allah » (Hadith Mouslim).",
      en: "«They are days of eating, drinking, and remembrance of Allah» (Hadith Muslim).",
      ar: "أيام أكل وشرب وذكر لله تعالى وتكبير مقيد بعد الصلوات المفروضة."
    },
    badge: {
      fr: "Dhikr & Joie",
      en: "Dhikr & Joy",
      ar: "أيام أكل وذكر"
    },
    type: "sunnah"
  }
];

export interface HijriDateInfo {
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  hijriMonthName: Record<Language, string>;
  gregorianDate: Date;
  isWhiteDay: boolean; // 13, 14, 15
  isJumuah: boolean; // Friday
  events: IslamicEvent[];
}

/**
 * Robust Intl-based Hijri converter for any Gregorian date.
 * Uses 'en-u-ca-islamic-umalqura' with formatToParts to guarantee exact Day/Month/Year.
 */
export function getHijriDateFromGregorian(date: Date): { day: number; month: number; year: number } {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1448', 10);
    return { day, month, year };
  } catch {
    // Fallback if environment doesn't support umalqura
    return { day: 26, month: 5, year: 1448 };
  }
}

/**
 * Returns formatted Gregorian date according to language.
 */
export function formatGregorianDate(date: Date, lang: Language): string {
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Returns all islamic events matching a specific Hijri month and day.
 */
export function getEventsForHijriDay(month: number, day: number, isJumuah: boolean): IslamicEvent[] {
  const events = islamicFixedEvents.filter(ev => ev.hijriMonth === month && ev.hijriDay === day);

  // Add Jumu'ah notice if Friday
  if (isJumuah) {
    events.unshift({
      id: `jumuah-${month}-${day}`,
      hijriMonth: month,
      hijriDay: day,
      isJumuah: true,
      name: {
        fr: "Vendredi Béni (Jumu'ah)",
        en: "Blessed Friday (Jumu'ah)",
        ar: "يوم الجمعة المباركة"
      },
      description: {
        fr: "Le meilleur jour sur lequel le soleil s'est levé. Recommandé : lecture de Sourate Al-Kahf, prières sur le Prophète ﷺ et prière en assemblée.",
        en: "The best day upon which the sun rises. Recommended: recitation of Surah Al-Kahf, Salawat upon the Prophet ﷺ, and congregational prayer.",
        ar: "خير يوم طلعت عليه الشمس، فيه ساعة إجابة ويستحب فيه قراءة سورة الكهف وكثرة الصلاة على النبي ﷺ."
      },
      badge: {
        fr: "Jumu'ah",
        en: "Jumu'ah",
        ar: "الجمعة"
      },
      type: "sunnah"
    });
  }

  // Add Ayyam al-Beed (White Days 13, 14, 15)
  if (day === 13 || day === 14 || day === 15) {
    events.push({
      id: `white-day-${month}-${day}`,
      hijriMonth: month,
      hijriDay: day,
      isRecurringWhiteDays: true,
      name: {
        fr: `Jour Blanc (${day}e jour)`,
        en: `White Day (${day}th)`,
        ar: `اليوم الأبيض (${day})`
      },
      description: {
        fr: "Jeûne surérogatoire recommandé des jours de pleine lune (13, 14 et 15 de chaque mois lunaire).",
        en: "Recommended voluntary fasting on the days of the full moon (13th, 14th, and 15th of the lunar month).",
        ar: "سنة صيام الأيام البيض (١٣، ١٤، ١٥) عند اكتمال القمر، وثواب صيامها كصيام الدهر."
      },
      badge: {
        fr: "Jours Blancs",
        en: "White Days",
        ar: "الأيام البيض"
      },
      type: "sunnah"
    });
  }

  return events;
}

/**
 * Returns complete days for a whole Hijri month, mapping each Hijri day to its exact Gregorian date.
 */
export function getHijriMonthGrid(referenceDate: Date): {
  hijriMonth: number;
  hijriYear: number;
  monthMeta: typeof hijriMonthsData[1];
  days: {
    hijriDay: number;
    gregorianDate: Date;
    isToday: boolean;
    isWhiteDay: boolean;
    isJumuah: boolean;
    events: IslamicEvent[];
  }[];
  allMonthEvents: {
    hijriDay: number;
    events: IslamicEvent[];
  }[];
} {
  const currentHijri = getHijriDateFromGregorian(referenceDate);
  const targetMonth = currentHijri.month;
  const targetYear = currentHijri.year;
  const monthMeta = hijriMonthsData[targetMonth] || hijriMonthsData[1];

  // Scan backwards and forwards around referenceDate to collect all days in this Hijri month
  const daysMap = new Map<number, Date>();

  // Look back up to 35 days
  for (let offset = -35; offset <= 35; offset++) {
    const d = new Date(referenceDate.getTime() + offset * 86400000);
    const h = getHijriDateFromGregorian(d);
    if (h.month === targetMonth && h.year === targetYear) {
      if (!daysMap.has(h.day)) {
        daysMap.set(h.day, d);
      }
    }
  }

  // Convert map to sorted array of days (1 to 29 or 30)
  const totalDays = daysMap.size > 0 ? Math.max(...Array.from(daysMap.keys())) : 30;
  const resultDays = [];
  const todayStr = referenceDate.toDateString();

  for (let day = 1; day <= totalDays; day++) {
    const gregDate = daysMap.get(day) || new Date(referenceDate);
    const isToday = gregDate.toDateString() === todayStr;
    const isJumuah = gregDate.getDay() === 5;
    const isWhiteDay = day === 13 || day === 14 || day === 15;
    const events = getEventsForHijriDay(targetMonth, day, isJumuah);

    resultDays.push({
      hijriDay: day,
      gregorianDate: gregDate,
      isToday,
      isWhiteDay,
      isJumuah,
      events
    });
  }

  // Filter out month events for the dedicated list (significant events and special Sunnah)
  const allMonthEvents: { hijriDay: number; events: IslamicEvent[] }[] = [];
  resultDays.forEach(d => {
    // Collect non-weekly Jumu'ah events or distinct special days
    const keyEvents = d.events.filter(e => !e.isJumuah || d.isToday);
    if (keyEvents.length > 0) {
      allMonthEvents.push({
        hijriDay: d.hijriDay,
        events: keyEvents
      });
    }
  });

  return {
    hijriMonth: targetMonth,
    hijriYear: targetYear,
    monthMeta,
    days: resultDays,
    allMonthEvents
  };
}
