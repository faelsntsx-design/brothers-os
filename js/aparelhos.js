if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "http://localhost:3000";

if(localStorage.getItem("tema") === "light"){
    document.body.classList.add("light");
}

lucide.createIcons();

let ordens = [];

async function carregarAparelhos(){
    const res = await fetch(`${API}/ordens`);
    ordens = await res.json();
    renderizarAparelhos();
}

function renderizarAparelhos(){
    const lista = document.getElementById("listaAparelhos");
    const busca = document.getElementById("buscaAparelho").value.toLowerCase();

    const filtrados = ordens.filter(os => {
        const texto = `${os.aparelho} ${os.modelo} ${os.cliente} ${os.status} ${os.defeito}`.toLowerCase();
        return texto.includes(busca);
    });

    lista.innerHTML = "";

    if(filtrados.length === 0){
        lista.innerHTML = "<p>Nenhum aparelho encontrado.</p>";
        return;
    }

    filtrados.forEach(os => {
        lista.innerHTML += `
            <div class="cliente-card">
                <div class="cliente-top">
                    <div style="display:flex; gap:14px; align-items:center;">
                        <div class="avatar">📱</div>
                        <div>
                            <h4>${os.aparelho || "Aparelho"} ${os.modelo || ""}</h4>
                            <p>${os.cliente || "Cliente não informado"}</p>
                        </div>
                    </div>
                </div>

                <p>Defeito: ${os.defeito || "Não informado"}</p>
                <p>Status: ${os.status || "Recebido"}</p>
                <p>Data: ${os.data || ""}</p>

                <button class="whats-btn" onclick="window.location.href='ordens.html'">
                    Ver nas ordens
                </button>
            </div>
        `;
    });
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarAparelhos();