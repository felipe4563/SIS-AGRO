const express = require('express');
const router = express.Router();
const {
  login,
  solicitarRecuperacion,
  verificarCodigoRecuperacion,
  restablecerContrasena,
} = require('../controllers/auth.Controller');

router.post('/login', login);
router.post('/recuperar/solicitar',   solicitarRecuperacion);
router.post('/recuperar/verificar',   verificarCodigoRecuperacion);
router.post('/recuperar/restablecer', restablecerContrasena);

module.exports = router;
