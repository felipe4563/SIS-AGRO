const router = require('express').Router();
const ctrl   = require('../controllers/mezclas.Controller');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Auxiliares (sin permiso extra, solo autenticado)
router.get('/aux/productos', ctrl.listarProductosAux);
router.get('/aux/unidades',  ctrl.listarUnidadesAux);

// CRUD de fórmulas
router.get('/',              checkPermission('ver',           'mezclas'), ctrl.listarMezclas);
router.get('/aplicaciones',  checkPermission('ver_historial', 'mezclas'), ctrl.listarAplicaciones);
router.get('/:id',           checkPermission('ver',           'mezclas'), ctrl.obtenerMezcla);
router.post('/',             checkPermission('crear',         'mezclas'), ctrl.crearMezcla);
router.put('/:id',           checkPermission('editar',        'mezclas'), ctrl.editarMezcla);
router.patch('/:id/activar', checkPermission('activar',       'mezclas'), ctrl.toggleMezcla);

// Aplicar (descuenta stock)
router.post('/:id/aplicar',  checkPermission('aplicar',       'mezclas'), ctrl.aplicarMezcla);

module.exports = router;
