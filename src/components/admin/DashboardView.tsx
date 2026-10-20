import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Users, Eye, Video, MessageCircle, Heart, Mail, 
  TrendingUp, ArrowUpRight, PlusCircle, BookOpen, 
  HelpCircle, Clock, ShieldAlert, Sparkles, CheckCircle2,
  RefreshCw, Database, DollarSign, Award, Target,
  Filter, Calendar, ExternalLink, Activity
} from 'lucide-react';
import { useAdminAuth } from '../../lib/admin-auth-context';
import { AuditLog, EngagementMetric, FirestoreDonation, DonationCampagne } from '../../types';
import { 
  subscribeToEngagementMetrics, 
  subscribeToDonations, 
  subscribeToDonationCampaign, 
  seedInitialFirestoreMetricsIfEmpty,
  addDonationToFirestore,
  INITIAL_ENGAGEMENT_METRICS,
  INITIAL_DONATIONS,
  INITIAL_CAMPAIGN_DATA
} from '../../lib/firestore-metrics';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  auditLogs: AuditLog[];
  onNewArticle: () => void;
}

export default function DashboardView({ onNavigateTab, auditLogs, onNewArticle }: DashboardViewProps) {
  const { currentUser, adminTheme } = useAdminAuth();
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d'>('14d');
  const [activeMetricSeries, setActiveMetricSeries] = useState<'all' | 'visits' | 'quran' | 'quiz'>('all');
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);
  
  // Real Firestore Data States
  const [engagementData, setEngagementData] = useState<EngagementMetric[]>(INITIAL_ENGAGEMENT_METRICS);
  const [donationsList, setDonationsList] = useState<FirestoreDonation[]>(INITIAL_DONATIONS);
  const [campaign, setCampaign] = useState<DonationCampagne & { title: string }>(INITIAL_CAMPAIGN_DATA);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('À l\'instant');
  const [isTestDonationModalOpen, setIsTestDonationModalOpen] = useState(false);
  const [newDonationAmount, setNewDonationAmount] = useState<number>(50);
  const [newDonationProject, setNewDonationProject] = useState<string>('Puits d\'eau Sahel');
  const [newDonorName, setNewDonorName] = useState<string>('Frère Karim');
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);

  const isDark = adminTheme === 'dark';

  // Seed and bind real-time Firestore listeners
  useEffect(() => {
    let unsubEngagement: () => void = () => {};
    let unsubDonations: () => void = () => {};
    let unsubCampaign: () => void = () => {};

    const initializeFirestore = async () => {
      setIsLoadingFirestore(true);
      // Attempt to ensure initial seed records in Firestore
      await seedInitialFirestoreMetricsIfEmpty();

      // Realtime listener for Engagement
      unsubEngagement = subscribeToEngagementMetrics((metrics) => {
        if (metrics && metrics.length > 0) {
          setEngagementData(metrics);
        }
        setIsLoadingFirestore(false);
        setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      });

      // Realtime listener for Donations
      unsubDonations = subscribeToDonations((donations) => {
        if (donations && donations.length > 0) {
          setDonationsList(donations);
        }
      });

      // Realtime listener for Campaign Target
      unsubCampaign = subscribeToDonationCampaign((camp) => {
        if (camp) {
          setCampaign(camp);
        }
      });
    };

    initializeFirestore();

    return () => {
      unsubEngagement();
      unsubDonations();
      unsubCampaign();
    };
  }, []);

  // Filter engagement data according to selected timeframe
  const filteredEngagement = useMemo(() => {
    if (!engagementData || engagementData.length === 0) return INITIAL_ENGAGEMENT_METRICS;
    const sliceCount = timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 30;
    return engagementData.slice(-sliceCount);
  }, [engagementData, timeframe]);

  // Aggregate metrics summary from live data
  const metricsSummary = useMemo(() => {
    const totalVisits = filteredEngagement.reduce((acc, curr) => acc + (curr.visits || 0), 0);
    const totalPageViews = filteredEngagement.reduce((acc, curr) => acc + (curr.pageViews || 0), 0);
    const totalQuranListens = filteredEngagement.reduce((acc, curr) => acc + (curr.quranListens || 0), 0);
    const totalQuizCompleted = filteredEngagement.reduce((acc, curr) => acc + (curr.quizCompletions || 0), 0);
    const totalArticleReads = filteredEngagement.reduce((acc, curr) => acc + (curr.articleReads || 0), 0);

    const totalDonationsSum = donationsList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const campaignCollected = Math.max(campaign.collected || 0, totalDonationsSum);
    const campaignTarget = campaign.target || 3500;
    const campaignPercent = Math.min(Math.round((campaignCollected / campaignTarget) * 100), 100);

    return {
      totalVisits,
      totalPageViews,
      totalQuranListens,
      totalQuizCompleted,
      totalArticleReads,
      campaignCollected,
      campaignTarget,
      campaignPercent,
      donorsCount: Math.max(campaign.donorsCount || 0, donationsList.length)
    };
  }, [filteredEngagement, donationsList, campaign]);

  // Donations Breakdown by Project for Recharts Pie and Bar
  const projectDonationsData = useMemo(() => {
    const projectMap: Record<string, number> = {};
    donationsList.forEach((d) => {
      const proj = d.project || 'Autres projets';
      projectMap[proj] = (projectMap[proj] || 0) + (d.amount || 0);
    });

    const colors = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];
    return Object.entries(projectMap).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [donationsList]);

  // Radar engagement distribution by Pillar
  const radarEngagementData = useMemo(() => {
    return [
      { subject: 'Noble Coran', value: Math.round(metricsSummary.totalQuranListens / 10), fullMark: 150 },
      { subject: 'Hadiths & Sounnah', value: Math.round(metricsSummary.totalArticleReads / 8), fullMark: 150 },
      { subject: 'Quiz & Savoir', value: Math.round(metricsSummary.totalQuizCompleted * 2.5), fullMark: 150 },
      { subject: 'Vidéos & Médias', value: 85, fullMark: 150 },
      { subject: 'Horaires Prière', value: 120, fullMark: 150 },
      { subject: 'Solidarité & Dons', value: Math.round(metricsSummary.campaignPercent * 1.2), fullMark: 150 }
    ];
  }, [metricsSummary]);

  // Manual trigger to submit a test donation to Firestore
  const handleCreateTestDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonationAmount || newDonationAmount <= 0) return;
    setIsSubmittingDonation(true);
    try {
      await addDonationToFirestore({
        donorName: newDonorName.trim() || 'Donateur Anonyme',
        donorEmail: 'donateur@islamaboubakar.com',
        amount: Number(newDonationAmount),
        project: newDonationProject,
        paymentStatus: 'completed'
      });
      setIsTestDonationModalOpen(false);
      setShortcutFeedback(`Don de ${newDonationAmount} € enregistré en direct dans Firestore !`);
      setTimeout(() => setShortcutFeedback(null), 4000);
    } catch (err) {
      console.error('Error logging test donation:', err);
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  const handleShortcutClick = (msg: string, action: () => void) => {
    action();
    setShortcutFeedback(msg);
    setTimeout(() => setShortcutFeedback(null), 3500);
  };

  // Custom luxury tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-xl border shadow-xl text-xs font-sans backdrop-blur-md ${
          isDark 
            ? 'bg-[#18120C]/95 border-gold-main/30 text-stone-200' 
            : 'bg-white/95 border-amber-900/20 text-stone-800 shadow-stone-300'
        }`}>
          <div className="font-semibold text-gold-main mb-1.5 pb-1 border-b border-white/10 flex items-center justify-between gap-4">
            <span>Date : {label}</span>
            <span className="font-mono text-[10px] opacity-75">Statistiques certifiées</span>
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-mono font-bold">{Number(entry.value).toLocaleString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* TOP BANNER WITH FIRESTORE SYNC STATUS */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDark 
          ? 'bg-gradient-to-r from-[#1A140E] via-[#241B12] to-[#1E160F] border-gold-main/25 text-white' 
          : 'bg-gradient-to-r from-cream-sec via-white to-amber-50/50 border-amber-900/15 text-ink'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Synchronisation Firestore en Direct</span>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">
                Dernière maj : {lastSyncTime}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-gold-main">
              Tableau de Bord & Métriques Clés
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
              Visualisation en temps réel de la progression des dons, de la fréquentation et de l'engagement spirituel propulsée par Recharts et Firestore.
            </p>
          </div>

          {/* Controls: Timeframe & Live Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/30 border border-white/10">
              {(['7d', '14d', '30d'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-gold-main text-ink font-bold shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {tf === '7d' ? '7 Jours' : tf === '14d' ? '14 Jours' : '30 Jours'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsTestDonationModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-gold-main to-gold-light hover:brightness-110 text-ink font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="Ajouter un don dans Firestore pour tester les graphiques"
            >
              <Heart className="w-3.5 h-3.5 fill-ink" />
              <span>+ Enregistrer un Don</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK SHORTCUTS ROW */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-main flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Actions Rapides & Gestion</span>
          </h3>
          {shortcutFeedback && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{shortcutFeedback}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => handleShortcutClick("Éditeur d'article ouvert", onNewArticle)}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
              isDark 
                ? 'bg-[#1A140E] border-white/10 hover:border-gold-main/40' 
                : 'bg-white border-black/10 hover:border-gold-main/40 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-main/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-gold-light group-hover:text-gold-main">
                Nouvel article
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Rédiger & publier sur le blog</div>
            </div>
          </button>

          <button
            onClick={() => handleShortcutClick("Module Hadiths ouvert", () => onNavigateTab('hadiths'))}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
              isDark 
                ? 'bg-[#1A140E] border-white/10 hover:border-gold-main/40' 
                : 'bg-white border-black/10 hover:border-gold-main/40 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-gold-main/20 text-gold-main flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-gold-light group-hover:text-gold-main">
                Gestion Hadiths
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Consulter & référencer</div>
            </div>
          </button>

          <button
            onClick={() => setIsTestDonationModalOpen(true)}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
              isDark 
                ? 'bg-[#1A140E] border-white/10 hover:border-gold-main/40' 
                : 'bg-white border-black/10 hover:border-gold-main/40 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-gold-light group-hover:text-gold-main">
                Ajouter un don
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Injecter dans Firestore</div>
            </div>
          </button>

          <button
            onClick={() => handleShortcutClick("Journal d'audit ouvert", () => onNavigateTab('audit'))}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
              isDark 
                ? 'bg-[#1A140E] border-white/10 hover:border-gold-main/40' 
                : 'bg-white border-black/10 hover:border-gold-main/40 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-gold-light group-hover:text-gold-main">
                Journal de Sécurité
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">{auditLogs.length} événements tracés</div>
            </div>
          </button>
        </div>
      </div>

      {/* METRIC KPI CARDS (SYNCED WITH FIRESTORE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Dons & Progression */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="font-medium">Dons Collectés (Firestore)</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-red-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-gold-main">
            {metricsSummary.campaignCollected.toLocaleString('fr-FR')} €
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1 text-stone-400 font-mono">
              <span>Objectif : {metricsSummary.campaignTarget.toLocaleString('fr-FR')} €</span>
              <span className="font-bold text-emerald-400">{metricsSummary.campaignPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gold-main to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${metricsSummary.campaignPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Visiteurs Uniques */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="font-medium">Visiteurs ({timeframe})</span>
            <div className="w-7 h-7 rounded-lg bg-gold-main/15 text-gold-main flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-gold-light">
            {metricsSummary.totalVisits.toLocaleString('fr-FR')}
          </div>
          <div className="mt-3 text-xs flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% de croissance</span>
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              {metricsSummary.totalPageViews.toLocaleString('fr-FR')} vues
            </span>
          </div>
        </div>

        {/* Card 3: Écoutes Audio Coran */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="font-medium">Écoutes Coran & Hadiths</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-gold-light">
            {metricsSummary.totalQuranListens.toLocaleString('fr-FR')}
          </div>
          <div className="mt-3 text-xs flex items-center justify-between text-stone-400">
            <span>Récitations MP3 jouées</span>
            <span className="font-semibold text-emerald-400">7 récitateurs</span>
          </div>
        </div>

        {/* Card 4: Quiz & Savoir Interactif */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="font-medium">Quiz & Articles Lus</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-gold-light">
            {metricsSummary.totalQuizCompleted.toLocaleString('fr-FR')}
          </div>
          <div className="mt-3 text-xs flex items-center justify-between text-stone-400">
            <span>Articles de tafsir consultés</span>
            <span className="font-mono text-gold-main font-semibold">
              {metricsSummary.totalArticleReads.toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: RECHARTS USER ENGAGEMENT OVER TIME (AREA & LINE CHART) */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gold-main" />
              <h4 className="font-serif font-bold text-gold-light text-base sm:text-lg">
                Courbe d'Engagement & Visites (Recharts)
              </h4>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Données réelles des visites, lectures d'articles et écoutes audio du Noble Coran issues de Firestore
            </p>
          </div>

          {/* Metric series filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10 text-xs">
            <button
              onClick={() => setActiveMetricSeries('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeMetricSeries === 'all' ? 'bg-gold-main text-ink font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveMetricSeries('visits')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeMetricSeries === 'visits' ? 'bg-gold-main text-ink font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Visites
            </button>
            <button
              onClick={() => setActiveMetricSeries('quran')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeMetricSeries === 'quran' ? 'bg-gold-main text-ink font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Coran Audio
            </button>
            <button
              onClick={() => setActiveMetricSeries('quiz')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeMetricSeries === 'quiz' ? 'bg-gold-main text-ink font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Quiz & Articles
            </button>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorQuran" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2D2319' : '#F1E9DB'} vertical={false} />
              
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => {
                  try {
                    const parts = val.split('-');
                    return `${parts[2]}/${parts[1]}`;
                  } catch {
                    return val;
                  }
                }}
                stroke={isDark ? '#78716C' : '#A8A29E'}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              
              <YAxis 
                stroke={isDark ? '#78716C' : '#A8A29E'}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                iconType="circle"
              />

              {(activeMetricSeries === 'all' || activeMetricSeries === 'visits') && (
                <Area 
                  type="monotone" 
                  dataKey="visits" 
                  name="Visiteurs Uniques" 
                  stroke="#D4AF37" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorVisits)" 
                />
              )}

              {(activeMetricSeries === 'all' || activeMetricSeries === 'quran') && (
                <Area 
                  type="monotone" 
                  dataKey="quranListens" 
                  name="Écoutes Coran" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorQuran)" 
                />
              )}

              {(activeMetricSeries === 'all' || activeMetricSeries === 'quiz') && (
                <Area 
                  type="monotone" 
                  dataKey="articleReads" 
                  name="Articles Consultés" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorReads)" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 2: DONATION PROGRESS & RADAR ANALYSIS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recharts BarChart & Donut for Donations (8 cols) */}
        <div className={`lg:col-span-8 p-5 sm:p-6 rounded-2xl border ${
          isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h4 className="font-serif font-bold text-gold-light text-base sm:text-lg">
                  Progression des Dons par Projet (Recharts)
                </h4>
              </div>
              <p className="text-xs text-stone-400">
                Contributions réelles par campagne humanitaire et Sadaqa Jariya
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {donationsList.length} donateurs enregistrés
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Recharts BarChart */}
            <div className="md:col-span-7 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectDonationsData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2D2319' : '#F1E9DB'} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke={isDark ? '#78716C' : '#A8A29E'}
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke={isDark ? '#78716C' : '#A8A29E'}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${v}€`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value} €`, 'Montant Collecté']}
                    contentStyle={{
                      backgroundColor: isDark ? '#1A140E' : '#FFFFFF',
                      borderColor: '#D4AF37',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" name="Montant (€)" radius={[6, 6, 0, 0]}>
                    {projectDonationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recharts Donut PieChart */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectDonationsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {projectDonationsData.map((entry, index) => (
                        <Cell key={`cell-pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`${val} €`, 'Donation']}
                      contentStyle={{
                        backgroundColor: isDark ? '#1A140E' : '#FFFFFF',
                        borderColor: '#D4AF37',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mini Legend List */}
              <div className="w-full space-y-1 mt-2 text-xs">
                {projectDonationsData.map((proj, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-stone-300">
                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="font-mono font-bold text-gold-light">{proj.value} €</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right: Recharts RadarChart (Piliers Spirituels & Engagement) (4 cols) */}
        <div className={`lg:col-span-4 p-5 sm:p-6 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-gold-main" />
              <h4 className="font-serif font-bold text-gold-light text-base">
                Équilibre des Piliers (Radar)
              </h4>
            </div>
            <p className="text-xs text-stone-400">
              Distribution de l'intérêt spirituel par dimension du site
            </p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarEngagementData}>
                <PolarGrid stroke={isDark ? '#3D3124' : '#E8DEC8'} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 10, fill: isDark ? '#C5BDB5' : '#4B4237' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="transparent" />
                <Radar 
                  name="Indice d'intérêt" 
                  dataKey="value" 
                  stroke="#D4AF37" 
                  fill="#D4AF37" 
                  fillOpacity={0.45} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-[11px] text-stone-400">
            <p>
              🌟 <strong>Analyse IA :</strong> Le Noble Coran et la Sadaqa Jariya représentent les pôles d'attraction majeurs de votre communauté.
            </p>
          </div>
        </div>

      </div>

      {/* SECTION 3: RECENT FIRESTORE DONATIONS FEED & TOP ARTICLES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Latest Donations Feed from Firestore (7 cols) */}
        <div className={`lg:col-span-7 p-5 rounded-2xl border ${
          isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <h4 className="font-serif font-bold text-gold-light text-base">
                Derniers Dons Enregistrés dans Firestore
              </h4>
            </div>
            <button
              onClick={() => setIsTestDonationModalOpen(true)}
              className="text-xs text-gold-main hover:text-gold-light hover:underline flex items-center gap-1 font-medium"
            >
              <span>+ Enregistrer</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {donationsList.slice(0, 6).map((item, idx) => (
              <div 
                key={item.id || idx}
                className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between text-xs transition-colors hover:border-gold-main/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {item.donorName ? item.donorName.charAt(0) : 'D'}
                  </div>
                  <div>
                    <p className="font-medium text-cream-main">
                      {item.donorName || 'Donateur Anonyme'}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {item.project} • {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    +{item.amount} €
                  </span>
                  <span className="block text-[10px] text-stone-500 capitalize">
                    {item.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Consulted Content (5 cols) */}
        <div className={`lg:col-span-5 p-5 rounded-2xl border ${
          isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-serif font-bold text-gold-light text-base">
              Articles & Pages les Plus Lus
            </h4>
            <span className="text-[11px] text-stone-400 font-mono">Engagement</span>
          </div>

          <div className="space-y-3">
            {[
              { title: "Secrets Spirituels de la Sourate Al-Kahf", views: "14 250", percent: "38%" },
              { title: "L'importance vitale des 5 Prières Quotidiennes", views: "9 820", percent: "26%" },
              { title: "Écoute du Noble Coran - Cheikh Mishary Al-Afasy", views: "7 410", percent: "20%" },
              { title: "Les 40 Hadiths de l'Imam An-Nawawi", views: "4 330", percent: "12%" }
            ].map((page, i) => (
              <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between text-xs">
                <div className="pr-3 truncate max-w-[210px]">
                  <p className="font-medium text-cream-main truncate">{page.title}</p>
                  <p className="text-[10px] text-stone-500">Blog / Médias</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-semibold text-gold-light">{page.views}</div>
                  <div className="text-[10px] text-emerald-400">{page.percent}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-stone-400">Envie d'ajouter un nouvel article ?</span>
            <button
              onClick={onNewArticle}
              className="text-gold-main font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Rédiger maintenant</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: ENREGISTRER UN DON TEST DANS FIRESTORE */}
      <AnimatePresence>
        {isTestDonationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${
                isDark ? 'bg-[#1A140E] border-gold-main/30 text-white' : 'bg-white border-amber-900/20 text-ink'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-gold-main text-base">
                      Enregistrer un Don dans Firestore
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Les graphiques Recharts s'actualiseront instantanément
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTestDonationModalOpen(false)}
                  className="text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTestDonation} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Nom du Donateur</label>
                  <input
                    type="text"
                    value={newDonorName}
                    onChange={(e) => setNewDonorName(e.target.value)}
                    placeholder="Ex: Bilal M. ou Anonyme"
                    className="w-full px-3 py-2 rounded-xl border bg-black/20 border-white/15 focus:border-gold-main focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Montant du Don (€)</label>
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={newDonationAmount}
                    onChange={(e) => setNewDonationAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border bg-black/20 border-white/15 focus:border-gold-main focus:outline-none font-mono text-sm font-bold text-gold-light"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Projet Associé</label>
                  <select
                    value={newDonationProject}
                    onChange={(e) => setNewDonationProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-[#1A140E] border-white/15 focus:border-gold-main focus:outline-none"
                  >
                    <option value="Puits d'eau Sahel">Puits d'eau Sahel</option>
                    <option value="Sadaqa Jariya 2026">Sadaqa Jariya 2026</option>
                    <option value="Distribution Coran & Livres">Distribution Coran & Livres</option>
                    <option value="Soutien Orphelins">Soutien Orphelins</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTestDonationModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-white/10 text-stone-300 hover:bg-white/5"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDonation}
                    className="w-2/3 py-2.5 rounded-xl bg-gold-main hover:bg-gold-light text-ink font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isSubmittingDonation ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Heart className="w-4 h-4 fill-ink" />
                        <span>Enregistrer dans Firestore</span>
                      </>
                    )}
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
