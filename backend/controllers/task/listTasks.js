// listTasks.js
const { listTasks } = require('../../services/task/task.service');

const listTasksController = async (req, res, next) => {
    try {
        const { page, limit, project_id, assignee_id, status, priority, search, created_by } =
            req.query;

        const result = await listTasks(
            { project_id, assignee_id, status, priority, search, created_by },
            { page, limit }
        );

        return res.status(200).json({
            message: 'Tasks retrieved successfully.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { listTasksController };