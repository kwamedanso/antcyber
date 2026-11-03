// listProjects.js
const { listProjects } = require('../../services/projects/project.service');

const listProjectsController = async (req, res, next) => {
    try {
        const { page, limit, search, member_id } = req.query;

        const result = await listProjects(
            { search, member_id },
            { page, limit }
        );

        return res.status(200).json({
            message: 'Projects retrieved successfully.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { listProjectsController };