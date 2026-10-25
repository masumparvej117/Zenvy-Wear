import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export function AdminLogin() {
  const { login, setCurrentRoute, user, isAdmin, showToast } = useShop();
  const [email, setEmail] = useState('zenvywear75@gmail.com');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in as admin, redirect to admin dashboard
  if (user && isAdmin) {
    setCurrentRoute('admin');
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

          {/* Secure Admin Credentials Help Note */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-[11px] text-neutral-400 leading-relaxed space-y-1 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800">
            <p className="font-semibold text-neutral-200">Default Secure Admin Credentials:</p>
            <p>
              Email: <code className="text-white">zenvywear75@gmail.com</code>
            </p>
            <p>
              Initial Password: <code className="text-white">Admin@Zenvy2026!</code>
            </p>
            <p className="text-[10px] text-neutral-500 pt-1">
              Protected by server-side crypto password hashing and role enforcement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
