import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, CheckCircle, XCircle,
  Search, Users as UsersIcon, RefreshCw, Shield, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import api from '../api/fetchClient';

const emptyForm = {
  username: '', password: '', nama: '', npm: '',
  id_jabatan: '', id_role: '', status: 'active'
};

const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, jabRes, roleRes] = await Promise.all([
        api.get('/users'),
        api.get('/jabatan'),
        api.get('/divisi'),
      ]);
      setUsers(usersRes.data);
      setJabatanList(jabRes.data);
      // Roles are hardcoded
      setRoleList([{ id_role: 1, nama_role: 'admin' }, { id_role: 2, nama_role: 'editor' }, { id_role: 3, nama_role: 'viewer' }]);
    } catch {
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.nama?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.npm?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditData(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditData(user);
    setForm({
      username: user.username, password: '', nama: user.nama, npm: user.npm,
      id_jabatan: user.id_jabatan, id_role: user.id_role, status: user.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editData) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editData.id_user}`, payload);
        showToast('User berhasil diperbarui');
      } else {
        await api.post('/users', form);
        showToast('User berhasil dibuat');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/users/${id}/approve`);
      showToast('User berhasil disetujui');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/users/${id}/reject`);
      showToast('User ditolak');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/users/${deleteConfirm.id_user}`);
      showToast('User berhasil dihapus');
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="page-subtitle">Kelola akun anggota organisasi</p>
        </div>
        {isAdmin && (
          <button id="add-user-btn" onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Tambah User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, username, atau NPM..."
            className="input-field pl-9 w-full"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-full sm:w-40">
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="pending">Pending</option>
          <option value="rejected">Ditolak</option>
        </select>
        <button onClick={fetchData} className="btn-secondary flex-shrink-0" title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-head">Nama</th>
                <th className="table-head">Username</th>
                <th className="table-head">NPM</th>
                <th className="table-head">Jabatan</th>
                <th className="table-head">Role</th>
                <th className="table-head">Status</th>
                {isAdmin && <th className="table-head text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="table-cell text-center py-10 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div> Memuat...
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-cell text-center py-12 text-slate-400">
                  <UsersIcon size={36} className="mx-auto mb-2 text-slate-200" />
                  Tidak ada pengguna ditemukan
                </td></tr>
              ) : filtered.map(u => (
                <tr key={u.id_user} className="table-row">
                  <td className="table-cell font-semibold text-slate-800">{u.nama}</td>
                  <td className="table-cell font-mono text-xs text-slate-500">{u.username}</td>
                  <td className="table-cell text-slate-500">{u.npm}</td>
                  <td className="table-cell">
                    <div>
                      <p className="text-slate-700 text-xs font-medium">{u.nama_jabatan || '—'}</p>
                      {u.nama_divisi && <p className="text-slate-400 text-[11px]">{u.nama_divisi}</p>}
                    </div>
                  </td>
                  <td className="table-cell"><StatusBadge status={u.nama_role} /></td>
                  <td className="table-cell"><StatusBadge status={u.status} /></td>
                  {isAdmin && (
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 justify-center flex-wrap">
                        {u.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(u.id_user)} className="btn-success text-xs py-1.5 px-2" title="Setujui">
                              <CheckCircle size={13} /> Setujui
                            </button>
                            <button onClick={() => handleReject(u.id_user)} className="btn-danger text-xs py-1.5 px-2" title="Tolak">
                              <XCircle size={13} /> Tolak
                            </button>
                          </>
                        )}
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(u)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-50 text-xs text-slate-400">
          {filtered.length} dari {users.length} pengguna
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Pengguna' : 'Tambah Pengguna'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Nama Lengkap</label>
              <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="input-label">NPM</label>
              <input type="text" value={form.npm} onChange={e => setForm({...form, npm: e.target.value})} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="input-label">Username</label>
            <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="input-field font-mono" required />
          </div>
          <div>
            <label className="input-label">{editData ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" required={!editData} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Jabatan</label>
              <select value={form.id_jabatan} onChange={e => setForm({...form, id_jabatan: e.target.value})} className="input-field" required>
                <option value="">Pilih jabatan...</option>
                {jabatanList.map(j => (
                  <option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Role</label>
              <select value={form.id_role} onChange={e => setForm({...form, id_role: e.target.value})} className="input-field" required>
                <option value="">Pilih role...</option>
                {roleList.map(r => (
                  <option key={r.id_role} value={r.id_role}>{r.nama_role}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
              <option value="active">Aktif</option>
              <option value="pending">Pending</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editData ? 'Simpan Perubahan' : 'Tambah User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus" size="sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">Hapus pengguna ini?</p>
          <p className="text-sm text-slate-500 mb-5">
            <span className="font-semibold text-slate-700">{deleteConfirm?.nama}</span> akan dihapus secara permanen.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Batal</button>
            <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
