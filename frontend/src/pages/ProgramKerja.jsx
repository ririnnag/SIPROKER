import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, ClipboardList, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import api from '../api/fetchClient';

const ProgramKerja = () => {
  const { isAdminOrEditor, isAdmin } = useAuth();
  const [proker, setProker] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ tema_proker: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', status: 'rencana' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/proker');
      setProker(res.data);
    } catch { showToast('Gagal memuat data', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = proker.filter(p => {
    const matchSearch = p.tema_proker.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditData(null);
    setForm({ tema_proker: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', status: 'rencana' });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditData(p);
    setForm({
      tema_proker: p.tema_proker,
      deskripsi: p.deskripsi || '',
      tanggal_mulai: p.tanggal_mulai ? p.tanggal_mulai.split('T')[0] : '',
      tanggal_selesai: p.tanggal_selesai ? p.tanggal_selesai.split('T')[0] : '',
      status: p.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tanggal_mulai: form.tanggal_mulai || null,
        tanggal_selesai: form.tanggal_selesai || null
      };
      if (editData) {
        await api.put(`/proker/${editData.id_proker}`, payload);
        showToast('Program kerja berhasil diperbarui');
      } else {
        await api.post('/proker', payload);
        showToast('Program kerja berhasil dibuat');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/proker/${deleteConfirm.id_proker}`);
      showToast('Program kerja berhasil dihapus');
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
          <h1 className="page-title">Program Kerja</h1>
          <p className="page-subtitle">Kelola daftar program kerja global organisasi</p>
        </div>
        {isAdminOrEditor && (
          <button id="add-proker-btn" onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Tambah Proker
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari tema proker..." className="input-field pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-full sm:w-40">
          <option value="">Semua Status</option>
          <option value="rencana">Rencana</option>
          <option value="berjalan">Berjalan</option>
          <option value="selesai">Selesai</option>
        </select>
        <button onClick={fetchData} className="btn-secondary" title="Refresh"><RefreshCw size={15} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-slate-500 font-medium text-sm">Memuat program kerja...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full card py-16 text-center text-slate-400">
            <ClipboardList size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="font-medium text-slate-500">Tidak ada program kerja ditemukan</p>
          </div>
        ) : filtered.map(p => (
          <div key={p.id_proker} className="card p-5 hover:shadow-md transition-shadow group flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <StatusBadge status={p.status} />
              {isAdminOrEditor && (
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Edit"><Edit2 size={14} /></button>
                  {isAdmin && (
                    <button onClick={() => setDeleteConfirm(p)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Hapus"><Trash2 size={14} /></button>
                  )}
                </div>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-800 leading-snug mb-2">{p.tema_proker}</h3>
            <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{p.deskripsi || 'Tidak ada deskripsi'}</p>
            <div className="pt-3 border-t border-slate-100 mt-auto text-xs font-medium text-slate-500 space-y-1">
              <p>Mulai: {p.tanggal_mulai ? new Date(p.tanggal_mulai).toLocaleDateString('id-ID') : '-'}</p>
              <p>Selesai: {p.tanggal_selesai ? new Date(p.tanggal_selesai).toLocaleDateString('id-ID') : '-'}</p>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Program Kerja' : 'Tambah Program Kerja'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Tema Program Kerja</label>
            <input type="text" value={form.tema_proker} onChange={e => setForm({...form, tema_proker: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="input-label">Deskripsi</label>
            <textarea value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} className="input-field min-h-[100px] resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Tanggal Mulai</label>
              <input type="date" value={form.tanggal_mulai} onChange={e => setForm({...form, tanggal_mulai: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="input-label">Tanggal Selesai</label>
              <input type="date" value={form.tanggal_selesai} onChange={e => setForm({...form, tanggal_selesai: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
              <option value="rencana">Rencana</option>
              <option value="berjalan">Berjalan</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
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
          <p className="text-slate-700 font-semibold mb-1">Hapus proker ini?</p>
          <p className="text-sm text-slate-500 mb-5"><span className="font-semibold text-slate-700">{deleteConfirm?.tema_proker}</span></p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Batal</button>
            <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold">Ya, Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProgramKerja;
