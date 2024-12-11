let tempoJogada = 30; // Define o tempo inicial de duração de uma jogada (em segundos).
let intervalo = 0; // Intervalo numérico para gerar os números das operações matemáticas.
let respostaCorreta = 0; // Armazena a resposta correta da operação gerada.
let acertos = 0; // Contador de respostas corretas do jogador.
let erros = 0; // Contador de respostas erradas do jogador.
let temporizador = null; // Referência para o temporizador em execução.
let contas = []; // Armazena o histórico de contas resolvidas pelo jogador.
let operacoesSelecionadas = []; // Operações matemáticas escolhidas pelo jogador.
let grafico; // Referência para o gráfico de resultados.
let tempoInicioQuestao = 0; // Tempo de início de uma questão para cálculo do tempo de resposta.
let temposPorQuestao = []; // Lista com os tempos de resposta de cada questão.
const leaderboardKey = 'speedMathLeaderboard'; // Chave para armazenar o leaderboard no localStorage.

// Função que gera uma operação matemática aleatória com base nas operações selecionadas pelo jogador.
function gerarOperacao() {
    const operacoes = operacoesSelecionadas; // Operações disponíveis.
    let num1, num2; // Números da operação.
    const operador = operacoes[Math.floor(Math.random() * operacoes.length)]; // Escolhe um operador aleatório.

    do {
        // Gera números dentro do intervalo definido.
        num1 = Math.floor(Math.random() * (intervalo - 1)) + 2;
        num2 = Math.floor(Math.random() * (intervalo - 1)) + 2;
    } while (operador === '/' && (num1 % num2 !== 0 || num1 === num2)); // Garante que a divisão seja exata.

    if (operador === '/') {
        // Configura operação de divisão.
        respostaCorreta = num1 / num2;
        document.getElementById('operacao').innerText = `${num1} ÷ ${num2}`;
    } else if (operador === '-') {
        // Configura operação de subtração.
        const maior = Math.max(num1, num2);
        const menor = Math.min(num1, num2);
        respostaCorreta = maior - menor;
        document.getElementById('operacao').innerText = `${maior} − ${menor}`;
    } else {
        // Configura operação de soma ou multiplicação.
        respostaCorreta = eval(`${num1} ${operador} ${num2}`);
        const operadorTexto = operador === '*' ? '×' : operador;
        document.getElementById('operacao').innerText = `${num1} ${operadorTexto} ${num2}`;
    }

    tempoInicioQuestao = performance.now(); // Marca o início do tempo para a questão atual.
}

// Função que verifica a resposta do jogador para a operação exibida.
function verificarResposta() {
    const respostaUsuario = parseInt(document.getElementById('resposta').value); // Captura a resposta do jogador.
    const operacao = document.getElementById('operacao').innerText; // Obtém a operação exibida.
    const tempoResposta = performance.now() - tempoInicioQuestao; // Calcula o tempo de resposta.
    temposPorQuestao.push(tempoResposta); // Armazena o tempo de resposta.

    if (respostaUsuario === respostaCorreta) {
        // Se a resposta estiver correta, incrementa os acertos.
        acertos++;
        contas.push({ operacao, respostaUsuario, correto: true, respostaCorreta, tempoResposta });
    } else {
        // Caso contrário, incrementa os erros.
        erros++;
        contas.push({ operacao, respostaUsuario, correto: false, respostaCorreta, tempoResposta });
    }

    document.getElementById('resposta').value = ''; // Limpa o campo de resposta.
    gerarOperacao(); // Gera uma nova operação.
    atualizarGrafico(); // Atualiza o gráfico de resultados.
}

// Função que inicia o temporizador do jogo, caso o tempo esteja ativado.
function iniciarTemporizador() {
    let tempoRestante = tempoJogada; // Tempo restante inicial.
    document.getElementById('temporizador').innerText = `${tempoRestante}`; // Exibe o tempo inicial.

    temporizador = setInterval(() => {
        tempoRestante--; // Decrementa o tempo restante.
        document.getElementById('temporizador').innerText = `${tempoRestante}`;

        if (tempoRestante <= 0) {
            // Finaliza o jogo ao chegar a 0.
            clearInterval(temporizador);
            finalizarJogo();
        }
    }, 1000); // Executa a cada segundo.
}

// Função que calcula o tempo médio de resposta com base nas questões respondidas.
function calcularTempoMedio() {
    const totalTempo = temposPorQuestao.reduce((acc, tempo) => acc + tempo, 0); // Soma os tempos de resposta.
    const media = totalTempo / temposPorQuestao.length; // Calcula a média.
    return media.toFixed(2); // Retorna a média formatada.
}

// Função que atualiza o gráfico de resultados.
function atualizarGrafico() {
    const tempoMedio = calcularTempoMedio(); // Calcula o tempo médio.

    const ctx = document.getElementById('grafico').getContext('2d'); // Obtém o contexto do gráfico.
    if (grafico) grafico.destroy(); // Destroi o gráfico anterior, se existir.
    grafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Acertos', 'Erros', 'Tempo Médio (s)'],
            datasets: [{
                label: 'Resultados',
                data: [acertos, erros, (tempoMedio / 1000)], // Dados do gráfico.
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

// Função que finaliza o jogo e exibe os resultados.
function finalizarJogo() {
    clearInterval(temporizador); // Para o temporizador.
    document.querySelector('.jogo').style.display = 'none'; // Esconde a tela do jogo.
    document.querySelector('.resultado').style.display = 'block'; // Exibe a tela de resultados.
    atualizarGrafico(); // Atualiza o gráfico final.
    atualizarContas(); // Exibe o histórico de contas resolvidas.
}

// Função que atualiza a exibição do histórico de contas resolvidas.
function atualizarContas() {
    const contasContainer = document.getElementById('contas'); // Container para exibição das contas.
    contasContainer.innerHTML = ''; // Limpa o conteúdo anterior.

    contas.forEach(({ operacao, respostaUsuario, correto, respostaCorreta, tempoResposta }) => {
        const cor = correto ? 'green' : 'red'; // Define a cor do texto com base na correção.
        const status = correto ? 'Correto' : `Errado (Correto: ${respostaCorreta})`;
        contasContainer.innerHTML += `
            <p style="color: ${cor};">
                ${operacao} = ${respostaUsuario} (${status}) - Tempo: ${(tempoResposta / 1000).toFixed(2)}s
            </p>
        `;
    });

    const total = acertos + erros; // Total de questões respondidas.
    const porcentagemAcertos = ((acertos / total) * 100).toFixed(2); // Porcentagem de acertos.
    const porcentagemErros = ((erros / total) * 100).toFixed(2); // Porcentagem de erros.

    contasContainer.innerHTML += `
        <hr>
        <p style="color: green;">Acertos: ${acertos} (${porcentagemAcertos}%)</p>
        <p style="color: red;">Erros: ${erros} (${porcentagemErros}%)</p>
    `; // Exibe os totais.
}

// Função que salva o resultado atual no leaderboard.
function salvarNoLeaderboard() {
    const nomeJogador = document.getElementById('nome-jogador').value.trim(); // Obtém o nome do jogador.

    if (!nomeJogador) {
        // Verifica se o nome foi preenchido.
        alert('Por favor, insira seu nome antes de salvar no leaderboard.');
        return;
    }

    const tempoMedio = calcularTempoMedio(); // Calcula o tempo médio.
    const resultado = {
        jogador: nomeJogador,
        acertos,
        erros,
        tempoMedio: (tempoMedio / 1000).toFixed(2),
        tempoSelecionado: tempoJogada || 'Desligado',
        operacoes: operacoesSelecionadas.join(', '),
        data: new Date().toLocaleString(),
        contas: [...contas] // Copia o histórico de contas.
    };

    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || []; // Obtém o leaderboard do localStorage.
    leaderboard.push(resultado); // Adiciona o novo resultado.
    leaderboard.sort((a, b) => b.acertos - a.acertos); // Ordena pelo número de acertos.
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard)); // Salva no localStorage.

    alert('Resultado salvo no leaderboard!');
}



// Função que exibe as estatísticas detalhadas de um jogador específico
function exibirEstatisticas(index) {
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || []; // Obtém o leaderboard do localStorage
    const entry = leaderboard[index]; // Seleciona a entrada específica com base no índice

    if (!entry || !entry.contas) return; // Verifica se a entrada é válida

    const contasDetalhes = document.getElementById('contas-detalhadas');
    contasDetalhes.innerHTML = `<h3>Estatísticas de ${entry.jogador}</h3>`; // Define o cabeçalho com o nome do jogador

    // Itera sobre as contas resolvidas pelo jogador e exibe os detalhes de cada uma
    entry.contas.forEach(({ operacao, respostaUsuario, correto, respostaCorreta, tempoResposta }) => {
        const cor = correto ? 'green' : 'red'; // Define a cor com base na correção
        const status = correto ? 'Correto' : `Errado (Correto: ${respostaCorreta})`; // Status da resposta
        contasDetalhes.innerHTML += `
            <p style="color: ${cor};">
                ${operacao} = ${respostaUsuario} (${status}) - Tempo: ${(tempoResposta / 1000).toFixed(2)}s
            </p>
        `;
    });

    // Configura e exibe o gráfico das estatísticas do jogador
    const ctx = document.getElementById('grafico-estatisticas').getContext('2d');
    if (grafico) grafico.destroy(); // Destroi o gráfico existente, se houver
    grafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Acertos', 'Erros', 'Tempo Médio (s)'],
            datasets: [{
                label: 'Estatísticas Individuais',
                data: [entry.acertos, entry.erros, parseFloat(entry.tempoMedio)],
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

    // Alterna entre as telas de leaderboard e estatísticas
    document.querySelector('.leaderboard').style.display = 'none';
    document.querySelector('.estatisticas').style.display = 'block';
}

// Função que exibe o leaderboard com as informações de todos os jogadores
function exibirLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || []; // Obtém o leaderboard do localStorage
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = ''; // Limpa a lista antes de renderizá-la novamente

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>Nenhum jogo salvo ainda!</li>'; // Exibe mensagem se não houver dados
        return;
    }

    // Itera sobre os dados do leaderboard e exibe as informações de cada jogador
    leaderboard.forEach((entry, index) => {
        leaderboardList.innerHTML += `
            <li>
                <strong>${index + 1}. ${entry.jogador}</strong><br>
                Acertos: ${entry.acertos}<br>
                Erros: ${entry.erros}<br>
                Operações: ${entry.operacoes}<br>
                Tempo: ${entry.tempoSelecionado}<br>
                Tempo Médio: ${entry.tempoMedio}s<br>
                Data: ${entry.data}<br>
                <button onclick="exibirEstatisticas(${index})" class="stats-btn">Ver Estatísticas</button>
                <button onclick="excluirDoLeaderboard(${index})" class="delete-btn">Excluir</button>
            </li>
        `;
    });

    // Configura e exibe o gráfico com os dados gerais do leaderboard
    const ctx = document.getElementById('grafico-leaderboard').getContext('2d');
    const totais = leaderboard.reduce((acc, entry) => {
        acc.acertos += entry.acertos;
        acc.erros += entry.erros;
        acc.tempoMedio += parseFloat(entry.tempoMedio);
        return acc;
    }, { acertos: 0, erros: 0, tempoMedio: 0 });

    if (grafico) grafico.destroy(); // Destroi o gráfico existente, se houver
    grafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Acertos Totais', 'Erros Totais', 'Tempo Médio (s)'],
            datasets: [{
                label: 'Resultados Gerais',
                data: [
                    totais.acertos,
                    totais.erros,
                    (totais.tempoMedio / leaderboard.length).toFixed(2)
                ],
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

    // Alterna entre as telas de resultado e leaderboard
    document.querySelector('.resultado').style.display = 'none';
    document.querySelector('.leaderboard').style.display = 'block';
}

// Função que remove uma entrada específica do leaderboard
function excluirDoLeaderboard(index) {
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || []; // Obtém o leaderboard do localStorage
    if (index >= 0 && index < leaderboard.length) {
        leaderboard.splice(index, 1); // Remove a entrada pelo índice
        localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard)); // Atualiza o localStorage
        exibirLeaderboard(); // Atualiza a interface do leaderboard
    }
}

// Função que reinicia os valores do jogo e exibe a tela de configuração
function reiniciarJogo() {
    acertos = 0;
    erros = 0;
    contas = [];
    operacoesSelecionadas = [];
    document.querySelector('.config').style.display = 'block';
    document.querySelector('.resultado').style.display = 'none';
}

// Adiciona evento de clique para iniciar o jogo com as configurações selecionadas
document.getElementById('start').addEventListener('click', () => {
    operacoesSelecionadas = Array.from(document.querySelectorAll('.operation:checked')).map(input => input.value);

    if (operacoesSelecionadas.length === 0) {
        alert('Por favor, selecione pelo menos uma operação!'); // Alerta se nenhuma operação foi selecionada
        return;
    }

    intervalo = parseInt(document.getElementById('max').value); // Define o intervalo máximo
    tempoJogada = document.getElementById('time-select').value === 'off' ? 0 : parseInt(document.getElementById('time-select').value); // Configura o tempo da jogada

    document.querySelector('.config').style.display = 'none';
    document.querySelector('.jogo').style.display = 'block';

    gerarOperacao(); // Gera a primeira operação
    if (tempoJogada) iniciarTemporizador(); // Inicia o temporizador se necessário

    document.getElementById('resposta').focus(); // Define o foco no campo de resposta
});

// Adiciona evento para reiniciar o jogo
// Recarrega a página para um reinício completo
document.getElementById('reiniciar').addEventListener('click', () => {
    location.reload();
});

// Evento para retornar à tela de configuração
// Alterna entre as telas de configuração e resultado
document.getElementById('voltar').addEventListener('click', reiniciarJogo);

// Evento para exibir ou ocultar o contêiner das contas resolvidas
document.getElementById('exibir-contas').addEventListener('click', () => {
    const contasContainer = document.getElementById('contas');
    contasContainer.style.display = contasContainer.style.display === 'none' ? 'block' : 'none';
});

// Evento para verificar a resposta quando o usuário pressiona Enter
document.getElementById('resposta').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        verificarResposta();
    }
});

// Restringe os campos de entrada para aceitar apenas números
// Remove caracteres não numéricos
['min', 'max'].forEach(id => {
    document.getElementById(id).addEventListener('input', function (e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});

// Evento para finalizar o jogo e exibir os resultados
document.getElementById('finalizar').addEventListener('click', finalizarJogo);

// Evento para salvar o jogo no leaderboard
document.getElementById('salvar-leaderboard').addEventListener('click', salvarNoLeaderboard);

// Evento para voltar ao menu principal e exibir a tela de configuração
document.getElementById('voltar-menu').addEventListener('click', () => {
    document.querySelector('.leaderboard').style.display = 'none';
    document.querySelector('.config').style.display = 'block';
});

// Evento para exibir o leaderboard principal e atualizar os dados
document.getElementById('leaderboard-main').addEventListener('click', () => {
    document.querySelector('.config').style.display = 'none';
    document.querySelector('.leaderboard').style.display = 'block';
    exibirLeaderboard();
});

// Evento para retornar às estatísticas detalhadas ao leaderboard
// Alterna entre as telas de estatísticas e leaderboard
document.getElementById('voltar-detalhes').addEventListener('click', () => {
    document.querySelector('.estatisticas').style.display = 'none';
    document.querySelector('.leaderboard').style.display = 'block';
    exibirLeaderboard(); 
});

