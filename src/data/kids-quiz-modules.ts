import { Language } from '../types';

export interface KidQuestion {
  id: number;
  question: Record<Language, string>;
  options: Record<Language, string[]>;
  correctAnswerIndex: number;
  praise: Record<Language, string>; // Cheerful affirmation on correct
  explanation: Record<Language, string>; // Kind pedagogical explanation
  emoji: string;
}

export interface KidBadge {
  id: string;
  name: Record<Language, string>;
  icon: string;
  color: string;
  bgGradient: string;
  description: Record<Language, string>;
  virtue: Record<Language, string>;
}

export interface KidLearningModule {
  id: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  description: Record<Language, string>;
  ageRange: string;
  icon: string;
  themeColor: string;
  badge: KidBadge;
  questions: KidQuestion[];
}

export const kidsLearningModules: KidLearningModule[] = [
  {
    id: "module-mon-createur",
    title: {
      fr: "1. Mon Créateur Allah & La Foi",
      en: "1. My Creator Allah & Faith",
      ar: "١. ربي الله ونور الإيمان"
    },
    subtitle: {
      fr: "Qui a créé le ciel, la terre et qui prend soin de nous ?",
      en: "Who created the heavens, the earth, and watches over us?",
      ar: "من خلق السماء والأرض ويرعانا بلطفه ورحمته؟"
    },
    description: {
      fr: "Découvre les bienfaits d'Allah, Son unicité et apprends à Le remercier chaque jour avec le cœur !",
      en: "Discover the blessings of Allah, His oneness, and how to thank Him with love each day!",
      ar: "تعرّف على نعم الله الخالق الواحد الأحد، وتعلّم كيف تشكره بقلب محب مؤمن."
    },
    ageRange: "6 - 12 ans",
    icon: "🌟",
    themeColor: "from-amber-500 to-yellow-400",
    badge: {
      id: "badge-foi",
      name: {
        fr: "Étoile de la Foi",
        en: "Star of Faith",
        ar: "نجم الإيمان والتوحيد"
      },
      icon: "🌟",
      color: "#F59E0B",
      bgGradient: "from-amber-400 via-yellow-500 to-amber-600",
      description: {
        fr: "Attribué aux petits croyants qui reconnaissent Allah comme Créateur Unique et Miséricordieux.",
        en: "Awarded to young believers who know Allah as their One and Loving Creator.",
        ar: "وسام مبارك للطفل الذي آمن بأن الله هو الخالق الواحد الرزاق."
      },
      virtue: {
        fr: "Amour d'Allah & Reconnaissance",
        en: "Love of Allah & Gratitude",
        ar: "محبة الله واستشعار نعمه"
      }
    },
    questions: [
      {
        id: 1,
        emoji: "🌍",
        question: {
          fr: "Qui a créé le ciel, la terre, les étoiles et tous les êtres vivants ?",
          en: "Who created the sky, the earth, the stars, and all living beings?",
          ar: "من الذي خلق السماوات والأرض والنجوم وجميع الكائنات الحية؟"
        },
        options: {
          fr: ["Allah, le Créateur Unique ﷻ", "La nature toute seule", "Le soleil", "Les anges"],
          en: ["Allah, the One Creator ﷻ", "Nature all by itself", "The sun", "The angels"],
          ar: ["الله الخالق الواحد الأحد ﷻ", "الطبيعة وحدها", "الشمس", "الملائكة"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Māshā'Allāh ! C'est Allah ﷻ le Créateur de toute chose magnifique !",
          en: "Māshā’Allāh! Allah is the Creator of all magnificent things!",
          ar: "ما شاء الله! أحسنت، الله هو خالق كل شيء جميل."
        },
        explanation: {
          fr: "Allah est le Créateur (Al-Khāliq). Il a tout façonné avec amour et sagesse pour nous.",
          en: "Allah is the Creator (Al-Khāliq). He fashioned everything with love and wisdom for us.",
          ar: "الله هو الخالق الذي صور كل شيء بحكمة وإتقان."
        }
      },
      {
        id: 2,
        emoji: "🤲",
        question: {
          fr: "Que dit un musulman avant de commencer à manger ou faire une bonne action ?",
          en: "What does a Muslim say before starting to eat or doing a good deed?",
          ar: "ماذا يقول المسلم الصغير قبل أن يبدأ بتناول طعامه أو عمل خير؟"
        },
        options: {
          fr: ["Bismillah (Au nom d'Allah)", "Bonjour", "Merci beaucoup", "Au revoir"],
          en: ["Bismillah (In the name of Allah)", "Good morning", "Thank you so much", "Goodbye"],
          ar: ["بسم الله (تبارك الله)", "صباح الخير", "شكراً جزيلاً", "مع السلامة"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Superbe ! Bismillah met la bénédiction (Baraka) dans tout ce que tu fais !",
          en: "Awesome! Bismillah brings blessing (Barakah) into everything you do!",
          ar: "رائع جداً! كلمة (بسم الله) تجلب البركة في طعامنا وأعمالنا."
        },
        explanation: {
          fr: "Dire 'Bismillah' nous rappelle que tous nos bienfaits viennent d'Allah.",
          en: "Saying 'Bismillah' reminds us that all our blessings come directly from Allah.",
          ar: "التسمية تبدأ بها كل الأعمال الطيبة لتنال بركة وتوفيق الله."
        }
      },
      {
        id: 3,
        emoji: "💖",
        question: {
          fr: "Que dit-on pour remercier Allah lorsqu'on termine de manger ou après un bienfait ?",
          en: "What do we say to thank Allah after finishing eating or receiving a blessing?",
          ar: "ما الكلمة الطيبة التي نحمد بها الله بعد الانتهاء من الأكل أو نيل نعمة؟"
        },
        options: {
          fr: ["Al-Hamdulillah (Louange à Allah)", "Je suis fort", "À demain", "C'est fini"],
          en: ["Al-Hamdulillah (Praise be to Allah)", "I am strong", "See you tomorrow", "It's done"],
          ar: ["الحمد لله (حمداً وشكراً)", "أنا قوي", "إلى الغد", "انتهيت فقط"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Bravo ! Al-Hamdulillah remplit la balance des bonnes actions !",
          en: "Bravo! Al-Hamdulillah fills the scales of good deeds with light!",
          ar: "أحسنت! كلمة (الحمد لله) تملأ ميزان الحسنات بالنور."
        },
        explanation: {
          fr: "Le Prophète ﷺ nous a enseigné que celui qui remercie Allah voit ses bienfaits grandir.",
          en: "Prophet Muhammad ﷺ taught us that thanking Allah increases His blessings.",
          ar: "شكر الله وحمده من أعظم العبادات التي يحبها الرحمن."
        }
      },
      {
        id: 4,
        emoji: "📖",
        question: {
          fr: "Quel est le Livre Sacré qu'Allah a révélé à notre Prophète Muhammad ﷺ ?",
          en: "What is the Holy Book that Allah revealed to our Prophet Muhammad ﷺ?",
          ar: "ما هو كتاب الله الكريم المنزل على نبينا محمد ﷺ لهداية الناس؟"
        },
        options: {
          fr: ["Le Noble Coran", "Un livre d'histoire", "Un recueil de contes", "Un dictionnaire"],
          en: ["The Holy Quran", "A history book", "A storybook", "A dictionary"],
          ar: ["القرآن الكريم", "كتاب تاريخ مدرسي", "كتاب قصص فقط", "معجم لغوي"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Māshā'Allāh ! Le Coran est la parole d'Allah qui guide notre cœur !",
          en: "Māshā’Allāh! The Quran is Allah's word that illuminates our hearts!",
          ar: "ما شاء الله! القرآن هو كلام الله المنزل نوراً وهدى للقلوب."
        },
        explanation: {
          fr: "Le Noble Coran est la parole d'Allah transmise par l'ange Jibril (Gabriel) au Prophète ﷺ.",
          en: "The Quran is the direct speech of Allah brought by angel Jibril to Prophet Muhammad ﷺ.",
          ar: "القرآن الكريم نزل به جبريل عليه السلام على قلب النبي ﷺ ليعلمنا الخير."
        }
      }
    ]
  },
  {
    id: "module-les-5-piliers",
    title: {
      fr: "2. Les 5 Piliers de l'Islam",
      en: "2. The 5 Pillars of Islam",
      ar: "٢. أركان الإسلام الخمسة للبراعم"
    },
    subtitle: {
      fr: "Comme une belle maison solide sur 5 grands piliers !",
      en: "Like a beautiful strong house built on 5 great pillars!",
      ar: "مثل قصر إيماني عظيم يقوم على خمسة أعمدة مباركة!"
    },
    description: {
      fr: "Apprends la Shahada, les 5 prières quotidiennes, la Zakat, le jeûne de Ramadan et le Hajj.",
      en: "Learn the Shahada, 5 daily prayers, Zakat, Ramadan fasting, and Hajj in a joyful way.",
      ar: "تعلم الشهادتين والصلوات الخمس والزكاة وصيام رمضان وحج البيت الحرام."
    },
    ageRange: "6 - 12 ans",
    icon: "🕌",
    themeColor: "from-emerald-600 to-teal-500",
    badge: {
      id: "badge-piliers",
      name: {
        fr: "Bâtisseur des Piliers",
        en: "Pillar Builder",
        ar: "بطل أركان الإسلام"
      },
      icon: "🕌",
      color: "#10B981",
      bgGradient: "from-emerald-500 via-teal-600 to-emerald-700",
      description: {
        fr: "Décerné au champion qui connaît par cœur les 5 piliers qui bâtissent la foi du croyant.",
        en: "Awarded to the champion who knows all 5 pillars structuring our faith.",
        ar: "وسام الشرف للبطل الذي أتقن وحفظ أركان دينه العظيم."
      },
      virtue: {
        fr: "Discipline & Dévotion",
        en: "Discipline & Devotion",
        ar: "المحافظة على أركان الدين"
      }
    },
    questions: [
      {
        id: 1,
        emoji: "✋",
        question: {
          fr: "Combien y a-t-il de piliers de l'Islam ?",
          en: "How many pillars of Islam are there?",
          ar: "كم عدد أركان الإسلام التي بُني عليها الدين؟"
        },
        options: {
          fr: ["5 piliers", "3 piliers", "7 piliers", "10 piliers"],
          en: ["5 pillars", "3 pillars", "7 pillars", "10 pillars"],
          ar: ["٥ أركان", "٣ أركان", "٧ أركان", "١٠ أركان"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Exactement ! 5 piliers comme les cinq doigts de la main !",
          en: "Spot on! 5 pillars, just like the five fingers on your hand!",
          ar: "إجابة صحيحة تماماً! خمسة أركان أساسية متينة."
        },
        explanation: {
          fr: "Le Prophète ﷺ a dit : 'L'Islam est bâti sur cinq piliers'.",
          en: "Prophet Muhammad ﷺ said: 'Islam is built on five pillars'.",
          ar: "قال النبي ﷺ: «بُني الإسلام على خمس...»"
        }
      },
      {
        id: 2,
        emoji: "🕋",
        question: {
          fr: "Combien de prières obligatoires fait un musulman chaque jour ?",
          en: "How many obligatory prayers does a Muslim perform each day?",
          ar: "كم عدد الصلوات المفروضة التي يؤديها المسلم في كل يوم وليلة؟"
        },
        options: {
          fr: ["5 prières (Fajr, Dhuhr, Asr, Maghrib, Isha)", "2 prières", "1 prière", "7 prières"],
          en: ["5 prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)", "2 prayers", "1 prayer", "7 prayers"],
          ar: ["٥ صلوات (الفجر، الظهر، العصر، المغرب، العشاء)", "صلاتان فقط", "صلاة واحدة", "٧ صلوات"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Merveilleux ! La prière est la lumière du jour et notre lien avec Allah !",
          en: "Wonderful! Prayer is the light of our day and our special connection with Allah!",
          ar: "ممتاز ومبارك! الصلاة نور الوجه وصلة العبد بربه."
        },
        explanation: {
          fr: "Les 5 prières rythment notre journée avec paix, propreté (les ablutions) et sérénité.",
          en: "The 5 daily prayers bring peace, purity through wudu, and calm to our whole day.",
          ar: "الصلوات الخمس تطهر الروح وتملأ يوم الطفل المسلم طمأنينة."
        }
      },
      {
        id: 3,
        emoji: "🌙",
        question: {
          fr: "Durant quel mois béni les musulmans jeûnent-ils du lever au coucher du soleil ?",
          en: "During which blessed month do Muslims fast from dawn to sunset?",
          ar: "في أي شهر مبارك يصوم المسلمون طاعة لله وتقرباً إليه؟"
        },
        options: {
          fr: ["Le mois de Ramadan", "Le mois de Chawwal", "Le mois de janvier", "Pendant les vacances d'été"],
          en: ["The month of Ramadan", "The month of Shawwal", "The month of January", "During summer vacation"],
          ar: ["شهر رمضان المبارك", "شهر شوال", "شهر يناير", "أيام العطلة الصيفية"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Très bien ! Ramadan est le mois du Coran, du partage et de la joie en famille !",
          en: "Great job! Ramadan is the month of the Quran, sharing, and family joy!",
          ar: "أحسنت! رمضان شهر الخير وتلاوة القرآن والمودة والتراويح."
        },
        explanation: {
          fr: "Le jeûne nous apprend la patience, la compassion envers ceux qui ont faim et la maîtrise de soi.",
          en: "Fasting teaches us patience, caring for those who are hungry, and self-control.",
          ar: "الصيام يعلمنا الصبر والرحمة بالفقراء وشكر نعم الله علينا."
        }
      },
      {
        id: 4,
        emoji: "🕋",
        question: {
          fr: "Vers quelle ville sainte se dirigent les pèlerins pour accomplir le Hajj ?",
          en: "To which holy city do pilgrims travel to perform the Hajj?",
          ar: "إلى أي مدينة مباركة يسافر الحجاج لأداء فريضة الحج والطواف بالكعبة؟"
        },
        options: {
          fr: ["La Mecque (Makkah Al-Mukarramah)", "Le Caire", "Paris", "Istanbul"],
          en: ["Makkah (Mecca)", "Cairo", "Paris", "Istanbul"],
          ar: ["مكة المكرمة", "القاهرة", "باريس", "إسطنبول"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Bravo ! La Kaaba à La Mecque est la direction de notre prière (Qibla) !",
          en: "Bravo! The Kaaba in Makkah is the direction of our daily prayers (Qiblah)!",
          ar: "بارك الله فيك! مكة المكرمة بها المسجد الحرام وقبلة المسلمين جميعاً."
        },
        explanation: {
          fr: "Le Hajj est le 5ème pilier de l'Islam pour ceux qui en ont la capacité physique et financière.",
          en: "Hajj is the 5th pillar of Islam for those who have the means to travel.",
          ar: "الحج هو الركن الخامس لمن استطاع إليه سبيلاً من المسلمين."
        }
      }
    ]
  },
  {
    id: "module-prophete-muhammad",
    title: {
      fr: "3. Le Prophète Muhammad ﷺ, notre modèle",
      en: "3. Prophet Muhammad ﷺ, Our Role Model",
      ar: "٣. نبينا محمد ﷺ قدوتنا وحبيبنا"
    },
    subtitle: {
      fr: "Sa gentillesse, son sourire et son amour des enfants !",
      en: "His kindness, his sweet smile, and his love for children!",
      ar: "رحمته الواسعة وابتسامته الجميلة ومحبته للصغار والضعفاء!"
    },
    description: {
      fr: "Découvre la vie magnifique de notre Bien-Aimé Prophète ﷺ, son honnêteté et sa douceur.",
      en: "Discover the beautiful character, honesty, and gentle kindness of our beloved Prophet ﷺ.",
      ar: "تعرف على سيرة النبي الصادق الأمين وكيف كان يعامل الناس برفق وإحسان."
    },
    ageRange: "6 - 12 ans",
    icon: "🌸",
    themeColor: "from-rose-500 to-pink-500",
    badge: {
      id: "badge-prophete",
      name: {
        fr: "Ami du Prophète ﷺ",
        en: "Friend of the Prophet ﷺ",
        ar: "محب الحبيب المصطفى ﷺ"
      },
      icon: "🌸",
      color: "#EC4899",
      bgGradient: "from-pink-500 via-rose-500 to-pink-600",
      description: {
        fr: "Pour l'enfant qui connaît le Messager d'Allah ﷺ et s'inspire de sa douceur au quotidien.",
        en: "For the child who cherishes the Messenger of Allah ﷺ and follows his kind example.",
        ar: "وسام الشرف لمن أحب رسول الله ﷺ واتبع سنته في الصدق وحسن الخلق."
      },
      virtue: {
        fr: "Douceur & Miséricorde",
        en: "Gentleness & Mercy",
        ar: "الرحمة والرفق بالخلق"
      }
    },
    questions: [
      {
        id: 1,
        emoji: "🌺",
        question: {
          fr: "Quel surnom donnait-on au Prophète Muhammad ﷺ avant même la prophétie pour sa grande sincérité ?",
          en: "What title did people give Prophet Muhammad ﷺ even before prophethood because of his honesty?",
          ar: "بماذا كان يُلقب النبي محمد ﷺ قبل البعثة لشدة أمانته وصدقه بين قومه؟"
        },
        options: {
          fr: ["Al-Amîne (Le digne de confiance / Le véridique)", "Le marchand pressé", "Le voyageur", "Le roi"],
          en: ["Al-Ameen (The Trustworthy)", "The hurried trader", "The traveler", "The king"],
          ar: ["الصادق الأمين", "التاجر السريع", "المسافر العابر", "الحاكم فقط"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Exactement ! Il était réputé pour ne jamais mentir et garder les dépôts en sûreté !",
          en: "Exactly! He was famous for never lying and always keeping promises safe!",
          ar: "إجابة ممتازة! كان الجميع يأتمنه لصدقه المطلق ونقائه."
        },
        explanation: {
          fr: "Le Prophète ﷺ nous encourage à toujours dire la vérité, même quand c'est difficile.",
          en: "The Prophet ﷺ encourages us to always speak the truth, even when it feels tough.",
          ar: "الصدق والأمانة هما زينة الطفل المسلم وتاج أخلاقه."
        }
      },
      {
        id: 2,
        emoji: "😊",
        question: {
          fr: "Le Prophète ﷺ a dit : 'Sourire à ton frère ou ta sœur est...'",
          en: "The Prophet ﷺ said: 'Smiling at your brother or sister is...'",
          ar: "قال رسول الله ﷺ: «تبسمك في وجه أخيك لك...»"
        },
        options: {
          fr: ["Une aumône (Sadaqah) récompensée par Allah", "Une perte de temps", "Interdit", "Juste un jeu"],
          en: ["A charity (Sadaqah) rewarded by Allah", "A waste of time", "Not allowed", "Just a game"],
          ar: ["صدقة تؤجر عليها", "تضييع للوقت", "أمر غير مستحب", "مجرد مزحة"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Māshā'Allāh ! Ton sourire réchauffe les cœurs et t'offre des récompenses !",
          en: "Māshā’Allāh! Your smile warms hearts and earns beautiful rewards from Allah!",
          ar: "ما شاء الله! الابتسامة الصافية صدقة تنشر المحبة والبهجة."
        },
        explanation: {
          fr: "Le Prophète ﷺ était le plus souriant des hommes avec sa famille et ses compagnons.",
          en: "The Prophet ﷺ was the most cheerful and smiling of people around his family and friends.",
          ar: "كان النبي ﷺ دائم التبسم طلق الوجه محبوباً من الصغار والكبار."
        }
      },
      {
        id: 3,
        emoji: "🐱",
        question: {
          fr: "Comment le Prophète ﷺ nous demandait-il de traiter les animaux et les oiseaux ?",
          en: "How did the Prophet ﷺ instruct us to treat animals and birds?",
          ar: "كيف أمرنا رسول الله ﷺ أن نعامل الحيوانات والطيور والقطط؟"
        },
        options: {
          fr: ["Avec douceur, soin et miséricorde", "En leur faisant peur", "En les enfermant sans eau", "En les ignorant"],
          en: ["With gentleness, care, and mercy", "By scaring them", "By locking them without water", "By ignoring them"],
          ar: ["بالرفق والرحمة وإطعامها", "بإخافتها والاعتداء عليها", "بحبسها دون طعام", "بإيذائها"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Bravo ! Allah aime ceux qui sont doux avec toutes Ses créatures !",
          en: "Well done! Allah loves those who are gentle with all of His creatures!",
          ar: "أحسنت صنعاً! الرفق بالحيوان باب عظيم لنيل مغفرة الله ورحمته."
        },
        explanation: {
          fr: "Une personne est entrée au Paradis pour avoir donné à boire avec tendresse à un chien assoiffé !",
          en: "A person entered Paradise simply for giving water to a thirsty puppy!",
          ar: "دخل رجل الجنة في كلب سقاه ماء من بئر برحمته، فغفر الله له."
        }
      },
      {
        id: 4,
        emoji: "🕊️",
        question: {
          fr: "Que dit-on chaque fois qu'on entend ou prononce le prénom de notre Prophète Muhammad ?",
          en: "What do we say whenever we hear or say the name of our Prophet Muhammad?",
          ar: "ماذا نقول من الصلاة والسلام كلما ذكر اسم نبينا محمد؟"
        },
        options: {
          fr: ["Sallallāhu 'alayhi wa sallam (Que la paix et la prière d'Allah soient sur lui)", "Au revoir", "Merci", "Silence"],
          en: ["Sallallahu alayhi wa sallam (Peace and blessings of Allah be upon him)", "Goodbye", "Thank you", "Silence"],
          ar: ["صلى الله عليه وسلم", "صباح الخير", "شكراً", "لا شيء"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Magnifique ! Quiconque prie sur le Prophète une fois, Allah le bénit dix fois !",
          en: "Magnificent! Whoever sends blessings on the Prophet once, Allah blesses them ten times!",
          ar: "بارك الله فيك! من صلى على النبي ﷺ صلاة صلى الله عليه بها عشراً."
        },
        explanation: {
          fr: "Prier sur le Prophète ﷺ remplit notre journée de paix et d'amour.",
          en: "Sending blessings upon the Prophet ﷺ fills our entire day with light and peace.",
          ar: "الصلاة على النبي ﷺ من أطيب الأذكار وأعظمها ثواباً وقرباً منه في الجنة."
        }
      }
    ]
  },
  {
    id: "module-bon-comportement",
    title: {
      fr: "4. Les Bonnes Manières (Adab & Akhlaq)",
      en: "4. Beautiful Manners (Adab & Akhlaq)",
      ar: "٤. مكارم الأخلاق والآداب الإسلامية"
    },
    subtitle: {
      fr: "Le respect des parents, la politesse et la gentillesse !",
      en: "Honoring parents, politeness, and spreading kindness!",
      ar: "بر الوالدين، الكلمة الطيبة، وحسن الجوار والتعاون!"
    },
    description: {
      fr: "Apprends les comportements aimés d'Allah : obéir avec amour à ses parents, dire la vérité et partager.",
      en: "Learn the virtues loved by Allah: loving your parents, speaking truth, and sharing joy.",
      ar: "تعلم خصال الإيمان: بر الوالدين والإحسان إلى الأهل والأصدقاء وحب الخير للناس."
    },
    ageRange: "6 - 12 ans",
    icon: "🛡️",
    themeColor: "from-blue-600 to-indigo-600",
    badge: {
      id: "badge-adab",
      name: {
        fr: "Cœur Pur & Généreux",
        en: "Pure & Generous Heart",
        ar: "فارس الأخلاق الفاضلة"
      },
      icon: "🛡️",
      color: "#3B82F6",
      bgGradient: "from-blue-500 via-indigo-600 to-blue-700",
      description: {
        fr: "Attribué à l'enfant qui pratique la gentillesse, la politesse et le respect envers ses parents.",
        en: "Awarded to the child practicing kindness, politeness, and deep respect for parents.",
        ar: "وسام التميز للطفل البار بوالديه اللطيف مع إخوانه والناصح بالخير."
      },
      virtue: {
        fr: "Politesse & Respect filial",
        en: "Politeness & Honoring Parents",
        ar: "بر الوالدين وحسن المعاملة"
      }
    },
    questions: [
      {
        id: 1,
        emoji: "👨‍👩‍👧",
        question: {
          fr: "Quelles personnes méritent le plus notre respect, notre écoute et nos doux câlins après Allah et Son Prophète ?",
          en: "Who deserves the greatest respect, love, and obedience after Allah and His Prophet?",
          ar: "من أحق الناس بحسن صحبتك وبرك وطاعتك بالمعروف بعد الله ورسوله؟"
        },
        options: {
          fr: ["Nos chers parents (Maman et Papa)", "Les joueurs de football", "Les voisins inconnus", "Les héros de dessins animés"],
          en: ["Our dear parents (Mother and Father)", "Football players", "Unknown strangers", "Cartoon characters"],
          ar: ["الوالدان الكريمان (أمي وأبي)", "مشاهير الكرة فقط", "الغرباء", "أبطال الرسوم المتحركة"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Māshā'Allāh ! Le Paradis se trouve sous les pieds des mamans !",
          en: "Māshā’Allāh! Paradise lies at the feet of our loving mothers!",
          ar: "أحسنت! رضا الله في رضا الوالدين، وبرهما طريقك إلى الجنة."
        },
        explanation: {
          fr: "Allah a lié Son adoration au bon comportement envers les parents dans le Coran.",
          en: "Allah commanded us to worship Him alone and be loving and dutiful to our parents.",
          ar: "قال تعالى: {وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا}."
        }
      },
      {
        id: 2,
        emoji: "👋",
        question: {
          fr: "Comment salue-t-on un frère ou une sœur en Islam pour lui souhaiter la paix ?",
          en: "How does a Muslim greet another person to wish them true divine peace?",
          ar: "ما هي تحية الإسلام المباركة التي نلقيها على من نلقاه؟"
        },
        options: {
          fr: ["As-Salāmu 'Alaykum wa Rahmatullāh (Que la paix et la miséricorde d'Allah soient sur vous)", "Salut toi", "Hé là-bas", "Rien du tout"],
          en: ["As-Salamu Alaykum wa Rahmatullah (Peace and mercy of Allah be upon you)", "Hey there", "Yo", "Nothing"],
          ar: ["السلام عليكم ورحمة الله وبركاته", "أهلاً فقط", "مرحباً يا هذا", "السكوت"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Magnifique ! Répandre le Salam sème l'amour entre tous les croyants !",
          en: "Magnificent! Spreading Salam plants peace and love between everyone!",
          ar: "رائع جداً! إفشاء السلام من أحب الأعمال التي تدخلنا الجنة بالمودة."
        },
        explanation: {
          fr: "Le mot 'Salām' signifie la Paix. C'est l'une des salutations les plus douces de la terre.",
          en: "Salam means Peace. It is the greeting of the believers and angels in Paradise.",
          ar: "تحية أهل الجنة يوم يلقونه سلام، وهي دعاء بالأمن والرحمة."
        }
      },
      {
        id: 3,
        emoji: "🎁",
        question: {
          fr: "Si un ami à l'école ou à la mosquée n'a pas de goûter ou de jouet, que fait un enfant au cœur noble ?",
          en: "If a friend at school or the mosque has no snack or toy, what does a kind Muslim child do?",
          ar: "إذا رأيت زميلاً لك في المدرسة ليس معه طعام أو قلم، ماذا تفعل بنبل وإحسان؟"
        },
        options: {
          fr: ["Je partage avec lui avec le sourire", "Je me moque de lui", "Je lui cache mes affaires", "Je le laisse seul"],
          en: ["I gladly share with them with a warm smile", "I make fun of them", "I hide my things", "I leave them alone"],
          ar: ["أشاركه طعامي وأساعده بابتسامة ومحبة", "أسخر منه", "أخفي أشيائي عنه", "أتركه وحيداً حزيناً"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Bravo ! Le Prophète ﷺ a dit : 'Nul d'entre vous n'est véritablement croyant tant qu'il n'aime pas pour son frère ce qu'il aime pour lui-même !'",
          en: "Bravo! The Prophet ﷺ said: 'None of you truly believes until he loves for his brother what he loves for himself!'",
          ar: "ما شاء الله! قال ﷺ: «لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه»."
        },
        explanation: {
          fr: "La générosité et le partage transforment notre cœur en une source de joie.",
          en: "Generosity and sharing make our hearts shine with pure light.",
          ar: "الكرم والإيثار من شيم الأنبياء وأصحاب القلوب الرحيمة."
        }
      },
      {
        id: 4,
        emoji: "🧹",
        question: {
          fr: "Le Prophète ﷺ nous a appris que retirer une branche épineuse ou un déchet du chemin est :",
          en: "The Prophet ﷺ taught that removing a harmful thorn or trash from the pathway is:",
          ar: "ما حكم إماطة الأذى والقمامة وغصن الشوك عن طريق المارة في الإسلام؟"
        },
        options: {
          fr: ["Une aumône et une branche de la foi (Sadaqah)", "Inutile", "Fatigant sans raison", "Interdit"],
          en: ["A charity and a branch of true faith (Sadaqah)", "Useless", "Tiring for no reason", "Forbidden"],
          ar: ["شعبة من شعب الإيمان وصدقة يؤجر عليها فاعلها", "عمل لا فائدة منه", "تعب بلا أجر", "مكروه"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Très bien ! Protéger les autres et garder son environnement propre plaît à Allah !",
          en: "Great! Keeping the pathways clean and safe pleases Allah immensely!",
          ar: "أحسنت! نظافة الطريق وإماطة الأذى من كمال الإيمان ورقي المسلم."
        },
        explanation: {
          fr: "La propreté fait partie de la foi et chaque geste d'aide est inscrit auprès d'Allah.",
          en: "Purity and cleanliness are part of faith, and every helpful deed is noted by angels.",
          ar: "النظافة وإماطة الأذى تحفظ سلامة الناس وتكسبك حب الله ورضوانه."
        }
      }
    ]
  },
  {
    id: "module-histoires-prophetes",
    title: {
      fr: "5. Merveilleuses Histoires du Coran",
      en: "5. Wonderful Stories of the Quran",
      ar: "٥. قصص الأنبياء الرائعة في القرآن"
    },
    subtitle: {
      fr: "L'arche de Noé, Jonas dans la baleine et le courage d'Ibrahim !",
      en: "Noah's Ark, Yunus in the whale, and Ibrahim's courage!",
      ar: "سفينة نوح، يونس في بطن الحوت، وشجاعة خليل الله إبراهيم!"
    },
    description: {
      fr: "Voyage à travers les plus beaux récits des Prophètes et découvre leur immense confiance en Allah.",
      en: "Journey through the greatest prophetic stories and discover their deep trust in Allah.",
      ar: "سافر مع أروع قصص الأنبياء واكتشف ثقتهم المطلقة بنصر الله ورعايته."
    },
    ageRange: "6 - 12 ans",
    icon: "📜",
    themeColor: "from-purple-600 to-violet-600",
    badge: {
      id: "badge-histoires",
      name: {
        fr: "Explorateur du Coran",
        en: "Quran Explorer",
        ar: "مستكشف سير الأنبياء"
      },
      icon: "📜",
      color: "#8B5CF6",
      bgGradient: "from-purple-500 via-violet-600 to-indigo-700",
      description: {
        fr: "Attribué aux jeunes auditeurs qui retiennent les sagesses et le courage des nobles Prophètes.",
        en: "Awarded to young listeners who remember the bravery and wisdom of the Prophets.",
        ar: "وسام الحكمة للطفل الذي استمع إلى قصص الأنبياء وتعلّم منها الصبر واليقين."
      },
      virtue: {
        fr: "Courage & Confiance en Allah",
        en: "Courage & Trust in Allah",
        ar: "الشجاعة والتوكل على الله"
      }
    },
    questions: [
      {
        id: 1,
        emoji: "🚢",
        question: {
          fr: "Quel Prophète a construit une grande arche de bois sur ordre d'Allah pour sauver les croyants et les animaux ?",
          en: "Which Prophet built a great wooden Ark by Allah's command to save the believers and animals?",
          ar: "من هو النبي الصابر الذي بنى السفينة العظيمة بأمر ربه لنجاة المؤمنين وأزواج الحيوانات؟"
        },
        options: {
          fr: ["Le Prophète Noé (Nuh عليه السلام)", "Le Prophète Adam", "Le Prophète Ayyub", "Le Prophète Zakariya"],
          en: ["Prophet Nuh (Noah عليه السلام)", "Prophet Adam", "Prophet Ayyub", "Prophet Zakariya"],
          ar: ["نبي الله نوح عليه السلام", "آدم عليه السلام", "أيوب عليه السلام", "زكريا عليه السلام"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Māshā'Allāh ! Noé a fait preuve d'une patience exemplaire pendant des siècles !",
          en: "Māshā’Allāh! Nuh showed incredible patience and trust in Allah!",
          ar: "ما شاء الله! نوح عليه السلام شيخ المرسلين دعا قومه بالصبر سنين طويلة."
        },
        explanation: {
          fr: "Noé fit monter dans l'arche un couple de chaque espèce d'animal pour protéger la vie sur Terre.",
          en: "Prophet Nuh took pairs of animals onto the ark to preserve life on earth by Allah's grace.",
          ar: "حمل نوح في سفينته من كل زوجين اثنين وحماه الله من الطوفان."
        }
      },
      {
        id: 2,
        emoji: "🐋",
        question: {
          fr: "Dans le ventre de quel animal marin géant le Prophète Jonas (Yunus عليه السلام) a-t-il invoqué Allah dans les ténèbres ?",
          en: "Inside which giant sea creature did Prophet Yunus (Jonah عليه السلام) call upon Allah in deep darkness?",
          ar: "في بطن أي مخلوق بحري عظيم سبح نبي الله يونس عليه السلام ودعا ربه في الظلمات؟"
        },
        options: {
          fr: ["Une baleine (le grand poisson / Al-Hout)", "Un requin", "Une tortue", "Un dauphin"],
          en: ["A whale (the great fish / Al-Hut)", "A shark", "A turtle", "A dolphin"],
          ar: ["الحوت العظيم", "القرش", "السلحفاة", "الدلفين الصغير"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Bravo ! Il a répété : 'Lā ilāha illā Anta, Subḥānaka, innī kuntu min aẓ-ẓālimīn' et Allah l'a sauvé !",
          en: "Bravo! He called out: 'There is no deity except You; exalted are You; indeed, I was wrong', and Allah saved him!",
          ar: "أحسنت! نادى في الظلمات: {لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ} فاستجاب الله له."
        },
        explanation: {
          fr: "Cette invocation magnifique délivre de toutes les angoisses quand on la récite avec foi.",
          en: "This prayer is famous for bringing relief from worry whenever recited with sincere faith.",
          ar: "دعاء ذي النون في بطن الحوت يفرج الله به كرب كل مؤمن يدعو به مخلصاً."
        }
      },
      {
        id: 3,
        emoji: "🌊",
        question: {
          fr: "Quel Prophète a frappé la mer de son bâton sur ordre d'Allah pour laisser passer son peuple à sec ?",
          en: "Which Prophet struck the sea with his staff by Allah's order so the sea split open safely?",
          ar: "من هو كليم الله الذي ضرب البحر بعصاه فانفلق له طريق يابس نجا به قومه من فرعون؟"
        },
        options: {
          fr: ["Le Prophète Moïse (Moussa عليه السلام)", "Le Prophète Daoud", "Le Prophète Ismaïl", "Le Prophète Yahya"],
          en: ["Prophet Musa (Moses عليه السلام)", "Prophet Dawud", "Prophet Ismail", "Prophet Yahya"],
          ar: ["نبي الله موسى عليه السلام", "داود عليه السلام", "إسماعيل عليه السلام", "يحيى عليه السلام"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Superbe ! La mer s'est ouverte en deux murailles d'eau grâce au pouvoir d'Allah !",
          en: "Superb! The sea split like two towering cliffs of water by Allah's mighty command!",
          ar: "ممتاز! قال موسى بيقين: {كَلَّا إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ} فنجاه الله."
        },
        explanation: {
          fr: "Moïse avait une confiance absolue en Allah, disant : 'Mon Seigneur est avec moi, Il va me guider !'",
          en: "Prophet Musa had unshakeable faith, telling his people: 'My Lord is with me; He will guide me!'",
          ar: "التوكل واليقين بنصر الله يصنع المعجزات ويفرّج أصعب الأوقات."
        }
      },
      {
        id: 4,
        emoji: "🐦",
        question: {
          fr: "Quel roi et Prophète pieux comprenait le langage des animaux, des oiseaux et des fourmis ?",
          en: "Which righteous Prophet and King was blessed with understanding the speech of animals, birds, and ants?",
          ar: "من هو النبي الملك الصالح الذي علمه الله لغة الطير ومنطق الحيوانات وكلام النمل؟"
        },
        options: {
          fr: ["Le Prophète Salomon (Sulayman عليه السلام)", "Le Prophète Haroun", "Le Prophète Chouayb", "Le Prophète Lut"],
          en: ["Prophet Sulayman (Solomon عليه السلام)", "Prophet Harun", "Prophet Shuayb", "Prophet Lut"],
          ar: ["نبي الله سليمان عليه السلام", "هارون عليه السلام", "شعيب عليه السلام", "لوط عليه السلام"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Māshā'Allāh ! Malgré son immense pouvoir, il restait un serviteur humble et reconnaissant !",
          en: "Māshā’Allāh! Despite possessing great kingdom and power, he remained humble and grateful to Allah!",
          ar: "بارك الله فيك! تبسم سليمان ضاحكاً من قول النملة وحمد ربه على هذه النعمة."
        },
        explanation: {
          fr: "Sulayman a souri avec tendresse en entendant une petite fourmi alerter ses compagnes !",
          en: "Sulayman smiled kindly when he heard a tiny ant warning her colony to step aside safely.",
          ar: "قصة سليمان مع النملة والهدهد تعلمنا التواضع والاهتمام بأضعف المخلوقات."
        }
      }
    ]
  },
  {
    id: "module-petites-invocations",
    title: {
      fr: "6. Mes Petites Invocations Quotidiennes",
      en: "6. My Daily Little Du'as",
      ar: "٦. أذكاري وأدعيتي اليومية الجميلة"
    },
    subtitle: {
      fr: "Des mots doux pour chaque instant de la journée !",
      en: "Sweet words to remember Allah morning to night!",
      ar: "كلمات نورانية تحفظنا من الصباح إلى المساء!"
    },
    description: {
      fr: "Apprends les dou'as faciles avant de dormir, en te réveillant, en entrant chez toi ou quand tu éternues.",
      en: "Learn easy daily du'as for sleeping, waking up, entering home, sneezing, and riding a ride.",
      ar: "احفظ أذكار النوم والاستيقاظ والعطاس ودخول المنزل بسهولة وبركة."
    },
    ageRange: "6 - 12 ans",
    icon: "🌙",
    themeColor: "from-teal-600 to-cyan-600",
    badge: {
      id: "badge-douas",
      name: {
        fr: "Perle des Invocations",
        en: "Du'a Jewel",
        ar: "درة الأذكار الصادقة"
      },
      icon: "🌙",
      color: "#06B6D4",
      bgGradient: "from-teal-500 via-cyan-600 to-teal-700",
      description: {
        fr: "Décerné au petit cœur qui illumine sa journée en se rappelant d'Allah du matin au coucher.",
        en: "Awarded to the young heart who lights up the day with prayers from morning to bedtime.",
        ar: "وسام مبارك للطفل الذي يحفظ أذكاره اليومية ويحصن نفسه بذكر الرحمن."
      },
      virtue: {
        fr: "Protection & Souvenir d'Allah",
        en: "Protection & Remembrance",
        ar: "دوام ذكر الله وحصنه الحصين"
      }
    },
    questions: [
      {
        id: 1,
        emoji: "🤧",
        question: {
          fr: "Quand un musulman éternue, il dit 'Al-Hamdulillah'. Que lui répond gentiment celui qui l'entend ?",
          en: "When a Muslim sneezes, they say 'Al-Hamdulillah'. What do we kindly reply to them?",
          ar: "إذا عطس المسلم وقال (الحمد لله)، فماذا يرد عليه أخوه المسلم بالدعاء والرحمة؟"
        },
        options: {
          fr: ["Yarḥamukallāh (Qu'Allah te fasse miséricorde)", "Chut", "À tes souhaits sans plus", "Rien du tout"],
          en: ["Yarhamukallah (May Allah have mercy on you)", "Shh", "Just bless you", "Nothing at all"],
          ar: ["يرحمك الله", "اسكت", "صحة فقط", "لا شيء"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Très bien ! Et la personne qui a éternué répond : 'Yahdīkumullāh wa yuṣliḥu bālakum' !",
          en: "Great job! And the sneezer replies back: 'May Allah guide you and set your affairs right'!",
          ar: "أحسنت! ثم يجيبه العاطس: (يهديكم الله ويصلح بالكم)."
        },
        explanation: {
          fr: "Cette belle règle sème la fraternité et le souhait de santé entre tous les amis.",
          en: "This loving prophetic habit spreads warmth, care, and good health among everyone.",
          ar: "تشميت العاطس ينشر المودة والمحبة بين المسلمين."
        }
      },
      {
        id: 2,
        emoji: "🛏️",
        question: {
          fr: "Que récite-t-on souvent avant de fermer les yeux pour s'endormir sous la protection d'Allah ?",
          en: "What short beautiful Surahs do we recite before sleeping to be protected by Allah?",
          ar: "ما هي السور القرآنية الثلاث المباركة التي نجمع كفينا ونقرؤها قبل النوم للحفظ؟"
        },
        options: {
          fr: ["Al-Ikhlas (Le Monothéisme pur), Al-Falaq et An-Nas (Les Protectrices)", "Une chanson", "Une histoire sans Coran", "Rien"],
          en: ["Al-Ikhlas, Al-Falaq, and An-Nas (The Protecting Surahs)", "A song", "A bedtime fairy tale", "Nothing"],
          ar: ["المعوذات وسورة الإخلاص (الفلق، الناس، الإخلاص)", "أغنية أطفال", "حكاية خيالية فقط", "النوم دون ذكر"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Māshā'Allāh ! Ces sourates protègent tes doux rêves toute la nuit avec les anges !",
          en: "Māshā’Allāh! These surahs protect your peaceful dreams all night long with angels!",
          ar: "ما شاء الله! كان النبي ﷺ يقرأ المعوذات ويمسح بها جسده الشريف قبل النوم."
        },
        explanation: {
          fr: "Le Prophète ﷺ soufflait doucement dans ses mains après les avoir récitées et passait ses mains sur son corps.",
          en: "Prophet Muhammad ﷺ would cup his hands, recite them, blow gently, and wipe over his body.",
          ar: "قراءة المعوذات وآية الكرسي قبل النوم حصن منيع من الكوابيس ووساوس الشيطان."
        }
      },
      {
        id: 3,
        emoji: "🚪",
        question: {
          fr: "En entrant dans la maison, que dit un enfant poli pour bénir son foyer ?",
          en: "When entering home, what does a polite Muslim child say to bring peace to the house?",
          ar: "ماذا يقول الطفل المبارك عند دخول بيته لتنزل البركة ويهرب الشيطان؟"
        },
        options: {
          fr: ["Bismillah et As-Salāmu 'Alaykum à sa famille", "Donnez-moi à manger", "J'arrive en criant", "Rien du tout"],
          en: ["Bismillah and As-Salamu Alaykum to the family", "Give me food", "Shouting loud", "Nothing"],
          ar: ["بسم الله والسلام عليكم ورحمة الله", "أين طعامي بسرعة", "الصراخ والدخول مسرعاً", "الدخول بصمت"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Bravo ! Quand on dit 'Bismillah' et le Salam en entrant, le diable ne peut pas dormir dans la maison !",
          en: "Bravo! Saying 'Bismillah' and Salam when entering prevents shaytan from entering the home!",
          ar: "أحسنت! إذا دخل الرجل بيته فذكر الله وسلم، قال الشيطان لأعوانه: لا مبيت لكم الليلة."
        },
        explanation: {
          fr: "Le Salam apporte la douceur et la sérénité dans chaque pièce de la maison.",
          en: "The greeting of Salam fills every room of the home with angels and serenity.",
          ar: "السلام يدخل البهجة على قلب الوالدين والإخوة ويجعل البيت مباركاً."
        }
      },
      {
        id: 4,
        emoji: "☀️",
        question: {
          fr: "Au réveil le matin, que dit-on pour remercier Allah de nous avoir redonné la vie après le sommeil ?",
          en: "When waking up in the morning, what do we say to thank Allah for giving us life after sleep?",
          ar: "ماذا نقول في أذكار الصباح فور الاستيقاظ من النوم شاكرين فضل الله؟"
        },
        options: {
          fr: ["Al-Hamdulillāh alladhī aḥyānā ba'da mā amātanā wa ilayhin-nuchūr", "Je veux encore dormir", "Quel ennui", "Où est mon téléphone"],
          en: ["Al-Hamdulillah alladhi ahyana ba'da ma amatana wa ilayhin-nushur", "I want to sleep more", "How boring", "Where is my screen"],
          ar: ["الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور", "أريد النوم مجدداً", "يا له من يوم ممل", "أين الشاشة والهاتف"]
        },
        correctAnswerIndex: 0,
        praise: {
          fr: "Splendide ! Commencer sa journée en remerciant Allah illumine toutes tes heures !",
          en: "Splendid! Starting the day by thanking Allah fills every morning with sunshine and joy!",
          ar: "ممتاز جداً! من بدأ يومه بحمد الله وشكره كان في حفظ الله ورعايته طوال اليوم."
        },
        explanation: {
          fr: "Le sommeil est comme une petite mort, et se réveiller en bonne santé est un don merveilleux d'Allah.",
          en: "Sleep is like a mini pause in life, and waking up healthy is a precious gift from Allah.",
          ar: "الاستيقاظ بنشاط وصحة نعمة عظيمة تستوجب الحمد والثناء على الله."
        }
      }
    ]
  }
];
