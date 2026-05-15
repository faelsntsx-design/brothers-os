const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./brothers.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS ordens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT,
            telefone TEXT,
            aparelho TEXT,
            modelo TEXT,
            defeito TEXT,
            valor TEXT,
            valorPeca TEXT DEFAULT '0',
            maoObra TEXT DEFAULT '0',
            fornecedor TEXT,
            obsPeca TEXT,
            status TEXT,
            pagamento TEXT DEFAULT 'Pendente',
            obs TEXT,
            data TEXT
        )
    `);

    db.run(`ALTER TABLE ordens ADD COLUMN valorPeca TEXT DEFAULT '0'`, () => {});
    db.run(`ALTER TABLE ordens ADD COLUMN maoObra TEXT DEFAULT '0'`, () => {});
    db.run(`ALTER TABLE ordens ADD COLUMN fornecedor TEXT`, () => {});
    db.run(`ALTER TABLE ordens ADD COLUMN obsPeca TEXT`, () => {});

    db.run(`
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            produto TEXT,
            categoria TEXT,
            valor TEXT,
            pagamento TEXT,
            data TEXT
        )
    `);
});
db.run(`
    CREATE TABLE IF NOT EXISTS celulares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marca TEXT,
        modelo TEXT,
        memoria TEXT,
        cor TEXT,
        estado TEXT,
        valorCompra TEXT,
        valorVenda TEXT,
        status TEXT DEFAULT 'Disponível',
        observacao TEXT,
        comprador TEXT,
        cpfComprador TEXT,
        telefoneComprador TEXT,
        dataCadastro TEXT,
        dataVenda TEXT,
        garantia TEXT DEFAULT '3 meses'
    )
`);
module.exports = db;