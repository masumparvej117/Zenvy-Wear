import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function CustomerAuthModal() {
  const { authModal, setAuthModal, login, register } = useShop();

  const [mode, setMode] = useState<'login' | 'register'>(
    authModal === 'register' ? 'register' : 'login'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (authModal === 'closed') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid email or password');
      }
    } else {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name');
        setIsSubmitting(false);
        return;
      }
      const res = await register(name, email, password, phone);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setAuthModal('closed')}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 mb-6">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
              mode === 'login'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Customer Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
              mode === 'register'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asif Mahmud"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Phone Number <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01757391262"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {isSubmitting
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In to Your Account'
              : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-neutral-500">
          {mode === 'login' ? (
            <p>
              New to ZENVY WEAR?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className="text-neutral-950 font-semibold hover:underline"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="text-neutral-950 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
