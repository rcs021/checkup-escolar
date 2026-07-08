const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta uploads existe
const pastaUploads = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, { recursive: true });
}

// Configuração de armazenamento local
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pastaUploads);
    },
    filename: function (req, file, cb) {
        const sufixo = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extensao = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + sufixo + extensao);
    }
});

// Aceita apenas imagens (jpg, jpeg, png)
function filtroArquivo(req, file, cb) {
    const tiposPermitidos = /jpeg|jpg|png/;
    const extensaoValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = tiposPermitidos.test(file.mimetype);

    if (extensaoValida && mimeValido) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens JPG ou PNG são permitidas'));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: filtroArquivo,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
