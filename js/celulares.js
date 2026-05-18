if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "https://brothers-os.onrender.com";

if(localStorage.getItem("tema") === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

let celulares = [];
let celularSelecionado = null;

const form = document.getElementById("formCelular");
const lista = document.getElementById("listaCelulares");

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

async function carregarCelulares(){
    lista.innerHTML = "<p>Carregando celulares...</p>";

    const res = await fetch(`${API}/celulares`);
    celulares = await res.json();

    renderizarCelulares();
    atualizarResumo();
}

form.addEventListener("submit", async function(e){
    e.preventDefault();

    const celular = {
        marca: document.getElementById("marca").value,
        modelo: document.getElementById("modelo").value,
        memoria: document.getElementById("memoria").value,
        cor: document.getElementById("cor").value,
        estado: document.getElementById("estado").value,
        valorCompra: document.getElementById("valorCompra").value,
        valorVenda: document.getElementById("valorVenda").value,
        observacao: document.getElementById("observacao").value,
        dataCadastro: new Date().toLocaleDateString("pt-BR")
    };

    await fetch(`${API}/celulares`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(celular)
    });

    form.reset();
    await carregarCelulares();

    alert("Celular cadastrado com sucesso!");
});

function atualizarResumo(){
    const disponiveis = celulares.filter(c => campo(c,"status") === "Disponível");
    const vendidos = celulares.filter(c => campo(c,"status") === "Vendido");

    const valorDisponivel = disponiveis.reduce((soma,c) => soma + numero(campo(c,"valorVenda")), 0);
    const valorVendido = vendidos.reduce((soma,c) => soma + numero(campo(c,"valorVenda")), 0);

    document.getElementById("totalDisponiveis").innerText = disponiveis.length;
    document.getElementById("totalVendidos").innerText = vendidos.length;
    document.getElementById("valorDisponivel").innerText = moeda(valorDisponivel);
    document.getElementById("valorVendido").innerText = moeda(valorVendido);
}

function renderizarCelulares(){
    const busca = document.getElementById("buscaCelular").value.toLowerCase();

    const filtrados = celulares.filter(c => {
        const texto = `
            ${campo(c,"marca")}
            ${campo(c,"modelo")}
            ${campo(c,"memoria")}
            ${campo(c,"cor")}
            ${campo(c,"estado")}
            ${campo(c,"comprador")}
        `.toLowerCase();

        return texto.includes(busca);
    });

    lista.innerHTML = "";

    if(filtrados.length === 0){
        lista.innerHTML = "<p>Nenhum celular cadastrado.</p>";
        return;
    }

    filtrados.forEach(c => {
        const id = campo(c,"id");
        const status = campo(c,"status") || "Disponível";

        lista.innerHTML += `
            <div class="celular-item">
                <div>
                    <strong>${campo(c,"marca")} ${campo(c,"modelo")} • ${campo(c,"memoria")}</strong>

                    <p>Cor: ${campo(c,"cor") || "Não informado"} • Estado: ${campo(c,"estado") || "Não informado"}</p>

                    <p>Compra: ${moeda(numero(campo(c,"valorCompra")))} • Venda: ${moeda(numero(campo(c,"valorVenda")))}</p>

                    <p>Obs: ${campo(c,"observacao") || "Sem observação"}</p>

                    ${status === "Vendido" ? `
                        <p>Comprador: ${campo(c,"comprador") || ""}</p>
                        <p>CPF: ${campo(c,"cpfComprador") || ""} • WhatsApp: ${campo(c,"telefoneComprador") || ""}</p>
                        <p>Data venda: ${campo(c,"dataVenda") || ""} • Garantia: ${campo(c,"garantia") || "3 meses"}</p>
                    ` : ""}

                    <span class="badge ${status}">${status}</span>
                </div>

                <div class="actions">
                    ${status === "Disponível" ? `
                        <button onclick="abrirModalVenda(${id})">Marcar vendido</button>
                    ` : `
                        <button onclick="gerarComprovante(${id})">PDF venda</button>
                        <button onclick="enviarWhatsApp(${id})">WhatsApp</button>
                    `}

                    <button class="delete-btn" onclick="excluirCelular(${id})">Excluir</button>
                </div>
            </div>
        `;
    });
}

function abrirModalVenda(id){
    celularSelecionado = id;
    document.getElementById("modalVenda").style.display = "flex";
}

function fecharModal(){
    celularSelecionado = null;
    document.getElementById("modalVenda").style.display = "none";
}

async function confirmarVenda(){
    const venda = {
        comprador: document.getElementById("comprador").value,
        cpfComprador: document.getElementById("cpfComprador").value,
        telefoneComprador: document.getElementById("telefoneComprador").value,
        dataVenda: new Date().toLocaleDateString("pt-BR")
    };

    await fetch(`${API}/celulares/${celularSelecionado}/vender`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(venda)
    });

    document.getElementById("comprador").value = "";
    document.getElementById("cpfComprador").value = "";
    document.getElementById("telefoneComprador").value = "";

    fecharModal();
    await carregarCelulares();

    alert("Celular marcado como vendido!");
}

