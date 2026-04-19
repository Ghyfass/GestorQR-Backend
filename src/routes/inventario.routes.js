const router = require('express').Router();
const inventarioController = require('../controllers/inventario.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

// Todas las rutas de inventario requieren estar logueado
router.get('/stats', verificarToken, soloAdmin, inventarioController.getStats);
router.get('/',        verificarToken, inventarioController.getInventario);
router.post('/',       verificarToken, soloAdmin, inventarioController.createInventario);
router.put('/:id',     verificarToken, soloAdmin, inventarioController.updateInventario);
router.delete('/:id',  verificarToken, soloAdmin, inventarioController.deleteInventario);

// GET /:id/qr  →  cualquier usuario logueado puede escanear
router.get('/:id/qr',  verificarToken, inventarioController.getQR);

module.exports = router;