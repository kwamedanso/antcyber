// controllers/rbac/getRolePermissions.js
const { getRolePermissions } = require('../../services/rbac/rbac.service');

const getRolePermissionsController = async (req, res, next) => {
    try {
        const permissions = await getRolePermissions(req.params.roleId);
        return res.status(200).json({ data: permissions });
    } catch (error) {
        next(error);
    }
};

module.exports = { getRolePermissionsController };