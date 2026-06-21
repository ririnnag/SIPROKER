const express = require('express');
const router = express.Router();
const {
  getAllKepanitiaan, getKepanitiaanByProker,
  createKepanitiaan, updateKepanitiaan, deleteKepanitiaan
} = require('../controllers/kepanitiaanController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminOnly, editorOrAbove } = require('../middleware/roleMiddleware');

router.get('/', authenticateToken, getAllKepanitiaan);
router.get('/proker/:id_proker', authenticateToken, getKepanitiaanByProker);
router.post('/', authenticateToken, editorOrAbove, createKepanitiaan);
router.put('/:id', authenticateToken, editorOrAbove, updateKepanitiaan);
router.delete('/:id', authenticateToken, adminOnly, deleteKepanitiaan);

module.exports = router;
