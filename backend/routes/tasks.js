// routes/task.routes.js
const express = require('express');
const router = express.Router();
const { createTaskController } = require('../controllers/task/createTask');
const { listTasksController } = require('../controllers/task/listTasks');
const { updateTaskController } = require('../controllers/task/updateTask');
const { authenticateToken } = require('../middleware/auth'); // your existing guard
const { getTaskByIdController } = require('../controllers/task/getTaskById'); 


router.post('/', authenticateToken, createTaskController);
router.get('/', authenticateToken, listTasksController);
router.get('/:id', authenticateToken, getTaskByIdController); 
router.patch('/:id', authenticateToken, updateTaskController);
// router.get('/:id', authenticateToken, getTaskController); // if you add one later

module.exports = router;