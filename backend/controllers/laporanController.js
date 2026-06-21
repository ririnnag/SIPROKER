const db = require('../config/db');

// GET /api/laporan_kegiatan
const getAllLaporan = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.id_laporan, l.judul_laporan, l.isi_laporan, l.realisasi_kegiatan, l.tanggal_dibuat,
              l.id_proker, pk.tema_proker, pk.status AS status_proker
       FROM laporan_kegiatan l
       JOIN program_kerja pk ON l.id_proker = pk.id_proker
       ORDER BY l.id_laporan DESC`
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/laporan_kegiatan/:id
const getLaporanById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, pk.tema_proker
       FROM laporan_kegiatan l
       JOIN program_kerja pk ON l.id_proker = pk.id_proker
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/laporan_kegiatan/proker/:id_proker
const getLaporanByProker = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM laporan_kegiatan WHERE id_proker = ? ORDER BY id_laporan DESC',
      [req.params.id_proker]
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/laporan_kegiatan - Admin & Editor
const createLaporan = async (req, res) => {
  try {
    const { id_proker, judul_laporan, isi_laporan, realisasi_kegiatan, tanggal_dibuat } = req.body;
    if (!id_proker || !judul_laporan || !judul_laporan.trim() || !tanggal_dibuat) {
      return res.status(400).json({ message: 'ID proker, judul laporan, dan tanggal wajib diisi' });
    }
    await db.query(
      'INSERT INTO laporan_kegiatan (id_proker, judul_laporan, isi_laporan, realisasi_kegiatan, tanggal_dibuat) VALUES (?, ?, ?, ?, ?)',
      [id_proker, judul_laporan.trim(), isi_laporan || null, realisasi_kegiatan || null, tanggal_dibuat]
    );
    return res.status(201).json({ message: 'Laporan kegiatan berhasil dibuat' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/laporan_kegiatan/:id - Admin & Editor
const updateLaporan = async (req, res) => {
  try {
    const { id_proker, judul_laporan, isi_laporan, realisasi_kegiatan, tanggal_dibuat } = req.body;
    const [result] = await db.query(
      'UPDATE laporan_kegiatan SET id_proker = ?, judul_laporan = ?, isi_laporan = ?, realisasi_kegiatan = ?, tanggal_dibuat = ? WHERE id_laporan = ?',
      [id_proker, judul_laporan, isi_laporan || null, realisasi_kegiatan || null, tanggal_dibuat, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    return res.status(200).json({ message: 'Laporan kegiatan berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/laporan_kegiatan/:id - Admin only
const deleteLaporan = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM laporan_kegiatan WHERE id_laporan = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    return res.status(200).json({ message: 'Laporan kegiatan berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllLaporan, getLaporanById, getLaporanByProker, createLaporan, updateLaporan, deleteLaporan };
