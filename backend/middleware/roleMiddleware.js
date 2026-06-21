/**
 * Role IDs:
 *  1 = admin   (KAHIM, WAKAHIM)
 *  2 = editor  (SEKUM, WASEKUM, KADIV/WAKADIV ADMINISTRASI)
 *  3 = viewer  (KADIV, WAKADIV, STAFF, BENDUM, WABENDUM)
 */

// Admin only (id_role === 1)
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.id_role !== 1) {
    return res.status(403).json({ message: 'Hanya Admin yang dapat mengakses fitur ini' });
  }
  next();
};

// Admin and Editor (id_role === 1 or 2)
const editorOrAbove = (req, res, next) => {
  if (!req.user || req.user.id_role > 2) {
    return res.status(403).json({ message: 'Hanya Admin dan Editor yang dapat mengakses fitur ini' });
  }
  next();
};

// Any authenticated user
const authenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Autentikasi diperlukan' });
  }
  next();
};

module.exports = { adminOnly, editorOrAbove, authenticated };
