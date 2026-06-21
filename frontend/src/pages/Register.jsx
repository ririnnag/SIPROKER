import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ClipboardList, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/fetchClient';

const Register = () => {
  const [form, setForm] = useState({
    nama: '', npm: '', password: '', invite_code: '', id_jabatan: ''
  });
  const [jabatanList, setJabatanList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const navigate = useNavigate();

  // Fetch jabatan list (public endpoint)
  useEffect(() => {
    api.get('/auth/public/jabatan')
      .then(res => setJabatanList(res.data))
      .catch(() => { });
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setGeneratedUsername(res.data.username);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 30000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/8 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-7 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-xl shadow-indigo-900/50 mb-3">
          <ClipboardList size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Daftar Akun Baru</h1>
        <p className="text-slate-400 text-xs mt-1">SIPROKER — Organisasi POINTER</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm mb-4">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-4 text-sm mb-4">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <CheckCircle2 size={16} />
            Registrasi Berhasil!
          </div>
          <p className="text-xs text-emerald-400 mb-1">{success}</p>
          {generatedUsername && (
            <p className="text-xs mt-2">
              Username Anda: <span className="font-bold text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-md">{generatedUsername}</span>
            </p>
          )}
          <p className="text-[11px] text-emerald-500 mt-2">Akan diarahkan ke login dalam 30 detik...</p>
        </div>
      )}

      {!success && (
        <form id="register-form" onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Lengkap</label>
            <input
              id="reg-nama"
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className="w-full bg-white/8 border border-white/15 text-black placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">NPM</label>
            <input
              id="reg-npm"
              type="text"
              name="npm"
              value={form.npm}
              onChange={handleChange}
              className="w-full bg-white/8 border border-white/15 text-black placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nomor Pokok Mahasiswa"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-white/8 border border-white/15 text-black placeholder-slate-500 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Buat password"
                required
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Jabatan</label>
            <select
              id="reg-jabatan"
              name="id_jabatan"
              value={form.id_jabatan}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-white/15 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              required
            >
              <option value="">Pilih jabatan...</option>
              {jabatanList.map(j => (
                <option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}{j.nama_divisi ? ` — ${j.nama_divisi}` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Invite Code</label>
            <input
              id="reg-invite-code"
              type="text"
              name="invite_code"
              value={form.invite_code}
              onChange={e => handleChange({ target: { name: 'invite_code', value: e.target.value.toUpperCase() } })}
              className="w-full bg-white/8 border border-white/15 text-black placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
              placeholder="XXXX-POINTER-XXXX"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">Dapatkan invite code dari Admin organisasi</p>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-lg shadow-indigo-900/40"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><UserPlus size={17} />Daftar Sekarang</>
            }
          </button>
        </form>
      )}

      <p className="text-center text-slate-500 text-xs mt-5">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">Masuk di sini</Link>
      </p>
    </div>
  );
};

export default Register;
