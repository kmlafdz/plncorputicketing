import React from 'react';
import {
  User,
  Shield,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Clock,
  Ticket,
  LogOut,
} from 'lucide-react';
import { User as UserType, Ticket as TicketType } from '../types';

interface ProfileViewProps {
  currentUser: UserType;
  tickets: TicketType[];
  onNavigate: (view: string, ticketId?: string) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  tickets,
  onNavigate,
  onLogout,
}) => {
  const userTickets = tickets.filter((t) => t.reporterId === currentUser.uid);
  const assignedTickets = tickets.filter((t) => t.currentPicId === currentUser.uid);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A3D73] to-[#1765B3] text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 truncate">{currentUser.name}</h1>
                <span className="bg-[#EFF8FF] text-[#1765B3] border border-[#B8DEFF] text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono-numbers">NIP: {currentUser.employeeId}</p>
              <p className="text-xs text-slate-600 font-medium truncate">{currentUser.department}</p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 self-stretch sm:self-auto justify-center"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Keluar dari Akun</span>
            </button>
          )}
        </div>

        {/* Contact & Organization Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1765B3]" />
              Email Perusahaan
            </span>
            <p className="font-semibold text-slate-800">{currentUser.email}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#1765B3]" />
              Kontak / Telepon
            </span>
            <p className="font-semibold text-slate-800 font-mono-numbers">{currentUser.phone || '-'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#1765B3]" />
              Instansi
            </span>
            <p className="font-semibold text-slate-800">PLN Corporate University</p>
          </div>
        </div>

        {/* Privileges Breakdown */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Hak Akses & Otorisasi Sistem ({currentUser.role.toUpperCase()})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            {currentUser.role === 'admin' && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verifikasi & Triase seluruh tiket laporan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Penetapan dan penggantian petugas PIC</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Penyesuaian prioritas dan matriks SLA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Akses penuh Audit Log & Laporan Kinerja</span>
                </div>
              </>
            )}

            {currentUser.role === 'pic' && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Menerima & menangani penugasan tiket teknis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mencatat progres teknis & catatan internal rahasia</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Meminta informasi tambahan dari pelapor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mendokumentasikan solusi & menyelesaikan tiket</span>
                </div>
              </>
            )}

            {currentUser.role === 'pelapor' && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Menerbitkan tiket laporan insiden & keluhan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Melacak progres penyelesaian secara real-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Berkomunikasi langsung dengan petugas melalui pesan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mengonfirmasi hasil solusi atau mengajukan buka kembali</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dedicated Account Logout Action Card */}
        {onLogout && (
          <div className="pt-2 border-t border-slate-100">
            <div className="p-4 sm:p-5 bg-rose-50/70 rounded-xl border border-rose-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-rose-950 flex items-center gap-1.5">
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Keluar dari Akun Kedinasan</span>
                </h4>
                <p className="text-[11px] sm:text-xs text-rose-700 leading-relaxed">
                  Akhiri sesi kerja Anda pada perangkat ini demi menjaga kerahasiaan data tiket dan informasi internal PLN Corporate University.
                </p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
