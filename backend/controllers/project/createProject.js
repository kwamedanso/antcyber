// createProject.js
const { createProject } = require('../../services/projects/project.service');

const createProjectController = async (req, res, next) => {
    try {
        const project = await createProject(req.body, req.user.userId);
        return res.status(201).json({
            message: 'Project created successfully.',
            data: project
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createProjectController };