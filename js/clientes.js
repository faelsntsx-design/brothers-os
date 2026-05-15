if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}
const API = "http://localhost:3000";

const tema = localStorage.getItem("tema");

if(tema === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

const listaClientes = document.getElementById("listaClientes");
let ordens = [];

async function carregarClientes(){
    const res = await fetch(`${API}/ordens`);
    ordens = await res.json();

    renderizarClientes();
}

function formatarValor(valor){
    const numero = Number(
        String(valor || "0")
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    );

    return numero || 0;
}

function gerarClientes(){
    const mapa = {};

    ordens.forEach(os => {
        const telefoneLimpo = String(os.telefone || "").replace(/\D/g, "");
        const chave = telefoneLimpo || os.cliente.toLowerCase();

        if(!mapa[chave]){
            mapa[chave] = {
                nome: os.cliente,
                telefone: os.telefone,
                telefoneLimpo,
                servicos: 0,
                total: 0,
                ultimaOS: os.data,
                aparelhos: []
            };
        }

        mapa[chave].servicos++;
        mapa[chave].total += formatarValor(os.valor);

        const aparelho = `${os.aparelho || ""} ${os.modelo || ""}`.trim();

        if(aparelho){
            mapa[chave].aparelhos.push(aparelho);
        }

        mapa[chave].ultimaOS = os.data;
    });

    return Object.values(mapa);
}

function renderizarClientes(){
    const busca = document.getElementById("buscaCliente").value.toLowerCase();
    const clientes = gerarClientes();

    const filtrados = clientes.filter(cliente => {
        const texto = `${cliente.nome} ${cliente.telefone}`.toLowerCase();
        return texto.includes(busca);
    });

    atualizarResumo(clientes);

    listaClientes.innerHTML = "";

    if(filtrados.length === 0){
        listaClientes.innerHTML = `<p>Nenhum cliente encontrado.</p>`;
        return;
    }

    filtrados.forEach(cliente => {
        const inicial = cliente.nome ? cliente.nome.charAt(0).toUpperCase() : "C";

        listaClientes.innerHTML += `
            <div class="cliente-card">
                <div class="cliente-top">
                    <div style="display:flex; gap:14px; align-items:center;">
                        <div class="avatar">${inicial}</div>

                        <div>
                            <h4>${cliente.nome}</h4>
                            <p>${cliente.telefone}</p>
                        </div>
                    </div>
                </div>

                <p>Última OS: ${cliente.ultimaOS || "Não informado"}</p>
                <p>Aparelhos: ${cliente.aparelhos.slice(0,3).join(", ") || "Não informado"}</p>

                <div class="cliente-info">
                    <div class="info-box">
                        <strong>${cliente.servicos}</strong>
                        <span>Serviços</span>
                    </div>

                    <div class="info-box">
                        <strong>${cliente.total.toLocaleString("pt-BR", {
                            style:"currency",
                            currency:"BRL"
                        })}</strong>
                        <span>Total gasto</span>
                    </div>
                </div>

                <button class="whats-btn" onclick="abrirWhatsApp('${cliente.telefoneLimpo}', '${cliente.nome}')">
                    WhatsApp
                </button>
            </div>
        `;
    });
}

function atualizarResumo(clientes){
    const totalGasto = clientes.reduce((soma, cliente) => soma + cliente.total, 0);
    const totalServicos = clientes.reduce((soma, cliente) => soma + cliente.servicos, 0);

    document.getElementById("totalClientes").innerText = clientes.length;
    document.getElementById("totalServicos").innerText = totalServicos;

    document.getElementById("totalGasto").innerText = totalGasto.toLocaleString("pt-BR", {
        style:"currency",
        currency:"BRL"
    });
}

function abrirWhatsApp(telefone, nome){
    let numero = telefone.replace(/\D/g, "");

    if(!numero.startsWith("55")){
        numero = "55" + numero;
    }

    const mensagem = encodeURIComponent(
        `Olá, ${nome}! Aqui é da BROTHERS CELULARES.`
    );

    window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
}

carregarClientes();