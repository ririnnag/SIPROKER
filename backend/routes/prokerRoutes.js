const express = require('express');
const router = express.Router();
const { getAllProker, getProkerById, createProker, updateProker, deleteProker } = require('../controllers/prokerController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminOnly, editorOrAbove } = require('../middleware/roleMiddleware');

router.get('/', authenticateToken, getAllProker);
router.get('/:id', authenticateToken, getProkerById);
router.post('/', authenticateToken, editorOrAbove, createProker);    // Admin + Editor
router.put('/:id', authenticateToken, editorOrAbove, updateProker);  // Admin + Editor
router.delete('/:id', authenticateToken, adminOnly, deleteProker);   // Admin only

module.exports = router;
