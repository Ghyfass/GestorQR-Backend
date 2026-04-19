const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

router.get('/', verificarToken, soloAdmin, dashboardController.getDashboard);

module.exports = router;
