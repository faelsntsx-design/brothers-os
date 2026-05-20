if(localStorage.getItem("logado") !== "sim"){
    window.location.href = "../index.html";
}

const API = "https://brothers-os.onrender.com";

lucide.createIcons();

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

function hoje(){
    return new Date().toLocaleDateString("pt-BR");
}

async function carregarCaixa(){
    const [ordensRes, vendasRes, celularesRes, fechamentosRes] = await Promise.all([
        fetch(`${API}/ordens`),
        fetch(`${API}/vendas`),
        fetch(`${API}/celulares`),
        fetch(`${API}/fechamentos`)
    ]);

    const ordens = await ordensRes.json();
    const vendas = await vendasRes.json();
    const celulares = await celularesRes.json();
    const fechamentos = await fechamentosRes.json();

    const dataHoje = hoje();

    const ordensHoje = ordens.filter(o =>
        o.data === dataHoje &&
        (o.status === "Pronto" || o.status === "Entregue")
    );

    const vendasHoje = vendas.filter(v => v.data === dataHoje);

    const celularesHoje = celulares.filter(c =>
        c.datavenda === dataHoje || c.dataVenda === dataHoje
    );

    const totalOS = ordensHoje.reduce((soma,o) => soma + numero(o.valor), 0);
    const totalVendas = vendasHoje.reduce((soma,v) => soma + numero(v.valor), 0);
    const totalCelulares = celularesHoje.reduce((soma,c) => soma + numero(c.valorvenda || c.valorVenda), 0);

    const total = totalOS + totalVendas + totalCelulares;

    const pix =
        vendasHoje.filter(v => v.pagamento === "Pix").reduce((s,v)=>s+numero(v.valor),0);

    const dinheiro =
        vendasHoje.filter(v => v.pagamento === "Dinheiro").reduce((s,v)=>s+numero(v.valor),0);

    const cartao =
        vendasHoje.filter(v => v.pagamento === "Cartão").reduce((s,v)=>s+numero(v.valor),0);

    document.getElementById("totalOS").innerText = moeda(totalOS);
    document.getElementById("totalVendas").innerText = moeda(totalVendas);
    document.getElementById("totalCelulares").innerText = moeda(totalCelulares);
    document.getElementById("totalGeral").innerText = moeda(total);
    document.getElementById("totalPix").innerText = moeda(pix);
    document.getElementById("totalDinheiro").innerText = moeda(dinheiro);
    document.getElementById("totalCartao").innerText = moeda(cartao);

    const lista = document.getElementById("listaFechamentos");
    lista.innerHTML = "";

    fechamentos.forEach(f => {
        lista.innerHTML += `
            <div class="fechamento-item">
                <strong>${f.data}</strong>
                <p>Total: ${moeda(numero(f.total))}</p>
                <p>Pix: ${moeda(numero(f.pix))}</p>
                <p>Dinheiro: ${moeda(numero(f.dinheiro))}</p>
                <p>Cartão: ${moeda(numero(f.cartao))}</p>
                <p>${f.observacao || ""}</p>
            </div>
        `;
    });
}

async function fecharCaixa(){
    const fechamento = {
        id: Date.now(),
        data: hoje(),
        total: document.getElementById("totalGeral").innerText,
        pix: document.getElementById("totalPix").innerText,
        dinheiro: document.getElementById("totalDinheiro").innerText,
        cartao: document.getElementById("totalCartao").innerText,
        observacao: document.getElementById("obsFechamento").value,
        horario: new Date().toLocaleTimeString("pt-BR")
    };

    await fetch(`${API}/fechamentos`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(fechamento)
    });

    document.getElementById("obsFechamento").value = "";

    alert("Caixa fechado com sucesso!");

    carregarCaixa();
}

function sair(){
    localStorage.removeItem("logado");
    window.location.href = "../index.html";
}

carregarCaixa();