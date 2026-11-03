// getProject.js
const { getProjectById } = require('../../services/projects/project.service');

const getProjectController = async (req, res, next) => {
    try {
        const project = await getProjectById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        return res.status(200).json({
            message: 'Project retrieved successfully.',
            data: project
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProjectController };