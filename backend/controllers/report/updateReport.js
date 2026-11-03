const { updateReport } = require('../../services/report/report.service');

const updateReportController = async (req, res, next) => {
    try {
        const files = req.files || [];
        const report = await updateReport(req.params.id, req.body, files, req.user.userId);
        return res.status(200).json({
            message: 'Report updated successfully.',
            data: report
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { updateReportController };