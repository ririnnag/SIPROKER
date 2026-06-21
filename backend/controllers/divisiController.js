const db = require('../config/db');

// GET /api/divisi
const getAllDivisi = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM divisi ORDER BY id_divisi');
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/divisi/:id
const getDivisiById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM divisi WHERE id_divisi = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Divisi tidak ditemukan' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/divisi - Admin only
const createDivisi = async (req, res) => {
  try {
    const { nama_divisi } = req.body;
    if (!nama_divisi || !nama_divisi.trim()) {
      return res.status(400).json({ message: 'Nama divisi wajib diisi' });
    }
    await db.query('INSERT INTO divisi (nama_divisi) VALUES (?)', [nama_divisi.trim()]);
    return res.status(201).json({ message: 'Divisi berhasil dibuat' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/divisi/:id - Admin only
const updateDivisi = async (req, res) => {
  try {
    const { nama_divisi } = req.body;
    if (!nama_divisi || !nama_divisi.trim()) {
      return res.status(400).json({ message: 'Nama divisi wajib diisi' });
    }
    const [result] = await db.query(
      'UPDATE divisi SET nama_divisi = ? WHERE id_divisi = ?',
      [nama_divisi.trim(), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Divisi tidak ditemukan' });
    return res.status(200).json({ message: 'Divisi berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/divisi/:id - Admin only
const deleteDivisi = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM divisi WHERE id_divisi = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Divisi tidak ditemukan' });
    return res.status(200).json({ message: 'Divisi berhasil dihapus' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Divisi tidak dapat dihapus karena masih digunakan oleh jabatan' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllDivisi, getDivisiById, createDivisi, updateDivisi, deleteDivisi };
