const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/* TESTE */

app.get("/", (req, res) => {
    res.send("BROTHERS API ONLINE COM SUPABASE");
});

/* ORDENS */

app.get("/ordens", async (req, res) => {
    try{
        const result = await pool.query("SELECT * FROM ordens ORDER BY id DESC");
        res.json(result.rows);
    }catch(error){
        res.status(500).json({ error:error.message });
    }
});

app.post("/ordens", async (req, res) => {
    try{
        const os = req.body;
        const id = Date.now();

        await pool.query(
            `INSERT INTO ordens 
            (id, cliente, telefone, aparelho, modelo, defeito, valor, valorPeca, maoObra, fornecedor, obsPeca, status, pagamento, obs, data)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
            [
                id,
                os.cliente,
                os.telefone,
                os.aparelho,
                os.modelo,
                os.defeito,
                os.valor,
                os.valorPeca,
                os.maoObra,
                os.fornecedor,
                os.obsPeca,
                os.status,
                os.pagamento || "Pendente",
                os.obs,
                os.data
            ]
        );

        res.json({ id, message:"Ordem criada" });
    }catch(error){
        res.status(500).json({ error:error.message });
    }
});

app.put("/ordens/:id", async (req, res) => {
    try{
        const atual = await pool.query("SELECT * FROM ordens WHERE id = $1", [req.params.id]);

        if(atual.rows.length === 0){
            return res.status(404).json({ error:"Ordem não encontrada" });
        }

        const os = {
            ...atual.rows[0],
            ...req.body
        };

        await pool.query(
            `UPDATE ordens SET
            cliente=$1, telefone=$2, aparelho=$3, modelo=$4, defeito=$5,
            valor=$6, valorPeca=$7, maoObra=$8, fornecedor=$9, obsPeca=$10,
            status=$11, pagamento=$12, obs=$13, data=$14
            WHERE id=$15`,
            [
                os.cliente,
                os.telefone,
                os.aparelho,
                os.modelo,
                os.defeito,
                os.valor,
                os.valorpeca || os.valorPeca,
                os.maoobra || os.maoObra,
                os.fornecedor,
                os.obspeca || os.obsPeca,
                os.status,
                os.pagamento,
                os.obs,
                os.data,
                req.params.id
            ]
        );

        res.json({ message:"Ordem atualizada" });
    }catch(error){
        res.status(500).json({ error:error.message });
    }
});

app.delete("/ordens/:id", async (req, res) => {
    try{
        await pool.query("DELETE FROM ordens WHERE id=$1", [req.params.id]);
        res.json({ message:"Ordem removida" });
    }catch(error){
        res.status(500).json({ error:error.message });
    }
});

/* VENDAS */

app.get("/vendas", async (req, res) => {
    try{
        const result = await pool.query("SELECT * FROM vendas ORDER BY id DESC");
        res.json(result.rows);
    }catch(error){
        res.status(500).json({ error:error.message });
    }
});

app.post("/vendas", async (req, res) => {
    try{
        const venda = req.body;
        const id = Date.now();

        await pool.query(
            `INSERT INTO vendas 
            (id, produto, categoria, valor, pagamento, data)
            VALUES ($1,$2,$3,$4,$5,$6)`,
            [
                id,
                venda.produto,
                venda.categoria,
                venda.valor,
                venda.pagamento,
                venda.data
            ]
        );

        res.json({ id, message:"Venda criada" });
    }catch(error){
        res.status(500).json({ error:error.message });
    }
});

app.delete("/vendas/:id", async (req, res) => {
    try{
        await pool.query("DELETE FROM vendas WHERE id=$1", [req.params.id]);
        res.json({ message:"Venda removida" });
    }catch(error){
        res.status(500).json({ error:error.message });
    }
});

/* CELULARES */

app.get("/celulares", async (req, res) => {
    try{
        const result = await pool.query("SELECT * FROM celulares ORDER BY id DESC");
        res.json(result.rows);
    }catch(error){
        res.status(500).json({ error:error.message });
    }
});

app.post("/celulares", async (req, res) => {
    try{
        const c = req.body;
        const id = Date.now();

        await pool.query(
            `INSERT INTO celulares 
            (
                id,
                marca,
                modelo,
                memoria,
                cor,
                estado,
                valorcompra,
                valorvenda,
                status,
                observacao,
                comprador,
                cpfcomprador,
                telefonecomprador,
                datacadastro,
                datavenda,
                garantia
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
            [
                id,
                c.marca || "",
                c.modelo || "",
                c.memoria || "",
                c.cor || "",
                c.estado || "",
                c.valorCompra || "0",
                c.valorVenda || "0",
                "Disponível",
                c.observacao || "",
                "",
                "",
                "",
                c.dataCadastro || "",
                "",
                "3 meses"
            ]
        );

        res.json({
            success:true,
            id
        });

    }catch(error){
        console.error(error);
        res.status(500).json({
            error:error.message
        });
    }
});
app.put("/celulares/:id/vender", async (req, res) => {
    try{
        await pool.query(
            `UPDATE celulares SET
                status=$1,
                comprador=$2,
                cpfcomprador=$3,
                telefonecomprador=$4,
                datavenda=$5
            WHERE id=$6`,
            [
                "Vendido",
                req.body.comprador || "",
                req.body.cpfComprador || "",
                req.body.telefoneComprador || "",
                req.body.dataVenda || "",
                req.params.id
            ]
        );

        res.json({ success:true });

    }catch(error){
        console.error(error);
        res.status(500).json({
            error:error.message
        });
    }
});

app.delete("/celulares/:id", async (req, res) => {
    try{
        await pool.query("DELETE FROM celulares WHERE id=$1", [req.params.id]);
        res.json({ message:"Celular removido" });
    }catch(error){
        res.status(500).json({ error:error.message });
    }
});

app.listen(PORT, () => {
    console.log(`BROTHERS API rodando na porta ${PORT}`);
});