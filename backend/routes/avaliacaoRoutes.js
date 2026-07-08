const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const { verificarToken, permitir } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verificarToken);

router.get('/hoje', permitir('professor', 'reforco', 'banho', 'almoco'), avaliacaoController.listarHoje);
router.post('/iniciar', permitir('professor', 'reforco', 'banho', 'almoco'), avaliacaoController.iniciar);
router.get('/historico', avaliacaoController.historico);
router.get('/resumo/:aluno_id', avaliacaoController.resumoDoDia);
router.get('/:id', avaliacaoController.buscarPorId);
router.put('/:id/rascunho', permitir('professor', 'reforco', 'banho', 'almoco'), avaliacaoController.salvarRascunho);
router.post('/:id/finalizar', permitir('professor', 'reforco', 'banho', 'almoco'), upload.array('fotos', 5), avaliacaoController.finalizar);

module.exports = router;
