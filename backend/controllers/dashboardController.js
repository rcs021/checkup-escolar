const pool = require('../database/db');

// GET /api/dashboard/admin
async function dashboardAdmin(req, res) {
    try {
        const alunos = await pool.query('SELECT COUNT(*) FROM alunos');
        const profissionais = await pool.query("SELECT COUNT(*) FROM usuarios WHERE tipo != 'admin'");
        const hoje = new Date().toISOString().slice(0, 10);
        const avaliacoesHoje = await pool.query('SELECT COUNT(*) FROM avaliacoes WHERE data = $1', [hoje]);
        const concluidasHoje = await pool.query(
            "SELECT COUNT(*) FROM avaliacoes WHERE data = $1 AND status = 'concluida'",
            [hoje]
        );

        res.json({
            total_alunos: parseInt(alunos.rows[0].count),
            total_profissionais: parseInt(profissionais.rows[0].count),
            avaliacoes_hoje: parseInt(avaliacoesHoje.rows[0].count),
            avaliacoes_concluidas_hoje: parseInt(concluidasHoje.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao carregar dashboard do administrador' });
    }
}

// GET /api/dashboard/profissional -> pendentes/concluídas do profissional logado
async function dashboardProfissional(req, res) {
    const usuario = req.usuario;
    const hoje = new Date().toISOString().slice(0, 10);

    try {
        const totalAlunosTurma = await pool.query('SELECT COUNT(*) FROM alunos WHERE turma_id = $1', [usuario.turma_id]);

        const pendentes = await pool.query(
            `SELECT COUNT(*) FROM avaliacoes
             WHERE profissional_id = $1 AND data = $2 AND status = 'pendente'`,
            [usuario.id, hoje]
        );
        const concluidas = await pool.query(
            `SELECT COUNT(*) FROM avaliacoes
             WHERE profissional_id = $1 AND data = $2 AND status = 'concluida'`,
            [usuario.id, hoje]
        );

        res.json({
            total_alunos_turma: parseInt(totalAlunosTurma.rows[0].count),
            avaliacoes_pendentes: parseInt(pendentes.rows[0].count),
            avaliacoes_concluidas: parseInt(concluidas.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao carregar dashboard do profissional' });
    }
}

module.exports = { dashboardAdmin, dashboardProfissional };
