const express = require('express');
const router  = express.Router();
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/creditos.Controller');

router.use(authMiddleware);

// ── Cuentas por Cobrar (ventas a crédito) ───────────────────────────────
router.get('/cobrar',                checkPermission('ver',    'creditos'), ctrl.listarCuentasPorCobrar);
router.get('/cobrar/:id/pagos',      checkPermission('ver',    'creditos'), ctrl.listarPagosVenta);
router.post('/cobrar/:id/abono',     checkPermission('abonar', 'creditos'), ctrl.registrarAbonoVenta);

// ── Cuentas por Pagar (compras a crédito) ───────────────────────────────
router.get('/pagar',                 checkPermission('ver',    'creditos'), ctrl.listarCuentasPorPagar);
router.get('/pagar/:id/pagos',       checkPermission('ver',    'creditos'), ctrl.listarPagosCompra);
router.post('/pagar/:id/abono',      checkPermission('abonar', 'creditos'), ctrl.registrarAbonoCompra);

// ── Reportes ─────────────────────────────────────────────────────────────
router.get('/reporte/cobrar',        checkPermission('creditos', 'reportes'), ctrl.reporteCobrar);
router.get('/reporte/pagar',         checkPermission('creditos', 'reportes'), ctrl.reportePagar);

module.exports = router;
