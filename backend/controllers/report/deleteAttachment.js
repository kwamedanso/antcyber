const { deleteAttachment } = require('../../services/report/report.service');

const deleteAttachmentController = async (req, res, next) => {
    try {
        const { id, attachmentId } = req.params;
        await deleteAttachment(id, attachmentId);
        return res.status(200).json({ message: 'Attachment removed successfully.' });
    } catch (error) {
        next(error);
    }
};
module.exports = { deleteAttachmentController };