// getAllStaff.js
const { getAllStaff } = require('../../services/projects/project.service');

const getAllStaffController = async (req, res, next) => {
    try {
        const { q, limit, exclude } = req.query;

        // `exclude` may arrive as a CSV: ?exclude=id1,id2,id3
        const exclude_ids = exclude
            ? String(exclude).split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        const staff = await getAllStaff({
            search: q || null,
            exclude_ids,
            limit,
        });

        return res.status(200).json({
            message: 'Staff retrieved successfully.',
            data: staff,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllStaffController };