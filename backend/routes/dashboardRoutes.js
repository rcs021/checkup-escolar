const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verificarToken, permitir } = require('../middleware/auth');

router.use(verificarToken);

router.get('/admin', permitir('admin'), dashboardController.dashboardAdmin);
router.get('/profissional', permitir('professor', 'reforco', 'banho', 'almoco'), dashboardController.dashboardProfissional);

module.exports = router;
