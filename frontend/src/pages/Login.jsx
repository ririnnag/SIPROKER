import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ClipboardList, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/fetchClient';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/8 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 animate-slide-up">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-2xl shadow-indigo-900/60 mb-4">
          <ClipboardList size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">SIPROKER</h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">Sistem Informasi Program Kerja — POINTER</p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm mb-6">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-username" className="block text-sm font-semibold text-slate-300 mb-2">Username</label>
          <input
            id="login-username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full bg-white/8 border border-white/15 text-black placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="contoh12@pointer"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white/8 border border-white/15 text-black placeholder-slate-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-lg shadow-indigo-900/40"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={17} />
              Masuk ke Sistem
            </>
          )}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-6">
        Belum punya akun?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Daftar dengan invite code
        </Link>
      </p>
    </div>
  );
};

export default Login;
