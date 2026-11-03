// updateProject.js
const { updateProject } = require('../../services/projects/project.service');

const updateProjectController = async (req, res, next) => {
    try {
        const project = await updateProject(req.params.id, req.body, req.user.userId);
        return res.status(200).json({
            message: 'Project updated successfully.',
            data: project
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { updateProjectController };