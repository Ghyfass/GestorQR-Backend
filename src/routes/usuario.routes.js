const router = require('express').Router();
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

router.get('/',      verificarToken, soloAdmin, usuarioController.getUsuarios);
router.post('/',     verificarToken, soloAdmin, usuarioController.createUsuario);
router.put('/:id',   verificarToken, soloAdmin, usuarioController.updateUsuario);
router.delete('/:id',verificarToken, soloAdmin, usuarioController.deleteUsuario);

module.exports = router;
