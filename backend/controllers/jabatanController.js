const db = require('../config/db');

// GET /api/jabatan
const getAllJabatan = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT j.id_jabatan, j.nama_jabatan, j.id_divisi, j.butuh_divisi, d.nama_divisi
       FROM jabatan j
       LEFT JOIN divisi d ON j.id_divisi = d.id_divisi
       ORDER BY j.id_jabatan`
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/jabatan/:id
const getJabatanById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT j.id_jabatan, j.nama_jabatan, j.id_divisi, j.butuh_divisi, d.nama_divisi
       FROM jabatan j
       LEFT JOIN divisi d ON j.id_divisi = d.id_divisi
       WHERE j.id_jabatan = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Jabatan tidak ditemukan' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/jabatan - Admin only
const createJabatan = async (req, res) => {
  try {
    const { nama_jabatan, id_divisi, butuh_divisi } = req.body;
    if (!nama_jabatan || !nama_jabatan.trim()) {
      return res.status(400).json({ message: 'Nama jabatan wajib diisi' });
    }
    await db.query(
      'INSERT INTO jabatan (nama_jabatan, id_divisi, butuh_divisi) VALUES (?, ?, ?)',
      [nama_jabatan.trim(), id_divisi || null, butuh_divisi ? 1 : 0]
    );
    return res.status(201).json({ message: 'Jabatan berhasil dibuat' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/jabatan/:id - Admin only
const updateJabatan = async (req, res) => {
  try {
    const { nama_jabatan, id_divisi, butuh_divisi } = req.body;
    if (!nama_jabatan || !nama_jabatan.trim()) {
      return res.status(400).json({ message: 'Nama jabatan wajib diisi' });
    }
    const [result] = await db.query(
      'UPDATE jabatan SET nama_jabatan = ?, id_divisi = ?, butuh_divisi = ? WHERE id_jabatan = ?',
      [nama_jabatan.trim(), id_divisi || null, butuh_divisi ? 1 : 0, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Jabatan tidak ditemukan' });
    return res.status(200).json({ message: 'Jabatan berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/jabatan/:id - Admin only
const deleteJabatan = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM jabatan WHERE id_jabatan = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Jabatan tidak ditemukan' });
    return res.status(200).json({ message: 'Jabatan berhasil dihapus' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Jabatan tidak dapat dihapus karena masih digunakan oleh anggota' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllJabatan, getJabatanById, createJabatan, updateJabatan, deleteJabatan };
