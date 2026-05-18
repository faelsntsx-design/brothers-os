if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "https://brothers-os.onrender.com";

if(localStorage.getItem("tema") === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

const form = document.getElementById("formOS");
const lista = document.getElementById("listaOS");
const totalOS = document.getElementById("totalOS");

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

function dinheiroTexto(valor){
    return numero(valor).toLocaleString("pt-BR", {
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });
}

function calcularTotal(){
    const valorPeca = numero(document.getElementById("valorPeca").value);
    const maoObra = numero(document.getElementById("maoObra").value);

    document.getElementById("valor").value = dinheiroTexto(valorPeca + maoObra);
}

document.getElementById("valorPeca").addEventListener("input", calcularTotal);
document.getElementById("maoObra").addEventListener("input", calcularTotal);

async function carregarOrdens(){
    lista.innerHTML = "<p>Carregando ordens...</p>";

    try{
        const res = await fetch(`${API}/ordens?nocache=${Date.now()}`);

        if(!res.ok){
            throw new Error("Erro ao carregar ordens");
        }

        ordens = await res.json();
        renderizar();

    }catch(error){
        console.error(error);
        lista.innerHTML = "<p>Erro ao carregar ordens.</p>";
    }
}

form.addEventListener("submit", async function(e){
    e.preventDefault();

    const botao = document.getElementById("btnSalvar");
    botao.disabled = true;
    botao.innerText = "Salvando...";

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

    try{
        const url = editId ? `${API}/ordens/${editId}` : `${API}/ordens`;
        const metodo = editId ? "PUT" : "POST";

        const res = await fetch(url, {
            method: metodo,
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify(ordem)
        });

        if(!res.ok){
            const erro = await res.text();
            throw new Error(erro);
        }

        cancelarEdicao();
        await carregarOrdens();

        alert(editId ? "Ordem atualizada com sucesso!" : "Ordem salva com sucesso!");

    }catch(error){
        console.error(error);
        alert("Erro ao salvar ordem.");

    }finally{
        botao.disabled = false;
        botao.innerHTML = `<i data-lucide="save"></i> Salvar ordem`;
        lucide.createIcons();
    }
});

function renderizar(){
    lista.innerHTML = "";

    const busca = document.getElementById("busca")?.value.toLowerCase() || "";
    const filtroStatus = document.getElementById("filtroStatus")?.value || "";

    const filtradas = ordens.filter(os => {
        const texto = `
            ${get(os,"cliente")}
            ${get(os,"telefone")}
            ${get(os,"aparelho")}
            ${get(os,"modelo")}
            ${get(os,"defeito")}
            ${get(os,"fornecedor")}
        `.toLowerCase();

        const status = get(os,"status") || "Recebido";

        return texto.includes(busca) && (filtroStatus === "" || status === filtroStatus);
    });

    atualizarContadores();

    totalOS.innerText = `${filtradas.length} OS`;

    if(filtradas.length === 0){
        lista.innerHTML = `<p>Nenhuma ordem encontrada.</p>`;
        return;
    }

    filtradas.forEach(os => {
        const id = get(os,"id");
        const status = get(os,"status") || "Recebido";
        const statusClasse = status.split(" ")[0];

        const valorPeca = dinheiroTexto(get(os,"valorPeca"));
        const maoObra = dinheiroTexto(get(os,"maoObra"));
        const total = dinheiroTexto(get(os,"valor"));

        lista.innerHTML += `
            <div class="os-item">
                <div class="os-info">
                    <strong>${get(os,"aparelho") || "Aparelho"} ${get(os,"modelo") || ""}</strong>

                    <p>Cliente: ${get(os,"cliente")} • WhatsApp: ${get(os,"telefone")}</p>
                    <p>Defeito: ${get(os,"defeito") || "Não informado"}</p>
                    <p>Peça: R$ ${valorPeca} • Mão de obra: R$ ${maoObra}</p>
                    <p>Total: R$ ${total}</p>
                    <p>Fornecedor: ${get(os,"fornecedor") || "Não informado"}</p>
                    <p>Obs peça: ${get(os,"obsPeca") || "Sem observação"}</p>
                    <p>Data: ${get(os,"data") || ""}</p>
                </div>

                <div class="actions">
                    <span class="badge ${statusClasse}">${status}</span>

                    <select onchange="alterarStatus('${id}', this.value)">
                        <option>Alterar status</option>
                        <option>Recebido</option>
                        <option>Diagnóstico</option>
                        <option>Aguardando aprovação</option>
                        <option>Em reparo</option>
                        <option>Pronto</option>
                        <option>Entregue</option>
                    </select>

                    <button type="button" onclick="editarOS('${id}')">Editar</button>
                    <button type="button" onclick="enviarWhatsApp('${id}')">WhatsApp</button>
                    <button type="button" onclick="gerarPDF('${id}')">PDF OS</button>
                    <button type="button" class="delete-btn" onclick="excluirOS('${id}')">Excluir</button>
                </div>
            </div>
        `;
    });
}

function atualizarContadores(){
    document.getElementById("totalGeral").innerText = ordens.length;
    document.getElementById("totalReparo").innerText = ordens.filter(os => get(os,"status") === "Em reparo").length;
    document.getElementById("totalPronto").innerText = ordens.filter(os => get(os,"status") === "Pronto").length;
    document.getElementById("totalEntregue").innerText = ordens.filter(os => get(os,"status") === "Entregue").length;
}

function pegarOS(id){
    return ordens.find(os => String(get(os,"id")) === String(id));
}

function editarOS(id){
    const os = pegarOS(id);

    if(!os){
        alert("Ordem não encontrada.");
        return;
    }

    document.getElementById("editId").value = get(os,"id");
    document.getElementById("cliente").value = get(os,"cliente");
    document.getElementById("telefone").value = get(os,"telefone");
    document.getElementById("aparelho").value = get(os,"aparelho");
    document.getElementById("modelo").value = get(os,"modelo");
    document.getElementById("defeito").value = get(os,"defeito");
    document.getElementById("valorPeca").value = dinheiroTexto(get(os,"valorPeca"));
    document.getElementById("maoObra").value = dinheiroTexto(get(os,"maoObra"));
    document.getElementById("fornecedor").value = get(os,"fornecedor");
    document.getElementById("valor").value = dinheiroTexto(get(os,"valor"));
    document.getElementById("status").value = get(os,"status") || "Recebido";
    document.getElementById("obs").value = get(os,"obs");
    document.getElementById("obsPeca").value = get(os,"obsPeca");

    document.getElementById("tituloForm").innerText = "Editando Ordem";
    document.getElementById("btnSalvar").innerText = "Atualizar ordem";

    window.scrollTo({ top:0, behavior:"smooth" });
}

function cancelarEdicao(){
    form.reset();

    document.getElementById("editId").value = "";
    document.getElementById("tituloForm").innerText = "Nova Ordem";
    document.getElementById("btnSalvar").innerHTML = `<i data-lucide="save"></i> Salvar ordem`;

    lucide.createIcons();
}

async function alterarStatus(id, novoStatus){
    if(novoStatus === "Alterar status") return;

    try{
        const res = await fetch(`${API}/ordens/${id}`, {
            method:"PUT",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ status: novoStatus })
        });

        if(!res.ok){
            const erro = await res.text();
            throw new Error(erro);
        }

        await carregarOrdens();

    }catch(error){
        console.error(error);
        alert("Erro ao alterar status.");
    }
}

