const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

// POST /api/auth/login  →  público
router.post('/login', authController.login);

// POST /api/auth/cambiar-password  →  solo admin
// (para hashear las contraseñas existentes por primera vez)
router.post('/cambiar-password', verificarToken, soloAdmin, authController.cambiarPassword);

module.exports = router;