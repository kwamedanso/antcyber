const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const { createReportController } = require('../controllers/report/createReport');
const { listReportsController } = require('../controllers/report/listReports');
const { getReportController } = require('../controllers/report/getReport');
const { updateReportController } = require('../controllers/report/updateReport');
const { deleteReportController } = require('../controllers/report/deleteReport');
const { getNextReferenceController } = require('../controllers/report/getNextReference');
const { deleteAttachmentController } = require('../controllers/report/deleteAttachment');



// upload.array('files', 5) accepts up to 5 files in a field named "files"
router.post('/', authenticateToken, upload.array('files', 5), createReportController);
router.get('/', authenticateToken, listReportsController);
router.get('/next-reference', authenticateToken, getNextReferenceController);
router.get('/:id', authenticateToken, getReportController);
router.patch('/:id', authenticateToken, upload.array('files', 5), updateReportController);
router.delete('/:id', authenticateToken, deleteReportController);
router.delete('/:id/attachments/:attachmentId', authenticateToken, deleteAttachmentController);


module.exports = router;