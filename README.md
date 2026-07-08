# ✅ CheckUp Escolar

Sistema de Avaliação Diária do Aluno para Escola de Tempo Integral.

Trabalho final da disciplina **MATC82 - Sistemas Web**, da Universidade Federal da Bahia (UFBA).

## 📁 Estrutura do projeto

```
checkup-escolar/
├── backend/          # API REST (Node.js + Express + PostgreSQL)
├── frontend/         # Interface web (React + Vite + Bootstrap)
├── documentacao/      # DER, arquitetura, fluxograma e explicação geral
└── README.md
```

## 🛠️ Tecnologias utilizadas

**Frontend:** React, Vite, React Router DOM, Axios, Bootstrap 5
**Backend:** Node.js, Express, bcrypt, jsonwebtoken (JWT), Multer, Nodemailer
**Banco de dados:** PostgreSQL

## ✅ Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [PostgreSQL](https://www.postgresql.org/download/) (versão 13 ou superior)
- npm (já vem junto com o Node.js)

## 🚀 Passo a passo para instalação

### 1. Criar o banco de dados

Abra o terminal do PostgreSQL (psql) ou uma ferramenta como o pgAdmin e crie o banco:

```sql
CREATE DATABASE checkup_escolar;
```

Depois, execute o script de criação das tabelas (esse comando já se conecta ao banco criado e roda o script):

```bash
psql -U postgres -d checkup_escolar -f backend/database/schema.sql
```

### 2. Configurar e instalar o Backend

```bash
cd backend
npm install
```

Copie o arquivo de exemplo de variáveis de ambiente e ajuste conforme o seu ambiente:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e configure:
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`: dados de acesso ao seu PostgreSQL
- `EMAIL_USER`, `EMAIL_PASS`: uma conta de e-mail para testes (recomenda-se criar uma conta gratuita em [ethereal.email](https://ethereal.email) apenas para testar o envio, já que os e-mails ficam disponíveis para visualização em uma caixa de entrada fake)

Popule o banco com dados de exemplo (usuários de teste, turmas e alunos):

```bash
npm run seed
```

Inicie o servidor backend:

```bash
npm run dev
```

O backend estará rodando em `http://localhost:3001`.

### 3. Configurar e instalar o Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## 🔑 Usuários de teste (criados pelo `npm run seed`)

Todas as senhas são `123456`.

| Perfil | Usuário / E-mail |
|---|---|
| Administrador | `admin` |
| Professor | `ana.professora` |
| Reforço Escolar | `carlos.reforco` |
| Banho | `marta.banho` |
| Almoço | `paulo.almoco` |
| Responsável | `carla@teste.com` |

## 📖 Documentação complementar

- [DER - Diagrama Entidade-Relacionamento](documentacao/DER.md)
- [Arquitetura do sistema](documentacao/arquitetura.md)
- [Fluxograma de funcionamento](documentacao/fluxograma.md)
- [Explicação geral do projeto](documentacao/explicacao-geral.md)

## ⚠️ Observação sobre o envio de e-mails

O envio de e-mails depende de uma conta de SMTP configurada no `.env` do backend. Caso as credenciais não sejam configuradas, o sistema continuará funcionando normalmente (avaliações são salvas no banco), mas o envio de e-mail falhará silenciosamente (o erro é registrado no console do backend, sem interromper o fluxo do usuário).

## 📌 Funcionalidades principais

- Login com JWT para administrador, profissionais e responsáveis
- CRUD completo de alunos, responsáveis, profissionais e turmas
- Formulários diários específicos por tipo de profissional (professor, reforço, banho, almoço)
- Upload de fotos (aluno e avaliações) com Multer
- Histórico de avaliações pesquisável por aluno, turma, profissional e período
- Envio automático de e-mail por etapa ou resumo do dia, conforme preferência do responsável
- Dashboard com indicadores diferentes para cada perfil de usuário
