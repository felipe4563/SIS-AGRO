const router = require('express').Router();
const { login } = require('../../controllers/admin/auth.Controller');

router.post('/login', login);

module.exports = router;
