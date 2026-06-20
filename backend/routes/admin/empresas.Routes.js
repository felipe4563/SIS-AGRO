const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const ctrl = require('../../controllers/admin/empresas.Controller');

router.use(adminAuthMiddleware);
router.get('/',             ctrl.listar);
router.post('/',            ctrl.crear);
router.put('/:id',          ctrl.editar);
router.patch('/:id/toggle', ctrl.toggle);

module.exports = router;
