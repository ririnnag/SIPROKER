import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, RefreshCw, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import api from '../api/fetchClient';

const LaporanKegiatan = () => {
  const { isAdminOrEditor, isAdmin } = useAuth();
  const [laporan, setLaporan] = useState([]);
  const [prokerList, setProkerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [prokerFilter, setProkerFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ id_proker: '', judul_laporan: '', isi_laporan: '', realisasi_kegiatan: '', tanggal_dibuat: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lapRes, prokerRes] = await Promise.all([ api.get('/laporan_kegiatan'), api.get('/proker') ]);
      setLaporan(lapRes.data);
      setProkerList(prokerRes.data);
    } catch { showToast('Gagal memuat data', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = laporan.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.judul_laporan?.toLowerCase().includes(q) || l.tema_proker?.toLowerCase().includes(q);
    const matchProker = !prokerFilter || String(l.id_proker) === String(prokerFilter);
    return matchSearch && matchProker;
  });

  const openCreate = () => {
    setEditData(null);
    setForm({ id_proker: '', judul_laporan: '', isi_laporan: '', realisasi_kegiatan: '', tanggal_dibuat: new Date().toISOString().split('T')[0] });
    setModalOpen(true);
  };

  const openEdit = (l) => {
    setEditData(l);
    setForm({
      id_proker: l.id_proker, judul_laporan: l.judul_laporan,
      isi_laporan: l.isi_laporan || '', realisasi_kegiatan: l.realisasi_kegiatan || '',
      tanggal_dibuat: l.tanggal_dibuat ? l.tanggal_dibuat.split('T')[0] : ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editData) {
        await api.put(`/laporan_kegiatan/${editData.id_laporan}`, form);
        showToast('Laporan berhasil diperbarui');
      } else {
        await api.post('/laporan_kegiatan', form);
        showToast('Laporan berhasil dibuat');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/laporan_kegiatan/${deleteConfirm.id_laporan}`);
      showToast('Laporan dihapus');
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
          <h1 className="page-title">Laporan Kegiatan</h1>
          <p className="page-subtitle">Arsip dokumentasi realisasi program kerja</p>
        </div>
        {isAdminOrEditor && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Buat Laporan
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul laporan..." className="input-field pl-9" />
        </div>
        <select value={prokerFilter} onChange={e => setProkerFilter(e.target.value)} className="input-field w-full sm:w-64 max-w-full">
          <option value="">Semua Program Kerja</option>
          {prokerList.map(p => <option key={p.id_proker} value={p.id_proker}>{p.tema_proker}</option>)}
        </select>
        <button onClick={fetchData} className="btn-secondary" title="Refresh"><RefreshCw size={15} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-slate-500 font-medium text-sm">Memuat laporan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full card py-16 text-center text-slate-400">
            <FileText size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="font-medium text-slate-500">Tidak ada laporan ditemukan</p>
          </div>
        ) : filtered.map(l => (
          <div key={l.id_laporan} className="card hover:shadow-md transition-shadow group flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <Calendar size={13} /> {new Date(l.tanggal_dibuat).toLocaleDateString('id-ID')}
                </div>
                {isAdminOrEditor && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(l)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={14} /></button>
                    {isAdmin && <button onClick={() => setDeleteConfirm(l)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>}
                  </div>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-800 leading-snug mb-1">{l.judul_laporan}</h3>
              <p className="text-sm font-medium text-slate-500 mb-3 line-clamp-1 border-l-2 border-indigo-200 pl-2">Proker: {l.tema_proker}</p>
              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{l.isi_laporan}</p>
            </div>
            <div className="p-3 border-t border-slate-50 bg-slate-50/50 mt-auto">
              <button onClick={() => setViewModalOpen(l)} className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-1.5">Baca Laporan Lengkap</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Laporan' : 'Buat Laporan Baru'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Program Kerja</label>
              <select value={form.id_proker} onChange={e => setForm({...form, id_proker: e.target.value})} className="input-field" required>
                <option value="">Pilih program kerja...</option>
                {prokerList.map(p => <option key={p.id_proker} value={p.id_proker}>{p.tema_proker}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Tanggal Pembuatan</label>
              <input type="date" value={form.tanggal_dibuat} onChange={e => setForm({...form, tanggal_dibuat: e.target.value})} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="input-label">Judul Laporan</label>
            <input type="text" value={form.judul_laporan} onChange={e => setForm({...form, judul_laporan: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="input-label">Isi Laporan / Latar Belakang</label>
            <textarea value={form.isi_laporan} onChange={e => setForm({...form, isi_laporan: e.target.value})} className="input-field min-h-[120px] resize-y" />
          </div>
          <div>
            <label className="input-label">Realisasi Kegiatan & Hasil</label>
            <textarea value={form.realisasi_kegiatan} onChange={e => setForm({...form, realisasi_kegiatan: e.target.value})} className="input-field min-h-[120px] resize-y" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editData ? 'Simpan Perubahan' : 'Buat Laporan'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewModalOpen} onClose={() => setViewModalOpen(null)} title="Detail Laporan Kegiatan" size="lg">
        {viewModalOpen && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">{viewModalOpen.judul_laporan}</h2>
              <p className="text-sm text-slate-500 font-medium">Program Kerja: <span className="text-indigo-600">{viewModalOpen.tema_proker}</span></p>
              <p className="text-xs text-slate-400 mt-1">Dibuat pada {new Date(viewModalOpen.tanggal_dibuat).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">Isi Laporan</h4>
              <div className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{viewModalOpen.isi_laporan || 'Tidak ada konten.'}</div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">Realisasi & Hasil</h4>
              <div className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{viewModalOpen.realisasi_kegiatan || 'Tidak ada catatan realisasi.'}</div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus" size="sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={20} className="text-red-500" /></div>
          <p className="text-slate-700 font-semibold mb-1">Hapus laporan ini?</p>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Batal</button>
            <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold">Ya, Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LaporanKegiatan;
