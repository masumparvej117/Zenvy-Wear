import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export function AdminLogin() {
  const { login, signInWithGoogle, setCurrentRoute, user, isAdmin, showToast } = useShop();
  const [email, setEmail] = useState('zenvywear75@gmail.com');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in as admin, redirect to admin dashboard safely in useEffect
  useEffect(() => {
    if (user && isAdmin) {
      setCurrentRoute('admin');
    }
  }, [user, isAdmin, setCurrentRoute]);

  if (user && isAdmin) {
    return null;
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid administrator credentials');
    } else {
      // Check if user is actually admin
      setCurrentRoute('admin');
      showToast('Authenticated as Administrator', 'success');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to Store */}
        <button
          onClick={() => setCurrentRoute('store')}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 mb-8 mx-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to ZENVY WEAR Store</span>
        </button>

        <div className="text-center">
          <div className="w-14 h-14 bg-white text-neutral-950 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white font-display">
            ZENVY WEAR Administration
          </h2>
          <p className="mt-1 text-xs text-neutral-400 uppercase tracking-widest">
            Restricted Access Control Portal
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-900 border border-neutral-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="zenvywear75@gmail.com"
                  className="w-full pl-9 pr-3.5 py-3 text-sm bg-neutral-950 border border-neutral-700 text-white rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-3 text-sm bg-neutral-950 border border-neutral-700 text-white rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-white hover:bg-neutral-200 text-neutral-950 text-sm font-bold rounded-xl transition-colors shadow-md disabled:bg-neutral-600 disabled:text-neutral-400"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>

          {/* One-Click Google Admin Sign-in */}
          <div className="mt-4">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-800"></div>
              <span className="flex-shrink mx-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
                Or Instant Google Access
              </span>
              <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setErrorMsg(null);
                setIsSubmitting(true);
                const res = await signInWithGoogle();
                setIsSubmitting(false);
                if (res.success) {
                  setCurrentRoute('admin');
                  showToast('Authenticated via Google Firebase', 'success');
                } else {
                  setErrorMsg(res.error || 'Google sign-in was cancelled or failed');
                }
              }}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-neutral-950 border border-neutral-700 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Admin Google Account</span>
            </button>
          </div>

          {/* Secure Admin Credentials Help Note */}
          <div className="mt-5 pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 leading-relaxed space-y-1 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800">
            <p className="font-semibold text-neutral-200">Firebase & Admin Accounts:</p>
            <p>
              Primary Admin: <code className="text-white">masumparvej117@gmail.com</code> (Instant Google Sign-In)
            </p>
            <p>
              Support Admin: <code className="text-white">zenvywear75@gmail.com</code>
            </p>
            <p>
              Default Password: <code className="text-white">Zenvywear@admin$$2026</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
