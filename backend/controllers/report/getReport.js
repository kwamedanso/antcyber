const { getReportById } = require('../../services/report/report.service');

const getReportController = async (req, res, next) => {
    try {
        const report = await getReportById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found.' });
        
        return res.status(200).json({
            message: 'Report retrieved successfully.',
            data: report
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { getReportController };