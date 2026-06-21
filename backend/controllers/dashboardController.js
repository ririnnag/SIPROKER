const db = require('../config/db');

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    // Total active users
    const [[totalUsers]] = await db.query(
      "SELECT COUNT(*) AS count FROM users WHERE status = 'active'"
    );

    // Total program kerja
    const [[totalProker]] = await db.query(
      'SELECT COUNT(*) AS count FROM program_kerja'
    );

    // Total laporan kegiatan
    const [[totalLaporan]] = await db.query(
      'SELECT COUNT(*) AS count FROM laporan_kegiatan'
    );

    // Active proker (berjalan)
    const [[activeProker]] = await db.query(
      "SELECT COUNT(*) AS count FROM program_kerja WHERE status = 'berjalan'"
    );

    // Pending users (admin info)
    const [[pendingUsers]] = await db.query(
      "SELECT COUNT(*) AS count FROM users WHERE status = 'pending'"
    );

    // Proker by status breakdown
    const [prokerByStatus] = await db.query(
      `SELECT status, COUNT(*) AS count FROM program_kerja GROUP BY status`
    );

    // Recent 5 program kerja
    const [recentProker] = await db.query(
      'SELECT * FROM program_kerja ORDER BY id_proker DESC LIMIT 5'
    );

    // Recent 5 laporan kegiatan
    const [recentLaporan] = await db.query(
      `SELECT l.id_laporan, l.judul_laporan, l.tanggal_dibuat, pk.tema_proker
       FROM laporan_kegiatan l
       JOIN program_kerja pk ON l.id_proker = pk.id_proker
       ORDER BY l.id_laporan DESC LIMIT 5`
    );

    return res.status(200).json({
      totalUsers: totalUsers.count,
      totalProker: totalProker.count,
      totalLaporan: totalLaporan.count,
      activeProker: activeProker.count,
      pendingUsers: pendingUsers.count,
      prokerByStatus,
      recentProker,
      recentLaporan
    });
  } catch (err) {
    console.error('[DASHBOARD ERROR]', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboardStats };
