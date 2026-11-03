const { createRole } = require('../../services/rbac/rbac.service');

const createRoleController = async (req, res, next) => {
    try {
        const role = await createRole(req.body, req.user.userId);
        return res.status(201).json({
            message: 'Role created successfully.',
            data: role
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { createRoleController };