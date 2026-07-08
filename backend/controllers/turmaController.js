const pool = require('../database/db');

// GET /api/turmas
async function listar(req, res) {
    try {
        const resultado = await pool.query('SELECT * FROM turmas ORDER BY nome');
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao listar turmas' });
    }
}

// GET /api/turmas/:id
async function buscarPorId(req, res) {
    try {
        const resultado = await pool.query('SELECT * FROM turmas WHERE id = $1', [req.params.id]);
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Turma não encontrada' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar turma' });
    }
}

// POST /api/turmas
async function criar(req, res) {
    const { nome, turno } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome da turma é obrigatório' });
    try {
        const resultado = await pool.query(
            'INSERT INTO turmas (nome, turno) VALUES ($1, $2) RETURNING *',
            [nome, turno]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao criar turma' });
    }
}

// PUT /api/turmas/:id
async function atualizar(req, res) {
    const { nome, turno } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE turmas SET nome = $1, turno = $2 WHERE id = $3 RETURNING *',
            [nome, turno, req.params.id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Turma não encontrada' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao atualizar turma' });
    }
}

// DELETE /api/turmas/:id
async function excluir(req, res) {
    try {
        await pool.query('DELETE FROM turmas WHERE id = $1', [req.params.id]);
        res.json({ mensagem: 'Turma excluída com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao excluir turma. Verifique se não há alunos ou profissionais vinculados.' });
    }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
