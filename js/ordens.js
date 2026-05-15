if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "http://localhost:3000";

const tema = localStorage.getItem("tema");
if(tema === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

const form = document.getElementById("formOS");
const lista = document.getElementById("listaOS");
const totalOS = document.getElementById("totalOS");

let ordens = [];

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
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });
}

function calcularTotal(){
    const valorPeca = numero(document.getElementById("valorPeca").value);
    const maoObra = numero(document.getElementById("maoObra").value);
    document.getElementById("valor").value = moeda(valorPeca + maoObra);
}

document.getElementById("valorPeca").addEventListener("input", calcularTotal);
document.getElementById("maoObra").addEventListener("input", calcularTotal);

async function carregarOrdens(){
    try{
        const res = await fetch(`${API}/ordens`);
        ordens = await res.json();
        renderizar();
    }catch(error){
        lista.innerHTML = "<p>Erro: backend não está rodando.</p>";
        console.log(error);
    }
}

form.addEventListener("submit", async function(e){
    e.preventDefault();

    const editId = document.getElementById("editId").value;

    const ordem = {
        cliente: document.getElementById("cliente").value,
        telefone: document.getElementById("telefone").value,
        aparelho: document.getElementById("aparelho").value,
        modelo: document.getElementById("modelo").value,
        defeito: document.getElementById("defeito").value,
        valorPeca: document.getElementById("valorPeca").value || "0",
        maoObra: document.getElementById("maoObra").value || "0",
        fornecedor: document.getElementById("fornecedor").value,
        valor: document.getElementById("valor").value || "0",
        status: document.getElementById("status").value,
        pagamento: "Pendente",
        obs: document.getElementById("obs").value,
        obsPeca: document.getElementById("obsPeca").value,
        data: new Date().toLocaleDateString("pt-BR")
    };

    if(editId){
        await fetch(`${API}/ordens/${editId}`, {
            method:"PUT",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify(ordem)
        });
    }else{
        await fetch(`${API}/ordens`, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify(ordem)
        });
    }

    form.reset();
    document.getElementById("editId").value = "";
    document.getElementById("tituloForm").innerText = "Nova Ordem";
    document.getElementById("btnSalvar").innerHTML = `<i data-lucide="save"></i> Salvar ordem`;
    lucide.createIcons();

    await carregarOrdens();

    alert("Ordem salva com sucesso!");
});

function renderizar(){
    lista.innerHTML = "";

    const busca = document.getElementById("busca")?.value.toLowerCase() || "";
    const filtroStatus = document.getElementById("filtroStatus")?.value || "";

    const filtradas = ordens.filter(os => {
        const texto = `${os.cliente} ${os.telefone} ${os.aparelho} ${os.modelo} ${os.defeito} ${os.fornecedor}`.toLowerCase();
        return texto.includes(busca) && (filtroStatus === "" || os.status === filtroStatus);
    });

    atualizarContadores();

    totalOS.innerText = `${filtradas.length} OS`;

    if(filtradas.length === 0){
        lista.innerHTML = `<p>Nenhuma ordem encontrada.</p>`;
        return;
    }

    filtradas.forEach(os => {
        const statusClasse = os.status ? os.status.split(" ")[0] : "Recebido";

        lista.innerHTML += `
            <div class="os-item">
                <div class="os-info">
                    <strong>${os.aparelho || "Aparelho"} ${os.modelo || ""}</strong>
                    <p>Cliente: ${os.cliente} • WhatsApp: ${os.telefone}</p>
                    <p>Defeito: ${os.defeito || "Não informado"}</p>
                    <p>Peça: R$ ${os.valorPeca || "0,00"} • Mão de obra: R$ ${os.maoObra || "0,00"}</p>
                    <p>Total: R$ ${os.valor || "0,00"}</p>
                    <p>Fornecedor: ${os.fornecedor || "Não informado"}</p>
                    <p>Data: ${os.data || ""}</p>
                </div>

                <div class="actions">
                    <span class="badge ${statusClasse}">${os.status || "Recebido"}</span>

                    <select onchange="alterarStatus(${os.id}, this.value)">
                        <option>Alterar status</option>
                        <option>Recebido</option>
                        <option>Diagnóstico</option>
                        <option>Aguardando aprovação</option>
                        <option>Em reparo</option>
                        <option>Pronto</option>
                        <option>Entregue</option>
                    </select>

                    <button onclick="editarOS(${os.id})">Editar</button>
                    <button onclick="enviarWhatsApp(${os.id})">WhatsApp</button>
                    <button onclick="gerarPDF(${os.id})">PDF OS</button>
                    <button class="delete-btn" onclick="excluirOS(${os.id})">Excluir</button>
                </div>
            </div>
        `;
    });
}

