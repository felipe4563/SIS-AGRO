const router = require('express').Router();
const {
  login,
  solicitarRecuperacion,
  verificarCodigoRecuperacion,
  restablecerContrasena,
} = require('../../controllers/admin/auth.Controller');

router.post('/login', login);
router.post('/recuperar/solicitar',   solicitarRecuperacion);
router.post('/recuperar/verificar',   verificarCodigoRecuperacion);
router.post('/recuperar/restablecer', restablecerContrasena);

module.exports = router;
