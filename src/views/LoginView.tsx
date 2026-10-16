import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Shield,
  Briefcase,
  User,
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  UserCog,
  Check,
} from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../services/authService';

interface LoginViewProps {
  onLoginSuccess: (user: UserType) => void;
}

interface DemoAccount {
  label: string;
  roleTitle: string;
  username: string;
  password: string;
  icon: 'admin' | 'pelapor' | 'pic' | 'manajemen' | 'user_management';
  description: string;
  badge: string;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Admin Ticketing',
    roleTitle: 'Administrator Helpdesk',
    username: 'admin',
    password: 'admin123',
    icon: 'admin',
    description: 'Verifikasi, Disposisi PIC, SLA & Laporan',
    badge: 'ADMIN',
    badgeColor: 'bg-[#EFF8FF] text-[#0A3D73] border-[#B8DEFF]',
  },
  {
    label: 'Manajemen CorpU',
    roleTitle: 'Pimpinan / GM',
    username: 'manajemen',
    password: 'manajemen123',
    icon: 'manajemen',
    description: 'Executive Dashboard, KPI & Rekap SLA',
    badge: 'MANAJEMEN',
    badgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
  },
  {
    label: 'Pelapor (Andi)',
    roleTitle: 'Pelapor / Pegawai',
    username: 'andi',
    password: 'user123',
    icon: 'pelapor',
    description: 'Buat Tiket & Pantau Status Pengajuan',
    badge: 'PELAPOR',
    badgeColor: 'bg-sky-50 text-sky-900 border-sky-200',
  },
  {
    label: 'PIC 1 (Budi Santoso)',
    roleTitle: 'PIC Jaringan',
    username: 'budi',
    password: 'pic123',
    icon: 'pic',
    description: 'Network & IT Infrastructure',
    badge: 'PIC NETWORK',
    badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
  },
  {
    label: 'PIC 2 (Rina Wijaya)',
    roleTitle: 'PIC Hardware',
    username: 'rina',
    password: 'pic123',
    icon: 'pic',
    description: 'IT Support & Hardware',
    badge: 'PIC HARDWARE',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  {
    label: 'PIC 3 (Dimas Aditya)',
    roleTitle: 'PIC Aplikasi',
    username: 'dimas',
    password: 'pic123',
    icon: 'pic',
    description: 'Application Support & LMS',
    badge: 'PIC APLIKASI',
    badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  },
  {
    label: 'Manajemen User',
    roleTitle: 'Admin Akun & Hak Akses',
    username: 'admin_user',
    password: 'admin123',
    icon: 'user_management',
    description: 'Kelola Pengguna, Akun NIP, Role & Keaktifan Sistem',
    badge: 'USER ADMIN',
    badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  },
];

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string>('admin');

  const executeLogin = async (id: string, pass: string) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.login(id, pass);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Autentikasi gagal. Silakan coba kembali.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi gangguan jaringan pada sistem autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(identifier, password);
  };

  const handleSelectAccount = (acc: DemoAccount) => {
    setIdentifier(acc.username);
    setPassword(acc.password);
    setSelectedDemo(acc.username);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#F8FAFC] to-[#EFF8FF] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A3D73] via-[#1765B3] to-[#2589E8] text-amber-300 shadow-md border border-[#1765B3]/30">
            <svg className="w-8 h-8 fill-current filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" viewBox="0 0 24 24">
              <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight font-heading">
              PLN CORPORATE UNIVERSITY
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2589E8] mt-0.5">
              TICKETING MANAGEMENT SYSTEM
            </p>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Portal Layanan Terpadu Penanganan Insiden, Keluhan, dan Permintaan Dukungan TI & Pembelajaran
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">Masuk ke Portal Layanan</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan kredensial Anda atau pilih salah satu akun pengujian
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF] text-[10px] font-bold rounded-full uppercase shadow-2xs">
              Sistem Aktif
            </span>
          </div>

          {/* Quick Demo Account Selector (Autofill) */}
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Pilih Akun Demo (Klik untuk Isi Formulir):
              </span>
              <span className="text-[10px] text-slate-400 font-medium">1-Klik Pilih</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedDemo === acc.username;
                const isFullWidth = acc.icon === 'user_management';
                return (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isFullWidth ? 'sm:col-span-2' : ''
                    } ${
                      isSelected
                        ? 'bg-[#EFF8FF] border-[#2589E8] ring-2 ring-[#2589E8]/30 shadow-xs'
                        : 'bg-white border-[#E2E8F0] hover:border-[#B8DEFF] hover:bg-[#F0F7FF]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {acc.icon === 'admin' ? (
                          <Shield className="w-4 h-4 text-[#1765B3] shrink-0" />
                        ) : acc.icon === 'manajemen' ? (
                          <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : acc.icon === 'pic' ? (
                          <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : acc.icon === 'user_management' ? (
                          <UserCog className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <User className="w-4 h-4 text-sky-600 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-[#0F172A] truncate">
                          {acc.label}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${acc.badgeColor} shrink-0`}>
                        {acc.badge}
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full text-[10px] text-slate-500 mt-1">
                      <span className="font-mono-numbers">
                        user: <strong className="text-slate-800">{acc.username}</strong>
                      </span>
                      <span className="text-slate-400 truncate max-w-[170px] text-right font-medium">
                        {acc.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="leading-relaxed font-semibold">{errorMessage}</span>
                <p className="text-[11px] text-rose-700">
                  Tip: Klik salah satu kartu akun di atas untuk mengisi kredensial valid secara instan.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username Input */}
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-bold text-slate-800 mb-1.5">
                Username / Email / NIP
              </label>
              <div className="relative">
                <input
                  id="login-identifier"
                  type="text"
                  required
                  autoComplete="username"
                  disabled={isLoading}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setSelectedDemo('');
                  }}
                  placeholder="Contoh: admin, manajemen, atau andi"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2589E8] focus:bg-white text-[#0F172A] placeholder:text-slate-400 font-medium disabled:opacity-50 transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Input with show/hide */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-800">
                  Password Akun
                </label>
                <span className="text-[11px] text-[#2589E8] font-medium font-mono-numbers">
                  Default: {password || 'admin123'}
                </span>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun Anda"
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2589E8] focus:bg-white text-[#0F172A] placeholder:text-slate-400 font-medium disabled:opacity-50 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer focus:outline-none p-0.5"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0A3D73] via-[#1765B3] to-[#2589E8] hover:opacity-95 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Kredensial...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick 1-Click Login Shortcuts */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                  Akses Cepat 1-Klik Masuk Langsung
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeLogin('admin', 'admin123')}
                    className="py-1.5 px-2 bg-[#EFF8FF] hover:bg-[#D9EEFF] text-[#0A3D73] font-bold text-[11px] rounded-lg border border-[#B8DEFF] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#1765B3]" />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeLogin('manajemen', 'manajemen123')}
                    className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-[11px] rounded-lg border border-purple-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Briefcase className="w-3 h-3 text-purple-700" />
                    <span>Manajemen</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeLogin('andi', 'user123')}
                    className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-[11px] rounded-lg border border-sky-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <User className="w-3 h-3 text-sky-700" />
                    <span>Pelapor</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeLogin('budi', 'pic123')}
                    className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg border border-amber-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Wrench className="w-3 h-3 text-amber-700" />
                    <span>PIC 1</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Security & Copyright footer */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#2589E8]" />
            <span>Koneksi Aman Terenkripsi · Sesi Terautentikasi PLN Corporate University</span>
          </p>
          <p className="text-slate-400">© 2026 PT PLN (Persero) Corporate University. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </div>
  );
};

