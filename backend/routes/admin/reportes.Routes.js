const router = require('express').Router();
const { getReporte, getReportePDF } = require('../../controllers/admin/reportes.Controller');
const { adminAuthMiddleware: adminAuth } = require('../../middlewares/adminAuthMiddleware');

router.get('/',    adminAuth, getReporte);
router.get('/pdf', adminAuth, getReportePDF);

module.exports = router;
