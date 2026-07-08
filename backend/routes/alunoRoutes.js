const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const { verificarToken, permitir } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verificarToken);

router.get('/', alunoController.listar);
router.get('/:id', alunoController.buscarPorId);
router.post('/', permitir('admin'), upload.single('foto'), alunoController.criar);
router.put('/:id', permitir('admin'), upload.single('foto'), alunoController.atualizar);
router.delete('/:id', permitir('admin'), alunoController.excluir);

module.exports = router;
