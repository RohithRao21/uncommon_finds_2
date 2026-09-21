import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onOpenAuth?: () => void;
  fallbackMessage?: string;
  isDarkMode?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onOpenAuth,
  fallbackMessage = 'You must be signed in to view this content.',
  isDarkMode = true,
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 font-mono-tech text-xs text-slate-400">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>AUTHENTICATING SESSION...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={`p-8 rounded-2xl border text-center font-mono-tech max-w-md mx-auto my-8 space-y-4 ${
        isDarkMode ? 'bg-[#0f1115] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
          isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
        }`}>
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm tracking-wider uppercase">AUTHENTICATION REQUIRED</h3>
          <p className="text-xs text-slate-400">{fallbackMessage}</p>
        </div>
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              isDarkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            SIGN IN TO CONTINUE
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
