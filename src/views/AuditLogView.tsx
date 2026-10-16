import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Download,
  Activity,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  XCircle,
  RotateCcw,
  MessageSquare,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { ActivityLog } from '../types';
import { storageService } from '../services/storageService';

interface AuditLogViewProps {
  onNavigate: (view: string, ticketId?: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ onNavigate }) => {
  const [logs] = useState<ActivityLog[]>(() => storageService.getActivityLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mNum = log.ticketNumber.toLowerCase().includes(q);
        const mActor = log.actorName.toLowerCase().includes(q);
        const mDetails = log.details?.toLowerCase().includes(q) || false;
        const mAction = log.action.toLowerCase().includes(q);
        if (!mNum && !mActor && !mDetails && !mAction) return false;
      }
      return true;
    });
  }, [logs, actionFilter, searchQuery]);

  const actions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action)));
  }, [logs]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const picAssignments = logs.filter((l) => l.action.includes('PIC') || l.action.includes('PENUGASAN')).length;
    const priorityChanges = logs.filter((l) => l.action.includes('PRIORITAS')).length;
    const statusChanges = logs.filter((l) => l.action.includes('STATUS') || l.action.includes('SELESAI')).length;
    return { total, picAssignments, priorityChanges, statusChanges };
  }, [logs]);

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Nomor Tiket', 'Aktor', 'Peran', 'Aksi', 'Keterangan'];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt).toLocaleString('id-ID'),
      l.ticketNumber,
      l.actorName,
      l.actorRole,
      l.action,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute(
      'download',
      `Audit_Trail_PLN_CorpU_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderActionBadge = (action: string) => {
    const actUpper = action.toUpperCase();

    if (actUpper.includes('PIC') || actUpper.includes('PENUGASAN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF]">
          <UserCheck className="w-3 h-3 text-[#1765B3]" />
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (actUpper.includes('PRIORITAS')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (actUpper.includes('SELESAI') || actUpper.includes('SOLUSI')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (actUpper.includes('TOLAK') || actUpper.includes('BATAL')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (actUpper.includes('REOPEN') || actUpper.includes('BUKA')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <RotateCcw className="w-3 h-3 text-purple-600" />
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (actUpper.includes('KOMENTAR') || actUpper.includes('PESAN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
          <MessageSquare className="w-3 h-3 text-sky-600" />
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
        <Activity className="w-3 h-3 text-slate-500" />
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto animate-in fade-in-50">
      {/* Top Header Banner - PLN Corporate Admin Command */}
      <div className="bg-gradient-hero p-5 sm:p-6 rounded-2xl border border-[#DCEAF7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A3D73] to-[#2589E8] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight font-heading">
                  Audit Trail & Log Kepatuhan
                </h1>
                <span className="bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF] text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                  Admin Command
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Sistem Pencatatan Aktivitas & Integritas Data PLN Corporate University
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed pt-1">
            Rekam jejak digital mutlak (*immutable audit log*) untuk setiap perubahan status tiket, triase penugasan PIC, penyesuaian matriks SLA, hingga dokumentasi solusi teknis demi transparansi tata kelola ITIL.
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="px-4 py-2.5 bg-gradient-to-r from-[#0A3D73] to-[#1765B3] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-98 shrink-0 self-stretch sm:self-auto justify-center"
        >
          <Download className="w-4 h-4 text-amber-300" />
          <span>Ekspor Data Audit CSV</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Entri Audit
          </span>
          <div className="text-2xl font-black text-[#0F172A] font-mono-numbers mt-1">
            {stats.total}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Log terekam lengkap</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#B8DEFF] bg-[#EFF8FF]/30 shadow-2xs hover:border-blue-300 transition-all">
          <span className="text-[11px] font-bold text-[#0A3D73] uppercase tracking-wider block">
            Penugasan PIC
          </span>
          <div className="text-2xl font-black text-[#1765B3] font-mono-numbers mt-1">
            {stats.picAssignments}
          </div>
          <span className="text-[10px] text-[#2589E8] mt-0.5 block font-medium">Triase & pergantian PIC</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs hover:border-amber-300 transition-all">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
            Perubahan Prioritas
          </span>
          <div className="text-2xl font-black text-amber-700 font-mono-numbers mt-1">
            {stats.priorityChanges}
          </div>
          <span className="text-[10px] text-amber-600 mt-0.5 block font-medium">Penyesuaian SLA</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs hover:border-emerald-300 transition-all">
          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
            Perubahan Status & Solusi
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono-numbers mt-1">
            {stats.statusChanges}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block font-medium">Progres & penyelesaian</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nomor tiket, aktor, atau rincian log..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#2589E8] focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#2589E8]"
          >
            <option value="ALL">Semua Jenis Aksi ({logs.length})</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono-numbers text-right shrink-0">
          Menampilkan <span className="font-bold text-[#0F172A]">{filteredLogs.length}</span> dari {logs.length} entri
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Waktu Kejadian</th>
                <th className="py-3.5 px-4">Nomor Tiket</th>
                <th className="py-3.5 px-4">Aktor Pengubah</th>
                <th className="py-3.5 px-4">Aktivitas / Aksi</th>
                <th className="py-3.5 px-4">Detail Perubahan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada log aktivitas yang cocok</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Silakan sesuaikan kata kunci pencarian atau filter aksi.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 font-mono-numbers text-slate-500 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(log.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono-numbers font-bold text-[#0A3D73] whitespace-nowrap">
                      <button
                        onClick={() => onNavigate('ticket-detail', log.ticketId)}
                        className="hover:text-[#2589E8] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        #{log.ticketNumber}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0A3D73] to-[#1765B3] text-white font-bold text-[10px] flex items-center justify-center shadow-2xs shrink-0">
                          {log.actorName ? log.actorName.charAt(0) : 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">{log.actorName}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {log.actorRole}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderActionBadge(log.action)}
                    </td>

                    <td className="py-3.5 px-4 max-w-md text-slate-600 leading-relaxed font-medium">
                      {log.details}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onNavigate('ticket-detail', log.ticketId)}
                        className="px-2.5 py-1 text-xs font-bold text-[#1765B3] hover:text-[#0A3D73] hover:bg-[#EFF8FF] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Buka Tiket</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
