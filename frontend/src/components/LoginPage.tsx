import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { CampusTreeIcon } from './CampusTreeIcon';
import { requestPasswordReset, confirmPasswordReset } from '../services/authService';
import { ApiError } from '../services/api';
import {
  Sparkles,
  LogIn,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Info,
  Key,
  ArrowLeft,
  Mail,
} from 'lucide-react';

export function LoginPage() {
  const { login, hostelName } = useAppState();

  // App views: 'login' | 'forgot'
  // Public self-registration has been removed — accounts are created by an
  // administrator (see backend/seed/createAdmin.js for the very first admin).
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  // Purely cosmetic tab — the real role comes back from the backend after
  // login, so this only controls which icon/label is highlighted.
  const [roleTab, setRoleTab] = useState<'Head' | 'Staff' | 'Student'>('Head');

  // --- LOGIN STATES ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  // --- FORGOT PASSWORD STATES ---
  // Step 1: request a reset token for an email.
  // Step 2: submit that token + a new password.
  // (The backend has no email service wired up, so it returns the reset
  // token directly in the API response instead of emailing it.)
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    setSuccessStatus(null);

    if (!email.trim() || !password) {
      setErrorStatus('Please enter both your email and passcode.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // On success, AppContext sets currentUser and App.tsx swaps the view —
      // nothing else to do here.
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to sign in. Please try again.';
      setErrorStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    setSuccessStatus(null);

    if (!forgotEmail.trim()) {
      setErrorStatus('Please enter the email address on your account.');
      return;
    }

    setForgotSubmitting(true);
    try {
      const { resetToken: token } = await requestPasswordReset(forgotEmail.trim());
      setResetToken(token);
      setSuccessStatus('Reset token generated. Enter a new passcode below to finish.');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not find an account with that email.';
      setErrorStatus(message);
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    setSuccessStatus(null);

    if (!resetToken) return;

    if (newPassword.length < 4) {
      setErrorStatus('New passcode must be at least 4 characters.');
      return;
    }

    setForgotSubmitting(true);
    try {
      await confirmPasswordReset(resetToken, newPassword);
      setSuccessStatus('Passcode updated! You can now sign in with your new passcode.');
      setEmail(forgotEmail);
      setPassword('');
      setForgotEmail('');
      setResetToken(null);
      setNewPassword('');
      setMode('login');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'That reset token is invalid or has expired.';
      setErrorStatus(message);
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div id="login-container-root" className="flex min-h-screen items-center justify-center bg-warm-white font-sans p-6 relative overflow-hidden">

      {/* Structural Subtle Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9B07A_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

      {/* Pure elegance background shadow-circles */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gold-light/10 blur-3xl -z-1" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-ceramic/20 blur-3xl -z-1" />

      <div className="w-full max-w-md z-10 space-y-8">

        {/* Aesthetic Campus Brand Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white border border-ivory shadow-xs text-[#567A5E]">
            <CampusTreeIcon className="h-8 w-8 text-[#567A5E]" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-serif text-charcoal tracking-tight select-none">
              {hostelName}
            </h1>
            <p className="font-mono text-[10px] tracking-widest text-[#6E7D91] uppercase font-bold">
              Hostel Governance Suite &bull; Digital Portal
            </p>
          </div>
        </div>

        {/* Credentials Form Box */}
        <div className="rounded-2xl border border-ivory bg-white p-7 shadow-xs relative">

          {/* Header depending on layout mode */}
          <div className="mb-4 text-center">
            <h2 className="text-base font-serif text-charcoal font-bold">
              {mode === 'login' && 'Sign In to Workspace'}
              {mode === 'forgot' && 'Reset Security Credentials'}
            </h2>
            <p className="text-[10.5px] text-blue-gray-medium/85 mt-0.5">
              {mode === 'login' && 'Enter the email and passcode issued to you by the hostel administrator'}
              {mode === 'forgot' && 'Verify your account email to set a new passcode'}
            </p>
          </div>

          {/* Role tab — cosmetic only; your actual role is verified by the backend */}
          {mode === 'login' && (
            <div className="bg-warm-white p-1 rounded-xl flex items-center mb-5.5 border border-ivory">
              {(['Head', 'Staff', 'Student'] as const).map((r) => {
                const Icon = { Head: ShieldCheck, Staff: Briefcase, Student: GraduationCap }[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRoleTab(r); setErrorStatus(null); setSuccessStatus(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
                      roleTab === r
                        ? 'bg-charcoal text-white shadow-xs'
                        : 'text-blue-gray-medium hover:text-charcoal'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{r}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Error Message banner */}
          {errorStatus && (
            <div className="mb-4 rounded-xl bg-gold-light/20 border border-gold-accent/30 p-3.5 flex items-start gap-2.5 text-xs text-charcoal leading-relaxed animate-fade-in">
              <Info className="h-4 w-4 shrink-0 text-gold-accent mt-0.5" />
              <span>{errorStatus}</span>
            </div>
          )}

          {/* Success Message banner */}
          {successStatus && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5 text-xs text-emerald-800 leading-relaxed animate-fade-in">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successStatus}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                    placeholder="e.g. you@hostel.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                  Security Passcode
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-10 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-blue-gray-medium hover:text-charcoal cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                id="submit-login-btn"
                type="submit"
                disabled={submitting}
                className="mt-3 w-full cursor-pointer rounded-lg bg-charcoal px-4 py-3 text-xs font-bold text-white tracking-wide transition hover:bg-black active:scale-99 flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <LogIn className="h-4 w-4 text-gold-accent" />
                <span>{submitting ? 'Signing in…' : 'Enter Workspace Portal'}</span>
              </button>

              {/* Sub actions navigation */}
              <div className="flex items-center justify-center text-[11px] pt-1.5 border-t border-ivory/50 mt-1.5 text-blue-gray-medium">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setErrorStatus(null); setSuccessStatus(null); setResetToken(null); }}
                  className="hover:text-charcoal transition font-medium cursor-pointer"
                >
                  Forgot passcode?
                </button>
              </div>

              <p className="text-center text-[10.5px] text-blue-gray-medium/70 pt-1">
                Don't have an account? Ask your hostel administrator to create one for you.
              </p>
            </form>
          )}

          {/* MODE 2: FORGOT PASSWORD (real backend flow) */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {!resetToken ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. you@hostel.edu"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full cursor-pointer rounded-lg bg-charcoal px-4 py-3 text-xs font-bold text-white tracking-wide transition hover:bg-black active:scale-99 flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>{forgotSubmitting ? 'Looking up account…' : 'Send Reset Token'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  <div className="bg-zinc-50 border border-ivory p-3.5 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-charcoal block">Account Verified</span>
                    <p className="text-blue-gray-medium font-mono text-[11px] truncate">
                      {forgotEmail}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Set New Security Passcode (4+ chars)
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="Enter new security passcode"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full cursor-pointer rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-3 text-xs font-bold text-white tracking-wide transition active:scale-99 flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>{forgotSubmitting ? 'Updating…' : 'Update Security Key'}</span>
                  </button>
                </form>
              )}

              <div className="pt-1.5 text-center border-t border-ivory/50 mt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorStatus(null); setSuccessStatus(null); setResetToken(null); setForgotEmail(''); }}
                  className="font-semibold text-xs text-blue-gray-medium hover:text-charcoal inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to login gate</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
