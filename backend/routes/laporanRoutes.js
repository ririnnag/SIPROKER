const express = require('express');
const router = express.Router();
const {
  getAllLaporan, getLaporanById, getLaporanByProker,
  createLaporan, updateLaporan, deleteLaporan
} = require('../controllers/laporanController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminOnly, editorOrAbove } = require('../middleware/roleMiddleware');

// Important: specific routes before param routes
router.get('/proker/:id_proker', authenticateToken, getLaporanByProker);
router.get('/', authenticateToken, getAllLaporan);
router.get('/:id', authenticateToken, getLaporanById);
router.post('/', authenticateToken, editorOrAbove, createLaporan);
router.put('/:id', authenticateToken, editorOrAbove, updateLaporan);
router.delete('/:id', authenticateToken, adminOnly, deleteLaporan);

module.exports = router;
