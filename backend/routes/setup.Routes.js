const router = require('express').Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/setup.Controller');

router.use(authMiddleware);

router.get('/empresa-info', ctrl.getEmpresaInfo);
router.post('/completar', ctrl.completarSetup);

module.exports = router;
