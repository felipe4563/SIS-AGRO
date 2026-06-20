const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const { getPerfil, updatePerfil, updatePassword } = require('../../controllers/admin/perfil.Controller');

router.use(adminAuthMiddleware);
router.get('/',         getPerfil);
router.put('/',         updatePerfil);
router.put('/password', updatePassword);

module.exports = router;
