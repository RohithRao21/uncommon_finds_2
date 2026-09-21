import React, { useState } from 'react';
import { X, LogIn, UserPlus, ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isDarkMode = true }) => {
  const { 
    login, 
    signup, 
    resetPassword, 
    resendVerificationEmail, 
    signInWithGoogle, 
    loginAsDemoUser,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showDemoOption, setShowDemoOption] = useState(false);

  if (!isOpen) return null;

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemoUser(email || 'maker@voxelform.tech', fullName || 'Voxelform Maker');
      onClose();
    } catch (err: any) {
      setError('Could not start demo session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        await signup(email, password, fullName);
        setVerificationSent(true);
        setSuccessMsg('Account created! A verification email has been sent to your address.');
      } else if (mode === 'signin') {
        await login(email, password);
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          throw new Error('Please enter your email address.');
        }
        await resetPassword(email);
        setSuccessMsg('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      console.error('Auth action failed:', err);
      let msg = err.message || 'Operation failed. Please try again.';
      
      if (err.code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        msg = 'Firebase Notice: Email/Password sign-in provider is disabled in the Firebase Console settings for this project. Enable Email/Password in Firebase Console > Authentication > Sign-in method, or continue with Demo Session below.';
        setShowDemoOption(true);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setError('Firebase Notice: Google Sign-In is disabled in Firebase Console settings. Enable Google provider in Firebase Console > Authentication, or continue with Demo Session.');
        setShowDemoOption(true);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await resendVerificationEmail();
      setSuccessMsg('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className={`relative w-full max-w-md rounded-2xl border overflow-hidden shadow-2xl transition-all ${
          isDarkMode ? 'bg-[#0f1115] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/10 bg-black/40' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} />
            <span className="font-mono-tech text-xs tracking-widest font-bold uppercase">
              {mode === 'signin' ? 'USER AUTHENTICATION' : mode === 'signup' ? 'CREATE ACCOUNT' : 'PASSWORD RESET'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (SignIn / SignUp) */}
        {mode !== 'forgot' && (
          <div className={`flex border-b font-mono-tech text-xs ${
            isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-100 bg-slate-100/50'
          }`}>
            <button
              onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
                mode === 'signin' 
                  ? (isDarkMode ? 'border-white text-white bg-white/5' : 'border-black text-black bg-white') 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN</span>
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
                mode === 'signup' 
                  ? (isDarkMode ? 'border-white text-white bg-white/5' : 'border-black text-black bg-white') 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>REGISTER</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-tech space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>

              {showDemoOption && (
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={loading}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-400 text-black font-bold text-[11px] uppercase tracking-wider hover:bg-amber-300 transition-all cursor-pointer shadow flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CONTINUE WITH DEMO MAKER SESSION</span>
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono-tech">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email Verification Banner */}
          {verificationSent && (
            <div className={`p-4 rounded-xl border space-y-2 font-mono-tech text-xs ${
              isDarkMode ? 'bg-white/5 border-white/20 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <div className="flex items-center gap-2 font-bold text-white">
                <Mail className="w-4 h-4" />
                <span>VERIFY YOUR EMAIL</span>
              </div>
              <p className="text-[11px] opacity-80">
                A verification link has been dispatched to <strong className="text-white">{email}</strong>. Please confirm your email address.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="text-[10px] underline hover:text-white uppercase font-bold cursor-pointer"
              >
                RESEND VERIFICATION LINK
              </button>
            </div>
          )}

          {mode !== 'forgot' && (
            <>
              {/* Google SSO */}
              <button
                onClick={handleGoogleClick}
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl border font-mono-tech text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isDarkMode 
                    ? 'border-white/20 bg-white/5 text-white hover:bg-white/10' 
                    : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className={`flex-grow border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
                <span className={`flex-shrink mx-3 text-[10px] font-mono-tech tracking-wider uppercase ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>OR EMAIL</span>
                <div className={`flex-grow border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 font-mono-tech text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block mb-1 text-[10px] text-slate-400 uppercase">FULL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-black/60 border-white/15 text-white focus:border-white' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'
                  }`}
                />
              </div>
            )}

            <div>
              <label className="block mb-1 text-[10px] text-slate-400 uppercase">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                placeholder="maker@voxelform.tech"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-black/60 border-white/15 text-white focus:border-white' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'
                }`}
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-slate-400 uppercase">PASSWORD</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                      className="text-[10px] text-slate-400 hover:text-white transition-colors"
                    >
                      FORGOT PASSWORD?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-3 pr-10 py-2 rounded-xl border outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-black/60 border-white/15 text-white focus:border-white' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'text-slate-400 hover:text-white' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-2 rounded-xl font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-slate-200' 
                  : 'bg-slate-900 text-white hover:bg-black'
              }`}
            >
              <span>
                {loading 
                  ? 'PROCESSING...' 
                  : mode === 'signin' 
                  ? 'AUTHENTICATE' 
                  : mode === 'signup' 
                  ? 'CREATE ACCOUNT' 
                  : 'SEND RESET LINK'}
              </span>
            </button>
          </form>

          {mode === 'forgot' && (
            <button
              onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 font-mono-tech mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO SIGN IN</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t text-center font-mono-tech text-[10px] ${
          isDarkMode ? 'border-white/10 bg-black/40 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400'
        }`}>
          SECURE 256-BIT ENCRYPTED ACCOUNT PERSISTENCE
        </div>
      </div>
    </div>
  );
};
