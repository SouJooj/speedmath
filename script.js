// Variáveis globais
let tempoJogada = 0;
let intervalo = 0;
let respostaCorreta = 0;
let acertos = 0;
let erros = 0;
let temporizador = null;
let contas = [];
let operacoesSelecionadas = [];
let grafico;

// Função para gerar operação aleatória
function gerarOperacao() {
    const operacoes = operacoesSelecionadas;
    let num1, num2;
    const operador = operacoes[Math.floor(Math.random() * operacoes.length)];

    do {
        num1 = Math.floor(Math.random() * (intervalo - 1)) + 2; // Evita 1
        num2 = Math.floor(Math.random() * (intervalo - 1)) + 2; // Evita 1
    } while (operador === '/' && (num1 % num2 !== 0 || num1 === num2));

    if (operador === '/') {
        // Ajusta para divisão exata e evita números iguais
        respostaCorreta = num1 / num2;
        document.getElementById('operacao').innerText = `${num1} ÷ ${num2}`;
    } else if (operador === '-') {
        // Garante que o primeiro número seja maior para evitar números negativos
        const maior = Math.max(num1, num2);
        const menor = Math.min(num1, num2);
        respostaCorreta = maior - menor;
        document.getElementById('operacao').innerText = `${maior} − ${menor}`;
    } else {
        respostaCorreta = eval(`${num1} ${operador} ${num2}`);
        const operadorTexto = operador === '*' ? '×' : operador; // Ajusta símbolo de multiplicação
        document.getElementById('operacao').innerText = `${num1} ${operadorTexto} ${num2}`;
    }
}

// Função para verificar resposta do usuário
function verificarResposta() {
    const respostaUsuario = parseInt(document.getElementById('resposta').value);
    const operacao = document.getElementById('operacao').innerText;

    if (respostaUsuario === respostaCorreta) {
        acertos++;
        contas.push({ operacao, respostaUsuario, correto: true, respostaCorreta });
    } else {
        erros++;
        contas.push({ operacao, respostaUsuario, correto: false, respostaCorreta });
    }

    document.getElementById('resposta').value = '';
    gerarOperacao();
    atualizarGrafico();
}

// Função para iniciar o temporizador
function iniciarTemporizador() {
    let tempoRestante = tempoJogada;
    document.getElementById('temporizador').innerText = `${tempoRestante}`;

    temporizador = setInterval(() => {
        tempoRestante--;
        document.getElementById('temporizador').innerText = `${tempoRestante}`;

        if (tempoRestante <= 0) {
            clearInterval(temporizador);
            finalizarJogo();
        }
    }, 1000);
}

// Função para atualizar o gráfico
function atualizarGrafico() {
    if (grafico) {
        grafico.destroy();
    }

    const ctx = document.getElementById('grafico').getContext('2d');
    grafico = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Acertos', 'Erros'],
            datasets: [{
                data: [acertos, erros],
                backgroundColor: ['rgba(0, 255, 0, 0.5)', 'rgba(255, 0, 0, 0.5)'],
                borderColor: ['rgba(0, 255, 0, 1)', 'rgba(255, 0, 0, 1)'],
                borderWidth: 1
            }]
        }
    });
}

// Função para finalizar o jogo
function finalizarJogo() {
    document.querySelector('.jogo').style.display = 'none';
    document.querySelector('.resultado').style.display = 'block';
    atualizarGrafico();
    atualizarContas();
}

// Função para atualizar as contas exibidas
function atualizarContas() {
    const contasContainer = document.getElementById('contas');
    contasContainer.innerHTML = '';

    contas.forEach(({ operacao, respostaUsuario, correto, respostaCorreta }) => {
        const cor = correto ? 'green' : 'red';
        const status = correto ? 'Correto' : `Errado (Correto: ${respostaCorreta})`;
        contasContainer.innerHTML += `
            <p style="color: ${cor};">
                ${operacao} = ${respostaUsuario} (${status})
            </p>
        `;
    });

    // Calcula as porcentagens
    const total = acertos + erros;
    const porcentagemAcertos = ((acertos / total) * 100).toFixed(2);
    const porcentagemErros = ((erros / total) * 100).toFixed(2);

    // Exibe as estatísticas gerais
    contasContainer.innerHTML += `
        <hr>
        <p style="color: green;">Acertos: ${acertos} (${porcentagemAcertos}%)</p>
        <p style="color: red;">Erros: ${erros} (${porcentagemErros}%)</p>
    `;
}

// Função para reiniciar o jogo
function reiniciarJogo() {
    acertos = 0;
    erros = 0;
    contas = [];
    operacoesSelecionadas = [];
    document.querySelector('.config').style.display = 'block';
    document.querySelector('.resultado').style.display = 'none';
}

// Eventos
document.getElementById('start').addEventListener('click', () => {
    operacoesSelecionadas = Array.from(document.querySelectorAll('.operation:checked')).map(input => input.value);

    if (operacoesSelecionadas.length === 0) {
        alert('Por favor, selecione pelo menos uma operação!');
        return;
    }

    intervalo = parseInt(document.getElementById('max').value);
    tempoJogada = parseInt(document.getElementById('time-select').value);

    document.querySelector('.config').style.display = 'none';
    document.querySelector('.jogo').style.display = 'block';

    gerarOperacao();
    iniciarTemporizador();
});

document.getElementById('reiniciar').addEventListener('click', () => {
    location.reload(); // Recarrega a página para reiniciar o jogo
});
document.getElementById('voltar').addEventListener('click', reiniciarJogo);
document.getElementById('exibir-contas').addEventListener('click', () => {
    const contasContainer = document.getElementById('contas');
    contasContainer.style.display = contasContainer.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('resposta').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        verificarResposta();
    }
});
document.getElementById('min').addEventListener('input', function (e) {
    this.value = this.value.replace(/[^0-9]/g, '');
});

document.getElementById('max').addEventListener('input', function (e) {
    this.value = this.value.replace(/[^0-9]/g, '');
});