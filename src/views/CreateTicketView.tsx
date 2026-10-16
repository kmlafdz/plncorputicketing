import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Trash2,
  Info,
  Layers,
  MapPin,
  Laptop,
  Flame,
  ArrowRight,
  Shield,
  UserCheck,
  Wrench,
  Sparkles,
} from 'lucide-react';
import {
  Ticket,
  TicketType,
  ImpactLevel,
  UrgencyLevel,
  PriorityLevel,
  User as UserType,
  Category,
} from '../types';
import { storageService } from '../services/storageService';
import { calculatePriority, getPriorityColor } from '../utils/priorityCalculator';
import { calculateDueDates } from '../utils/slaCalculator';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { sortPicUsers, formatPicDisplayName } from '../utils/picHelpers';

interface CreateTicketViewProps {
  currentUser: UserType;
  categories: Category[];
  onNavigate: (view: string, ticketId?: string) => void;
}

export const CreateTicketView: React.FC<CreateTicketViewProps> = ({
  currentUser,
  categories,
  onNavigate,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TicketType>('Insiden');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-net');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [assetReference, setAssetReference] = useState('');
  const [selectedPicId, setSelectedPicId] = useState<string>('AUTO');
  const [impact, setImpact] = useState<ImpactLevel>('Tim');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Sedang');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Array<{ name: string; size: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  // Active PIC list deterministically ordered: PIC 1, PIC 2, PIC 3
  const picUsers = useMemo(() => {
    const list = storageService
      .getUsers()
      .filter((u) => u.role === 'pic' && u.isActive);
    return sortPicUsers(list);
  }, []);

  const selectedPic = picUsers.find((p) => p.uid === selectedPicId);

  // Selected category object & subcategories
  const selectedCat = categories.find((c) => c.id === categoryId) || categories[0];
  const subcategories = selectedCat ? selectedCat.subcategories : [];

  // Calculate priority automatically
  const calculatedPriority: PriorityLevel = calculatePriority(impact, urgency);

  // Calculate target SLA estimate
  const slaTarget = calculateDueDates(new Date().toISOString(), calculatedPriority);

  // Handle mock attachment upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newItems = files.map((file) => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      }));
      setAttachments((prev) => [...prev, ...newItems]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Mohon isi judul tiket dan deskripsi kendala secara lengkap.');
      return;
    }

    setIsSubmitting(true);

    try {
      const subcategoryName = subcategoryId || subcategories[0] || 'Umum';

      const newTicket = storageService.createTicket({
        title: title.trim(),
        description: description.trim(),
        type,
        categoryId: selectedCat.id,
        categoryName: selectedCat.name,
        categoryCode: selectedCat.code,
        subcategoryId: 'sub-custom',
        subcategoryName,
        reporterId: currentUser.uid,
        reporterName: currentUser.name,
        reporterEmail: currentUser.email,
        department: currentUser.department,
        location: location.trim() || 'Gedung Utama PLN Corporate University',
        assetReference: assetReference.trim() || undefined,
        currentPicId: selectedPicId !== 'AUTO' ? selectedPicId : undefined,
        impact,
        urgency,
        priority: calculatedPriority,
        status: 'Baru',
        dueAt: slaTarget.dueAt,
        slaResponseDueAt: slaTarget.responseDueAt,
        tags: [selectedCat.name.split(' ')[0], type],
      });

      setCreatedTicket(newTicket);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan tiket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdTicket) {
    const hasAssignedPic = !!createdTicket.currentPicName;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Tiket Berhasil Diterbitkan!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Laporan Anda telah tersimpan di sistem dan diteruskan secara otomatis.
            </p>
          </div>

          {/* Ticket Number Card */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 max-w-sm mx-auto font-mono-numbers">
            <span className="text-[11px] text-emerald-800 uppercase font-bold tracking-wider">
              Nomor Tiket Anda
            </span>
            <div className="text-2xl font-black text-emerald-900 tracking-wider mt-0.5">
              #{createdTicket.ticketNumber}
            </div>
          </div>

          {/* Auto-Assignment Status Banner (Requirement 2 & 11) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Status Penugasan PIC:
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  hasAssignedPic
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {hasAssignedPic
                  ? createdTicket.assignmentMethod === 'manual'
                    ? 'Ditugaskan ke PIC Pilihan Pelapor'
                    : 'Ditugaskan Otomatis'
                  : 'Menunggu Penetapan Manual'}
              </span>
            </div>

            {hasAssignedPic ? (
              <div className="flex items-start gap-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {formatPicDisplayName(createdTicket.currentPicId, createdTicket.currentPicName)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tim: <strong className="text-slate-700">{createdTicket.currentPicTeam}</strong> · Kategori: {createdTicket.categoryName}
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    ✓ Tiket telah langsung masuk ke menu "Penugasan Saya" di dashboard {formatPicDisplayName(createdTicket.currentPicId, createdTicket.currentPicName)}.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-800">
                Tiket telah disimpan ke antrean Helpdesk. Sistem belum menemukan PIC yang sedang aktif untuk kategori ini, sehingga Admin Ticketing telah menerima notifikasi untuk menetapkan PIC secara manual.
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('ticket-detail', createdTicket.id)}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lihat Detail & Lacak Progres</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCreatedTicket(null);
                setTitle('');
                setDescription('');
                setAttachments([]);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              + Buat Tiket Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Buat Tiket Baru
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              FORMULIR RESMI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Laporkan kendala fasilitas kelas, jaringan, akun pembelajaran LMS, atau ajukan permintaan layanan.
          </p>
        </div>

        {/* Reporter info badge */}
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
            <span className="text-[11px] text-slate-500">{currentUser.department}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Form Fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Informasi Laporan */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-emerald-700" />
              1. Informasi Laporan
            </h2>

            {/* Judul Tiket */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Subjek / Judul Kendala <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Proyektor ruang Baturraden tidak menyala dan lampu indikator merah"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Jenis Tiket & Kategori */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Jenis Laporan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TicketType)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-800 font-medium"
                >
                  <option value="Insiden">Insiden (Kerusakan / Gangguan)</option>
                  <option value="Keluhan">Keluhan (Kualitas Layanan / Suhu)</option>
                  <option value="Permintaan Layanan">Permintaan Layanan (Akun / Akses)</option>
                  <option value="Permintaan Perubahan">Permintaan Perubahan (Jadwal / Konfigurasi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Kategori Tiket <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId('');
                  }}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-800 font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.code ? `${cat.code} - ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subkategori & Lokasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Subkategori</label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-800 font-medium"
                >
                  {subcategories.map((sub, idx) => (
                    <option key={idx} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Lokasi / Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Gedung Diklat Lt. 3, Ruang Baturraden"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Aset Terkait & Ditugaskan ke PIC (Pilihan Pelapor) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Aset atau Perangkat Terkait <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={assetReference}
                  onChange={(e) => setAssetReference(e.target.value)}
                  placeholder="Nomor label inventaris atau hostname (contoh: PRJ-EPSON-02, AP-CISCO-LT3)"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Ditugaskan ke PIC <span className="text-emerald-700 font-normal text-[11px]">(Pilihan Pelapor)</span>
                  </label>
                  {selectedPicId !== 'AUTO' && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-700" />
                      PIC Dipilih
                    </span>
                  )}
                </div>
                <select
                  value={selectedPicId}
                  onChange={(e) => setSelectedPicId(e.target.value)}
                  className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium transition-all ${
                    selectedPicId !== 'AUTO'
                      ? 'bg-emerald-50/60 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-400'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="AUTO">Otomatis (Sesuai Aturan Kategori Sistem)</option>
                  {picUsers.map((p) => (
                    <option key={p.uid} value={p.uid}>
                      {`${formatPicDisplayName(p.uid, p.name)} (${p.team || 'Tim Teknis'})`}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Pilihan Petugas: <strong>PIC 1 (Budi Santoso - Network)</strong>, <strong>PIC 2 (Rina Wijaya - Hardware)</strong>, atau <strong>PIC 3 (Dimas Aditya - Application)</strong>.
                </p>
              </div>
            </div>

            {/* Deskripsi Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Deskripsi Kendala Secara Terperinci <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan secara runtut gejala kendala yang dialami, pesan error yang muncul, atau rincian permohonan Anda..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400 leading-relaxed font-medium"
              />
            </div>
          </div>

          {/* Section 2: Matriks Dampak & Urgensi */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-emerald-700" />
              2. Klasifikasi Dampak & Urgensi (Kalkulasi Prioritas ITIL)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Dampak */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Dampak Masalah (Impact):
                </label>
                <div className="space-y-1.5">
                  {(['Individu', 'Tim', 'Departemen', 'Banyak Pengguna'] as ImpactLevel[]).map((lvl) => (
                    <label
                      key={lvl}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        impact === lvl
                          ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="impact"
                        checked={impact === lvl}
                        onChange={() => setImpact(lvl)}
                        className="text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Urgensi */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Tingkat Urgensi (Urgency):
                </label>
                <div className="space-y-1.5">
                  {(['Rendah', 'Sedang', 'Tinggi'] as UrgencyLevel[]).map((lvl) => (
                    <label
                      key={lvl}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        urgency === lvl
                          ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        checked={urgency === lvl}
                        onChange={() => setUrgency(lvl)}
                        className="text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Lampiran & Bukti Pendukung */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Paperclip className="w-4 h-4 text-emerald-700" />
              3. Bukti Pendukung & Tangkapan Layar
            </h2>

            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-4 text-center bg-slate-50/50 transition-colors">
              <input
                type="file"
                multiple
                id="file-upload"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-xs text-slate-600"
              >
                <Paperclip className="w-6 h-6 text-slate-400" />
                <span className="font-semibold text-emerald-700 hover:underline">
                  Klik untuk unggah berkas atau tangkapan layar
                </span>
                <span className="text-[11px] text-slate-400">
                  Format gambar (PNG, JPG) atau PDF (Maksimal 10MB per berkas)
                </span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <span className="font-medium text-slate-800 truncate max-w-sm flex items-center gap-2">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      {att.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono-numbers">{att.size}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Live Calculation & Preview Summary */}
        <div className="space-y-5">
          {/* Priority Calculation Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Kalkulasi Prioritas Otomatis
            </h3>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-center space-y-2">
              <span className="text-[11px] text-slate-500 block">Tingkat Prioritas Dihasilkan:</span>
              <div className="flex justify-center">
                <PriorityBadge priority={calculatedPriority} size="lg" />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight pt-1">
                Dihitung dari Dampak: <span className="font-semibold text-slate-800">{impact}</span> & Urgensi:{' '}
                <span className="font-semibold text-slate-800">{urgency}</span>.
              </p>
            </div>

            {/* SLA & Assignment Preview */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Petugas Penanganan:</span>
                <span className="font-bold text-slate-900 truncate max-w-[170px] text-right">
                  {selectedPic
                    ? formatPicDisplayName(selectedPic.uid, selectedPic.name)
                    : 'Otomatis (Sistem Auto-Assignment)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tim Penanggung Jawab:</span>
                <span className="font-semibold text-slate-800">
                  {selectedPic?.team || selectedCat.defaultTeam}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimasi Target Respons:</span>
                <span className="font-semibold text-slate-800 font-mono-numbers">
                  {selectedCat.defaultSlaResponseMinutes} Menit
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimasi Batas Selesai:</span>
                <span className="font-semibold text-slate-800 font-mono-numbers">
                  {selectedCat.defaultSlaResolveHours} Jam Kerja
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Nomor tiket resmi (format <code className="font-mono-numbers font-bold">TCU-2026-XXXXX</code>) akan
                diterbitkan otomatis secara berurutan.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Menerbitkan Tiket...' : 'Kirim Laporan Tiket'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
