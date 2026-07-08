const bcrypt = require('bcrypt');
const pool = require('../database/db');

// GET /api/responsaveis?busca=
async function listar(req, res) {
    const { busca } = req.query;
    try {
        let sql = 'SELECT * FROM responsaveis WHERE 1=1';
        const params = [];
        if (busca) {
            params.push(`%${busca}%`);
            sql += ` AND nome ILIKE $${params.length}`;
        }
        sql += ' ORDER BY nome';
        const resultado = await pool.query(sql, params);
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao listar responsáveis' });
    }
}

// GET /api/responsaveis/:id
async function buscarPorId(req, res) {
    try {
        const resultado = await pool.query('SELECT * FROM responsaveis WHERE id = $1', [req.params.id]);
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Responsável não encontrado' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar responsável' });
    }
}

// GET /api/responsaveis/:id/alunos - alunos vinculados a este responsável (usado na área do responsável)
async function alunosVinculados(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT a.*, t.nome AS turma_nome FROM alunos a
             JOIN aluno_responsavel ar ON ar.aluno_id = a.id
             LEFT JOIN turmas t ON t.id = a.turma_id
             WHERE ar.responsavel_id = $1`,
            [req.params.id]
        );
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar alunos do responsável' });
    }
}

// POST /api/responsaveis
async function criar(req, res) {
    const { nome, telefone, whatsapp, email, parentesco, preferencia_envio, forma_envio, senha } = req.body;
    if (!nome || !email) return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios' });

    try {
        // Se nenhuma senha for informada, usa "123456" como senha padrão inicial
        const senhaHash = await bcrypt.hash(senha || '123456', 10);

        const resultado = await pool.query(
            `INSERT INTO responsaveis (nome, telefone, whatsapp, email, senha_hash, parentesco, preferencia_envio, forma_envio)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, nome, telefone, whatsapp, email, parentesco, preferencia_envio, forma_envio`,
            [nome, telefone, whatsapp, email, senhaHash, parentesco, preferencia_envio || 'final', forma_envio || 'email']
        );
        res.status(201).json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ erro: 'Já existe um responsável cadastrado com este e-mail' });
        }
        res.status(500).json({ erro: 'Erro ao cadastrar responsável' });
    }
}

// PUT /api/responsaveis/:id
async function atualizar(req, res) {
    const { nome, telefone, whatsapp, email, parentesco, preferencia_envio, forma_envio } = req.body;
    try {
        const resultado = await pool.query(
            `UPDATE responsaveis SET nome=$1, telefone=$2, whatsapp=$3, email=$4, parentesco=$5,
             preferencia_envio=$6, forma_envio=$7 WHERE id=$8 RETURNING *`,
            [nome, telefone, whatsapp, email, parentesco, preferencia_envio, forma_envio, req.params.id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Responsável não encontrado' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao atualizar responsável' });
    }
}

// DELETE /api/responsaveis/:id
async function excluir(req, res) {
    try {
        await pool.query('DELETE FROM responsaveis WHERE id = $1', [req.params.id]);
        res.json({ mensagem: 'Responsável excluído com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao excluir responsável' });
    }
}

// GET /api/responsaveis/meus-alunos -> usado quando o próprio responsável está logado
async function meusAlunos(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT a.*, t.nome AS turma_nome FROM alunos a
             JOIN aluno_responsavel ar ON ar.aluno_id = a.id
             LEFT JOIN turmas t ON t.id = a.turma_id
             WHERE ar.responsavel_id = $1`,
            [req.usuario.id]
        );
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar alunos vinculados' });
    }
}

// GET /api/responsaveis/meu-perfil
async function meuPerfil(req, res) {
    try {
        const resultado = await pool.query(
            'SELECT id, nome, telefone, whatsapp, email, parentesco, preferencia_envio, forma_envio FROM responsaveis WHERE id = $1',
            [req.usuario.id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Responsável não encontrado' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar perfil' });
    }
}

// PUT /api/responsaveis/meu-perfil -> responsável atualiza suas preferências de envio e contatos
async function atualizarMeuPerfil(req, res) {
    const { telefone, whatsapp, preferencia_envio, forma_envio } = req.body;
    try {
        const resultado = await pool.query(
            `UPDATE responsaveis SET telefone=$1, whatsapp=$2, preferencia_envio=$3, forma_envio=$4
             WHERE id=$5 RETURNING id, nome, telefone, whatsapp, email, parentesco, preferencia_envio, forma_envio`,
            [telefone, whatsapp, preferencia_envio, forma_envio, req.usuario.id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Responsável não encontrado' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao atualizar perfil' });
    }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, alunosVinculados, meusAlunos, meuPerfil, atualizarMeuPerfil };
