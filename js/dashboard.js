if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "https://brothers-os.onrender.com";

if(localStorage.getItem("tema") === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

function campo(obj, nome){
    return obj[nome] || obj[nome.toLowerCase()] || "";
}

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

async function carregarDashboard(){
    try{
        const [ordensRes, vendasRes, celularesRes] = await Promise.all([
            fetch(`${API}/ordens`),
            fetch(`${API}/vendas`),
            fetch(`${API}/celulares`)
        ]);

        const ordens = await ordensRes.json();
        const vendas = await vendasRes.json();
        const celulares = await celularesRes.json();

        document.getElementById("totalOrdens").innerText = ordens.length;
        document.getElementById("ordensProntas").innerText =
            ordens.filter(os => campo(os,"status") === "Pronto").length;

        document.getElementById("ordensReparo").innerText =
            ordens.filter(os => campo(os,"status") === "Em reparo").length;

        const faturamentoOS = ordens
            .filter(os => campo(os,"status") === "Entregue")
            .reduce((soma, os) => soma + numero(campo(os,"valor")), 0);

        const faturamentoVendas = vendas
            .reduce((soma, venda) => soma + numero(campo(venda,"valor")), 0);

        const faturamentoCelulares = celulares
            .filter(c => campo(c,"status") === "Vendido")
            .reduce((soma, c) => soma + numero(campo(c,"valorVenda")), 0);

        const total = faturamentoOS + faturamentoVendas + faturamentoCelulares;

        document.getElementById("faturamentoTotal").innerText = moeda(total);

        const atividades = document.getElementById("atividadesRecentes");
        atividades.innerHTML = "";

        const recentes = [
            ...ordens.map(o => ({
                tipo:"OS",
                titulo:`${campo(o,"cliente")} - ${campo(o,"aparelho")}`,
                data:campo(o,"data")
            })),
            ...vendas.map(v => ({
                tipo:"Venda",
                titulo:`${campo(v,"produto")} - ${moeda(numero(campo(v,"valor")))}`,
                data:campo(v,"data")
            })),
            ...celulares
                .filter(c => campo(c,"status") === "Vendido")
                .map(c => ({
                    tipo:"Celular",
                    titulo:`${campo(c,"marca")} ${campo(c,"modelo")} vendido`,
                    data:campo(c,"dataVenda")
                }))
        ];

        recentes.slice(0, 10).forEach(item => {
            atividades.innerHTML += `
                <div class="activity-item">
                    <strong>${item.tipo}</strong>
                    <p>${item.titulo}</p>
                    <small>${item.data}</small>
                </div>
            `;
        });

    }catch(error){
        console.error(error);
    }
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarDashboard();