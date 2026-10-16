import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  HelpCircle,
  Clock,
  SlidersHorizontal,
  CheckCircle2,
  Building,
  Headphones,
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
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-white select-none">
      
      {/* LEFT PANEL: Immersive Corporate Brand Showcase (Full Screen Left Edge-to-Edge) */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 h-full bg-gradient-to-br from-[#072B53] via-[#0A3D73] to-[#1765B3] text-white flex-col justify-between p-8 lg:p-14 xl:p-16 relative overflow-hidden select-none shrink-0">
        
        {/* Subtle Geometric & Glow Accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2589E8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Identity */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="h-14 lg:h-16 w-auto p-2 bg-white rounded-2xl shadow-xl shadow-blue-950/40 flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Logo PLN"
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-base lg:text-lg tracking-tight block leading-none text-white font-heading">
                PLN CORPORATE UNIVERSITY
              </span>
              <span className="text-[11px] font-bold tracking-widest text-[#B8DEFF] uppercase block mt-1">
                PT PLN (PERSERO)
              </span>
            </div>
          </div>

          <div className="pt-4 max-w-md">
            <span className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-amber-300 mb-3">
              Portal Layanan Terpadu IT & Diklat
            </span>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight font-heading">
              Service Desk & Ticketing System
            </h1>
            <p className="text-xs lg:text-sm text-white/80 leading-relaxed mt-3 font-normal">
              Solusi manajemen insiden, keluhan teknis, dan permohonan dukungan fasilitas pembelajaran operasional PLN CorpU secara terintegrasi.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="relative z-10 py-8 my-auto space-y-4 max-w-md">
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/30 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300 mt-0.5">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs lg:text-sm font-bold text-white leading-snug">Triase & Auto-Assignment Otomatis</h3>
              <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">
                Disposisi cerdas ke petugas PIC (Network, Hardware, Aplikasi) berbasis kategori dan keahlian teknis.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400/20 to-sky-500/30 border border-sky-400/40 flex items-center justify-center shrink-0 text-sky-300 mt-0.5">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs lg:text-sm font-bold text-white leading-snug">Service Level Agreement (SLA) Real-Time</h3>
              <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">
                Pengawasan waktu respon dan resolusi ketat sesuai jam kerja operasional PLN Corporate University.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-500/30 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs lg:text-sm font-bold text-white leading-snug">Audit Trail & Keamanan Berjenjang</h3>
              <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">
                Rekam jejak tindakan transparan dan tidak dapat diubah demi kepatuhan tata kelola standar ITIL.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Identity */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-white/60" />
            <span>Unit Pembelajaran & Pengembangan Korporat</span>
          </div>
          <span className="font-mono font-semibold text-white/90">v1.0.0-PROD</span>
        </div>
      </div>

      {/* RIGHT PANEL: Enterprise Login Gateway Form (Full Screen Right Edge-to-Edge) */}
      <div className="w-full md:w-7/12 lg:w-1/2 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-16 xl:p-20 overflow-y-auto bg-white">
        
        {/* Top Header for Mobile Branding */}
        <div className="flex items-center justify-between w-full">
          {/* Mobile-only Emblem */}
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="h-9 w-auto flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Logo PLN"
                className="h-9 w-auto object-contain drop-shadow-2xs rounded-xs"
              />
            </div>
            <div>
              <span className="font-extrabold text-xs text-[#0F172A] block leading-none font-heading">PLN CORPU</span>
              <span className="text-[10px] text-[#2589E8] font-bold uppercase">Ticketing System</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 ml-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Server Helpdesk Aktif</span>
          </div>
        </div>

        {/* Centered Form Wrapper */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF] uppercase tracking-wide">
                Single Sign-On (SSO)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2 font-heading">
              Masuk ke Akun Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed font-normal">
              Masukkan NIP Pegawai atau Username kedinasan beserta kata sandi yang telah terdaftar.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start gap-3 animate-in fade-in duration-200 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <span className="font-bold block text-rose-950">Autentikasi Tidak Berhasil</span>
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
                className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
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
                  className="w-full text-xs sm:text-sm pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2589E8] focus:bg-white focus:border-[#2589E8] transition-all font-medium disabled:opacity-50"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="user-password"
                  className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
                >
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-xs text-[#1765B3] hover:text-[#0A3D73] font-semibold transition-colors cursor-pointer hover:underline"
                >
                  Bantuan Sandi?
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
                  placeholder="Masukkan kata sandi akun..."
                  className="w-full text-xs sm:text-sm pl-11 pr-11 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2589E8] focus:bg-white focus:border-[#2589E8] transition-all font-medium disabled:opacity-50"
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
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0A3D73] via-[#1765B3] to-[#2589E8] hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memverifikasi Kredensial...</span>
                  </>
                ) : (
                  <span>Masuk ke Sistem</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Help Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-xs text-slate-500 hover:text-[#1765B3] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Panduan Kredensial & Bantuan Akun</span>
            </button>
          </div>
        </div>

        {/* Bottom Security & Copyright Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Koneksi Aman TLS 1.3 Terenkripsi</span>
          </div>
          <p>© 2026 PT PLN (Persero) Corporate University</p>
        </div>
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
                  Panduan Akun & Autentikasi
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
                Aplikasi ini menggunakan sistem autentikasi terpusat PLN Corporate University. Pastikan Anda memasukkan username atau NIP yang sesuai.
              </p>
              
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono-numbers">
                <span className="font-sans font-bold text-slate-800 block text-xs">
                  Daftar Akun Standar Sistem:
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-sans font-medium">Admin Helpdesk</span>
                    <strong className="text-slate-800 font-mono">admin / admin123</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-sans font-medium">Manajemen / GM</span>
                    <strong className="text-slate-800 font-mono">manajemen / manajemen123</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-sans font-medium">Pelapor / Pegawai</span>
                    <strong className="text-slate-800 font-mono">andi / user123</strong>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 font-sans font-medium">Petugas PIC Teknis</span>
                    <strong className="text-slate-800 font-mono">budi / pic123</strong>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Untuk permohonan reset password kedinasan, silakan hubungi Tim TI Helpdesk PLN CorpU melalui ekstensi internal atau email ke <span className="font-mono text-slate-700">it.corpu@pln.co.id</span>.
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
