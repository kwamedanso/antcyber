const { getAllPermissions } = require('../../services/rbac/rbac.service');

const getPermissionsController = async (req, res, next) => {
    try {
        const permissions = await getAllPermissions();
        return res.status(200).json({
            message: 'Permissions retrieved successfully.',
            data: permissions
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { getPermissionsController };