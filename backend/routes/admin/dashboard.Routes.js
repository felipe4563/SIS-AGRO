const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const { getDashboard } = require('../../controllers/admin/dashboard.Controller');

router.use(adminAuthMiddleware);
router.get('/', getDashboard);

module.exports = router;
