const router = require('express').Router();
const multer = require('multer');
const ctrl   = require('../controllers/almacen.Controller');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.includes('spreadsheet') ||
               file.mimetype.includes('excel') ||
               file.originalname.toLowerCase().endsWith('.xlsx');
    if (ok) cb(null, true);
    else cb(new Error('Solo se aceptan archivos .xlsx'));
  },
});

router.use(authMiddleware);

// Lotes
router.get('/lotes',             checkPermission('ver_lotes',        'almacen'), ctrl.listarLotes);
router.get('/lotes/:id',         checkPermission('ver_lote_detalle', 'almacen'), ctrl.obtenerLote);
router.post('/lotes',            checkPermission('ingresar',         'almacen'), ctrl.crearLote);
router.post('/lotes/:id/ajuste', checkPermission('ajustar',          'almacen'), ctrl.ajusteInventario);
router.patch('/lotes/:id/baja',  checkPermission('dar_baja_lote',    'almacen'), ctrl.darBajaLote);

// Traslados
router.get('/traslados',                    checkPermission('trasladar', 'almacen'), ctrl.listarTraslados);
router.post('/traslados',                   checkPermission('trasladar', 'almacen'), ctrl.crearTraslado);
router.patch('/traslados/:id/confirmar',    checkPermission('trasladar', 'almacen'), ctrl.confirmarTraslado);
router.patch('/traslados/:id/cancelar',     checkPermission('trasladar', 'almacen'), ctrl.cancelarTraslado);

// Alertas
router.get('/alertas', checkPermission('ver_vencimientos', 'almacen'), ctrl.listarAlertas);

// Auxiliares (para formularios)
router.get('/aux/productos',   checkPermission('ingresar', 'almacen'),  ctrl.listarProductosActivos);
router.get('/aux/sucursales',  checkPermission('trasladar', 'almacen'), ctrl.listarSucursalesActivas);

// Importar inventario desde Excel
router.post('/importar', checkPermission('importar', 'almacen'), uploadExcel.single('archivo'), ctrl.importarInventario);

module.exports = router;
