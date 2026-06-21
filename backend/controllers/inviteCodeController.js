const db = require('../config/db');

// GET /api/invite-code - Admin only
const getAllInviteCodes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM invite_code ORDER BY id DESC');
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/invite-code - Admin only
const createInviteCode = async (req, res) => {
  try {
    const { code, role_default, is_active } = req.body;
    if (!code || !code.trim() || !role_default) {
      return res.status(400).json({ message: 'Kode dan role wajib diisi' });
    }
    if (!['admin', 'editor', 'viewer'].includes(role_default)) {
      return res.status(400).json({ message: 'Role harus: admin, editor, atau viewer' });
    }
    await db.query(
      'INSERT INTO invite_code (code, role_default, is_active) VALUES (?, ?, ?)',
      [code.trim().toUpperCase(), role_default, is_active !== undefined ? is_active : 1]
    );
    return res.status(201).json({ message: 'Invite code berhasil dibuat' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Kode sudah ada, gunakan kode yang berbeda' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/invite-code/:id - Admin only
const updateInviteCode = async (req, res) => {
  try {
    const { code, role_default, is_active } = req.body;
    if (!['admin', 'editor', 'viewer'].includes(role_default)) {
      return res.status(400).json({ message: 'Role harus: admin, editor, atau viewer' });
    }
    const [result] = await db.query(
      'UPDATE invite_code SET code = ?, role_default = ?, is_active = ? WHERE id = ?',
      [code.trim().toUpperCase(), role_default, is_active ? 1 : 0, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Invite code tidak ditemukan' });
    return res.status(200).json({ message: 'Invite code berhasil diperbarui' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Kode sudah digunakan' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/invite-code/:id - Admin only
const deleteInviteCode = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM invite_code WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Invite code tidak ditemukan' });
    return res.status(200).json({ message: 'Invite code berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/invite-code/:id/toggle - Admin only
const toggleInviteCode = async (req, res) => {
  try {
    await db.query(
      'UPDATE invite_code SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?',
      [req.params.id]
    );
    return res.status(200).json({ message: 'Status invite code berhasil diubah' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllInviteCodes, createInviteCode, updateInviteCode, deleteInviteCode, toggleInviteCode };
