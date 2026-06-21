const db = require('../config/db');

// GET /api/users - All authenticated users
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id_user, u.username, u.nama, u.npm, u.status,
              u.id_jabatan, j.nama_jabatan,
              u.id_role, r.nama_role,
              d.id_divisi, d.nama_divisi
       FROM users u
       LEFT JOIN jabatan j ON u.id_jabatan = j.id_jabatan
       LEFT JOIN divisi d ON j.id_divisi = d.id_divisi
       LEFT JOIN roles r ON u.id_role = r.id_role
       ORDER BY u.id_user DESC`
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error('[GET USERS ERROR]', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id_user, u.username, u.nama, u.npm, u.status,
              u.id_jabatan, j.nama_jabatan, j.butuh_divisi,
              u.id_role, r.nama_role,
              d.id_divisi, d.nama_divisi
       FROM users u
       LEFT JOIN jabatan j ON u.id_jabatan = j.id_jabatan
       LEFT JOIN divisi d ON j.id_divisi = d.id_divisi
       LEFT JOIN roles r ON u.id_role = r.id_role
       WHERE u.id_user = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/users - Admin only
const createUser = async (req, res) => {
  try {
    const { username, password, nama, npm, id_jabatan, id_role, status } = req.body;

    if (!username || !password || !nama || !npm || !id_jabatan || !id_role) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    await db.query(
      'INSERT INTO users (username, password, nama, npm, id_jabatan, id_role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, password, nama, npm, id_jabatan, id_role, status || 'active']
    );

    return res.status(201).json({ message: 'User berhasil dibuat' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username atau NPM sudah digunakan' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id - Admin only
const updateUser = async (req, res) => {
  try {
    const { nama, npm, id_jabatan, id_role, status, password } = req.body;
    const { id } = req.params;

    if (password) {
      await db.query(
        'UPDATE users SET nama = ?, npm = ?, id_jabatan = ?, id_role = ?, status = ?, password = ? WHERE id_user = ?',
        [nama, npm, id_jabatan, id_role, status, password, id]
      );
    } else {
      await db.query(
        'UPDATE users SET nama = ?, npm = ?, id_jabatan = ?, id_role = ?, status = ? WHERE id_user = ?',
        [nama, npm, id_jabatan, id_role, status, id]
      );
    }

    return res.status(200).json({ message: 'User berhasil diperbarui' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'NPM sudah digunakan user lain' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/users/:id - Admin only
const deleteUser = async (req, res) => {
  try {
    // Prevent deleting yourself
    if (parseInt(req.params.id) === req.user.id_user) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }
    await db.query('DELETE FROM users WHERE id_user = ?', [req.params.id]);
    return res.status(200).json({ message: 'User berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/approve - Admin only
const approveUser = async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE users SET status = 'active' WHERE id_user = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    return res.status(200).json({ message: 'User berhasil disetujui dan diaktifkan' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/reject - Admin only
const rejectUser = async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE users SET status = 'rejected' WHERE id_user = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    return res.status(200).json({ message: 'User berhasil ditolak' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, approveUser, rejectUser };
