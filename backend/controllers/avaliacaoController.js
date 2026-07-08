const pool = require('../database/db');
const { enviarEmailEtapa, enviarEmailResumoDia } = require('../utils/mailer');

// Tabelas de detalhes por tipo de formulário
const TABELA_DETALHE = {
    professor: 'avaliacao_professor',
    reforco: 'avaliacao_reforco',
    banho: 'avaliacao_banho',
    almoco: 'avaliacao_almoco'
};

// Campos aceitos em cada tipo de formulário
const CAMPOS_DETALHE = {
    professor: ['participacao', 'aprendizado', 'comportamento'],
    reforco: ['atividades', 'dificuldades', 'evolucao'],
    banho: ['tomou_banho', 'precisou_ajuda', 'comportamento'],
    almoco: ['comeu_bem', 'quantidade', 'recusou_alimento']
};

// Busca o detalhe (tabela específica) de uma avaliação
async function buscarDetalhe(tipo, avaliacaoId) {
    const tabela = TABELA_DETALHE[tipo];
    const resultado = await pool.query(`SELECT * FROM ${tabela} WHERE avaliacao_id = $1`, [avaliacaoId]);
    return resultado.rows[0] || null;
}

// Cria ou atualiza (upsert) o detalhe de uma avaliação
async function salvarDetalhe(tipo, avaliacaoId, dados) {
    const tabela = TABELA_DETALHE[tipo];
    const campos = CAMPOS_DETALHE[tipo];

    const existente = await pool.query(`SELECT 1 FROM ${tabela} WHERE avaliacao_id = $1`, [avaliacaoId]);

    const valores = campos.map((campo) => {
        let valor = dados[campo];
        if (valor === undefined) valor = null;
        // Converte strings 'true'/'false' vindas do formulário multipart em boolean
        if (valor === 'true') valor = true;
        if (valor === 'false') valor = false;
        return valor;
    });

    if (existente.rows.length > 0) {
        const sets = campos.map((c, i) => `${c} = $${i + 2}`).join(', ');
        await pool.query(`UPDATE ${tabela} SET ${sets} WHERE avaliacao_id = $1`, [avaliacaoId, ...valores]);
    } else {
        const colunas = ['avaliacao_id', ...campos].join(', ');
        const placeholders = campos.map((_, i) => `$${i + 2}`).join(', ');
        await pool.query(
            `INSERT INTO ${tabela} (${colunas}) VALUES ($1, ${placeholders})`,
            [avaliacaoId, ...valores]
        );
    }
}

// Monta o objeto completo de avaliação (dados + detalhe + fotos)
async function montarAvaliacaoCompleta(avaliacaoRow) {
    const detalhe = await buscarDetalhe(avaliacaoRow.tipo, avaliacaoRow.id);
    const fotos = await pool.query('SELECT id, caminho FROM avaliacao_fotos WHERE avaliacao_id = $1', [avaliacaoRow.id]);
    return { ...avaliacaoRow, detalhes: detalhe, fotos: fotos.rows };
}

// GET /api/avaliacoes/hoje -> lista de alunos da turma do profissional logado com status da avaliação de hoje
async function listarHoje(req, res) {
    const usuario = req.usuario;
    const dataConsulta = req.query.data || new Date().toISOString().slice(0, 10);

    try {
        const resultado = await pool.query(
            `SELECT a.id AS aluno_id, a.nome AS aluno_nome, a.foto, t.nome AS turma_nome,
                    av.id AS avaliacao_id, av.status
             FROM alunos a
             LEFT JOIN turmas t ON t.id = a.turma_id
             LEFT JOIN avaliacoes av ON av.aluno_id = a.id AND av.tipo = $1
                    AND av.profissional_id = $2 AND av.data = $3
             WHERE a.turma_id = $4
             ORDER BY a.nome`,
            [usuario.tipo, usuario.id, dataConsulta, usuario.turma_id]
        );
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao listar avaliações do dia' });
    }
}

// POST /api/avaliacoes/iniciar { aluno_id } -> cria (ou retorna existente) avaliação pendente de hoje
async function iniciar(req, res) {
    const usuario = req.usuario;
    const { aluno_id } = req.body;
    const hoje = new Date().toISOString().slice(0, 10);

    try {
        let resultado = await pool.query(
            `SELECT * FROM avaliacoes WHERE aluno_id = $1 AND tipo = $2 AND profissional_id = $3 AND data = $4`,
            [aluno_id, usuario.tipo, usuario.id, hoje]
        );

        let avaliacao;
        if (resultado.rows.length > 0) {
            avaliacao = resultado.rows[0];
        } else {
            const insercao = await pool.query(
                `INSERT INTO avaliacoes (aluno_id, profissional_id, tipo, data, status)
                 VALUES ($1, $2, $3, $4, 'pendente') RETURNING *`,
                [aluno_id, usuario.id, usuario.tipo, hoje]
            );
            avaliacao = insercao.rows[0];
        }

        const completa = await montarAvaliacaoCompleta(avaliacao);
        res.json(completa);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao iniciar avaliação' });
    }
}

// GET /api/avaliacoes/:id
async function buscarPorId(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT av.*, a.nome AS aluno_nome, a.foto AS aluno_foto, t.nome AS turma_nome
             FROM avaliacoes av
             JOIN alunos a ON a.id = av.aluno_id
             LEFT JOIN turmas t ON t.id = a.turma_id
             WHERE av.id = $1`,
            [req.params.id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Avaliação não encontrada' });
        const completa = await montarAvaliacaoCompleta(resultado.rows[0]);
        res.json(completa);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar avaliação' });
    }
}

// PUT /api/avaliacoes/:id/rascunho -> salva rascunho sem finalizar
async function salvarRascunho(req, res) {
    const id = req.params.id;
    try {
        const resultado = await pool.query('SELECT * FROM avaliacoes WHERE id = $1', [id]);
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Avaliação não encontrada' });
        const avaliacao = resultado.rows[0];

        await salvarDetalhe(avaliacao.tipo, id, req.body);
        await pool.query('UPDATE avaliacoes SET observacoes = $1 WHERE id = $2', [req.body.observacoes || null, id]);

        res.json({ mensagem: 'Rascunho salvo com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao salvar rascunho' });
    }
}

// POST /api/avaliacoes/:id/finalizar -> conclui a avaliação, salva fotos e dispara e-mail
async function finalizar(req, res) {
    const id = req.params.id;
    try {
        const resultado = await pool.query(
            `SELECT av.*, a.nome AS aluno_nome FROM avaliacoes av
             JOIN alunos a ON a.id = av.aluno_id WHERE av.id = $1`,
            [id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Avaliação não encontrada' });
        const avaliacao = resultado.rows[0];

        // Salva os campos do formulário específico
        await salvarDetalhe(avaliacao.tipo, id, req.body);
        await pool.query(
            `UPDATE avaliacoes SET observacoes = $1, status = 'concluida', concluido_em = NOW() WHERE id = $2`,
            [req.body.observacoes || null, id]
        );

        // Salva as fotos enviadas (multer preenche req.files)
        if (req.files && req.files.length > 0) {
            for (const arquivo of req.files) {
                await pool.query(
                    'INSERT INTO avaliacao_fotos (avaliacao_id, caminho) VALUES ($1, $2)',
                    [id, `/uploads/${arquivo.filename}`]
                );
            }
        }

        // Recarrega a avaliação completa para envio de e-mail
        const avaliacaoAtualizada = await pool.query('SELECT * FROM avaliacoes WHERE id = $1', [id]);
        const completa = await montarAvaliacaoCompleta(avaliacaoAtualizada.rows[0]);
        completa.aluno_nome = avaliacao.aluno_nome;

        await processarEnvioEmail(avaliacao.aluno_id, completa);

        res.json({ mensagem: 'Avaliação finalizada com sucesso', avaliacao: completa });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao finalizar avaliação' });
    }
}

// Verifica preferências dos responsáveis do aluno e envia e-mail (por etapa ou aguarda o final do dia)
async function processarEnvioEmail(alunoId, avaliacaoConcluida) {
    try {
        const alunoResultado = await pool.query('SELECT * FROM alunos WHERE id = $1', [alunoId]);
        const aluno = alunoResultado.rows[0];

        const responsaveisResultado = await pool.query(
            `SELECT r.* FROM responsaveis r
             JOIN aluno_responsavel ar ON ar.responsavel_id = r.id
             WHERE ar.aluno_id = $1`,
            [alunoId]
        );

        for (const responsavel of responsaveisResultado.rows) {
            if (responsavel.preferencia_envio === 'etapa') {
                // Envia imediatamente o e-mail referente a esta etapa
                try {
                    await enviarEmailEtapa(responsavel, aluno, avaliacaoConcluida);
                    await pool.query('UPDATE avaliacoes SET enviado = TRUE WHERE id = $1', [avaliacaoConcluida.id]);
                } catch (erroEmail) {
                    console.error('Erro ao enviar e-mail de etapa:', erroEmail.message);
                }
            } else {
                // Verifica se todos os formulários do dia (professor, reforco, banho, almoco) já foram concluídos
                const hoje = new Date().toISOString().slice(0, 10);
                const todasHoje = await pool.query(
                    `SELECT * FROM avaliacoes WHERE aluno_id = $1 AND data = $2`,
                    [alunoId, hoje]
                );

                const tipos = ['professor', 'reforco', 'banho', 'almoco'];
                const concluidas = todasHoje.rows.filter((a) => a.status === 'concluida');
                const todosOsTiposConcluidos = tipos.every((tipo) =>
                    concluidas.some((a) => a.tipo === tipo)
                );

                if (todosOsTiposConcluidos) {
                    const avaliacoesCompletas = [];
                    for (const avaliacaoRow of concluidas) {
                        avaliacoesCompletas.push(await montarAvaliacaoCompleta(avaliacaoRow));
                    }
                    try {
                        await enviarEmailResumoDia(responsavel, aluno, avaliacoesCompletas);
                        await pool.query(
                            `UPDATE avaliacoes SET enviado = TRUE WHERE aluno_id = $1 AND data = $2`,
                            [alunoId, hoje]
                        );
                    } catch (erroEmail) {
                        console.error('Erro ao enviar e-mail de resumo do dia:', erroEmail.message);
                    }
                }
            }
        }
    } catch (err) {
        console.error('Erro ao processar envio de e-mail:', err);
    }
}

// GET /api/avaliacoes/historico -> pesquisa por aluno, turma, profissional e período
async function historico(req, res) {
    const { aluno_id, turma_id, profissional_id, tipo, data_inicio, data_fim } = req.query;
    const usuario = req.usuario;

    try {
        // Um responsável só pode consultar o histórico dos alunos vinculados a ele
        if (usuario.tipo === 'responsavel') {
            const vinculo = await pool.query(
                'SELECT aluno_id FROM aluno_responsavel WHERE responsavel_id = $1',
                [usuario.id]
            );
            const idsPermitidos = vinculo.rows.map((r) => r.aluno_id);
            if (idsPermitidos.length === 0) return res.json([]);
            if (aluno_id && !idsPermitidos.includes(parseInt(aluno_id))) {
                return res.status(403).json({ erro: 'Acesso negado a este aluno' });
            }
        }

        let sql = `
            SELECT av.*, a.nome AS aluno_nome, u.nome AS profissional_nome, t.nome AS turma_nome
            FROM avaliacoes av
            JOIN alunos a ON a.id = av.aluno_id
            JOIN usuarios u ON u.id = av.profissional_id
            LEFT JOIN turmas t ON t.id = a.turma_id
            WHERE 1=1`;
        const params = [];

        if (aluno_id) { params.push(aluno_id); sql += ` AND av.aluno_id = $${params.length}`; }
        if (turma_id) { params.push(turma_id); sql += ` AND a.turma_id = $${params.length}`; }
        if (profissional_id) { params.push(profissional_id); sql += ` AND av.profissional_id = $${params.length}`; }
        if (tipo) { params.push(tipo); sql += ` AND av.tipo = $${params.length}`; }
        if (data_inicio) { params.push(data_inicio); sql += ` AND av.data >= $${params.length}`; }
        if (data_fim) { params.push(data_fim); sql += ` AND av.data <= $${params.length}`; }

        if (usuario.tipo === 'responsavel' && !aluno_id) {
            const vinculo = await pool.query('SELECT aluno_id FROM aluno_responsavel WHERE responsavel_id = $1', [usuario.id]);
            const ids = vinculo.rows.map((r) => r.aluno_id);
            params.push(ids);
            sql += ` AND av.aluno_id = ANY($${params.length}::int[])`;
        }

        sql += ' ORDER BY av.data DESC, a.nome';

        const resultado = await pool.query(sql, params);
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar histórico' });
    }
}

// GET /api/avaliacoes/resumo/:aluno_id?data=YYYY-MM-DD -> resumo do dia (visão do responsável)
async function resumoDoDia(req, res) {
    const alunoId = req.params.aluno_id;
    const data = req.query.data || new Date().toISOString().slice(0, 10);
    const usuario = req.usuario;

    try {
        if (usuario.tipo === 'responsavel') {
            const vinculo = await pool.query(
                'SELECT 1 FROM aluno_responsavel WHERE responsavel_id = $1 AND aluno_id = $2',
                [usuario.id, alunoId]
            );
            if (vinculo.rows.length === 0) return res.status(403).json({ erro: 'Acesso negado a este aluno' });
        }

        const resultado = await pool.query(
            `SELECT av.*, u.nome AS profissional_nome FROM avaliacoes av
             JOIN usuarios u ON u.id = av.profissional_id
             WHERE av.aluno_id = $1 AND av.data = $2`,
            [alunoId, data]
        );

        const avaliacoes = [];
        for (const row of resultado.rows) {
            avaliacoes.push(await montarAvaliacaoCompleta(row));
        }

        res.json(avaliacoes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar resumo do dia' });
    }
}

module.exports = {
    listarHoje,
    iniciar,
    buscarPorId,
    salvarRascunho,
    finalizar,
    historico,
    resumoDoDia,
    salvarDetalhe,
    montarAvaliacaoCompleta,
    TABELA_DETALHE
};
