const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const { listar, editar } = require('../../controllers/admin/planes.Controller');

router.use(adminAuthMiddleware);
router.get('/',     listar);
router.put('/:id',  editar);

module.exports = router;
