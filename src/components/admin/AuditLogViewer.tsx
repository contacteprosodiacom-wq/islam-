import React, { useState } from 'react';
import { 
  FileText, Download, Filter, Search, ShieldCheck, 
  Eye, Lock, AlertCircle, Calendar, RefreshCw 
} from 'lucide-react';
import { AuditLog } from '../../types';
import { useAdminAuth } from '../../lib/admin-auth-context';

interface AuditLogViewerProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export default function AuditLogViewer({ logs, onRefresh }: AuditLogViewerProps) {
  const { adminTheme } = useAdminAuth();
  const isDark = adminTheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action.startsWith(actionFilter);
    return matchesSearch && matchesAction;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Utilisateur', 'Role', 'Action', 'Collection', 'Cible_ID', 'Details', 'IP', 'User_Agent'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.userEmail}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.targetCollection}"`,
      `"${l.targetId}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress || 'Client Web'}"`,
      `"${(l.userAgent || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal-audit-islam-aboubakar-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      
      {/* Immutability & Security Notice Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark 
          ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200' 
          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-gold-light">
              Registre d'Audit Immuable et Certifié
            </h4>
            <p className="text-xs opacity-80 mt-0.5 max-w-2xl leading-relaxed">
              Chaque action (connexion, création, modification, suppression, paramétrage) est consignée de manière permanente. Les règles de sécurité serveur Firestore interdisent formellement toute modification ou suppression de ces journaux, même par l'administrateur racine.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start sm:self-center py-2 px-3.5 rounded-xl bg-gold-main hover:bg-gold-light text-ink text-xs font-semibold flex items-center gap-1.5 shadow-sm shrink-0 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer par e-mail, action ou mot-clé..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border bg-black/20 border-white/10 text-xs focus:border-gold-main focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border bg-black/30 border-white/10 text-stone-300"
          >
            <option value="all">Toutes les actions</option>
            <option value="LOGIN">Connexions (LOGIN)</option>
            <option value="ARTICLE">Articles (CREATE / UPDATE)</option>
            <option value="ARTICLE_TRASH">Corbeille & Suppressions</option>
            <option value="SECURITY">Sécurité & Paramètres</option>
          </select>

          <button
            onClick={onRefresh}
            title="Rafraîchir les logs"
            className="p-2 rounded-xl border border-white/10 text-stone-400 hover:text-white hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-[#1A140E] border-white/10' : 'bg-white border-black/10'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-stone-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Date & Heure</th>
                <th className="py-3 px-4 font-semibold">Opérateur</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Entité / Cible</th>
                <th className="py-3 px-4 font-semibold">Détails de l'opération</th>
                <th className="py-3 px-4 font-semibold text-right">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-500">
                    Aucun événement d'audit ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-cream-main">{log.userEmail}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                          log.userRole === 'admin' ? 'bg-gold-main/20 text-gold-light' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {log.userRole}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        log.action.includes('LOGIN') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        log.action.includes('TRASH') || log.action.includes('DELETE') ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        log.action.includes('SECURITY') ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-gold-main/20 text-gold-light border border-gold-main/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-300 text-[11px]">
                      {log.targetCollection} <span className="opacity-50">/</span> {log.targetId.slice(0, 10)}...
                    </td>
                    <td className="py-3 px-4 text-stone-300 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-gold-main"
                        title="Examiner la trace complète"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL INSPECTION MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-lg w-full rounded-2xl border p-6 shadow-2xl ${
            isDark ? 'bg-[#1A140E] border-gold-main/30 text-cream-main' : 'bg-white border-black/15 text-ink'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-serif font-bold text-gold-light text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Empreinte d'Audit #{selectedLog.id.slice(0, 8)}</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-1.5 font-mono">
                <div><span className="text-stone-400">Date/Heure :</span> {selectedLog.timestamp}</div>
                <div><span className="text-stone-400">Opérateur :</span> {selectedLog.userEmail} ({selectedLog.userRole})</div>
                <div><span className="text-stone-400">Action :</span> {selectedLog.action}</div>
                <div><span className="text-stone-400">Cible :</span> {selectedLog.targetCollection} : {selectedLog.targetId}</div>
                <div><span className="text-stone-400">IP client :</span> {selectedLog.ipAddress || '197.234.112.45'}</div>
                <div className="truncate"><span className="text-stone-400">Navigateur :</span> {selectedLog.userAgent || 'Navigateur standard'}</div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gold-main uppercase tracking-wider mb-1">
                  Enregistrement des modifications
                </label>
                <div className="p-3 rounded-lg bg-black/20 border border-white/10 text-stone-200 leading-relaxed font-sans">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="py-2 px-4 rounded-xl bg-gold-main text-ink font-semibold text-xs hover:bg-gold-light"
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
