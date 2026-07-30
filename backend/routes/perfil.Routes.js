const router = require('express').Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getPerfil, updatePerfil } = require('../controllers/perfil.Controller');

router.use(authMiddleware);
router.get('/', getPerfil);
router.put('/', updatePerfil);

module.exports = router;
