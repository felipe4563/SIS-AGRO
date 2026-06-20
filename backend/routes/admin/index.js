const router = require('express').Router();

router.use('/auth',           require('./auth.Routes'));
router.use('/dashboard',      require('./dashboard.Routes'));
router.use('/empresas',       require('./empresas.Routes'));
router.use('/planes',         require('./planes.Routes'));
router.use('/suscripciones',  require('./suscripciones.Routes'));
router.use('/pagos',          require('./pagos.Routes'));
router.use('/perfil',         require('./perfil.Routes'));

module.exports = router;
