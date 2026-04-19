const router = require('express').Router();
const scanController = require('../controllers/scan.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// GET  /api/scan/:hash        — ver datos del item (requiere login)
// POST /api/scan/:hash/registrar — registrar inspección (requiere login)
router.get('/:hash',            verificarToken, scanController.scanQR);
router.post('/:hash/registrar', verificarToken, scanController.registrarScan);

module.exports = router;
