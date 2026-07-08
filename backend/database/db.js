// Conexão com o banco de dados PostgreSQL utilizando o pacote "pg"
const { Pool } = require('pg');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';

const precisaSSL = host !== 'localhost' && host !== '127.0.0.1';

const pool = new Pool({
    host,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'checkup_escolar',
    ssl: precisaSSL ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
    console.log('Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Erro inesperado no banco de dados', err);
});

module.exports = pool;