function gerarComprovante(id){
    const c = celulares.find(item => Number(campo(item,"id")) === Number(id));

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(250,248,244);
    doc.rect(0,0,210,297,"F");

    doc.setFillColor(18,18,18);
    doc.roundedRect(12,12,186,38,6,6,"F");

    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(21);
    doc.text("BROTHERS CELULARES",22,29);

    doc.setFont("helvetica","normal");
    doc.setFontSize(9);
    doc.text("Comprovante de venda de aparelho",22,38);

    doc.setTextColor(25,25,25);
    doc.setFont("helvetica","bold");
    doc.setFontSize(18);
    doc.text("Comprovante de Venda",15,70);

    doc.setFont("helvetica","normal");
    doc.setFontSize(10);
    doc.setTextColor(110,110,110);
    doc.text("Garantia de 3 meses para o aparelho vendido.",15,78);

    doc.setFillColor(255,255,255);
    doc.roundedRect(15,92,180,50,5,5,"F");

    doc.setTextColor(150,120,65);
    doc.setFont("helvetica","bold");
    doc.setFontSize(10);
    doc.text("DADOS DO COMPRADOR",25,106);

    doc.setTextColor(25,25,25);
    doc.setFontSize(11);
    doc.text(`Nome: ${campo(c,"comprador") || ""}`,25,118);
    doc.text(`CPF: ${campo(c,"cpfComprador") || ""}`,25,128);
    doc.text(`WhatsApp: ${campo(c,"telefoneComprador") || ""}`,25,138);

    doc.setFillColor(255,255,255);
    doc.roundedRect(15,154,180,64,5,5,"F");

    doc.setTextColor(150,120,65);
    doc.setFont("helvetica","bold");
    doc.setFontSize(10);
    doc.text("APARELHO VENDIDO",25,168);

    doc.setTextColor(25,25,25);
    doc.setFont("helvetica","normal");
    doc.setFontSize(11);
    doc.text(`Aparelho: ${campo(c,"marca")} ${campo(c,"modelo")}`,25,180);
    doc.text(`Memória: ${campo(c,"memoria")}`,25,190);
    doc.text(`Cor: ${campo(c,"cor")}`,25,200);
    doc.text(`Estado: ${campo(c,"estado")}`,25,210);

    doc.setFillColor(18,18,18);
    doc.roundedRect(15,232,180,28,5,5,"F");

    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(15);
    doc.text(`VALOR: ${moeda(numero(campo(c,"valorVenda")))}`,25,250);

    doc.addPage();

    doc.setFillColor(250,248,244);
    doc.rect(0,0,210,297,"F");

    doc.setFillColor(18,18,18);
    doc.roundedRect(12,12,186,34,6,6,"F");

    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(18);
    doc.text("Termo de Garantia",22,33);

    doc.setFillColor(255,255,255);
    doc.roundedRect(15,62,180,130,6,6,"F");

    doc.setTextColor(25,25,25);
    doc.setFont("helvetica","normal");
    doc.setFontSize(11);

    const termo = `
A BROTHERS CELULARES concede garantia de 3 meses para o aparelho vendido, válida a partir da data da compra.

A garantia cobre defeitos funcionais não causados por mau uso.

A garantia não cobre queda, contato com água, oxidação, tela quebrada, danos físicos, violação por terceiros, mau uso, carregadores inadequados ou alterações realizadas fora da loja.

Para acionar a garantia, o comprador deverá apresentar este comprovante e os dados informados no ato da compra.
`;

    doc.text(doc.splitTextToSize(termo,158),26,82);

    doc.setFont("helvetica","bold");
    doc.text(`Comprador: ${campo(c,"comprador") || ""}`,25,215);
    doc.text(`CPF: ${campo(c,"cpfComprador") || ""}`,25,227);
    doc.text(`Data da venda: ${campo(c,"dataVenda") || ""}`,25,239);

    doc.line(25,270,90,270);
    doc.line(120,270,185,270);

    doc.setFont("helvetica","normal");
    doc.setFontSize(8);
    doc.text("Assinatura do cliente",36,277);
    doc.text("BROTHERS CELULARES",134,277);

    doc.save(`Venda-${campo(c,"modelo")}-${campo(c,"comprador")}.pdf`);
}

function enviarWhatsApp(id){
    const c = celulares.find(item => Number(campo(item,"id")) === Number(id));

    let telefone = String(campo(c,"telefoneComprador") || "").replace(/\D/g,"");

    if(!telefone.startsWith("55")){
        telefone = "55" + telefone;
    }

    const mensagem = encodeURIComponent(
`Olá, ${campo(c,"comprador")}! Aqui é da BROTHERS CELULARES.

Resumo da sua compra:

Aparelho: ${campo(c,"marca")} ${campo(c,"modelo")}
Memória: ${campo(c,"memoria")}
Cor: ${campo(c,"cor")}
Valor: ${moeda(numero(campo(c,"valorVenda")))}
Garantia: 3 meses

Obrigado pela preferência!`
    );

    window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
}

async function excluirCelular(id){
    const confirmar = confirm("Excluir celular?");
    if(!confirmar) return;

    await fetch(`${API}/celulares/${id}`, { method:"DELETE" });
    await carregarCelulares();
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarCelulares();