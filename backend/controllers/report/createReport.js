const { createReport } = require('../../services/report/report.service');

const createReportController = async (req, res, next) => {
    try {
        // req.files contains the uploaded files from multer
        const files = req.files || [];
        const report = await createReport(req.body, files, req.user.userId);
        
        return res.status(201).json({
            message: 'Report created successfully.',
            data: report
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { createReportController };