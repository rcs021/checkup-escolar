# Fluxograma de Funcionamento - CheckUp Escolar

## Fluxo geral (preenchimento e envio de uma avaliação)

```mermaid
flowchart TD
    A[Profissional realiza login] --> B[Acessa Dashboard / Avaliações do dia]
    B --> C[Seleciona o aluno da sua turma]
    C --> D{Avaliação de hoje<br/>já existe?}
    D -- Não --> E[Sistema cria avaliação<br/>com status "pendente"]
    D -- Sim --> F[Sistema carrega avaliação existente]
    E --> G[Profissional preenche o formulário<br/>específico do seu cargo]
    F --> G
    G --> H{Deseja salvar<br/>rascunho ou finalizar?}
    H -- Salvar rascunho --> I[Dados salvos,<br/>status continua "pendente"]
    I --> G
    H -- Finalizar --> J[Sistema marca avaliação<br/>como "concluída"]
    J --> K[Sistema anexa fotos enviadas]
    K --> L{Preferência do<br/>responsável?}
    L -- Por etapa --> M[Envia e-mail imediatamente<br/>com esta avaliação]
    L -- Final do dia --> N{Todos os formulários<br/>do dia foram concluídos?}
    N -- Não --> O[Aguarda demais profissionais<br/>finalizarem suas avaliações]
    N -- Sim --> P[Envia e-mail com o<br/>resumo completo do dia]
    M --> Q[Fim]
    P --> Q
    O --> Q
```

## Fluxo de login e controle de acesso

```mermaid
flowchart TD
    A[Usuário informa usuário/e-mail e senha] --> B[POST /api/auth/login]
    B --> C{Encontrado em<br/>usuarios?}
    C -- Sim --> D[Verifica senha com bcrypt]
    C -- Não --> E{Encontrado em<br/>responsaveis?}
    E -- Sim --> D
    E -- Não --> F[Retorna erro 401]
    D --> G{Senha válida?}
    G -- Não --> F
    G -- Sim --> H[Gera token JWT com<br/>id, nome e tipo do usuário]
    H --> I[Frontend salva token<br/>e redireciona conforme o perfil]
    I --> J[Administrador: gestão completa]
    I --> K[Profissional: avaliações da sua turma]
    I --> L[Responsável: resumo do dia e histórico]
```
