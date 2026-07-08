# DER - Diagrama Entidade-Relacionamento
## CheckUp Escolar

O diagrama abaixo está no formato Mermaid (renderiza automaticamente no GitHub e em diversos editores, como o VS Code com a extensão "Markdown Preview Mermaid Support").

```mermaid
erDiagram
    TURMAS ||--o{ ALUNOS : possui
    TURMAS ||--o{ USUARIOS : "atua em"
    USUARIOS ||--o{ AVALIACOES : realiza
    ALUNOS ||--o{ AVALIACOES : recebe
    ALUNOS ||--o{ ALUNO_RESPONSAVEL : vinculado
    RESPONSAVEIS ||--o{ ALUNO_RESPONSAVEL : vinculado
    AVALIACOES ||--o| AVALIACAO_PROFESSOR : detalha
    AVALIACOES ||--o| AVALIACAO_REFORCO : detalha
    AVALIACOES ||--o| AVALIACAO_BANHO : detalha
    AVALIACOES ||--o| AVALIACAO_ALMOCO : detalha
    AVALIACOES ||--o{ AVALIACAO_FOTOS : possui

    TURMAS {
        int id PK
        string nome
        string turno
    }

    USUARIOS {
        int id PK
        string nome
        string usuario
        string email
        string senha_hash
        string cargo
        string tipo
        int turma_id FK
        boolean ativo
    }

    RESPONSAVEIS {
        int id PK
        string nome
        string telefone
        string whatsapp
        string email
        string senha_hash
        string parentesco
        string preferencia_envio
        string forma_envio
    }

    ALUNOS {
        int id PK
        string nome
        string foto
        int turma_id FK
        string observacoes
    }

    ALUNO_RESPONSAVEL {
        int aluno_id FK
        int responsavel_id FK
    }

    AVALIACOES {
        int id PK
        int aluno_id FK
        int profissional_id FK
        string tipo
        date data
        string status
        string observacoes
        boolean enviado
    }

    AVALIACAO_PROFESSOR {
        int avaliacao_id FK
        string participacao
        string aprendizado
        string comportamento
    }

    AVALIACAO_REFORCO {
        int avaliacao_id FK
        string atividades
        string dificuldades
        string evolucao
    }

    AVALIACAO_BANHO {
        int avaliacao_id FK
        boolean tomou_banho
        boolean precisou_ajuda
        string comportamento
    }

    AVALIACAO_ALMOCO {
        int avaliacao_id FK
        boolean comeu_bem
        string quantidade
        string recusou_alimento
    }

    AVALIACAO_FOTOS {
        int id PK
        int avaliacao_id FK
        string caminho
    }
```

## Descrição das entidades

- **turmas**: representa cada turma da escola de tempo integral.
- **usuarios**: administrador e profissionais (professor, reforço, banho, almoço) que acessam o sistema.
- **responsaveis**: pais/responsáveis, que também podem acessar o sistema para consultar o resumo do dia e configurar preferências de envio.
- **alunos**: os estudantes acompanhados no sistema.
- **aluno_responsavel**: tabela associativa (N:N) entre alunos e responsáveis, pois um aluno pode ter mais de um responsável e um responsável pode ter mais de um filho matriculado.
- **avaliacoes**: tabela central que guarda os dados comuns de qualquer avaliação diária (aluno, profissional, tipo, data, status).
- **avaliacao_professor / avaliacao_reforco / avaliacao_banho / avaliacao_almoco**: tabelas de detalhe (1:1 com avaliacoes), cada uma armazenando os campos específicos do formulário daquele profissional.
- **avaliacao_fotos**: fotos anexadas em cada avaliação (1:N), pois cada avaliação pode ter mais de uma foto.

O script completo de criação das tabelas está em `backend/database/schema.sql`.
