const { updateRole, updateRolePermissions } = require('../../services/rbac/rbac.service');

const updateRoleController = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // If payload contains permission_ids, sync them
        if (req.body.permission_ids !== undefined) {
            const role = await updateRolePermissions(id, req.body.permission_ids, req.user.userId);
            return res.status(200).json({
                message: 'Role permissions updated successfully.',
                data: role
            });
        }

        // Otherwise, just update role meta (display_name, is_active)
        const role = await updateRole(id, req.body, req.user.id);
        return res.status(200).json({
            message: 'Role updated successfully.',
            data: role
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { updateRoleController };