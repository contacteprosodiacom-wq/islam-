import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Copy, Eye, History, RotateCcw, 
  Search, Filter, CheckCircle2, AlertTriangle, Save, 
  X, Calendar, Sparkles, Globe, Share2, Tag, BookOpen, 
  FileText, Bold, Italic, Heading, Quote, List, ExternalLink 
} from 'lucide-react';
import { useAdminAuth } from '../../lib/admin-auth-context';
import { AdminArticleItem, ArticleVersion, TrashItem } from '../../types';
import { blogArticles } from '../../data/blog';
import { db, recordAuditLog } from '../../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';

interface ArticlesManagerProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  openNewArticleSignal?: boolean;
}

export default function ArticlesManager({ onNotify, openNewArticleSignal }: ArticlesManagerProps) {
  const { currentUser, adminTheme } = useAdminAuth();
  const isDark = adminTheme === 'dark';

  // Articles & Revisions state
  const [articles, setArticles] = useState<AdminArticleItem[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [versions, setVersions] = useState<Record<string, ArticleVersion[]>>({});
  
  // UI views
  const [viewMode, setViewMode] = useState<'list' | 'editor' | 'trash'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'publie' | 'brouillon' | 'programme'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Active Editor State
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<AdminArticleItem, 'id' | 'viewsCount' | 'createdAt' | 'updatedAt'>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Coran & Tafsir',
    coverImage: 'https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&q=80&w=1200',
    author: 'Aboubakar',
    reviewer: 'Conseil des Savants',
    status: 'publie',
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    scheduledAt: ''
  });

  // Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTargetArticle, setHistoryTargetArticle] = useState<AdminArticleItem | null>(null);

  // Initialize articles from Firebase or seeded default data
  useEffect(() => {
    const initArticles = async () => {
      try {
        const snap = await getDocs(collection(db, 'articles'));
        if (!snap.empty) {
          const loaded: AdminArticleItem[] = [];
          snap.forEach(d => {
            loaded.push({ id: d.id, ...d.data() } as AdminArticleItem);
          });
          setArticles(loaded);
          return;
        }
      } catch (e) {
        console.warn('Could not fetch articles from Firestore, loading local seed:', e);
      }

      // Convert seed articles
      const seed: AdminArticleItem[] = blogArticles.map((art, idx) => ({
        id: art.id,
        title: art.title.fr,
        slug: art.id,
        excerpt: art.excerpt.fr,
        content: art.content.fr,
        category: art.category.fr,
        coverImage: art.image,
        author: 'Aboubakar',
        reviewer: 'Conseil Éducatif',
        status: 'publie',
        metaTitle: art.title.fr,
        metaDescription: art.excerpt.fr,
        ogImage: art.image,
        viewsCount: 1420 * (idx + 1),
        isDeleted: false,
        createdAt: new Date(Date.now() - idx * 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString()
      }));

      setArticles(seed);

      // Seed initial version history
      const initVer: Record<string, ArticleVersion[]> = {};
      seed.forEach(a => {
        initVer[a.id] = [
          {
            id: 'v1-' + a.id,
            articleId: a.id,
            versionNumber: 1,
            title: a.title,
            content: a.content,
            excerpt: a.excerpt,
            savedBy: 'Aboubakar',
            createdAt: a.createdAt
          }
        ];
      });
      setVersions(initVer);
    };

    initArticles();
  }, []);

  // Listen to external new article signal
  useEffect(() => {
    if (openNewArticleSignal) {
      handleCreateNew();
    }
  }, [openNewArticleSignal]);

  // Open editor for new article
  const handleCreateNew = () => {
    setCurrentArticleId(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Coran & Tafsir',
      coverImage: 'https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&q=80&w=1200',
      author: currentUser?.displayName || 'Aboubakar',
      reviewer: 'Conseil Scientifique & Éducatif',
      status: 'brouillon',
      metaTitle: '',
      metaDescription: '',
      ogImage: '',
      scheduledAt: ''
    });
    setViewMode('editor');
  };

  // Open editor for existing article
  const handleEdit = (article: AdminArticleItem) => {
    setCurrentArticleId(article.id);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      coverImage: article.coverImage,
      author: article.author,
      reviewer: article.reviewer || '',
      status: article.status,
      metaTitle: article.metaTitle || article.title,
      metaDescription: article.metaDescription || article.excerpt,
      ogImage: article.ogImage || article.coverImage,
      scheduledAt: article.scheduledAt || ''
    });
    setViewMode('editor');
  };

  // Duplicate an article
  const handleDuplicate = async (article: AdminArticleItem) => {
    const newId = 'art-' + Date.now();
    const duplicated: AdminArticleItem = {
      ...article,
      id: newId,
      title: `${article.title} (Copie)`,
      slug: `${article.slug}-copie-${Math.floor(Math.random() * 1000)}`,
      status: 'brouillon',
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setArticles(prev => [duplicated, ...prev]);

    // Record audit log
    await recordAuditLog(
      currentUser?.email || 'admin',
      currentUser?.role || 'admin',
      'ARTICLE_DUPLICATE',
      'articles',
      newId,
      `Duplication de l'article "${article.title}" vers "${duplicated.title}".`
    );

    onNotify(`Article "${duplicated.title}" créé en brouillon.`);
  };

  // Save Article (Create or Update with Revision History)
  const handleSaveArticle = async (forcedStatus?: 'brouillon' | 'publie' | 'programme') => {
    if (!formData.title.trim()) {
      onNotify('Le titre de l\'article est obligatoire.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const finalStatus = forcedStatus || formData.status;
    const finalSlug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let targetId = currentArticleId;
    let isNew = false;

    if (!targetId) {
      targetId = 'art-' + Date.now();
      isNew = true;
    }

    const updatedItem: AdminArticleItem = {
      id: targetId,
      ...formData,
      slug: finalSlug,
      status: finalStatus,
      viewsCount: isNew ? 0 : (articles.find(a => a.id === targetId)?.viewsCount || 0),
      isDeleted: false,
      createdAt: isNew ? now : (articles.find(a => a.id === targetId)?.createdAt || now),
      updatedAt: now
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'articles', targetId), updatedItem);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }

    // Save version history revision
    const existingRevs = versions[targetId] || [];
    const newRevNumber = existingRevs.length + 1;
    const newRev: ArticleVersion = {
      id: `v${newRevNumber}-${targetId}`,
      articleId: targetId,
      versionNumber: newRevNumber,
      title: updatedItem.title,
      content: updatedItem.content,
      excerpt: updatedItem.excerpt,
      savedBy: currentUser?.displayName || currentUser?.email || 'Admin',
      createdAt: now
    };

    setVersions(prev => ({
      ...prev,
      [targetId!]: [newRev, ...existingRevs]
    }));

    if (isNew) {
      setArticles(prev => [updatedItem, ...prev]);
    } else {
      setArticles(prev => prev.map(a => a.id === targetId ? updatedItem : a));
    }

    // Record immutable audit log
    await recordAuditLog(
      currentUser?.email || 'admin',
      currentUser?.role || 'admin',
      isNew ? 'ARTICLE_CREATE' : 'ARTICLE_UPDATE',
      'articles',
      targetId,
      `${isNew ? 'Création' : 'Mise à jour'} de l'article "${updatedItem.title}" (${finalStatus}). Version #${newRevNumber} archivée.`
    );

    onNotify(isNew ? 'Article créé avec succès !' : 'Modifications enregistrées !');
    setViewMode('list');
  };

  // Move to 30-day Trash
  const handleMoveToTrash = async (article: AdminArticleItem) => {
    if (!window.confirm(`Déplacer l'article "${article.title}" vers la corbeille pendant 30 jours ?`)) {
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const trashEntry: TrashItem = {
      id: 'trash-' + article.id,
      originalCollection: 'articles',
      originalId: article.id,
      originalData: JSON.stringify(article),
      deletedBy: currentUser?.email || 'Admin',
      deletedAt: now.toISOString(),
      expiresAt,
      title: article.title
    };

    setTrashItems(prev => [trashEntry, ...prev]);
    setArticles(prev => prev.filter(a => a.id !== article.id));

    // Try updating isDeleted in Firestore
    try {
      await updateDoc(doc(db, 'articles', article.id), { isDeleted: true });
    } catch (e) {
      // Continue
    }

    await recordAuditLog(
      currentUser?.email || 'admin',
      currentUser?.role || 'admin',
      'ARTICLE_TRASH',
      'articles',
      article.id,
      `Article "${article.title}" mis en corbeille (rétention 30 jours).`
    );

    onNotify(`L'article a été déplacé dans la corbeille.`);
  };

  // Restore from Trash
  const handleRestoreFromTrash = async (item: TrashItem) => {
    try {
      const restored = JSON.parse(item.originalData) as AdminArticleItem;
      restored.isDeleted = false;
      restored.status = 'brouillon'; // Restore as draft for safety

      setArticles(prev => [restored, ...prev]);
      setTrashItems(prev => prev.filter(t => t.id !== item.id));

      await recordAuditLog(
        currentUser?.email || 'admin',
        currentUser?.role || 'admin',
        'ARTICLE_RESTORE',
        'articles',
        item.originalId,
        `Restauration de l'article "${item.title || item.originalId}" depuis la corbeille.`
      );

      onNotify(`Article "${item.title || item.originalId}" restauré en brouillon.`);
    } catch (e) {
      onNotify('Erreur lors de la restauration.', 'error');
    }
  };

  // Permanent Delete from Trash (Second confirmation)
  const handlePermanentDelete = async (item: TrashItem) => {
    if (!window.confirm(`ATTENTION : Cette suppression est DÉFINITIVE et IRRÉVERSIBLE. Supprimer "${item.title || item.originalId}" pour toujours ?`)) {
      return;
    }

    setTrashItems(prev => prev.filter(t => t.id !== item.id));

    try {
      await deleteDoc(doc(db, 'articles', item.originalId));
    } catch (e) {
      // Continue
    }

    await recordAuditLog(
      currentUser?.email || 'admin',
      currentUser?.role || 'admin',
      'ARTICLE_PERMANENT_DELETE',
      'articles',
      item.originalId,
      `Suppression irréversible définitive de l'article "${item.title || item.originalId}".`
    );

    onNotify('Article définitivement supprimé.');
  };

  // Revert to historical version
  const handleRestoreVersion = async (v: ArticleVersion) => {
    if (!historyTargetArticle) return;
    if (!window.confirm(`Rétablir la version #${v.versionNumber} de "${v.title}" datant du ${new Date(v.createdAt).toLocaleDateString()} ?`)) {
      return;
    }

    const updated: AdminArticleItem = {
      ...historyTargetArticle,
      title: v.title,
      content: v.content,
      excerpt: v.excerpt,
      updatedAt: new Date().toISOString()
    };

    setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));

    // Update Firestore
    try {
      await setDoc(doc(db, 'articles', updated.id), updated);
    } catch (e) {
      // Continue
    }

    await recordAuditLog(
      currentUser?.email || 'admin',
      currentUser?.role || 'admin',
      'ARTICLE_VERSION_RESTORE',
      'articles',
      updated.id,
      `Restauration de la révision #${v.versionNumber} sur l'article "${v.title}".`
    );

    setHistoryModalOpen(false);
    onNotify(`Version #${v.versionNumber} rétablie avec succès !`);
  };

  // Text editor helper: inserts formatted markdown/html
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || 'Texte';

    const replacement = `${prefix}${selected}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    setFormData(prev => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  // Insert Arabic citation helper
  const insertArabicCitation = () => {
    insertFormatting('\n\n<blockquote class="font-amiri text-lg text-gold-light border-r-2 border-gold-main pr-3 my-3" dir="rtl">\n« ', ' »\n</blockquote>\n\n');
  };

  // Filtered Articles
  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
    const matchesCat = categoryFilter === 'all' || art.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* SUB-HEADER / ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list' 
                ? 'bg-gold-main text-ink shadow' 
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Tous les articles ({articles.length})
          </button>
          <button
            onClick={() => setViewMode('trash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'trash' 
                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Corbeille 30j ({trashItems.length})</span>
          </button>
        </div>

        {viewMode !== 'editor' && (
          <button
            onClick={handleCreateNew}
            className="self-start sm:self-auto py-2 px-3.5 rounded-xl bg-emerald-main hover:bg-emerald-med text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Rédiger un article</span>
          </button>
        )}
      </div>

      {/* VIEW: TRASH BIN */}
      {viewMode === 'trash' ? (
        <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-gold-light text-base flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Corbeille Sécurisée (Rétention 30 Jours)</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Les éléments supprimés restent récupérables pendant 30 jours avant leur purge définitive.
              </p>
            </div>
            <button
              onClick={() => setViewMode('list')}
              className="text-xs text-gold-main hover:underline"
            >
              Retour aux articles
            </button>
          </div>

          {trashItems.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              La corbeille est vide. Aucun article supprimé en attente de purge.
            </div>
          ) : (
            <div className="space-y-3">
              {trashItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-lg bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-white text-sm">{item.title || item.originalId}</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Supprimé par {item.deletedBy} le {new Date(item.deletedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreFromTrash(item)}
                      className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurer</span>
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item)}
                      className="py-1.5 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer définitivement</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'editor' ? (
        /* VIEW: RICH ARTICLE EDITOR */
        <div className={`p-5 sm:p-7 rounded-2xl border space-y-6 ${
          isDark ? 'bg-[#1A140E] border-gold-main/20 text-cream-main' : 'bg-white border-black/10 text-ink'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold-main font-semibold">
                {currentArticleId ? 'Édition d\'article' : 'Nouvel article'}
              </span>
              <h2 className="text-xl font-serif font-bold text-gold-light mt-0.5">
                {formData.title || 'Sans titre'}
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="py-2 px-3 rounded-xl border border-gold-main/30 text-gold-light hover:bg-gold-main/10 text-xs font-semibold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Aperçu en direct</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveArticle('brouillon')}
                className="py-2 px-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-medium"
              >
                Brouillon
              </button>
              <button
                type="button"
                onClick={() => handleSaveArticle('publie')}
                className="py-2 px-4 rounded-xl bg-emerald-main hover:bg-emerald-med text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Publier l'article</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Title & Slug (Col 8) */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gold-light">
                  Titre principal de l'article *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Les Secrets Spirituels de la Sourate Al-Kahf"
                  className="w-full text-base sm:text-lg font-serif font-bold py-2.5 px-4 rounded-xl border bg-black/20 border-white/15 focus:border-gold-main focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 opacity-70">
                  Slug URL (auto-généré ou personnalisé)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="secrets-sourate-alkahf-vendredi"
                  className="w-full text-xs font-mono py-2 px-3 rounded-xl border bg-black/30 border-white/10 focus:border-gold-main focus:outline-none text-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gold-light">
                  Extrait / Chapô (Introduction courte) *
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brève introduction visible sur la carte du blog..."
                  className="w-full text-xs py-2 px-3 rounded-xl border bg-black/20 border-white/15 focus:border-gold-main focus:outline-none leading-relaxed"
                />
              </div>

              {/* RICH CONTENT TOOLBAR */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gold-light">
                    Corps de l'article
                  </label>
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-black/30 border border-white/10 text-xs">
                    <button
                      type="button"
                      title="Gras"
                      onClick={() => insertFormatting('**', '**')}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Italique"
                      onClick={() => insertFormatting('*', '*')}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Sous-titre H2"
                      onClick={() => insertFormatting('\n\n## ', '\n')}
                      className="p-1 hover:bg-white/10 rounded font-bold text-[11px]"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      title="Sous-titre H3"
                      onClick={() => insertFormatting('\n\n### ', '\n')}
                      className="p-1 hover:bg-white/10 rounded font-bold text-[11px]"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      title="Citation bloc"
                      onClick={() => insertFormatting('\n\n> ', '\n')}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Liste à puces"
                      onClick={() => insertFormatting('\n- ', '')}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-3 bg-white/20 mx-0.5" />
                    <button
                      type="button"
                      onClick={insertArabicCitation}
                      className="px-2 py-0.5 rounded bg-gold-main/20 text-gold-light hover:bg-gold-main/30 text-[11px] font-serif font-bold"
                      title="Insérer une citation coranique / prophétique en arabe"
                    >
                      ☪ Citation Arabe
                    </button>
                  </div>
                </div>

                <textarea
                  id="article-content-textarea"
                  rows={14}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Rédigez ici votre article..."
                  className="w-full font-sans text-xs sm:text-sm py-3 px-4 rounded-xl border bg-black/20 border-white/15 focus:border-gold-main focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Sidebar Meta & Settings (Col 4) */}
            <div className="md:col-span-4 space-y-4">
              
              {/* Publication Status Box */}
              <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-main">
                  Statut & Programmation
                </h4>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="brouillon"
                      checked={formData.status === 'brouillon'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'brouillon' }))}
                      className="accent-gold-main"
                    />
                    <span>Brouillon (non visible au public)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="publie"
                      checked={formData.status === 'publie'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'publie' }))}
                      className="accent-emerald-500"
                    />
                    <span>Publié immédiatement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="programme"
                      checked={formData.status === 'programme'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'programme' }))}
                      className="accent-purple-500"
                    />
                    <span>Programmé pour plus tard</span>
                  </label>
                </div>

                {formData.status === 'programme' && (
                  <div className="pt-2">
                    <label className="block text-[11px] opacity-70 mb-1">Date et heure de publication</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledAt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg bg-black/30 border border-white/10"
                    />
                  </div>
                )}
              </div>

              {/* Taxonomy & Author */}
              <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-main">
                  Catégorie & Relecture
                </h4>

                <div>
                  <label className="block text-[11px] opacity-70 mb-1">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full text-xs p-2 rounded-lg bg-black/40 border border-white/10 focus:border-gold-main text-white"
                  >
                    <option value="Coran & Tafsir">Coran & Tafsir</option>
                    <option value="Hadith & Sunnah">Hadith & Sunnah</option>
                    <option value="Spiritualité & Bienfaisance">Spiritualité & Bienfaisance</option>
                    <option value="Histoire & Éthique">Histoire & Éthique</option>
                    <option value="Jurisprudence & Fiqh">Jurisprudence & Fiqh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] opacity-70 mb-1">Auteur</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full text-xs p-2 rounded-lg bg-black/30 border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-[11px] opacity-70 mb-1">Relu par (Validation théologique)</label>
                  <input
                    type="text"
                    value={formData.reviewer}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewer: e.target.value }))}
                    placeholder="Ex: Cheikh Al-Azhar / Comité Scientifique"
                    className="w-full text-xs p-2 rounded-lg bg-black/30 border border-white/10"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-main">
                  Image de couverture
                </h4>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://..."
                  className="w-full text-xs p-2 rounded-lg bg-black/30 border border-white/10"
                />
                {formData.coverImage && (
                  <div className="h-28 w-full rounded-lg overflow-hidden border border-white/10 mt-2 relative">
                    <img 
                      src={formData.coverImage} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&q=80&w=600')}
                    />
                  </div>
                )}
              </div>

              {/* SEO Panel & SERP Preview */}
              <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-main flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Référencement & SEO</span>
                </h4>

                <div>
                  <div className="flex justify-between text-[10px] opacity-70 mb-1">
                    <span>Meta Title</span>
                    <span>{(formData.metaTitle || formData.title).length}/60</span>
                  </div>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder={formData.title || 'Titre SEO Google...'}
                    maxLength={70}
                    className="w-full text-xs p-2 rounded-lg bg-black/30 border border-white/10"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] opacity-70 mb-1">
                    <span>Meta Description</span>
                    <span>{(formData.metaDescription || formData.excerpt).length}/160</span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder={formData.excerpt || 'Description affichée dans Google...'}
                    maxLength={170}
                    className="w-full text-xs p-2 rounded-lg bg-black/30 border border-white/10"
                  />
                </div>

                {/* Google Snippet Visual Simulation */}
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] space-y-0.5">
                  <div className="text-[10px] text-stone-400 truncate">
                    islamaboubakar.com › blog › {formData.slug || 'article'}
                  </div>
                  <div className="text-blue-400 font-medium truncate">
                    {formData.metaTitle || formData.title || 'Titre de l\'article'} - Islam avec Aboubakar
                  </div>
                  <div className="text-stone-400 text-[10px] line-clamp-2">
                    {formData.metaDescription || formData.excerpt || 'Découvrez cet enseignement authentique sur la plateforme éducative Islam avec Aboubakar.'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* VIEW: ARTICLES LIST TABLE & CARDS */
        <div className="space-y-4">
          
          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un article ou catégorie..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border bg-black/20 border-white/10 text-xs focus:border-gold-main focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs py-2 px-3 rounded-xl border bg-black/30 border-white/10 text-stone-300"
              >
                <option value="all">Tous les statuts</option>
                <option value="publie">Publiés</option>
                <option value="brouillon">Brouillons</option>
                <option value="programme">Programmés</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border bg-black/30 border-white/10 text-stone-300"
              >
                <option value="all">Toutes les catégories</option>
                <option value="Coran & Tafsir">Coran & Tafsir</option>
                <option value="Hadith & Sunnah">Hadith & Sunnah</option>
                <option value="Spiritualité & Bienfaisance">Spiritualité</option>
                <option value="Histoire & Éthique">Histoire</option>
              </select>
            </div>
          </div>

          {/* TABLE VIEW (DESKTOP) / CARDS (MOBILE) */}
          <div className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/40 text-stone-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Article</th>
                    <th className="py-3 px-4 font-semibold">Catégorie</th>
                    <th className="py-3 px-4 font-semibold">Statut</th>
                    <th className="py-3 px-4 font-semibold">Lectures</th>
                    <th className="py-3 px-4 font-semibold">Relu par</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-stone-500">
                        Aucun article correspondant à votre recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/30 border border-white/10">
                              <img 
                                src={art.coverImage} 
                                alt="" 
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&q=80&w=150')}
                              />
                            </div>
                            <div className="max-w-[220px] sm:max-w-xs truncate">
                              <div className="font-semibold text-cream-main truncate text-sm">
                                {art.title}
                              </div>
                              <div className="text-[11px] text-stone-400 mt-0.5 truncate">
                                Par {art.author} • {new Date(art.updatedAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-300">
                          <span className="px-2.5 py-1 rounded-full bg-gold-main/10 text-gold-light border border-gold-main/20 text-[11px]">
                            {art.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            art.status === 'publie' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            art.status === 'programme' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-stone-500/20 text-stone-300 border border-stone-500/30'
                          }`}>
                            {art.status === 'publie' ? 'Publié' : art.status === 'programme' ? 'Programmé' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-300">
                          {art.viewsCount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                          {art.reviewer || 'En attente'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* History */}
                            <button
                              type="button"
                              onClick={() => {
                                setHistoryTargetArticle(art);
                                setHistoryModalOpen(true);
                              }}
                              title="Historique des versions"
                              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicate(art)}
                              title="Dupliquer l'article"
                              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleEdit(art)}
                              title="Modifier"
                              className="p-1.5 rounded-lg hover:bg-gold-main/20 text-gold-light hover:text-gold-main"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Trash */}
                            <button
                              type="button"
                              onClick={() => handleMoveToTrash(art)}
                              title="Mettre en corbeille (30j)"
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-stone-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LIVE ARTICLE PREVIEW */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] text-ink max-w-3xl w-full max-h-[85vh] rounded-2xl overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setPreviewModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-gold-main/20 text-gold-dark font-semibold text-xs">
                {formData.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-main">
                {formData.title || 'Titre de l\'article'}
              </h1>
              <div className="text-xs text-stone-600 flex items-center gap-3">
                <span>Rédigé par {formData.author}</span>
                <span>•</span>
                <span>Relu par {formData.reviewer}</span>
              </div>

              {formData.coverImage && (
                <div className="w-full h-64 rounded-xl overflow-hidden my-4">
                  <img src={formData.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-sm font-semibold text-stone-700 italic border-l-4 border-gold-main pl-3 my-4">
                {formData.excerpt}
              </p>

              <div className="prose prose-sm max-w-none text-stone-800 whitespace-pre-line leading-relaxed">
                {formData.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VERSION HISTORY & ROLLBACK */}
      {historyModalOpen && historyTargetArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-xl w-full rounded-2xl border p-6 shadow-2xl ${
            isDark ? 'bg-[#1A140E] border-gold-main/30 text-cream-main' : 'bg-white border-black/15 text-ink'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-serif font-bold text-gold-light text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-gold-main" />
                  <span>Historique des Révisions</span>
                </h3>
                <p className="text-xs text-stone-400 truncate max-w-sm mt-0.5">
                  {historyTargetArticle.title}
                </p>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(versions[historyTargetArticle.id] || []).length === 0 ? (
                <div className="text-xs text-stone-500 text-center py-6">
                  Aucune révision antérieure enregistrée pour cet article.
                </div>
              ) : (
                versions[historyTargetArticle.id].map((ver) => (
                  <div 
                    key={ver.id}
                    className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-gold-light">
                        Révision #{ver.versionNumber}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Enregistré par {ver.savedBy} le {new Date(ver.createdAt).toLocaleString('fr-FR')}
                      </div>
                      <div className="text-[11px] text-stone-500 italic mt-1 truncate max-w-xs">
                        "{ver.title}"
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreVersion(ver)}
                      className="py-1.5 px-3 rounded-lg bg-gold-main/20 hover:bg-gold-main/30 text-gold-light font-semibold text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rétablir</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="py-2 px-4 rounded-xl border border-white/10 text-xs hover:bg-white/5"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
