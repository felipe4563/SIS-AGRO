const router = require('express').Router();
const ctrl = require('../controllers/ventas.Controller');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/pos-productos', checkPermission('crear', 'ventas'), ctrl.listarProductosPOS);

router.get('/',    checkPermission('ver',    'ventas'), ctrl.listar);
router.get('/:id', checkPermission('ver',    'ventas'), ctrl.obtener);
router.post('/',   checkPermission('crear',  'ventas'), ctrl.crear);
router.post('/checkout-qr', checkPermission('crear', 'ventas'), ctrl.iniciarPagoQR);
router.get('/checkout-qr/status/:tx_id', checkPermission('crear', 'ventas'), ctrl.estadoPagoQR);
router.patch('/:id/anular', checkPermission('anular', 'ventas'), ctrl.anular);

module.exports = router;
