const bcrypt = require('bcrypt');
const pool = require('../database/db');

// GET /api/profissionais?busca=
async function listar(req, res) {
    const { busca } = req.query;
    try {
        let sql = `
            SELECT u.id, u.nome, u.usuario, u.email, u.cargo, u.tipo, u.turma_id, u.ativo, t.nome AS turma_nome
            FROM usuarios u
            LEFT JOIN turmas t ON t.id = u.turma_id
            WHERE 1=1`;
        const params = [];
        if (busca) {
            params.push(`%${busca}%`);
            sql += ` AND u.nome ILIKE $${params.length}`;
        }
        sql += ' ORDER BY u.nome';
        const resultado = await pool.query(sql, params);
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao listar profissionais' });
    }
}

// GET /api/profissionais/:id
async function buscarPorId(req, res) {
    try {
        const resultado = await pool.query(
            'SELECT id, nome, usuario, email, cargo, tipo, turma_id, ativo FROM usuarios WHERE id = $1',
            [req.params.id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Profissional não encontrado' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar profissional' });
    }
}

// POST /api/profissionais
async function criar(req, res) {
    const { nome, usuario, email, senha, cargo, tipo, turma_id } = req.body;

    if (!nome || !usuario || !senha || !tipo) {
        return res.status(400).json({ erro: 'Nome, usuário, senha e tipo são obrigatórios' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const resultado = await pool.query(
            `INSERT INTO usuarios (nome, usuario, email, senha_hash, cargo, tipo, turma_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7)
             RETURNING id, nome, usuario, email, cargo, tipo, turma_id, ativo`,
            [nome, usuario, email, senhaHash, cargo, tipo, turma_id || null]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ erro: 'Nome de usuário já está em uso' });
        }
        res.status(500).json({ erro: 'Erro ao cadastrar profissional' });
    }
}

// PUT /api/profissionais/:id
async function atualizar(req, res) {
    const { nome, usuario, email, senha, cargo, tipo, turma_id, ativo } = req.body;
    const id = req.params.id;

    try {
        if (senha) {
            const senhaHash = await bcrypt.hash(senha, 10);
            const resultado = await pool.query(
                `UPDATE usuarios SET nome=$1, usuario=$2, email=$3, senha_hash=$4, cargo=$5, tipo=$6, turma_id=$7, ativo=$8
                 WHERE id=$9 RETURNING id, nome, usuario, email, cargo, tipo, turma_id, ativo`,
                [nome, usuario, email, senhaHash, cargo, tipo, turma_id || null, ativo !== undefined ? ativo : true, id]
            );
            if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Profissional não encontrado' });
            return res.json(resultado.rows[0]);
        } else {
            const resultado = await pool.query(
                `UPDATE usuarios SET nome=$1, usuario=$2, email=$3, cargo=$4, tipo=$5, turma_id=$6, ativo=$7
                 WHERE id=$8 RETURNING id, nome, usuario, email, cargo, tipo, turma_id, ativo`,
                [nome, usuario, email, cargo, tipo, turma_id || null, ativo !== undefined ? ativo : true, id]
            );
            if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Profissional não encontrado' });
            return res.json(resultado.rows[0]);
        }
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ erro: 'Nome de usuário já está em uso' });
        }
        res.status(500).json({ erro: 'Erro ao atualizar profissional' });
    }
}

// DELETE /api/profissionais/:id
async function excluir(req, res) {
    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
        res.json({ mensagem: 'Profissional excluído com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao excluir profissional' });
    }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
