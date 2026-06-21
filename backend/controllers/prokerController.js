const db = require('../config/db');

// GET /api/proker
const getAllProker = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM program_kerja ORDER BY id_proker DESC'
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/proker/:id
const getProkerById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM program_kerja WHERE id_proker = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Program kerja tidak ditemukan' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/proker - Admin & Editor
const createProker = async (req, res) => {
  try {
    const { tema_proker, deskripsi, tanggal_mulai, tanggal_selesai, status } = req.body;
    if (!tema_proker || !tema_proker.trim()) {
      return res.status(400).json({ message: 'Tema program kerja wajib diisi' });
    }
    await db.query(
      'INSERT INTO program_kerja (tema_proker, deskripsi, tanggal_mulai, tanggal_selesai, status) VALUES (?, ?, ?, ?, ?)',
      [tema_proker.trim(), deskripsi || null, tanggal_mulai || null, tanggal_selesai || null, status || 'rencana']
    );
    return res.status(201).json({ message: 'Program kerja berhasil dibuat' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/proker/:id - Admin & Editor
const updateProker = async (req, res) => {
  try {
    const { tema_proker, deskripsi, tanggal_mulai, tanggal_selesai, status } = req.body;
    if (!tema_proker || !tema_proker.trim()) {
      return res.status(400).json({ message: 'Tema program kerja wajib diisi' });
    }
    const [result] = await db.query(
      'UPDATE program_kerja SET tema_proker = ?, deskripsi = ?, tanggal_mulai = ?, tanggal_selesai = ?, status = ? WHERE id_proker = ?',
      [tema_proker.trim(), deskripsi || null, tanggal_mulai || null, tanggal_selesai || null, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Program kerja tidak ditemukan' });
    return res.status(200).json({ message: 'Program kerja berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/proker/:id - Admin only
const deleteProker = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM program_kerja WHERE id_proker = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Program kerja tidak ditemukan' });
    return res.status(200).json({ message: 'Program kerja berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllProker, getProkerById, createProker, updateProker, deleteProker };
