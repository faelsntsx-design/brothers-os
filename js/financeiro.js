const API = "http://localhost:3000";

const tema = localStorage.getItem("tema");

if(tema === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

let ordens = [];

async function carregarFinanceiro(){
    const res = await fetch(`${API}/ordens`);
    ordens = await res.json();
    renderizarFinanceiro();
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

function renderizarFinanceiro(){
    atualizarCards();

    const lista = document.getElementById("listaFinanceiro");
    lista.innerHTML = "";

    if(ordens.length === 0){
        lista.innerHTML = `<p>Nenhuma ordem encontrada.</p>`;
        return;
    }

    ordens.forEach(os => {
        const pagamento = os.pagamento || "Pendente";

        const valorPeca = numero(os.valorPeca);
        const maoObra = numero(os.maoObra);
        const total = numero(os.valor) || valorPeca + maoObra;

        lista.innerHTML += `
            <div class="finance-item">
                <div>
                    <strong>${os.cliente}</strong>
                    <p>${os.aparelho || "Aparelho"} ${os.modelo || ""} • ${os.defeito || "Serviço"}</p>
                    <p>Fornecedor: ${os.fornecedor || "Não informado"}</p>
                    <span class="badge ${pagamento}">${pagamento}</span>
                </div>

                <div>
                    <p>Peça: <strong>${moeda(valorPeca)}</strong></p>
                    <p>Mão de obra: <strong>${moeda(maoObra)}</strong></p>
                    <div class="valor">${moeda(total)}</div>
                    <p>Lucro: <strong>${moeda(maoObra)}</strong></p>
                </div>

                <div class="actions">
                    <button onclick="marcarPagamento(${os.id}, 'Pago')">Marcar pago</button>
                    <button onclick="marcarPagamento(${os.id}, 'Pendente')">Pendente</button>
                </div>
            </div>
        `;
    });
}

function atualizarCards(){
    const faturamento = ordens.reduce((soma, os) => {
        const total = numero(os.valor) || numero(os.valorPeca) + numero(os.maoObra);
        return soma + total;
    }, 0);

    const custoPecas = ordens.reduce((soma, os) => {
        return soma + numero(os.valorPeca);
    }, 0);

    const lucroReal = ordens.reduce((soma, os) => {
        return soma + numero(os.maoObra);
    }, 0);

    const recebido = ordens
        .filter(os => (os.pagamento || "Pendente") === "Pago")
        .reduce((soma, os) => {
            const total = numero(os.valor) || numero(os.valorPeca) + numero(os.maoObra);
            return soma + total;
        }, 0);

    const pendente = faturamento - recebido;
    const ticket = ordens.length ? faturamento / ordens.length : 0;

    document.getElementById("totalFaturamento").innerText = moeda(faturamento);
    document.getElementById("totalRecebido").innerText = moeda(recebido);
    document.getElementById("totalPendente").innerText = moeda(pendente);
    document.getElementById("ticketMedio").innerText = moeda(ticket);

    if(document.getElementById("custoPecas")){
        document.getElementById("custoPecas").innerText = moeda(custoPecas);
    }

    if(document.getElementById("lucroReal")){
        document.getElementById("lucroReal").innerText = moeda(lucroReal);
    }
}

async function marcarPagamento(id, pagamento){
    await fetch(`${API}/ordens/${id}`, {
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({ pagamento })
    });

    carregarFinanceiro();
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarFinanceiro();