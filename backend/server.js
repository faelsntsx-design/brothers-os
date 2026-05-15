const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "db.json");

function lerDB(){
    if(!fs.existsSync(dbPath)){
        fs.writeFileSync(dbPath, JSON.stringify({
            ordens: [],
            vendas: [],
            celulares: []
        }, null, 2));
    }

    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function salvarDB(db){
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

/* ORDENS */

app.get("/ordens", (req, res) => {
    const db = lerDB();
    res.json(db.ordens.sort((a,b) => b.id - a.id));
});

app.post("/ordens", (req, res) => {
    const db = lerDB();

    const nova = {
        id: Date.now(),
        ...req.body
    };

    db.ordens.unshift(nova);
    salvarDB(db);

    res.json(nova);
});

app.put("/ordens/:id", (req, res) => {
    const db = lerDB();
    const id = Number(req.params.id);

    db.ordens = db.ordens.map(os => {
        if(os.id === id){
            return { ...os, ...req.body };
        }

        return os;
    });

    salvarDB(db);
    res.json({ message:"Ordem atualizada" });
});

app.delete("/ordens/:id", (req, res) => {
    const db = lerDB();
    const id = Number(req.params.id);

    db.ordens = db.ordens.filter(os => os.id !== id);

    salvarDB(db);
    res.json({ message:"Ordem removida" });
});

/* VENDAS */

app.get("/vendas", (req, res) => {
    const db = lerDB();
    res.json(db.vendas.sort((a,b) => b.id - a.id));
});

app.post("/vendas", (req, res) => {
    const db = lerDB();

    const venda = {
        id: Date.now(),
        ...req.body
    };

    db.vendas.unshift(venda);
    salvarDB(db);

    res.json(venda);
});

app.delete("/vendas/:id", (req, res) => {
    const db = lerDB();
    const id = Number(req.params.id);

    db.vendas = db.vendas.filter(venda => venda.id !== id);

    salvarDB(db);
    res.json({ message:"Venda removida" });
});

/* CELULARES */

app.get("/celulares", (req, res) => {
    const db = lerDB();
    res.json(db.celulares.sort((a,b) => b.id - a.id));
});

app.post("/celulares", (req, res) => {
    const db = lerDB();

    const celular = {
        id: Date.now(),
        status: "Disponível",
        garantia: "3 meses",
        ...req.body
    };

    db.celulares.unshift(celular);
    salvarDB(db);

    res.json(celular);
});

app.put("/celulares/:id/vender", (req, res) => {
    const db = lerDB();
    const id = Number(req.params.id);

    db.celulares = db.celulares.map(celular => {
        if(celular.id === id){
            return {
                ...celular,
                status: "Vendido",
                comprador: req.body.comprador,
                cpfComprador: req.body.cpfComprador,
                telefoneComprador: req.body.telefoneComprador,
                dataVenda: req.body.dataVenda
            };
        }

        return celular;
    });

    salvarDB(db);
    res.json({ message:"Celular vendido" });
});

app.delete("/celulares/:id", (req, res) => {
    const db = lerDB();
    const id = Number(req.params.id);

    db.celulares = db.celulares.filter(celular => celular.id !== id);

    salvarDB(db);
    res.json({ message:"Celular removido" });
});

app.get("/", (req, res) => {
    res.send("BROTHERS API ONLINE");
});

app.listen(PORT, () => {
    console.log(`BROTHERS API rodando na porta ${PORT}`);
});