const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const { listar, registrar } = require('../../controllers/admin/pagos.Controller');

router.use(adminAuthMiddleware);
router.get('/',  listar);
router.post('/', registrar);

module.exports = router;
