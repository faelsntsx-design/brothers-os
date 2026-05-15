if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "https://brothers-os.onrender.com";

if(localStorage.getItem("tema") === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

let ordens = [];

async function carregarWhatsApp(){
    const res = await fetch(`${API}/ordens`);
    ordens = await res.json();
    renderizarWhatsApp();
}

function renderizarWhatsApp(){
    const lista = document.getElementById("listaWhats");
    const busca = document.getElementById("buscaWhats").value.toLowerCase();

    const filtrados = ordens.filter(os => {
        const texto = `${os.cliente} ${os.telefone} ${os.aparelho} ${os.modelo} ${os.status}`.toLowerCase();
        return texto.includes(busca);
    });

    lista.innerHTML = "";

    if(filtrados.length === 0){
        lista.innerHTML = "<p>Nenhum cliente encontrado.</p>";
        return;
    }

    filtrados.forEach(os => {
        lista.innerHTML += `
            <div class="cliente-card">
                <div class="cliente-top">
                    <div style="display:flex; gap:14px; align-items:center;">
                        <div class="avatar">W</div>
                        <div>
                            <h4>${os.cliente}</h4>
                            <p>${os.telefone}</p>
                        </div>
                    </div>
                </div>

                <p>Aparelho: ${os.aparelho || ""} ${os.modelo || ""}</p>
                <p>Status: ${os.status || "Recebido"}</p>

                <button class="whats-btn" onclick="enviarMensagem(${os.id})">
                    Enviar atualização
                </button>
            </div>
        `;
    });
}

function enviarMensagem(id){
    const os = ordens.find(item => item.id === id);

    let telefone = String(os.telefone || "").replace(/\D/g, "");

    if(!telefone.startsWith("55")){
        telefone = "55" + telefone;
    }

    const mensagem = encodeURIComponent(
`Olá, ${os.cliente}! Aqui é da BROTHERS CELULARES.

Atualização da sua ordem de serviço:

Aparelho: ${os.aparelho} ${os.modelo}
Status atual: ${os.status}
Valor total: R$ ${os.valor || "0,00"}

Obrigado por confiar na BROTHERS CELULARES.`
    );

    window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarWhatsApp();