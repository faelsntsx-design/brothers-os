if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "https://brothers-os.onrender.com";

if(localStorage.getItem("tema") === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

let ordens = [];

function get(obj, campo){
    if(!obj) return "";

    const mapa = {
        valorPeca: "valorpeca",
        maoObra: "maoobra",
        obsPeca: "obspeca"
    };

    return obj[campo] ?? obj[mapa[campo]] ?? obj[String(campo).toLowerCase()] ?? "";
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
        const res = await fetch(`${API}/ordens?nocache=${Date.now()}`);

        if(!res.ok){
            throw new Error("Erro ao carregar ordens");
        }

        ordens = await res.json();
        atualizarDashboard();

    }catch(error){
        console.error("Erro dashboard:", error);

        const atividade = document.getElementById("atividadeRecente");
        if(atividade){
            atividade.innerHTML = "<p>Erro ao carregar atividades.</p>";
        }
    }
}

function atualizarDashboard(){
    const emReparo = ordens.filter(os => get(os,"status") === "Em reparo").length;
    const prontos = ordens.filter(os => get(os,"status") === "Pronto").length;
    const total = ordens.length;

    const faturamento = ordens.reduce((soma, os) => {
        return soma + numero(get(os,"valor"));
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
        get(os,"status") === "Pronto" || get(os,"status") === "Entregue"
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
        const status = get(os,"status") || "Recebido";

        container.innerHTML += `
            <div class="service-item">
                <div>
                    <strong>${get(os,"aparelho") || "Aparelho"} ${get(os,"modelo") || ""}</strong>
                    <p>
                        ${get(os,"cliente") || "Cliente"} •
                        ${get(os,"defeito") || "Sem defeito informado"} •
                        ${get(os,"data") || ""}
                    </p>
                </div>

                <span class="tag ${classeStatus(status)}">
                    ${status}
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

/* atualiza automaticamente a cada 5 segundos */
setInterval(carregarDashboard, 5000);