import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, Share2, Copy, Heart, CheckCircle2, Bookmark, BookOpenCheck, Flame, ShieldAlert } from 'lucide-react';
import { Language } from '../types';

interface HadithsProps {
  lang: Language;
}

export default function Hadiths({ lang }: HadithsProps) {
  const [activeTab, setActiveTab] = useState<'bukhari' | 'nawawi' | 'hisnul'>('bukhari');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('islam_aboubakar_hadith_favs');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Custom counter for Hisnul Muslim
  const [hisnulCounter, setHisnulCounter] = useState<Record<string, number>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('islam_aboubakar_hadith_favs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCountIncrement = (id: string, max: number) => {
    setHisnulCounter(prev => {
      const current = prev[id] || 0;
      if (current >= max) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const handleCountReset = (id: string) => {
    setHisnulCounter(prev => ({ ...prev, [id]: 0 }));
  };

  const t = {
    fr: {
      title: "Hadiths & Invocations Authentiques",
      subtitle: "Parcourez les paroles sacrées de notre bien-aimé Prophète Muhammad ﷺ tirées des sources les plus fiables.",
      tabBukhari: "Sahih Bukhari & Muslim",
      tabNawawi: "40 Nawawi",
      tabHisnul: "Hisnul Muslim",
      searchPlaceholder: "Rechercher par mot-clé, thème ou numéro...",
      source: "Rapporté par",
      explanation: "Explications & Leçons",
      lessons: "Enseignements clés :",
      favorites: "Mes favoris",
      copied: "Copié !",
      chain: "Chaîne de transmission :",
      counter: "Compteur",
      target: "Objectif"
    },
    en: {
      title: "Hadiths & Authentic Invocations",
      subtitle: "Browse the sacred words of our beloved Prophet Muhammad ﷺ from the most reliable sources.",
      tabBukhari: "Sahih Bukhari & Muslim",
      tabNawawi: "40 Nawawi",
      tabHisnul: "Hisnul Muslim",
      searchPlaceholder: "Search by keyword, theme or number...",
      source: "Narrated by",
      explanation: "Explanations & Lessons",
      lessons: "Key Teachings:",
      favorites: "My Favorites",
      copied: "Copied!",
      chain: "Transmission Chain:",
      counter: "Counter",
      target: "Target"
    },
    ar: {
      title: "الأحاديث النبوية والأذكار",
      subtitle: "تصفح كلام الحبيب المصطفى ﷺ المستخرج من أصح الكتب والمصادر المعتمدة.",
      tabBukhari: "صحيح البخاري ومسلم",
      tabNawawi: "الأربعون النووية",
      tabHisnul: "حصن المسلم",
      searchPlaceholder: "ابحث بالكلمات، الموضوع أو الرقم...",
      source: "رواه",
      explanation: "الشرح والفوائد",
      lessons: "الفوائد التربوية :",
      favorites: "المفضلة",
      copied: "تم النسخ!",
      chain: "سند الحديث :",
      counter: "العداد",
      target: "الهدف"
    }
  }[lang];

  // 1. Sahih Bukhari / Muslim Data Selection
  const bukhariHadiths = [
    {
      id: "b-1",
      number: 1,
      theme: { fr: "L'Intention", en: "Invention/Intentions", ar: "الأعمال بالنيات" },
      narrator: { fr: "Umar ibn Al-Khattab", en: "Umar ibn Al-Khattab", ar: "عمر بن الخطاب" },
      arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى. فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَتَزَوَّجُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.",
      translation: {
        fr: "Les actions ne valent que par les intentions et chacun n'a pour lui que ce qu'il a eu l'intention d'entreprendre. Celui qui émigre pour Allah et Son Messager, son émigration est comptée comme telle. Celui qui émigre pour obtenir des biens de ce monde ou pour épouser une femme, son émigration ne sera comptée que pour ce vers quoi il a émigré.",
        en: "Actions are but by intentions and every man shall have only that which he intended. Thus he whose migration was for Allah and His Messenger, his migration was for Allah and His Messenger, and he whose migration was to achieve some worldly benefit or to take some woman in marriage, his migration was for that for which he migrated.",
        ar: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى..."
      },
      source: "Sahih Al-Bukhari (1) & Sahih Muslim (1907)",
      isnad: {
        fr: "Al-Humaydi d'après Sufyan, d'après Yahya ibn Sa'id Al-Ansari, d'après Muhammad ibn Ibrahim Al-Taymi, d'après Alqama ibn Waqqas Al-Laythi, d'après Umar ibn Al-Khattab sur le minbar.",
        en: "Al-Humaydi from Sufyan, from Yahya ibn Sa'id Al-Ansari, from Muhammad ibn Ibrahim Al-Taymi, from Alqama ibn Waqqas Al-Laythi, from Umar ibn Al-Khattab on the pulpit.",
        ar: "الحميدي عن سفيان عن يحيى بن سعيد الأنصاري عن محمد بن إبراهيم التيمي عن علقمة بن وقاص الليثي عن عمر بن الخطاب"
      }
    },
    {
      id: "b-2",
      number: 2,
      theme: { fr: "La Foi et ses Branches", en: "Faith and its Branches", ar: "شعب الإيمان" },
      narrator: { fr: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
      arabic: "الإِيمَانُ بِضْعٌ وَسَبْعُونَ أَوْ بِضْعٌ وَسِتُّونَ شُعْبَةً، فَأَفْضَلُهَا قَوْلُ لاَ إِلَهَ إِلاَّ اللَّهُ، وَأَدْنَاهَا إِمَاطَةُ الأَذَى عَنِ الطَّرِيقِ، وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ.",
      translation: {
        fr: "La foi comporte soixante-dix et quelques - ou soixante et quelques - branches. La plus élevée est la parole 'Il n'y a de divinité digne d'adoration qu'Allah' (La ilaha illallah) et la plus basse est le fait d'enlever un obstacle de la route. Et la pudeur est une branche de la foi.",
        en: "Faith has over seventy branches or over sixty branches, the most excellent of which is the declaration 'There is no god but Allah' and the humblest of which is the removal of what is injurious from the path, and modesty (Haya') is a branch of faith.",
        ar: "الإيمان بضع وسبعون أو بضع وستون شعبة..."
      },
      source: "Sahih Al-Bukhari (9) & Sahih Muslim (35)",
      isnad: {
        fr: "Zuhayr ibn Harb d'après Jarir, d'après Suhayl, d'après son père, d'après Abu Hurayrah.",
        en: "Zuhayr ibn Harb from Jarir, from Suhayl, from his father, from Abu Hurayrah.",
        ar: "زهير بن حرب عن جرير عن سهيل عن أبيه عن أبي هريرة"
      }
    },
    {
      id: "b-3",
      number: 3,
      theme: { fr: "La Fraternité en Islam", en: "Brotherhood in Islam", ar: "الحب في الله" },
      narrator: { fr: "Anas ibn Malik", en: "Anas ibn Malik", ar: "أنس بن مالك" },
      arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.",
      translation: {
        fr: "Aucun de vous ne sera véritablement croyant tant qu'il n'aimera pas pour son frère ce qu'il aime pour lui-même.",
        en: "None of you will truly believe until he wishes for his brother what he wishes for himself.",
        ar: "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه"
      },
      source: "Sahih Al-Bukhari (13) & Sahih Muslim (45)",
      isnad: {
        fr: "Musaddad d'après Yahya d'après Shu'bah d'après Qatadah d'après Anas.",
        en: "Musaddad from Yahya from Shu'bah from Qatadah from Anas.",
        ar: "مسدد عن يحيى عن شعبة عن قتادة عن أنس"
      }
    },
    {
      id: "b-4",
      number: 4,
      theme: { fr: "Le Bon Comportement", en: "Good Character", ar: "حسن الخلق" },
      narrator: { fr: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
      arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ.",
      translation: {
        fr: "Celui qui croit en Allah et au Jour dernier, qu'il dise du bien ou qu'il se taise. Celui qui croit en Allah et au Jour dernier, qu'il honore son voisin. Et celui qui croit en Allah et au Jour dernier, qu'il honore son invité.",
        en: "He who believes in Allah and the Last Day must either speak good or remain silent; and he who believes in Allah and the Last Day must be hospitable to his neighbor; and he who believes in Allah and the Last Day must honor his guest.",
        ar: "من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت..."
      },
      source: "Sahih Al-Bukhari (6018) & Sahih Muslim (47)",
      isnad: {
        fr: "Qutaybah ibn Sa'id d'après Layth d'après Sa'id Al-Maqburi d'après Abu Shurayh d'après Abu Hurayrah.",
        en: "Qutaybah ibn Sa'id from Layth from Sa'id Al-Maqburi from Abu Shurayh from Abu Hurayrah.",
        ar: "قتيبة بن سعيد عن ليث عن سعيد المقبري عن أبي شريح عن أبي هريرة"
      }
    },
    {
      id: "b-5",
      number: 5,
      theme: { fr: "La Quête de la Science", en: "Seeking Knowledge", ar: "فضل طلب العلم" },
      narrator: { fr: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
      arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.",
      translation: {
        fr: "Celui qui emprunte un chemin par lequel il recherche une science, Allah lui facilite par cela un chemin vers le Paradis.",
        en: "Whoever takes a path upon which he seeks knowledge, Allah makes the path to Paradise easy for him.",
        ar: "من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة"
      },
      source: "Sahih Muslim (2699)",
      isnad: {
        fr: "Nasr ibn Ali Al-Jahdami d'après Khalid ibn Al-Harith d'après Sa'id d'après Qatadah d'après Abu Hurayrah.",
        en: "Nasr ibn Ali Al-Jahdami from Khalid from Sa'id from Qatadah from Abu Hurayrah.",
        ar: "نصر بن علي الجهضمي عن خالد بن الحارث عن سعيد عن قتادة عن أبي هريرة"
      }
    },
    {
      id: "b-6",
      number: 6,
      theme: { fr: "La Maîtrise de Soi et de la Colère", en: "Self-Control & Anger", ar: "القوة في ضبط النفس" },
      narrator: { fr: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
      arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ.",
      translation: {
        fr: "Le fort n'est pas celui qui terrasse ses adversaires dans la lutte ; le fort est uniquement celui qui sait se maîtriser lorsqu'il est en colère.",
        en: "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger.",
        ar: "ليس الشديد بالصرعة، إنما الشديد الذي يملك نفسه عند الغضب"
      },
      source: "Sahih Al-Bukhari (6114) & Sahih Muslim (2609)",
      isnad: {
        fr: "Abdullah ibn Yusuf d'après Malik d'après Ibn Shihab d'après Sa'id ibn Al-Musayyib d'après Abu Hurayrah.",
        en: "Abdullah ibn Yusuf from Malik from Ibn Shihab from Sa'id ibn Al-Musayyib from Abu Hurayrah.",
        ar: "عبد الله بن يوسف عن مالك عن ابن شهاب عن سعيد بن المسيب عن أبي هريرة"
      }
    },
    {
      id: "b-7",
      number: 7,
      theme: { fr: "La Facilité et la Clémence", en: "Ease and Mercy", ar: "التيسير والتبشير" },
      narrator: { fr: "Anas ibn Malik", en: "Anas ibn Malik", ar: "أنس بن مالك" },
      arabic: "يَسِّرُوا وَلاَ تُعَسِّرُوا، وَبَشِّرُوا وَلاَ تُنَفِّرُوا.",
      translation: {
        fr: "Facilitez les choses et ne les rendez pas difficiles ; annoncez de bonnes nouvelles et ne faites pas fuir les gens.",
        en: "Make things easy and do not make them difficult, cheer the people up and do not drive them away.",
        ar: "يسروا ولا تعسروا وبشروا ولا تنفروا"
      },
      source: "Sahih Al-Bukhari (69) & Sahih Muslim (1734)",
      isnad: {
        fr: "Adam d'après Shu'bah d'après Abu Tayyah d'après Anas ibn Malik.",
        en: "Adam from Shu'bah from Abu Tayyah from Anas ibn Malik.",
        ar: "آدم عن شعبة عن أبي التياح عن أنس بن مالك"
      }
    }
  ];

  // 2. 40 Hadiths Nawawi (sample rich entries)
  const nawawiHadiths = [
    {
      id: "n-1",
      number: 1,
      title: { fr: "Hadith 1 : Les actions ne valent que par l'intention", en: "Hadith 1: Actions are by Intentions", ar: "الحديث الأول : الأعمال بالنيات" },
      arabic: "عَنْ أَمِيرِ الْمُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْت رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: «إنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ...»",
      translation: {
        fr: "D'après l'émir des croyants Abu Hafs Umar ibn al-Khattâb (qu'Allah l'agrée) : J'ai entendu le Messager d'Allah ﷺ dire : « Les actions ne valent que par les intentions... » (Même texte que le premier hadith du Bukhari).",
        en: "On the authority of Umar bin Al-Khattab who said: I heard the Messenger of Allah ﷺ say: «Actions are but by intentions...»",
        ar: "إنما الأعمال بالنيات..."
      },
      explanation: {
        fr: "Ce hadith est l'un des piliers majeurs de l'Islam. Les savants affirment qu'il représente un tiers de la science islamique. Toute action d'adoration (prière, jeûne, aumône) nécessite une intention pure (Ikhlas) vouée exclusivement à Allah pour être acceptée.",
        en: "This Hadith is one of the pillars of Islam. Scholars say it constitutes one-third of all Islamic knowledge. Every act of worship requires a pure intention directed solely to Allah to be valid and rewarded.",
        ar: "هذا الحديث عظيم وهو قاعدة من قواعد الإسلام، وتدور عليه معظم الأحكام..."
      },
      lessons: [
        { fr: "L'intention distingue l'habitude de l'adoration.", en: "Intention distinguishes custom from worship.", ar: "النية تميز العادات عن العبادات" },
        { fr: "La sincérité envers Allah est la clé de l'acceptation des œuvres.", en: "Sincerity is the key to acceptance of deeds.", ar: "الإخلاص شرط أساسي لقبول العمل" },
        { fr: "L'expatriation ou l'émigration pour un intérêt mondain prive l'individu de la récompense spirituelle.", en: "Migration for worldly benefits deprives one of spiritual reward.", ar: "الهجرة للدنيا تحرم العبد من الأجر الأخروي" }
      ]
    },
    {
      id: "n-2",
      number: 2,
      title: { fr: "Hadith 2 : L'Islam, l'Iman et l'Ihsan (Hadith de Gabriel)", en: "Hadith 2: Islam, Iman, and Ihsan (Hadith of Jibril)", ar: "الحديث الثاني : مراتب الدين" },
      arabic: "بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ رَسُولِ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ ذَاتَ يَوْمٍ، إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ، شَدِيدُ سَوَادِ الشَّعَرِ، لاَ يُرَى عَلَيْهِ أَثَرُ السَّفَرِ، وَلاَ يَعْرِفُهُ مِنَّا أَحَدٌ... فَقَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الإِسْلاَمِ...",
      translation: {
        fr: "Un jour, alors que nous étions assis auprès du Messager d'Allah ﷺ, apparut soudain à nous un homme aux vêtements d'une blancheur éclatante, aux cheveux d'un noir intense, sur qui on ne voyait aucune marque de voyage et que personne parmi nous ne connaissait. Il s'assit en face du Prophète... et dit : « Ô Muhammad, informe-moi sur l'Islam ! » Le Messager d'Allah ﷺ dit : « L'Islam consiste à témoigner qu'il n'y a pas de divinité digne d'adoration d'autre qu'Allah et que Muhammad est Son Messager, à accomplir la prière, à verser la Zakat, à jeûner le Ramadan et à faire le pèlerinage si tu en as les moyens... » Puis il l'interrogea sur la Foi (Iman) : « C'est de croire en Allah, Ses Anges, Ses Livres, Ses Messagers, au Jour Dernier et au Destin favorable ou défavorable. » Puis sur la Perfection (Ihsan) : « C'est d'adorer Allah comme si tu Le voyais, car si tu ne Le vois pas, Lui te voit. »...",
        en: "One day while we were sitting with the Messenger of Allah ﷺ, there appeared before us a man with extremely white garments and extremely black hair. No signs of travel were visible on him, and none of us knew him. He sat down close to the Prophet... and said: 'O Muhammad, tell me about Islam...' The Prophet said: 'Islam is to testify that there is no god but Allah and Muhammad is His messenger, to perform prayer, pay Zakat, fast Ramadan, and make pilgrimage...' Then he asked about Faith (Iman): 'To believe in Allah, His angels, His books, His messengers, the Last Day, and destiny...' Then about Perfection (Ihsan): 'To worship Allah as if you see Him, and if you do not see Him, He sees you.'...",
        ar: "بينما نحن جلوس عند رسول الله..."
      },
      explanation: {
        fr: "Ce hadith est appelé « la mère de la Sunnah » car il englobe toutes les dimensions de la religion : les actions extérieures (l'Islam), les croyances intérieures (l'Iman), et l'état spirituel ultime de vigilance et de sincérité (l'Ihsan). Il enseigne aussi l'étiquette d'apprentissage.",
        en: "This Hadith is known as the 'Um (Mother) of Sunnah' because it covers all aspects of the religion: physical deeds (Islam), internal beliefs (Iman), and the ultimate spiritual state of consciousness (Ihsan). It also teaches classroom etiquette.",
        ar: "هذا الحديث يسمى أم السنة لأنه يشتمل على بيان الدين كله بمراتبه الثلاث..."
      },
      lessons: [
        { fr: "Le dine comporte trois cercles : l'Islam, l'Iman (plus restreint) et l'Ihsan (le plus restreint).", en: "Religion has three levels: Islam, Iman, and Ihsan.", ar: "الدين مراتب ثلاث: إسلام، وإيمان، وإحسان" },
        { fr: "L'Ihsan est la présence du cœur et le sentiment permanent d'être vu par le Créateur.", en: "Ihsan is continuous awareness of Allah's presence.", ar: "الإحسان هو مراقبة الله عز وجل في السر والعلن" },
        { fr: "L'importance de poser des questions utiles pour instruire l'auditoire.", en: "The importance of asking questions to benefit the audience.", ar: "مشروعية السؤال لتعليم الحاضرين" }
      ]
    },
    {
      id: "n-3",
      number: 3,
      title: { fr: "Hadith 3 : Les Cinq Piliers de l'Islam", en: "Hadith 3: The Five Pillars of Islam", ar: "الحديث الثالث : أركان الإسلام" },
      arabic: "عَنْ أَبِي عَبْدِ الرَّحْمَنِ عَبْدِ اللَّهِ بْنِ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: سَمِعْت رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: «بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إلَهَ إلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ».",
      translation: {
        fr: "D'après Abu Abdur-Rahman Abdullah ibn Umar (qu'Allah les agrée tous les deux) : J'ai entendu le Messager d'Allah ﷺ dire : « L'Islam est bâti sur cinq piliers : l'attestation qu'il n'y a pas de divinité digne d'adoration en dehors d'Allah et que Muhammad est le Messager d'Allah, l'accomplissement de la prière, l'acquittement de l'aumône légale (Zakat), le pèlerinage à la Maison sacrée et le jeûne de Ramadan. »",
        en: "On the authority of Abdullah bin Umar who said: I heard the Messenger of Allah ﷺ say: «Islam has been built upon five: testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing the prayer, paying the Zakat, making pilgrimage to the House, and fasting Ramadan.»",
        ar: "بني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمداً رسول الله..."
      },
      explanation: {
        fr: "Ce hadith compare métaphoriquement l'Islam à un édifice solide soutenu par cinq colonnes indispensables. Si l'un de ces piliers fait défaut, l'édifice de la foi est gravement fragilisé.",
        en: "This Hadith compares Islam to a solid structure resting upon five foundational pillars. The foundation of the building relies entirely on these essential obligations.",
        ar: "شبه النبي صلى الله عليه وسلم الإسلام ببناء متماسك محكم يقوم على دعائم خمس أساسية..."
      },
      lessons: [
        { fr: "L'attestation de foi (Tawhid) est la base absolue sur laquelle reposent tous les actes d'adoration.", en: "The testimony of faith is the foundation of all worship.", ar: "التوحيد هو الأساس لقبول سائر الأعمال" },
        { fr: "La prière est le lien quotidien direct et incontournable entre le serviteur et son Seigneur.", en: "Prayer is the direct daily link between the servant and the Lord.", ar: "الصلاة هي الصلة اليومية المباشرة بين العبد وربه" },
        { fr: "La Zakat purifie les biens et instaure la justice sociale et la fraternité fraternelle.", en: "Zakat purifies wealth and fosters social brotherhood.", ar: "الزكاة طهرة للأموال وحماية للتكافل الاجتماعي" }
      ]
    },
    {
      id: "n-5",
      number: 5,
      title: { fr: "Hadith 5 : Le Rejet de l'Innovation Religieuse", en: "Hadith 5: Rejection of Innovations", ar: "الحديث الخامس : رد البدع والمحدثات" },
      arabic: "عَنْ أُمِّ الْمُؤْمِنِينَ أُمِّ عَبْدِ اللَّهِ عَائِشَةَ رَضِيَ اللَّهُ عَنْهَا قَالَتْ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: «مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ فِيهِ فَهُوَ رَدٌّ». وفي رواية لمسلم: «مَنْ عَمِلَ عَمَلًا لَيْسَ عَلَيْهِ أَمْرُنَا فَهُوَ رَدٌّ».",
      translation: {
        fr: "D'après la Mère des croyants Umm Abdillah Aïcha (qu'Allah l'agrée) : Le Messager d'Allah ﷺ a dit : « Quiconque introduit dans notre affaire (notre religion) ce qui n'en fait pas partie, cela est rejeté. » Et dans une version chez Muslim : « Quiconque accomplit une œuvre non conforme à notre ordre, celle-ci est rejetée. »",
        en: "On the authority of the Mother of the Believers, Aisha who said: The Messenger of Allah ﷺ said: «Whoever introduces into this affair of ours something which does not belong to it, it is rejected.» In another version: «Whoever does an act that is not in accord with our matter will have it rejected.»",
        ar: "من أحدث في أمرنا هذا ما ليس منه فهو رد..."
      },
      explanation: {
        fr: "Ce hadith constitue l'étalon extérieur de validité de toute action religieuse (tout comme le premier hadith sur l'intention constitue l'étalon intérieur). Pour être accepté, un acte d'adoration doit respecter deux conditions : la sincérité pour Allah (Ikhlas) et la conformité à la Sunnah (Moutaba'a).",
        en: "This Hadith serves as the external scale for measuring religious deeds, just as the first Hadith is the internal scale of intention. Acceptance requires both sincerity to Allah and adherence to the Prophet's guidance.",
        ar: "هذا الحديث ميزان للأعمال الظاهرة، كما أن حديث النيات ميزان للأعمال الباطنة..."
      },
      lessons: [
        { fr: "La religion musulmane est complète et parfaite, elle ne nécessite aucun ajout ni altération.", en: "Islam is complete and requires no arbitrary alterations.", ar: "كمال الشريعة الإسلامية وعدم حاجتها للزيادة" },
        { fr: "Toute innovation doctrinale ou rituelle est caduque devant Allah.", en: "Any unauthorized innovation in worship is invalid.", ar: "بطلان كل ما خالف هدي النبي صلى الله عليه وسلم" }
      ]
    },
    {
      id: "n-6",
      number: 6,
      title: { fr: "Hadith 6 : Le Licite, l'Illicite et la Préservation du Cœur", en: "Hadith 6: Halal, Haram, and the Heart", ar: "الحديث السادس : الحلال والحرام وصلاح القلب" },
      arabic: "عَنْ أَبِي عَبْدِ اللَّهِ النُّعْمَانِ بْنِ بَشِيرٍ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: سَمِعْت رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: «إنَّ الْحَلَالَ بَيِّنٌ، وَإِنَّ الْحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لَا يَعْلَمُهُنَّ كَثِيرٌ مِنْ النَّاسِ، فَمَنْ اتَّقَى الشُّبُهَاتِ فَقَدْ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ... أَلَا وَإِنَّ فِي الْجَسَدِ مُضْغَةً إذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلَا وَهِيَ الْقَلْبُ».",
      translation: {
        fr: "D'après An-Nu'man ibn Bashir (qu'Allah les agrée) : J'ai entendu le Messager d'Allah ﷺ dire : « Le licite (Halal) est évident et l'illicite (Haram) est évident. Entre les deux se trouvent des choses douteuses que beaucoup de gens ignorent. Celui qui s'écarte des choses douteuses préserve sa religion et son honneur... Certes, il y a dans le corps un morceau de chair : s'il est sain, tout le corps est sain ; et s'il est corrompu, tout le corps est corrompu. Sachez que c'est le cœur ! »",
        en: "On the authority of An-Nu'man bin Bashir who said: I heard the Messenger of Allah ﷺ say: «The lawful is clear and the unlawful is clear, and between them are matters that are ambiguous, which many people do not know. Thus he who avoids dubious matters clears himself in regard to his religion and his honor... Truly, in the body there is a morsel of flesh: if it is healthy, the whole body is healthy, and if it is diseased, the whole body is diseased. Truly, it is the heart.»",
        ar: "إن الحلال بين وإن الحرام بين وبينهما أمور مشتبهات..."
      },
      explanation: {
        fr: "Ce hadith magistral définit la piété et la scrupulosité (Wara'). Il rappelle que la pureté spirituelle commence par l'état intérieur du cœur, qui gouverne l'ensemble des membres et des choix de vie.",
        en: "This monumental Hadith defines true piety and prudence. It shows that spiritual health originates from the integrity of the heart, which guides all outward actions.",
        ar: "هذا الحديث أصل عظيم من أصول الورع ومراقبة الله وصلاح القلوب..."
      },
      lessons: [
        { fr: "S'éloigner des ambiguïtés protège la dignité du croyant et sa foi.", en: "Avoiding doubts protects faith and dignity.", ar: "الابتعاد عن الشبهات صيانة للدين والعرض" },
        { fr: "Le cœur est le centre spirituel souverain qui détermine la droiture de l'être humain.", en: "The heart is the spiritual master of all human limbs.", ar: "صلاح الجوارح تبع لصلاح القلب وطهارته" }
      ]
    }
  ];

  // 3. Hisnul Muslim / Invocations Authentiques
  const hisnulInvocations = [
    {
      id: "h-1",
      category: { fr: "Au Réveil", en: "Upon Waking Up", ar: "أذكار الاستيقاظ" },
      arabic: "الحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.",
      phonetic: "Al-hamdu lillâhi l-lazî ahyânâ ba'da mâ amâtanâ wa ilayhi n-nushûr.",
      translation: {
        fr: "Louange à Allah qui nous a rendu la vie après nous avoir fait mourir, et c'est vers Lui que se fera le retour.",
        en: "Praise is to Allah Who gives us life after He has caused us to die and to Him is the return.",
        ar: "الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور"
      },
      source: "Sahih Al-Bukhari (6312), Sahih Muslim (2711)",
      targetCount: 1
    },
    {
      id: "h-2",
      category: { fr: "Protection du Matin / Soir", en: "Morning/Evening Protection", ar: "حماية الصباح والمساء" },
      arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
      phonetic: "Bismillâhi l-lazî lâ yadurru ma'a smihi shay'un fî-l-ardi wa lâ fî s-samâ'i wa huwa s-samî'u-l-'alîm.",
      translation: {
        fr: "Au nom d'Allah, tel qu'en compagnie de Son nom rien ne peut nuire sur terre ni dans les cieux, et Il est l'Audient, l'Omniscient.",
        en: "In the name of Allah with Whose name nothing can harm on earth or in heaven, and He is the All-Hearing, All-Knowing.",
        ar: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء..."
      },
      source: "Abu Dawoud (5088), At-Tirmidhi (3388)",
      targetCount: 3
    },
    {
      id: "h-3",
      category: { fr: "En cas d'Angoisse ou Souci", en: "Anxiety & Distress", ar: "أذكار الكرب والهم" },
      arabic: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ.",
      phonetic: "Lâ ilâha illâ-llâhu-l-'Adhîmu-l-Halîm. Lâ ilâha illâ-llâhu Rabbu-l-'Arshi-l-'Adhîm. Lâ ilâha illâ-llâhu Rabbu s-samâwâti wa Rabbu-l-ardi wa Rabbu-l-'Arshi-l-Karîm.",
      translation: {
        fr: "Il n'y a de divinité digne d'adoration qu'Allah, l'Immense, le Clément. Il n'y a de divinité digne d'adoration qu'Allah, le Seigneur de l'immense Trône. Il n'y a de divinité digne d'adoration qu'Allah, le Seigneur des cieux, le Seigneur de la terre et le Seigneur du noble Trône.",
        en: "There is no god but Allah, the Great, the Tolerant. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens and Lord of the earth and Lord of the Noble Throne.",
        ar: "لا إله إلا الله العظيم الحليم..."
      },
      source: "Sahih Al-Bukhari (6346), Sahih Muslim (2730)",
      targetCount: 1
    },
    {
      id: "h-4",
      category: { fr: "Demande de Pardon (Sayyid al-Istighfar)", en: "Chief of Forgiveness", ar: "سيد الاستغفار" },
      arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
      phonetic: "Allâhumma anta Rabbî lâ ilâha illâ anta, khalaqtanî wa anâ 'abduka, wa anâ 'alâ 'ahdika wa wa'dika mâ stata'tu. A'ûdhu bika min sharri mâ sana'tu, abû'u laka bi-ni'matika 'alayya, wa abû'u bi-dhanbî faghfir lî, fa-innahû lâ yaghfiru z-zunûba illâ ant.",
      translation: {
        fr: "Ô Allah, Tu es mon Seigneur, il n'y a de divinité digne d'adoration que Toi. Tu m'as créé et je suis Ton serviteur. Je suis fidèle à Ton pacte et à Ta promesse autant que je le puis. Je cherche refuge auprès de Toi contre le mal de ce que j'ai fait. Je reconnais Tes bienfaits sur moi et je reconnais mon péché. Pardonne-moi donc, car nul autre que Toi ne pardonne les péchés.",
        en: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I am faithful to Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done, I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for indeed none forgives sins except You.",
        ar: "اللهم أنت ربي لا إله إلا أنت..."
      },
      source: "Sahih Al-Bukhari (6306)",
      targetCount: 1
    },
    {
      id: "h-5",
      category: { fr: "En Sortant de la Maison", en: "Leaving the House", ar: "دعاء الخروج من المنزل" },
      arabic: "بِسْمِ اللَّهِ ، تَوَكَّلْتُ عَلَى اللَّهِ ، وَلا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ.",
      phonetic: "Bismillâh, tawakkaltu 'ala-llâh, wa lâ hawla wa lâ quwwata illâ billâh.",
      translation: {
        fr: "Au nom d'Allah, je m'en remets à Allah, et il n'y a de force ni de puissance que par Allah.",
        en: "In the name of Allah, I trust in Allah; there is no power and no strength except with Allah.",
        ar: "بسم الله، توكلت على الله، ولا حول ولا قوة إلا بالله"
      },
      source: "Abu Dawoud (5095), At-Tirmidhi (3426)",
      targetCount: 1
    },
    {
      id: "h-6",
      category: { fr: "En Entrant à la Mosquée", en: "Entering the Mosque", ar: "دعاء دخول المسجد" },
      arabic: "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
      phonetic: "Bismillâhi wa-s-salâtu wa-s-salâmu 'alâ Rasûlillâh, Allâhumma ftah lî abwâba rahmatik.",
      translation: {
        fr: "Au nom d'Allah, et que la prière et le salut soient sur le Messager d'Allah. Ô Allah, ouvre-moi les portes de Ta miséricorde.",
        en: "In the name of Allah, and prayers and peace be upon the Messenger of Allah. O Allah, open for me the gates of Your mercy.",
        ar: "بسم الله، والصلاة والسلام على رسول الله، اللهم افتح لي أبواب رحمتك"
      },
      source: "Sahih Muslim (713), Abu Dawoud (465)",
      targetCount: 1
    },
    {
      id: "h-7",
      category: { fr: "Avant de s'Endormir", en: "Before Sleeping", ar: "أذكار النوم" },
      arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي ، وَبِكَ أَرْفَعُهُ ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا ، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
      phonetic: "Bismika Rabbî wada'tu janbî, wa bika arfa'uh. Fa-in amsakta nafsî farhamhâ, wa in arsaltahâ fahfazhâ bimâ tahfazu bihî 'ibâdaka s-sâlihîn.",
      translation: {
        fr: "C'est en Ton nom, ô mon Seigneur, que je me suis couché sur le flanc, et c'est par Toi que je me relèverai. Si Tu retiens mon âme, accorde-lui Ta miséricorde, et si Tu la relâches, préserve-la avec ce que Tu préserves Tes serviteurs vertueux.",
        en: "In Your name my Lord, I lie down and in Your name I arise. If You keep my soul, have mercy on it, and if You send it back, protect it as You protect Your righteous servants.",
        ar: "باسمك ربي وضعت جنبي وبك أرفعه..."
      },
      source: "Sahih Al-Bukhari (6320), Sahih Muslim (2714)",
      targetCount: 1
    },
    {
      id: "h-8",
      category: { fr: "Tasbih et Louange d'Allah (100 fois)", en: "Daily Glorification (100 times)", ar: "التسبيح والتحميد اليومي" },
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ.",
      phonetic: "Subhânallâhi wa bihamdih, Subhânallâhi-l-'Adhîm.",
      translation: {
        fr: "Gloire et louange à Allah, Gloire à Allah l'Immense. (Deux paroles légères sur la langue, lourdes sur la balance des actes et aimées du Tout-Miséricordieux).",
        en: "Glory and praise be to Allah, Glory be to Allah the Almighty. (Two expressions light on the tongue, heavy on the scale, and beloved to the Most Merciful).",
        ar: "سبحان الله وبحمده، سبحان الله العظيم"
      },
      source: "Sahih Al-Bukhari (6405, 6682), Sahih Muslim (2694)",
      targetCount: 100
    }
  ];

  const filteredBukhari = bukhariHadiths.filter(h => 
    h.theme[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.arabic.includes(searchQuery) ||
    h.translation[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNawawi = nawawiHadiths.filter(h => 
    h.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.arabic.includes(searchQuery) ||
    h.translation[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.explanation[lang].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHisnul = hisnulInvocations.filter(h => 
    h.category[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.arabic.includes(searchQuery) ||
    h.translation[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.phonetic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAr = lang === 'ar';

  return (
    <div className={`islamic-pattern min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white ${isAr ? 'text-right' : 'text-left'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* PAGE HEADER */}
        <div className="text-center space-y-3">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-gold-main uppercase bg-gold-main/10 px-3.5 py-1 rounded-full border border-gold-main/20 inline-block">
            📿 AL-HADITH AL-SHARIF
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* SEARCH & TABS BAR */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl backdrop-blur-md">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => { setActiveTab('bukhari'); setSearchQuery(''); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bukhari'
                  ? 'bg-emerald-main text-white shadow-md'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {t.tabBukhari}
            </button>
            <button
              onClick={() => { setActiveTab('nawawi'); setSearchQuery(''); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'nawawi'
                  ? 'bg-emerald-main text-white shadow-md'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {t.tabNawawi}
            </button>
            <button
              onClick={() => { setActiveTab('hisnul'); setSearchQuery(''); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hisnul'
                  ? 'bg-emerald-main text-white shadow-md'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {t.tabHisnul}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 ${isAr ? 'left-3' : 'right-3'}`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold-main placeholder-zinc-500 font-sans ${isAr ? 'pl-10 text-right' : 'pr-10 text-left'}`}
            />
          </div>
        </div>

        {/* CONTENT PANELS */}
        <div className="space-y-6">
          
          {/* SAHIH BUKHARI / MUSLIM */}
          {activeTab === 'bukhari' && (
            <div className="grid grid-cols-1 gap-6">
              {filteredBukhari.map((hadith) => {
                const isFav = favorites.includes(hadith.id);
                return (
                  <motion.div
                    key={hadith.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 hover:border-gold-main/20 transition-all shadow-lg space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-main/10 border border-emerald-main/20 flex items-center justify-center text-xs font-bold text-emerald-light">
                          #{hadith.number}
                        </span>
                        <h3 className="text-sm font-serif font-bold text-gold-light">
                          {hadith.theme[lang]}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(hadith.id)}
                          className={`p-2 rounded-lg border ${isFav ? 'bg-red-950/20 border-red-900 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                          title="Favori"
                        >
                          <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => handleCopy(hadith.id, `${hadith.arabic}\n\n${hadith.translation[lang]}\nSource: ${hadith.source}`)}
                          className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"
                          title="Copier"
                        >
                          {copiedId === hadith.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <p className="text-xl sm:text-2xl font-serif text-white leading-relaxed text-right font-amiri tracking-wide" dir="rtl">
                      {hadith.arabic}
                    </p>

                    {/* Translation */}
                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-850 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block font-sans tracking-widest">
                        {t.source} {hadith.narrator[lang]} :
                      </span>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-light">
                        « {hadith.translation[lang]} »
                      </p>
                    </div>

                    {/* Chain of Transmission */}
                    {hadith.isnad && (
                      <div className="text-[11px] text-zinc-500 italic space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850">
                        <span className="font-semibold text-zinc-400 block font-sans">{t.chain}</span>
                        <p className="font-sans font-light">{hadith.isnad[lang]}</p>
                      </div>
                    )}

                    <div className="text-[10px] font-mono text-gold-dark text-right">
                      📚 {hadith.source}
                    </div>
                  </motion.div>
                );
              })}
              {filteredBukhari.length === 0 && (
                <div className="text-center py-10 text-zinc-500 font-sans">
                  Aucun hadith trouvé pour votre recherche.
                </div>
              )}
            </div>
          )}

          {/* 40 HADITHS NAWAWI */}
          {activeTab === 'nawawi' && (
            <div className="grid grid-cols-1 gap-6">
              {filteredNawawi.map((hadith) => {
                const isFav = favorites.includes(hadith.id);
                return (
                  <motion.div
                    key={hadith.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 hover:border-gold-main/20 transition-all shadow-lg space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                      <h3 className="text-sm sm:text-base font-serif font-bold text-gold-light">
                        {hadith.title[lang]}
                      </h3>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(hadith.id)}
                          className={`p-2 rounded-lg border ${isFav ? 'bg-red-950/20 border-red-900 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                          title="Favori"
                        >
                          <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => handleCopy(hadith.id, `${hadith.arabic}\n\n${hadith.translation[lang]}`)}
                          className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"
                          title="Copier"
                        >
                          {copiedId === hadith.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <p className="text-xl sm:text-2xl font-serif text-white leading-relaxed text-right font-amiri tracking-wide" dir="rtl">
                      {hadith.arabic}
                    </p>

                    {/* Translation */}
                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-850 space-y-2">
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-light">
                        {hadith.translation[lang]}
                      </p>
                    </div>

                    {/* Commentary & Lessons */}
                    <div className="bg-emerald-950/10 border border-emerald-900/30 p-5 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-emerald-light font-serif text-xs sm:text-sm font-bold">
                        <BookOpenCheck className="w-4 h-4" />
                        <span>{t.explanation}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-light">
                        {hadith.explanation[lang]}
                      </p>

                      <div className="border-t border-emerald-900/20 pt-3 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-light block uppercase font-sans">{t.lessons}</span>
                        <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1.5 font-sans">
                          {hadith.lessons.map((lesson, i) => (
                            <li key={i}>{lesson[lang]}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filteredNawawi.length === 0 && (
                <div className="text-center py-10 text-zinc-500 font-sans">
                  Aucun hadith trouvé pour votre recherche.
                </div>
              )}
            </div>
          )}

          {/* HISNUL MUSLIM */}
          {activeTab === 'hisnul' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHisnul.map((inv) => {
                const count = hisnulCounter[inv.id] || 0;
                const isCompleted = count >= inv.targetCount;
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-gold-main/20 transition-all shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-gold-light bg-gold-main/10 px-2.5 py-1 rounded-full border border-gold-main/20">
                          {inv.category[lang]}
                        </span>
                        <button
                          onClick={() => handleCopy(inv.id, `${inv.arabic}\n\n${inv.phonetic}\n\n${inv.translation[lang]}`)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                          title="Copier"
                        >
                          {copiedId === inv.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Arabic */}
                      <p className="text-lg sm:text-xl font-serif text-white text-right font-amiri leading-relaxed" dir="rtl">
                        {inv.arabic}
                      </p>

                      {/* Phonetic */}
                      <p className="text-xs text-emerald-light/90 italic leading-relaxed font-serif">
                        {inv.phonetic}
                      </p>

                      {/* Translation */}
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-light">
                        {inv.translation[lang]}
                      </p>

                      <div className="text-[10px] font-mono text-zinc-500">
                        📖 {inv.source}
                      </div>
                    </div>

                    {/* Counter Integration */}
                    <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 font-sans tracking-wider">
                          {t.counter}
                        </span>
                        <span className="text-sm font-bold text-white font-mono">
                          {count} / <span className="text-gold-main">{inv.targetCount}</span>
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCountReset(inv.id)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold rounded text-zinc-400"
                        >
                          Reset
                        </button>
                        <button
                          disabled={isCompleted}
                          onClick={() => handleCountIncrement(inv.id, inv.targetCount)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
                            isCompleted
                              ? 'bg-emerald-900/30 text-emerald-400 cursor-not-allowed border border-emerald-900/50'
                              : 'bg-emerald-main text-white hover:bg-emerald-med hover:scale-102 active:scale-98'
                          }`}
                        >
                          {isCompleted ? 'Macha\'Allah ✓' : '+1 Click'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filteredHisnul.length === 0 && (
                <div className="text-center py-10 text-zinc-500 col-span-2 font-sans">
                  Aucune invocation trouvée pour votre recherche.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