function enviarWhatsApp(id){
    const os = pegarOS(id);

    if(!os){
        alert("Ordem não encontrada.");
        return;
    }

    let telefone = String(get(os,"telefone") || "").replace(/\D/g, "");

    if(!telefone){
        alert("Telefone do cliente não informado.");
        return;
    }

    if(!telefone.startsWith("55")){
        telefone = "55" + telefone;
    }

    const mensagem = encodeURIComponent(
`Olá, ${get(os,"cliente")}! Aqui é da BROTHERS CELULARES.

Sua ordem de serviço foi atualizada.

Aparelho: ${get(os,"aparelho")} ${get(os,"modelo")}
Defeito: ${get(os,"defeito")}
Status atual: ${get(os,"status")}
Total: R$ ${dinheiroTexto(get(os,"valor"))}

Obrigado por confiar na BROTHERS CELULARES.`
    );

    window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
}

async function excluirOS(id){
    const confirmar = confirm("Excluir ordem?");
    if(!confirmar) return;

    try{
        const res = await fetch(`${API}/ordens/${id}`, {
            method:"DELETE"
        });

        if(!res.ok){
            const erro = await res.text();
            throw new Error(erro);
        }

        await carregarOrdens();

    }catch(error){
        console.error(error);
        alert("Erro ao excluir ordem.");
    }
}

function gerarPDF(id){
    const os = pegarOS(id);

    if(!os){
        alert("Ordem não encontrada.");
        return;
    }

    if(!window.jspdf){
        alert("Biblioteca PDF não carregou. Atualize a página com Ctrl + F5.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const total = dinheiroTexto(get(os,"valor"));

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
    doc.text(`OS #${get(os,"id")}`, 160, 27);
    doc.text(`${get(os,"data") || ""}`, 160, 37);

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
    doc.text(`Cliente: ${get(os,"cliente") || ""}`, 25, 116);
    doc.text(`WhatsApp: ${get(os,"telefone") || ""}`, 25, 126);

    doc.setFillColor(255,255,255);
    doc.roundedRect(15, 142, 180, 62, 5, 5, "F");

    doc.setTextColor(150,120,65);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DADOS DO APARELHO", 25, 156);

    doc.setTextColor(25,25,25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Aparelho: ${get(os,"aparelho") || ""}`, 25, 168);
    doc.text(`Modelo: ${get(os,"modelo") || ""}`, 25, 178);
    doc.text(`Defeito relatado: ${get(os,"defeito") || ""}`, 25, 188);
    doc.text(`Status: ${get(os,"status") || ""}`, 25, 198);

    doc.setFillColor(18,18,18);
    doc.roundedRect(15, 216, 180, 28, 5, 5, "F");

    doc.setTextColor(255,255,255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`VALOR TOTAL: R$ ${total}`, 25, 234);

    doc.save(`OS-${get(os,"id")}-${get(os,"cliente")}.pdf`);
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarOrdens();