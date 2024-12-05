// Variáveis globais
let tempoJogada = 30;
let intervalo = 0;
let respostaCorreta = 0;
let acertos = 0;
let erros = 0;
let temporizador = null;
let contas = [];
let operacoesSelecionadas = [];
let grafico;
let tempoInicioQuestao = 0; // Marca o início de cada questão
let temposPorQuestao = []; // Armazena os tempos de cada questão
const leaderboardKey = 'speedMathLeaderboard';

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
        respostaCorreta = num1 / num2;
        document.getElementById('operacao').innerText = `${num1} ÷ ${num2}`;
    } else if (operador === '-') {
        const maior = Math.max(num1, num2);
        const menor = Math.min(num1, num2);
        respostaCorreta = maior - menor;
        document.getElementById('operacao').innerText = `${maior} − ${menor}`;
    } else {
        respostaCorreta = eval(`${num1} ${operador} ${num2}`);
        const operadorTexto = operador === '*' ? '×' : operador;
        document.getElementById('operacao').innerText = `${num1} ${operadorTexto} ${num2}`;
    }

    tempoInicioQuestao = performance.now(); // Marca o início da nova questão
}


// Função para verificar resposta do usuário
function verificarResposta() {
    const respostaUsuario = parseInt(document.getElementById('resposta').value);
    const operacao = document.getElementById('operacao').innerText;
    const tempoResposta = performance.now() - tempoInicioQuestao; // Calcula o tempo de resposta
    temposPorQuestao.push(tempoResposta);

    if (respostaUsuario === respostaCorreta) {
        acertos++;
        contas.push({ operacao, respostaUsuario, correto: true, respostaCorreta, tempoResposta });
    } else {
        erros++;
        contas.push({ operacao, respostaUsuario, correto: false, respostaCorreta, tempoResposta });
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

// Função para calcular tempo médio por questão
function calcularTempoMedio() {
    const totalTempo = temposPorQuestao.reduce((acc, tempo) => acc + tempo, 0);
    const media = totalTempo / temposPorQuestao.length;
    return media.toFixed(2); // Retorna com 2 casas decimais
}

function atualizarGrafico() {
    const tempoMedio = calcularTempoMedio();

    const ctx = document.getElementById('grafico').getContext('2d');
    if (grafico) grafico.destroy();
    grafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Acertos', 'Erros', 'Tempo Médio (s)'],
            datasets: [{
                label: 'Resultados',
                data: [acertos, erros, (tempoMedio / 1000)], // Converte ms para segundos
                backgroundColor: ['#4AB2B5', '#F39C12', '#8E44AD'],
                borderColor: ['#4AB2B5', '#F39C12', '#8E44AD'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Função para finalizar o jogo
function finalizarJogo() {
    clearInterval(temporizador);
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

// Função para salvar no leaderboard
function salvarNoLeaderboard() {
    const nomeJogador = document.getElementById('nome-jogador').value.trim();

    if (!nomeJogador) {
        alert('Por favor, insira seu nome antes de salvar no leaderboard.');
        return;
    }

    if (tempoJogada === 0 || isNaN(tempoJogada)) {
        alert('Jogos com cronômetro desligado não são salvos no leaderboard.');
        return;
    }

    const tempoMedio = calcularTempoMedio();
    const resultado = {
        jogador: nomeJogador,
        acertos,
        erros,
        tempoMedio: (tempoMedio / 1000).toFixed(2),
        operacoes: operacoesSelecionadas.join(', '),
        data: new Date().toLocaleString()
    };

    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    leaderboard.push(resultado);
    leaderboard.sort((a, b) => b.acertos - a.acertos);
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));

    alert('Resultado salvo no leaderboard!');
}

// Função para exibir o leaderboard (com botão excluir)
function exibirLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>Nenhum jogo salvo ainda!</li>';
        return;
    }

    leaderboard.forEach((entry, index) => {
        leaderboardList.innerHTML += `
            <li>
                <strong>${index + 1}. ${entry.jogador}</strong><br>
                Acertos: ${entry.acertos}<br>
                Erros: ${entry.erros}<br>
                Tempo Médio: ${entry.tempoMedio}s<br>
                Operações: ${entry.operacoes}<br>
                Data: ${entry.data}<br>
                <button onclick="excluirDoLeaderboard(${index})" class="delete-btn">Excluir</button>
            </li>
        `;
    });

    document.querySelector('.resultado').style.display = 'none';
    document.querySelector('.leaderboard').style.display = 'block';
}


// Função para excluir uma entrada do leaderboard
function excluirDoLeaderboard(index) {
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    if (index >= 0 && index < leaderboard.length) {
        leaderboard.splice(index, 1); // Remove a entrada do array
        localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard)); // Atualiza o localStorage
        exibirLeaderboard(); // Atualiza a interface
    }
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

document.getElementById('finalizar').addEventListener('click', finalizarJogo);

// Evento do botão de salvar no leaderboard
document.getElementById('salvar-leaderboard').addEventListener('click', salvarNoLeaderboard);

// Botão "Voltar ao Menu" no Leaderboard
document.getElementById('voltar-menu').addEventListener('click', () => {
    document.querySelector('.leaderboard').style.display = 'none';
    document.querySelector('.config').style.display = 'block';
});


// Botão "Leaderboard" na tela principal
document.getElementById('leaderboard-main').addEventListener('click', () => {
    document.querySelector('.config').style.display = 'none';
    document.querySelector('.leaderboard').style.display = 'block';
    exibirLeaderboard();
});