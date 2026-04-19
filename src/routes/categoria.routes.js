const router = require('express').Router();
const categoriaController = require('../controllers/categoria.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

router.get('/',      verificarToken, categoriaController.getCategorias);
router.post('/',     verificarToken, soloAdmin, categoriaController.createCategoria);
router.put('/:id',   verificarToken, soloAdmin, categoriaController.updateCategoria);
router.delete('/:id',verificarToken, soloAdmin, categoriaController.deleteCategoria);

module.exports = router;
