const router = require('express').Router();
const ctrl = require('../controllers/caja.Controller');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/cajas',              checkPermission('ver', 'caja'),         ctrl.listarCajas);
router.post('/cajas',             checkPermission('crear', 'caja'),       ctrl.crearCaja);
router.put('/cajas/:id',          checkPermission('editar', 'caja'),      ctrl.editarCaja);
router.patch('/cajas/:id/toggle', checkPermission('activar', 'caja'),     ctrl.toggleCaja);

router.get('/turnos',             checkPermission('ver_historial', 'caja'),   ctrl.listarTurnos);
router.get('/movimientos-turno',  checkPermission('ver_movimientos', 'caja'), ctrl.listarMovimientosTurno);
router.get('/turno-activo',       checkPermission('ver', 'caja'),           ctrl.obtenerTurnoActivo);
router.post('/abrir',             checkPermission('abrir', 'caja'),         ctrl.abrirCaja);
router.patch('/:id/cerrar',       checkPermission('cerrar', 'caja'),        ctrl.cerrarCaja);

module.exports = router;
