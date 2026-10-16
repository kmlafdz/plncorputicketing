import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Building2,
  KeyRound,
  Shield,
  Clock,
  Zap,
} from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../services/authService';

interface LoginViewProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Silakan masukkan NIP/Username dan kata sandi Anda.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.login(identifier.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'NIP/Username atau kata sandi tidak sesuai. Silakan periksa kembali.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi kendala pada server autentikasi. Silakan coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* Subtle Background Ambience Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-b from-[#EFF8FF] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#D9EEFF]/40 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Main Dual-Panel Enterprise Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#E2E8F0] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row min-h-[520px]">
        
        {/* Left Side: Brand Showcase & Institutional Identity (45%) */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#0A3D73] via-[#0D4B8C] to-[#1765B3] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Geometric Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#2589E8]/20 rounded-full blur-xl pointer-events-none" />

          {/* Top Branding Section */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0A3D73] to-[#2589E8] border border-white/20 flex items-center justify-center text-amber-300 shadow-md">
                <svg className="w-7 h-7 fill-current filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight block leading-tight text-white font-heading">
                  PLN CORPORATE UNIVERSITY
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#B8DEFF] uppercase block mt-0.5">
                  PT PLN (PERSERO)
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug font-heading">
                Service Desk & Ticketing System
              </h1>
              <p className="text-xs text-white/80 leading-relaxed mt-2 font-medium">
                Pusat penanganan terpadu gangguan teknologi, dukungan kelas diklat, fasilitas pembelajaran, dan permintaan operasional pembelajaran.
              </p>
            </div>
          </div>

          {/* Middle Feature Highlights */}
          <div className="relative z-10 py-6 space-y-3.5 my-auto">
            <div className="flex items-center gap-3 text-xs text-white/90">
              <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-amber-300">
                <Zap className="w-3.5 h-3.5" />
              </span>
              <span>Triase & Auto-Assignment Berbasis ITIL</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/90">
              <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-sky-300">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <span>Pemantauan SLA Terintegrasi & Real-time</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/90">
              <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <span>Otorisasi Berjenjang & Audit Trail Lengkap</span>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-white/70 flex items-center justify-between">
            <span>Sistem Helpdesk Terpusat</span>
            <span className="font-mono-numbers font-semibold text-white/90">v1.0.0-PROD</span>
          </div>
        </div>

        {/* Right Side: Professional Enterprise Login Form (55%) */}
        <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div className="space-y-6">
            {/* Header Form */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight font-heading">
                  Masuk ke Portal Layanan
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2589E8] animate-pulse" />
                  Sesi Aman
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Silakan masukkan NIP Pegawai / Username kedinasan dan kata sandi Anda.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in-50 duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <span className="font-bold block text-rose-950">Gagal Masuk</span>
                  <span className="text-[11px] leading-relaxed text-rose-800">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Identifier */}
              <div className="space-y-1.5">
                <label
                  htmlFor="user-identifier"
                  className="block text-xs font-bold text-slate-800"
                >
                  NIP Pegawai / Username
                </label>
                <div className="relative">
                  <input
                    id="user-identifier"
                    type="text"
                    required
                    autoComplete="username"
                    disabled={isLoading}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Masukkan NIP atau username kedinasan..."
                    className="w-full text-xs pl-10 pr-3.5 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2589E8] focus:bg-white focus:border-[#2589E8] transition-all font-medium disabled:opacity-50"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="user-password"
                    className="block text-xs font-bold text-slate-800"
                  >
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-[11px] text-[#1765B3] hover:text-[#0A3D73] font-semibold transition-colors cursor-pointer hover:underline"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="user-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full text-xs pl-10 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2589E8] focus:bg-white focus:border-[#2589E8] transition-all font-medium disabled:opacity-50"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#1765B3] focus:ring-[#2589E8] cursor-pointer"
                  />
                  <span className="font-medium">Ingat saya di perangkat ini</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#0A3D73] via-[#1765B3] to-[#2589E8] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring active:scale-[0.99] disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Memverifikasi Kredensial...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Security Compliance */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Koneksi Aman TLS 1.3 Terenkripsi</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-[#1765B3] hover:underline font-semibold cursor-pointer"
            >
              Informasi Akun Layanan
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Copyright & Help */}
      <div className="text-center text-xs text-slate-500 mt-5 space-y-1">
        <p className="font-medium">
          PT PLN (Persero) Corporate University · Hak Cipta Dilindungi Undang-Undang
        </p>
        <p className="text-[11px] text-slate-400">
          Aplikasi Helpdesk Penanganan Insiden & Permintaan Layanan TI Diklat
        </p>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#EFF8FF] text-[#1765B3] border border-[#B8DEFF] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Bantuan Akun & Autentikasi
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Akses sistem ini diperuntukkan bagi pegawai, instruktur, pengelola diklat, dan petugas teknis TI di lingkungan PT PLN (Persero) Corporate University.
              </p>
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono-numbers">
                <span className="font-sans font-bold text-slate-800 block text-[11px]">
                  Kredensial Pengujian Standar:
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Admin Helpdesk:</span>
                    <strong className="text-slate-800">admin / admin123</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Manajemen / GM:</span>
                    <strong className="text-slate-800">manajemen / manajemen123</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Pelapor / Pegawai:</span>
                    <strong className="text-slate-800">andi / user123</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Petugas PIC Teknis:</span>
                    <strong className="text-slate-800">budi / pic123</strong>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Jika mengalami kendala lupa kata sandi atau akun terblokir, hubungi Unit TI PLN CorpU melalui ekstensi internal atau email ke <span className="font-mono text-slate-700">it.corpu@pln.co.id</span>.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#1765B3] hover:bg-[#0A3D73] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
