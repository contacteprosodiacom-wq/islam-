import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Star, Calendar, Users, Award, Shield, CheckCircle, Flame, Sparkles, Heart } from 'lucide-react';
import { Language } from '../types';

interface ProphetsProps {
  lang: Language;
}

export default function Prophets({ lang }: ProphetsProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'sira' | 'sahabas' | 'timeline'>('roster');
  const [selectedProphetId, setSelectedProphetId] = useState<string | null>(null);

  const isAr = lang === 'ar';

  const t = {
    fr: {
      title: "Histoires des Prophètes & Compagnons",
      subtitle: "Explorez les récits édifiants des messagers d'Allah et les vies inspirantes de ses compagnons dévoués.",
      tabRoster: "Les 25 Prophètes",
      tabSira: "Vie du Prophète ﷺ",
      tabSahabas: "Les Compagnons (Sahabas)",
      tabTimeline: "Chronologie de l'Islam",
      detailsTitle: "Détails de la mission de",
      miraclesLabel: "Miracles accordés :",
      lessonsLabel: "Leçons à retenir :",
      biblicalName: "Équivalent biblique :",
      epoch: "Époque & Lieu :",
      people: "Envoyé au peuple :",
      versesRef: "Sourates / Versets référencés :",
      closeDetails: "Fermer les détails"
    },
    en: {
      title: "Stories of the Prophets & Companions",
      subtitle: "Explore the uplifting stories of Allah's messengers and the inspiring lives of his devoted companions.",
      tabRoster: "The 25 Prophets",
      tabSira: "Sira of the Prophet ﷺ",
      tabSahabas: "The Companions (Sahabas)",
      tabTimeline: "Chronology of Islam",
      detailsTitle: "Mission Details of",
      miraclesLabel: "Miracles Granted:",
      lessonsLabel: "Lessons to Learn:",
      biblicalName: "Biblical Equivalent:",
      epoch: "Epoch & Place:",
      people: "Sent to People:",
      versesRef: "Quranic Verses Referenced:",
      closeDetails: "Close Details"
    },
    ar: {
      title: "قصص الأنبياء والصحابة الكرام",
      subtitle: "استكشف العبر والمواعظ من قصص رسل الله الكرام ومسير الصحابة الأجلاء رضي الله عنهم.",
      tabRoster: "الأنبياء والرسل ٢٥",
      tabSira: "السيرة النبوية ﷺ",
      tabSahabas: "الصحابة الكrab",
      tabTimeline: "التاريخ الإسلامي العريق",
      detailsTitle: "تفاصيل رسالة ونبوة",
      miraclesLabel: "المعجزات المؤيدة :",
      lessonsLabel: "الدروس والعبر التربوية :",
      biblicalName: "الاسم التوراتي/الإنجيلي :",
      epoch: "العصر والمكان المقدر :",
      people: "القوم المرسل إليهم :",
      versesRef: "الآيات والذكر في القرآن :",
      closeDetails: "إغلاق التفاصيل"
    }
  }[lang];

  // 1. The 25 Prophets Data List
  const prophetsList = [
    {
      id: "p-1",
      name: "Adam",
      arabic: "آدم",
      biblical: "Adam",
      epoch: { fr: "Origine de la Création", en: "Beginning of Creation", ar: "بدء الخلق" },
      people: { fr: "Premier Homme", en: "First Man", ar: "أول البشرية" },
      miracles: {
        fr: "Création à partir de l'argile, enseignement des noms de toutes choses par Allah.",
        en: "Created directly from clay, taught the names of all things by Allah.",
        ar: "خُلق من طين ونفخ الروح، وتعلم الأسماء كلها بفضل الله."
      },
      lessons: {
        fr: "Le repentir immédiat après l'erreur, la vigilance face aux ruses d'Iblis (Satan).",
        en: "Immediate repentance after an error, and continuous vigilance against the traps of Satan.",
        ar: "سرعة التوبة بعد الذنب، والحذر الشديد من وسوسة الشيطان."
      },
      verses: "Al-Baqarah (30-38), Al-A'raf (11-25)",
      desc: {
        fr: "Le père de l'humanité, premier homme créé par Allah à partir de la terre, installé au Paradis puis descendu sur Terre pour y accomplir sa mission de vicaire.",
        en: "The father of humanity, the first human created by Allah from earth, settled in Paradise then sent to Earth to perform his mission.",
        ar: "أبو البشر، خلقه الله بيده من طين وأسكنه الجنة ثم أهبطه للأرض لعمارتها بالتوحيد."
      }
    },
    {
      id: "p-2",
      name: "Idris",
      arabic: "إدريس",
      biblical: "Enoch",
      epoch: { fr: "Avant le Déluge", en: "Before the Flood", ar: "قبل الطوفان" },
      people: { fr: "Descendants de Seth", en: "Seth's descendants", ar: "بنو شيث" },
      miracles: {
        fr: "Première écriture à la plume, premier à coudre des vêtements.",
        en: "First to write with a pen, first to tailor clothes.",
        ar: "أول من خط بالقلم، وأول من خاط الثياب."
      },
      lessons: {
        fr: "La recherche constante de la science et de l'instruction.",
        en: "Constant pursuit of knowledge, science and writing.",
        ar: "السعي لطلب العلم والكتابة والصدق في القول."
      },
      verses: "Maryam (56-57), Al-Anbiya (85)",
      desc: {
        fr: "Un prophète élevé par Allah à un rang sublime pour sa véracité, sa patience et son apprentissage de la plume.",
        en: "A prophet raised to high ranks by Allah for his truthfulness, patience, and writing skills.",
        ar: "نبي عظيم رفعه الله مكاناً علياً لصدقه وصبره وكتابته."
      }
    },
    {
      id: "p-3",
      name: "Nuh",
      arabic: "نوح",
      biblical: "Noah",
      epoch: { fr: "Déluge historique", en: "Great Flood Epoch", ar: "عصر الطوفان العظيم" },
      people: { fr: "Bani Rasib / Idolâtres", en: "Bani Rasib idolaters", ar: "قوم نوح عبدة الأصنام" },
      miracles: {
        fr: "Construction de l'Arche géante sans fleuve à proximité, survie miraculeuse au Déluge.",
        en: "Construction of the giant Ark without nearby rivers, survival of the Great Flood.",
        ar: "بناء السفينة العظيمة بغير بحر مجاور، والنجاة من الطوفان المدمر."
      },
      lessons: {
        fr: "La patience absolue dans la dawah (950 ans de prêche), l'allégeance absolue aux commandements d'Allah.",
        en: "Absolute patience in Dawah (950 years of preaching), and complete obedience to Allah's orders.",
        ar: "الصبر اللامحدود في الدعوة (٩٥٠ سنة)، والولاء الكامل لله."
      },
      verses: "Nuh, Hud (25-49), Al-Anbiya (76-77)",
      desc: {
        fr: "Le premier des grands messagers d'Allah (Ulul 'Azm). Il a prêché le monothéisme pendant près de dix siècles avant de construire l'Arche pour sauver les croyants et les animaux.",
        en: "The first of the great messengers (Ulul 'Azm). He preached monotheism for 950 years before building the Ark to save believers and animals.",
        ar: "أول أولي العزم من الرسل، لبث في قومه يدعوهم ألف سنة إلا خمسين عاماً لبناء السفينة."
      }
    },
    {
      id: "p-4",
      name: "Ibrahim",
      arabic: "إبراهيم",
      biblical: "Abraham",
      epoch: { fr: "Babylone antique", en: "Ancient Mesopotamia", ar: "بابل القديمة" },
      people: { fr: "Chaldéens et Roi Nemrod", en: "Chaldeans and King Nimrod", ar: "الكلدانيون والملك نمرود" },
      miracles: {
        fr: "Le feu géant devenu frais et salutaire pour lui, reconstruction de la Kaaba.",
        en: "Thrown into a massive fire which turned cool and safe, rebuilding the Kaaba.",
        ar: "النجاة من النار الكبرى التي جعلها الله برداً وسلاماً، وبناء البيت الحرام."
      },
      lessons: {
        fr: "Le monothéisme pur (Hanif), le sacrifice total de ses biens et de son fils pour plaire au Créateur.",
        en: "Pure monotheism (Hanifiyyah), and complete devotion to Allah over assets and lineage.",
        ar: "التوحيد الخالص، والتسليم التام لله في التضحية والمال والولد."
      },
      verses: "Al-Baqarah (124-131), Ibrahim, Al-Anbiya (51-73)",
      desc: {
        fr: "L'ami intime d'Allah (Khalil Allah), père spirituel des prophètes, qui a combattu l'idolâtrie de Nemrod et a bâti les fondations de la Kaaba sacrée.",
        en: "The close friend of Allah (Khalil Allah), spiritual father of prophets, who challenged Nimrod's idolatry and rebuilt the Kaaba.",
        ar: "خليل الله، وأبو الأنبياء، كسر الأصنام وواجه النمرود وبنى الكعبة المشرفة."
      }
    },
    {
      id: "p-5",
      name: "Moussa",
      arabic: "موسى",
      biblical: "Moses",
      epoch: { fr: "Égypte des Pharaons", en: "Pharaonic Egypt", ar: "مصر الفرعونية" },
      people: { fr: "Pharaon & Bani Israïl", en: "Pharaoh & Children of Israel", ar: "فرعون وبنو إسرائيل" },
      miracles: {
        fr: "Le bâton transformé en serpent, la main lumineuse, l'ouverture de la Mer Rouge en douze chemins.",
        en: "The staff turning into a snake, glowing hand, splitting of the Red Sea into twelve paths.",
        ar: "العصا التي تحولت لثعبان، واليد البيضاء، وفلق البحر الأحمر لنجاة بني إسرائيل."
      },
      lessons: {
        fr: "La lutte contre l'oppression et l'injustice d'État, la fidélité aux tablettes de la Torah.",
        en: "Challenging state oppression and tyranny, standing firm on Torah commandments.",
        ar: "مقاومة الظلم والاستبداد الفرعوني، والصبر على أذى الناس."
      },
      verses: "Al-A'raf (103-162), Taha (9-98), Al-Qasas",
      desc: {
        fr: "Celui à qui Allah a parlé directement (Kalim Allah). Libérateur des Enfants d'Israël de l'esclavage de Pharaon et destinataire de la Torah sur le mont Sinaï.",
        en: "The one spoken to directly by Allah (Kalim Allah). Liberator of the Children of Israel from Egyptian slavery and recipient of the Torah.",
        ar: "كليم الله، أرسله الله ليخلص بني إسرائيل من عبودية فرعون الطاغية وأنزل عليه التوراة."
      }
    },
    {
      id: "p-6",
      name: "'Issa",
      arabic: "عيسى",
      biblical: "Jesus",
      epoch: { fr: "Palestine romaine", en: "Roman Palestine", ar: "فلسطين الرومانية" },
      people: { fr: "Bani Israïl (Enfants d'Israël)", en: "Children of Israel", ar: "بنو إسرائيل" },
      miracles: {
        fr: "Naissance miraculeuse sans père, parler au berceau, guérir les aveugles, ressusciter les morts par permission d'Allah.",
        en: "Miraculous birth without a father, speaking from the cradle, healing the blind and lepers, raising dead with Allah's leave.",
        ar: "الولادة الإعجازية بلا أب، والكلام في المهد، وإبراء الأكمه والأبرص وإحياء الموتى بإذن الله."
      },
      lessons: {
        fr: "L'ascétisme et le détachement de la vie matérielle, la purification spirituelle du cœur.",
        en: "Asceticism, detachment from worldly material items, and purifying the spiritual heart.",
        ar: "الزهد الكامل في الدنيا، والتركيز على تزكية النفوس والرحمة."
      },
      verses: "Al-Imran (42-60), Maryam (16-36), Al-Ma'idah (110-118)",
      desc: {
        fr: "L'esprit d'Allah et Sa parole ('Issa Ibn Maryam). Prophète d'une pureté exceptionnelle envoyé aux juifs pour adoucir la loi religieuse et prêcher l'Évangile (Injiil).",
        en: "The Spirit and Word of Allah ('Issa Ibn Maryam). A pure prophet sent to refine the law and preach the Gospel (Injeel).",
        ar: "روح الله وكلمته ألقاها إلى مريم العذراء، نبي معصوم أنزل الله عليه الإنجيل."
      }
    },
    {
      id: "p-7",
      name: "Muhammad ﷺ",
      arabic: "محمد ﷺ",
      biblical: "Muhammad",
      epoch: { fr: "Péninsule Arabique (570-632 CE)", en: "Arabian Peninsula (570-632 CE)", ar: "الجزيرة العربية" },
      people: { fr: "L'Humanité entière", en: "All of Humanity", ar: "البشرية جمعاء" },
      miracles: {
        fr: "Le Noble Coran (miracle éternel), la scission de la lune, le voyage nocturne (Isra wal Mi'raj).",
        en: "The Noble Quran (eternal miracle), splitting of the moon, night journey (Isra wal Mi'raj).",
        ar: "القرآن الكريم المعجزة الخالدة، وانشقاق القمر، والإسراء والمعراج."
      },
      lessons: {
        fr: "L'excellence morale complète (Al-Akhlaq), la miséricorde universelle, la persévérance absolue.",
        en: "Perfect moral character (Al-Akhlaq), universal mercy, and absolute perseverance.",
        ar: "كمال الأخلاق الإنسانية، والرحمة المهداة للعالمين، والثبات."
      },
      verses: "Al-Ahzab (40), Al-Fath, Muhammad, Al-Anbiya (107)",
      desc: {
        fr: "Le Sceau des Prophètes et Messagers, envoyé comme une miséricorde universelle. Il a purifié la péninsule de l'idolâtrie et a complété le message de l'Islam pour le monde entier.",
        en: "The Seal of the Prophets and Messengers, sent as a universal mercy. He purified Arabia from polytheism and perfected the message of Islam for humanity.",
        ar: "خاتم الأنبياء والمرسلين، أرسله الله رحمة للعالمين، بلغ الرسالة وأدى الأمانة ونصح الأمة."
      }
    }
  ];

  // 2. Sira of Muhammad ﷺ - 10 Key Epochs
  const siraTimeline = [
    { year: "570 CE", title: { fr: "Naissance à La Mecque", en: "Birth in Mecca", ar: "المولد النبوي الشريف" }, desc: { fr: "Naissance orpheline de père dans le clan prestigieux des Bani Hashim. Sa mère Amina décède quelques années plus tard.", en: "Born an orphan in the noble clan of Banu Hashim. His mother Amina passed away a few years later.", ar: "ولد يتيماً في شعب بني هاشم بمكة المكرمة في عام الفيل، وتوفيت أمه آمنة وعمره ٦ سنوات." } },
    { year: "610 CE", title: { fr: "Première Révélation (Hira)", en: "First Revelation (Hira)", ar: "نزول الوحي بغار حراء" }, desc: { fr: "À l'âge de 40 ans, l'archange Jibril lui apparaît dans la grotte de Hira et lui ordonne 'Iqra' (Lis !), marquant le début de la prophétie.", en: "At the age of 40, the Archangel Jibril appeared to him in the cave of Hira, ordering him to 'Iqra' (Read!).", ar: "نزل عليه جبريل عليه السلام بغار حراء وعمره ٤٠ سنة وبدأ برسالة 'اقرأ'." } },
    { year: "613 CE", title: { fr: "Prédication publique", en: "Public Preaching", ar: "الجهر بالدعوة" }, desc: { fr: "Appel public au monothéisme au sommet du mont Safa. Début de la persécution acharnée par l'élite de Quraysh.", en: "Public call to monotheism atop Mount Safa. Start of intense persecution by the Quraysh tribe.", ar: "صعد الصفا ودعا قريشاً علانية لعبادة الله وحده، فبدأت قريش بمحاربته وأصحابه." } },
    { year: "620 CE", title: { fr: "Voyage Nocturne (Isra & Mi'raj)", en: "The Night Journey", ar: "الإسراء والمعراج" }, desc: { fr: "Voyage miraculeux de La Mecque à Jérusalem puis ascension à travers les sept cieux où la prière rituelle est prescrite.", en: "Miraculous journey from Mecca to Jerusalem and ascension through the seven heavens where 5 daily prayers were ordained.", ar: "أسرى به من المسجد الحرام إلى المسجد الأقصى ثم عرج به للسماء السابعة وفرض الصلوات الخمس." } },
    { year: "622 CE", title: { fr: "L'Hégire à Médine", en: "Hegira to Medina", ar: "الهجرة النبوية المباركة" }, desc: { fr: "Émigration historique des musulmans vers Yathrib (Médine). Fondation du premier État islamique et début de l'ère hijri.", en: "Historical migration of Muslims to Yathrib (Medina). Founding of the first Islamic state and start of Hijri calendar.", ar: "هاجر مع الصديق إلى يثرب (المدينة المنورة) لبناء الدولة الإسلامية وبدء التاريخ الهجري." } },
    { year: "624 CE", title: { fr: "La Bataille de Badr", en: "Battle of Badr", ar: "غزوة بدر الكبرى" }, desc: { fr: "Victoire miraculeuse de 313 musulmans face à un millier de guerriers de Quraysh, établissant la puissance militaire de Médine.", en: "Miraculous victory of 313 Muslims over 1,000 Quraysh warriors, establishing Medina's military strength.", ar: "أول مواجهة عسكرية كبرى انتصر فيها ٣١٣ مسلماً على ألف من صناديد قريش." } },
    { year: "630 CE", title: { fr: "Conquête de La Mecque", en: "Conquest of Mecca", ar: "فتح مكة العظيم" }, desc: { fr: "Entrée pacifique de l'armée musulmane à La Mecque. Le Prophète ﷺ pardonne à ses anciens persécuteurs et détruit les idoles de la Kaaba.", en: "Peaceful entry of the Muslim army into Mecca. The Prophet ﷺ forgave his persecutors and destroyed all idols inside the Kaaba.", ar: "دخل مكة بجيش قوامة ١٠ آلاف بسلام، وعفا عن أهلها وحطم الأصنام حول الكعبة." } },
    { year: "632 CE", title: { fr: "Le Sermon d'Adieu & Décès", en: "Farewell Sermon & Death", ar: "حجة الوداع والوفاة" }, desc: { fr: "Prononciation du sermon universel des droits de l'homme lors du pèlerinage d'adieu. Le Prophète ﷺ s'éteint peu après à Médine.", en: "Delivered the universal human rights sermon during his farewell pilgrimage. He passed away shortly after in Medina.", ar: "ألقى خطبة الوداع الجامعة في عرفات وتوفي بالمدينة في ربيع الأول وعمره ٦٣ سنة." } }
  ];

  // 3. Sahabas / Companions
  const sahabasList = [
    { name: "Abu Bakr As-Siddiq", arabic: "أبو بكر الصديق", title: { fr: "Le Meilleur Compagnon", en: "The Best Companion", ar: "الصديق الأكبر" }, desc: { fr: "Le premier homme à embrasser l'Islam, compagnon intime du Prophète ﷺ durant l'Hégire et premier Calife bien guidé.", en: "First man to accept Islam, close companion of the Prophet ﷺ during Hegira, and the first Rightly Guided Calife.", ar: "أول من أسلم من الرجال، ورفيق الهجرة، وثاني اثنين في الغار، وأول الخلفاء الراشدين." } },
    { name: "Omar ibn Al-Khattab", arabic: "عمر بن الخطاب", title: { fr: "Le Distingueur (Al-Farouq)", en: "The Distinguisher (Al-Farooq)", ar: "الفاروق" }, desc: { fr: "Connu pour sa justice rigoureuse et son intégrité financière. Deuxième Calife, sous qui l'État islamique s'est considérablement structuré.", en: "Famous for his strict justice and financial integrity. Second Calife under whose rule the Islamic administration was structured.", ar: "قوي في الحق، عادل في الحكم، وثاني الخلفاء الراشدين، فتحت في عهده القدس والبلاد." } },
    { name: "Outhman ibn Affan", arabic: "عثمان بن عفان", title: { fr: "L'Homme aux Deux Lumières", en: "Possessor of Two Lights", ar: "ذو النورين" }, desc: { fr: "Troisième Calife, célèbre pour sa grande générosité et sa pudeur. Il a financé l'armée de Tabouk et compilé le Coran officiel.", en: "Third Calife, legendary for his generosity and shyness. Financed the army of Tabuk and compiled the standard copy of the Quran.", ar: "تستحي منه ملائكة الرحمن، جهز جيش العسرة، وجمع القرآن العظيم، وثالث الخلفاء الراشدين." } },
    { name: "Ali ibn Abi Talib", arabic: "علي بن أبي طالب", title: { fr: "La Porte de la Science", en: "Gate of Knowledge", ar: "باب العلم وأبو السبطين" }, desc: { fr: "Cousin et gendre du Prophète ﷺ. Quatrième Calife, reconnu pour sa bravoure légendaire au combat et sa sagesse oratoire incomparable.", en: "Cousin and son-in-law of the Prophet ﷺ. Fourth Calife, known for legendary bravery in battles and profound eloquence.", ar: "ابن عم النبي وصهره، رابع الخلفاء الراشدين، فارس بدر وخيبر، وأعلم الصحابة بالقضاء." } },
    { name: "Bilal ibn Rabah", arabic: "بلال بن رباح", title: { fr: "Le premier Mouadhdhin", en: "The First Muadhin", ar: "مؤذن الرسول" }, desc: { fr: "Esclave abyssin torturé à La Mecque qui criait 'Ahad ! Ahad !' (Unique !). Libéré par Abu Bakr, il devint le premier muezzin de l'Islam.", en: "Abyssinian slave tortured in Mecca who shouted 'Ahad! Ahad!' (One! One!). Freed by Abu Bakr, he became the first caller to prayer.", ar: "مؤذن الإسلام الأول، صبر على تعذيب قريش وكان يصرخ 'أحد أحد'، أعتقه أبو بكر." } }
  ];

  return (
    <div className={`islamic-pattern min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white ${isAr ? 'text-right' : 'text-left'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-gold-main uppercase bg-gold-main/10 px-3.5 py-1 rounded-full border border-gold-main/20 inline-block">
            👳 AL-ANBIYA & SAHABAS
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-2 rounded-2xl flex flex-wrap gap-1 items-center justify-center shadow-lg backdrop-blur-md">
          {[
            { id: 'roster', label: t.tabRoster },
            { id: 'sira', label: t.tabSira },
            { id: 'sahabas', label: t.tabSahabas }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedProphetId(null);
              }}
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

        {/* CONTENT */}
        <div className="space-y-6">
          
          {/* TAB 1: THE 25 PROPHETS ROSTER */}
          {activeTab === 'roster' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: interactive grid of 7 prophets highlighted + list */}
              <div className="lg:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scroll">
                {prophetsList.map(pr => (
                  <button
                    key={pr.id}
                    onClick={() => setSelectedProphetId(pr.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                      selectedProphetId === pr.id
                        ? 'bg-emerald-main/10 border-emerald-main text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/50'
                    } ${isAr ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center font-serif font-bold text-gold-main text-sm border border-gold-main/15">
                        {pr.name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-serif">{pr.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-sans">{t.biblicalName} {pr.biblical}</p>
                      </div>
                    </div>

                    <span className="text-lg font-serif font-bold text-gold-light font-amiri tracking-wider" dir="rtl">
                      {pr.arabic}
                    </span>
                  </button>
                ))}
              </div>

              {/* Right Side: details panel */}
              <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
                <AnimatePresence mode="wait">
                  {selectedProphetId ? (
                    (() => {
                      const pr = prophetsList.find(p => p.id === selectedProphetId)!;
                      return (
                        <motion.div
                          key={pr.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-6"
                        >
                          <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                            <div>
                              <span className="text-[10px] bg-gold-main/10 text-gold-main px-2.5 py-1 rounded-full border border-gold-main/20 uppercase font-sans font-bold">
                                {t.detailsTitle}
                              </span>
                              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                                {pr.name}
                              </h2>
                            </div>
                            <span className="text-3xl font-serif font-bold text-emerald-light font-amiri" dir="rtl">
                              {pr.arabic}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                            <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-850/60">
                              <span className="text-zinc-500 block uppercase font-bold tracking-wider mb-1">{t.biblicalName}</span>
                              <span className="text-white font-medium">{pr.biblical}</span>
                            </div>
                            <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-850/60">
                              <span className="text-zinc-500 block uppercase font-bold tracking-wider mb-1">{t.epoch}</span>
                              <span className="text-white font-medium">{pr.epoch[lang]}</span>
                            </div>
                            <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-850/60">
                              <span className="text-zinc-500 block uppercase font-bold tracking-wider mb-1">{t.people}</span>
                              <span className="text-white font-medium">{pr.people[lang]}</span>
                            </div>
                            <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-850/60">
                              <span className="text-zinc-500 block uppercase font-bold tracking-wider mb-1">{t.versesRef}</span>
                              <span className="text-emerald-light font-mono font-medium">{pr.verses}</span>
                            </div>
                          </div>

                          <div className="bg-zinc-950/30 p-5 rounded-xl border border-zinc-850 space-y-2">
                            <span className="text-xs uppercase font-bold text-gold-light block font-serif tracking-wider">Biographie & Récit :</span>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-light">
                              {pr.desc[lang]}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-amber-950/10 border border-amber-900/20 p-4 rounded-xl space-y-2">
                              <span className="text-xs font-bold text-amber-500 block uppercase font-sans tracking-wide">⚡ {t.miraclesLabel}</span>
                              <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light">
                                {pr.miracles[lang]}
                              </p>
                            </div>
                            <div className="bg-emerald-950/10 border border-emerald-900/20 p-4 rounded-xl space-y-2">
                              <span className="text-xs font-bold text-emerald-light block uppercase font-sans tracking-wide">💡 {t.lessonsLabel}</span>
                              <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light">
                                {pr.lessons[lang]}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-500 space-y-3">
                      <BookOpen className="w-12 h-12 text-zinc-700" />
                      <div>
                        <p className="text-sm font-bold text-zinc-400">Sélectionnez un Prophète dans la liste</p>
                        <p className="text-xs text-zinc-600 mt-1">Cliquez sur un nom pour afficher sa biographie, sa mission, ses miracles et versets associés.</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* TAB 2: SIRA (LIFE OF THE PROPHET) */}
          {activeTab === 'sira' && (
            <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-8">
              <div className="text-center border-b border-zinc-800 pb-4">
                <span className="text-xs font-bold text-gold-main uppercase tracking-widest">السيرة النبوية المطهرة</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                  Chronologie de la Sira du Prophète ﷺ
                </h2>
              </div>

              {/* Vertical timeline tree */}
              <div className="relative border-l-2 border-zinc-800 pl-6 ml-4 space-y-8">
                {siraTimeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    {/* Circle timeline dot */}
                    <span className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-emerald-main border-4 border-zinc-900"></span>

                    <div className="bg-zinc-950/40 border border-zinc-850 p-5 rounded-xl space-y-2 hover:border-gold-main/10 transition-all">
                      <span className="text-[10px] font-mono font-bold text-gold-main bg-gold-main/10 px-2.5 py-0.5 rounded border border-gold-main/15">
                        {item.year}
                      </span>
                      <h4 className="text-sm sm:text-base font-serif font-bold text-white mt-1">
                        {item.title[lang]}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans font-light">
                        {item.desc[lang]}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SAHABAS (COMPANIONS) */}
          {activeTab === 'sahabas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sahabasList.map((sahaba, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg hover:border-gold-main/25 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-light bg-emerald-main/10 px-2.5 py-0.5 rounded uppercase tracking-wider block border border-emerald-main/20">
                          {sahaba.title[lang]}
                        </span>
                        <h3 className="text-sm sm:text-base font-serif font-bold text-white mt-1">
                          {sahaba.name}
                        </h3>
                      </div>
                      <span className="text-lg font-serif font-bold text-gold-light font-amiri tracking-wide" dir="rtl">
                        {sahaba.arabic}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans font-light">
                      {sahaba.desc[lang]}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-500 text-right">
                    Qu'Allah soit satisfait de lui (Radiya Allahu 'Anhu) RA
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
