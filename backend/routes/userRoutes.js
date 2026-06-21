const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, createUser, updateUser,
  deleteUser, approveUser, rejectUser
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// Read: all authenticated users
router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);

// Write: admin only
router.post('/', authenticateToken, adminOnly, createUser);
router.put('/:id', authenticateToken, adminOnly, updateUser);
router.delete('/:id', authenticateToken, adminOnly, deleteUser);

// Approval: admin only
router.put('/:id/approve', authenticateToken, adminOnly, approveUser);
router.put('/:id/reject', authenticateToken, adminOnly, rejectUser);

module.exports = router;
