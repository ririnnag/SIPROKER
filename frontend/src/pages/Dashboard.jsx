import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, FileText, Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../api/fetchClient';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const statusColors = {
    rencana: 'bg-blue-500',
    berjalan: 'bg-emerald-500',
    selesai: 'bg-slate-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Selamat datang, <span className="font-semibold text-indigo-600">{user?.nama}</span> — Ringkasan aktivitas SIPROKER</p>
      </div>

      {/* Admin pending alert */}
      {isAdmin && stats?.pendingUsers > 0 && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium">
            Ada <span className="font-bold">{stats.pendingUsers}</span> pengguna menunggu persetujuan.{' '}
            <a href="/users" className="text-amber-700 underline hover:no-underline">Tinjau sekarang</a>
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Anggota" value={stats?.totalUsers ?? '—'} icon={Users} color="indigo" subtitle="Pengguna aktif" />
        <StatCard title="Program Kerja" value={stats?.totalProker ?? '—'} icon={ClipboardList} color="blue" subtitle="Seluruh proker" />
        <StatCard title="Laporan" value={stats?.totalLaporan ?? '—'} icon={FileText} color="violet" subtitle="Laporan kegiatan" />
        <StatCard title="Proker Aktif" value={stats?.activeProker ?? '—'} icon={Activity} color="emerald" subtitle="Sedang berjalan" />
        {isAdmin && (
          <StatCard title="Pending" value={stats?.pendingUsers ?? '—'} icon={Clock} color={stats?.pendingUsers > 0 ? 'amber' : 'emerald'} subtitle="Menunggu approval" />
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Proker status breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-500" /> Status Program Kerja
          </h3>
          {stats?.prokerByStatus?.length > 0 ? (
            <div className="space-y-3">
              {stats.prokerByStatus.map(item => {
                const pct = stats.totalProker > 0 ? Math.round((item.count / stats.totalProker) * 100) : 0;
                return (
                  <div key={item.status}>
                    <div className="flex justify-between items-center mb-1">
                      <StatusBadge status={item.status} />
                      <span className="text-xs font-bold text-slate-600">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${statusColors[item.status] || 'bg-slate-400'} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-slate-400 text-sm text-center py-4">Belum ada data</p>}
        </div>

        {/* Recent Proker */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <ClipboardList size={16} className="text-indigo-500" /> Program Kerja Terbaru
          </h3>
          {stats?.recentProker?.length > 0 ? (
            <div className="space-y-2.5">
              {stats.recentProker.map(pk => (
                <div key={pk.id_proker} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[pk.status] || 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{pk.tema_proker}</p>
                    <p className="text-xs text-slate-400">{formatDate(pk.tanggal_mulai)} — {formatDate(pk.tanggal_selesai)}</p>
                  </div>
                  <StatusBadge status={pk.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Belum ada program kerja</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Laporan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <FileText size={16} className="text-indigo-500" /> Laporan Kegiatan Terbaru
        </h3>
        {stats?.recentLaporan?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-head text-left">Judul Laporan</th>
                  <th className="table-head text-left">Program Kerja</th>
                  <th className="table-head text-left">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLaporan.map(l => (
                  <tr key={l.id_laporan} className="table-row">
                    <td className="table-cell font-medium">{l.judul_laporan}</td>
                    <td className="table-cell text-slate-500">{l.tema_proker}</td>
                    <td className="table-cell text-slate-500">{formatDate(l.tanggal_dibuat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Belum ada laporan kegiatan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
