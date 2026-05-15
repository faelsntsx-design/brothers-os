const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/ordens", (req, res) => {
    db.all("SELECT * FROM ordens ORDER BY id DESC", [], (err, rows) => {
        if(err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post("/ordens", (req, res) => {
    const {
        cliente, telefone, aparelho, modelo, defeito,
        valor, valorPeca, maoObra, fornecedor, obsPeca,
        status, pagamento, obs, data
    } = req.body;

    db.run(
        `INSERT INTO ordens 
        (cliente, telefone, aparelho, modelo, defeito, valor, valorPeca, maoObra, fornecedor, obsPeca, status, pagamento, obs, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            cliente, telefone, aparelho, modelo, defeito,
            valor, valorPeca, maoObra, fornecedor, obsPeca,
            status, pagamento || "Pendente", obs, data
        ],
        function(err){
            if(err) return res.status(500).json(err);
            res.json({ id:this.lastID, message:"Ordem criada" });
        }
    );
});

app.put("/ordens/:id", (req, res) => {
    const {
        cliente, telefone, aparelho, modelo, defeito,
        valor, valorPeca, maoObra, fornecedor, obsPeca,
        status, pagamento, obs
    } = req.body;

    db.run(
        `UPDATE ordens SET
        cliente = COALESCE(?, cliente),
        telefone = COALESCE(?, telefone),
        aparelho = COALESCE(?, aparelho),
        modelo = COALESCE(?, modelo),
        defeito = COALESCE(?, defeito),
        valor = COALESCE(?, valor),
        valorPeca = COALESCE(?, valorPeca),
        maoObra = COALESCE(?, maoObra),
        fornecedor = COALESCE(?, fornecedor),
        obsPeca = COALESCE(?, obsPeca),
        status = COALESCE(?, status),
        pagamento = COALESCE(?, pagamento),
        obs = COALESCE(?, obs)
        WHERE id = ?`,
        [
            cliente, telefone, aparelho, modelo, defeito,
            valor, valorPeca, maoObra, fornecedor, obsPeca,
            status, pagamento, obs, req.params.id
        ],
        function(err){
            if(err) return res.status(500).json(err);
            res.json({ message:"Ordem atualizada" });
        }
    );
});

app.delete("/ordens/:id", (req, res) => {
    db.run("DELETE FROM ordens WHERE id = ?", [req.params.id], function(err){
        if(err) return res.status(500).json(err);
        res.json({ message:"Ordem removida" });
    });
});
/* LISTAR VENDAS */

app.get("/vendas", (req, res) => {
    db.all("SELECT * FROM vendas ORDER BY id DESC", [], (err, rows) => {
        if(err) return res.status(500).json(err);
        res.json(rows);
    });
});

/* CRIAR VENDA */

app.post("/vendas", (req, res) => {
    const { produto, categoria, valor, pagamento, data } = req.body;

    db.run(
        `
        INSERT INTO vendas
        (produto, categoria, valor, pagamento, data)
        VALUES (?, ?, ?, ?, ?)
        `,
        [produto, categoria, valor, pagamento, data],
        function(err){
            if(err) return res.status(500).json(err);

            res.json({
                id:this.lastID,
                message:"Venda registrada"
            });
        }
    );
});

/* EXCLUIR VENDA */

app.delete("/vendas/:id", (req, res) => {
    db.run("DELETE FROM vendas WHERE id = ?", [req.params.id], function(err){
        if(err) return res.status(500).json(err);
        res.json({ message:"Venda removida" });
    });
});
app.get("/celulares", (req, res) => {
    db.all("SELECT * FROM celulares ORDER BY id DESC", [], (err, rows) => {
        if(err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post("/celulares", (req, res) => {
    const {
        marca, modelo, memoria, cor, imei, estado,
        valorCompra, valorVenda, observacao, dataCadastro
    } = req.body;

    db.run(
        `INSERT INTO celulares
        (marca, modelo, memoria, cor, imei, estado, valorCompra, valorVenda, status, observacao, dataCadastro, garantia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            marca, modelo, memoria, cor, imei, estado,
            valorCompra, valorVenda, "Disponível", observacao,
            dataCadastro, "3 meses"
        ],
        function(err){
            if(err) return res.status(500).json(err);
            res.json({ id:this.lastID, message:"Celular cadastrado" });
        }
    );
});

app.put("/celulares/:id/vender", (req, res) => {
    const { comprador, telefoneComprador, dataVenda } = req.body;

    db.run(
        `UPDATE celulares SET
        status = 'Vendido',
        comprador = ?,
        telefoneComprador = ?,
        dataVenda = ?
        WHERE id = ?`,
        [comprador, telefoneComprador, dataVenda, req.params.id],
        function(err){
            if(err) return res.status(500).json(err);
            res.json({ message:"Celular marcado como vendido" });
        }
    );
});

app.delete("/celulares/:id", (req, res) => {
    db.run("DELETE FROM celulares WHERE id = ?", [req.params.id], function(err){
        if(err) return res.status(500).json(err);
        res.json({ message:"Celular removido" });
    });
});
app.get("/celulares", (req, res) => {
    db.all("SELECT * FROM celulares ORDER BY id DESC", [], (err, rows) => {
        if(err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post("/celulares", (req, res) => {
    const {
        marca, modelo, memoria, cor, estado,
        valorCompra, valorVenda, observacao, dataCadastro
    } = req.body;

    db.run(
        `INSERT INTO celulares
        (marca, modelo, memoria, cor, estado, valorCompra, valorVenda, status, observacao, dataCadastro, garantia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            marca, modelo, memoria, cor, estado,
            valorCompra, valorVenda, "Disponível",
            observacao, dataCadastro, "3 meses"
        ],
        function(err){
            if(err) return res.status(500).json(err);
            res.json({ id:this.lastID, message:"Celular cadastrado" });
        }
    );
});

app.put("/celulares/:id/vender", (req, res) => {
    const { comprador, cpfComprador, telefoneComprador, dataVenda } = req.body;

    db.run(
        `UPDATE celulares SET
        status = 'Vendido',
        comprador = ?,
        cpfComprador = ?,
        telefoneComprador = ?,
        dataVenda = ?
        WHERE id = ?`,
        [comprador, cpfComprador, telefoneComprador, dataVenda, req.params.id],
        function(err){
            if(err) return res.status(500).json(err);
            res.json({ message:"Celular vendido" });
        }
    );
});

app.delete("/celulares/:id", (req, res) => {
    db.run("DELETE FROM celulares WHERE id = ?", [req.params.id], function(err){
        if(err) return res.status(500).json(err);
        res.json({ message:"Celular removido" });
    });
});
app.listen(3000, () => {
    console.log("BROTHERS API rodando em http://localhost:3000");
});