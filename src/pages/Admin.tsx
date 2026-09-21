import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, FileText, Music, Video as VideoIcon, 
  HelpCircle, Users, LogOut, Plus, Edit, Trash2, Eye, Download, 
  X, Save, Check, Globe, AlertCircle, RefreshCw, LogIn, UserPlus 
} from 'lucide-react';
import { useContentStore } from '../lib/content-store';
import { Ebook, Article, Video, Reciter, Quiz, Donor, QuizQuestion, Language } from '../types';
import { all114Surahs } from '../data/all-114-surahs';

interface AdminProps {
  lang: Language;
}

type AdminTab = 'dashboard' | 'ebooks' | 'articles' | 'coran' | 'videos' | 'quiz' | 'donors';

export default function Admin({ lang }: AdminProps) {
  const store = useContentStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('islam_aboubakar_admin_auth') === 'true';
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Layout State
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Coran Audios Sub-view state
  const [activeAudioReciter, setActiveAudioReciter] = useState<Reciter | null>(null);
  const [audioUrlsEdit, setAudioUrlsEdit] = useState<Record<number, string>>({});

  // Donation campaign filter and CSV state
  const [donorCampaignFilter, setDonorCampaignFilter] = useState<string>('All');

  // Generic Modal/Form States for CRUD
  const [crudModal, setCrudModal] = useState<{
    type: 'ebook' | 'article' | 'video' | 'reciter' | 'quiz';
    action: 'add' | 'edit';
    id?: string;
  } | null>(null);

  // Form Field States
  // Ebook Form
  const [ebTitleFr, setEbTitleFr] = useState('');
  const [ebTitleEn, setEbTitleEn] = useState('');
  const [ebTitleAr, setEbTitleAr] = useState('');
  const [ebDescFr, setEbDescFr] = useState('');
  const [ebDescEn, setEbDescEn] = useState('');
  const [ebDescAr, setEbDescAr] = useState('');
  const [ebAuthor, setEbAuthor] = useState('Aboubakar');
  const [ebIsFree, setEbIsFree] = useState(true);
  const [ebPrice, setEbPrice] = useState('15');
  const [ebBadgeFr, setEbBadgeFr] = useState('Gratuit');
  const [ebBadgeEn, setEbBadgeEn] = useState('Free');
  const [ebBadgeAr, setEbBadgeAr] = useState('مجاني');
  const [ebCategory, setEbCategory] = useState<'coran' | 'fiqh' | 'histoire' | 'spiritualite'>('fiqh');

  // Article Form
  const [artCatFr, setArtCatFr] = useState('');
  const [artCatEn, setArtCatEn] = useState('');
  const [artCatAr, setArtCatAr] = useState('');
  const [artTitleFr, setArtTitleFr] = useState('');
  const [artTitleEn, setArtTitleEn] = useState('');
  const [artTitleAr, setArtTitleAr] = useState('');
  const [artExcFr, setArtExcFr] = useState('');
  const [artExcEn, setArtExcEn] = useState('');
  const [artExcAr, setArtExcAr] = useState('');
  const [artContFr, setArtContFr] = useState('');
  const [artContEn, setArtContEn] = useState('');
  const [artContAr, setArtContAr] = useState('');
  const [artReadTime, setArtReadTime] = useState('5 min');
  const [artImage, setArtImage] = useState('https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&q=80&w=800');
  const [artFeatured, setArtFeatured] = useState(false);

  // Video Form
  const [vidYtId, setVidYtId] = useState('');
  const [vidTitleFr, setVidTitleFr] = useState('');
  const [vidTitleEn, setVidTitleEn] = useState('');
  const [vidTitleAr, setVidTitleAr] = useState('');
  const [vidDuration, setVidDuration] = useState('15:00');
  const [vidCategory, setVidCategory] = useState<'geopolitique' | 'education' | 'histoires' | 'analyse' | 'ramadan'>('education');

  // Reciter Form
  const [recName, setRecName] = useState('');
  const [recLocalName, setRecLocalName] = useState('');
  const [recStyle, setRecStyle] = useState('Murattal');
  const [recOrigin, setRecOrigin] = useState('');
  const [recInitials, setRecInitials] = useState('');
  const [recApiCode, setRecApiCode] = useState('');

  // Quiz Form (simple question list builder)
  const [quizTitleFr, setQuizTitleFr] = useState('');
  const [quizTitleEn, setQuizTitleEn] = useState('');
  const [quizTitleAr, setQuizTitleAr] = useState('');
  const [quizDescFr, setQuizDescFr] = useState('');
  const [quizDescEn, setQuizDescEn] = useState('');
  const [quizDescAr, setQuizDescAr] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<'debutant' | 'intermediaire' | 'avance'>('debutant');
  const [quizCategory, setQuizCategory] = useState<'coran' | 'prophetes' | 'piliers' | 'hadiths' | 'histoire'>('coran');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Quiz Question builder state
  const [qQuestFr, setQQuestFr] = useState('');
  const [qQuestEn, setQQuestEn] = useState('');
  const [qQuestAr, setQQuestAr] = useState('');
  const [qOptFr, setQOptFr] = useState(['', '', '', '']);
  const [qOptEn, setQOptEn] = useState(['', '', '', '']);
  const [qOptAr, setQOptAr] = useState(['', '', '', '']);
  const [qCorrectIdx, setQCorrectIdx] = useState(0);
  const [qExplFr, setQExplFr] = useState('');
  const [qExplEn, setQExplEn] = useState('');
  const [qExplAr, setQExplAr] = useState('');

  // Campaign editable target state
  const [campaignTargetInput, setCampaignTargetInput] = useState(store.donsCampaign.target.toString());

  // Handle Login Authentication
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (username === 'Moubarak' && password === 'Moub@2026') {
      setIsAuthenticated(true);
      localStorage.setItem('islam_aboubakar_admin_auth', 'true');
    } else {
      setAuthError('Identifiants de connexion invalides. Utilisez Moubarak / Moub@2026.');
    }
  };

  // Handle Register Mockup
  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regUsername || !regPassword) {
      setAuthError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (regPassword !== regConfirm) {
      setAuthError('Les mots de passe ne correspondent pas.');
      return;
    }
    // Simulate successful registration, pre-fill login
    alert('Création de compte réussie (Mode démo d\'évaluation) ! Veuillez vous connecter avec vos identifiants.');
    setUsername(regUsername);
    setPassword(regPassword);
    setAuthMode('login');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('islam_aboubakar_admin_auth');
  };

  // CSV Exporter for Donors
  const downloadDonorsCSV = () => {
    // Filter donors
    const filtered = store.donors.filter(d => {
      if (donorCampaignFilter === 'All') return true;
      return d.project === donorCampaignFilter;
    });

    // CSV Headers
    const headers = ['ID', 'Nom', 'Email', 'Montant (€)', 'Date de don', 'Projet / Campagne'];
    
    // CSV Rows
    const rows = filtered.map(d => [
      d.id,
      d.name,
      d.email,
      d.amount.toString(),
      d.date,
      d.project
    ]);

    // Construct CSV String with ';' separator
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    // Encode to UTF-8 Byte Array with BOM so Excel reads accents correctly
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `donateurs_${donorCampaignFilter.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open audios configuration list of 114 surahs for a reciter
  const handleOpenReciterAudios = (reciter: Reciter) => {
    setActiveAudioReciter(reciter);
    // Get currently saved URLs for this reciter
    const reciterUrls = store.surahAudios[reciter.id] || {};
    setAudioUrlsEdit({ ...reciterUrls });
  };

  // Save Surah Audio URL
  const handleSaveSurahAudio = (surahNumber: number, url: string) => {
    if (!activeAudioReciter) return;
    store.setSurahAudio(activeAudioReciter.id, surahNumber, url);
    setAudioUrlsEdit(prev => ({ ...prev, [surahNumber]: url }));
  };

  // Save all surah audios in bulk
  const handleBulkSaveSurahAudios = () => {
    if (!activeAudioReciter) return;
    Object.entries(audioUrlsEdit).forEach(([sNum, url]) => {
      store.setSurahAudio(activeAudioReciter.id, parseInt(sNum), url);
    });
    alert('Toutes les configurations d\'audios pour ce récitateur ont été sauvegardées.');
    setActiveAudioReciter(null);
  };

  // Form CRUD save actions
  const handleSaveCrud = (e: FormEvent) => {
    e.preventDefault();
    if (!crudModal) return;

    const { type, action, id } = crudModal;

    if (type === 'ebook') {
      const data: Ebook = {
        id: id || 'ebook-' + Date.now(),
        title: { fr: ebTitleFr, en: ebTitleEn, ar: ebTitleAr },
        description: { fr: ebDescFr, en: ebDescEn, ar: ebDescAr },
        author: ebAuthor,
        isFree: ebIsFree,
        price: ebIsFree ? undefined : parseFloat(ebPrice),
        badge: { fr: ebBadgeFr, en: ebBadgeEn, ar: ebBadgeAr },
        category: ebCategory
      };

      if (action === 'add') store.addEbook(data);
      else store.updateEbook(id!, data);
    } 
    else if (type === 'article') {
      const data: Article = {
        id: id || 'article-' + Date.now(),
        category: { fr: artCatFr, en: artCatEn, ar: artCatAr },
        title: { fr: artTitleFr, en: artTitleEn, ar: artTitleAr },
        excerpt: { fr: artExcFr, en: artExcEn, ar: artExcAr },
        content: { fr: artContFr, en: artContEn, ar: artContAr },
        date: new Date().toISOString().split('T')[0],
        readTime: artReadTime,
        image: artImage,
        featured: artFeatured
      };

      if (action === 'add') store.addArticle(data);
      else store.updateArticle(id!, data);
    }
    else if (type === 'video') {
      const data: Video = {
        id: id || 'video-' + Date.now(),
        youtubeId: vidYtId,
        title: { fr: vidTitleFr, en: vidTitleEn, ar: vidTitleAr },
        duration: vidDuration,
        category: vidCategory,
        date: new Date().toISOString().split('T')[0]
      };

      if (action === 'add') store.addVideo(data);
      else store.updateVideo(id!, data);
    }
    else if (type === 'reciter') {
      const data: Reciter = {
        id: id || 'reciter-' + Date.now(),
        name: recName,
        localName: recLocalName,
        style: recStyle,
        origin: recOrigin,
        initials: recInitials || recName.split(' ').map(n => n[0]).join('').slice(0, 2),
        apiCode: recApiCode
      };

      if (action === 'add') store.addReciter(data);
      else store.updateReciter(id!, data);
    }
    else if (type === 'quiz') {
      const data: Quiz = {
        id: id || 'quiz-' + Date.now(),
        title: { fr: quizTitleFr, en: quizTitleEn, ar: quizTitleAr },
        description: { fr: quizDescFr, en: quizDescEn, ar: quizDescAr },
        difficulty: quizDifficulty,
        category: quizCategory,
        questionsCount: quizQuestions.length,
        questions: quizQuestions
      };

      if (action === 'add') store.addQuiz(data);
      else store.updateQuiz(id!, data);
    }

    setCrudModal(null);
    resetFormStates();
  };

  const handleEditOpen = (type: 'ebook' | 'article' | 'video' | 'reciter' | 'quiz', item: any) => {
    if (type === 'ebook') {
      const eb = item as Ebook;
      setEbTitleFr(eb.title.fr);
      setEbTitleEn(eb.title.en);
      setEbTitleAr(eb.title.ar);
      setEbDescFr(eb.description.fr);
      setEbDescEn(eb.description.en);
      setEbDescAr(eb.description.ar);
      setEbAuthor(eb.author);
      setEbIsFree(eb.isFree);
      setEbPrice(eb.price?.toString() || '15');
      setEbBadgeFr(eb.badge.fr);
      setEbBadgeEn(eb.badge.en);
      setEbBadgeAr(eb.badge.ar);
      setEbCategory(eb.category);
    } 
    else if (type === 'article') {
      const art = item as Article;
      setArtCatFr(art.category.fr);
      setArtCatEn(art.category.en);
      setArtCatAr(art.category.ar);
      setArtTitleFr(art.title.fr);
      setArtTitleEn(art.title.en);
      setArtTitleAr(art.title.ar);
      setArtExcFr(art.excerpt.fr);
      setArtExcEn(art.excerpt.en);
      setArtExcAr(art.excerpt.ar);
      setArtContFr(art.content.fr);
      setArtContEn(art.content.en);
      setArtContAr(art.content.ar);
      setArtReadTime(art.readTime);
      setArtImage(art.image);
      setArtFeatured(art.featured || false);
    }
    else if (type === 'video') {
      const vid = item as Video;
      setVidYtId(vid.youtubeId);
      setVidTitleFr(vid.title.fr);
      setVidTitleEn(vid.title.en);
      setVidTitleAr(vid.title.ar);
      setVidDuration(vid.duration);
      setVidCategory(vid.category);
    }
    else if (type === 'reciter') {
      const rec = item as Reciter;
      setRecName(rec.name);
      setRecLocalName(rec.localName);
      setRecStyle(rec.style);
      setRecOrigin(rec.origin);
      setRecInitials(rec.initials);
      setRecApiCode(rec.apiCode);
    }
    else if (type === 'quiz') {
      const qz = item as Quiz;
      setQuizTitleFr(qz.title.fr);
      setQuizTitleEn(qz.title.en);
      setQuizTitleAr(qz.title.ar);
      setQuizDescFr(qz.description.fr);
      setQuizDescEn(qz.description.en);
      setQuizDescAr(qz.description.ar);
      setQuizDifficulty(qz.difficulty);
      setQuizCategory(qz.category);
      setQuizQuestions(qz.questions);
    }

    setCrudModal({ type, action: 'edit', id: item.id });
  };

  const handleAddOpen = (type: 'ebook' | 'article' | 'video' | 'reciter' | 'quiz') => {
    resetFormStates();
    setCrudModal({ type, action: 'add' });
  };

  const resetFormStates = () => {
    // Ebooks
    setEbTitleFr(''); setEbTitleEn(''); setEbTitleAr('');
    setEbDescFr(''); setEbDescEn(''); setEbDescAr('');
    setEbAuthor('Aboubakar'); setEbIsFree(true); setEbPrice('15');
    setEbBadgeFr('Gratuit'); setEbBadgeEn('Free'); setEbBadgeAr('مجاني');
    setEbCategory('fiqh');

    // Articles
    setArtCatFr(''); setArtCatEn(''); setArtCatAr('');
    setArtTitleFr(''); setArtTitleEn(''); setArtTitleAr('');
    setArtExcFr(''); setArtExcEn(''); setArtExcAr('');
    setArtContFr(''); setArtContEn(''); setArtContAr('');
    setArtReadTime('5 min'); setArtImage('https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&q=80&w=800');
    setArtFeatured(false);

    // Videos
    setVidYtId(''); setVidTitleFr(''); setVidTitleEn(''); setVidTitleAr('');
    setVidDuration('15:00'); setVidCategory('education');

    // Reciters
    setRecName(''); setRecLocalName(''); setRecStyle('Murattal');
    setRecOrigin(''); setRecInitials(''); setRecApiCode('');

    // Quizzes
    setQuizTitleFr(''); setQuizTitleEn(''); setQuizTitleAr('');
    setQuizDescFr(''); setQuizDescEn(''); setQuizDescAr('');
    setQuizDifficulty('debutant'); setQuizCategory('coran');
    setQuizQuestions([]);
    clearQuestionBuilder();
  };

  const clearQuestionBuilder = () => {
    setQQuestFr(''); setQQuestEn(''); setQQuestAr('');
    setQOptFr(['', '', '', '']); setQOptEn(['', '', '', '']); setQOptAr(['', '', '', '']);
    setQCorrectIdx(0);
    setQExplFr(''); setQExplEn(''); setQExplAr('');
  };

  // Add question to active quiz questions list
  const handleAddQuestionToQuiz = () => {
    if (!qQuestFr || !qQuestFr) {
      alert('Veuillez au moins renseigner la question en français.');
      return;
    }
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      question: { fr: qQuestFr, en: qQuestEn || qQuestFr, ar: qQuestAr || qQuestFr },
      options: {
        fr: qOptFr.filter(o => o !== ''),
        en: qOptEn.some(o => o !== '') ? qOptEn.filter(o => o !== '') : qOptFr.filter(o => o !== ''),
        ar: qOptAr.some(o => o !== '') ? qOptAr.filter(o => o !== '') : qOptFr.filter(o => o !== '')
      },
      correctAnswerIndex: qCorrectIdx,
      explanation: { fr: qExplFr, en: qExplEn || qExplFr, ar: qExplAr || qExplFr }
    };
    setQuizQuestions(prev => [...prev, newQuestion]);
    clearQuestionBuilder();
  };

  // Remove question from active quiz list
  const handleRemoveQuestionFromQuiz = (idx: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  // Save campaign target change
  const handleSaveCampaignTarget = () => {
    const val = parseFloat(campaignTargetInput);
    if (val && !isNaN(val) && val > 0) {
      store.updateDonsCampaignTarget(val);
      alert('Objectif de la cagnotte mis à jour avec succès.');
    }
  };

  // Campaign dropdown selections
  const uniqueCampaigns = ['All', ...Array.from(new Set(store.donors.map(d => d.project)))];

  // If not authenticated, render login panel
  if (!isAuthenticated) {
    return (
      <div className="islamic-pattern min-h-screen py-24 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-main/10 rounded-full flex items-center justify-center mx-auto border border-gold-main/20">
              <LayoutDashboard className="w-6 h-6 text-emerald-main" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-ink">
              Admin — Islam avec Aboubakar
            </h1>
            <p className="text-xs text-text-sec">
              {authMode === 'login' 
                ? 'Connectez-vous pour gérer les ebooks, articles, vidéos, coran et quiz.' 
                : 'Créez un compte administrateur d\'évaluation.'}
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-sec block">Identifiant</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: Moubarak" 
                  className="w-full px-4 py-3 bg-cream-main text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main font-sans placeholder-gray-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-sec block">Mot de passe</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ex: Moub@2026" 
                  className="w-full px-4 py-3 bg-cream-main text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main font-mono placeholder-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-main hover:bg-emerald-med text-white font-serif font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Se connecter
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-sec block">Identifiant</label>
                <input 
                  type="text" 
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Nouvel identifiant admin" 
                  className="w-full px-4 py-3 bg-cream-main text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main font-sans placeholder-gray-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-sec block">Mot de passe</label>
                <input 
                  type="password" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Nouveau mot de passe" 
                  className="w-full px-4 py-3 bg-cream-main text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main font-mono placeholder-gray-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-sec block">Confirmer mot de passe</label>
                <input 
                  type="password" 
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Ressaisir mot de passe" 
                  className="w-full px-4 py-3 bg-cream-main text-ink text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-main font-mono placeholder-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gold-main hover:bg-gold-light active:bg-gold-dark text-ink font-serif font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Créer mon compte
              </button>
            </form>
          )}

          <div className="border-t border-gray-50 pt-4 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-xs text-emerald-med hover:underline font-semibold"
            >
              {authMode === 'login' ? "S'enregistrer comme admin ?" : "Retourner à l'interface de connexion"}
            </button>
          </div>

          <div className="text-center">
            <a 
              href="#home" 
              className="text-xs text-gray-400 hover:text-emerald-main font-bold block mt-2"
            >
              ← Retourner au site public
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-ink font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-ink text-white flex flex-col justify-between border-r border-gold-main/10 flex-shrink-0">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-main text-ink flex items-center justify-center font-serif font-bold">
              A
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold leading-tight">Islam Aboubakar</h2>
              <span className="text-[10px] text-gold-light font-mono font-bold">CONSOLE ADMIN</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setActiveAudioReciter(null); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                activeTab === 'dashboard' ? 'bg-emerald-main text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => { setActiveTab('ebooks'); setActiveAudioReciter(null); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                activeTab === 'ebooks' ? 'bg-emerald-main text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Ebooks</span>
            </button>

            <button
              onClick={() => { setActiveTab('articles'); setActiveAudioReciter(null); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                activeTab === 'articles' ? 'bg-emerald-main text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Articles Blog</span>
            </button>

            <button
              onClick={() => { setActiveTab('coran'); setActiveAudioReciter(null); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                activeTab === 'coran' ? 'bg-emerald-main text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Récitateurs & Coran</span>
            </button>

            <button
              onClick={() => { setActiveTab('videos'); setActiveAudioReciter(null); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                activeTab === 'videos' ? 'bg-emerald-main text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <VideoIcon className="w-4 h-4" />
              <span>Vidéos YouTube</span>
            </button>

            <button
              onClick={() => { setActiveTab('quiz'); setActiveAudioReciter(null); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                activeTab === 'quiz' ? 'bg-emerald-main text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Quiz d'Évaluation</span>
            </button>

            <button
              onClick={() => { setActiveTab('donors'); setActiveAudioReciter(null); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                activeTab === 'donors' ? 'bg-emerald-main text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Dons & Donateurs</span>
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <a
            href="#home"
            className="w-full px-4 py-3 rounded-xl border border-gold-main/20 text-gold-light hover:bg-gold-main/10 flex items-center justify-center gap-2 text-xs font-bold transition-all"
          >
            <Globe className="w-4 h-4" />
            Voir la vitrine
          </a>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-xl bg-red-urge/10 hover:bg-red-urge text-red-500 hover:text-white flex items-center justify-center gap-2 text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto max-h-screen">
        
        {/* HEADER BAR */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink">
              {activeTab === 'dashboard' && 'Vue d\'ensemble'}
              {activeTab === 'ebooks' && 'Gestion des Ebooks'}
              {activeTab === 'articles' && 'Gestion des Articles'}
              {activeTab === 'coran' && (activeAudioReciter ? `Audios de ${activeAudioReciter.name}` : 'Gestion des Récitateurs')}
              {activeTab === 'videos' && 'Gestion de la Vidéothèque'}
              {activeTab === 'quiz' && 'Gestion des Quiz'}
              {activeTab === 'donors' && 'Suivi des Dons & Export'}
            </h1>
            <p className="text-xs text-text-sec">
              {activeTab === 'dashboard' && 'Consultez les statistiques rapides et modifiez les campagnes.'}
              {activeTab === 'ebooks' && 'Gérez les ouvrages numériques, configurez les statuts gratuit/payant.'}
              {activeTab === 'articles' && 'Rédigez de nouveaux enseignements et modifiez les articles du blog.'}
              {activeTab === 'coran' && 'Ajoutez des récitateurs et configurez les 114 sourates avec MP3 ou YouTube.'}
              {activeTab === 'videos' && 'Mettez en avant vos cours YouTube pour instruire la communauté.'}
              {activeTab === 'quiz' && 'Configurez des tests religieux interactifs pour vos apprenants.'}
              {activeTab === 'donors' && 'Filtrez l\'historique des bienfaiteurs et téléchargez le grand livre en CSV.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-emerald-main/10 text-emerald-med px-3 py-1.5 rounded-lg border border-emerald-main/10">
              ● Connecté : Moubarak (Admin)
            </span>
          </div>
        </header>

        {/* TAB CONTENTS */}
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-2xl font-bold text-ink font-mono">{store.ebooks.length}</span>
                <p className="text-[11px] font-bold text-text-sec uppercase">Ebooks</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-2xl font-bold text-ink font-mono">{store.articles.length}</span>
                <p className="text-[11px] font-bold text-text-sec uppercase">Articles</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-2xl font-bold text-ink font-mono">{store.videos.length}</span>
                <p className="text-[11px] font-bold text-text-sec uppercase">Vidéos</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-2xl font-bold text-ink font-mono">{store.reciters.length}</span>
                <p className="text-[11px] font-bold text-text-sec uppercase">Récitateurs</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-2xl font-bold text-ink font-mono">{store.quizzes.length}</span>
                <p className="text-[11px] font-bold text-text-sec uppercase">Quiz</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-2xl font-bold text-emerald-main font-mono">{store.donsCampaign.collected} €</span>
                <p className="text-[11px] font-bold text-text-sec uppercase">Dons Reçus</p>
              </div>
            </div>

            {/* Campaign Target Editing */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-1">
                <h3 className="text-sm font-serif font-bold text-ink">
                  Configuration de la Campagne de Don
                </h3>
                <p className="text-xs text-text-sec">
                  Ajustez l'objectif financier visible sur la page de collecte publique.
                </p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-sec uppercase block mb-1">Objectif Actuel (€)</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={campaignTargetInput}
                    onChange={(e) => setCampaignTargetInput(e.target.value)}
                    className="px-3 py-2 bg-cream-main text-sm text-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-main font-mono w-full"
                  />
                  <button 
                    onClick={handleSaveCampaignTarget}
                    className="px-4 py-2 bg-emerald-main hover:bg-emerald-med text-white rounded-lg text-xs font-bold font-serif shadow"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
              <div className="p-4 bg-cream-main/30 border border-gold-main/10 rounded-xl space-y-1 text-xs">
                <p className="text-text-sec">
                  <strong>État :</strong> {store.donsCampaign.collected} € collectés sur un objectif de {store.donsCampaign.target} € ({Math.round((store.donsCampaign.collected / store.donsCampaign.target) * 100)}%).
                </p>
                <p className="text-gray-400">
                  Dernier don reçu : {store.donsCampaign.lastUpdate}
                </p>
              </div>
            </div>

            {/* Recent activities overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-serif font-bold text-ink border-b border-gray-100 pb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gold-dark" />
                  Derniers donateurs enregistrés
                </h3>
                <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
                  {store.donors.slice(0, 5).map(d => (
                    <div key={d.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-ink">{d.name}</strong>
                        <p className="text-[10px] text-gray-400">{d.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-main">+{d.amount} €</span>
                        <p className="text-[9px] text-gray-400">{d.project}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-serif font-bold text-ink border-b border-gray-100 pb-3">
                  Raccourcis d'administration
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <button onClick={() => handleAddOpen('ebook')} className="p-4 bg-cream-main/40 hover:bg-cream-main border border-gray-100 rounded-xl text-ink text-left hover:scale-[1.01] transition-transform">
                    📖 + Nouveau Ebook
                  </button>
                  <button onClick={() => handleAddOpen('article')} className="p-4 bg-cream-main/40 hover:bg-cream-main border border-gray-100 rounded-xl text-ink text-left hover:scale-[1.01] transition-transform">
                    ✍️ + Nouveau Blog
                  </button>
                  <button onClick={() => handleAddOpen('reciter')} className="p-4 bg-cream-main/40 hover:bg-cream-main border border-gray-100 rounded-xl text-ink text-left hover:scale-[1.01] transition-transform">
                    🎙️ + Nouveau Récitateur
                  </button>
                  <button onClick={() => handleAddOpen('quiz')} className="p-4 bg-cream-main/40 hover:bg-cream-main border border-gray-100 rounded-xl text-ink text-left hover:scale-[1.01] transition-transform">
                    🧠 + Nouveau Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EBOOKS TAB */}
        {activeTab === 'ebooks' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-xs font-mono uppercase text-gray-400 font-bold">{store.ebooks.length} Ebooks</span>
              <button 
                onClick={() => handleAddOpen('ebook')}
                className="px-4 py-2 bg-emerald-main hover:bg-emerald-med text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Ebook
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-100">
                <thead className="bg-gray-50 uppercase font-mono text-gray-400 font-bold">
                  <tr>
                    <th className="p-4">Titre (Fr)</th>
                    <th className="p-4">Auteur</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Prix</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {store.ebooks.map(eb => (
                    <tr key={eb.id} className="hover:bg-gray-50">
                      <td className="p-4 font-serif font-bold text-ink max-w-[240px] truncate">{eb.title.fr}</td>
                      <td className="p-4 text-text-sec">{eb.author}</td>
                      <td className="p-4 text-text-sec font-mono uppercase">{eb.category}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eb.isFree ? 'bg-emerald-main/10 text-emerald-med' : 'bg-gold-main/15 text-gold-dark'
                        }`}>
                          {eb.isFree ? 'Gratuit' : 'Payant'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold">{eb.isFree ? '0.00 €' : `${eb.price} €`}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditOpen('ebook', eb)} className="p-1.5 text-gray-400 hover:text-emerald-main transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => store.deleteEbook(eb.id)} className="p-1.5 text-gray-400 hover:text-red-urge transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ARTICLES TAB */}
        {activeTab === 'articles' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-xs font-mono uppercase text-gray-400 font-bold">{store.articles.length} Articles</span>
              <button 
                onClick={() => handleAddOpen('article')}
                className="px-4 py-2 bg-emerald-main hover:bg-emerald-med text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Écrire un Article
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-100">
                <thead className="bg-gray-50 uppercase font-mono text-gray-400 font-bold">
                  <tr>
                    <th className="p-4">Titre</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Temps lecture</th>
                    <th className="p-4">Mise en avant</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {store.articles.map(art => (
                    <tr key={art.id} className="hover:bg-gray-50">
                      <td className="p-4 font-serif font-bold text-ink max-w-[280px] truncate">{art.title.fr}</td>
                      <td className="p-4 text-text-sec">{art.category.fr}</td>
                      <td className="p-4 text-text-sec font-mono">{art.date}</td>
                      <td className="p-4 text-text-sec font-mono">{art.readTime}</td>
                      <td className="p-4">
                        {art.featured ? (
                          <span className="px-2 py-0.5 bg-gold-main/15 text-gold-dark rounded text-[9px] font-bold uppercase">Phare</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditOpen('article', art)} className="p-1.5 text-gray-400 hover:text-emerald-main transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => store.deleteArticle(art.id)} className="p-1.5 text-gray-400 hover:text-red-urge transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-xs font-mono uppercase text-gray-400 font-bold">{store.videos.length} Vidéos</span>
              <button 
                onClick={() => handleAddOpen('video')}
                className="px-4 py-2 bg-emerald-main hover:bg-emerald-med text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Mettre en ligne
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-100">
                <thead className="bg-gray-50 uppercase font-mono text-gray-400 font-bold">
                  <tr>
                    <th className="p-4">Titre (Fr)</th>
                    <th className="p-4">ID YouTube</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Durée</th>
                    <th className="p-4">Date de mise en avant</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {store.videos.map(vid => (
                    <tr key={vid.id} className="hover:bg-gray-50">
                      <td className="p-4 font-serif font-bold text-ink max-w-[280px] truncate">{vid.title.fr}</td>
                      <td className="p-4 font-mono font-bold text-emerald-med">{vid.youtubeId}</td>
                      <td className="p-4 text-text-sec uppercase font-mono">{vid.category}</td>
                      <td className="p-4 text-text-sec font-mono">{vid.duration}</td>
                      <td className="p-4 text-text-sec font-mono">{vid.date}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditOpen('video', vid)} className="p-1.5 text-gray-400 hover:text-emerald-main transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => store.deleteVideo(vid.id)} className="p-1.5 text-gray-400 hover:text-red-urge transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CORAN TAB (WITH SUB-VIEW FOR THE 114 SURAHS AUDIOS) */}
        {activeTab === 'coran' && !activeAudioReciter && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-xs font-mono uppercase text-gray-400 font-bold">{store.reciters.length} Récitateurs</span>
              <button 
                onClick={() => handleAddOpen('reciter')}
                className="px-4 py-2 bg-emerald-main hover:bg-emerald-med text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Récitateur
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-100">
                <thead className="bg-gray-50 uppercase font-mono text-gray-400 font-bold">
                  <tr>
                    <th className="p-4">Récitateur</th>
                    <th className="p-4">Nom Arabe</th>
                    <th className="p-4">Style</th>
                    <th className="p-4">Origine</th>
                    <th className="p-4">Code API Alquran</th>
                    <th className="p-4 text-center">Gestion Audios (114)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {store.reciters.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-50">
                      <td className="p-4 font-serif font-bold text-ink flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-cream-main text-emerald-main flex items-center justify-center font-serif text-[10px] font-bold">
                          {rec.initials}
                        </div>
                        {rec.name}
                      </td>
                      <td className="p-4 font-amiri text-sm" dir="rtl">{rec.localName}</td>
                      <td className="p-4 text-text-sec">{rec.style}</td>
                      <td className="p-4 text-text-sec">{rec.origin}</td>
                      <td className="p-4 font-mono text-text-sec">{rec.apiCode}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleOpenReciterAudios(rec)}
                          className="px-3.5 py-1.5 bg-gold-main/15 hover:bg-gold-main/30 text-gold-dark rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 mx-auto"
                        >
                          <Music className="w-3.5 h-3.5" />
                          <span>🎧 Audios</span>
                        </button>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditOpen('reciter', rec)} className="p-1.5 text-gray-400 hover:text-emerald-main transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => store.deleteReciter(rec.id)} className="p-1.5 text-gray-400 hover:text-red-urge transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 114 SURAHS CONFIGURATION SCREEN */}
        {activeTab === 'coran' && activeAudioReciter && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <button 
                  onClick={() => setActiveAudioReciter(null)}
                  className="text-xs text-emerald-med hover:underline font-bold mb-1 block"
                >
                  ← Retourner à la liste des récitateurs
                </button>
                <h3 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-gold-main text-ink flex items-center justify-center text-xs font-bold font-serif">{activeAudioReciter.initials}</span>
                  Audios des 114 sourates pour {activeAudioReciter.name}
                </h3>
              </div>

              <button
                onClick={handleBulkSaveSurahAudios}
                className="px-5 py-2.5 bg-emerald-main hover:bg-emerald-med text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                Sauvegarder tout
              </button>
            </div>

            <div className="bg-cream-main/20 border border-gold-main/10 p-4 rounded-xl text-xs leading-relaxed text-text-sec">
              💡 <strong>Instruction :</strong> Collez un lien direct <strong>MP3</strong> ou un lien de vidéo/audio <strong>YouTube</strong> (ex: <code>https://www.youtube.com/watch?v=...</code>) pour chaque sourate. Si le lien est vide, le système utilisera l'audio par défaut si configuré, ou désactivera l'écoute.
            </div>

            {/* List of 114 surahs */}
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 scrollbar">
              {all114Surahs.map((surah) => {
                const url = audioUrlsEdit[surah.number] || '';
                return (
                  <div key={surah.number} className="p-3 bg-white border border-gray-100 hover:border-gray-200 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-1 text-center font-mono text-xs text-gray-400 font-bold">
                      #{surah.number}
                    </div>
                    <div className="md:col-span-3 text-xs">
                      <p className="font-serif font-bold text-ink">{surah.englishName}</p>
                      <p className="text-[10px] text-gray-400">{surah.frenchName}</p>
                    </div>
                    <div className="md:col-span-2 text-right md:text-center font-amiri text-xs" dir="rtl">
                      {surah.name}
                    </div>
                    <div className="md:col-span-6 flex gap-2">
                      <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setAudioUrlsEdit(prev => ({ ...prev, [surah.number]: e.target.value }))}
                        placeholder="Ex: https://example.com/audio.mp3 ou lien YouTube"
                        className="flex-grow px-3 py-1.5 bg-cream-main/40 text-xs text-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-main placeholder-gray-400"
                      />
                      {url && (
                        <button 
                          onClick={() => handleSaveSurahAudio(surah.number, '')}
                          className="p-1.5 text-gray-400 hover:text-red-urge transition-colors"
                          title="Effacer le lien"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-xs font-mono uppercase text-gray-400 font-bold">{store.quizzes.length} Quiz</span>
              <button 
                onClick={() => handleAddOpen('quiz')}
                className="px-4 py-2 bg-emerald-main hover:bg-emerald-med text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Créer un Quiz
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-100">
                <thead className="bg-gray-50 uppercase font-mono text-gray-400 font-bold">
                  <tr>
                    <th className="p-4">Titre (Fr)</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Difficulté</th>
                    <th className="p-4 text-center">Questions</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {store.quizzes.map(qz => (
                    <tr key={qz.id} className="hover:bg-gray-50">
                      <td className="p-4 font-serif font-bold text-ink max-w-[280px] truncate">{qz.title.fr}</td>
                      <td className="p-4 text-text-sec uppercase font-mono">{qz.category}</td>
                      <td className="p-4 text-text-sec capitalize">{qz.difficulty}</td>
                      <td className="p-4 text-center font-mono font-bold">{qz.questionsCount}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditOpen('quiz', qz)} className="p-1.5 text-gray-400 hover:text-emerald-main transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => store.deleteQuiz(qz.id)} className="p-1.5 text-gray-400 hover:text-red-urge transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DONORS TAB (FILTERS + CSV EXPORT) */}
        {activeTab === 'donors' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
              
              {/* Campaign Filter Selector */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-bold text-text-sec uppercase">Filtrer par campagne :</span>
                <select
                  value={donorCampaignFilter}
                  onChange={(e) => setDonorCampaignFilter(e.target.value)}
                  className="px-3.5 py-2 bg-cream-main border border-gray-100 text-ink rounded-lg font-sans text-xs focus:outline-none focus:ring-1 focus:ring-gold-main"
                >
                  {uniqueCampaigns.map(camp => (
                    <option key={camp} value={camp}>{camp}</option>
                  ))}
                </select>
              </div>

              {/* CSV download button */}
              <button
                onClick={downloadDonorsCSV}
                className="px-4.5 py-2.5 bg-emerald-main hover:bg-emerald-med text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Exporter en CSV (; UTF-8)</span>
              </button>

            </div>

            {/* Donors Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-100">
                <thead className="bg-gray-50 uppercase font-mono text-gray-400 font-bold">
                  <tr>
                    <th className="p-4">Donateur</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Montant versé</th>
                    <th className="p-4">Date du don</th>
                    <th className="p-4">Campagne cible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {store.donors
                    .filter(d => donorCampaignFilter === 'All' || d.project === donorCampaignFilter)
                    .map(donor => (
                      <tr key={donor.id} className="hover:bg-gray-50">
                        <td className="p-4 font-serif font-bold text-ink">{donor.name}</td>
                        <td className="p-4 font-mono text-text-sec">{donor.email}</td>
                        <td className="p-4 font-mono font-bold text-emerald-main">+{donor.amount} €</td>
                        <td className="p-4 text-text-sec font-mono">{donor.date}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 bg-cream-main text-text-sec rounded text-[10px] font-bold font-sans">
                            {donor.project}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {store.donors.filter(d => donorCampaignFilter === 'All' || d.project === donorCampaignFilter).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 text-xs font-sans">
                        Aucun donateur trouvé pour cette campagne d'aide.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* CRUD MANAGEMENT OVERLAY MODALS */}
      <AnimatePresence>
        {crudModal && (
          <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6"
            >
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-serif font-bold text-ink">
                  {crudModal.action === 'add' ? 'Ajouter' : 'Modifier'} un{' '}
                  {crudModal.type === 'ebook' && 'Ebook'}
                  {crudModal.type === 'article' && 'Article de Blog'}
                  {crudModal.type === 'video' && 'Vidéo YouTube'}
                  {crudModal.type === 'reciter' && 'Récitateur'}
                  {crudModal.type === 'quiz' && 'Quiz'}
                </h3>
                <button 
                  onClick={() => setCrudModal(null)}
                  className="p-1 text-gray-400 hover:text-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveCrud} className="space-y-5 text-xs">
                
                {/* EBOOK FIELDS */}
                {crudModal.type === 'ebook' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (FR)</label>
                        <input type="text" value={ebTitleFr} onChange={e => setEbTitleFr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (EN)</label>
                        <input type="text" value={ebTitleEn} onChange={e => setEbTitleEn(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (AR)</label>
                        <input type="text" value={ebTitleAr} onChange={e => setEbTitleAr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Description (FR)</label>
                        <textarea value={ebDescFr} onChange={e => setEbDescFr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-20" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Description (EN)</label>
                        <textarea value={ebDescEn} onChange={e => setEbDescEn(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-20" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Description (AR)</label>
                        <textarea value={ebDescAr} onChange={e => setEbDescAr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-20 text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Auteur</label>
                        <input type="text" value={ebAuthor} onChange={e => setEbAuthor(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Catégorie</label>
                        <select value={ebCategory} onChange={e => setEbCategory(e.target.value as any)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
                          <option value="coran">Coran</option>
                          <option value="fiqh">Fiqh</option>
                          <option value="histoire">Histoire</option>
                          <option value="spiritualite">Spiritualité</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Type</label>
                        <select value={ebIsFree ? 'free' : 'paid'} onChange={e => setEbIsFree(e.target.value === 'free')} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
                          <option value="free">Gratuit</option>
                          <option value="paid">Payant (Soutien)</option>
                        </select>
                      </div>
                      {!ebIsFree && (
                        <div>
                          <label className="font-bold text-text-sec uppercase mb-1 block">Prix (€)</label>
                          <input type="number" value={ebPrice} onChange={e => setEbPrice(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none font-mono" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Badge (FR)</label>
                        <input type="text" value={ebBadgeFr} onChange={e => setEbBadgeFr(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Badge (EN)</label>
                        <input type="text" value={ebBadgeEn} onChange={e => setEbBadgeEn(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Badge (AR)</label>
                        <input type="text" value={ebBadgeAr} onChange={e => setEbBadgeAr(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-right font-amiri" dir="rtl" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ARTICLE FIELDS */}
                {crudModal.type === 'article' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Catégorie (FR)</label>
                        <input type="text" value={artCatFr} onChange={e => setArtCatFr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Catégorie (EN)</label>
                        <input type="text" value={artCatEn} onChange={e => setArtCatEn(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Catégorie (AR)</label>
                        <input type="text" value={artCatAr} onChange={e => setArtCatAr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (FR)</label>
                        <input type="text" value={artTitleFr} onChange={e => setArtTitleFr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (EN)</label>
                        <input type="text" value={artTitleEn} onChange={e => setArtTitleEn(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (AR)</label>
                        <input type="text" value={artTitleAr} onChange={e => setArtTitleAr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Extrait (FR)</label>
                        <textarea value={artExcFr} onChange={e => setArtExcFr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-14" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Extrait (EN)</label>
                        <textarea value={artExcEn} onChange={e => setArtExcEn(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-14" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Extrait (AR)</label>
                        <textarea value={artExcAr} onChange={e => setArtExcAr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-14 text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Contenu complet (FR)</label>
                        <textarea value={artContFr} onChange={e => setArtContFr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-28" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Contenu complet (EN)</label>
                        <textarea value={artContEn} onChange={e => setArtContEn(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-28" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Contenu complet (AR)</label>
                        <textarea value={artContAr} onChange={e => setArtContAr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-28 text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Temps de lecture</label>
                        <input type="text" value={artReadTime} onChange={e => setArtReadTime(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Image d'illustration (URL)</label>
                        <input type="text" value={artImage} onChange={e => setArtImage(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input type="checkbox" id="artFeat" checked={artFeatured} onChange={e => setArtFeatured(e.target.checked)} className="accent-emerald-main" />
                        <label htmlFor="artFeat" className="font-bold text-text-sec uppercase">Mettre en vedette (Phare)</label>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIDEO FIELDS */}
                {crudModal.type === 'video' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">ID de la Vidéo YouTube</label>
                        <input type="text" value={vidYtId} onChange={e => setVidYtId(e.target.value)} placeholder="Ex: u_m9W8B0_8c" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none font-mono" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Durée de la vidéo</label>
                        <input type="text" value={vidDuration} onChange={e => setVidDuration(e.target.value)} placeholder="Ex: 24:15" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none font-mono" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (FR)</label>
                        <input type="text" value={vidTitleFr} onChange={e => setVidTitleFr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (EN)</label>
                        <input type="text" value={vidTitleEn} onChange={e => setVidTitleEn(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (AR)</label>
                        <input type="text" value={vidTitleAr} onChange={e => setVidTitleAr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-text-sec uppercase mb-1 block">Catégorie</label>
                      <select value={vidCategory} onChange={e => setVidCategory(e.target.value as any)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
                        <option value="geopolitique">Géopolitique</option>
                        <option value="education">Éducation / Spiritualité</option>
                        <option value="histoires">Histoires des Prophètes</option>
                        <option value="analyse">Analyse critique</option>
                        <option value="ramadan">Ramadan</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* RECITER FIELDS */}
                {crudModal.type === 'reciter' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Nom du Sheikh (Translitéré)</label>
                        <input type="text" value={recName} onChange={e => setRecName(e.target.value)} placeholder="Ex: Sheikh Saad Al-Ghamdi" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Nom en Arabe</label>
                        <input type="text" value={recLocalName} onChange={e => setRecLocalName(e.target.value)} placeholder="الشيخ سعد الغامدي" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Style de récitation</label>
                        <input type="text" value={recStyle} onChange={e => setRecStyle(e.target.value)} placeholder="Ex: Murattal / Pace" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Origine & Drapeau</label>
                        <input type="text" value={recOrigin} onChange={e => setRecOrigin(e.target.value)} placeholder="Saudi Arabia 🇸🇦" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Code API Réseau (Alquran.cloud)</label>
                        <input type="text" value={recApiCode} onChange={e => setRecApiCode(e.target.value)} placeholder="ar.ghaamidi" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none font-mono" />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-text-sec uppercase mb-1 block">Initiales (Laisser vide pour auto)</label>
                      <input type="text" value={recInitials} onChange={e => setRecInitials(e.target.value)} placeholder="Ex: SG" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none font-mono uppercase" />
                    </div>
                  </div>
                )}

                {/* QUIZ FIELDS & QUESTION BUILDER */}
                {crudModal.type === 'quiz' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (FR)</label>
                        <input type="text" value={quizTitleFr} onChange={e => setQuizTitleFr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (EN)</label>
                        <input type="text" value={quizTitleEn} onChange={e => setQuizTitleEn(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Titre (AR)</label>
                        <input type="text" value={quizTitleAr} onChange={e => setQuizTitleAr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Description (FR)</label>
                        <textarea value={quizDescFr} onChange={e => setQuizDescFr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-14" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Description (EN)</label>
                        <textarea value={quizDescEn} onChange={e => setQuizDescEn(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-14" />
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Description (AR)</label>
                        <textarea value={quizDescAr} onChange={e => setQuizDescAr(e.target.value)} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none h-14 text-right font-amiri" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Difficulté</label>
                        <select value={quizDifficulty} onChange={e => setQuizDifficulty(e.target.value as any)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
                          <option value="debutant">Débutant</option>
                          <option value="intermediaire">Intermédiaire</option>
                          <option value="avance">Avancé</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-text-sec uppercase mb-1 block">Catégorie</label>
                        <select value={quizCategory} onChange={e => setQuizCategory(e.target.value as any)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
                          <option value="coran">Coran & Exégèse</option>
                          <option value="prophetes">Sira & Prophètes</option>
                          <option value="piliers">Piliers de l'Islam</option>
                          <option value="hadiths">Hadiths prophétiques</option>
                          <option value="histoire">Histoire islamique</option>
                        </select>
                      </div>
                    </div>

                    {/* Question List View in form */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <h4 className="font-serif font-bold text-ink">Questions configurées ({quizQuestions.length})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {quizQuestions.map((q, i) => (
                          <div key={q.id} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200 text-[11px]">
                            <span className="truncate flex-grow font-semibold">{i+1}. {q.question.fr}</span>
                            <button type="button" onClick={() => handleRemoveQuestionFromQuiz(i)} className="text-red-urge font-bold hover:underline">Supprimer</button>
                          </div>
                        ))}
                      </div>

                      {/* Question builder panel */}
                      <div className="border-t border-gray-200 pt-3 space-y-3">
                        <p className="font-serif font-bold text-[11px] text-gold-dark">➕ Construire une question</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input type="text" placeholder="Question en français" value={qQuestFr} onChange={e => setQQuestFr(e.target.value)} className="p-2 bg-white border border-gray-200 rounded-lg" />
                          <input type="text" placeholder="Question en anglais" value={qQuestEn} onChange={e => setQQuestEn(e.target.value)} className="p-2 bg-white border border-gray-200 rounded-lg" />
                          <input type="text" placeholder="Question en arabe" value={qQuestAr} onChange={e => setQQuestAr(e.target.value)} className="p-2 bg-white border border-gray-200 rounded-lg text-right font-amiri" dir="rtl" />
                        </div>

                        {/* Options mapping */}
                        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100">
                          <p className="font-bold text-[10px] uppercase text-text-sec">Options de réponse (Remplir les 4)</p>
                          {[0, 1, 2, 3].map(optIdx => (
                            <div key={optIdx} className="grid grid-cols-1 md:grid-cols-3 gap-1.5 items-center">
                              <input type="text" placeholder={`Option ${optIdx+1} (FR)`} value={qOptFr[optIdx]} onChange={e => {
                                const copy = [...qOptFr]; copy[optIdx] = e.target.value; setQOptFr(copy);
                              }} className="p-1.5 bg-gray-50 border border-gray-200 rounded text-[11px]" />
                              
                              <input type="text" placeholder={`Option ${optIdx+1} (EN)`} value={qOptEn[optIdx]} onChange={e => {
                                const copy = [...qOptEn]; copy[optIdx] = e.target.value; setQOptEn(copy);
                              }} className="p-1.5 bg-gray-50 border border-gray-200 rounded text-[11px]" />

                              <input type="text" placeholder={`Option ${optIdx+1} (AR)`} value={qOptAr[optIdx]} onChange={e => {
                                const copy = [...qOptAr]; copy[optIdx] = e.target.value; setQOptAr(copy);
                              }} className="p-1.5 bg-gray-50 border border-gray-200 rounded text-[11px] text-right font-amiri" dir="rtl" />
                            </div>
                          ))}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="font-bold text-[10px] text-text-sec uppercase block mb-1">Index de la bonne réponse</label>
                              <select value={qCorrectIdx} onChange={e => setQCorrectIdx(parseInt(e.target.value))} className="p-1.5 bg-gray-50 border border-gray-200 rounded text-[11px] w-full">
                                <option value={0}>Option A (1)</option>
                                <option value={1}>Option B (2)</option>
                                <option value={2}>Option C (3)</option>
                                <option value={3}>Option D (4)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Explanations mapping */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input type="text" placeholder="Explication (FR)" value={qExplFr} onChange={e => setQExplFr(e.target.value)} className="p-2 bg-white border border-gray-200 rounded-lg text-[11px]" />
                          <input type="text" placeholder="Explication (EN)" value={qExplEn} onChange={e => setQExplEn(e.target.value)} className="p-2 bg-white border border-gray-200 rounded-lg text-[11px]" />
                          <input type="text" placeholder="Explication (AR)" value={qExplAr} onChange={e => setQExplAr(e.target.value)} className="p-2 bg-white border border-gray-200 rounded-lg text-[11px] text-right font-amiri" dir="rtl" />
                        </div>

                        <button 
                          type="button" 
                          onClick={handleAddQuestionToQuiz}
                          className="w-full py-2 bg-gold-main text-ink hover:bg-gold-light rounded-lg text-[11px] font-bold"
                        >
                          Ajouter la question construite à la liste
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="border-t border-gray-100 pt-4 flex justify-end gap-3.5">
                  <button 
                    type="button"
                    onClick={() => setCrudModal(null)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl font-bold font-serif"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-main hover:bg-emerald-med text-white rounded-xl font-bold font-serif flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
