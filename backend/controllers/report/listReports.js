// controllers/report/listReports.js
const { listReports } = require('../../services/report/report.service');

const listReportsController = async (req, res, next) => {
    try {
        const { 
            page, 
            limit, 
            search, 
            status, 
            report_type, 
            prepared_by, 
            submitted_to 
        } = req.query;

        const result = await listReports(
            { search, status, report_type, prepared_by, submitted_to },
            { page, limit }
        );

        return res.status(200).json({
            message: 'Reports retrieved successfully.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { listReportsController };