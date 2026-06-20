const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const ctrl = require('../../controllers/admin/suscripciones.Controller');

router.use(adminAuthMiddleware);
router.get('/',     ctrl.listar);
router.post('/',    ctrl.crear);
router.put('/:id',  ctrl.actualizar);

module.exports = router;
