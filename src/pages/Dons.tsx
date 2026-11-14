import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Droplet, Users, ShieldCheck, ChevronDown, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { useContentStore } from '../lib/content-store';
import SasPayModal from '../components/SasPayModal';
import { PublicSasPayOrder } from '../lib/saspay-api';

interface DonsProps {
  lang: Language;
  onDonateSubmit: (amount: number) => void;
  resumeOrderId?: string | null;
}

export default function Dons({ lang, onDonateSubmit, resumeOrderId }: DonsProps) {
  const { donsCampaign, addDonor } = useContentStore();
  const t = translations[lang];
  const isAr = lang === 'ar';

  // State
  const [selectedPreset, setSelectedPreset] = useState<number | 'other'>(20);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [thanksMessage, setThanksMessage] = useState(false);
  const [confirmedAmountEur, setConfirmedAmountEur] = useState<string>('20');
  const [confirmedOrderRef, setConfirmedOrderRef] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // SasPay checkout modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [pendingAmountEur, setPendingAmountEur] = useState<number>(20);
  const [activeResumeOrderId, setActiveResumeOrderId] = useState<string | null>(resumeOrderId || null);

  // New Donor Info State
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorProject, setDonorProject] = useState('Puits Mali #3');

  useEffect(() => {
    if (resumeOrderId) {
      setActiveResumeOrderId(resumeOrderId);
      setPayModalOpen(true);
    }
  }, [resumeOrderId]);

  // Constants (Synced dynamically from Store!)
  const goalTarget = donsCampaign.target;
  const initialCollected = donsCampaign.collected;
  const percentage = Math.min(Math.round((initialCollected / goalTarget) * 100), 100);
  const initialDonors = donsCampaign.donorsCount;

  const presets = [5, 10, 20, 50, 100];

  const handleDonate = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    let finalAmount = 0;
    if (selectedPreset === 'other') {
      finalAmount = parseFloat(customAmount);
    } else {
      finalAmount = selectedPreset;
    }

    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      setFormError(
        lang === 'fr'
          ? 'Veuillez saisir un montant valide.'
          : lang === 'en'
            ? 'Enter a valid amount.'
            : 'يرجى إدخال مبلغ تبرع صالح.',
      );
      return;
    }

    setPendingAmountEur(finalAmount);
    setActiveResumeOrderId(null);
    setPayModalOpen(true);
  };

  const handleSasPaySuccess = ({
    order,
    shouldRecordDonor,
  }: {
    order: PublicSasPayOrder;
    shouldRecordDonor: boolean;
  }) => {
    const nameInput =
      order.customerName ||
      donorName.trim() ||
      (lang === 'fr' ? 'Bienfaiteur Anonyme' : lang === 'en' ? 'Anonymous Donor' : 'فاعل خير');
    const emailInput = donorEmail.trim() || 'donateur@islamavecaboubakar.com';
    const recordedEur = pendingAmountEur || 20;

    if (shouldRecordDonor) {
      addDonor(nameInput, emailInput, recordedEur, order.project || donorProject);
      onDonateSubmit(recordedEur);
    }

    setConfirmedAmountEur(order.charged ? `${order.charged} ${order.currency}` : `${recordedEur} €`);
    setConfirmedOrderRef(order.reference || order.orderId);
    setThanksMessage(true);
    setDonorName('');
    setDonorEmail('');
  };

  const testimonials = [
    { name: "Myriem B.", initial: "M", text: lang === 'fr' ? "Un geste humble pour les familles isolées. La clarté du site d'Aboubakar met en confiance !" : lang === 'en' ? "A humble donation for needy families. Love Aboubakar's transparent projects!" : "مبادرة مباركة وموثوقة، نسأل الله أن يتقبل منا ومنكم صالح الأعمال." },
    { name: "Youssef K.", initial: "Y", text: lang === 'fr' ? "En mémoire de mon père. Que ce puits coule éternellement dans nos balances. Amine." : lang === 'en' ? "In memory of my late father. May this well flow permanently for rewards." : "صدقة جارية عن والدي رحمه الله، الشكر موصول للشيخ أبي بكر وقناته الكريمة." },
    { name: "Sarah J.", initial: "S", text: lang === 'fr' ? "Soutenir la dawah et hater le besoin d'eau en même temps est une double opportunité !" : lang === 'en' ? "Supporting our brother and providing water at the same time is a double reward opportunity!" : "سقي الماء وتفريج كرب العوائل الفقيرة فرصة ثمينة لنيل رضا الله وكرمه." }
  ];

  const faqs = [
    { q: t.donsFaq1Q, a: t.donsFaq1A },
    { q: t.donsFaq2Q, a: t.donsFaq2A },
    { q: t.donsFaq3Q, a: t.donsFaq3A }
  ];

  return (
    <div className={`islamic-pattern min-h-screen pb-20 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {/* SECTION HERO DON */}
      <section className="bg-emerald-main py-16 lg:py-20 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,201,122,0.06)_1px,transparent_0)] bg-[size:28px_28px]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-white/10">
            <Droplet className="w-8 h-8 text-gold-light" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            {t.donsSectionTitle}
          </h1>

          {/* Verset Arabe Amiri */}
          <div className="inline-block py-2 px-6 bg-ink/30 rounded-2xl border-l border-r border-gold-light/40 font-amiri text-xl sm:text-2xl text-gold-light max-w-xl text-center" dir="rtl">
            « أَفْضَلُ الصَّدَقَةِ سَقْيُ الْمَاءِ »
            <span className="block text-xs sm:text-sm text-slate-300 font-sans mt-1">
              — {lang === 'ar' ? 'رواه ابن عباس رضي الله عنهما' : 'Rapporté par Ibn Abbas — Hadith authentique'}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans max-w-2xl mx-auto">
            {t.donsSectionSubtitle}
          </p>
        </div>
      </section>

      {/* BLOC CAGNOTTE (CENTRAL CARD) */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-2xl space-y-8">
          
          {/* Project Details header */}
          <div className="space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-med uppercase tracking-wider bg-emerald-main/10 px-3 py-1 rounded-full">
              🌍 {lang === 'fr' ? 'Campagne Climat & Humanitaire' : lang === 'en' ? 'Global Charity Campaign' : 'مشروع المساعدات الإنسانية'}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink">
              {t.donsProjectTitle}
            </h2>
            <p className="text-xs sm:text-sm text-text-sec leading-relaxed font-sans">
              {t.donsProjectDesc}
            </p>
          </div>

          {/* Cagnotte status gauges */}
          <div className="bg-cream-main/40 border border-gray-50 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-1">
              <div>
                <span className="text-2xl sm:text-3.5xl font-serif font-bold text-ink">
                  {initialCollected} €
                </span>
                <span className="text-xs sm:text-sm text-emerald-med font-sans ml-1">
                  {t.donsCollected}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-sec font-sans uppercase">
                {lang === 'fr' ? `sur un objectif de ${goalTarget} €` : lang === 'en' ? `on a goal target of €${goalTarget}` : `من أصل هدف إجمالي ${goalTarget} يورو`}
              </p>
            </div>

            {/* Custom progressive bars */}
            <div className="w-full h-4 bg-cream-sec rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-main rounded-full animate-bar-grow relative overflow-hidden"
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite] translate-x-[-100%]"></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-text-sec font-mono">
              <span className="flex items-center gap-1 font-sans">
                <Users className="w-3.5 h-3.5 text-gold-dark" />
                {lang === 'fr' ? `${initialDonors} donateurs engagés` : lang === 'en' ? `${initialDonors} active donors` : `${initialDonors} متبرعاً بفضل الله`}
              </span>
              <span>{percentage} %</span>
            </div>
          </div>

          {/* Donation Form */}
          <form onSubmit={handleDonate} noValidate className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-serif font-semibold text-ink">
                {t.donsPresetLabel}
              </p>
              
              {/* Preset buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {presets.map((amount) => {
                  const isSelected = selectedPreset === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(amount);
                        setCustomAmount('');
                      }}
                      className={`py-3.5 px-3 rounded-xl border text-sm font-bold font-mono transition-all ${
                        isSelected
                          ? 'bg-gold-main border-gold-main text-ink shadow'
                          : 'bg-white border-gray-100 hover:border-gold-main/40 text-ink'
                      }`}
                    >
                      {amount} €
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('other')}
                  className={`col-span-1 sm:col-span-5 md:col-span-1 py-3.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedPreset === 'other'
                      ? 'bg-gold-main border-gold-main text-ink shadow'
                      : 'bg-white border-gray-100 text-ink'
                  }`}
                >
                  {lang === 'fr' ? 'Autre' : lang === 'en' ? 'Custom' : 'مبلغ آخر'}
                </button>
              </div>
            </div>

            {/* Custom input panel if needed */}
            <AnimatePresence>
              {selectedPreset === 'other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  <label className="text-xs text-text-sec font-sans block">
                    {t.donsCustomLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 75"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-cream-main text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main font-mono placeholder-gray-400"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Donor Information Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-serif font-semibold text-ink block">
                  {lang === 'fr' ? 'Votre nom complet' : lang === 'en' ? 'Your Full Name' : 'الاسم بالكامل'}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Myriem B."
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-3 bg-cream-main text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main placeholder-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-serif font-semibold text-ink block">
                  {lang === 'fr' ? 'Votre adresse e-mail' : lang === 'en' ? 'Your Email Address' : 'البريد الإلكتروني'}
                </label>
                <input
                  type="email"
                  placeholder="Ex: myriem@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-cream-main text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main font-mono placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-ink block">
                {lang === 'fr' ? 'Choisir la campagne d\'aide' : lang === 'en' ? 'Choose Help Campaign' : 'اختر المشروع أو الحملة'}
              </label>
              <select
                value={donorProject}
                onChange={(e) => setDonorProject(e.target.value)}
                className="w-full px-4 py-3 bg-cream-main text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main font-sans"
              >
                <option value="Puits Mali #3">{lang === 'fr' ? 'Puits Mali #3 (Cible Principale)' : 'Puits Mali #3'}</option>
                <option value="Puits Niger #1">{lang === 'fr' ? 'Puits Niger #1' : 'Puits Niger #1'}</option>
                <option value="Sadaqa Jariya">{lang === 'fr' ? 'Sadaqa Jariya (Fonds Général)' : 'Sadaqa Jariya'}</option>
              </select>
            </div>

            {/* Inline form validation message */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Don button */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-serif font-bold rounded-2xl shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-5 h-5 text-red-urge fill-red-urge" />
                {t.donsCtaButton}
              </button>

              <div className="flex items-start gap-2.5 text-[11px] text-text-sec leading-relaxed justify-center max-w-xl mx-auto text-center font-sans">
                <ShieldCheck className="w-4 h-4 text-emerald-med flex-shrink-0 mt-0.5" />
                <span>{t.donsSecured}</span>
              </div>
            </div>

          </form>

          {/* Thanks trigger notification (ONLY shown after SasPay SUCCESS) */}
          <AnimatePresence>
            {thanksMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-emerald-main/15 border border-gold-main/30 p-4 rounded-xl flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gold-main flex items-center justify-center flex-shrink-0 text-ink text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-emerald-main">
                    Macha'Allah ! Don Vérifié SasPay Enregistré
                  </h4>
                  <p className="text-xs text-text-sec mt-1">
                    {confirmedAmountEur} • Réf. {confirmedOrderRef}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* SECTION SADAQA JARIYA EXPLAINER (3 COLS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3.5xl font-serif font-semibold text-ink">
            {t.donsImpactHeader}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-gold-main/30 flex flex-col space-y-4">
            <div className="w-12 h-12 bg-emerald-main/10 text-emerald-main rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-ink">
              1. {t.donsImpact1Title}
            </h3>
            <p className="text-xs sm:text-sm text-text-sec leading-relaxed font-sans">
              {t.donsImpact1Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-gold-main/30 flex flex-col space-y-4">
            <div className="w-12 h-12 bg-emerald-main/10 text-emerald-main rounded-xl flex items-center justify-center">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-ink">
              2. {t.donsImpact2Title}
            </h3>
            <p className="text-xs sm:text-sm text-text-sec leading-relaxed font-sans">
              {t.donsImpact2Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-gold-main/30 flex flex-col space-y-4">
            <div className="w-12 h-12 bg-emerald-main/10 text-emerald-main rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-ink">
              3. {t.donsImpact3Title}
            </h3>
            <p className="text-xs sm:text-sm text-text-sec leading-relaxed font-sans">
              {t.donsImpact3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* DONOR TESTIMONIALS */}
      <section className="bg-cream-sec/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3.5xl font-serif font-semibold text-ink">
              {lang === 'fr' ? "Témoignages de donateurs" : lang === 'en' ? "Donors Testimonials" : "أثر الإحسان وبركات الصدقة"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold-main text-ink font-bold flex items-center justify-center text-xs">
                    {test.initial}
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-ink">{test.name}</h4>
                    <p className="text-[10px] text-gray-400">Sadaqa Jariya</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-text-sec italic font-sans leading-relaxed">
                  " {test.text} "
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">
            {t.donsFaqTitle}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-serif font-bold text-ink hover:text-emerald-med focus:outline-none"
                >
                  <span className={`text-sm sm:text-base ${isAr ? 'text-right w-full pr-2' : ''}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-50 bg-cream-main/20"
                    >
                      <p className="p-5 text-xs sm:text-sm text-text-sec font-sans leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* SasPay Checkout & Softpay Verification Modal */}
      <SasPayModal
        isOpen={payModalOpen}
        onClose={() => {
          setPayModalOpen(false);
          setActiveResumeOrderId(null);
        }}
        lang={lang}
        intentType="donation"
        itemId={donorProject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
        itemTitle={`Don Sadaqa — ${donorProject}`}
        project={donorProject}
        baseAmountEur={pendingAmountEur}
        initialName={donorName}
        initialEmail={donorEmail}
        resumeOrderId={activeResumeOrderId}
        onPaymentSuccess={handleSasPaySuccess}
      />

    </div>
  );
}
