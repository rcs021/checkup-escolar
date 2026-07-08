const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');
const { verificarToken, permitir } = require('../middleware/auth');

router.use(verificarToken, permitir('admin'));

router.get('/', profissionalController.listar);
router.get('/:id', profissionalController.buscarPorId);
router.post('/', profissionalController.criar);
router.put('/:id', profissionalController.atualizar);
router.delete('/:id', profissionalController.excluir);

module.exports = router;