function atualizarContadores(){
    document.getElementById("totalGeral").innerText = ordens.length;
    document.getElementById("totalReparo").innerText = ordens.filter(os => os.status === "Em reparo").length;
    document.getElementById("totalPronto").innerText = ordens.filter(os => os.status === "Pronto").length;
    document.getElementById("totalEntregue").innerText = ordens.filter(os => os.status === "Entregue").length;
}

function editarOS(id){
    const os = ordens.find(item => item.id === id);

    document.getElementById("editId").value = os.id;
    document.getElementById("cliente").value = os.cliente || "";
    document.getElementById("telefone").value = os.telefone || "";
    document.getElementById("aparelho").value = os.aparelho || "";
    document.getElementById("modelo").value = os.modelo || "";
    document.getElementById("defeito").value = os.defeito || "";
    document.getElementById("valorPeca").value = os.valorPeca || "0";
    document.getElementById("maoObra").value = os.maoObra || "0";
    document.getElementById("fornecedor").value = os.fornecedor || "";
    document.getElementById("valor").value = os.valor || "0";
    document.getElementById("status").value = os.status || "Recebido";
    document.getElementById("obs").value = os.obs || "";
    document.getElementById("obsPeca").value = os.obsPeca || "";

    document.getElementById("tituloForm").innerText = "Editando Ordem";
    document.getElementById("btnSalvar").innerHTML = "Atualizar ordem";

    window.scrollTo({ top:0, behavior:"smooth" });
}

async function alterarStatus(id, novoStatus){
    if(novoStatus === "Alterar status") return;

    await fetch(`${API}/ordens/${id}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ status: novoStatus })
    });

    await carregarOrdens();
}

function enviarWhatsApp(id){
    const os = ordens.find(item => item.id === id);

    let telefone = String(os.telefone || "").replace(/\D/g, "");

    if(!telefone.startsWith("55")){
        telefone = "55" + telefone;
    }

    const mensagem = encodeURIComponent(
`Olá, ${os.cliente}! Aqui é da BROTHERS CELULARES.

Sua ordem de serviço foi atualizada.

Aparelho: ${os.aparelho} ${os.modelo}
Defeito: ${os.defeito}
Status atual: ${os.status}
Total: R$ ${os.valor || "0,00"}

Obrigado por confiar na BROTHERS CELULARES.`
    );

    window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
}

async function excluirOS(id){
    const confirmar = confirm("Excluir ordem?");
    if(!confirmar) return;

    await fetch(`${API}/ordens/${id}`, { method:"DELETE" });
    await carregarOrdens();
}

function gerarPDF(id){
    const os = ordens.find(item => item.id === id);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const total = os.valor || "0,00";

    doc.setFillColor(250, 248, 244);
    doc.rect(0, 0, 210, 297, "F");

    doc.setFillColor(18, 18, 18);
    doc.roundedRect(12, 12, 186, 38, 6, 6, "F");

    doc.setTextColor(255,255,255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("BROTHERS CELULARES", 22, 29);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Assistência Técnica Especializada", 22, 38);

    doc.setFontSize(11);
    doc.text(`OS #${os.id}`, 160, 27);
    doc.text(`${os.data || ""}`, 160, 37);

    doc.setTextColor(25,25,25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Ordem de Serviço", 15, 70);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110,110,110);
    doc.text("Documento de entrada e acompanhamento do aparelho", 15, 78);

    doc.setFillColor(255,255,255);
    doc.roundedRect(15, 90, 180, 42, 5, 5, "F");

    doc.setTextColor(150,120,65);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DADOS DO CLIENTE", 25, 104);

    doc.setTextColor(25,25,25);
    doc.setFontSize(11);
    doc.text(`Cliente: ${os.cliente || ""}`, 25, 116);
    doc.text(`WhatsApp: ${os.telefone || ""}`, 25, 126);

    doc.setFillColor(255,255,255);
    doc.roundedRect(15, 142, 180, 62, 5, 5, "F");

    doc.setTextColor(150,120,65);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DADOS DO APARELHO", 25, 156);

    doc.setTextColor(25,25,25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Aparelho: ${os.aparelho || ""}`, 25, 168);
    doc.text(`Modelo: ${os.modelo || ""}`, 25, 178);
    doc.text(`Defeito relatado: ${os.defeito || ""}`, 25, 188);
    doc.text(`Status: ${os.status || ""}`, 25, 198);

    doc.setFillColor(18,18,18);
    doc.roundedRect(15, 216, 180, 28, 5, 5, "F");

    doc.setTextColor(255,255,255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`VALOR TOTAL: R$ ${total}`, 25, 234);

    doc.save(`OS-${os.id}-${os.cliente}.pdf`);
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarOrdens();