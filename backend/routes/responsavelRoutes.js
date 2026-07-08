const express = require('express');
const router = express.Router();
const responsavelController = require('../controllers/responsavelController');
const { verificarToken, permitir } = require('../middleware/auth');

router.use(verificarToken);

// Rotas de auto-atendimento do responsável (precisam vir antes de "/:id")
router.get('/meus-alunos', permitir('responsavel'), responsavelController.meusAlunos);
router.get('/meu-perfil', permitir('responsavel'), responsavelController.meuPerfil);
router.put('/meu-perfil', permitir('responsavel'), responsavelController.atualizarMeuPerfil);

router.get('/', permitir('admin'), responsavelController.listar);
router.get('/:id', permitir('admin'), responsavelController.buscarPorId);
router.get('/:id/alunos', permitir('admin'), responsavelController.alunosVinculados);
router.post('/', permitir('admin'), responsavelController.criar);
router.put('/:id', permitir('admin'), responsavelController.atualizar);
router.delete('/:id', permitir('admin'), responsavelController.excluir);

module.exports = router;
