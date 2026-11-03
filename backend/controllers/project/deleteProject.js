// controllers/project/deleteProject.js
const { deleteProject } = require('../../services/projects/project.service');

const deleteProjectController = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        await deleteProject(id);

        return res.status(200).json({
            message: 'Project deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { deleteProjectController };