// routes/project.routes.js
const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');

const { createProjectController }    = require('../controllers/project/createProject');
const { listProjectsController }     = require('../controllers/project/listProjects');
const { getProjectController }       = require('../controllers/project/getProject');
const { listProjectMembersController } = require('../controllers/project/listProjectMembers');
const { updateProjectController }    = require('../controllers/project/updateProject');
const { getAllStaffController } = require('../controllers/project/getAllStaff');
const { deleteProjectController } = require('../controllers/project/deleteProject');



router.post('/',             authenticateToken, createProjectController);
router.get('/',              authenticateToken, listProjectsController);
router.get('/all-staff',     authenticateToken, getAllStaffController);
router.get('/:id',           authenticateToken, getProjectController);
router.get('/:id/members',   authenticateToken, listProjectMembersController);
router.patch('/:id',         authenticateToken, updateProjectController);
router.delete('/:id',       authenticateToken, deleteProjectController);


module.exports = router;