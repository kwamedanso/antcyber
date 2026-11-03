// controllers/report/getNextReference.js
const { getNextReferenceNumber } = require('../../services/report/report.service');

const getNextReferenceController = async (req, res, next) => {
    try {
        const referenceNumber = await getNextReferenceNumber();
        
        return res.status(200).json({
            message: 'Next reference number generated successfully.',
            data: { reference_number: referenceNumber }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getNextReferenceController };