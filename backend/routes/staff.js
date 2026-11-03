// routes/staff.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const { createStaffController } = require('../controllers/staff/createStaff');
const { listStaffController } = require('../controllers/staff/listStaff');
const { getStaffController } = require('../controllers/staff/getStaff');
const { updateStaffController } = require('../controllers/staff/updateStaff');
const { deleteStaffController } = require('../controllers/staff/deleteStaff');
const { togglePortalAccessController } = require('../controllers/staff/togglePortalAccess');

// Core CRUD
router.post('/', authenticateToken, createStaffController);
router.get('/', authenticateToken, listStaffController);
router.get('/:id', authenticateToken, getStaffController);
router.patch('/:id', authenticateToken, updateStaffController);
router.delete('/:id', authenticateToken, deleteStaffController);

// Portal Access (Uses User ID, not Staff ID)
router.patch('/portal-access/:userId', authenticateToken, togglePortalAccessController);

module.exports = router;