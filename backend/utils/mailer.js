const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuração do transportador de e-mail
// Para testes, pode-se usar um serviço como Ethereal (https://ethereal.email)
// ou uma conta Gmail com "senha de app".
const transportador = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Traduz os nomes dos tipos de formulário para exibição
const nomesTipo = {
    professor: 'Professor',
    reforco: 'Reforço Escolar',
    banho: 'Banho',
    almoco: 'Almoço'
};

// Monta o HTML de uma avaliação individual
function montarHtmlAvaliacao(avaliacao) {
    let detalhes = '';
    const d = avaliacao.detalhes || {};

    if (avaliacao.tipo === 'professor') {
        detalhes = `
            <li>Participação nas atividades: ${d.participacao || '-'}</li>
            <li>Aprendizado do dia: ${d.aprendizado || '-'}</li>
            <li>Comportamento: ${d.comportamento || '-'}</li>`;
    } else if (avaliacao.tipo === 'reforco') {
        detalhes = `
            <li>Atividades realizadas: ${d.atividades || '-'}</li>
            <li>Dificuldades encontradas: ${d.dificuldades || '-'}</li>
            <li>Evolução: ${d.evolucao || '-'}</li>`;
    } else if (avaliacao.tipo === 'banho') {
        detalhes = `
            <li>Tomou banho: ${d.tomou_banho ? 'Sim' : 'Não'}</li>
            <li>Precisou de ajuda: ${d.precisou_ajuda ? 'Sim' : 'Não'}</li>
            <li>Comportamento: ${d.comportamento || '-'}</li>`;
    } else if (avaliacao.tipo === 'almoco') {
        detalhes = `
            <li>Comeu bem: ${d.comeu_bem ? 'Sim' : 'Não'}</li>
            <li>Quantidade: ${d.quantidade || '-'}</li>
            <li>Alimento recusado: ${d.recusou_alimento || '-'}</li>`;
    }

    return `
        <h3>${nomesTipo[avaliacao.tipo]}</h3>
        <ul>${detalhes}</ul>
        <p><strong>Observações:</strong> ${avaliacao.observacoes || 'Nenhuma'}</p>
    `;
}

// Envia e-mail referente a UMA etapa (quando preferencia_envio = 'etapa')
async function enviarEmailEtapa(responsavel, aluno, avaliacao) {
    const html = `
        <h2>CheckUp Escolar - Avaliação do dia</h2>
        <p>Aluno(a): <strong>${aluno.nome}</strong></p>
        <p>Data: ${new Date(avaliacao.data).toLocaleDateString('pt-BR')}</p>
        ${montarHtmlAvaliacao(avaliacao)}
        <hr>
        <p style="font-size:12px;color:#666">Este é um e-mail automático do sistema CheckUp Escolar.</p>
    `;

    return transportador.sendMail({
        from: `"CheckUp Escolar" <${process.env.EMAIL_USER || 'checkup@escola.com'}>`,
        to: responsavel.email,
        subject: `Avaliação de ${nomesTipo[avaliacao.tipo]} - ${aluno.nome}`,
        html
    });
}

// Envia e-mail com o RESUMO DO DIA (quando preferencia_envio = 'final')
async function enviarEmailResumoDia(responsavel, aluno, avaliacoes) {
    const secoes = avaliacoes.map(montarHtmlAvaliacao).join('<hr>');

    const html = `
        <h2>CheckUp Escolar - Resumo do dia</h2>
        <p>Aluno(a): <strong>${aluno.nome}</strong></p>
        <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
        ${secoes}
        <hr>
        <p style="font-size:12px;color:#666">Este é um e-mail automático do sistema CheckUp Escolar.</p>
    `;

    return transportador.sendMail({
        from: `"CheckUp Escolar" <${process.env.EMAIL_USER || 'checkup@escola.com'}>`,
        to: responsavel.email,
        subject: `Resumo do dia - ${aluno.nome}`,
        html
    });
}

module.exports = { enviarEmailEtapa, enviarEmailResumoDia };
