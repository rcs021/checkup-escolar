const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');
const { verificarToken, permitir } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', turmaController.listar);
router.get('/:id', turmaController.buscarPorId);
router.post('/', permitir('admin'), turmaController.criar);
router.put('/:id', permitir('admin'), turmaController.atualizar);
router.delete('/:id', permitir('admin'), turmaController.excluir);

module.exports = router;
