-- ==========================================================
-- CheckUp Escolar - Script de criação do banco de dados
-- Banco: PostgreSQL
-- Disciplina: MATC82 - Sistemas Web (UFBA)
-- ==========================================================

-- Apaga as tabelas caso já existam (facilita recriar o banco em ambiente de estudo)
DROP TABLE IF EXISTS avaliacao_fotos CASCADE;
DROP TABLE IF EXISTS avaliacao_almoco CASCADE;
DROP TABLE IF EXISTS avaliacao_banho CASCADE;
DROP TABLE IF EXISTS avaliacao_reforco CASCADE;
DROP TABLE IF EXISTS avaliacao_professor CASCADE;
DROP TABLE IF EXISTS avaliacoes CASCADE;
DROP TABLE IF EXISTS aluno_responsavel CASCADE;
DROP TABLE IF EXISTS alunos CASCADE;
DROP TABLE IF EXISTS responsaveis CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS turmas CASCADE;

-- ==========================================================
-- TURMAS
-- ==========================================================
CREATE TABLE turmas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    turno VARCHAR(50),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ==========================================================
-- USUARIOS (Administrador e Profissionais que acessam o sistema)
-- tipo: 'admin', 'professor', 'reforco', 'banho', 'almoco'
-- ==========================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150),
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin','professor','reforco','banho','almoco')),
    turma_id INTEGER REFERENCES turmas(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ==========================================================
-- RESPONSAVEIS (Pais/Responsáveis pelos alunos)
-- preferencia_envio: 'etapa' (a cada formulário) ou 'final' (resumo do dia)
-- ==========================================================
CREATE TABLE responsaveis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(30),
    whatsapp VARCHAR(30),
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255),
    parentesco VARCHAR(50),
    preferencia_envio VARCHAR(10) NOT NULL DEFAULT 'final' CHECK (preferencia_envio IN ('etapa','final')),
    forma_envio VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (forma_envio IN ('email','whatsapp')),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ==========================================================
-- ALUNOS
-- ==========================================================
CREATE TABLE alunos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    foto VARCHAR(255),
    turma_id INTEGER REFERENCES turmas(id) ON DELETE SET NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ==========================================================
-- RELACIONAMENTO ALUNO <-> RESPONSAVEL (N:N)
-- ==========================================================
CREATE TABLE aluno_responsavel (
    aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    responsavel_id INTEGER NOT NULL REFERENCES responsaveis(id) ON DELETE CASCADE,
    PRIMARY KEY (aluno_id, responsavel_id)
);

-- ==========================================================
-- AVALIACOES (tabela principal - dados comuns a qualquer formulário)
-- tipo: 'professor', 'reforco', 'banho', 'almoco'
-- status: 'pendente', 'concluida'
-- ==========================================================
CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    profissional_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('professor','reforco','banho','almoco')),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(15) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','concluida')),
    observacoes TEXT,
    enviado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT NOW(),
    concluido_em TIMESTAMP
);

-- ==========================================================
-- DETALHES ESPECÍFICOS POR TIPO DE FORMULÁRIO (1:1 com avaliacoes)
-- ==========================================================
CREATE TABLE avaliacao_professor (
    avaliacao_id INTEGER PRIMARY KEY REFERENCES avaliacoes(id) ON DELETE CASCADE,
    participacao VARCHAR(30),
    aprendizado VARCHAR(30),
    comportamento VARCHAR(30)
);

CREATE TABLE avaliacao_reforco (
    avaliacao_id INTEGER PRIMARY KEY REFERENCES avaliacoes(id) ON DELETE CASCADE,
    atividades TEXT,
    dificuldades TEXT,
    evolucao VARCHAR(30)
);

CREATE TABLE avaliacao_banho (
    avaliacao_id INTEGER PRIMARY KEY REFERENCES avaliacoes(id) ON DELETE CASCADE,
    tomou_banho BOOLEAN,
    precisou_ajuda BOOLEAN,
    comportamento VARCHAR(30)
);

CREATE TABLE avaliacao_almoco (
    avaliacao_id INTEGER PRIMARY KEY REFERENCES avaliacoes(id) ON DELETE CASCADE,
    comeu_bem BOOLEAN,
    quantidade VARCHAR(30),
    recusou_alimento VARCHAR(150)
);

-- ==========================================================
-- FOTOS DAS AVALIACOES (1:N)
-- ==========================================================
CREATE TABLE avaliacao_fotos (
    id SERIAL PRIMARY KEY,
    avaliacao_id INTEGER NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    caminho VARCHAR(255) NOT NULL
);

-- ==========================================================
-- ÍNDICES ÚTEIS PARA CONSULTA NO HISTÓRICO
-- ==========================================================
CREATE INDEX idx_avaliacoes_aluno ON avaliacoes(aluno_id);
CREATE INDEX idx_avaliacoes_data ON avaliacoes(data);
CREATE INDEX idx_avaliacoes_profissional ON avaliacoes(profissional_id);
