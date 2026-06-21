import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Briefcase, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import api from '../api/fetchClient';

const Jabatan = () => {
  const { isAdmin } = useAuth();
  const [jabatan, setJabatan] = useState([]);
  const [divisi, setDivisi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ nama_jabatan: '', id_divisi: '', butuh_divisi: false });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jabRes, divRes] = await Promise.all([api.get('/jabatan'), api.get('/divisi')]);
      setJabatan(jabRes.data);
      setDivisi(divRes.data);
    } catch { showToast('Gagal memuat data', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = jabatan.filter(j =>
    j.nama_jabatan?.toLowerCase().includes(search.toLowerCase()) ||
    j.nama_divisi?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditData(null);
    setForm({ nama_jabatan: '', id_divisi: '', butuh_divisi: false });
    setModalOpen(true);
  };
  const openEdit = (j) => {
    setEditData(j);
    setForm({ nama_jabatan: j.nama_jabatan, id_divisi: j.id_divisi || '', butuh_divisi: !!j.butuh_divisi });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, id_divisi: form.id_divisi || null };
      if (editData) {
        await api.put(`/jabatan/${editData.id_jabatan}`, payload);
        showToast('Jabatan berhasil diperbarui');
      } else {
        await api.post('/jabatan', payload);
        showToast('Jabatan berhasil dibuat');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/jabatan/${deleteConfirm.id_jabatan}`);
      showToast('Jabatan berhasil dihapus');
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
          <h1 className="page-title">Manajemen Jabatan</h1>
          <p className="page-subtitle">Kelola struktur jabatan organisasi</p>
        </div>
        {isAdmin && (
          <button id="add-jabatan-btn" onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Tambah Jabatan
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari jabatan atau divisi..." className="input-field pl-9" />
        </div>
        <button onClick={fetchData} className="btn-secondary" title="Refresh"><RefreshCw size={15} /></button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-head w-12">No</th>
                <th className="table-head">Nama Jabatan</th>
                <th className="table-head">Divisi</th>
                <th className="table-head text-center">Butuh Divisi</th>
                {isAdmin && <th className="table-head text-center w-28">Aksi</th>}
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
                  <Briefcase size={36} className="mx-auto mb-2 text-slate-200" />
                  Tidak ada jabatan ditemukan
                </td></tr>
              ) : filtered.map((j, i) => (
                <tr key={j.id_jabatan} className="table-row">
                  <td className="table-cell text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                        <Briefcase size={12} className="text-violet-500" />
                      </div>
                      <span className="font-semibold text-slate-700 text-sm">{j.nama_jabatan}</span>
                    </div>
                  </td>
                  <td className="table-cell text-slate-500 text-sm">{j.nama_divisi || <span className="text-slate-300">—</span>}</td>
                  <td className="table-cell text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${j.butuh_divisi ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                      {j.butuh_divisi ? 'Ya' : 'Tidak'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="table-cell">
                      <div className="flex items-center gap-2 justify-center">
                        <button onClick={() => openEdit(j)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors" title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteConfirm(j)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Hapus"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-50 text-xs text-slate-400">{filtered.length} jabatan</div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Jabatan' : 'Tambah Jabatan'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nama Jabatan</label>
            <input type="text" value={form.nama_jabatan} onChange={e => setForm({...form, nama_jabatan: e.target.value})} className="input-field" placeholder="Contoh: KADIV AKADEMIK" required />
          </div>
          <div>
            <label className="input-label">Divisi (opsional)</label>
            <select value={form.id_divisi} onChange={e => setForm({...form, id_divisi: e.target.value})} className="input-field">
              <option value="">Tidak ada divisi</option>
              {divisi.map(d => <option key={d.id_divisi} value={d.id_divisi}>{d.nama_divisi}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="butuh-divisi"
              checked={form.butuh_divisi}
              onChange={e => setForm({...form, butuh_divisi: e.target.checked})}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="butuh-divisi" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
              Jabatan ini memerlukan divisi
            </label>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editData ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus" size="sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={20} className="text-red-500" /></div>
          <p className="text-slate-700 font-semibold mb-1">Hapus jabatan ini?</p>
          <p className="text-sm text-slate-500 mb-5"><span className="font-semibold">{deleteConfirm?.nama_jabatan}</span></p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Batal</button>
            <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold">Ya, Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Jabatan;
