const body = document.body;

/* CARREGAR TEMA */

window.onload = () => {

    const temaSalvo = localStorage.getItem("tema");

    if(temaSalvo === "light"){

        body.classList.add("light");

    }

}

/* SOM ERRO */

function tocarErro(){

    let audio = new Audio(
    "https://www.soundjay.com/buttons/sounds/beep-10.mp3"
    );

    audio.volume = 1;

    audio.play();

}

/* SOM SUCESSO */

function tocarSucesso(){

    let audio = new Audio(
    "https://www.soundjay.com/buttons/sounds/button-3.mp3"
    );

    audio.volume = 1;

    audio.play();

}

/* LOGIN */

function entrar(){

    let login = document.getElementById("login").value;

    let senha = document.getElementById("senha").value;

    let loader = document.getElementById("loader");

    let mensagem = document.getElementById("mensagem");

    mensagem.innerHTML = "";

    loader.style.display = "block";

    setTimeout(() => {

        loader.style.display = "none";

        if(login === "R1000" && senha === "0001R"){
             localStorage.setItem("logado", "sim");

            tocarSucesso();

            mensagem.innerHTML =

            `
            <div class="success-icon">✓</div>

            <div class="success-text">

            LOGIN EFETUADO COM SUCESSO<br><br>

            Redirecionando para BROTHERS OS...

            </div>
            `;

            setTimeout(() => {

                window.location.href = "pages/dashboard.html";

            },2000);

        }else{

            tocarErro();

            mensagem.innerHTML =

            `
            <div class="error-icon">✕</div>

            <div class="error-text">

            ACESSO NEGADO<br><br>

            Login ou senha incorretos.

            </div>
            `;

        }

    },3000);

}

/* TROCAR TEMA */

function trocarTema(){

    body.classList.toggle("light");

    if(body.classList.contains("light")){

        localStorage.setItem("tema","light");

    }else{

        localStorage.setItem("tema","dark");

    }

}