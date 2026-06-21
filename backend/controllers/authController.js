const db = require('../config/db');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Generate unique username: nama + 2-digit random + @pointer
const generateUsername = async (nama) => {
  const baseName = nama.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  let username;
  let isUnique = false;

  while (!isUnique) {
    const num = Math.floor(Math.random() * 90) + 10;
    username = `${baseName}${num}@pointer`;
    const [rows] = await db.query('SELECT id_user FROM users WHERE username = ?', [username]);
    if (rows.length === 0) isUnique = true;
  }

  return username;
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { nama, npm, password, invite_code, id_jabatan } = req.body;

    if (!nama || !npm || !password || !invite_code || !id_jabatan) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Validate invite code
    const [codeRows] = await db.query(
      'SELECT * FROM invite_code WHERE code = ? AND is_active = 1',
      [invite_code.trim().toUpperCase()]
    );

    if (codeRows.length === 0) {
      return res.status(400).json({ message: 'Invite code tidak valid atau sudah tidak aktif' });
    }

    const inviteCode = codeRows[0];

    // Get role id from role_default string
    const [roleRows] = await db.query(
      'SELECT id_role FROM roles WHERE nama_role = ?',
      [inviteCode.role_default]
    );

    if (roleRows.length === 0) {
      return res.status(500).json({ message: 'Konfigurasi role tidak ditemukan' });
    }

    const id_role = roleRows[0].id_role;

    // Check NPM uniqueness
    const [npmRows] = await db.query('SELECT id_user FROM users WHERE npm = ?', [npm]);
    if (npmRows.length > 0) {
      return res.status(400).json({ message: 'NPM sudah terdaftar dalam sistem' });
    }

    // Generate unique username
    const username = await generateUsername(nama);

    // Insert new user with pending status
    await db.query(
      'INSERT INTO users (username, password, nama, npm, id_jabatan, id_role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, password, nama, npm, id_jabatan, id_role, 'pending']
    );

    return res.status(201).json({
      message: 'Registrasi berhasil! Akun Anda sedang menunggu persetujuan Admin.',
      username: username
    });

  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    // Find user with role info
    const [rows] = await db.query(
      `SELECT u.*, r.nama_role, j.nama_jabatan, d.nama_divisi
       FROM users u
       LEFT JOIN roles r ON u.id_role = r.id_role
       LEFT JOIN jabatan j ON u.id_jabatan = j.id_jabatan
       LEFT JOIN divisi d ON j.id_divisi = d.id_divisi
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const user = rows[0];

    // Plain text password comparison
    if (user.password !== password) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Check account status
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Akun Anda masih menunggu persetujuan Admin' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Akun Anda telah ditolak oleh Admin' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Akun Anda tidak aktif' });
    }

    // Build JWT payload
    const payload = {
      id_user: user.id_user,
      nama: user.nama,
      username: user.username,
      npm: user.npm,
      id_jabatan: user.id_jabatan,
      nama_jabatan: user.nama_jabatan,
      id_role: user.id_role,
      nama_role: user.nama_role,
      status: user.status
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      message: 'Login berhasil',
      token,
      user: payload
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id_user, u.username, u.nama, u.npm, u.status,
              u.id_jabatan, j.nama_jabatan, j.butuh_divisi,
              d.id_divisi, d.nama_divisi,
              u.id_role, r.nama_role
       FROM users u
       LEFT JOIN jabatan j ON u.id_jabatan = j.id_jabatan
       LEFT JOIN divisi d ON j.id_divisi = d.id_divisi
       LEFT JOIN roles r ON u.id_role = r.id_role
       WHERE u.id_user = ?`,
      [req.user.id_user]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('[GET ME ERROR]', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/auth/public/jabatan (public route for registration form)
const getPublicJabatan = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT j.id_jabatan, j.nama_jabatan, j.butuh_divisi, d.nama_divisi
       FROM jabatan j
       LEFT JOIN divisi d ON j.id_divisi = d.id_divisi
       ORDER BY j.id_jabatan`
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, getMe, getPublicJabatan };
