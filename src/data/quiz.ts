import { Quiz } from '../types';

export const quizzes: Quiz[] = [
  {
    id: "piliers-islam",
    title: {
      fr: "Les 5 Piliers de l'Islam",
      en: "The 5 Pillars of Islam",
      ar: "أركان الإسلام الخمسة"
    },
    description: {
      fr: "Testez vos connaissances sur les fondements de la pratique islamique qui structurent la vie quotidienne du croyant.",
      en: "Test your knowledge on the foundational pillars that structure every believer's spiritual and practical life.",
      ar: "اختبر فقهك بأركان الإسلام التي بني عليها هذا الدين القويم وعلاقتها بالعبادات اليومية."
    },
    difficulty: "debutant",
    category: "piliers",
    questionsCount: 5,
    questions: [
      {
        id: 1,
        question: {
          fr: "Quel est le premier pilier de l'Islam, fondement de la croyance ?",
          en: "What is the first pillar of Islam, the foundation of belief?",
          ar: "ما هو الركن الأول من أركان الإسلام، الذي يمثل أساس العقيدة الإيمانية ؟"
        },
        options: {
          fr: [
            "La prière (As-Salat)",
            "L'attestation de foi (Ash-Shahada)",
            "L'aumône (Az-Zakat)",
            "Le jeûne (As-Siyam)"
          ],
          en: [
            "The Prayer (As-Salah)",
            "The Testimony of Faith (Ash-Shahadah)",
            "The Charity (Al-Zakah)",
            "The Fasting (As-Siyam)"
          ],
          ar: [
            "الصلاة",
            "الشهادتان (شهادة أن لا إله إلا الله وأن محمداً رسول الله)",
            "إيتاء الزكاة",
            "صوم رمضان"
          ]
        },
        correctAnswerIndex: 1,
        explanation: {
          fr: "L'attestation de foi (Ash-Shahada) : témoigner de l'unicité d'Allah et de la mission prophétique de Muhammad ﷺ est la porte d'entrée en Islam.",
          en: "The Testimony of Faith (Ash-Shahadah): witnessing Allah's absolute oneness and the prophetic mission of Muhammad ﷺ is the gateway to Islam.",
          ar: "الشهادتان هما مفتاح الدخول في الإسلام وعماد التوحيد الخالص لله عز وجل."
        }
      },
      {
        id: 2,
        question: {
          fr: "Combien de prières rituelles obligatoires (Fard) le musulman doit-il accomplir par jour ?",
          en: "How many obligatory ritual prayers (Fard) must a Muslim perform each day?",
          ar: "كم عدد الصلوات المكتوبة المفروضة على المسلم في اليوم والليلة ؟"
        },
        options: {
          fr: ["3 prières", "5 prières", "7 prières", "4 prières"],
          en: ["3 prayers", "5 prayers", "7 prayers", "4 prayers"],
          ar: ["ثلاث صلوات", "خمس صلوات", "سبع صلوات", "أربع صلوات"]
        },
        correctAnswerIndex: 1,
        explanation: {
          fr: "Les 5 prières quotidiennes obligatoires : Fajr, Dhuhr, Asr, Maghrib et Isha, instituées lors du voyage nocturne (Laila al-Isra' wal-Mi'raj).",
          en: "The 5 daily prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha, established during the Night Journey (Isra and Mi'raj).",
          ar: "الصلوات الخمس هي: الفجر، والظهر، والعصر، والمغرب، والعشاء، فرضت في ليلة الإسراء والمعراج لتربط العبد بخالقه."
        }
      },
      {
        id: 3,
        question: {
          fr: "Quel pourcentage approximatif de l'épargne annuelle constitue généralement la Zakat al-Maal ?",
          en: "What is the approximate percentage of annual savings that constitutes Zakat al-Maal?",
          ar: "ما هي النسبة المئوية المحددة شرعاً لإخراج زكاة المال عند بلوغ النصاب وحولان الحول ؟"
        },
        options: {
          fr: ["1%", "2,5%", "5%", "10%"],
          en: ["1%", "2.5%", "5%", "10%"],
          ar: ["1% من المال", "2.5% (ربع العشر)", "5%", "10%"]
        },
        correctAnswerIndex: 1,
        explanation: {
          fr: "La Zakat al-Maal correspond à 2,5 % de l'épargne stagnante supérieure au seuil légal (Nissab) durant une année lunaire complète.",
          en: "Zakat al-Maal is 2.5% of stagnant wealth exceeding the threshold (Nisab) held for a full lunar year.",
          ar: "الزكاة تبلغ ربع العشر أي بنسبة 2.5% من المال المدخر الذي بلغ النصاب وحال عليه الحول القمري."
        }
      },
      {
        id: 4,
        question: {
          fr: "Durant quel mois sacré de l'année islamique le jeûne obligatoire est-il prescrit ?",
          en: "During which sacred month of the Islamic year is the obligatory fast prescribed?",
          ar: "في أي شهر هجري من السنة القمرية يفرض صيام شهر كامل كأحد أركان الإسلام المقررة ؟"
        },
        options: {
          fr: ["Muharram", "Rajab", "Chawwal", "Ramadan"],
          en: ["Muharram", "Rajab", "Shawwal", "Ramadan"],
          ar: ["محرم", "رجب", "شوال", "رمضان المبارك"]
        },
        correctAnswerIndex: 3,
        explanation: {
          fr: "Le jeûne est obligatoire durant le mois de Ramadan, mois de la révélation du Coran (Sourate Al-Baqarah, Verset 185).",
          en: "Fasting is compulsory during the month of Ramadan, the month the Quran was revealed (Surah Al-Baqarah, Verse 185).",
          ar: "فرض الصيام في شهر رمضان المبارك، وهو الشهر الذي أنزل فيه القرآن هدى للناس وبينات من الهدى والفرقان."
        }
      },
      {
        id: 5,
        question: {
          fr: "Sous quelle condition obligatoire le pèlerinage (Hajj) à la Mecque est-il exigé ?",
          en: "Under what mandatory condition is the Pilgrimage (Hajj) to Mecca required?",
          ar: "ما هو الشرط الجوهري المقترن بأداء فريضة الحج إلى بيت الله الحرام بمكة المكرمة ؟"
        },
        options: {
          fr: [
            "Être âgé de plus de 40 ans",
            "En avoir les capacités physiques et financières",
            "Avoir complété 10 ans de prières",
            "Être accompagné de toute sa famille"
          ],
          en: [
            "Being over 40 years old",
            "Having physical and financial capability",
            "Having completed 10 years of prayers",
            "Traveling with all family members"
          ],
          ar: [
            "أن يتجاوز عمره الأربعين عاماً",
            "الاستطاعة البدنية والمالية (من استطاع إليه سبيلاً)",
            "أن يحفظ نصف القرآن الكريم على الأقل",
            "أن يصاحب كافة أفراد عائلته معه"
          ]
        },
        correctAnswerIndex: 1,
        explanation: {
          fr: "Le Hajj est obligatoire une fois dans la vie pour tout musulman qui en a les moyens physiques et financiers (Sourate Ali 'Imran, Verset 97).",
          en: "Hajj is obligational once in a lifetime for every Muslim who is physically and financially able to undertake it (Surah Ali 'Imran, Verse 97).",
          ar: "الحج ركن واجب مرة واحدة في العمر لكل مسلم بالغ عاقل يمتلك القدرة المالية والبدنية الكافية لرحلة الحج."
        }
      }
    ]
  },
  {
    id: "prophete-muhammad",
    title: {
      fr: "La Sira du Prophète Muhammad ﷺ",
      en: "The Sira of Prophet Muhammad ﷺ",
      ar: "سيرة الرسول المصطفى ﷺ"
    },
    description: {
      fr: "Explorez la vie, le caractère et les étapes historiques majeures de la vie du dernier des messagers envoyés à l'humanité.",
      en: "Explore the life, character, and major historical milestones of the last messenger sent to mankind.",
      ar: "تفقه في سيرة خير البرية والنعمة المهداة ﷺ، ملامح شخصيته ومعالم دعوته الخالدة."
    },
    difficulty: "intermediaire",
    category: "prophetes",
    questionsCount: 4,
    questions: [
      {
        id: 1,
        question: {
          fr: "En quelle année de l'éléphant, dans quelle ville sacrée le Prophète ﷺ est-il né ?",
          en: "In what sacred city was the Prophet ﷺ born in the Year of the Elephant?",
          ar: "في أي بلدة مباركة ولد النبي المصطفى ﷺ في عام الفيل الشهير في السيرة ؟"
        },
        options: {
          fr: ["Médine (Yathrib)", "La Mecque", "Jérusalem (Al-Quds)", "Taëf"],
          en: ["Madinah (Yathrib)", "Mecca", "Jerusalem (Al-Quds)", "Taif"],
          ar: ["المدينة المنورة (يثرب)", "مكة المكرمة شرفها الله", "القدس الشريف", "الطائف"]
        },
        correctAnswerIndex: 1,
        explanation: {
          fr: "Le Prophète ﷺ est né à la Mecque, une ville bénie abritant la Kaaba, vers l'an 570 du calendrier grégorien.",
          en: "The Prophet ﷺ was born in Mecca, the blessed city housing the Kaaba, around 570 CE.",
          ar: "ولد النبي المصطفى ﷺ في بطن مكة المكرمة يتيماً، ونشأ تحت رعاية رب العالمين وحفظه."
        }
      },
      {
        id: 2,
        question: {
          fr: "Quel âge avait le Prophète ﷺ lorsqu'il reçut la première révélation dans la grotte de Hira ?",
          en: "How old was the Prophet ﷺ when he received the first revelation in the cave of Hira?",
          ar: "كم كان يبلغ النبي ﷺ من العمر حين نزل عليه الروح الأمين جبريل عليه السلام بغار حراء ؟"
        },
        options: {
          fr: ["25 ans", "30 ans", "40 ans", "63 ans"],
          en: ["25 years old", "30 years old", "40 years old", "63 years old"],
          ar: ["خمسة وعشرون عاماً", "ثلاثون عاماً", "أربعون عاماً", "ثلاثة وستون عاماً"]
        },
        correctAnswerIndex: 2,
        explanation: {
          fr: "À l'âge de 40 ans, le Prophète ﷺ reçut l'ange Jibril qui lui prononça les premiers versets 'Iqra' (Lis !) dans la solitude spirituelle de Hira.",
          en: "At the age of 40, the Prophet ﷺ received Gabriel who uttered the very first verses of 'Iqra' (Read!) in the spiritual solitude of Hira.",
          ar: "بعث المصطفى ﷺ على رأس الأربعين من عمره الشريف، وهي سن نضج العقل وبلوغ التكليف بالرسالة السامية."
        }
      },
      {
        id: 3,
        question: {
          fr: "Quel titre honorifique de confiance les habitants de la Mecque lui attribuaient-ils avant même la révélation ?",
          en: "What noble honorary title did the Meccans give him even before revelation?",
          ar: "ما اللقب الكريم الذي منحه أهل مكة للرسول ﷺ قبل بعثته لشدة صدقه وحفظه للأمانات ؟"
        },
        options: {
          fr: ["Al-Malik (Le Roi)", "Al-Amin (Le digne de confiance)", "Al-Hakim (Le Sage)", "Al-Fatari (Le Noble)"],
          en: ["Al-Malik (The King)", "Al-Amin (The Trustworthy)", "Al-Hakim (The Wise)", "Al-Fatari (The Noble)"],
          ar: ["المالك", "الأمين (أو الصادق الأمين)", "الحكيم", "الفطري"]
        },
        correctAnswerIndex: 1,
        explanation: {
          fr: "Il était connu universellement sous le titre d'Al-Sadiq Al-Amin (Le véridique et digne de confiance) en raison de sa probité légendaire.",
          en: "He was universally known by the title Al-Sadiq Al-Amin (The Truthful, The Trustworthy) because of his legendary moral uprightness.",
          ar: "لقب بالصادق الأمين لما عُرف عنه من ترفع كامل عن الكذب والخيانة وعفة لسانه من لغوا الكلام."
        }
      },
      {
        id: 4,
        question: {
          fr: "Quel événement marque le début du calendrier musulman (Hégire) ?",
          en: "What major event marks the beginning of the Islamic calendar (Hijrah)?",
          ar: "ما هو الحدث التاريخي الأبرز الذي يمثل بداية التاريخ الهجري المعتمد في الأمة ؟"
        },
        options: {
          fr: [
            "La conquête de la Mecque",
            "La construction de la première mosquée",
            "La migration du Prophète et de ses compagnons vers Médine",
            "La venue de l'ange Jibril"
          ],
          en: [
            "The Conquest of Mecca",
            "The building of the first mosque",
            "The migration of the Prophet and his companions to Madinah",
            "The descend of Angel Jibril"
          ],
          ar: [
            "فتح مكة المكرمة",
            "بناء المسجد النبوي الشريف",
            "هجرة النبي ﷺ من مكة إلى المدينة المنورة (يثرب)",
            "نزول الوحي لأول مرة"
          ]
        },
        correctAnswerIndex: 2,
        explanation: {
          fr: "L'Hégire (migration vers Médine en 622) marque un tournant majeur et de fondation de la société islamique unifiée, choisi comme base temporelle par Omar Ibn Al-Khattab.",
          en: "The Hijrah (migration to Madinah in 622 CE) marks the pivotal establishment of the unified Islamic society, chosen as the calendar zero-point under Umar.",
          ar: "أقر الصحابة بقيادة أمير المؤمنين عمر بن الخطاب رضي الله عنه اتخاذ الهجرة النبوية مبدأً للتقويم الإسلامي."
        }
      }
    ]
  }
];
