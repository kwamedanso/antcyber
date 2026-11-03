// updateTask.js
const { updateTask, getTaskById } = require('../../services/task/task.service');

const updateTaskController = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Optional: 404 fast if the task doesn't exist
        const existing = await getTaskById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const task = await updateTask(id, req.body, req.user.userId);

        return res.status(200).json({
            message: 'Task updated successfully.',
            data: task
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { updateTaskController };