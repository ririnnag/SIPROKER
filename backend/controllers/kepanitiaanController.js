const db = require('../config/db');

// GET /api/kepanitiaan
const getAllKepanitiaan = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT k.id_kepanitiaan, k.jabatan_panitia,
              k.id_proker, pk.tema_proker, pk.status AS status_proker,
              k.id_user, u.nama AS nama_user, u.username,
              j.nama_jabatan, d.nama_divisi
       FROM kepanitiaan k
       JOIN program_kerja pk ON k.id_proker = pk.id_proker
       JOIN users u ON k.id_user = u.id_user
       LEFT JOIN jabatan j ON u.id_jabatan = j.id_jabatan
       LEFT JOIN divisi d ON j.id_divisi = d.id_divisi
       ORDER BY k.id_kepanitiaan DESC`
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/kepanitiaan/proker/:id_proker
const getKepanitiaanByProker = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT k.id_kepanitiaan, k.jabatan_panitia,
              k.id_user, u.nama AS nama_user, u.username,
              j.nama_jabatan, d.nama_divisi
       FROM kepanitiaan k
       JOIN users u ON k.id_user = u.id_user
       LEFT JOIN jabatan j ON u.id_jabatan = j.id_jabatan
       LEFT JOIN divisi d ON j.id_divisi = d.id_divisi
       WHERE k.id_proker = ?
       ORDER BY k.id_kepanitiaan`,
      [req.params.id_proker]
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/kepanitiaan - Admin & Editor
const createKepanitiaan = async (req, res) => {
  try {
    const { id_proker, id_user, jabatan_panitia } = req.body;
    if (!id_proker || !id_user || !jabatan_panitia || !jabatan_panitia.trim()) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    await db.query(
      'INSERT INTO kepanitiaan (id_proker, id_user, jabatan_panitia) VALUES (?, ?, ?)',
      [id_proker, id_user, jabatan_panitia.trim()]
    );
    return res.status(201).json({ message: 'Kepanitiaan berhasil ditambahkan' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/kepanitiaan/:id - Admin & Editor
const updateKepanitiaan = async (req, res) => {
  try {
    const { id_proker, id_user, jabatan_panitia } = req.body;
    const [result] = await db.query(
      'UPDATE kepanitiaan SET id_proker = ?, id_user = ?, jabatan_panitia = ? WHERE id_kepanitiaan = ?',
      [id_proker, id_user, jabatan_panitia, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Data kepanitiaan tidak ditemukan' });
    return res.status(200).json({ message: 'Kepanitiaan berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/kepanitiaan/:id - Admin only
const deleteKepanitiaan = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM kepanitiaan WHERE id_kepanitiaan = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Data kepanitiaan tidak ditemukan' });
    return res.status(200).json({ message: 'Kepanitiaan berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllKepanitiaan, getKepanitiaanByProker, createKepanitiaan, updateKepanitiaan, deleteKepanitiaan };
