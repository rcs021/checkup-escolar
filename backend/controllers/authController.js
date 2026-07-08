const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');
const { SEGREDO } = require('../middleware/auth');

// POST /api/auth/login
// O campo "usuario" aceita tanto o nome de usuário de profissionais/admin
// quanto o e-mail cadastrado de um responsável.
async function login(req, res) {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ erro: 'Informe usuário e senha' });
    }

    try {
        // 1) Tenta encontrar em usuarios (admin/professor/reforco/banho/almoco)
        const resultadoUsuarios = await pool.query(
            'SELECT * FROM usuarios WHERE usuario = $1 AND ativo = TRUE',
            [usuario]
        );

        if (resultadoUsuarios.rows.length > 0) {
            const usuarioEncontrado = resultadoUsuarios.rows[0];
            const senhaValida = await bcrypt.compare(senha, usuarioEncontrado.senha_hash);

            if (!senhaValida) {
                return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
            }

            const payload = {
                id: usuarioEncontrado.id,
                nome: usuarioEncontrado.nome,
                tipo: usuarioEncontrado.tipo,
                turma_id: usuarioEncontrado.turma_id
            };
            const token = jwt.sign(payload, SEGREDO, { expiresIn: '8h' });
            return res.json({ token, usuario: payload });
        }

        // 2) Tenta encontrar em responsaveis (login pelo e-mail cadastrado)
        const resultadoResponsaveis = await pool.query(
            'SELECT * FROM responsaveis WHERE email = $1',
            [usuario]
        );

        if (resultadoResponsaveis.rows.length > 0) {
            const responsavel = resultadoResponsaveis.rows[0];

            if (!responsavel.senha_hash) {
                return res.status(401).json({ erro: 'Este responsável ainda não possui senha cadastrada' });
            }

            const senhaValida = await bcrypt.compare(senha, responsavel.senha_hash);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
            }

            const payload = {
                id: responsavel.id,
                nome: responsavel.nome,
                tipo: 'responsavel',
                turma_id: null
            };
            const token = jwt.sign(payload, SEGREDO, { expiresIn: '8h' });
            return res.json({ token, usuario: payload });
        }

        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro ao efetuar login' });
    }
}

// GET /api/auth/me - retorna os dados do usuário logado
async function me(req, res) {
    try {
        if (req.usuario.tipo === 'responsavel') {
            const resultado = await pool.query(
                'SELECT id, nome, email, telefone, whatsapp, parentesco, preferencia_envio, forma_envio FROM responsaveis WHERE id = $1',
                [req.usuario.id]
            );
            if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Responsável não encontrado' });
            return res.json({ ...resultado.rows[0], tipo: 'responsavel' });
        }

        const resultado = await pool.query(
            'SELECT id, nome, usuario, email, cargo, tipo, turma_id FROM usuarios WHERE id = $1',
            [req.usuario.id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        return res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }
}

module.exports = { login, me };
