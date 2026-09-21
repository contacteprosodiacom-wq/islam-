import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle, Video, MessageCircle, Instagram, Facebook, Star } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface ContactProps {
  lang: Language;
}

export default function Contact({ lang }: ContactProps) {
  const t = translations[lang];
  const isAr = lang === 'ar';

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API pipeline delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 8000);
    }, 1500);
  };

  const socialLinks = [
    { name: "YouTube", handle: "@IslamAvecAboubakar", color: "bg-red-urge text-white", icon: <Video className="w-5 h-5" />, href: "https://youtube.com" },
    { name: "WhatsApp Chat", handle: "+33 6 00 00 00 00", color: "bg-[#25D366] text-white", icon: <MessageCircle className="w-5 h-5 fill-current" />, href: "https://whatsapp.com" },
    { name: "Telegram Channel", handle: "t.me/AboubakarIslam", color: "bg-[#0088cc] text-white", icon: <Send className="w-5 h-5" />, href: "https://telegram.org" },
    { name: "Instagram Rappels", handle: "@AboubakarRap", color: "bg-[#E1306C] text-white", icon: <Instagram className="w-5 h-5" />, href: "https://instagram.com" },
    { name: "Facebook", handle: "Islam Avec Aboubakar", color: "bg-[#1877F2] text-white", icon: <Facebook className="w-5 h-5 text-white fill-current" />, href: "https://facebook.com" },
    { name: "Email Direct", handle: "contact@islamaboubakar.com", color: "bg-ink text-gold-light", icon: <Mail className="w-5 h-5" />, href: "mailto:contact@islamaboubakar.com" },
  ];

  return (
    <div className={`islamic-pattern min-h-screen pb-20 ${isAr ? 'text-right' : 'text-left'}`}>
      
      {/* HEADER SECTION */}
      <section className="bg-ink py-16 text-white border-b border-gold-main/20 relative">
        <div className="absolute inset-0 bg-gold-main/2 opacity-5 select-none font-amiri text-8xl text-center">
          اتصال بنا
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Mail className="w-6 h-6 text-gold-light" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {t.contactTitle}
          </h1>
          <p className="text-xs sm:text-sm text-text-sec max-w-xl mx-auto leading-relaxed">
            {t.contactSubtitle}
          </p>
        </div>
      </section>

      {/* CORE CONTACT BLOCKS & FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* CONTACT FORM LEFT */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xl space-y-6">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-main"></span>
            {lang === 'fr' ? 'Formulaire de Message' : lang === 'en' ? 'Direct Message Form' : 'أرسل لنا رسالة مباشرة'}
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-sec block">
                  {t.contactFormName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bilal Al-Farouq"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-main focus:bg-white text-sm text-ink rounded-xl border border-transparent focus:border-gold-main/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-sec block">
                  {t.contactFormPhone}
                </label>
                <input
                  type="text"
                  placeholder="Ex: +33 7 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-main focus:bg-white text-sm text-ink rounded-xl border border-transparent focus:border-gold-main/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-sec block">
                  {t.contactFormEmail} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: bilal@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-main focus:bg-white text-sm text-ink rounded-xl border border-transparent focus:border-gold-main/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-sec block">
                  {t.contactFormSubject} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Proposition d'édition d'ebook"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-main focus:bg-white text-sm text-ink rounded-xl border border-transparent focus:border-gold-main/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-sec block">
                {t.contactFormMsg} *
              </label>
              <textarea
                required
                rows={5}
                placeholder={lang === 'fr' ? 'Écrivez vos pensées spirituelles ou suggestions...' : lang === 'en' ? 'Write down your query or collaborative proposal...' : 'اكتب تفاصيل مقترحك أو تساؤلك العلمي هنا...'}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-cream-main focus:bg-white text-sm text-ink rounded-xl border border-transparent focus:border-gold-main/50 focus:outline-none placeholder-gray-400"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shadow flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Progression...' : t.contactSend}</span>
            </button>
          </form>

          {/* Success card modal inside scope */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-emerald-main/15 border border-gold-main/30 p-5 rounded-2xl flex items-start gap-3.5"
              >
                <CheckCircle className="w-6 h-6 text-emerald-main flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-emerald-main">
                    Alhamdulillah ! Message Transmis
                  </h4>
                  <p className="text-xs text-text-sec leading-relaxed mt-1">
                    {t.contactSuccess}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* SOCIAL LINKS RIGHT */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-emerald-main text-white p-6 rounded-3xl space-y-4 shadow-lg border border-gold-main/20">
            <h3 className="text-lg font-serif font-bold text-gold-light">
              📬 {t.contactSocialHeader}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {t.contactSocialDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialLinks.map((soc, index) => (
              <a
                key={index}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:border-gold-main/40 hover:shadow-md border border-gray-50 p-4 rounded-2xl flex items-center gap-3 group transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${soc.color} shadow`}>
                  {soc.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-ink">{soc.name}</h4>
                  <p className="text-[10px] text-text-sec truncate font-mono">
                    {soc.handle}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Community stats highlight banner */}
          <div className="bg-cream-sec/30 rounded-2xl p-6 border border-gray-100 flex items-center justify-between text-xs text-text-sec font-sans">
            <span className="flex items-center gap-1.5 font-bold">
              <Star className="w-4 h-4 text-gold-main fill-gold-main" />
              Soutenu à 100% par l'Oummah
            </span>
            <span className="font-mono">Est. 2026</span>
          </div>

        </div>

      </section>

    </div>
  );
}
