import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Key, RefreshCw, Power } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import api from '../api/fetchClient';

const InviteCode = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ code: '', role_default: 'viewer', is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/invite-code');
      setCodes(res.data);
    } catch { showToast('Gagal memuat invite code', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateCode = () => {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setForm(f => ({ ...f, code: `${random}-POINTER-NEW` }));
  };

  const openCreate = () => {
    setForm({ code: '', role_default: 'viewer', is_active: true });
    generateCode();
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/invite-code', form);
      showToast('Invite code berhasil dibuat');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/invite-code/${id}/toggle`);
      fetchData();
    } catch (err) { showToast('Gagal mengubah status', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/invite-code/${deleteConfirm.id}`);
      showToast('Invite code dihapus');
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Manajemen Invite Code</h1>
          <p className="page-subtitle">Kode registrasi unik untuk anggota baru</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-secondary px-3" title="Refresh"><RefreshCw size={15} /></button>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Buat Kode
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-head">Kode (Invite Code)</th>
                <th className="table-head">Role Default</th>
                <th className="table-head text-center">Status Akses</th>
                <th className="table-head text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="table-cell text-center py-10 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div> Memuat...
                  </div>
                </td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={4} className="table-cell text-center py-12 text-slate-400">
                  <Key size={36} className="mx-auto mb-2 text-slate-200" />
                  Belum ada invite code
                </td></tr>
              ) : codes.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="table-cell">
                    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                      <Key size={14} className="text-slate-400" />
                      <span className="font-mono font-bold text-slate-800 tracking-wider text-sm">{c.code}</span>
                    </div>
                  </td>
                  <td className="table-cell"><StatusBadge status={c.role_default} /></td>
                  <td className="table-cell text-center">
                    <button
                      onClick={() => handleToggle(c.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        c.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Power size={12} /> {c.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="table-cell text-center">
                    <button onClick={() => setDeleteConfirm(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Hapus"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Buat Invite Code" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Kode Unik</label>
            <div className="flex gap-2">
              <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="input-field font-mono" required />
              <button type="button" onClick={generateCode} className="btn-secondary px-3 flex-shrink-0" title="Generate Random"><RefreshCw size={15} /></button>
            </div>
          </div>
          <div>
            <label className="input-label">Otomatis Diberikan Role</label>
            <select value={form.role_default} onChange={e => setForm({...form, role_default: e.target.value})} className="input-field">
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is-active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <label htmlFor="is-active" className="text-sm font-medium text-slate-700 select-none cursor-pointer">Kode langsung aktif</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Simpan Kode'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus" size="sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={20} className="text-red-500" /></div>
          <p className="text-slate-700 font-semibold mb-1">Hapus invite code ini?</p>
          <p className="font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded inline-block text-sm my-2">{deleteConfirm?.code}</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Batal</button>
            <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold">Ya, Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InviteCode;
