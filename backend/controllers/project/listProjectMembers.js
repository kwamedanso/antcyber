// listProjectMembers.js
const { listProjectMembers } = require('../../services/projects/project.service');

const listProjectMembersController = async (req, res, next) => {
    try {
        const { search } = req.query;
        const members = await listProjectMembers(req.params.id, { search });
        return res.status(200).json({
            message: 'Project members retrieved successfully.',
            data: members
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { listProjectMembersController };