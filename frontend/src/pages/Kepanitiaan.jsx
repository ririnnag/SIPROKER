import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Users2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import api from '../api/fetchClient';

const Kepanitiaan = () => {
  const { isAdminOrEditor, isAdmin } = useAuth();
  const [kepanitiaan, setKepanitiaan] = useState([]);
  const [prokerList, setProkerList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [prokerFilter, setProkerFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ id_proker: '', id_user: '', jabatan_panitia: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [kepRes, prokerRes, userRes] = await Promise.all([
        api.get('/kepanitiaan'),
        api.get('/proker'),
        api.get('/users')
      ]);
      setKepanitiaan(kepRes.data);
      setProkerList(prokerRes.data);
      setUserList(userRes.data.filter(u => u.status === 'active'));
    } catch { showToast('Gagal memuat data', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = kepanitiaan.filter(k => {
    const q = search.toLowerCase();
    const matchSearch = k.nama_user?.toLowerCase().includes(q) || k.jabatan_panitia?.toLowerCase().includes(q) || k.tema_proker?.toLowerCase().includes(q);
    const matchProker = !prokerFilter || String(k.id_proker) === String(prokerFilter);
    return matchSearch && matchProker;
  });

  const openCreate = () => {
    setEditData(null);
    setForm({ id_proker: '', id_user: '', jabatan_panitia: '' });
    setModalOpen(true);
  };

  const openEdit = (k) => {
    setEditData(k);
    setForm({ id_proker: k.id_proker, id_user: k.id_user, jabatan_panitia: k.jabatan_panitia });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editData) {
        await api.put(`/kepanitiaan/${editData.id_kepanitiaan}`, form);
        showToast('Data panitia diperbarui');
      } else {
        await api.post('/kepanitiaan', form);
        showToast('Panitia berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/kepanitiaan/${deleteConfirm.id_kepanitiaan}`);
      showToast('Panitia dihapus dari program kerja');
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

      <div className="page-header">
        <div>
          <h1 className="page-title">Susunan Kepanitiaan</h1>
          <p className="page-subtitle">Kelola anggota panitia di setiap program kerja</p>
        </div>
        {isAdminOrEditor && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Tambah Panitia
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, jabatan panitia, proker..." className="input-field pl-9" />
        </div>
        <select value={prokerFilter} onChange={e => setProkerFilter(e.target.value)} className="input-field w-full sm:w-64 max-w-full">
          <option value="">Semua Program Kerja</option>
          {prokerList.map(p => <option key={p.id_proker} value={p.id_proker}>{p.tema_proker}</option>)}
        </select>
        <button onClick={fetchData} className="btn-secondary" title="Refresh"><RefreshCw size={15} /></button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-head">Panitia</th>
                <th className="table-head">Jabatan Organisasi</th>
                <th className="table-head">Jabatan Panitia</th>
                <th className="table-head">Program Kerja</th>
                {isAdminOrEditor && <th className="table-head text-center w-24">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="table-cell text-center py-10 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div> Memuat...
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="table-cell text-center py-12 text-slate-400">
                  <Users2 size={36} className="mx-auto mb-2 text-slate-200" />
                  Tidak ada data kepanitiaan ditemukan
                </td></tr>
              ) : filtered.map(k => (
                <tr key={k.id_kepanitiaan} className="table-row">
                  <td className="table-cell">
                    <p className="font-semibold text-slate-800">{k.nama_user}</p>
                    <p className="text-xs font-mono text-slate-500">{k.username}</p>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm text-slate-700">{k.nama_jabatan || '—'}</p>
                    {k.nama_divisi && <p className="text-xs text-slate-400">{k.nama_divisi}</p>}
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                      {k.jabatan_panitia}
                    </span>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm font-semibold text-slate-700">{k.tema_proker}</p>
                    <div className="mt-1"><StatusBadge status={k.status_proker} /></div>
                  </td>
                  {isAdminOrEditor && (
                    <td className="table-cell">
                      <div className="flex items-center gap-2 justify-center">
                        <button onClick={() => openEdit(k)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500" title="Edit"><Edit2 size={14} /></button>
                        {isAdmin && (
                          <button onClick={() => setDeleteConfirm(k)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Hapus"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Panitia' : 'Tambah Panitia'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Program Kerja</label>
            <select value={form.id_proker} onChange={e => setForm({...form, id_proker: e.target.value})} className="input-field" required>
              <option value="">Pilih program kerja...</option>
              {prokerList.map(p => <option key={p.id_proker} value={p.id_proker}>{p.tema_proker}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Pilih Anggota</label>
            <select value={form.id_user} onChange={e => setForm({...form, id_user: e.target.value})} className="input-field" required>
              <option value="">Pilih anggota...</option>
              {userList.map(u => <option key={u.id_user} value={u.id_user}>{u.nama} ({u.nama_jabatan || 'No Jabatan'})</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Jabatan di Kepanitiaan</label>
            <input type="text" value={form.jabatan_panitia} onChange={e => setForm({...form, jabatan_panitia: e.target.value})} className="input-field" placeholder="Contoh: Ketua Pelaksana, Sie Acara" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editData ? 'Simpan' : 'Tambahkan'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus" size="sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={20} className="text-red-500" /></div>
          <p className="text-slate-700 font-semibold mb-1">Keluarkan dari panitia?</p>
          <p className="text-sm text-slate-500 mb-5">Hapus <span className="font-semibold">{deleteConfirm?.nama_user}</span> dari <span className="font-semibold">{deleteConfirm?.tema_proker}</span>.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Batal</button>
            <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold">Ya, Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Kepanitiaan;
