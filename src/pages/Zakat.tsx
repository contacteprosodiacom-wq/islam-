import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Coins, 
  Scale, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  DollarSign, 
  Copy, 
  Check, 
  Info, 
  ShieldCheck, 
  HeartHandshake, 
  ExternalLink 
} from 'lucide-react';
import { Language, Route } from '../types';

interface ZakatProps {
  lang: Language;
  onNavigate?: (route: Route, params?: any) => void;
}

type NisabStandard = 'silver' | 'gold';
type Currency = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'XOF';

export default function Zakat({ lang, onNavigate }: ZakatProps) {
  const isAr = lang === 'ar';

  // Currency & Nisab settings
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [nisabStandard, setNisabStandard] = useState<NisabStandard>('silver');
  const [goldPrice, setGoldPrice] = useState<number>(75); // ~75 €/g default
  const [silverPrice, setSilverPrice] = useState<number>(0.90); // ~0.90 €/g default
  const [hawlMet, setHawlMet] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Asset inputs (numbers)
  const [cash, setCash] = useState<number | ''>('');
  const [goldSilver, setGoldSilver] = useState<number | ''>('');
  const [businessGoods, setBusinessGoods] = useState<number | ''>('');
  const [investments, setInvestments] = useState<number | ''>('');
  const [receivables, setReceivables] = useState<number | ''>('');
  const [otherSavings, setOtherSavings] = useState<number | ''>('');

  // Liability inputs (numbers)
  const [immediateDebts, setImmediateDebts] = useState<number | ''>('');
  const [monthlyBills, setMonthlyBills] = useState<number | ''>('');
  const [commercialDebts, setCommercialDebts] = useState<number | ''>('');

  // Currency symbols map
  const currencySymbol = useMemo(() => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'CAD': return 'CA$';
      case 'XOF': return 'CFA';
      default: return '€';
    }
  }, [currency]);

  // Total Zakatable Assets
  const totalAssets = useMemo(() => {
    return (
      (Number(cash) || 0) +
      (Number(goldSilver) || 0) +
      (Number(businessGoods) || 0) +
      (Number(investments) || 0) +
      (Number(receivables) || 0) +
      (Number(otherSavings) || 0)
    );
  }, [cash, goldSilver, businessGoods, investments, receivables, otherSavings]);

  // Total Deductible Liabilities
  const totalLiabilities = useMemo(() => {
    return (
      (Number(immediateDebts) || 0) +
      (Number(monthlyBills) || 0) +
      (Number(commercialDebts) || 0)
    );
  }, [immediateDebts, monthlyBills, commercialDebts]);

  // Net Zakatable Wealth
  const netWealth = useMemo(() => {
    return Math.max(0, totalAssets - totalLiabilities);
  }, [totalAssets, totalLiabilities]);

  // Nisab threshold calculation
  // Gold Nisab: 85g * goldPrice
  // Silver Nisab: 595g * silverPrice
  const nisabValue = useMemo(() => {
    if (nisabStandard === 'gold') {
      return 85 * (Number(goldPrice) || 0);
    }
    return 595 * (Number(silverPrice) || 0);
  }, [nisabStandard, goldPrice, silverPrice]);

  // Eligibility check
  const isEligibleForZakat = netWealth >= nisabValue && hawlMet;

  // Amount of Zakat due (2.5% = 1/40th)
  const zakatDue = useMemo(() => {
    if (isEligibleForZakat) {
      return netWealth * 0.025;
    }
    return 0;
  }, [isEligibleForZakat, netWealth]);

  // Nisab coverage percentage
  const nisabProgress = useMemo(() => {
    if (nisabValue <= 0) return 0;
    return Math.min(100, Math.round((netWealth / nisabValue) * 100));
  }, [netWealth, nisabValue]);

  // Quick preset demo data
  const handleLoadDemo = () => {
    setCash(7500);
    setGoldSilver(1800);
    setBusinessGoods(0);
    setInvestments(2200);
    setReceivables(500);
    setOtherSavings(0);
    setImmediateDebts(800);
    setMonthlyBills(600);
    setCommercialDebts(0);
    setHawlMet(true);
  };

  // Reset form
  const handleReset = () => {
    setCash('');
    setGoldSilver('');
    setBusinessGoods('');
    setInvestments('');
    setReceivables('');
    setOtherSavings('');
    setImmediateDebts('');
    setMonthlyBills('');
    setCommercialDebts('');
  };

  // Copy summary to clipboard
  const handleCopySummary = () => {
    const text = `
=== ${lang === 'ar' ? 'تقرير حساب زكاة المال' : lang === 'en' ? 'Zakat al-Maal Calculation Summary' : 'Bilan de Calcul de la Zakat al-Maal'} ===
- ${lang === 'ar' ? 'إجمالي الأصول' : lang === 'en' ? 'Total Assets' : 'Total des Actifs'} : ${totalAssets.toLocaleString()} ${currencySymbol}
- ${lang === 'ar' ? 'إجمالي الديون' : lang === 'en' ? 'Total Liabilities' : 'Total des Dettes'} : ${totalLiabilities.toLocaleString()} ${currencySymbol}
- ${lang === 'ar' ? 'الوعاء الزكوي الصافي' : lang === 'en' ? 'Net Zakatable Wealth' : 'Patrimoine Net'} : ${netWealth.toLocaleString()} ${currencySymbol}
- ${lang === 'ar' ? 'عتبة النصاب' : lang === 'en' ? 'Nisab Threshold' : 'Seuil du Nissab'} (${nisabStandard === 'gold' ? 'Or 85g' : 'Argent 595g'}) : ${nisabValue.toLocaleString()} ${currencySymbol}
- ${lang === 'ar' ? 'شرط الحول' : lang === 'en' ? 'Hawl Requirement' : 'Condition du Hawl'} : ${hawlMet ? (lang === 'ar' ? 'مستوفى ✓' : lang === 'en' ? 'Met ✓' : 'Atteint ✓') : (lang === 'ar' ? 'غير مستوفى' : lang === 'en' ? 'Not met' : 'Non atteint')}
- ${lang === 'ar' ? 'مقدار الزكاة الواجبة (2.5%)' : lang === 'en' ? 'Zakat Due (2.5%)' : 'Zakat à verser (2,5%)'} : ${zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}

Calculé sur Islam avec Aboubakar (https://islamavecaboubakar.com)
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Educational FAQs
  const faqs = [
    {
      q: {
        fr: "Qu'est-ce que le Nissab et comment le calculer ?",
        en: "What is the Nisab and how is it calculated?",
        ar: "ما هو النصاب وكيف يتم حسابه؟"
      },
      a: {
        fr: "Le Nissab est le seuil minimal de patrimoine qu'un musulman doit posséder pour être soumis à l'obligation de la Zakat. La Sunnah a fixé ce seuil à 85 grammes d'or fin (24 carats) ou 595 grammes d'argent pur. De nombreux juristes contemporains recommandent d'utiliser le seuil de l'argent pour les devises actuelles, car cela permet d'assujettir davantage de croyants au bénéfice direct des pauvres et des nécessiteux.",
        en: "Nisab is the minimum threshold of wealth a Muslim must possess to become eligible to pay Zakat. The Sunnah set this at 85 grams of pure gold (24k) or 595 grams of pure silver. Contemporary scholars often recommend the silver standard for cash and currencies to maximize aid for the poor and needy.",
        ar: "النصاب هو الحد الأدنى من المال الذي إذا ملكه المسلم وجبت عليه الزكاة. وقد حُدد في السنة النبوية بـ 85 غراماً من الذهب الخالص أو 595 غراماً من الفضة النقية. ويفضل الكثير من العلماء المعاصرين اعتماد نصاب الفضة في الأوراق النقدية رعاية لمصلحة الفقراء والمساكين."
      }
    },
    {
      q: {
        fr: "Qu'est-ce que la condition du Hawl (l'année lunaire) ?",
        en: "What is the Hawl requirement (lunar year)?",
        ar: "ما هو شرط الحول (السنة القمرية)؟"
      },
      a: {
        fr: "Le Hawl correspond à l'écoulement d'une année lunaire complète (environ 354 jours hégiriens) durant laquelle votre patrimoine est resté continuellement au-dessus du seuil du Nissab. Si votre solde est passé sous le Nissab au cours de l'année, le décompte du Hawl repart à zéro dès que vous réatteignez le Nissab.",
        en: "Hawl refers to the passing of one complete Islamic lunar year (approx. 354 days) while holding wealth equal to or exceeding the Nisab. If your wealth dips below the Nisab during this period, the cycle resets once you reach it again.",
        ar: "الحول هو مرور عام هجري كامل (حوالي 354 يوماً) على امتلاك النصاب دون أن ينقص عنه. فإذا نقص المال عن النصاب أثناء العام انقطع الحول ويبدأ حول جديد عند اكتماله مرة أخرى."
      }
    },
    {
      q: {
        fr: "Pourquoi le taux est-il fixé à 2,5 % ?",
        en: "Why is the rate fixed at 2.5%?",
        ar: "لماذا حُددت النسبة بـ 2.5%؟"
      },
      a: {
        fr: "Pour les liquidités, l'or, l'argent et les marchandises de commerce, le Prophète Muhammad ﷺ a prescrit un prélèvement d'un quart de dixième (ربع العشر - Rub' al-'Ushur), ce qui équivaut rigoureusement à 2,5% (ou 1/40ème). Ce prélèvement modéré et purificateur n'appauvrit pas le donateur et assure la solidarité sociale de la communauté.",
        en: "For cash, gold, silver, and commercial goods, Prophet Muhammad ﷺ prescribed a quarter of a tenth (Rub' al-'Ushur), precisely 2.5% (or 1/40th). This moderate, purifying share purifies wealth while sustaining communal balance and welfare.",
        ar: "بالنسبة للنقود والذهب والفضة وعروض التجارة، شرع النبي ﷺ إخراج ربع العشر، أي ما يعادل 2.5% (أو جزءاً من أربعين جزءاً). وهو قدر ميسر يطهر المال وينمي البركة."
      }
    },
    {
      q: {
        fr: "Quelles sont les dettes déductibles du calcul ?",
        en: "Which liabilities and debts are deductible?",
        ar: "ما هي الديون التي تُخصم من وعاء الزكاة؟"
      },
      a: {
        fr: "Seules les dettes exigibles à court terme (dettes échues, factures en souffrance, loyer du mois, échéance immédiate de crédit) sont déductibles. Les emprunts à long terme (comme un crédit immobilier sur 15 ou 20 ans) ne se déduisent pas dans leur totalité, car ils correspondent à un actif patrimonial possédé à long terme.",
        en: "Only short-term debts due immediately or within the current year are deductible (overdue bills, upcoming installment, current rent). Long-term liabilities (like a 20-year mortgage) cannot be deducted in their entirety.",
        ar: "تُخصم فقط الديون الحالة وقصيرة الأجل الواجبة السداد حالاً أو خلال العام (كالفواتير المتأخرة وإيجار الشهر وقسط الدين القريب). أما الديون طويلة الأجل كتمويل المنازل على سنوات فلا يُخصم منها إلا القسط الحال."
      }
    },
    {
      q: {
        fr: "À qui doit être versée la Zakat al-Maal ?",
        en: "Who are the rightful recipients of Zakat?",
        ar: "لمن تُصرف زكاة المال وفق القرآن الكريم؟"
      },
      a: {
        fr: "Allah le Très-Haut a défini strictement les 8 catégories éligibles dans la Sourate At-Tawbah (verset 60) : les pauvres (Al-Fuqara), les nécessiteux (Al-Masakin), ceux qui sont chargés de la collecter, les cœurs à rallier, l'affranchissement des esclaves/captifs, les personnes lourdement endettées sans faute, dans le sentier d'Allah (actions d'intérêt religieux général), et le voyageur indigent bloqué loin de chez lui.",
        en: "Allah clearly specified the 8 categories in Surah At-Tawbah (9:60): the poor (al-Fuqara), the needy (al-Masakin), Zakat administrators, those whose hearts are to be reconciled, freeing captives, those burdened with debt, in the cause of Allah, and the stranded wayfarer.",
        ar: "حدد الله تعالى مصارف الزكاة الثمانية في سورة التوبة (الآية 60): {إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ}."
      }
    }
  ];

  return (
    <div className={`islamic-pattern min-h-screen pb-20 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {/* HERO HEADER */}
      <section className="bg-ink text-white py-14 sm:py-20 border-b border-gold-main/20 relative overflow-hidden">
        {/* Background Quranic verse ghost text */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.06)_1px,transparent_0)] bg-[size:32px_32px]" 
          aria-hidden="true"
        />
        <div 
          className="absolute right-6 -bottom-6 select-none opacity-5 text-gold-main font-amiri text-8xl sm:text-9xl pointer-events-none"
          aria-hidden="true"
        >
          زكاة المال
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-main/10 border border-gold-main/30 text-gold-light text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5 text-gold-main" />
            <span>
              {lang === 'ar' ? 'الركن الثالث من أركان الإسلام' : lang === 'en' ? 'Third Pillar of Islam' : '3ème Pilier de l’Islam'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {lang === 'ar' ? 'حاسبة زكاة المال الشرعية' : lang === 'en' ? 'Zakat al-Maal Calculator' : 'Calculateur de Zakat al-Maal'}
          </h1>

          <p className="font-amiri text-gold-light text-lg sm:text-xl select-none max-w-xl mx-auto" dir="rtl">
            « خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا »
          </p>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed font-sans">
            {lang === 'ar'
              ? 'احسب مقدار زكاتك السنوية الواجبة بسهولة ودقة وفق ضوابط الشريعة الإسلامية ومقدار النصاب والحول.'
              : lang === 'en'
                ? 'Easily and accurately calculate your annual mandatory Zakat according to Islamic jurisprudence, Nisab thresholds, and Hawl conditions.'
                : 'Calculez en toute simplicité et conformité islamique votre aumône légale annuelle selon le seuil du Nissab et la règle du Hawl.'}
          </p>

          {/* Quick presets buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-gold-main/20 text-gold-light border border-white/15 transition-all inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تجربة مثال توضيحي' : lang === 'en' ? 'Load example data' : 'Remplir un exemple type'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إعادة ضبط' : lang === 'en' ? 'Reset' : 'Réinitialiser'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CALCULATOR CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* PARAMETERS BAR (Currency & Nisab Standard) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-6 mb-8">
          <div className={`flex flex-col lg:flex-row items-center justify-between gap-4 ${isAr ? 'lg:flex-row-reverse' : ''}`}>
            
            {/* Currency Selector */}
            <div className={`flex items-center gap-3 w-full lg:w-auto ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="text-xs font-bold text-ink whitespace-nowrap flex items-center gap-1">
                <Coins className="w-4 h-4 text-gold-dark" />
                <span>{lang === 'ar' ? 'العملة :' : lang === 'en' ? 'Currency:' : 'Devise :'}</span>
              </span>
              <div className="flex items-center gap-1 bg-cream-sec/60 p-1 rounded-xl border border-gray-100 w-full sm:w-auto">
                {(['EUR', 'USD', 'GBP', 'CAD', 'XOF'] as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none ${
                      currency === curr
                        ? 'bg-gold-main text-ink shadow-xs'
                        : 'text-text-sec hover:text-ink'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Nisab Standard Selector (Gold 85g vs Silver 595g) */}
            <div className={`flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="text-xs font-bold text-ink whitespace-nowrap flex items-center gap-1">
                <Scale className="w-4 h-4 text-emerald-med" />
                <span>{lang === 'ar' ? 'معيار النصاب :' : lang === 'en' ? 'Nisab Standard:' : 'Référence du Nissab :'}</span>
              </span>

              <div className="flex items-center gap-1 bg-cream-sec/60 p-1 rounded-xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setNisabStandard('silver')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    nisabStandard === 'silver'
                      ? 'bg-emerald-main text-white shadow-xs'
                      : 'text-text-sec hover:text-ink'
                  }`}
                  title="595g d'argent pur (Recommandé pour les devises fiduciaires)"
                >
                  {lang === 'ar' ? 'الفضة (595 غ)' : lang === 'en' ? 'Silver (595g)' : 'Argent (595g)'}
                </button>

                <button
                  type="button"
                  onClick={() => setNisabStandard('gold')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    nisabStandard === 'gold'
                      ? 'bg-gold-main text-ink shadow-xs'
                      : 'text-text-sec hover:text-ink'
                  }`}
                  title="85g d'or fin 24k"
                >
                  {lang === 'ar' ? 'الذهب (85 غ)' : lang === 'en' ? 'Gold (85g)' : 'Or (85g)'}
                </button>
              </div>

              {/* Nisab Threshold Display Badge */}
              <div className="bg-cream-main/80 border border-gold-main/30 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-ink flex items-center gap-1.5">
                <span className="text-text-sec font-sans text-[11px]">
                  {lang === 'ar' ? 'قيمة النصاب:' : lang === 'en' ? 'Nisab value:' : 'Valeur Nissab :'}
                </span>
                <span className="text-gold-dark text-sm">
                  {nisabValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencySymbol}
                </span>
              </div>
            </div>

          </div>

          {/* Customizable bullion prices dropdown / notice */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-text-sec gap-2">
            <span className="italic flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-gold-dark shrink-0" />
              <span>
                {nisabStandard === 'silver'
                  ? (lang === 'ar' ? 'النصاب محسوب على 595 غرام فضة بسعر تقريبي 0.90 لكل غرام.' : 'Nissab calculé sur la base de 595g d’argent à 0,90 €/g (Recommandé par les savants contemporains).')
                  : (lang === 'ar' ? 'النصاب محسوب على 85 غرام ذهب عيار 24 بسعر تقريبي 75 لكل غرام.' : 'Nissab calculé sur la base de 85g d’or 24k à 75,00 €/g.')}
              </span>
            </span>

            {/* Price adjuster inputs */}
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <label className="text-[11px] text-text-sec">
                {nisabStandard === 'silver' ? 'Prix argent/g :' : 'Prix or/g :'}
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={nisabStandard === 'silver' ? silverPrice : goldPrice}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (nisabStandard === 'silver') setSilverPrice(val);
                  else setGoldPrice(val);
                }}
                className="w-16 px-2 py-0.5 text-xs font-mono font-bold border border-gray-200 rounded-md text-ink text-center focus:outline-gold-main"
              />
              <span className="text-[11px] font-bold text-gray-400">{currencySymbol}/g</span>
            </div>
          </div>
        </div>

        {/* 2 COLUMNS LAYOUT: FORM INPUTS ON LEFT / SUMMARY STICKY SCORECARD ON RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: ASSETS & LIABILITIES INPUT FORMS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. ASSETS SECTION */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7 space-y-5">
              
              <div className={`flex items-center justify-between pb-3 border-b border-gray-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-emerald-main/10 text-emerald-med flex items-center justify-center font-bold text-sm">
                    1
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-serif font-bold text-ink">
                      {lang === 'ar' ? 'الأصول والأموال الزكوية' : lang === 'en' ? 'Zakatable Assets' : 'Vos Actifs Soumis à la Zakat'}
                    </h2>
                    <p className="text-xs text-text-sec">
                      {lang === 'ar' ? 'جميع الأموال النقدية والمدخرات المملوكة' : 'Liquidités, épargne, or et investissements'}
                    </p>
                  </div>
                </div>

                <span className="font-mono font-bold text-xs sm:text-sm text-emerald-med bg-emerald-main/10 px-3 py-1 rounded-full">
                  + {totalAssets.toLocaleString()} {currencySymbol}
                </span>
              </div>

              {/* Asset Fields */}
              <div className="space-y-4">
                
                {/* 1. Cash / Livret */}
                <div>
                  <div className={`flex justify-between items-center mb-1 text-xs font-semibold text-ink ${isAr ? 'flex-row-reverse' : ''}`}>
                    <label htmlFor="input-cash">
                      {lang === 'ar' ? 'السيولة النقدية والحسابات البنكية' : lang === 'en' ? 'Cash & Bank Accounts' : 'Espèces, comptes courants & livrets d’épargne'}
                    </label>
                    <span className="text-[11px] text-text-sec font-normal">
                      {lang === 'ar' ? 'في البنك أو المنزل' : 'Disponible immédiatement'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-cash"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={cash}
                      onChange={(e) => setCash(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-cream-sec/30 border border-gray-200 rounded-xl font-mono text-ink text-sm focus:border-gold-main focus:bg-white focus:outline-none transition-all"
                    />
                    <span className={`absolute top-2.5 ${isAr ? 'left-3' : 'right-3'} text-xs font-bold text-gray-400 select-none`}>
                      {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* 2. Gold & Silver */}
                <div>
                  <div className={`flex justify-between items-center mb-1 text-xs font-semibold text-ink ${isAr ? 'flex-row-reverse' : ''}`}>
                    <label htmlFor="input-goldsilver">
                      {lang === 'ar' ? 'الذهب والفضة والمعادن الثمينة للادخار' : lang === 'en' ? 'Gold, Silver & Bullion' : 'Or, argent & métaux précieux d’investissement'}
                    </label>
                    <span className="text-[11px] text-text-sec font-normal">
                      {lang === 'ar' ? 'سبائك، ليرات، مجوهرات مكنوزة' : 'Lingots, pièces, bijoux thésaurisés'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-goldsilver"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={goldSilver}
                      onChange={(e) => setGoldSilver(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-cream-sec/30 border border-gray-200 rounded-xl font-mono text-ink text-sm focus:border-gold-main focus:bg-white focus:outline-none transition-all"
                    />
                    <span className={`absolute top-2.5 ${isAr ? 'left-3' : 'right-3'} text-xs font-bold text-gray-400 select-none`}>
                      {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* 3. Business stock / Inventory */}
                <div>
                  <div className={`flex justify-between items-center mb-1 text-xs font-semibold text-ink ${isAr ? 'flex-row-reverse' : ''}`}>
                    <label htmlFor="input-stock">
                      {lang === 'ar' ? 'عروض التجارة والبضائع المعدة للبيع' : lang === 'en' ? 'Business Inventory for Resale' : 'Marchandises & stocks commerciaux à la vente'}
                    </label>
                    <span className="text-[11px] text-text-sec font-normal">
                      {lang === 'ar' ? 'بسعر الجملة أو القيمة السوقية الحالية' : 'Valeur marchande actuelle'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={businessGoods}
                      onChange={(e) => setBusinessGoods(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-cream-sec/30 border border-gray-200 rounded-xl font-mono text-ink text-sm focus:border-gold-main focus:bg-white focus:outline-none transition-all"
                    />
                    <span className={`absolute top-2.5 ${isAr ? 'left-3' : 'right-3'} text-xs font-bold text-gray-400 select-none`}>
                      {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* 4. Investments / Stocks / Crypto */}
                <div>
                  <div className={`flex justify-between items-center mb-1 text-xs font-semibold text-ink ${isAr ? 'flex-row-reverse' : ''}`}>
                    <label htmlFor="input-investments">
                      {lang === 'ar' ? 'الأسهم والعملات الرقمية وصناديق الاستثمار' : lang === 'en' ? 'Stocks, Crypto & Liquid Funds' : 'Actions, cryptomonnaies & investissements liquides'}
                    </label>
                    <span className="text-[11px] text-text-sec font-normal">
                      {lang === 'ar' ? 'الجزء السائل أو المتداول' : 'Partie liquide ou dividendes'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-investments"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={investments}
                      onChange={(e) => setInvestments(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-cream-sec/30 border border-gray-200 rounded-xl font-mono text-ink text-sm focus:border-gold-main focus:bg-white focus:outline-none transition-all"
                    />
                    <span className={`absolute top-2.5 ${isAr ? 'left-3' : 'right-3'} text-xs font-bold text-gray-400 select-none`}>
                      {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* 5. Receivables (loans you expect to get back) */}
                <div>
                  <div className={`flex justify-between items-center mb-1 text-xs font-semibold text-ink ${isAr ? 'flex-row-reverse' : ''}`}>
                    <label htmlFor="input-receivables">
                      {lang === 'ar' ? 'ديونك المؤكدة على الآخرين المرجوة السداد' : lang === 'en' ? 'Good Receivables (Money Loaned)' : 'Créances certaines & argent prêté recouvrable'}
                    </label>
                    <span className="text-[11px] text-text-sec font-normal">
                      {lang === 'ar' ? 'المؤكد استرجاعها' : 'Remboursement certain'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-receivables"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={receivables}
                      onChange={(e) => setReceivables(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-cream-sec/30 border border-gray-200 rounded-xl font-mono text-ink text-sm focus:border-gold-main focus:bg-white focus:outline-none transition-all"
                    />
                    <span className={`absolute top-2.5 ${isAr ? 'left-3' : 'right-3'} text-xs font-bold text-gray-400 select-none`}>
                      {currencySymbol}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. LIABILITIES SECTION */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7 space-y-5">
              
              <div className={`flex items-center justify-between pb-3 border-b border-gray-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-red-urge/10 text-red-urge flex items-center justify-center font-bold text-sm">
                    2
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-serif font-bold text-ink">
                      {lang === 'ar' ? 'الديون والالتزامات الواجبة الخصم' : lang === 'en' ? 'Deductible Debts & Liabilities' : 'Vos Dettes & Passifs Déductibles'}
                    </h2>
                    <p className="text-xs text-text-sec">
                      {lang === 'ar' ? 'الديون الحالة والفواتير المستحقة فوراً' : 'Dettes échues et dépenses immédiatement exigibles'}
                    </p>
                  </div>
                </div>

                <span className="font-mono font-bold text-xs sm:text-sm text-red-urge bg-red-urge/10 px-3 py-1 rounded-full">
                  - {totalLiabilities.toLocaleString()} {currencySymbol}
                </span>
              </div>

              {/* Liability Fields */}
              <div className="space-y-4">
                
                {/* 1. Immediate debts */}
                <div>
                  <div className={`flex justify-between items-center mb-1 text-xs font-semibold text-ink ${isAr ? 'flex-row-reverse' : ''}`}>
                    <label htmlFor="input-debts">
                      {lang === 'ar' ? 'ديون مستحقة السداد الفوري' : lang === 'en' ? 'Immediate Due Debts' : 'Dettes échues & factures en retard'}
                    </label>
                    <span className="text-[11px] text-text-sec font-normal">
                      {lang === 'ar' ? 'واجبة الأداء حالاً' : 'Exigibles ce mois-ci'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-debts"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={immediateDebts}
                      onChange={(e) => setImmediateDebts(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-cream-sec/30 border border-gray-200 rounded-xl font-mono text-ink text-sm focus:border-red-urge focus:bg-white focus:outline-none transition-all"
                    />
                    <span className={`absolute top-2.5 ${isAr ? 'left-3' : 'right-3'} text-xs font-bold text-gray-400 select-none`}>
                      {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* 2. Monthly bills / rent */}
                <div>
                  <div className={`flex justify-between items-center mb-1 text-xs font-semibold text-ink ${isAr ? 'flex-row-reverse' : ''}`}>
                    <label htmlFor="input-bills">
                      {lang === 'ar' ? 'أقساط القروض أو الإيجار الحالي المستحق' : lang === 'en' ? 'Current Month Rent / Loan Installment' : 'Échéance immédiate de crédit ou loyer du mois'}
                    </label>
                    <span className="text-[11px] text-text-sec font-normal">
                      {lang === 'ar' ? 'فقط القسط الحالي وليس أصل القرض كاملاً' : 'Uniquement l’échéance du mois'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-bills"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={monthlyBills}
                      onChange={(e) => setMonthlyBills(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-cream-sec/30 border border-gray-200 rounded-xl font-mono text-ink text-sm focus:border-red-urge focus:bg-white focus:outline-none transition-all"
                    />
                    <span className={`absolute top-2.5 ${isAr ? 'left-3' : 'right-3'} text-xs font-bold text-gray-400 select-none`}>
                      {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* 3. Commercial debts */}
                <div>
                  <div className={`flex justify-between items-center mb-1 text-xs font-semibold text-ink ${isAr ? 'flex-row-reverse' : ''}`}>
                    <label htmlFor="input-commdebts">
                      {lang === 'ar' ? 'مستحقات الموردين والرواتب الواجبة' : lang === 'en' ? 'Due Supplier Invoices / Salaries' : 'Engagements commerciaux ou salaires dus'}
                    </label>
                    <span className="text-[11px] text-text-sec font-normal">
                      {lang === 'ar' ? 'مستحقة الأداء' : 'Pour les commerçants/entrepreneurs'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-commdebts"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={commercialDebts}
                      onChange={(e) => setCommercialDebts(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-cream-sec/30 border border-gray-200 rounded-xl font-mono text-ink text-sm focus:border-red-urge focus:bg-white focus:outline-none transition-all"
                    />
                    <span className={`absolute top-2.5 ${isAr ? 'left-3' : 'right-3'} text-xs font-bold text-gray-400 select-none`}>
                      {currencySymbol}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. HAWL CHECKBOX */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <label className={`flex items-start gap-3 cursor-pointer select-none ${isAr ? 'flex-row-reverse' : ''}`}>
                <input
                  type="checkbox"
                  checked={hawlMet}
                  onChange={(e) => setHawlMet(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-main rounded border-gray-300 focus:ring-emerald-main accent-emerald-main cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-ink block mb-0.5">
                    {lang === 'ar'
                      ? 'مرور الحول الكامل (سنة قمرية كاملة - 354 يوماً تقريباً)'
                      : lang === 'en'
                        ? 'Hawl Requirement Met (Held for one full lunar year ~354 days)'
                        : 'J’ai possédé ce montant au-dessus du Nissab pendant une année lunaire complète (Hawl)'}
                  </span>
                  <span className="text-text-sec leading-relaxed block">
                    {lang === 'ar'
                      ? 'الزكاة لا تجب إلا على المال الذي حال عليه الحول الهجري كاملاً وهو بالغ للنصاب.'
                      : lang === 'en'
                        ? 'Zakat is only legally due on wealth that has reached the Nisab and remained with you throughout a full Hijri year.'
                        : 'La Zakat n’est obligatoire que si votre épargne nette a dépassé le seuil du Nissab pendant un an sans discontinuer.'}
                  </span>
                </div>
              </label>
            </div>

          </div>

          {/* RIGHT 5 COLS: SUMMARY SCORECARD */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            
            {/* MAIN RESULTS CARD */}
            <div className="bg-white rounded-3xl border border-gold-main/30 shadow-xl overflow-hidden p-6 sm:p-7 space-y-6 relative">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gold-main/10 rounded-full blur-2xl pointer-events-none" />

              {/* Title & Status */}
              <div>
                <span className="text-xs font-mono font-bold text-gold-dark tracking-wider uppercase block mb-1">
                  {lang === 'ar' ? 'النتيجة الإجمالية' : lang === 'en' ? 'Summary & Assessment' : 'Bilan & Assujettissement'}
                </span>
                <h3 className="text-xl font-serif font-bold text-ink">
                  {lang === 'ar' ? 'مقدار الزكاة المستحقة' : lang === 'en' ? 'Total Zakat Payable' : 'Montant de votre Zakat'}
                </h3>
              </div>

              {/* PROMINENT ZAKAT DUE AMOUNT */}
              <div className="bg-gradient-to-br from-ink via-ink to-emerald-main text-white p-6 rounded-2xl border border-gold-main/30 shadow-md text-center space-y-2">
                <p className="text-xs uppercase tracking-widest text-gold-light font-mono font-bold">
                  {lang === 'ar' ? 'زكاة المال الواجبة (2.5%)' : lang === 'en' ? 'Zakat al-Maal Due (2.5%)' : 'Zakat al-Maal à Verser (2,5%)'}
                </p>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-gold-main tracking-tight">
                  {zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencySymbol}
                </div>
                <p className="text-[11px] text-gray-300">
                  {isEligibleForZakat
                    ? (lang === 'ar' ? '✓ تم بلوغ النصاب ومرور الحول بنجاح' : lang === 'en' ? '✓ Nisab threshold reached & Hawl completed' : '✓ Nissab atteint & condition du Hawl remplie')
                    : !hawlMet && netWealth >= nisabValue
                      ? (lang === 'ar' ? '⚠️ النصاب مكتمل لكن شرط الحول لم يكتمل بعد' : lang === 'en' ? '⚠️ Nisab reached, but lunar year is not yet completed' : '⚠️ Nissab atteint mais le Hawl (année) n’est pas révolu')
                      : (lang === 'ar' ? 'ℹ️ المال الصافي دون حد النصاب الشرعي' : lang === 'en' ? 'ℹ️ Net wealth is currently below Nisab threshold' : 'ℹ️ Votre patrimoine net est en dessous du Nissab')}
                </p>
              </div>

              {/* METRIC BREAKDOWN ROW */}
              <div className="space-y-3 pt-2 text-xs">
                
                {/* Total Assets */}
                <div className={`flex justify-between items-center ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-text-sec">{lang === 'ar' ? 'إجمالي الأصول :' : lang === 'en' ? 'Total Assets:' : 'Total des avoirs :'}</span>
                  <span className="font-mono font-bold text-emerald-main">
                    +{totalAssets.toLocaleString()} {currencySymbol}
                  </span>
                </div>

                {/* Total Liabilities */}
                <div className={`flex justify-between items-center ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-text-sec">{lang === 'ar' ? 'إجمالي الديون القريبة :' : lang === 'en' ? 'Deductible Debts:' : 'Dettes déductibles :'}</span>
                  <span className="font-mono font-bold text-red-urge">
                    -{totalLiabilities.toLocaleString()} {currencySymbol}
                  </span>
                </div>

                <div className="border-t border-gray-100 my-1" />

                {/* Net Zakatable Wealth */}
                <div className={`flex justify-between items-center text-sm font-bold ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-ink">{lang === 'ar' ? 'الوعاء الزكوي الصافي :' : lang === 'en' ? 'Net Zakatable Wealth:' : 'Patrimoine Net :'}</span>
                  <span className="font-mono text-ink">
                    {netWealth.toLocaleString()} {currencySymbol}
                  </span>
                </div>

                {/* Nisab Threshold */}
                <div className={`flex justify-between items-center ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-text-sec">
                    {lang === 'ar' ? 'عتبة النصاب الحالية :' : lang === 'en' ? 'Nisab Threshold:' : 'Seuil du Nissab actuel :'}
                  </span>
                  <span className="font-mono font-semibold text-gold-dark">
                    {nisabValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencySymbol}
                  </span>
                </div>

                {/* Progress bar towards Nisab */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-mono text-text-sec">
                    <span>{lang === 'ar' ? 'نسبة بلوغ النصاب' : 'Couverture du Nissab'}</span>
                    <span>{nisabProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        netWealth >= nisabValue ? 'bg-emerald-main' : 'bg-gold-main'
                      }`}
                      style={{ width: `${Math.min(100, (netWealth / (nisabValue || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2.5 pt-2">
                
                {/* Copy summary button */}
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full py-2.5 px-4 bg-cream-main hover:bg-cream-sec text-ink text-xs font-bold rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-main" />
                      <span>{lang === 'ar' ? 'تم نسخ التقرير !' : lang === 'en' ? 'Summary Copied!' : 'Bilan copié avec succès !'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gold-dark" />
                      <span>{lang === 'ar' ? 'نسخ ملخص الحساب' : lang === 'en' ? 'Copy Calculation Summary' : 'Copier le récapitulatif'}</span>
                    </>
                  )}
                </button>

                {/* Direct CTA to support clean water project or give Sadaqah */}
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('dons')}
                  className="w-full py-3 px-4 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4 text-ink" />
                  <span>
                    {lang === 'ar' ? 'صرف الزكاة أو التبرع للمشاريع' : lang === 'en' ? 'Fulfill Zakat / Donate' : 'S’acquitter de la Zakat / Faire un Don'}
                  </span>
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </button>

              </div>

              {/* Reassurance note */}
              <div className="pt-2 text-[11px] text-text-sec text-center leading-relaxed italic">
                {lang === 'ar'
                  ? '« مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ » — رواه مسلم'
                  : '« Jamais aumône n’a diminué une richesse. » — Rapporté par Muslim'}
              </div>

            </div>

            {/* QUICK FIQH REMINDER BOX */}
            <div className="bg-emerald-main/10 border border-emerald-main/20 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-med">
                <ShieldCheck className="w-4 h-4 text-emerald-main" />
                <span>{lang === 'ar' ? 'تذكير شرعي هام' : lang === 'en' ? 'Important Reminder' : 'Rappel canonique important'}</span>
              </div>
              <p className="text-xs text-text-sec leading-relaxed">
                {lang === 'ar'
                  ? 'هذه الحاسبة أداة مساعدة رقمية لحساب زكاة المال وفق الراجح من أقوال أهل العلم. يُستحسن في الحالات المالية والشركات المعقدة استشارة عالم أو مفتٍ متخصص.'
                  : 'Ce calculateur est un outil d’aide numérique fondé sur les avis majoritaires des écoles juridiques. En cas de situations patrimoniales complexes (holdings, biens indivis), consultez un juriste qualifié.'}
              </p>
            </div>

          </div>

        </div>

        {/* SECTION: ISLAMIC RULES & FREQUENT QUESTIONS (FIQH ACCORDION) */}
        <section className="mt-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-gold-dark tracking-wider uppercase bg-gold-main/10 px-3 py-1 rounded-full inline-block">
              📚 {lang === 'ar' ? 'فقه الزكاة وضوابطها' : lang === 'en' ? 'Islamic Guidelines & Fiqh' : 'Comprendre les Règles de la Zakat'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              {lang === 'ar' ? 'أسئلة شائعة وأحكام شرعية' : lang === 'en' ? 'Frequently Asked Questions & Rulings' : 'Guide Pratique & Questions Fréquentes'}
            </h2>
            <p className="text-xs sm:text-sm text-text-sec font-sans">
              {lang === 'ar'
                ? 'إجابات واضحة وموثقة بالأدلة من القرآن الكريم وصحيح السنة النبوية المطهرة.'
                : 'Les réponses claires et référencées pour comprendre le sens, les conditions et les bénéficiaires de la Zakat.'}
            </p>
          </div>

          {/* Accordion FAQ items */}
          <div className="max-w-3xl mx-auto space-y-3 pt-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-gray-100 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className={`w-full p-4.5 text-left font-serif font-bold text-sm text-ink hover:text-gold-dark transition-colors flex items-center justify-between gap-4 ${
                      isOpen ? 'bg-cream-main/40' : 'bg-white'
                    } ${isAr ? 'text-right flex-row-reverse' : ''}`}
                  >
                    <span>{faq.q[lang] || faq.q.fr}</span>
                    <span className="text-gold-main text-lg font-mono shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="p-4.5 pt-2 text-xs sm:text-sm text-text-sec font-sans leading-relaxed border-t border-gray-50 bg-cream-main/20"
                      >
                        <p>{faq.a[lang] || faq.a.fr}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Verset 60 Sourate At-Tawbah Callout */}
          <div className="max-w-3xl mx-auto mt-8 bg-ink text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-gold-main/30">
            <div className="flex items-center gap-2 text-gold-light text-xs font-semibold uppercase tracking-wider font-mono">
              <BookOpen className="w-4 h-4 text-gold-main" />
              <span>{lang === 'ar' ? 'الآية الكريمة المحددة للمصارف' : 'Les 8 Bénéficiaires Divinement Fixés (Coran 9:60)'}</span>
            </div>

            <p className="font-amiri text-gold-light text-lg sm:text-xl leading-relaxed text-right" dir="rtl">
              « إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ ۖ فَرِيضَةً مِّنَ اللَّهِ ۗ وَاللَّهُ عَلِيمٌ حَكِيمٌ »
            </p>

            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              {lang === 'ar'
                ? '«إنما الصدقات للفقراء والمساكين... فريضة من الله والله عليم حكيم» — سورة التوبة، الآية 60'
                : '« Les aumônes sont destinées uniquement aux pauvres, aux indigents, à ceux qui y travaillent, à ceux dont les cœurs sont à rallier, à l’affranchissement des jougs, aux endettés, dans le sentier d’Allah, et au voyageur en détresse. C’est un décret d’Allah ! Et Allah est Omniscient et Sage. » — Sourate At-Tawbah, V. 60'}
            </p>
          </div>

        </section>

      </main>

    </div>
  );
}
