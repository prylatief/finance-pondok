
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from '../services/authService';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, session, error: authError } = await signInWithEmail(email, password);

      if (authError) {
        setError(authError.message === 'Invalid login credentials'
          ? 'Email atau password salah'
          : authError.message);
        setLoading(false);
        return;
      }

      if (user && session) {
        onLogin();
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-primary-900">Pondok<span className="font-light text-primary-600">Finance</span></h1>
            <p className="text-slate-500 mt-1">Aplikasi Manajemen Keuangan Pondok</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  disabled={loading}
                  className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  disabled={loading}
                  className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={loading}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Ingat saya
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-primary-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
            Silakan login menggunakan email dan password yang sudah terdaftar di Supabase.
        </p>
      </div>
    </div>
  );
}
