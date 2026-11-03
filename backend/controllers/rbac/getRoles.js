const { getAllRoles, getRoleById } = require('../../services/rbac/rbac.service');

const getRolesController = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id) {
            const role = await getRoleById(id);
            if (!role) return res.status(404).json({ message: 'Role not found.' });
            return res.status(200).json({ message: 'Role retrieved.', data: role });
        }

        const roles = await getAllRoles();
        return res.status(200).json({
            message: 'Roles retrieved successfully.',
            data: roles
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { getRolesController };