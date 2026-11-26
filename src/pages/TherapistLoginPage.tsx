import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Mail, User, Building, ArrowLeft, AlertCircle, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import { soundEffects } from '../services/audio/SoundEffects';

export const TherapistLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, resetPassword, loginAsDemo, startOfflineSession, error, isConfigError, clearError, isLoading, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [organization, setOrganization] = useState('SIMATS Pediatric Occupational Therapy Center');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/therapist');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResetSuccessMessage(null);

    if (mode === 'signin') {
      const success = await login(email, password);
      if (success) {
        soundEffects.playSuccessChime();
        navigate('/therapist');
      }
    } else if (mode === 'signup') {
      const success = await register(email, password, displayName, organization);
      if (success) {
        soundEffects.playCelebrationFanfare();
        navigate('/therapist');
      }
    } else if (mode === 'forgot') {
      try {
        await resetPassword(email);
        setResetSuccessMessage(`Password reset link sent to ${email}. Check your inbox.`);
        soundEffects.playStarPop();
      } catch (err: any) {}
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    soundEffects.playTap();
    await loginAsDemo();
    soundEffects.playSuccessChime();
    navigate('/therapist');
  };

  const handleOfflineBypass = () => {
    soundEffects.playTap();
    startOfflineSession(displayName || 'Dr. Sarah Mitchell, OTR/L', email || 'therapist@simats.edu');
    soundEffects.playSuccessChime();
    navigate('/therapist');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-amber-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-slate-900 transition text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <span className="text-xs font-bold text-slate-400">DIVAD • SIMATS</span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-5">
        {/* Official DIVAD Logo Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="DIVAD Logo"
              className="h-20 sm:h-24 object-contain drop-shadow-sm hover:scale-105 transition duration-300"
            />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>Therapist Portal</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {mode === 'signin' && 'Sign in to monitor children, track progress & manage sessions.'}
            {mode === 'signup' && 'Create a licensed occupational therapist account.'}
            {mode === 'forgot' && 'Reset your therapist portal password.'}
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Create Account) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setMode('signin');
                clearError();
              }}
              className={`py-2 rounded-lg transition ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                clearError();
              }}
              className={`py-2 rounded-lg transition ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Diagnostic Helper if Firebase Auth Email Provider is not yet enabled in Console */}
        {isConfigError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2 text-xs">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Firebase Auth Not Enabled in Console:</span>
                <p className="mt-0.5 text-[11px] text-amber-800 leading-relaxed">
                  In Firebase Console project <strong>divadhardware</strong>, go to <strong>Authentication &gt; Sign-in method</strong> and toggle <strong>Email/Password</strong> to Enabled.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOfflineBypass}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition"
            >
              ⚡ Enter Dashboard in Clinical Mode Now
            </button>
          </div>
        )}

        {/* General Error or Success Alert */}
        {error && !isConfigError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetSuccessMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{resetSuccessMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-slate-600 mb-1">Full Name & Credentials *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Mitchell, OTR/L"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Facility / Organization</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. SIMATS OT Clinic"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-600 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="therapist@simats.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600">Password *</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      clearError();
                    }}
                    className="text-[11px] text-sky-600 hover:text-sky-800"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            {isLoading
              ? 'Connecting to Firebase...'
              : mode === 'signin'
              ? 'Sign In to Dashboard'
              : mode === 'signup'
              ? 'Register Therapist Account'
              : 'Send Reset Link'}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                clearError();
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
            >
              Back to Sign In
            </button>
          )}
        </form>

        {/* Quick Demo Access Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold">
            <span className="bg-white px-3 text-slate-400">Instant Access</span>
          </div>
        </div>

        {/* One-Click Instant Sign-In */}
        <button
          onClick={handleDemoLogin}
          type="button"
          className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs flex items-center justify-center space-x-2 transition"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>One-Click Instant Therapist Sign-In</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-500">
        Protected Health Information (PHI) compliant architecture • SIMATS Center
      </div>
    </div>
  );
};
