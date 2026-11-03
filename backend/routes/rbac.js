const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');

const { getPermissionsController } = require('../controllers/rbac/getPermissions');
const { getRolesController } = require('../controllers/rbac/getRoles');
const { createRoleController } = require('../controllers/rbac/createRole');
const { updateRoleController } = require('../controllers/rbac/updateRole');
const { deleteRoleController } = require('../controllers/rbac/deleteRole');
const { getUserAccessController } = require('../controllers/rbac/getUserAccess');
const { getRolePermissionsController } = require('../controllers/rbac/getRolePermissions');



// Permissions (Read-only for users, usually seeded by developers)
router.get('/permissions', authenticateToken, getPermissionsController);

// Roles CRUD
router.get('/roles', authenticateToken, getRolesController);
router.get('/users/:userId/access', authenticateToken, getUserAccessController)
router.get('/roles/:roleId/permissions', authenticateToken, getRolePermissionsController);
router.get('/roles/:id', authenticateToken, getRolesController);
router.post('/roles', authenticateToken, createRoleController);
router.patch('/roles/:id', authenticateToken, updateRoleController);
router.delete('/roles/:id', authenticateToken, deleteRoleController);

module.exports = router;