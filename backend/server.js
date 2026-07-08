const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const responsavelRoutes = require('./routes/responsavelRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Em produção, libera apenas o domínio do frontend definido em FRONTEND_URL.
// Em desenvolvimento local (sem essa variável definida), libera qualquer origem.
const corsOptions = process.env.FRONTEND_URL
    ? { origin: process.env.FRONTEND_URL }
    : {};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pasta de uploads acessível publicamente (para exibir as fotos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/responsaveis', responsavelRoutes);
app.use('/api/profissionais', profissionalRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.json({ mensagem: 'API do CheckUp Escolar está funcionando!' });
});

// Tratamento de erros do Multer (ex: arquivo muito grande, tipo inválido)
app.use((err, req, res, next) => {
    if (err) {
        return res.status(400).json({ erro: err.message });
    }
    next();
});

const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
    console.log(`Servidor CheckUp Escolar rodando na porta ${PORTA}`);
});
