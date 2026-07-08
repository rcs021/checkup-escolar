const jwt = require('jsonwebtoken');
require('dotenv').config();

const SEGREDO = process.env.JWT_SECRET || 'checkup_escolar_secret_key';

// Middleware que verifica se o usuário está autenticado
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const partes = authHeader.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({ erro: 'Token mal formatado' });
    }

    const token = partes[1];

    jwt.verify(token, SEGREDO, (err, decoded) => {
        if (err) {
            return res.status(401).json({ erro: 'Token inválido ou expirado' });
        }
        req.usuario = decoded; // { id, nome, tipo, turma_id }
        next();
    });
}

// Middleware que verifica se o usuário possui um dos tipos (perfis) permitidos
function permitir(...tiposPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !tiposPermitidos.includes(req.usuario.tipo)) {
            return res.status(403).json({ erro: 'Acesso negado para este perfil de usuário' });
        }
        next();
    };
}

module.exports = { verificarToken, permitir, SEGREDO };
