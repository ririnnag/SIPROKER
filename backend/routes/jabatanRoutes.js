const express = require('express');
const router = express.Router();
const { getAllJabatan, getJabatanById, createJabatan, updateJabatan, deleteJabatan } = require('../controllers/jabatanController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/', authenticateToken, getAllJabatan);
router.get('/:id', authenticateToken, getJabatanById);
router.post('/', authenticateToken, adminOnly, createJabatan);
router.put('/:id', authenticateToken, adminOnly, updateJabatan);
router.delete('/:id', authenticateToken, adminOnly, deleteJabatan);

module.exports = router;
