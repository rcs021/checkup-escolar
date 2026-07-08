// Script para popular o banco com dados iniciais de teste
// Executar com: npm run seed
const bcrypt = require('bcrypt');
const pool = require('./db');

async function seed() {
    try {
        console.log('Iniciando seed do banco de dados...');

        const senhaPadrao = await bcrypt.hash('123456', 10);

        // ---------- TURMAS ----------
        const turma1 = await pool.query(
            `INSERT INTO turmas (nome, turno) VALUES ('Integral 1A', 'Integral') RETURNING id`
        );
        const turma2 = await pool.query(
            `INSERT INTO turmas (nome, turno) VALUES ('Integral 2B', 'Integral') RETURNING id`
        );
        const turmaId1 = turma1.rows[0].id;
        const turmaId2 = turma2.rows[0].id;

        // ---------- USUARIOS (Administrador + Profissionais) ----------
        await pool.query(
            `INSERT INTO usuarios (nome, usuario, email, senha_hash, cargo, tipo)
             VALUES ('Administrador do Sistema', 'admin', 'admin@checkup.com', $1, 'Administrador', 'admin')`,
            [senhaPadrao]
        );

        const professor = await pool.query(
            `INSERT INTO usuarios (nome, usuario, email, senha_hash, cargo, tipo, turma_id)
             VALUES ('Ana Silva', 'ana.professora', 'ana@checkup.com', $1, 'Professora', 'professor', $2) RETURNING id`,
            [senhaPadrao, turmaId1]
        );

        const reforco = await pool.query(
            `INSERT INTO usuarios (nome, usuario, email, senha_hash, cargo, tipo, turma_id)
             VALUES ('Carlos Souza', 'carlos.reforco', 'carlos@checkup.com', $1, 'Prof. de Reforço', 'reforco', $2) RETURNING id`,
            [senhaPadrao, turmaId1]
        );

        const banho = await pool.query(
            `INSERT INTO usuarios (nome, usuario, email, senha_hash, cargo, tipo, turma_id)
             VALUES ('Marta Lima', 'marta.banho', 'marta@checkup.com', $1, 'Cuidadora', 'banho', $2) RETURNING id`,
            [senhaPadrao, turmaId1]
        );

        const almoco = await pool.query(
            `INSERT INTO usuarios (nome, usuario, email, senha_hash, cargo, tipo, turma_id)
             VALUES ('Paulo Rocha', 'paulo.almoco', 'paulo@checkup.com', $1, 'Nutricionista', 'almoco', $2) RETURNING id`,
            [senhaPadrao, turmaId1]
        );

        // ---------- RESPONSAVEIS ----------
        const resp1 = await pool.query(
            `INSERT INTO responsaveis (nome, telefone, whatsapp, email, senha_hash, parentesco, preferencia_envio, forma_envio)
             VALUES ('Carla Silva', '71999990000', '71999990000', 'carla@teste.com', $1, 'Mãe', 'final', 'email') RETURNING id`,
            [senhaPadrao]
        );
        const resp2 = await pool.query(
            `INSERT INTO responsaveis (nome, telefone, whatsapp, email, senha_hash, parentesco, preferencia_envio, forma_envio)
             VALUES ('Mariana Santos', '71988880000', '71988880000', 'mariana@teste.com', $1, 'Mãe', 'etapa', 'email') RETURNING id`,
            [senhaPadrao]
        );

        // ---------- ALUNOS ----------
        const aluno1 = await pool.query(
            `INSERT INTO alunos (nome, turma_id, observacoes) VALUES ('Maria Eduarda Silva', $1, 'Nenhuma restrição') RETURNING id`,
            [turmaId1]
        );
        const aluno2 = await pool.query(
            `INSERT INTO alunos (nome, turma_id, observacoes) VALUES ('João Pedro Santos', $1, 'Alergia a amendoim') RETURNING id`,
            [turmaId1]
        );

        await pool.query(
            `INSERT INTO aluno_responsavel (aluno_id, responsavel_id) VALUES ($1, $2)`,
            [aluno1.rows[0].id, resp1.rows[0].id]
        );
        await pool.query(
            `INSERT INTO aluno_responsavel (aluno_id, responsavel_id) VALUES ($1, $2)`,
            [aluno2.rows[0].id, resp2.rows[0].id]
        );

        console.log('Seed concluído com sucesso!');
        console.log('Login administrador -> usuario: admin | senha: 123456');
        console.log('Login professor -> usuario: ana.professora | senha: 123456');
        console.log('Login reforço -> usuario: carlos.reforco | senha: 123456');
        console.log('Login banho -> usuario: marta.banho | senha: 123456');
        console.log('Login almoço -> usuario: paulo.almoco | senha: 123456');
        console.log('Login responsável -> usuario (e-mail): carla@teste.com | senha: 123456');
        process.exit(0);
    } catch (err) {
        console.error('Erro ao executar seed:', err);
        process.exit(1);
    }
}

seed();
