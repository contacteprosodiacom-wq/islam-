import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Shield, Search, Calendar, Heart, Layers, HelpCircle, CheckSquare, SearchCode } from 'lucide-react';
import { Language } from '../types';

interface IslamProps {
  lang: Language;
}

export default function Islam({ lang }: IslamProps) {
  const [activeTab, setActiveTab] = useState<'names' | 'schools' | 'signs' | 'e_codes'>('names');
  const [searchQuery, setSearchQuery] = useState('');

  const isAr = lang === 'ar';

  const t = {
    fr: {
      title: "Sciences de l'Islam & Pratiques",
      subtitle: "Apprenez les piliers de notre foi, découvrez les 99 Noms d'Allah, les écoles juridiques et les codes alimentaires halal.",
      tabNames: "99 Noms d'Allah",
      tabSchools: "4 Écoles Juridiques",
      tabSigns: "Fin des Temps",
      tabECodes: "Codes E (Additifs Halal)",
      searchPlaceholder: "Rechercher...",
      halalStatus: "Statut :",
      halal: "Halal ✓",
      haram: "Haram ✗",
      doubtful: "Douteux / Mushbooh ?",
      invokingGuide: "Comment invoquer avec ce nom :",
      founder: "Fondateur :",
      geography: "Géographie :",
      methodology: "Méthode d'Usul :",
      smallSigns: "Petits signes de la Fin des Temps (déjà apparus ou en cours)",
      majorSigns: "Les 10 Grands Signes de la Fin des Temps (Séquence future)"
    },
    en: {
      title: "Islamic Sciences & Guidelines",
      subtitle: "Learn the pillars of our faith, explore the 99 Names of Allah, compare jurisprudence schools, and search halal E-codes.",
      tabNames: "99 Names of Allah",
      tabSchools: "4 Schools of Law",
      tabSigns: "End of Times",
      tabECodes: "E-Codes (Halal Guide)",
      searchPlaceholder: "Search...",
      halalStatus: "Status:",
      halal: "Halal ✓",
      haram: "Haram ✗",
      doubtful: "Doubtful / Mushbooh?",
      invokingGuide: "How to invoke with this Name:",
      founder: "Founder:",
      geography: "Geography:",
      methodology: "Methodology:",
      smallSigns: "Minor Signs (Already appeared or ongoing)",
      majorSigns: "The 10 Major Signs (Future sequence)"
    },
    ar: {
      title: "علوم العقيدة والشريعة الإسلامية",
      subtitle: "تعلم أصول عقيدتك، وتعرف على أسماء الله الحسنى، وفقه المذاهب الأربعة، ودليل الأرقام الغذائية الحلال.",
      tabNames: "أسماء الله الحسنى",
      tabSchools: "المذاهب الأربعة",
      tabSigns: "أشراط الساعة",
      tabECodes: "دليل الأرقام الغذائية",
      searchPlaceholder: "ابحث هنا...",
      halalStatus: "الحكم الشرعي :",
      halal: "حلال ✓",
      haram: "حرام ✗",
      doubtful: "مشبوه / فيه خلاف ؟",
      invokingGuide: "كيفية الدعاء والتعبد بهذا الاسم :",
      founder: "المؤسس وإمامه :",
      geography: "الانتشار الجغرافي :",
      methodology: "أصول الاستنباط :",
      smallSigns: "علامات الساعة الصغرى (ظهرت أو مستمرة في الظهور)",
      majorSigns: "علامات الساعة الكبرى العشرة المتتابعة"
    }
  }[lang];

  // 1. 99 Names of Allah Selection
  const namesOfAllah = [
    { num: 1, name: "Ar-Rahman", arabic: "الرَّحْمَنُ", translation: { fr: "Le Tout-Miséricordieux", en: "The Most Beneficent", ar: "الرحمن" }, desc: { fr: "Sa miséricorde est infinie, englobant toutes les créatures dans ce bas-monde croyants comme non-croyants.", en: "His mercy is infinite, encompassing all creatures in this world, believers and disbelievers alike.", ar: "واسع الرحمة الذي وسعت رحمته جميع الخلق في الدنيا." }, dua: "« Ya Rahman, fais-moi miséricorde... »" },
    { num: 2, name: "Ar-Rahim", arabic: "الرَّحِيمُ", translation: { fr: "Le Très-Miséricordieux", en: "The Most Merciful", ar: "الرحيم" }, desc: { fr: "Sa miséricorde est exclusive et réservée aux croyants sincères le jour du Jugement Dernier.", en: "His mercy is exclusive, reserved solely for sincere believers on the Day of Judgment.", ar: "الرحيم بعباده المؤمنين المخلصين يوم القيامة." }, dua: "« Ya Rahim, pardonne-moi et purifie mon cœur... »" },
    { num: 3, name: "Al-Malik", arabic: "الْمَلِكُ", translation: { fr: "Le Souverain", en: "Le Roi Absolu", ar: "الملك" }, desc: { fr: "Le Roi absolu et unique possesseur de la création, dont le pouvoir ne faiblit jamais.", en: "The absolute Sovereign and sole master of the creation, whose authority never wanes.", ar: "مالك الملك المتصرف بغير آمر ولا ممانع." }, dua: "« Ya Malik, fortifie ma foi et préserve mon foyer... »" },
    { num: 4, name: "Al-Quddus", arabic: "الْقُدُّوسُ", translation: { fr: "Le Pur", en: "The Pure / Sacred", ar: "القدوس" }, desc: { fr: "Pur de tout défaut ou imperfection humaine, digne de toute louange sacrée.", en: "Pure of all defects or human imperfections, worthy of all holy praise.", ar: "المنزه عن كل عيب ونقص وشبيه." }, dua: "« Ya Quddus, purifie mon esprit et mes actions... »" },
    { num: 5, name: "As-Salam", arabic: "السَّلَامُ", translation: { fr: "La Paix", en: "The Source of Peace", ar: "السلام" }, desc: { fr: "Source éternelle de sécurité, de paix et de salut pour l'Oummah.", en: "The eternal Source of safety, peace, and salvation for the Ummah.", ar: "ناشر السلام ومصدر الأمان لعباده." }, dua: "« Ya Salam, accorde la paix à notre communauté... »" },
    { num: 6, name: "Al-Mu'min", arabic: "الْمُؤْمِنُ", translation: { fr: "Le Sécurisant", en: "The Giver of Faith", ar: "المؤمن" }, desc: { fr: "Celui qui inspire la foi dans les cœurs et accorde la sécurité contre le châtiment.", en: "He who inspires faith in the hearts and grants safety from punishments.", ar: "الذي يهب الإيمان ويبث الطمأنينة." }, dua: "« Ya Mu'min, préserve ma poitrine du doute... »" },
    { num: 7, name: "Al-Muhaymin", arabic: "الْمُهَيْمِنُ", translation: { fr: "Le Surveillant", en: "The Guardian", ar: "المهيمن" }, desc: { fr: "Le témoin suprême qui observe et préserve chaque action de chaque créature.", en: "The supreme witness who observes and preserves every deed of every creature.", ar: "الرقيب الحافظ الشاهد على أعمال خلقه." }, dua: "« Ya Muhaymin, garde un œil bienveillant sur nous... »" },
    { num: 8, name: "Al-'Aziz", arabic: "الْعَزِيزُ", translation: { fr: "Le Tout-Puissant", en: "The Almighty", ar: "العزيز" }, desc: { fr: "Le Puissant, l'Insurmontable, dont la volonté s'accomplit sans obstacle.", en: "The Mighty, the Unconquerable, whose will is always done.", ar: "القوي المنيع الغالب الذي لا يغلب." }, dua: "« Ya 'Aziz, accorde-nous la fierté de notre dine... »" }
  ];

  // 2. 4 Sunni Jurisprudence Schools
  const schoolsOfLaw = [
    {
      name: "Hanafite (Hanafi)",
      arabic: "المذهب الحنفي",
      founder: "Abû Hanîfah Al-Nou'man (Irak, 699-767 CE)",
      geography: "Turquie, Balkans, Asie Centrale, Inde, Pakistan.",
      method: "Forte utilisation de la raison, de l'analogie (Qiyas), de l'opinion personnelle approuvée (Istihsan) et des coutumes locales saines.",
      books: "Al-Mabsut par Sarakhsi, Fath al-Qadir."
    },
    {
      name: "Malikite (Maliki)",
      arabic: "المذهب المالكي",
      founder: "Mâlik ibn Anas (Médine, 711-795 CE)",
      geography: "Afrique du Nord (Maroc, Algérie, Tunisie), Afrique de l'Ouest, Égypte.",
      method: "Grande importance accordée à la pratique des habitants de Médine (Amal ahl al-Madinah), à l'intérêt général (Maslahah Mursalah) et aux hadiths.",
      books: "Al-Muwatta par l'Imam Malik, Al-Mudawwanah."
    },
    {
      name: "Shafiite (Shafi'i)",
      arabic: "المذهب الشافعي",
      founder: "Muhammad ibn Idrîs Al-Châfi'î (Palestine/Égypte, 767-820 CE)",
      geography: "Afrique de l'Est, Égypte, Yémen, Indonésie, Malaisie.",
      method: "Codification rigoureuse des sources (Coran, Sunnah authentique, Consensus, Analogie stricte). Il a écrit la première méthodologie d'Usul.",
      books: "Kitab al-Umm par l'Imam Ash-Shafi'i, Al-Majmu'."
    },
    {
      name: "Hanbalite (Hanbali)",
      arabic: "المذهب الحنبلي",
      founder: "Ahmad ibn Hanbal (Bagdad, 780-855 CE)",
      geography: "Arabie Saoudite, États du Golfe.",
      method: "Attachement extrêmement strict et littéral aux textes du Coran et des hadiths (même faibles s'il n'y a pas d'alternative), rejetant l'analogie spéculative.",
      books: "Al-Mughni par Ibn Qudamah, Musnad Ahmad."
    }
  ];

  // 3. Signs of End of Times
  const smallSignsList = [
    { num: 1, text: { fr: "Le décès du Prophète Muhammad ﷺ.", en: "The passing of the Prophet Muhammad ﷺ.", ar: "موت النبي ﷺ." } },
    { num: 2, text: { fr: "La conquête de Jérusalem (Bayt al-Maqdis).", en: "The conquest of Jerusalem.", ar: "فتح بيت المقدس." } },
    { num: 3, text: { fr: "La multiplication des richesses et l'abandon du besoin d'aumône.", en: "The multiplication of wealth and decay of charity needs.", ar: "كثرة المال واستغناء الناس عن الصدقة." } },
    { num: 4, text: { fr: "L'apparition de troubles majeurs (fitan) internes.", en: "The outbreak of internal major trials (fitan).", ar: "ظهور الفتن الكبرى وانتشارها." } },
    { num: 5, text: { fr: "La construction de bâtiments d'une hauteur démesurée par les bédouins.", en: "Bedouins competing in building extremely tall structures.", ar: "طاول الحفاة العراة رعاة الشاة في البنيان." } }
  ];

  const majorSignsList = [
    { num: 1, title: { fr: "Al-Mahdi", en: "Al-Mahdi", ar: "خروج المهدي المنتظر" }, desc: { fr: "Un dirigeant juste issu de la lignée du Prophète ﷺ qui unira les musulmans et remplira la terre de justice.", en: "A just leader from the Prophet's lineage who will unite Muslims and fill the Earth with justice.", ar: "رجل صالح من آل بيت النبي يملأ الأرض عدلاً وقسطاً." } },
    { num: 2, title: { fr: "Dajjal (L'Antéchrist)", en: "Al-Dajjal (Antichrist)", ar: "خروج المسيح الدجال" }, desc: { fr: "Le grand tentateur borgne doté de pouvoirs mystiques, qui prétendra être Dieu et égarera les foules.", en: "The one-eyed deceiver granted mystical powers, claiming divinity to mislead humanity.", ar: "أعور العين، يدعي الألوهية ومعه فتن كبرى يطوف الأرض." } },
    { num: 3, title: { fr: "Descente de 'Issa (Jésus)", en: "Descent of Jesus", ar: "نزول عيسى بن مريم عليه السلام" }, desc: { fr: "Jésus de Nazareth descendra à Damas, priera derrière les musulmans et tuera le Dajjal.", en: "Jesus of Nazareth will descend in Damascus, pray behind Muslims and defeat the Dajjal.", ar: "ينزل عند المنارة البيضاء شرقي دمشق فيقتل الدجال ويحكم بالشريعة." } },
    { num: 4, title: { fr: "Yajuj & Majuj (Gog & Magog)", en: "Yajuj & Majuj (Gog & Magog)", ar: "خروج يأجوج ومأجوج" }, desc: { fr: "Deux tribus sauvages d'une multitude infinie qui dévoreront les ressources avant d'être éliminées divinement.", en: "Two massive tribes who break their barrier, devouring resources before divine destruction.", ar: "أمتان عظيمتان يخرجان فيعيثون في الأرض فساداً ويهلكهم الله بنغف في رقابهم." } },
    { num: 5, title: { fr: "Le soleil se levant à l'Ouest", en: "Sunrise from West", ar: "طلوع الشمس من مغربها" }, desc: { fr: "L'inversion de la rotation terrestre. À ce moment précis, la porte du repentir est définitivement fermée.", en: "The reversal of Earth's rotation. At this moment, repentance doors are permanently closed.", ar: "انعكاس حركة الأرض، وعندها يغلق باب التوبة للأبد." } }
  ];

  // 4. Halal Food Additives (E-codes)
  const eCodesData = [
    { code: "E100", name: "Curcumine", status: "halal", source: "Végétal (Curcuma)", notes: "Colorant naturel sûr." },
    { code: "E120", name: "Acide Carminique (Cochenille)", status: "haram", source: "Insecte (Cochenille broyée)", notes: "Extrait d'insectes écrasés, haram dans la majorité des écoles (sauf malikite selon certains, mais interdit par précaution)." },
    { code: "E471", name: "Mono- et diglycérides d'acides gras", status: "doubtful", source: "Graisses animales ou végétales", notes: "Douteux si la source animale n'est pas certifiée Dhabihah (abattage islamique). Halal si 100% végétal." },
    { code: "E904", name: "Gomme-laque (Shellac)", status: "doubtful", source: "Sécrétion d'insectes", notes: "Sujet à divergence fikhia majeure." },
    { code: "E150", name: "Caramel", status: "halal", source: "Sucre chauffé", notes: "Colorant d'origine végétale sûr." },
    { code: "E441", name: "Gélatine (Porcine)", status: "haram", source: "Os et peau de porc", notes: "Additif extrait du porc, strictement haram." }
  ];

  const filteredNames = namesOfAllah.filter(n => 
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.translation[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.arabic.includes(searchQuery)
  );

  const filteredCodes = eCodesData.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`islamic-pattern min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white ${isAr ? 'text-right' : 'text-left'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-gold-main uppercase bg-gold-main/10 px-3.5 py-1 rounded-full border border-gold-main/20 inline-block">
            📚 AL-ILM / SCIENCES DE L'ISLAM
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
            { id: 'names', label: t.tabNames },
            { id: 'schools', label: t.tabSchools },
            { id: 'signs', label: t.tabSigns },
            { id: 'e_codes', label: t.tabECodes }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
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

        {/* VIEWPORTS */}
        <div className="space-y-6">
          
          {/* TAB 1: 99 NAMES OF ALLAH */}
          {activeTab === 'names' && (
            <div className="space-y-6">
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 ${isAr ? 'left-3' : 'right-3'}`} />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-zinc-900 border border-zinc-850 rounded-xl py-2.5 px-4 text-xs focus:ring-1 focus:ring-gold-main focus:outline-none placeholder-zinc-500 font-sans ${isAr ? 'pl-10 text-right' : 'pr-10 text-left'}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredNames.map(name => (
                  <motion.div
                    key={name.num}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-gold-main/20 hover:shadow-lg transition-all space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                      <span className="w-6 h-6 rounded-md bg-gold-main/10 text-gold-main font-bold text-[10px] flex items-center justify-center border border-gold-main/15">
                        {name.num}
                      </span>
                      <span className="text-xl font-serif font-bold text-emerald-light font-amiri tracking-wider" dir="rtl">
                        {name.arabic}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white font-serif">{name.name}</h4>
                      <p className="text-xs text-zinc-400 font-sans mt-0.5">{name.translation[lang]}</p>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">
                      {name.desc[lang]}
                    </p>

                    <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-850">
                      <span className="text-[10px] uppercase font-bold text-gold-dark block font-sans tracking-wide">{t.invokingGuide}</span>
                      <p className="text-[11px] text-zinc-300 italic font-sans mt-1">
                        {name.dua}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 4 JURISPRUDENCE SCHOOLS */}
          {activeTab === 'schools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schoolsOfLaw.map((school, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg hover:border-gold-main/20 transition-all space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                      {school.name}
                    </h3>
                    <span className="text-lg font-serif font-bold text-gold-light font-amiri tracking-wide" dir="rtl">
                      {school.arabic}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm font-sans">
                    <div>
                      <span className="text-zinc-500 block uppercase font-bold text-[10px] tracking-wider">{t.founder}</span>
                      <span className="text-white font-medium">{school.founder}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase font-bold text-[10px] tracking-wider">{t.geography}</span>
                      <span className="text-white font-medium">{school.geography}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase font-bold text-[10px] tracking-wider">{t.methodology}</span>
                      <p className="text-zinc-300 font-light leading-relaxed mt-0.5">{school.method}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase font-bold text-[10px] tracking-wider">Ouvrages de référence :</span>
                      <span className="text-emerald-light font-mono font-medium">{school.books}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* TAB 3: END OF TIMES SIGNS */}
          {activeTab === 'signs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Minor signs */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-base sm:text-lg font-serif font-bold text-gold-light border-b border-zinc-850 pb-2">
                  📜 {t.smallSigns}
                </h3>
                <div className="space-y-3">
                  {smallSignsList.map(sign => (
                    <div key={sign.num} className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-850 flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {sign.num}
                      </span>
                      <p className="text-xs sm:text-sm text-zinc-300 font-sans font-light leading-relaxed">
                        {sign.text[lang]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Major signs */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-base sm:text-lg font-serif font-bold text-emerald-light border-b border-zinc-850 pb-2">
                  🚨 {t.majorSigns}
                </h3>
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scroll">
                  {majorSignsList.map(sign => (
                    <div key={sign.num} className="bg-zinc-950 border border-zinc-850/60 p-4 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-light uppercase">Signe {sign.num}</span>
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-white">
                        {sign.title[lang]}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed">
                        {sign.desc[lang]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: HALAL FOOD E-CODES */}
          {activeTab === 'e_codes' && (
            <div className="space-y-6">
              
              {/* Search Code */}
              <div className="relative max-w-md mx-auto">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 ${isAr ? 'left-3' : 'right-3'}`} />
                <input
                  type="text"
                  placeholder="Rechercher par code (ex: E120) ou par nom d'ingrédient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-zinc-900 border border-zinc-850 rounded-xl py-2.5 px-4 text-xs focus:ring-1 focus:ring-gold-main focus:outline-none placeholder-zinc-500 font-sans ${isAr ? 'pl-10 text-right' : 'pr-10 text-left'}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCodes.map((c, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-gold-main/20 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                      <span className="text-xs font-mono font-bold text-gold-light bg-gold-main/10 px-2.5 py-1 rounded">
                        {c.code}
                      </span>
                      
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'halal'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                          : c.status === 'haram'
                          ? 'bg-red-950/40 text-red-400 border border-red-900/50'
                          : 'bg-amber-950/40 text-amber-400 border border-amber-900/50'
                      }`}>
                        {c.status === 'halal' ? t.halal : c.status === 'haram' ? t.haram : t.doubtful}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{c.name}</h4>
                      <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Origine : {c.source}</p>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light bg-zinc-950/40 p-3 rounded-lg border border-zinc-850/60">
                      {c.notes}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
