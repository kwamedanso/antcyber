// getTaskById.js
const { getTaskById } = require('../../services/task/task.service');

const getTaskByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const task = await getTaskById(id);

        if (!task) {
            return res.status(404).json({
                message: 'Task not found.'
            });
        }

        return res.status(200).json({
            message: 'Task retrieved successfully.',
            data: task
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTaskByIdController };