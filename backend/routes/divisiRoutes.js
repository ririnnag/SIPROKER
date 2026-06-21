const express = require('express');
const router = express.Router();
const { getAllDivisi, getDivisiById, createDivisi, updateDivisi, deleteDivisi } = require('../controllers/divisiController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/', authenticateToken, getAllDivisi);
router.get('/:id', authenticateToken, getDivisiById);
router.post('/', authenticateToken, adminOnly, createDivisi);
router.put('/:id', authenticateToken, adminOnly, updateDivisi);
router.delete('/:id', authenticateToken, adminOnly, deleteDivisi);

module.exports = router;
