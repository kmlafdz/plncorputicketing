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
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Admin Ticketing',
    roleTitle: 'Administrator',
    username: 'admin',
    password: 'admin123',
    icon: 'admin',
    description: 'Verifikasi, Disposisi PIC, SLA & Laporan',
  },
  {
    label: 'Manajemen CorpU',
    roleTitle: 'Pimpinan / GM',
    username: 'manajemen',
    password: 'manajemen123',
    icon: 'manajemen',
    description: 'Executive Dashboard, KPI & Rekap SLA',
  },
  {
    label: 'Pelapor (Andi)',
    roleTitle: 'Pelapor / User',
    username: 'andi',
    password: 'user123',
    icon: 'pelapor',
    description: 'Buat Tiket & Pantau Status Pengajuan',
  },
  {
    label: 'PIC 1 (Budi Santoso)',
    roleTitle: 'PIC Jaringan',
    username: 'budi',
    password: 'pic123',
    icon: 'pic',
    description: 'PIC 1 · Network & Infrastructure',
  },
  {
    label: 'PIC 2 (Rina Wijaya)',
    roleTitle: 'PIC Hardware',
    username: 'rina',
    password: 'pic123',
    icon: 'pic',
    description: 'PIC 2 · IT Support & Hardware',
  },
  {
    label: 'PIC 3 (Dimas Aditya)',
    roleTitle: 'PIC Aplikasi',
    username: 'dimas',
    password: 'pic123',
    icon: 'pic',
    description: 'PIC 3 · Application Support & LMS',
  },
  {
    label: 'Manajemen User',
    roleTitle: 'Administrator Pengguna & Hak Akses',
    username: 'admin_user',
    password: 'admin123',
    icon: 'user_management',
    description: 'Akses Kelola Akun, NIP, Role Pengguna & Status Keaktifan',
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

  const handleSelectAccount = (acc: DemoAccount, autoSubmit = false) => {
    setIdentifier(acc.username);
    setPassword(acc.password);
    setSelectedDemo(acc.username);
    setErrorMessage(null);

    if (autoSubmit) {
      executeLogin(acc.username, acc.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-100 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#005160] text-amber-300 shadow-md border-2 border-[#003d49]">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
              PLN CORPORATE UNIVERSITY
            </h1>
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 mt-0.5">
              TICKETING MANAGEMENT SYSTEM
            </p>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sistem Informasi Pelayanan & Pengelolaan Insiden, Keluhan, dan Permintaan Layanan Terpadu
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Masuk ke Portal Layanan</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan kredensial atau pilih akun pengujian di bawah ini
              </p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200 uppercase">
              Auth v2.0
            </span>
          </div>

          {/* Quick Demo Account Selector (1-Click Fill & Instant Login) */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Pilih Akun Demo (Klik untuk Isi Formulir):
              </span>
              <span className="text-[10px] text-slate-400">Siap Digunakan</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedDemo === acc.username;
                const isFullWidth = acc.icon === 'user_management';
                return (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleSelectAccount(acc, false)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isFullWidth ? 'col-span-2 sm:col-span-3 bg-gradient-to-r from-teal-50/90 to-emerald-50/70 border-teal-300' : ''
                    } ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 shadow-2xs'
                        : isFullWidth
                        ? 'border-teal-300 hover:border-teal-500 hover:bg-teal-50'
                        : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5">
                        {acc.icon === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-emerald-700" />
                        ) : acc.icon === 'manajemen' ? (
                          <Briefcase className="w-3.5 h-3.5 text-purple-700" />
                        ) : acc.icon === 'pic' ? (
                          <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        ) : acc.icon === 'user_management' ? (
                          <UserCog className="w-4 h-4 text-teal-700" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-sky-600" />
                        )}
                        <span className="text-[11px] font-bold text-slate-900 truncate">
                          {acc.label}
                        </span>
                        {isFullWidth && (
                          <span className="text-[9px] bg-teal-100 text-teal-900 font-extrabold px-1.5 py-0.2 rounded border border-teal-200">
                            Akses Pengguna & Akun
                          </span>
                        )}
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between w-full text-[10px] text-slate-500">
                      <span>
                        user: <strong className="text-slate-700">{acc.username}</strong>
                      </span>
                      {isFullWidth && (
                        <span className="text-teal-800 font-semibold hidden sm:inline text-[10px]">
                          {acc.description}
                        </span>
                      )}
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
                  Tip: Klik salah satu tombol akun di atas untuk mengisi kredensial valid secara instan.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Email / Username / NIP
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="username"
                  disabled={isLoading}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setSelectedDemo('');
                  }}
                  placeholder="Contoh: admin atau andi"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium disabled:opacity-50"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Input with show/hide */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Password Akun
                </label>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Default: {password || 'admin123'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun Anda"
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Catatan: Dalam mode demo ini, Anda juga dapat memasukkan password apa saja.
              </p>
            </div>

            {/* Submit Action Buttons */}
            <div className="pt-1 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: '#00537a' }}
                className="w-full py-2.5 px-4 hover:brightness-110 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                  Akses Cepat 1-Klik Akun Demo
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeLogin('admin', 'admin123')}
                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
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
                    className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] rounded-lg border border-sky-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <User className="w-3 h-3 text-sky-600" />
                    <span>Pelapor (Andi)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeLogin('budi', 'pic123')}
                    className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg border border-amber-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Wrench className="w-3 h-3 text-amber-700" />
                    <span>PIC 1 (Budi Santoso)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeLogin('rina', 'pic123')}
                    className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[11px] rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Wrench className="w-3 h-3 text-blue-700" />
                    <span>PIC 2 (Rina Wijaya)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeLogin('dimas', 'pic123')}
                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Wrench className="w-3 h-3 text-emerald-700" />
                    <span>PIC 3 (Dimas Aditya)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeLogin('admin_user', 'admin123')}
                    className="py-1.5 px-2 bg-teal-50 hover:bg-teal-100 text-teal-950 font-bold text-[11px] rounded-lg border border-teal-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer col-span-2 sm:col-span-3"
                  >
                    <UserCog className="w-3.5 h-3.5 text-teal-700" />
                    <span>Manajemen User (Akses Pengguna & Akun)</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Security & Copyright info */}
        <div className="text-center text-[11px] text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1 font-medium text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Koneksi Terenkripsi · Sesi Terautentikasi PLN CorpU
          </p>
          <p>© 2026 PLN Corporate University. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </div>
  );
};

