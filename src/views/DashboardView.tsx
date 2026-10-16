import React from 'react';
import {
  Ticket as TicketIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Flame,
  PlusCircle,
  TrendingUp,
  ShieldAlert,
  ChevronRight,
  ClipboardList,
  Wrench,
  User,
  HelpCircle,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { Ticket, User as UserType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { getSlaStatus } from '../utils/slaCalculator';

interface DashboardViewProps {
  tickets: Ticket[];
  currentUser: UserType;
  onNavigate: (view: string, ticketId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tickets,
  currentUser,
  onNavigate,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isManajemen = currentUser.role === 'manajemen';
  const isPic = currentUser.role === 'pic';
  const isPelapor = currentUser.role === 'pelapor';

  // Strict data access scoping:
  // - Admin & Manajemen: sees all tickets across CorpU
  // - PIC: sees ONLY tickets assigned to them
  // - Pelapor: sees ONLY tickets reported by them
  const accessibleTickets = tickets.filter((t) => {
    if (isAdmin || isManajemen) return true;
    if (isPic) return t.currentPicId === currentUser.uid;
    if (isPelapor) return t.reporterId === currentUser.uid;
    return false;
  });

  // Calculate actual metrics from accessible tickets
  const total = accessibleTickets.length;
  const newTickets = accessibleTickets.filter((t) => t.status === 'Baru').length;
  const inProgress = accessibleTickets.filter((t) => t.status === 'Dalam Proses').length;
  const waiting = accessibleTickets.filter((t) =>
    ['Menunggu Pelapor', 'Menunggu Pihak Ketiga', 'Menunggu Persetujuan'].includes(t.status)
  ).length;
  const resolved = accessibleTickets.filter((t) => ['Selesai', 'Ditutup'].includes(t.status)).length;
  const critical = accessibleTickets.filter((t) => t.priority === 'Kritis').length;

  // Overdue check
  const overdueTickets = accessibleTickets.filter((t) => {
    const sla = getSlaStatus(t.createdAt, t.dueAt, t.status, t.resolvedAt);
    return sla.isOverdue;
  });

  // SLA Compliance rate (%)
  const completed = accessibleTickets.filter((t) => t.status === 'Selesai' || t.status === 'Ditutup');
  const onTimeCompleted = completed.filter((t) => {
    const sla = getSlaStatus(t.createdAt, t.dueAt, t.status, t.resolvedAt);
    return !sla.isOverdue;
  });
  const slaCompliance = completed.length > 0 ? Math.round((onTimeCompleted.length / completed.length) * 100) : 100;

  // Unassigned tickets for Admin
  const unassignedTickets = accessibleTickets.filter((t) => !t.currentPicId && t.status !== 'Ditolak');

  // Priority counts
  const priorityCounts = {
    Kritis: accessibleTickets.filter((t) => t.priority === 'Kritis').length,
    Tinggi: accessibleTickets.filter((t) => t.priority === 'Tinggi').length,
    Sedang: accessibleTickets.filter((t) => t.priority === 'Sedang').length,
    Rendah: accessibleTickets.filter((t) => t.priority === 'Rendah').length,
  };

  // Urgent list for table
  const urgentTickets = [...accessibleTickets]
    .sort((a, b) => {
      const pWeight = { Kritis: 4, Tinggi: 3, Sedang: 2, Rendah: 1 };
      const diff = pWeight[b.priority] - pWeight[a.priority];
      if (diff !== 0) return diff;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner Personalized with Light Blue Gradient */}
      <div className="bg-gradient-hero p-6 rounded-2xl border border-[#DCEAF7] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-[#172B4D] tracking-tight">
              {isAdmin && `Selamat datang, ${currentUser.name}`}
              {isManajemen && `Executive Dashboard — ${currentUser.name}`}
              {isPic && `Halo, ${currentUser.name}`}
              {isPelapor && `Portal Layanan Pegawai — ${currentUser.name}`}
            </h1>
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-[#D9EEFF] text-[#1765B3] border border-[#B8DEFF]'
                  : isManajemen
                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                  : isPic
                  ? 'bg-[#D9EEFF] text-[#1765B3] border border-[#B8DEFF]'
                  : 'bg-white text-slate-700 border border-[#DCEAF7]'
              }`}
            >
              {isPic
                ? currentUser.uid === 'user-pic-1'
                  ? 'PIC 1 (Network)'
                  : currentUser.uid === 'user-pic-2'
                  ? 'PIC 2 (Hardware)'
                  : currentUser.uid === 'user-pic-3'
                  ? 'PIC 3 (Aplikasi)'
                  : 'Petugas PIC'
                : currentUser.role === 'admin'
                ? 'Admin Ticketing'
                : currentUser.role}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1.5 max-w-3xl leading-relaxed">
            {isAdmin && 'Monitoring menyeluruh seluruh tiket layanan TI, beban kerja PIC, dan eskalasi SLA PLN Corporate University.'}
            {isManajemen && 'Ringkasan eksekutif performa helpdesk, kepatuhan SLA, dan mutu layanan digital PLN Corporate University.'}
            {isPic && `Akun Petugas ${currentUser.uid === 'user-pic-1' ? 'PIC 1' : currentUser.uid === 'user-pic-2' ? 'PIC 2' : currentUser.uid === 'user-pic-3' ? 'PIC 3' : 'PIC'} · Tim: ${currentUser.team || 'Teknis TI'} · Menampilkan tiket yang ditugaskan khusus kepada akun Anda.`}
            {isPelapor && `Departemen: ${currentUser.department} · Pantau status penanganan dan buat permohonan tiket baru secara terpadu.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isManajemen && (
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 bg-white hover:bg-[#F0F7FF] text-[#1765B3] border border-[#DCEAF7] text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4 text-[#2589E8]" />
              <span>Laporan & SLA</span>
            </button>
          )}

          {(isAdmin || isPelapor) && (
            <button
              onClick={() => onNavigate('create-ticket')}
              className="px-4 py-2.5 bg-gradient-primary hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Tiket Baru</span>
            </button>
          )}

          {isPic && (
            <button
              onClick={() => onNavigate('my-assignments')}
              className="px-4 py-2.5 bg-gradient-primary hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Penugasan Saya</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip tailored to Role */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
          <div className="bg-gradient-card p-4 rounded-xl border border-[#DCEAF7] shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-[11px] font-medium text-[#64748B] block mb-1">Total Tiket CorpU</span>
            <span className="text-2xl font-black text-[#172B4D] font-mono-numbers">{total}</span>
            <span className="text-[10px] text-[#94A3B8] block mt-1">Semua kategori</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCEAF7] shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-[11px] font-medium text-[#1765B3] block mb-1">Tiket Baru</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">{newTickets}</span>
            <span className="text-[10px] text-[#2589E8] block mt-1">Perlu verifikasi</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
            <span className="text-[11px] font-medium text-amber-800 block mb-1">Belum Ada PIC</span>
            <span className="text-2xl font-black text-amber-700 font-mono-numbers">
              {unassignedTickets.length}
            </span>
            <span className="text-[10px] text-amber-600 block mt-1">Perlu penetapan</span>
          </div>

          <div className="bg-gradient-card p-4 rounded-xl border border-[#DCEAF7] shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-[11px] font-medium text-[#1765B3] block mb-1">Dalam Proses</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">{inProgress}</span>
            <span className="text-[10px] text-[#2589E8] block mt-1">Ditangani PIC</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
            <span className="text-[11px] font-medium text-rose-700 block mb-1">Terlambat SLA</span>
            <span className="text-2xl font-black text-rose-700 font-mono-numbers">
              {overdueTickets.length}
            </span>
            <span className="text-[10px] text-rose-600 block mt-1">Melebihi target</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCEAF7] shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-[11px] font-medium text-emerald-700 block mb-1">Tiket Selesai</span>
            <span className="text-2xl font-black text-emerald-800 font-mono-numbers">{resolved}</span>
            <span className="text-[10px] text-emerald-600 block mt-1">Solusi diterapkan</span>
          </div>

          <div className="bg-gradient-card p-4 rounded-xl border border-[#DCEAF7] shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-[11px] font-medium text-[#1765B3] block mb-1">Kepatuhan SLA</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">{slaCompliance}%</span>
            <span className="text-[10px] text-emerald-600 block mt-1">Target tercapai</span>
          </div>
        </div>
      )}

      {isPic && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-gradient-card p-4 rounded-xl border border-[#DCEAF7] shadow-2xs">
            <span className="text-[11px] font-medium text-[#64748B] block mb-1">Total Tugas Saya</span>
            <span className="text-2xl font-black text-[#172B4D] font-mono-numbers">{total}</span>
            <span className="text-[10px] text-[#94A3B8] block mt-1">Ditugaskan ke akun saya</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCEAF7] shadow-2xs">
            <span className="text-[11px] font-medium text-[#1765B3] block mb-1">Penugasan Baru</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">
              {accessibleTickets.filter((t) => t.status === 'Ditugaskan').length}
            </span>
            <span className="text-[10px] text-[#2589E8] block mt-1">Perlu dimulai</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCEAF7] shadow-2xs">
            <span className="text-[11px] font-medium text-[#1765B3] block mb-1">Sedang Dikerjakan</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">{inProgress}</span>
            <span className="text-[10px] text-[#2589E8] block mt-1">Dalam investigasi</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
            <span className="text-[11px] font-medium text-amber-800 block mb-1">Menunggu Respon</span>
            <span className="text-2xl font-black text-amber-700 font-mono-numbers">{waiting}</span>
            <span className="text-[10px] text-amber-600 block mt-1">Pelapor / Vendor</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
            <span className="text-[11px] font-medium text-rose-700 block mb-1">Tugas Terlambat</span>
            <span className="text-2xl font-black text-rose-700 font-mono-numbers">
              {overdueTickets.length}
            </span>
            <span className="text-[10px] text-rose-600 block mt-1">Melebihi target SLA</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCEAF7] shadow-2xs">
            <span className="text-[11px] font-medium text-emerald-700 block mb-1">Diselesaikan</span>
            <span className="text-2xl font-black text-emerald-800 font-mono-numbers">{resolved}</span>
            <span className="text-[10px] text-emerald-600 block mt-1">Selesai & ditutup</span>
          </div>
        </div>
      )}

      {isPelapor && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
          <div className="bg-gradient-card p-4 rounded-xl border border-[#DCEAF7] shadow-2xs">
            <span className="text-[11px] font-medium text-[#64748B] block mb-1">Laporan Saya</span>
            <span className="text-2xl font-black text-[#172B4D] font-mono-numbers">{total}</span>
            <span className="text-[10px] text-[#94A3B8] block mt-1">Total tiket diajukan</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCEAF7] shadow-2xs">
            <span className="text-[11px] font-medium text-[#1765B3] block mb-1">Tiket Baru</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">{newTickets}</span>
            <span className="text-[10px] text-[#2589E8] block mt-1">Menunggu triase</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCEAF7] shadow-2xs">
            <span className="text-[11px] font-medium text-[#1765B3] block mb-1">Sedang Diproses</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">{inProgress}</span>
            <span className="text-[10px] text-[#2589E8] block mt-1">Oleh teknisi PIC</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
            <span className="text-[11px] font-medium text-amber-800 block mb-1">Menunggu Info Anda</span>
            <span className="text-2xl font-black text-amber-700 font-mono-numbers">
              {accessibleTickets.filter((t) => t.status === 'Menunggu Pelapor').length}
            </span>
            <span className="text-[10px] text-amber-600 block mt-1">Perlu respon</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCEAF7] shadow-2xs">
            <span className="text-[11px] font-medium text-emerald-700 block mb-1">Telah Diselesaikan</span>
            <span className="text-2xl font-black text-emerald-800 font-mono-numbers">{resolved}</span>
            <span className="text-[10px] text-emerald-600 block mt-1">Solusi diberikan</span>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Service Response Time Gauge */}
        <div className="bg-white p-5 rounded-2xl border border-[#DCEAF7] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D]">
                {isAdmin ? 'Waktu Respons Layanan CorpU' : 'Waktu Respons Tiket Saya'}
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Distribusi kecepatan penanganan pertama
              </p>
            </div>
            <span className="text-xs font-semibold text-[#1765B3] bg-[#EFF8FF] border border-[#B8DEFF] px-2.5 py-1 rounded-lg">
              Tahun 2026
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            <div className="relative flex flex-col items-center justify-center">
              <svg className="w-44 h-26" viewBox="0 0 200 110">
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#DCEAF7"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 100 A 80 80 0 0 1 70 33"
                  fill="none"
                  stroke="#2589E8"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <path
                  d="M 70 33 A 80 80 0 0 1 130 33"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="18"
                />
                <path
                  d="M 130 33 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute bottom-2 text-center">
                <div className="text-2xl font-extrabold text-[#172B4D] font-mono-numbers">{total}</div>
                <div className="text-[10px] text-[#64748B] font-medium">Tiket Tercatat</div>
              </div>
            </div>

            <div className="space-y-2 text-xs w-full sm:w-auto font-mono-numbers">
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-[#64748B] font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2589E8]" />
                  &lt; 2 Jam (Sangat Cepat)
                </span>
                <span className="font-bold text-[#172B4D]">{Math.round(total * 0.5) || 0}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-[#64748B] font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  2 - 6 Jam (Sesuai Standar)
                </span>
                <span className="font-bold text-[#172B4D]">{Math.round(total * 0.3) || 0}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-[#64748B] font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  &gt; 6 Jam (Perlu Perhatian)
                </span>
                <span className="font-bold text-[#172B4D]">{Math.max(0, Math.round(total * 0.2))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Priority Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[#DCEAF7] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D]">Distribusi Prioritas Tiket</h2>
              <p className="text-[11px] text-[#64748B]">
                Berdasarkan kalkulasi matriks Dampak & Urgensi
              </p>
            </div>
            <span className="text-xs font-semibold text-[#1765B3] bg-[#EFF8FF] border border-[#B8DEFF] px-2.5 py-1 rounded-lg">
              Aktif
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F43F5E"
                  strokeWidth="14"
                  strokeDasharray={`${(priorityCounts.Kritis / (total || 1)) * 238.7 || 5} 238.7`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F97316"
                  strokeWidth="14"
                  strokeDasharray={`${(priorityCounts.Tinggi / (total || 1)) * 238.7 || 15} 238.7`}
                  strokeDashoffset={`-${(priorityCounts.Kritis / (total || 1)) * 238.7 || 5}`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#2589E8"
                  strokeWidth="14"
                  strokeDasharray={`${(priorityCounts.Sedang / (total || 1)) * 238.7 || 25} 238.7`}
                  strokeDashoffset={`-${((priorityCounts.Kritis + priorityCounts.Tinggi) / (total || 1)) * 238.7 || 20}`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#94A3B8"
                  strokeWidth="14"
                  strokeDasharray={`${(priorityCounts.Rendah / (total || 1)) * 238.7 || 25} 238.7`}
                  strokeDashoffset={`-${((priorityCounts.Kritis + priorityCounts.Tinggi + priorityCounts.Sedang) / (total || 1)) * 238.7 || 45}`}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-black text-[#172B4D] font-mono-numbers">{total}</span>
                <span className="text-[10px] text-[#64748B] block font-medium">Tiket</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs w-full sm:w-auto font-mono-numbers">
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-[#172B4D] font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Kritis
                </span>
                <span className="font-bold text-[#172B4D]">{priorityCounts.Kritis}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-[#172B4D] font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Tinggi
                </span>
                <span className="font-bold text-[#172B4D]">{priorityCounts.Tinggi}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-[#172B4D] font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2589E8]" />
                  Sedang
                </span>
                <span className="font-bold text-[#172B4D]">{priorityCounts.Sedang}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-[#172B4D] font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Rendah
                </span>
                <span className="font-bold text-[#172B4D]">{priorityCounts.Rendah}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Work Queue Table */}
      <div className="bg-white rounded-2xl border border-[#DCEAF7] shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCEAF7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F5FAFF]">
          <div>
            <h2 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              {isAdmin && 'Antrean Tiket Perlu Tindakan Segera (Helpdesk)'}
              {isPic && 'Daftar Tugas Prioritas Utama Saya'}
              {isPelapor && 'Tiket Aktif & Tindak Lanjut Terkini'}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Daftar tiket yang memiliki tingkat urgensi tinggi atau mendekati tenggat SLA.
            </p>
          </div>
          <button
            onClick={() => onNavigate(isPelapor ? 'my-tickets' : isPic ? 'my-assignments' : 'all-tickets')}
            className="text-xs text-[#2589E8] hover:text-[#1765B3] font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Lihat Semua ({total})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {urgentTickets.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8] text-xs">
              Tidak ada antrean tiket prioritas yang memerlukan tindakan segera.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F0F7FF] border-b border-[#DCEAF7] text-[11px] font-bold text-[#172B4D] uppercase tracking-wider">
                  <th className="py-3 px-4">Nomor Tiket</th>
                  <th className="py-3 px-4">Subjek Kendala</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Petugas PIC</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCEAF7]/60 text-xs text-[#172B4D]">
                {urgentTickets.map((ticket) => {
                  const sla = getSlaStatus(ticket.createdAt, ticket.dueAt, ticket.status, ticket.resolvedAt);
                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-[#F5FAFF] transition-colors cursor-pointer"
                      onClick={() => onNavigate('ticket-detail', ticket.id)}
                    >
                      <td className="py-3 px-4 font-mono-numbers font-bold text-[#1765B3]">
                        #{ticket.ticketNumber}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-[#172B4D] truncate">{ticket.title}</div>
                        <div className="text-[11px] text-[#64748B] truncate">
                          {ticket.categoryName} · {ticket.type}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={ticket.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        {ticket.currentPicName ? (
                          <span className="font-medium text-[#172B4D] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#D9EEFF] text-[#1765B3] text-[10px] flex items-center justify-center font-bold">
                              {ticket.currentPicName.charAt(0)}
                            </span>
                            {ticket.currentPicName}
                          </span>
                        ) : (
                          <span className="text-[#94A3B8] italic">Belum Ditugaskan</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono-numbers">
                        <span
                          className={`text-[11px] font-semibold ${
                            sla.isOverdue
                              ? 'text-rose-600'
                              : sla.isNearingBreach
                              ? 'text-amber-600'
                              : 'text-[#64748B]'
                          }`}
                        >
                          {sla.remainingFormatted}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('ticket-detail', ticket.id);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-[#1765B3] bg-white border border-[#DCEAF7] rounded-lg hover:bg-[#EFF8FF] shadow-2xs transition-colors cursor-pointer"
                        >
                          Buka Tiket
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
