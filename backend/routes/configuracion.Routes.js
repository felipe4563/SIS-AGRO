const router = require('express').Router();
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/configuracion.Controller');

router.get('/', authMiddleware, ctrl.obtener);

router.put('/', authMiddleware, checkPermission('editar', 'configuracion'), ctrl.actualizar);

module.exports = router;
