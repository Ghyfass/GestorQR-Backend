const router = require('express').Router();
const historialController = require('../controllers/historial.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

router.get('/',              verificarToken, soloAdmin, historialController.getHistorial);
router.get('/responsables',  verificarToken, soloAdmin, historialController.getResponsables);

module.exports = router;
