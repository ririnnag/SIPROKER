import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Divisi from './pages/Divisi';
import Jabatan from './pages/Jabatan';
import ProgramKerja from './pages/ProgramKerja';
import Kepanitiaan from './pages/Kepanitiaan';
import LaporanKegiatan from './pages/LaporanKegiatan';
import InviteCode from './pages/InviteCode';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/divisi" element={<Divisi />} />
              <Route path="/jabatan" element={<Jabatan />} />
              <Route path="/program-kerja" element={<ProgramKerja />} />
              <Route path="/kepanitiaan" element={<Kepanitiaan />} />
              <Route path="/laporan-kegiatan" element={<LaporanKegiatan />} />
              {/* Admin only */}
              <Route element={<AdminRoute />}>
                <Route path="/invite-code" element={<InviteCode />} />
              </Route>
            </Route>
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
