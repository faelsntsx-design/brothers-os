if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "https://brothers-os.onrender.com";

if(localStorage.getItem("tema") === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

const form = document.getElementById("formVenda");
const lista = document.getElementById("listaVendas");

let vendas = [];

function numero(valor){
    return Number(
        String(valor || "0")
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0;
}

function moeda(valor){
    return valor.toLocaleString("pt-BR", {
        style:"currency",
        currency:"BRL"
    });
}

async function carregarVendas(){
    const res = await fetch(`${API}/vendas`);
    vendas = await res.json();
    renderizar();
    atualizarResumo();
}

form.addEventListener("submit", async function(e){
    e.preventDefault();

    const venda = {
        produto: document.getElementById("produto").value,
        categoria: document.getElementById("categoria").value,
        valor: document.getElementById("valor").value,
        pagamento: document.getElementById("pagamento").value,
        data: new Date().toLocaleDateString("pt-BR")
    };

    await fetch(`${API}/vendas`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(venda)
    });

    form.reset();
    carregarVendas();
});

function atualizarResumo(){
    const total = vendas.reduce((soma, venda) => soma + numero(venda.valor), 0);

    const pix = vendas
        .filter(venda => venda.pagamento === "Pix")
        .reduce((soma, venda) => soma + numero(venda.valor), 0);

    const dinheiro = vendas
        .filter(venda => venda.pagamento === "Dinheiro")
        .reduce((soma, venda) => soma + numero(venda.valor), 0);

    const cartao = vendas
        .filter(venda => venda.pagamento === "Cartão")
        .reduce((soma, venda) => soma + numero(venda.valor), 0);

    document.getElementById("totalVendido").innerText = moeda(total);
    document.getElementById("totalPix").innerText = moeda(pix);
    document.getElementById("totalDinheiro").innerText = moeda(dinheiro);
    document.getElementById("totalCartao").innerText = moeda(cartao);
    document.getElementById("qtdVendas").innerText = vendas.length;
}

function renderizar(){
    lista.innerHTML = "";

    if(vendas.length === 0){
        lista.innerHTML = "<p>Nenhuma venda registrada.</p>";
        return;
    }

    vendas.forEach(venda => {
        lista.innerHTML += `
            <div class="venda-item">
                <div>
                    <strong>${venda.produto}</strong>
                    <p>${venda.categoria} • ${venda.pagamento} • ${venda.data}</p>
                </div>

                <div style="display:flex; gap:10px; align-items:center;">
                    <strong>${moeda(numero(venda.valor))}</strong>
                    <button class="delete-btn" onclick="excluirVenda(${venda.id})">Excluir</button>
                </div>
            </div>
        `;
    });
}

async function excluirVenda(id){
    const confirmar = confirm("Excluir venda?");
    if(!confirmar) return;

    await fetch(`${API}/vendas/${id}`, {
        method:"DELETE"
    });

    carregarVendas();
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarVendas();