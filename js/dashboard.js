if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "https://brothers-os.onrender.com";

const tema = localStorage.getItem("tema");

if(tema === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

let ordens = [];

async function carregarDashboard(){
    try{
        const res = await fetch(`${API}/ordens`);

        if(!res.ok){
            throw new Error("Erro ao buscar ordens");
        }

        ordens = await res.json();
        atualizarDashboard();

    }catch(error){
        console.log("Erro no dashboard:", error);

        const atividade = document.getElementById("atividadeRecente");

        if(atividade){
            atividade.innerHTML = `
                <p>Não foi possível conectar ao servidor. Verifique se o backend está rodando.</p>
            `;
        }
    }
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

function atualizarDashboard(){
    const emReparo = ordens.filter(os => os.status === "Em reparo").length;
    const prontos = ordens.filter(os => os.status === "Pronto").length;
    const total = ordens.length;

    const faturamento = ordens.reduce((soma, os) => {
        const totalOS = numero(os.valor) || numero(os.valorPeca) + numero(os.maoObra);
        return soma + totalOS;
    }, 0);

    document.getElementById("dashReparo").innerText = emReparo;
    document.getElementById("dashProntos").innerText = prontos;
    document.getElementById("dashOrdens").innerText = total;
    document.getElementById("dashFaturamento").innerText = moeda(faturamento);

    atualizarPerformance();
    renderizarAtividadeRecente();
}

function atualizarPerformance(){
    const total = ordens.length;
    const finalizadas = ordens.filter(os =>
        os.status === "Pronto" || os.status === "Entregue"
    ).length;

    const porcentagem = total > 0 ? Math.round((finalizadas / total) * 100) : 0;

    const texto = document.getElementById("performancePorcentagem");
    const circulo = document.querySelector(".progress-circle");

    if(texto){
        texto.innerText = `${porcentagem}%`;
    }

    if(circulo){
        circulo.style.setProperty("--progress", `${porcentagem}%`);
    }
}

function renderizarAtividadeRecente(){
    const container = document.getElementById("atividadeRecente");

    if(!container) return;

    container.innerHTML = "";

    const recentes = ordens.slice(0, 6);

    if(recentes.length === 0){
        container.innerHTML = `<p>Nenhuma atividade recente.</p>`;
        return;
    }

    recentes.forEach(os => {
        container.innerHTML += `
            <div class="service-item">
                <div>
                    <strong>${os.aparelho || "Aparelho"} ${os.modelo || ""}</strong>
                    <p>
                        ${os.cliente || "Cliente"} • 
                        ${os.defeito || "Sem defeito informado"} • 
                        ${os.data || ""}
                    </p>
                </div>

                <span class="tag ${classeStatus(os.status)}">
                    ${os.status || "Recebido"}
                </span>
            </div>
        `;
    });
}

function classeStatus(status){
    if(status === "Em reparo") return "repair";
    if(status === "Pronto") return "ready";
    if(status === "Diagnóstico") return "diagnostic";
    if(status === "Entregue") return "delivered";
    if(status === "Recebido") return "received";
    if(status === "Aguardando aprovação") return "repair";

    return "received";
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarDashboard();

setInterval(carregarDashboard, 3000);