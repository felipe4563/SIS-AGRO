const router = require('express').Router();
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/categoriasMovimiento.Controller');

router.use(authMiddleware);

router.get('/',      checkPermission('ver',        'categorias_movimiento'),  ctrl.listar);
router.post('/',     checkPermission('gestionar',  'categorias_movimiento'),  ctrl.crear);
router.put('/:id',   checkPermission('gestionar',  'categorias_movimiento'),  ctrl.actualizar);
router.delete('/:id',checkPermission('gestionar',  'categorias_movimiento'),  ctrl.eliminar);

module.exports = router;
