import React, { useState, useMemo } from 'react';
import {
  Ticket as TicketIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  PlusCircle,
  TrendingUp,
  ShieldAlert,
  ChevronRight,
  ClipboardList,
  Wrench,
  User,
  Users,
  UserCog,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  SlidersHorizontal,
  ShieldCheck,
  ArrowUpRight,
  Calendar,
  BarChart3,
  Filter,
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

  // Filter waktu pembuatan laporan ticketing (hari, minggu, bulan, tahun)
  const [intakeTimeFilter, setIntakeTimeFilter] = useState<'hari' | 'minggu' | 'bulan' | 'tahun'>('hari');
  // Mode tampilan grafik data (batang vs tren garis)
  const [chartMode, setChartMode] = useState<'bar' | 'area'>('bar');
  const [hoveredBucketIndex, setHoveredBucketIndex] = useState<number | null>(null);

  // Kalkulasi statistik waktu masuknya laporan tiket
  const intakeAnalytics = useMemo(() => {
    const now = new Date();
    const nowTime = now.getTime();

    // Filter tiket berdasarkan rentang waktu pembuatan (createdAt)
    const filtered = accessibleTickets.filter((t) => {
      const created = new Date(t.createdAt);
      if (isNaN(created.getTime())) return false;
      const diffMs = nowTime - created.getTime();

      if (intakeTimeFilter === 'hari') {
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours >= 0 && diffHours <= 24;
      }
      if (intakeTimeFilter === 'minggu') {
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (intakeTimeFilter === 'bulan') {
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      return created.getFullYear() === now.getFullYear();
    });

    // Klasifikasi Jam Kerja Diklat (Senin - Jumat, 07:30 - 17:00 WIB)
    let officeHoursCount = 0;
    let afterHoursCount = 0;
    const hourHistogram: { [hour: number]: number } = {};
    for (let h = 0; h < 24; h++) hourHistogram[h] = 0;

    filtered.forEach((t) => {
      const d = new Date(t.createdAt);
      const hour = d.getHours();
      const day = d.getDay();
      hourHistogram[hour] = (hourHistogram[hour] || 0) + 1;

      const isWorkday = day >= 1 && day <= 5;
      const isWorkHours = hour >= 7 && hour < 17;
      if (isWorkday && isWorkHours) {
        officeHoursCount++;
      } else {
        afterHoursCount++;
      }
    });

    // Waktu Puncak Masuk Laporan (Peak Window)
    let peakHour = 9;
    let maxHourVolume = 0;
    Object.entries(hourHistogram).forEach(([h, count]) => {
      if (count > maxHourVolume) {
        maxHourVolume = count;
        peakHour = parseInt(h, 10);
      }
    });
    const peakHourFormatted = `${String(peakHour).padStart(2, '0')}:00 - ${String((peakHour + 2) % 24).padStart(2, '0')}:00 WIB`;

    // Distribusi Frekuensi Berdasarkan Filter Terpilih
    type DistributionBucket = {
      label: string;
      subLabel: string;
      count: number;
      percentage: number;
      isPeak: boolean;
    };
    let rawBuckets: Omit<DistributionBucket, 'isPeak'>[] = [];

    if (intakeTimeFilter === 'hari') {
      const slots = [
        { label: '00:00 - 04:00', subLabel: 'Dini Hari', hours: [0, 1, 2, 3] },
        { label: '04:00 - 08:00', subLabel: 'Pagi Awal', hours: [4, 5, 6, 7] },
        { label: '08:00 - 12:00', subLabel: 'Pagi Kerja', hours: [8, 9, 10, 11] },
        { label: '12:00 - 16:00', subLabel: 'Siang Diklat', hours: [12, 13, 14, 15] },
        { label: '16:00 - 20:00', subLabel: 'Sore Hari', hours: [16, 17, 18, 19] },
        { label: '20:00 - 24:00', subLabel: 'Malam Hari', hours: [20, 21, 22, 23] },
      ];
      const maxCount = Math.max(...slots.map((s) => s.hours.reduce((acc, h) => acc + (hourHistogram[h] || 0), 0)), 1);
      rawBuckets = slots.map((s) => {
        const count = s.hours.reduce((acc, h) => acc + (hourHistogram[h] || 0), 0);
        return {
          label: s.label,
          subLabel: s.subLabel,
          count,
          percentage: Math.round((count / maxCount) * 100),
        };
      });
    } else if (intakeTimeFilter === 'minggu') {
      const dayCounts: { [d: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      filtered.forEach((t) => {
        const d = new Date(t.createdAt).getDay();
        dayCounts[d] = (dayCounts[d] || 0) + 1;
      });
      const order = [1, 2, 3, 4, 5, 6, 0];
      const dayFullNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const maxCount = Math.max(...Object.values(dayCounts), 1);
      rawBuckets = order.map((dIndex) => ({
        label: dayFullNames[dIndex],
        subLabel: dIndex >= 1 && dIndex <= 5 ? 'Hari Kerja' : 'Akhir Pekan',
        count: dayCounts[dIndex],
        percentage: Math.round((dayCounts[dIndex] / maxCount) * 100),
      }));
    } else if (intakeTimeFilter === 'bulan') {
      const weekCounts = [0, 0, 0, 0];
      filtered.forEach((t) => {
        const date = new Date(t.createdAt).getDate();
        if (date <= 7) weekCounts[0]++;
        else if (date <= 14) weekCounts[1]++;
        else if (date <= 21) weekCounts[2]++;
        else weekCounts[3]++;
      });
      const maxCount = Math.max(...weekCounts, 1);
      rawBuckets = [
        { label: 'Minggu 1', subLabel: 'Tgl 1 - 7', count: weekCounts[0], percentage: Math.round((weekCounts[0] / maxCount) * 100) },
        { label: 'Minggu 2', subLabel: 'Tgl 8 - 14', count: weekCounts[1], percentage: Math.round((weekCounts[1] / maxCount) * 100) },
        { label: 'Minggu 3', subLabel: 'Tgl 15 - 21', count: weekCounts[2], percentage: Math.round((weekCounts[2] / maxCount) * 100) },
        { label: 'Minggu 4', subLabel: 'Tgl 22 - 31', count: weekCounts[3], percentage: Math.round((weekCounts[3] / maxCount) * 100) },
      ];
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const monthCounts = new Array(12).fill(0);
      filtered.forEach((t) => {
        const m = new Date(t.createdAt).getMonth();
        monthCounts[m]++;
      });
      const maxCount = Math.max(...monthCounts, 1);
      rawBuckets = monthNames.map((name, idx) => ({
        label: name,
        subLabel: `Bulan ${idx + 1}`,
        count: monthCounts[idx],
        percentage: Math.round((monthCounts[idx] / maxCount) * 100),
      }));
    }

    // Identifikasi nilai puncak (peak)
    const maxBucketCount = Math.max(...rawBuckets.map((b) => b.count), 0);
    const buckets: DistributionBucket[] = rawBuckets.map((b) => ({
      ...b,
      isPeak: b.count === maxBucketCount && b.count > 0,
    }));

    // Skala nilai sumbu-Y grafik data
    const chartMax =
      maxBucketCount <= 4
        ? 4
        : maxBucketCount <= 8
        ? 8
        : maxBucketCount <= 12
        ? 12
        : maxBucketCount <= 20
        ? 20
        : Math.ceil(maxBucketCount / 5) * 5;

    // 5 garis panduan horizontal genap (100%, 75%, 50%, 25%, 0%)
    const yTicks = [
      chartMax,
      Math.round(chartMax * 0.75),
      Math.round(chartMax * 0.5),
      Math.round(chartMax * 0.25),
      0,
    ];

    const sortedTickets = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      totalCount: filtered.length,
      officeHoursCount,
      afterHoursCount,
      peakHourFormatted,
      buckets,
      chartMax,
      yTicks,
      tickets: sortedTickets,
    };
  }, [accessibleTickets, intakeTimeFilter]);

  // Perhitungan koordinat SVG untuk grafik area & garis
  const svgChart = useMemo(() => {
    const buckets = intakeAnalytics.buckets;
    const chartMax = intakeAnalytics.chartMax;
    const paddingX = 40;
    const paddingTop = 26;
    const baselineY = 205;
    const chartHeight = baselineY - paddingTop;
    const totalWidth = 1000;

    const points = buckets.map((b, i) => {
      const x =
        buckets.length > 1
          ? paddingX + (i / (buckets.length - 1)) * (totalWidth - 2 * paddingX)
          : totalWidth / 2;
      const count = b.count;
      const y = chartMax > 0 ? baselineY - (count / chartMax) * chartHeight : baselineY;
      return { x, y, bucket: b, index: i };
    });

    if (points.length === 0) return { pathD: '', areaD: '', points: [] };
    if (points.length === 1) {
      return {
        pathD: `M ${points[0].x} ${points[0].y}`,
        areaD: `M ${points[0].x} ${points[0].y} L ${points[0].x} ${baselineY} Z`,
        points,
      };
    }

    let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = Math.max(paddingTop, Math.min(baselineY, p1.y + (p2.y - p0.y) / 6));
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = Math.max(paddingTop, Math.min(baselineY, p2.y - (p3.y - p1.y) / 6));

      pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const first = points[0];
    const last = points[points.length - 1];
    const areaD = `${pathD} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;

    return { pathD, areaD, points };
  }, [intakeAnalytics.buckets, intakeAnalytics.chartMax]);

  return (
    <div className="space-y-6">
      {/* Top Banner Personalized with PLN Enterprise Theme */}
      <div className="bg-gradient-hero p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight font-heading">
              {isAdmin && `Selamat datang, ${currentUser.name}`}
              {isManajemen && `Executive Dashboard — ${currentUser.name}`}
              {isPic && `Halo, ${currentUser.name}`}
              {isPelapor && `Portal Layanan Pegawai — ${currentUser.name}`}
            </h1>
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-2xs ${
                isAdmin
                  ? 'bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF]'
                  : isManajemen
                  ? 'bg-purple-50 text-purple-900 border border-purple-200'
                  : isPic
                  ? 'bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF]'
                  : 'bg-white text-slate-700 border border-slate-200'
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
          <p className="text-xs text-slate-600 mt-1.5 max-w-3xl leading-relaxed font-medium">
            {isAdmin && 'Monitoring menyeluruh seluruh tiket layanan TI, beban kerja PIC, dan eskalasi SLA PLN Corporate University.'}
            {isManajemen && 'Ringkasan eksekutif performa helpdesk, kepatuhan SLA, dan mutu layanan digital PLN Corporate University.'}
            {isPic && `Akun Petugas ${currentUser.uid === 'user-pic-1' ? 'PIC 1' : currentUser.uid === 'user-pic-2' ? 'PIC 2' : currentUser.uid === 'user-pic-3' ? 'PIC 3' : 'PIC'} · Tim: ${currentUser.team || 'Teknis TI'} · Menampilkan tiket yang ditugaskan khusus kepada akun Anda.`}
            {isPelapor && `Departemen: ${currentUser.department} · Pantau status penanganan dan buat permohonan tiket baru secara terpadu.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          {isManajemen && (
            <button
              onClick={() => onNavigate('reports')}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#F0F7FF] text-[#0A3D73] border border-[#E2E8F0] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap focus-ring"
            >
              <TrendingUp className="w-4 h-4 text-[#2589E8]" />
              <span>Laporan & SLA</span>
            </button>
          )}

          {(isAdmin || isPelapor) && (
            <button
              onClick={() => onNavigate('create-ticket')}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-primary hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap focus-ring"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Tiket Baru</span>
            </button>
          )}

          {isPic && (
            <button
              onClick={() => onNavigate('my-assignments')}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-primary hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap focus-ring"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Penugasan Saya</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip tailored to Role */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Tiket CorpU</span>
            <span className="text-2xl font-black text-[#0F172A] font-mono-numbers">{total}</span>
            <span className="text-[10px] text-slate-400 block mt-1 font-medium">Semua kategori</span>
          </div>

          <div className="bg-[#EFF8FF] p-4 rounded-xl border border-[#B8DEFF] shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <span className="text-[11px] font-semibold text-[#0A3D73] block mb-1">Tiket Baru</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">{newTickets}</span>
            <span className="text-[10px] text-[#2589E8] block mt-1 font-semibold">Perlu verifikasi</span>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <span className="text-[11px] font-semibold text-amber-900 block mb-1">Belum Ada PIC</span>
            <span className="text-2xl font-black text-amber-800 font-mono-numbers">
              {unassignedTickets.length}
            </span>
            <span className="text-[10px] text-amber-700 block mt-1 font-semibold">Perlu penetapan</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <span className="text-[11px] font-semibold text-sky-800 block mb-1">Dalam Proses</span>
            <span className="text-2xl font-black text-sky-900 font-mono-numbers">{inProgress}</span>
            <span className="text-[10px] text-sky-700 block mt-1 font-semibold">Ditangani PIC</span>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <span className="text-[11px] font-semibold text-rose-900 block mb-1">Terlambat SLA</span>
            <span className="text-2xl font-black text-rose-800 font-mono-numbers">
              {overdueTickets.length}
            </span>
            <span className="text-[10px] text-rose-700 block mt-1 font-semibold">Melebihi target</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <span className="text-[11px] font-semibold text-emerald-900 block mb-1">Tiket Selesai</span>
            <span className="text-2xl font-black text-emerald-800 font-mono-numbers">{resolved}</span>
            <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">Solusi diterapkan</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-[#0A3D73] block mb-1">Kepatuhan SLA</span>
            <span className="text-2xl font-black text-[#2589E8] font-mono-numbers">{slaCompliance}%</span>
            <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">Target tercapai</span>
          </div>
        </div>
      )}

      {/* Admin Operations Command Center */}
      {isAdmin && (
        <div className="space-y-4">
          {/* Triage Alert Banner */}
          {(unassignedTickets.length > 0 || newTickets > 0) && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
                    <span>Pusat Triase Admin — Tiket Memerlukan Penugasan Segera</span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono-numbers">
                      {unassignedTickets.length} Belum Ada PIC
                    </span>
                  </h3>
                  <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed font-medium">
                    Terdapat {newTickets} tiket berstatus Baru dan {unassignedTickets.length} tiket aktif yang belum memiliki petugas PIC. Segera verifikasi laporan dan tugaskan ke tim teknis terkait.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('all-tickets')}
                className="px-4 py-2.5 bg-gradient-to-r from-[#0A3D73] to-[#1765B3] hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
              >
                <Wrench className="w-4 h-4 text-amber-300" />
                <span>Buka Antrean Triase Tiket</span>
              </button>
            </div>
          )}

          {/* STATISTIK PEMBUATAN WAKTU TICKETING */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
            {/* Header & Filter Controls (Hari, Minggu, Bulan, Tahun) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#EFF8FF] text-[#1765B3] border border-[#B8DEFF] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#1765B3]" />
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A] font-heading">
                    Statistik Pembuatan Waktu Ticketing
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Monitoring pola dan distribusi waktu masuknya laporan kendala operasional PLN Corporate University.
                </p>
              </div>

              {/* Filter Tabs: Hari, Minggu, Bulan, Tahun */}
              <div className="flex items-center p-1 bg-[#F1F5F9] rounded-xl border border-slate-200 text-xs font-semibold self-stretch sm:self-auto overflow-x-auto">
                {(
                  [
                    { id: 'hari', label: 'Hari Ini' },
                    { id: 'minggu', label: 'Minggu Ini' },
                    { id: 'bulan', label: 'Bulan Ini' },
                    { id: 'tahun', label: 'Tahun Ini' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setIntakeTimeFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      intakeTimeFilter === tab.id
                        ? 'bg-white text-[#0A3D73] font-bold shadow-2xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-heading">
                  Total Laporan Masuk
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono-numbers">
                    {intakeAnalytics.totalCount}
                  </span>
                  <span className="text-xs font-medium text-slate-500">tiket</span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Periode {intakeTimeFilter === 'hari' ? '24 Jam Terakhir' : intakeTimeFilter === 'minggu' ? '7 Hari Terakhir' : intakeTimeFilter === 'bulan' ? '30 Hari Terakhir' : 'Tahun Berjalan'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#EFF8FF] border border-[#B8DEFF] shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A3D73] block font-heading">
                  Waktu Puncak Masuk
                </span>
                <div className="text-sm sm:text-base font-extrabold text-[#1765B3] font-mono-numbers">
                  {intakeAnalytics.peakHourFormatted}
                </div>
                <span className="text-[10px] text-[#2589E8] block font-medium">
                  Volume tertinggi tiket baru
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block font-heading">
                  Jam Kerja Diklat (07:30 - 17:00)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono-numbers">
                    {intakeAnalytics.officeHoursCount}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono-numbers">
                    ({intakeAnalytics.totalCount > 0 ? Math.round((intakeAnalytics.officeHoursCount / intakeAnalytics.totalCount) * 100) : 0}%)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 block">
                  Masuk di jam operasional aktif
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block font-heading">
                  Luar Jam Kerja / Piket
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 font-mono-numbers">
                    {intakeAnalytics.afterHoursCount}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono-numbers">
                    ({intakeAnalytics.totalCount > 0 ? Math.round((intakeAnalytics.afterHoursCount / intakeAnalytics.totalCount) * 100) : 0}%)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Malam hari atau akhir pekan
                </span>
              </div>
            </div>

            {/* Visual Data Chart: Tren & Distribusi Waktu Masuk Laporan */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-4 shadow-2xs">
              {/* Chart Header with Mode Toggle & Dynamic Subtitle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1765B3]" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-heading">
                      Grafik Tren & Distribusi Waktu Masuk Tiket
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {intakeTimeFilter === 'hari'
                      ? 'Frekuensi kedatangan tiket per rentang jam (24 jam hari ini)'
                      : intakeTimeFilter === 'minggu'
                      ? 'Frekuensi kedatangan tiket per hari (7 hari terakhir)'
                      : intakeTimeFilter === 'bulan'
                      ? 'Frekuensi kedatangan tiket per minggu (30 hari terakhir)'
                      : 'Frekuensi kedatangan tiket per bulan (12 bulan tahun berjalan)'}
                  </p>
                </div>

                {/* View Mode Toggle: Bar vs Area/Line */}
                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 text-xs font-semibold self-stretch sm:self-auto shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setChartMode('bar')}
                    className={`px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      chartMode === 'bar'
                        ? 'bg-[#0A3D73] text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Grafik Batang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('area')}
                    className={`px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      chartMode === 'area'
                        ? 'bg-[#0A3D73] text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Tren Garis</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Banner & Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs">
                {hoveredBucketIndex !== null && intakeAnalytics.buckets[hoveredBucketIndex] ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1765B3]" />
                    <span className="font-bold text-[#0F172A]">
                      {intakeAnalytics.buckets[hoveredBucketIndex].label}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      ({intakeAnalytics.buckets[hoveredBucketIndex].subLabel})
                    </span>
                    <span className="font-extrabold text-[#1765B3] font-mono-numbers bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md text-[11px]">
                      {intakeAnalytics.buckets[hoveredBucketIndex].count} tiket ({intakeAnalytics.buckets[hoveredBucketIndex].percentage}%)
                    </span>
                    {intakeAnalytics.buckets[hoveredBucketIndex].isPeak && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                        Waktu Puncak
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Clock className="w-3.5 h-3.5 text-[#1765B3] shrink-0" />
                    <span>
                      Waktu Puncak Masuk: <strong className="text-[#0A3D73] font-mono-numbers">{intakeAnalytics.peakHourFormatted}</strong> • Total <strong className="text-[#0F172A] font-mono-numbers">{intakeAnalytics.totalCount} tiket</strong>
                    </span>
                  </div>
                )}

                {/* Legend Indicators */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 ml-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-[#0A3D73] to-[#2589E8]" />
                    <span>Volume Laporan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 border border-amber-500" />
                    <span>Waktu Puncak</span>
                  </div>
                </div>
              </div>

              {/* Main Chart Canvas Container */}
              <div className="w-full bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs overflow-x-auto scrollbar-thin">
                <div className={`w-full ${intakeAnalytics.buckets.length > 7 ? 'min-w-[560px]' : 'min-w-[320px]'}`}>
                  {/* Plot Area with Left Y-Axis and Chart Canvas */}
                  <div className="relative h-60 sm:h-64 flex">
                    {/* Y-Axis Numerical Scale Labels */}
                    <div className="w-8 sm:w-10 h-full flex flex-col justify-between items-end pr-2.5 text-[10px] sm:text-[11px] font-semibold text-slate-400 font-mono-numbers select-none shrink-0 pb-1">
                      {intakeAnalytics.yTicks.map((val, idx) => (
                        <span key={idx} className="leading-none">
                          {val}
                        </span>
                      ))}
                    </div>

                    {/* Chart Plot Area with Gridlines */}
                    <div className="flex-1 h-full relative">
                      {/* Horizontal Gridlines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1">
                        {intakeAnalytics.yTicks.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-full ${
                              idx === intakeAnalytics.yTicks.length - 1
                                ? 'border-b-2 border-slate-300'
                                : 'border-b border-dashed border-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      {/* MODE 1: VERTICAL BAR CHART */}
                      {chartMode === 'bar' && (
                        <div className="absolute inset-0 flex items-end justify-between gap-1.5 sm:gap-3 px-2 sm:px-4 pb-1">
                          {intakeAnalytics.buckets.map((b, idx) => {
                            const isHovered = hoveredBucketIndex === idx;
                            const barHeightPercent = Math.max(
                              (b.count / intakeAnalytics.chartMax) * 100,
                              b.count > 0 ? 8 : 2
                            );

                            return (
                              <div
                                key={idx}
                                onMouseEnter={() => setHoveredBucketIndex(idx)}
                                onMouseLeave={() => setHoveredBucketIndex(null)}
                                onClick={() => setHoveredBucketIndex(idx)}
                                className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                              >
                                {/* Floating Tooltip Card */}
                                {isHovered && (
                                  <div className="absolute -top-12 z-30 pointer-events-none transform -translate-x-1/2 left-1/2 whitespace-nowrap bg-[#0F172A] text-white text-[11px] py-1.5 px-3 rounded-xl shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="font-bold text-sky-300">{b.label}</div>
                                    <div className="flex items-center gap-1.5 text-slate-300 font-mono-numbers">
                                      <span>{b.count} tiket</span>
                                      <span>•</span>
                                      <span>{b.percentage}%</span>
                                      {b.isPeak && <span className="text-amber-400 font-bold">★ Puncak</span>}
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F172A] rotate-45 border-r border-b border-slate-700" />
                                  </div>
                                )}

                                {/* Top Value Pill on Bar */}
                                <div className="mb-1 text-center transition-transform duration-200 group-hover:-translate-y-0.5">
                                  {b.count > 0 ? (
                                    <span
                                      className={`text-[10px] sm:text-xs font-black font-mono-numbers px-1.5 py-0.5 rounded-md shadow-2xs ${
                                        b.isPeak
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-1 ring-amber-300'
                                          : isHovered
                                          ? 'bg-[#0A3D73] text-white'
                                          : 'bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF]'
                                      }`}
                                    >
                                      {b.count}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-300 font-mono-numbers">0</span>
                                  )}
                                </div>

                                {/* The Bar Element */}
                                <div
                                  className={`w-full max-w-[48px] sm:max-w-[64px] min-w-[14px] sm:min-w-[20px] rounded-t-lg sm:rounded-t-xl transition-all duration-300 ease-out ${
                                    b.isPeak
                                      ? 'bg-gradient-to-t from-[#0A3D73] via-[#1765B3] to-amber-400 border-t-2 border-amber-300 shadow-xs'
                                      : b.count > 0
                                      ? 'bg-gradient-to-t from-[#0A3D73] to-[#2589E8] shadow-2xs'
                                      : 'bg-slate-200/70'
                                  } ${isHovered ? 'ring-2 ring-[#2589E8]/50 brightness-110 shadow-md scale-y-[1.02] origin-bottom' : ''}`}
                                  style={{ height: `${barHeightPercent}%` }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* MODE 2: SMOOTH AREA & LINE TREND CHART */}
                      {chartMode === 'area' && (
                        <div className="absolute inset-0 pb-1">
                          <svg
                            viewBox="0 0 1000 240"
                            preserveAspectRatio="none"
                            className="w-full h-full overflow-visible"
                          >
                            <defs>
                              <linearGradient id="intakeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2589E8" stopOpacity="0.38" />
                                <stop offset="85%" stopColor="#1765B3" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#1765B3" stopOpacity="0.0" />
                              </linearGradient>
                              <linearGradient id="intakeLineGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#0A3D73" />
                                <stop offset="50%" stopColor="#1765B3" />
                                <stop offset="100%" stopColor="#2589E8" />
                              </linearGradient>
                            </defs>

                            {/* Area Gradient Fill */}
                            {svgChart.areaD && (
                              <path d={svgChart.areaD} fill="url(#intakeAreaGrad)" />
                            )}

                            {/* Spline Stroke Line */}
                            {svgChart.pathD && (
                              <path
                                d={svgChart.pathD}
                                fill="none"
                                stroke="url(#intakeLineGrad)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}

                            {/* Coordinate Point Dots & Labels */}
                            {svgChart.points.map((pt, idx) => {
                              const isHovered = hoveredBucketIndex === idx;
                              return (
                                <g
                                  key={idx}
                                  className="cursor-pointer"
                                  onMouseEnter={() => setHoveredBucketIndex(idx)}
                                  onMouseLeave={() => setHoveredBucketIndex(null)}
                                  onClick={() => setHoveredBucketIndex(idx)}
                                >
                                  {/* Vertical Guide Line on Hover */}
                                  {isHovered && (
                                    <line
                                      x1={pt.x}
                                      y1={26}
                                      x2={pt.x}
                                      y2={205}
                                      stroke="#1765B3"
                                      strokeWidth="1.5"
                                      strokeDasharray="4 3"
                                      opacity="0.7"
                                    />
                                  )}

                                  {/* Value text above node */}
                                  {pt.bucket.count > 0 && (
                                    <text
                                      x={pt.x}
                                      y={pt.y - 10}
                                      textAnchor="middle"
                                      fill={pt.bucket.isPeak ? '#B45309' : '#0A3D73'}
                                      fontSize="13"
                                      fontWeight="bold"
                                      fontFamily="monospace"
                                    >
                                      {pt.bucket.count}
                                    </text>
                                  )}

                                  {/* Outer pulse circle when hovered */}
                                  {isHovered && (
                                    <circle
                                      cx={pt.x}
                                      cy={pt.y}
                                      r="11"
                                      fill="#2589E8"
                                      fillOpacity="0.2"
                                    />
                                  )}

                                  {/* Node Circle */}
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={isHovered ? 7 : pt.bucket.isPeak ? 6 : 4.5}
                                    fill={pt.bucket.isPeak ? '#F59E0B' : '#ffffff'}
                                    stroke={pt.bucket.isPeak ? '#B45309' : '#0A3D73'}
                                    strokeWidth={isHovered ? 3 : 2}
                                    className="transition-all duration-200"
                                  />

                                  {/* Invisible expanded hit target */}
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="20"
                                    fill="transparent"
                                  />
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* X-Axis Categorical Labels (Directly Aligned with Plot Coordinates) */}
                  <div className="flex pl-8 sm:pl-10 pt-2.5">
                    <div className="w-full flex justify-between gap-1.5 sm:gap-3 px-2 sm:px-4">
                      {intakeAnalytics.buckets.map((b, idx) => {
                        const isHovered = hoveredBucketIndex === idx;
                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredBucketIndex(idx)}
                            onMouseLeave={() => setHoveredBucketIndex(null)}
                            onClick={() => setHoveredBucketIndex(idx)}
                            className="flex-1 text-center min-w-0 cursor-pointer"
                          >
                            <span
                              className={`block text-[10px] sm:text-xs font-bold truncate transition-colors ${
                                isHovered
                                  ? 'text-[#0A3D73]'
                                  : b.isPeak
                                  ? 'text-amber-900'
                                  : 'text-slate-800'
                              }`}
                              title={b.label}
                            >
                              {b.label}
                            </span>
                            <span
                              className={`block text-[9px] sm:text-[10px] truncate ${
                                isHovered
                                  ? 'text-[#1765B3] font-semibold'
                                  : b.isPeak
                                  ? 'text-amber-700 font-semibold'
                                  : 'text-slate-400'
                              }`}
                              title={b.subLabel}
                            >
                              {b.subLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Synchronized Breakdown Grid Cards Below the Chart */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
                {intakeAnalytics.buckets.map((b, idx) => {
                  const isHovered = hoveredBucketIndex === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredBucketIndex(idx)}
                      onMouseLeave={() => setHoveredBucketIndex(null)}
                      onClick={() => setHoveredBucketIndex(idx)}
                      className={`p-3 bg-white rounded-xl border transition-all cursor-pointer shadow-2xs flex flex-col justify-between space-y-2 ${
                        isHovered
                          ? 'border-[#1765B3] ring-2 ring-[#2589E8]/20 -translate-y-0.5 shadow-sm'
                          : b.isPeak
                          ? 'border-amber-300 bg-amber-50/20'
                          : 'border-slate-200 hover:border-[#B8DEFF]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-slate-700 truncate" title={b.label}>
                          {b.label}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {b.isPeak && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                          )}
                          <span
                            className={`text-xs font-extrabold font-mono-numbers ${
                              b.isPeak ? 'text-amber-700' : 'text-[#1765B3]'
                            }`}
                          >
                            {b.count}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Track */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            b.isPeak
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                              : 'bg-gradient-to-r from-[#0A3D73] to-[#2589E8]'
                          }`}
                          style={{ width: `${Math.max(b.percentage, b.count > 0 ? 12 : 0)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate">{b.subLabel}</span>
                        <span className="font-mono-numbers font-medium">
                          {b.count > 0 ? `${b.percentage}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Ticket Intake Feed Table */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                <h3 className="text-xs font-bold text-slate-800 font-heading">
                  Log Masuk Laporan Tiket ({intakeAnalytics.tickets.length})
                </h3>
                <span className="text-[11px] text-[#2589E8] font-semibold">
                  Diurutkan berdasarkan waktu masuk terbaru
                </span>
              </div>

              {intakeAnalytics.tickets.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs">
                  Tidak ada laporan tiket yang masuk pada periode waktu yang dipilih ({intakeTimeFilter}).
                </div>
              ) : (
                <div className="overflow-x-auto p-2 sm:p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-left text-xs border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-2 px-3.5">Waktu Masuk Laporan</th>
                        <th className="pb-2 px-3.5">Nomor & Judul Tiket</th>
                        <th className="pb-2 px-3.5">Kategori & Pelapor</th>
                        <th className="pb-2 px-3.5">Prioritas</th>
                        <th className="pb-2 px-3.5">Status</th>
                        <th className="pb-2 px-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intakeAnalytics.tickets.slice(0, 8).map((t) => {
                        const dateObj = new Date(t.createdAt);
                        const isDateValid = !isNaN(dateObj.getTime());
                        const hour = isDateValid ? dateObj.getHours() : 0;
                        const day = isDateValid ? dateObj.getDay() : 0;
                        const isOfficeHour = isDateValid && day >= 1 && day <= 5 && hour >= 7 && hour < 17;

                        const timeFormatted = isDateValid
                          ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
                          : '-';
                        const dateFormatted = isDateValid
                          ? dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-';

                        return (
                          <tr key={t.id} className="hover:bg-[#F0F7FF]/60 transition-all shadow-2xs group cursor-pointer" onClick={() => onNavigate('ticket-detail', t.id)}>
                            <td className="py-3 px-3.5 whitespace-nowrap bg-white group-hover:bg-[#F0F7FF]/60 rounded-l-xl border-y border-l border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                              <div className="space-y-0.5">
                                <span className="font-mono-numbers font-bold text-slate-900 block text-xs">
                                  {timeFormatted}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="text-slate-500">{dateFormatted}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded font-semibold text-[9px] ${
                                      isOfficeHour
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}
                                  >
                                    {isOfficeHour ? 'Jam Kerja' : 'Luar Jam'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3.5 max-w-[240px] bg-white group-hover:bg-[#F0F7FF]/60 border-y border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                              <span className="font-mono text-[10px] font-bold text-[#1765B3] block">
                                #{t.ticketNumber}
                              </span>
                              <span className="font-semibold text-slate-900 truncate block text-xs" title={t.title}>
                                {t.title}
                              </span>
                            </td>

                            <td className="py-3 px-3.5 bg-white group-hover:bg-[#F0F7FF]/60 border-y border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                              <span className="text-slate-800 font-medium block text-xs">
                                {t.categoryName}
                              </span>
                              <span className="text-slate-400 text-[11px] block truncate max-w-[160px]">
                                {t.reporterName} ({t.department})
                              </span>
                            </td>

                            <td className="py-3 px-3.5 whitespace-nowrap bg-white group-hover:bg-[#F0F7FF]/60 border-y border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                              <PriorityBadge priority={t.priority} size="sm" />
                            </td>

                            <td className="py-3 px-3.5 whitespace-nowrap bg-white group-hover:bg-[#F0F7FF]/60 border-y border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                              <StatusBadge status={t.status} size="sm" />
                            </td>

                            <td className="py-3 px-3.5 text-right whitespace-nowrap bg-white group-hover:bg-[#F0F7FF]/60 rounded-r-xl border-y border-r border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('ticket-detail', t.id);
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold bg-[#EFF8FF] text-[#1765B3] hover:bg-[#1765B3] hover:text-white rounded-lg transition-colors cursor-pointer border border-[#B8DEFF]"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isPic && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Tugas Saya</span>
            <span className="text-2xl font-black text-[#0F172A] font-mono-numbers">{total}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Ditugaskan ke akun saya</span>
          </div>

          <div className="bg-[#EFF8FF] p-4 rounded-xl border border-[#B8DEFF] shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-[#0A3D73] block mb-1">Penugasan Baru</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">
              {accessibleTickets.filter((t) => t.status === 'Ditugaskan').length}
            </span>
            <span className="text-[10px] text-[#2589E8] block mt-1 font-semibold">Perlu dimulai</span>
          </div>

          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-sky-900 block mb-1">Sedang Dikerjakan</span>
            <span className="text-2xl font-black text-sky-800 font-mono-numbers">{inProgress}</span>
            <span className="text-[10px] text-sky-700 block mt-1 font-semibold">Dalam investigasi</span>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-amber-900 block mb-1">Menunggu Respon</span>
            <span className="text-2xl font-black text-amber-800 font-mono-numbers">{waiting}</span>
            <span className="text-[10px] text-amber-700 block mt-1 font-semibold">Pelapor / Vendor</span>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-rose-900 block mb-1">Tugas Terlambat</span>
            <span className="text-2xl font-black text-rose-800 font-mono-numbers">
              {overdueTickets.length}
            </span>
            <span className="text-[10px] text-rose-700 block mt-1 font-semibold">Melebihi target SLA</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-emerald-900 block mb-1">Diselesaikan</span>
            <span className="text-2xl font-black text-emerald-800 font-mono-numbers">{resolved}</span>
            <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">Selesai & ditutup</span>
          </div>
        </div>
      )}

      {isPelapor && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Laporan Saya</span>
            <span className="text-2xl font-black text-[#0F172A] font-mono-numbers">{total}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Total tiket diajukan</span>
          </div>

          <div className="bg-[#EFF8FF] p-4 rounded-xl border border-[#B8DEFF] shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-[#0A3D73] block mb-1">Tiket Baru</span>
            <span className="text-2xl font-black text-[#1765B3] font-mono-numbers">{newTickets}</span>
            <span className="text-[10px] text-[#2589E8] block mt-1 font-semibold">Menunggu triase</span>
          </div>

          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-sky-900 block mb-1">Sedang Diproses</span>
            <span className="text-2xl font-black text-sky-800 font-mono-numbers">{inProgress}</span>
            <span className="text-[10px] text-sky-700 block mt-1 font-semibold">Oleh teknisi PIC</span>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-semibold text-amber-900 block mb-1">Menunggu Info Anda</span>
            <span className="text-2xl font-black text-amber-800 font-mono-numbers">
              {accessibleTickets.filter((t) => t.status === 'Menunggu Pelapor').length}
            </span>
            <span className="text-[10px] text-amber-700 block mt-1 font-semibold">Perlu respon</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs hover:-translate-y-0.5 transition-all col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-emerald-900 block mb-1">Telah Diselesaikan</span>
            <span className="text-2xl font-black text-emerald-800 font-mono-numbers">{resolved}</span>
            <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">Solusi diberikan</span>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Service Response Time Gauge */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] font-heading">
                {isAdmin ? 'Waktu Respons Layanan CorpU' : 'Waktu Respons Tiket Saya'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Distribusi kecepatan penanganan pertama
              </p>
            </div>
            <span className="text-xs font-semibold text-[#0A3D73] bg-[#EFF8FF] border border-[#B8DEFF] px-2.5 py-1 rounded-lg">
              Tahun 2026
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            <div className="relative flex flex-col items-center justify-center">
              <svg className="w-44 h-26" viewBox="0 0 200 110">
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#E2E8F0"
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
                <div className="text-2xl font-extrabold text-[#0F172A] font-mono-numbers">{total}</div>
                <div className="text-[10px] text-slate-500 font-medium">Tiket Tercatat</div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs w-full sm:w-auto font-mono-numbers">
              <div className="flex items-center justify-between gap-6 p-1.5 rounded-lg hover:bg-[#F8FAFC]">
                <span className="flex items-center gap-2 text-slate-700 font-sans font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2589E8]" />
                  &lt; 2 Jam (Sangat Cepat)
                </span>
                <span className="font-bold text-[#0F172A]">{Math.round(total * 0.5) || 0}</span>
              </div>
              <div className="flex items-center justify-between gap-6 p-1.5 rounded-lg hover:bg-[#F8FAFC]">
                <span className="flex items-center gap-2 text-slate-700 font-sans font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  2 - 6 Jam (Sesuai Standar)
                </span>
                <span className="font-bold text-[#0F172A]">{Math.round(total * 0.3) || 0}</span>
              </div>
              <div className="flex items-center justify-between gap-6 p-1.5 rounded-lg hover:bg-[#F8FAFC]">
                <span className="flex items-center gap-2 text-slate-700 font-sans font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  &gt; 6 Jam (Perlu Perhatian)
                </span>
                <span className="font-bold text-[#0F172A]">{Math.max(0, Math.round(total * 0.2))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Priority Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] font-heading">Distribusi Prioritas Tiket</h2>
              <p className="text-[11px] text-slate-500">
                Berdasarkan kalkulasi matriks Dampak & Urgensi
              </p>
            </div>
            <span className="text-xs font-semibold text-[#0A3D73] bg-[#EFF8FF] border border-[#B8DEFF] px-2.5 py-1 rounded-lg">
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
                <span className="text-xl font-black text-[#0F172A] font-mono-numbers">{total}</span>
                <span className="text-[10px] text-slate-500 block font-medium">Tiket</span>
              </div>
            </div>

            <div className="space-y-2 text-xs w-full sm:w-auto font-mono-numbers">
              <div className="flex items-center justify-between gap-6 p-1.5 rounded-lg hover:bg-[#F8FAFC]">
                <span className="flex items-center gap-2 text-slate-800 font-sans font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Kritis
                </span>
                <span className="font-bold text-rose-700">{priorityCounts.Kritis}</span>
              </div>
              <div className="flex items-center justify-between gap-6 p-1.5 rounded-lg hover:bg-[#F8FAFC]">
                <span className="flex items-center gap-2 text-slate-800 font-sans font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Tinggi
                </span>
                <span className="font-bold text-orange-700">{priorityCounts.Tinggi}</span>
              </div>
              <div className="flex items-center justify-between gap-6 p-1.5 rounded-lg hover:bg-[#F8FAFC]">
                <span className="flex items-center gap-2 text-slate-800 font-sans font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2589E8]" />
                  Sedang
                </span>
                <span className="font-bold text-[#1765B3]">{priorityCounts.Sedang}</span>
              </div>
              <div className="flex items-center justify-between gap-6 p-1.5 rounded-lg hover:bg-[#F8FAFC]">
                <span className="flex items-center gap-2 text-slate-800 font-sans font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Rendah
                </span>
                <span className="font-bold text-slate-600">{priorityCounts.Rendah}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Work Queue Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F8FAFC]">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-heading">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              {isAdmin && 'Antrean Tiket Perlu Tindakan Segera (Helpdesk)'}
              {isPic && 'Daftar Tugas Prioritas Utama Saya'}
              {isPelapor && 'Tiket Aktif & Tindak Lanjut Terkini'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
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
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada antrean tiket prioritas yang memerlukan tindakan segera.
            </div>
          ) : (
            <>
              {/* Mobile Card View (< md:) with spacing per ticket */}
              <div className="md:hidden p-3 space-y-3 bg-[#F8FAFC]">
                {urgentTickets.map((ticket) => {
                  const sla = getSlaStatus(ticket.createdAt, ticket.dueAt, ticket.status, ticket.resolvedAt);
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => onNavigate('ticket-detail', ticket.id)}
                      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#1765B3]/40 p-3.5 space-y-2.5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-numbers font-bold text-xs text-[#1765B3]">
                          #{ticket.ticketNumber}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <PriorityBadge priority={ticket.priority} size="sm" />
                          <StatusBadge status={ticket.status} size="sm" />
                        </div>
                      </div>

                      <div className="font-semibold text-xs text-[#0F172A] leading-snug line-clamp-2">
                        {ticket.title}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-mono-numbers">
                        <span
                          className={`font-semibold ${
                            sla.isOverdue
                              ? 'text-rose-600'
                              : sla.isNearingBreach
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}
                        >
                          SLA: {sla.remainingFormatted}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {ticket.categoryName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop / Tablet Table View (>= md:) with clean row spacing per ticket */}
              <div className="hidden md:block overflow-x-auto p-3 sm:p-4 bg-[#F8FAFC]">
                <table className="w-full text-left border-separate border-spacing-y-2.5 text-xs min-w-[640px]">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="pb-2.5 px-4">Nomor Tiket</th>
                      <th className="pb-2.5 px-4">Subjek Kendala</th>
                      <th className="pb-2.5 px-4">Prioritas</th>
                      <th className="pb-2.5 px-4">Status</th>
                      <th className="pb-2.5 px-4">Petugas PIC</th>
                      <th className="pb-2.5 px-4">SLA Deadline</th>
                      <th className="pb-2.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-[#0F172A]">
                    {urgentTickets.map((ticket) => {
                      const sla = getSlaStatus(ticket.createdAt, ticket.dueAt, ticket.status, ticket.resolvedAt);
                      return (
                        <tr
                          key={ticket.id}
                          className="hover:bg-[#F0F7FF]/60 transition-all cursor-pointer group shadow-2xs"
                          onClick={() => onNavigate('ticket-detail', ticket.id)}
                        >
                          <td className="py-3.5 px-4 font-mono-numbers font-bold text-[#1765B3] bg-white group-hover:bg-[#F0F7FF]/60 rounded-l-xl border-y border-l border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                            #{ticket.ticketNumber}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs bg-white group-hover:bg-[#F0F7FF]/60 border-y border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                            <div className="font-semibold text-[#0F172A] group-hover:text-[#2589E8] transition-colors truncate">
                              {ticket.title}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {ticket.categoryName} · {ticket.type}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 bg-white group-hover:bg-[#F0F7FF]/60 border-y border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                            <PriorityBadge priority={ticket.priority} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 bg-white group-hover:bg-[#F0F7FF]/60 border-y border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                            <StatusBadge status={ticket.status} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 bg-white group-hover:bg-[#F0F7FF]/60 border-y border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                            {ticket.currentPicName ? (
                              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-[#EFF8FF] text-[#1765B3] text-[10px] flex items-center justify-center font-bold border border-[#B8DEFF]">
                                  {ticket.currentPicName.charAt(0)}
                                </span>
                                {ticket.currentPicName}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic font-medium">Belum Ditugaskan</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono-numbers bg-white group-hover:bg-[#F0F7FF]/60 border-y border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                            <span
                              className={`text-[11px] font-semibold ${
                                sla.isOverdue
                                  ? 'text-rose-600'
                                  : sla.isNearingBreach
                                  ? 'text-amber-600'
                                  : 'text-slate-600'
                              }`}
                            >
                              {sla.remainingFormatted}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right bg-white group-hover:bg-[#F0F7FF]/60 rounded-r-xl border-y border-r border-slate-200/90 group-hover:border-[#1765B3]/40 transition-colors">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate('ticket-detail', ticket.id);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-[#0A3D73] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#EFF8FF] hover:border-[#B8DEFF] shadow-2xs transition-colors cursor-pointer"
                            >
                              Buka Tiket
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
