const express = require('express');
const router = express.Router();
const {
  getAllInviteCodes, createInviteCode, updateInviteCode,
  deleteInviteCode, toggleInviteCode
} = require('../controllers/inviteCodeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// All invite code routes: admin only
router.get('/', authenticateToken, adminOnly, getAllInviteCodes);
router.post('/', authenticateToken, adminOnly, createInviteCode);
router.put('/:id', authenticateToken, adminOnly, updateInviteCode);
router.delete('/:id', authenticateToken, adminOnly, deleteInviteCode);
router.patch('/:id/toggle', authenticateToken, adminOnly, toggleInviteCode);

module.exports = router;
