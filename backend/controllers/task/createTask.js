// createTask.js
const { createTask } = require('../../services/task/task.service');

const createTaskController = async (req, res, next) => {

    try {
        const task = await createTask(req.body, req.user.userId);
        return res.status(201).json({
            message: 'Task created successfully.',
            data: task
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createTaskController };