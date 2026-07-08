# CheckUp Escolar - Explicação Geral do Projeto

**Disciplina:** MATC82 - Sistemas Web
**Instituição:** Universidade Federal da Bahia (UFBA)


## 1. Sobre o projeto

O CheckUp Escolar é um sistema web desenvolvido para digitalizar o processo de avaliação diária de alunos em uma escola de tempo integral. Atualmente esse processo é feito em papel: cada profissional (professor, reforço escolar, cuidador de banho e nutricionista/almoço) preenche uma folha própria, e ao final do dia todas as folhas são grampeadas e entregues aos pais. Isso gera desperdício de papel, atrasos na entrega da informação, dificuldade de consulta a registros antigos e risco de perda de folhas.

O sistema resolve esse problema permitindo que cada profissional preencha seu formulário diretamente pelo navegador, com os dados sendo armazenados em um banco de dados PostgreSQL e enviados automaticamente aos responsáveis por e-mail, conforme a preferência configurada por cada um (a cada etapa concluída ou apenas um resumo ao final do dia).

## 2. Tecnologias utilizadas

### Frontend
- **React** com **Vite** como bundler
- **React Router DOM** para navegação entre páginas
- **Axios** para consumo da API
- **Bootstrap 5** para toda a estilização (cards, tabelas, formulários, modais, badges)

### Backend
- **Node.js** com **Express** para a API REST
- **bcrypt** para criptografia das senhas
- **jsonwebtoken (JWT)** para autenticação
- **Multer** para upload de fotos
- **Nodemailer** para envio de e-mails automáticos

### Banco de Dados
- **PostgreSQL**, acessado diretamente através do driver `pg` (sem ORM), com todas as consultas escritas em SQL puro dentro dos controllers.


## 3. Arquitetura utilizada

O projeto segue uma arquitetura simples de **API REST + SPA (Single Page Application)**, dividida em duas pastas principais:

- `backend/`: organizado em `routes` (rotas), `controllers` (regras de negócio e acesso ao banco), `middleware` (autenticação JWT e upload de arquivos), `database` (conexão e scripts SQL) e `uploads` (fotos enviadas).
- `frontend/`: organizado em `pages` (telas), `components` (elementos reutilizáveis como Navbar, Sidebar e modais), `context` (contexto de autenticação) e `api` (configuração do Axios).

Mais detalhes (com diagrama) estão em `documentacao/arquitetura.md`.

## 4. Perfis de usuário e permissões

| Perfil | Acesso |
|---|---|
| **Administrador** | Cadastro completo de alunos, responsáveis, profissionais e turmas; visualização de todo o histórico e dashboard geral |
| **Professor / Reforço / Banho / Almoço** | Preenchimento do formulário específico do seu cargo, apenas para os alunos da sua turma; consulta ao histórico das suas próprias avaliações |
| **Responsável** | Consulta ao resumo diário e histórico dos filhos vinculados; configuração de preferências de envio (por etapa ou final do dia) |

## 5. Principais funcionalidades implementadas

- Login com autenticação JWT e senha criptografada com bcrypt (para profissionais/administrador e também para responsáveis).
- Cadastro (criar, editar, excluir e pesquisar) de alunos, responsáveis, profissionais e turmas.
- Upload de foto do aluno e de fotos anexadas em cada avaliação, utilizando Multer, com os arquivos salvos localmente na pasta `uploads` e o caminho registrado no banco.
- Formulários específicos por tipo de profissional (professor, reforço, banho, almoço), cada um com os campos definidos no protótipo original.
- Opção de salvar rascunho (sem finalizar) ou finalizar a avaliação.
- Histórico completo de avaliações, pesquisável por aluno, turma, profissional, tipo e período.
- Dashboard com indicadores diferentes para cada perfil (administrador vê números gerais da escola; profissional vê pendências e conclusões do dia).
- Envio automático de e-mail ao final de cada avaliação, respeitando a preferência de cada responsável (por etapa ou resumo único ao final do dia), utilizando Nodemailer.
- Estrutura preparada (mas não implementada) para uma futura integração com WhatsApp, através do campo `forma_envio` já presente no cadastro de responsáveis.

## 6. Limitações do MVP

Como se trata de um MVP (Produto Mínimo Viável) desenvolvido como trabalho de disciplina, algumas simplificações foram feitas propositalmente:

- **Sem testes automatizados**: o foco foi a implementação funcional das regras de negócio, e não a cobertura de testes.
- **Sem envio real de WhatsApp**: a estrutura do banco já contempla a preferência de envio via WhatsApp, mas o envio de fato ainda não está implementado (ficaria a cargo de uma API paga de terceiros).
- **Um profissional por turma**: cada profissional (exceto o administrador) está vinculado a apenas uma turma por vez, o que é suficiente para o cenário proposto, mas poderia ser expandido para múltiplas turmas em uma versão futura.
- **Envio de e-mail depende de configuração externa**: é necessário configurar uma conta de e-mail nas variáveis de ambiente do backend para que o envio funcione de fato.
- **Sem recuperação de senha**: não foi implementado fluxo de "esqueci minha senha" por e-mail, ficando a redefinição de senha a cargo do administrador do sistema.

## 7. Como o sistema atende ao problema original

Comparando com o processo manual descrito no problema original, o CheckUp Escolar elimina o uso de papel, evita que os pais recebam as informações apenas no final do dia (caso configurem a preferência "por etapa"), garante que nenhum registro seja perdido (tudo fica salvo no banco de dados) e permite consultar o histórico de qualquer aluno a qualquer momento, trazendo mais organização, transparência e agilidade para a rotina da escola de tempo integral.
