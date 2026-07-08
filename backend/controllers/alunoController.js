const pool = require('../database/db');

// GET /api/alunos?turma_id=&busca=
async function listar(req, res) {
    const { turma_id, busca } = req.query;
    try {
        let sql = `
            SELECT a.*, t.nome AS turma_nome
            FROM alunos a
            LEFT JOIN turmas t ON t.id = a.turma_id
            WHERE 1=1`;
        const params = [];

        if (turma_id) {
            params.push(turma_id);
            sql += ` AND a.turma_id = $${params.length}`;
        }
        if (busca) {
            params.push(`%${busca}%`);
            sql += ` AND a.nome ILIKE $${params.length}`;
        }

        // Se o usuário logado for profissional (não admin), filtra apenas alunos da turma dele
        if (req.usuario && req.usuario.tipo !== 'admin' && req.usuario.tipo !== 'responsavel' && req.usuario.turma_id) {
            params.push(req.usuario.turma_id);
            sql += ` AND a.turma_id = $${params.length}`;
        }

        // Um responsável só pode ver os alunos vinculados a ele
        if (req.usuario && req.usuario.tipo === 'responsavel') {
            sql += ` AND a.id IN (SELECT aluno_id FROM aluno_responsavel WHERE responsavel_id = $${params.length + 1})`;
            params.push(req.usuario.id);
        }

        sql += ' ORDER BY a.nome';

        const resultado = await pool.query(sql, params);

        // Busca responsáveis de cada aluno
        const alunos = resultado.rows;
        for (const aluno of alunos) {
            const resp = await pool.query(
                `SELECT r.id, r.nome, r.email, r.telefone
                 FROM responsaveis r
                 JOIN aluno_responsavel ar ON ar.responsavel_id = r.id
                 WHERE ar.aluno_id = $1`,
                [aluno.id]
            );
            aluno.responsaveis = resp.rows;
        }

        res.json(alunos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao listar alunos' });
    }
}

// GET /api/alunos/:id
async function buscarPorId(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT a.*, t.nome AS turma_nome FROM alunos a
             LEFT JOIN turmas t ON t.id = a.turma_id WHERE a.id = $1`,
            [req.params.id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Aluno não encontrado' });

        const aluno = resultado.rows[0];
        const resp = await pool.query(
            `SELECT r.* FROM responsaveis r
             JOIN aluno_responsavel ar ON ar.responsavel_id = r.id
             WHERE ar.aluno_id = $1`,
            [aluno.id]
        );
        aluno.responsaveis = resp.rows;

        res.json(aluno);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar aluno' });
    }
}

// POST /api/alunos
async function criar(req, res) {
    const { nome, turma_id, observacoes, responsaveis } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome do aluno é obrigatório' });

    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const resultado = await pool.query(
            `INSERT INTO alunos (nome, foto, turma_id, observacoes) VALUES ($1, $2, $3, $4) RETURNING *`,
            [nome, foto, turma_id || null, observacoes]
        );
        const aluno = resultado.rows[0];

        // Vincula responsáveis (recebido como string JSON de ids, ex: "[1,2]")
        const listaResponsaveis = responsaveis ? JSON.parse(responsaveis) : [];
        for (const respId of listaResponsaveis) {
            await pool.query(
                'INSERT INTO aluno_responsavel (aluno_id, responsavel_id) VALUES ($1, $2)',
                [aluno.id, respId]
            );
        }

        res.status(201).json(aluno);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao cadastrar aluno' });
    }
}

// PUT /api/alunos/:id
async function atualizar(req, res) {
    const { nome, turma_id, observacoes, responsaveis } = req.body;
    const id = req.params.id;

    try {
        let sql = 'UPDATE alunos SET nome = $1, turma_id = $2, observacoes = $3';
        const params = [nome, turma_id || null, observacoes];

        if (req.file) {
            sql += ', foto = $4 WHERE id = $5 RETURNING *';
            params.push(`/uploads/${req.file.filename}`, id);
        } else {
            sql += ' WHERE id = $4 RETURNING *';
            params.push(id);
        }

        const resultado = await pool.query(sql, params);
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Aluno não encontrado' });

        if (responsaveis !== undefined) {
            await pool.query('DELETE FROM aluno_responsavel WHERE aluno_id = $1', [id]);
            const listaResponsaveis = JSON.parse(responsaveis);
            for (const respId of listaResponsaveis) {
                await pool.query(
                    'INSERT INTO aluno_responsavel (aluno_id, responsavel_id) VALUES ($1, $2)',
                    [id, respId]
                );
            }
        }

        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao atualizar aluno' });
    }
}

// DELETE /api/alunos/:id
async function excluir(req, res) {
    try {
        await pool.query('DELETE FROM alunos WHERE id = $1', [req.params.id]);
        res.json({ mensagem: 'Aluno excluído com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao excluir aluno' });
    }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
