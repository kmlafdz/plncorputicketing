import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { Ticket, Category } from '../types';
import { getSlaStatus } from '../utils/slaCalculator';

interface ReportsAnalyticsViewProps {
  tickets: Ticket[];
  categories: Category[];
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  tickets,
  categories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const filtered = tickets.filter((t) => {
    if (selectedCategory !== 'ALL' && t.categoryName !== selectedCategory) return false;
    if (selectedDept !== 'ALL' && t.department !== selectedDept) return false;
    return true;
  });

  const total = filtered.length;
  const completed = filtered.filter((t) => ['Selesai', 'Ditutup'].includes(t.status));
  const activeUnresolved = filtered.filter((t) => !['Selesai', 'Ditutup', 'Ditolak'].includes(t.status));
  const rejected = filtered.filter((t) => t.status === 'Ditolak');
  const reopened = filtered.filter((t) => t.reopenedCount > 0);

  // SLA achievement
  const onTimeResolved = completed.filter((t) => {
    const sla = getSlaStatus(t.createdAt, t.dueAt, t.status, t.resolvedAt);
    return !sla.isOverdue;
  });
  const slaAchievementRate =
    completed.length > 0 ? Math.round((onTimeResolved.length / completed.length) * 100) : 100;

  // Average resolution time (hours)
  let totalResolveHours = 0;
  completed.forEach((t) => {
    if (t.resolvedAt) {
      const ms = new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime();
      totalResolveHours += ms / (1000 * 60 * 60);
    }
  });
  const avgResolveHours = completed.length > 0 ? (totalResolveHours / completed.length).toFixed(1) : '0';

  // Category distribution
  const categoryCounts = categories.map((cat) => ({
    name: cat.name,
    count: filtered.filter((t) => t.categoryId === cat.id || t.categoryName === cat.name).length,
  }));

  // Department distribution
  const departments = Array.from(new Set(tickets.map((t) => t.department)));
  const deptCounts = departments.map((dept) => ({
    name: dept,
    count: filtered.filter((t) => t.department === dept).length,
  }));

  // PIC Performance
  const picNames = Array.from(
    new Set(tickets.map((t) => t.currentPicName).filter(Boolean))
  ) as string[];

  const picPerformance = picNames.map((name) => {
    const picTickets = filtered.filter((t) => t.currentPicName === name);
    const picDone = picTickets.filter((t) => ['Selesai', 'Ditutup'].includes(t.status));
    const picOnTime = picDone.filter((t) => {
      const sla = getSlaStatus(t.createdAt, t.dueAt, t.status, t.resolvedAt);
      return !sla.isOverdue;
    });
    return {
      name,
      total: picTickets.length,
      done: picDone.length,
      slaRate: picDone.length > 0 ? Math.round((picOnTime.length / picDone.length) * 100) : 100,
    };
  });

  const handleExportReportCSV = () => {
    const headers = ['Nomor Tiket', 'Judul', 'Kategori', 'Pelapor', 'Dept', 'Status', 'Prioritas', 'Dibuat', 'Tenggat'];
    const rows = filtered.map((t) => [
      t.ticketNumber,
      `"${t.title.replace(/"/g, '""')}"`,
      t.categoryName,
      t.reporterName,
      t.department,
      t.status,
      t.priority,
      new Date(t.createdAt).toLocaleDateString('id-ID'),
      new Date(t.dueAt).toLocaleDateString('id-ID'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Laporan_Kinerja_PLN_CorpU_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Laporan Kinerja & Analitik Layanan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluasi metrik operasional helpdesk, kepatuhan SLA, dan volume tiket penanganan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
          >
            <option value="ALL">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportReportCSV}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Laporan CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Tiket Dianalisis</span>
          <span className="text-2xl font-black text-slate-900 font-mono-numbers">{total}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Volume sampel</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Kepatuhan SLA</span>
          <span className="text-2xl font-black text-emerald-700 font-mono-numbers">
            {slaAchievementRate}%
          </span>
          <span className="text-[10px] text-emerald-600 block mt-1">Tepat waktu</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Rata-rata Resolusi</span>
          <span className="text-2xl font-black text-indigo-700 font-mono-numbers">
            {avgResolveHours} <span className="text-xs font-normal text-slate-500">Jam</span>
          </span>
          <span className="text-[10px] text-indigo-600 block mt-1">MTTR tuntas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Masih Berjalan</span>
          <span className="text-2xl font-black text-amber-700 font-mono-numbers">
            {activeUnresolved.length}
          </span>
          <span className="text-[10px] text-amber-600 block mt-1">Dalam proses</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Tiket Reopened</span>
          <span className="text-2xl font-black text-rose-700 font-mono-numbers">
            {reopened.length}
          </span>
          <span className="text-[10px] text-rose-600 block mt-1">Dibuka kembali</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Tiket Ditolak</span>
          <span className="text-2xl font-black text-slate-600 font-mono-numbers">
            {rejected.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Tidak valid/duplikat</span>
        </div>
      </div>

      {/* Breakdown Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Distribusi Tiket Menurut Kategori</h2>
          <div className="space-y-2.5">
            {categoryCounts.map((cat) => {
              const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-xs">{cat.name}</span>
                    <span className="font-bold text-slate-900 font-mono-numbers">
                      {cat.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIC Performance Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Performa Penyelesaian Petugas PIC</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase">
                  <th className="py-2">Nama Petugas</th>
                  <th className="py-2 text-center">Total Tiket</th>
                  <th className="py-2 text-center">Diselesaikan</th>
                  <th className="py-2 text-right">Kepatuhan SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono-numbers">
                {picPerformance.map((pic) => (
                  <tr key={pic.name} className="hover:bg-slate-50">
                    <td className="py-2.5 font-sans font-semibold text-slate-900">{pic.name}</td>
                    <td className="py-2.5 text-center">{pic.total}</td>
                    <td className="py-2.5 text-center text-emerald-700 font-bold">{pic.done}</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">
                        {pic.slaRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
