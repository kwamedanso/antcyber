const { deleteRole } = require('../../services/rbac/rbac.service');

const deleteRoleController = async (req, res, next) => {
    try {
        await deleteRole(req.params.id);
        return res.status(200).json({ message: 'Role deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
module.exports = { deleteRoleController };