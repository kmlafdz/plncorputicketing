import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Clock,
  UserCheck,
  Tag,
  Calendar,
} from 'lucide-react';
import { Ticket, User as UserType, TicketStatus, PriorityLevel } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { getSlaStatus } from '../utils/slaCalculator';
import { formatPicDisplayName } from '../utils/picHelpers';

interface TicketListViewProps {
  mode: 'all' | 'my-tickets' | 'my-assignments';
  tickets: Ticket[];
  currentUser: UserType;
  onNavigate: (view: string, ticketId?: string) => void;
  initialSearch?: string;
}

export const TicketListView: React.FC<TicketListViewProps> = ({
  mode,
  tickets,
  currentUser,
  onNavigate,
  initialSearch = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPic, setSelectedPic] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter based on page mode with strict Role-Based Access Control
  const baseTickets = useMemo(() => {
    // Pelapor can NEVER see tickets belonging to other reporters
    if (currentUser.role === 'pelapor') {
      return tickets.filter((t) => t.reporterId === currentUser.uid);
    }
    // PIC can ONLY see tickets assigned to them
    if (currentUser.role === 'pic') {
      return tickets.filter((t) => t.currentPicId === currentUser.uid);
    }
    // Admin can see everything, or filter by specific mode
    if (mode === 'my-tickets') {
      return tickets.filter((t) => t.reporterId === currentUser.uid);
    }
    if (mode === 'my-assignments') {
      return tickets.filter((t) => t.currentPicId === currentUser.uid);
    }
    return tickets;
  }, [tickets, mode, currentUser.uid, currentUser.role]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: baseTickets.length,
      new: baseTickets.filter((t) => t.status === 'Baru').length,
      new_assigned: baseTickets.filter((t) => ['Ditugaskan', 'Baru'].includes(t.status)).length,
      open: baseTickets.filter((t) => ['Diverifikasi', 'Ditugaskan'].includes(t.status)).length,
      in_progress: baseTickets.filter((t) => t.status === 'Dalam Proses').length,
      waiting_reporter: baseTickets.filter((t) => t.status === 'Menunggu Pelapor').length,
      waiting_third_party: baseTickets.filter((t) => t.status === 'Menunggu Pihak Ketiga').length,
      on_hold: baseTickets.filter((t) =>
        ['Menunggu Pelapor', 'Menunggu Pihak Ketiga', 'Menunggu Persetujuan'].includes(t.status)
      ).length,
      resolved: baseTickets.filter((t) => ['Selesai', 'Ditutup'].includes(t.status)).length,
      closed: baseTickets.filter((t) => t.status === 'Ditutup').length,
    };
  }, [baseTickets]);

  // Filter logic
  const filteredTickets = useMemo(() => {
    return baseTickets.filter((t) => {
      // Tab filter
      if (activeTab === 'new' && t.status !== 'Baru') return false;
      if (activeTab === 'new_assigned' && !['Ditugaskan', 'Baru'].includes(t.status)) return false;
      if (activeTab === 'open' && !['Diverifikasi', 'Ditugaskan'].includes(t.status)) return false;
      if (activeTab === 'in_progress' && t.status !== 'Dalam Proses') return false;
      if (activeTab === 'waiting_reporter' && t.status !== 'Menunggu Pelapor') return false;
      if (activeTab === 'waiting_third_party' && t.status !== 'Menunggu Pihak Ketiga') return false;
      if (
        activeTab === 'on_hold' &&
        !['Menunggu Pelapor', 'Menunggu Pihak Ketiga', 'Menunggu Persetujuan'].includes(t.status)
      )
        return false;
      if (activeTab === 'resolved' && !['Selesai', 'Ditutup'].includes(t.status)) return false;
      if (activeTab === 'closed' && t.status !== 'Ditutup') return false;

      // Dropdown filters
      if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
      if (selectedCategory !== 'ALL' && t.categoryName !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
      if (selectedPic !== 'ALL' && t.currentPicId !== selectedPic) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = t.ticketNumber.toLowerCase().includes(q);
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesReporter = t.reporterName.toLowerCase().includes(q);
        const matchesDept = t.department.toLowerCase().includes(q);
        const matchesCat = t.categoryName.toLowerCase().includes(q);
        const matchesCatCode = t.categoryCode?.toLowerCase().includes(q) || false;
        const matchesPic = t.currentPicName?.toLowerCase().includes(q) || false;
        if (!matchesNumber && !matchesTitle && !matchesReporter && !matchesDept && !matchesCat && !matchesCatCode && !matchesPic) {
          return false;
        }
      }

      return true;
    });
  }, [baseTickets, activeTab, selectedPriority, selectedCategory, selectedStatus, selectedPic, searchQuery]);

  // Reset filters
  const handleResetFilters = () => {
    setActiveTab('all');
    setSelectedPriority('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedPic('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Categories & PICs for dropdown
  const categoryNames = Array.from(new Set(tickets.map((t) => t.categoryName)));
  const pics = Array.from(
    new Map(
      tickets.filter((t) => t.currentPicId && t.currentPicName).map((t) => [t.currentPicId, t.currentPicName!])
    ).entries()
  );

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Nomor Tiket',
      'Judul',
      'Jenis',
      'Kode Kategori',
      'Kategori',
      'Pelapor',
      'Departemen',
      'Prioritas',
      'Status',
      'PIC',
      'Tanggal Dibuat',
      'Target SLA',
    ];
    const rows = filteredTickets.map((t) => [
      t.ticketNumber,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.categoryCode || '',
      t.categoryName,
      t.reporterName,
      t.department,
      t.priority,
      t.status,
      t.currentPicName || 'Belum Ditugaskan',
      new Date(t.createdAt).toLocaleDateString('id-ID'),
      new Date(t.dueAt).toLocaleDateString('id-ID'),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tiket_PLN_CorpU_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pageTitle = {
    all: 'Daftar Semua Tiket',
    'my-tickets': 'Tiket Pelaporan Saya',
    'my-assignments': 'Tiket Penugasan Saya (PIC)',
  }[mode];

  const pageSubtitle = {
    all: 'Kelola seluruh laporan kendala, insiden, dan permohonan layanan di PLN Corporate University.',
    'my-tickets': 'Pantau status dan tindak lanjut laporan yang telah Anda ajukan ke Helpdesk CorpU.',
    'my-assignments': 'Daftar tiket yang ditugaskan kepada Anda untuk ditangani dan diselesaikan.',
  }[mode];

  return (
    <div className="space-y-4">
      {/* Page Title & Top CTA Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{pageTitle}</h1>
          <p className="text-xs text-slate-500 mt-1">{pageSubtitle}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => onNavigate('create-ticket')}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Buat Tiket Baru</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex items-center border-b border-slate-200 overflow-x-auto px-4 gap-1 py-1 bg-slate-50/60">
          {(mode === 'my-assignments'
            ? [
                { id: 'all', label: 'Semua Penugasan Saya', count: tabCounts.all },
                { id: 'new_assigned', label: 'Penugasan Baru', count: tabCounts.new_assigned },
                { id: 'in_progress', label: 'Dalam Proses', count: tabCounts.in_progress },
                { id: 'waiting_reporter', label: 'Menunggu Pelapor', count: tabCounts.waiting_reporter },
                { id: 'waiting_third_party', label: 'Menunggu Pihak Ketiga', count: tabCounts.waiting_third_party },
                { id: 'resolved', label: 'Selesai', count: tabCounts.resolved },
              ]
            : [
                { id: 'all', label: 'Semua Tiket', count: tabCounts.all },
                { id: 'new', label: 'Baru', count: tabCounts.new },
                { id: 'open', label: 'Terbuka', count: tabCounts.open },
                { id: 'in_progress', label: 'Dalam Proses', count: tabCounts.in_progress },
                { id: 'on_hold', label: 'Menunggu', count: tabCounts.on_hold },
                { id: 'resolved', label: 'Selesai', count: tabCounts.resolved },
                { id: 'closed', label: 'Ditutup', count: tabCounts.closed },
              ]
          ).map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isTabActive
                    ? 'border-emerald-700 text-emerald-800 bg-emerald-50/60 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono-numbers ${
                    isTabActive ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar (Inspired by Image 2: Add Filter, Priority, Status, Search, Reset) */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Prioritas:</span>
              <select
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
              >
                <option value="ALL">Semua Prioritas</option>
                <option value="Kritis">Kritis</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium max-w-[160px] truncate"
              >
                <option value="ALL">Semua Kategori</option>
                {categoryNames.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
              >
                <option value="ALL">Semua Status</option>
                <option value="Baru">Baru</option>
                <option value="Diverifikasi">Diverifikasi</option>
                <option value="Ditugaskan">Ditugaskan</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Menunggu Pelapor">Menunggu Pelapor</option>
                <option value="Menunggu Pihak Ketiga">Menunggu Pihak Ketiga</option>
                <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditutup">Ditutup</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>

            {/* Reset Button */}
            {(selectedPriority !== 'ALL' ||
              selectedCategory !== 'ALL' ||
              selectedStatus !== 'ALL' ||
              selectedPic !== 'ALL' ||
              searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari tiket di sini..."
              className="w-full pl-8 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {filteredTickets.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Tidak ada tiket ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Kriteria pencarian atau filter Anda tidak cocok dengan tiket yang ada saat ini.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nomor Tiket</th>
                  <th className="py-3 px-4">Subjek Kendala</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">Petugas PIC</th>
                  <th className="py-3 px-4">Pelapor & Dept</th>
                  <th className="py-3 px-4">Tanggal Dibuat</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Target SLA</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedTickets.map((ticket) => {
                  const sla = getSlaStatus(ticket.createdAt, ticket.dueAt, ticket.status, ticket.resolvedAt);
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => onNavigate('ticket-detail', ticket.id)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      {/* Ticket Number */}
                      <td className="py-3.5 px-4 font-mono-numbers font-bold text-emerald-800 whitespace-nowrap">
                        #{ticket.ticketNumber}
                      </td>

                      {/* Subject & Type */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                          {ticket.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          {ticket.categoryCode && (
                            <span className="font-mono text-[10px] font-bold text-[#1765B3] bg-[#EFF8FF] border border-[#B8DEFF] px-1.5 py-0.2 rounded shrink-0">
                              {ticket.categoryCode}
                            </span>
                          )}
                          <span className="truncate">{ticket.categoryName}</span>
                          <span>·</span>
                          <span className="text-slate-500 font-medium shrink-0">{ticket.type}</span>
                        </div>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </td>

                      {/* Assignee / PIC */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ticket.currentPicName ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center justify-center shrink-0 border border-amber-300">
                              {ticket.currentPicName.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                              {formatPicDisplayName(ticket.currentPicId, ticket.currentPicName)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">- Belum Ada -</span>
                        )}
                      </td>

                      {/* Reporter & Department */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 truncate max-w-[130px]">
                          {ticket.reporterName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {ticket.department}
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 font-mono-numbers text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(ticket.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ticket.status} size="sm" />
                      </td>

                      {/* SLA Target */}
                      <td className="py-3.5 px-4 font-mono-numbers whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold flex items-center gap-1 ${
                            sla.isOverdue
                              ? 'text-rose-600'
                              : sla.isNearingBreach
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          {sla.remainingFormatted}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('ticket-detail', ticket.id);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:text-emerald-800 shadow-2xs transition-colors cursor-pointer"
                        >
                          Kelola
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer (Matching uploaded Image 2: Showing X tickets, Previous, 1, 2, 3..., Next) */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="text-xs text-slate-500 font-mono-numbers">
            Menampilkan <span className="font-bold text-slate-800">{paginatedTickets.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{filteredTickets.length}</span> tiket
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold font-mono-numbers cursor-pointer ${
                  currentPage === page
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-white hover:border border-slate-200'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
