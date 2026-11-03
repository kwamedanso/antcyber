const { deleteReport } = require('../../services/report/report.service');

const deleteReportController = async (req, res, next) => {
    try {
        await deleteReport(req.params.id);
        return res.status(200).json({
            message: 'Report deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { deleteReportController };