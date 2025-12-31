/* ============================================
   MEGA DA VIRADA 2025 - VALIDADOR DE BOLÃO
   JavaScript Logic
   ============================================ */

// ============================================
// CONFIGURAÇÕES E DADOS DO BOLÃO
// ============================================
const BOLAO_CONFIG = {
    // Prêmio estimado da Mega da Virada 2025
    premioTotal: 1_000_000_000, // R$ 1 bilhão

    // Distribuição dos prêmios
    percentualSena: 0.90,    // 90% para sena
    percentualQuina: 0.05,   // 5% para quina
    percentualQuadra: 0.05,  // 5% para quadra

    // Desconto do administrador do bolão
    descontoAdmin: 0.10, // 10%

    // Dados do bolão
    arrecadacaoTotal: 536993.99,
    participantes: 1743,
    pixes: 3410,
    totalCotas: 21309,
    valorCota: 25.20,

    // Jogos
    jogos9Numeros: 1065,
    jogos6Numeros: 39,

    // Estimativas de ganhadores (para cálculo)
    // Estes valores seriam atualizados após o sorteio oficial
    estimativaGanhadoresSena: 1,
    estimativaGanhadoresQuina: 500,
    estimativaGanhadoresQuadra: 50000
};

// ============================================
// TABELA DE COMBINAÇÕES
// ============================================
// Quando um jogo de N números acerta X números sorteados,
// quantas senas/quinas/quadras ele ganha?

const COMBINACOES = {
    // Jogos de 6 números
    6: {
        6: { senas: 1, quinas: 0, quadras: 0 },  // Acertou todos os 6
        5: { senas: 0, quinas: 1, quadras: 0 },  // Acertou 5
        4: { senas: 0, quinas: 0, quadras: 1 },  // Acertou 4
    },
    // Jogos de 7 números (C(7,6) = 7 combinações)
    7: {
        6: { senas: 1, quinas: 6, quadras: 0 },
        5: { senas: 0, quinas: 2, quadras: 10 },
        4: { senas: 0, quinas: 0, quadras: 5 },
    },
    // Jogos de 8 números (C(8,6) = 28 combinações)
    8: {
        6: { senas: 1, quinas: 12, quadras: 15 },
        5: { senas: 0, quinas: 3, quadras: 18 },
        4: { senas: 0, quinas: 0, quadras: 10 },
    },
    // Jogos de 9 números (C(9,6) = 84 combinações)
    9: {
        6: { senas: 1, quinas: 18, quadras: 45 },
        5: { senas: 0, quinas: 4, quadras: 30 },
        4: { senas: 0, quinas: 0, quadras: 15 },
    },
    // Jogos de 10 números (C(10,6) = 210 combinações)
    10: {
        6: { senas: 1, quinas: 24, quadras: 90 },
        5: { senas: 0, quinas: 5, quadras: 45 },
        4: { senas: 0, quinas: 0, quadras: 20 },
    },
    // Jogos de 11 números (C(11,6) = 462 combinações)
    11: {
        6: { senas: 1, quinas: 30, quadras: 150 },
        5: { senas: 0, quinas: 6, quadras: 63 },
        4: { senas: 0, quinas: 0, quadras: 25 },
    },
    // Jogos de 12 números (C(12,6) = 924 combinações)
    12: {
        6: { senas: 1, quinas: 36, quadras: 225 },
        5: { senas: 0, quinas: 7, quadras: 84 },
        4: { senas: 0, quinas: 0, quadras: 30 },
    },
    // Jogos de 13 números
    13: {
        6: { senas: 1, quinas: 42, quadras: 315 },
        5: { senas: 0, quinas: 8, quadras: 108 },
        4: { senas: 0, quinas: 0, quadras: 35 },
    },
    // Jogos de 14 números
    14: {
        6: { senas: 1, quinas: 48, quadras: 420 },
        5: { senas: 0, quinas: 9, quadras: 135 },
        4: { senas: 0, quinas: 0, quadras: 40 },
    },
    // Jogos de 15 números
    15: {
        6: { senas: 1, quinas: 54, quadras: 540 },
        5: { senas: 0, quinas: 10, quadras: 165 },
        4: { senas: 0, quinas: 0, quadras: 45 },
    }
};

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================
let state = {
    selectedNumbers: [],
    parsedGames: [],
    validationResults: null
};

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Formata número como moeda brasileira
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Formata percentual
 */
function formatPercent(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    }).format(value);
}

/**
 * Calcula fatorial
 */
function factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

/**
 * Calcula combinação (n choose k)
 */
function combination(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    return factorial(n) / (factorial(k) * factorial(n - k));
}

/**
 * Calcula quantas combinações vencedoras existem
 * quando um jogo de N números acerta X dos 6 sorteados
 */
function calcularCombinacoes(numerosDoJogo, acertos) {
    const n = numerosDoJogo;
    const k = acertos;

    // Se temos as combinações pré-calculadas, usamos
    if (COMBINACOES[n] && COMBINACOES[n][k]) {
        return COMBINACOES[n][k];
    }

    // Caso contrário, calculamos dinamicamente
    // Senas: C(k, 6) * C(n-k, 0) = 1 se k=6, 0 caso contrário
    // Quinas: C(k, 5) * C(n-k, 1) 
    // Quadras: C(k, 4) * C(n-k, 2)

    const senas = k >= 6 ? combination(k, 6) * combination(n - k, 0) : 0;
    const quinas = k >= 5 ? combination(k, 5) * combination(n - k, 1) : 0;
    const quadras = k >= 4 ? combination(k, 4) * combination(n - k, 2) : 0;

    return { senas, quinas, quadras };
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNumbersGrid();
    initCalculator();
    initEventListeners();
    initVisitCounter();
    initCountdown();
});

/**
 * Inicializa o cronômetro regressivo até o sorteio
 */
function initCountdown() {
    // Data do sorteio: 31/12/2025 às 22:00:00 (horário de Brasília)
    const sorteioDate = new Date('2025-12-31T22:00:00-03:00');
    let autoFetchDone = false;

    function updateCountdown() {
        const now = new Date();
        const diff = sorteioDate - now;

        const countdownEl = document.getElementById('countdownTime');
        const timerEl = document.getElementById('countdownTimer');

        if (diff <= 0) {
            // Sorteio já aconteceu
            countdownEl.textContent = 'SORTEADO!';
            timerEl.classList.add('ended');

            // Busca automaticamente os dados da Caixa (apenas 1x)
            if (!autoFetchDone) {
                autoFetchDone = true;
                // Aguarda 2 segundos para o usuário ver a interface primeiro
                setTimeout(() => {
                    fetchCaixaResult();
                }, 2000);
            }
            return;
        }

        // Calcula horas, minutos e segundos
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Formata com zeros à esquerda
        const formatted = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');

        countdownEl.textContent = formatted;
    }

    // Atualiza imediatamente e depois a cada segundo
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/**
 * Cria partículas animadas no fundo
 */
function initParticles() {
    const container = document.getElementById('particles');
    const colors = ['#FFD700', '#667eea', '#764ba2', '#38ef7d', '#ff416c'];

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = (4 + Math.random() * 6) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

/**
 * Inicializa a grade de números (1-60)
 */
function initNumbersGrid() {
    const grid = document.getElementById('numbersGrid');
    grid.innerHTML = '';

    for (let i = 1; i <= 60; i++) {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.textContent = i.toString().padStart(2, '0');
        btn.dataset.number = i;
        btn.addEventListener('click', () => toggleNumber(i));
        grid.appendChild(btn);
    }
}

/**
 * Inicializa a calculadora de cotas
 */
function initCalculator() {
    const input = document.getElementById('quotasInput');
    input.addEventListener('input', updateCalculator);
}

/**
 * Inicializa event listeners
 */
function initEventListeners() {
    // Botão limpar seleção
    document.getElementById('clearSelection').addEventListener('click', clearSelection);

    // Botão carregar exemplo
    document.getElementById('loadSampleBtn').addEventListener('click', loadSampleGames);

    // Botão validar
    document.getElementById('validateBtn').addEventListener('click', validateGames);

    // Textarea de jogos
    document.getElementById('gamesTextarea').addEventListener('input', updateGamesCount);

    // Filtros de resultados
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => filterResults(e.target.dataset.filter));
    });

    // Event listeners para campos de ganhadores - atualiza automaticamente quando alterado
    const winnersInputs = ['totalSenaWinners', 'totalQuinaWinners', 'totalQuadraWinners'];
    winnersInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                // Se já há resultados, recalcula automaticamente
                if (state.validationResults) {
                    displayResults();
                }
                // Atualiza calculadora de cotas também
                updateCalculator();
            });
        }
    });

    // Botão buscar resultado da Caixa
    document.getElementById('fetchResultBtn').addEventListener('click', fetchCaixaResult);
}

/**
 * Busca o resultado oficial da API da Caixa
 */
async function fetchCaixaResult() {
    const statusEl = document.getElementById('apiStatus');
    const statusIcon = statusEl.querySelector('.status-icon');
    const statusText = statusEl.querySelector('.status-text');

    // Estado de loading
    statusEl.className = 'api-status loading';
    statusIcon.textContent = '🔄';
    statusText.textContent = 'Buscando dados oficiais da Caixa...';

    try {
        // Tenta a API oficial da Caixa primeiro
        const response = await fetch('https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena');

        if (!response.ok) {
            throw new Error('API da Caixa indisponível');
        }

        const data = await response.json();

        // Extrai os dados de ganhadores
        const premiacoes = data.listaRateioPremio || [];

        let senaWinners = 0;
        let quinaWinners = 0;
        let quadraWinners = 0;

        premiacoes.forEach(p => {
            if (p.faixa === 1) senaWinners = p.numeroDeGanhadores;
            if (p.faixa === 2) quinaWinners = p.numeroDeGanhadores;
            if (p.faixa === 3) quadraWinners = p.numeroDeGanhadores;
        });

        // Preenche os campos (como default, editável)
        document.getElementById('totalSenaWinners').value = senaWinners || '';
        document.getElementById('totalQuinaWinners').value = quinaWinners || '';
        document.getElementById('totalQuadraWinners').value = quadraWinners || '';

        // Se tiver números sorteados, preenche automaticamente
        const dezenas = data.listaDezenas || [];
        if (dezenas.length === 6) {
            // Limpa seleção atual
            state.selectedNumbers = [];

            // Seleciona os números do sorteio
            dezenas.forEach(d => {
                const num = parseInt(d);
                if (!state.selectedNumbers.includes(num)) {
                    state.selectedNumbers.push(num);
                }
            });

            updateNumbersUI();
        }

        // Estado de sucesso
        statusEl.className = 'api-status success';
        statusIcon.textContent = '✅';
        statusText.textContent = `Concurso ${data.numero} (${data.dataApuracao}) - Números: ${dezenas.join(', ')} | SENA: ${senaWinners}, QUINA: ${quinaWinners}, QUADRA: ${quadraWinners}`;

        // Recalcula se já tem resultados
        if (state.validationResults) {
            displayResults();
        }
        updateCalculator();

        showToast('✅ Dados oficiais carregados com sucesso!');

    } catch (error) {
        console.error('Erro ao buscar API da Caixa:', error);

        // Estado de erro
        statusEl.className = 'api-status error';
        statusIcon.textContent = '❌';
        statusText.textContent = 'Erro ao buscar dados. O resultado pode ainda não estar disponível ou a API está fora do ar.';

        showToast('❌ Não foi possível buscar dados da Caixa', 'error');
    }
}

/**
 * Inicializa o contador de visitas
 * Usando localStorage para contagem local (funciona sem backend)
 */
function initVisitCounter() {
    try {
        // Contador de visitas totais (incrementa a cada page load)
        let totalVisits = parseInt(localStorage.getItem('bolao_total_visits') || '0');
        totalVisits++;
        localStorage.setItem('bolao_total_visits', totalVisits.toString());
        document.getElementById('totalVisits').textContent = formatNumber(totalVisits);

        // Contador de visitantes únicos (1x por navegador/dispositivo - primeiro acesso)
        let uniqueVisits = parseInt(localStorage.getItem('bolao_unique_visits') || '0');
        const isFirstVisit = !localStorage.getItem('bolao_first_visit_done');

        if (isFirstVisit) {
            // Primeira vez neste navegador = novo visitante único
            uniqueVisits++;
            localStorage.setItem('bolao_unique_visits', uniqueVisits.toString());
            localStorage.setItem('bolao_first_visit_done', 'true');
        }

        document.getElementById('uniqueVisits').textContent = formatNumber(uniqueVisits);

    } catch (error) {
        console.log('Contador de visitas erro:', error);
        document.getElementById('totalVisits').textContent = '-';
        document.getElementById('uniqueVisits').textContent = '-';
    }
}

/**
 * Formata número grande de forma legível
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ============================================
// SELEÇÃO DE NÚMEROS SORTEADOS
// ============================================

/**
 * Alterna seleção de um número
 */
function toggleNumber(number) {
    const index = state.selectedNumbers.indexOf(number);

    if (index > -1) {
        // Remove o número
        state.selectedNumbers.splice(index, 1);
    } else if (state.selectedNumbers.length < 6) {
        // Adiciona o número
        state.selectedNumbers.push(number);
    } else {
        // Já tem 6 números selecionados
        showToast('Você já selecionou 6 números. Remova um para adicionar outro.');
        return;
    }

    updateNumbersUI();
}

/**
 * Atualiza a interface dos números selecionados
 */
function updateNumbersUI() {
    // Atualiza botões da grade
    document.querySelectorAll('.number-btn').forEach(btn => {
        const num = parseInt(btn.dataset.number);
        btn.classList.toggle('selected', state.selectedNumbers.includes(num));
    });

    // Atualiza bolas selecionadas
    const balls = document.getElementById('selectedBalls');
    const sorted = [...state.selectedNumbers].sort((a, b) => a - b);

    let html = '';
    for (let i = 0; i < 6; i++) {
        if (sorted[i]) {
            html += `<span>${sorted[i].toString().padStart(2, '0')}</span>`;
        } else {
            html += `<span class="empty-slot">-</span>`;
        }
    }
    balls.innerHTML = html;

    // Atualiza badge
    const badge = document.querySelector('.number-selector .badge');
    if (state.selectedNumbers.length === 6) {
        badge.textContent = '✓ 6 números selecionados';
        badge.classList.remove('badge-red');
        badge.classList.add('badge-success');
    } else {
        badge.textContent = `Selecione ${6 - state.selectedNumbers.length} número(s)`;
        badge.classList.add('badge-red');
        badge.classList.remove('badge-success');
    }
}

/**
 * Limpa a seleção de números
 */
function clearSelection() {
    state.selectedNumbers = [];
    updateNumbersUI();
}

// ============================================
// CALCULADORA DE COTAS
// ============================================

/**
 * Atualiza os cálculos da calculadora de cotas
 */
function updateCalculator() {
    const input = document.getElementById('quotasInput');
    const cotas = parseInt(input.value) || 0;

    // Valor investido
    const investido = cotas * BOLAO_CONFIG.valorCota;
    document.getElementById('investedValue').textContent = formatCurrency(investido);

    // Participação percentual
    const participacao = cotas / BOLAO_CONFIG.totalCotas;
    document.getElementById('participationPercent').textContent = formatPercent(participacao);

    // Lê os valores dos campos de ganhadores (se preenchidos)
    const totalSenaWinnersInput = document.getElementById('totalSenaWinners');
    const totalQuinaWinnersInput = document.getElementById('totalQuinaWinners');
    const totalQuadraWinnersInput = document.getElementById('totalQuadraWinners');

    const totalSenaWinners = parseInt(totalSenaWinnersInput?.value) || BOLAO_CONFIG.estimativaGanhadoresSena;
    const totalQuinaWinners = parseInt(totalQuinaWinnersInput?.value) || BOLAO_CONFIG.estimativaGanhadoresQuina;
    const totalQuadraWinners = parseInt(totalQuadraWinnersInput?.value) || BOLAO_CONFIG.estimativaGanhadoresQuadra;

    // Prêmio total por categoria
    const premioTotalSena = BOLAO_CONFIG.premioTotal * BOLAO_CONFIG.percentualSena;
    const premioTotalQuina = BOLAO_CONFIG.premioTotal * BOLAO_CONFIG.percentualQuina;
    const premioTotalQuadra = BOLAO_CONFIG.premioTotal * BOLAO_CONFIG.percentualQuadra;

    // Prêmio que o bolão receberia se ganhasse (1 sena / quina / quadra)
    // Dividido pelo número de ganhadores no Brasil
    const premioSenaBolao = premioTotalSena / totalSenaWinners;
    const premioQuinaBolao = premioTotalQuina / totalQuinaWinners;
    const premioQuadraBolao = premioTotalQuadra / totalQuadraWinners;

    // Após desconto de 10% do admin
    const parteSenaBolao = premioSenaBolao * (1 - BOLAO_CONFIG.descontoAdmin);
    const parteQuinaBolao = premioQuinaBolao * (1 - BOLAO_CONFIG.descontoAdmin);
    const parteQuadraBolao = premioQuadraBolao * (1 - BOLAO_CONFIG.descontoAdmin);

    // Parte individual baseada nas cotas
    const senaReturn = parteSenaBolao * participacao;
    const quinaReturn = parteQuinaBolao * participacao;
    const quadraReturn = parteQuadraBolao * participacao;

    document.getElementById('senaReturn').textContent = formatCurrency(senaReturn);
    document.getElementById('quinaReturn').textContent = formatCurrency(quinaReturn);
    document.getElementById('quadraReturn').textContent = formatCurrency(quadraReturn);
}

// ============================================
// PARSING DE JOGOS
// ============================================

/**
 * Faz o parse do texto de jogos
 */
function parseGames(text) {
    const lines = text.trim().split('\n');
    const games = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Remove múltiplos espaços e divide por espaço, vírgula, hífen ou ponto-vírgula
        const numbers = line
            .replace(/[\s,;\-]+/g, ' ')
            .trim()
            .split(' ')
            .map(n => parseInt(n))
            .filter(n => !isNaN(n) && n >= 1 && n <= 60);

        // Remove duplicatas
        const uniqueNumbers = [...new Set(numbers)];

        if (uniqueNumbers.length >= 6 && uniqueNumbers.length <= 15) {
            games.push({
                id: games.length + 1,
                numbers: uniqueNumbers.sort((a, b) => a - b),
                lineNumber: i + 1
            });
        }
    }

    return games;
}

/**
 * Atualiza contagem de jogos
 */
function updateGamesCount() {
    const text = document.getElementById('gamesTextarea').value;
    const games = parseGames(text);
    const countEl = document.getElementById('gamesCount');

    if (games.length === 0) {
        countEl.textContent = '0 jogos carregados';
    } else {
        const de6 = games.filter(g => g.numbers.length === 6).length;
        const de9 = games.filter(g => g.numbers.length === 9).length;
        const outros = games.length - de6 - de9;

        let text = `${games.length} jogos carregados`;
        if (de6 > 0) text += ` | ${de6} de 6 números`;
        if (de9 > 0) text += ` | ${de9} de 9 números`;
        if (outros > 0) text += ` | ${outros} outros`;

        countEl.textContent = text;
    }

    state.parsedGames = games;
}

/**
 * Carrega jogos de exemplo
 */
function loadSampleGames() {
    const sampleGames = `01 05 12 23 34 45 56 58 60
02 08 15 27 38 49 51 53 57
03 11 22 33 44 55 59 60 01
04 14 24 34 44 54
10 20 30 40 50 60 05 15 25
07 17 27 37 47 57 08 18 28
06 16 26 36 46 56
09 19 29 39 49 59 01 11 21
12 22 32 42 52 02 13 23 33
15 25 35 45 55 05`;

    document.getElementById('gamesTextarea').value = sampleGames;
    updateGamesCount();
    showToast('10 jogos de exemplo carregados!');
}

// ============================================
// VALIDAÇÃO DE JOGOS
// ============================================

/**
 * Valida todos os jogos contra os números sorteados
 */
function validateGames() {
    // Verifica se 6 números foram selecionados
    if (state.selectedNumbers.length !== 6) {
        showToast('Por favor, selecione exatamente 6 números sorteados!', 'error');
        return;
    }

    // Verifica se há jogos para validar
    if (state.parsedGames.length === 0) {
        showToast('Por favor, cole os jogos do bolão!', 'error');
        return;
    }

    const sorteados = new Set(state.selectedNumbers);
    const results = [];

    let totalSenas = 0;
    let totalQuinas = 0;
    let totalQuadras = 0;

    for (const game of state.parsedGames) {
        // Conta quantos números do jogo foram sorteados
        const acertos = game.numbers.filter(n => sorteados.has(n));
        const numAcertos = acertos.length;

        // Calcula quantas senas/quinas/quadras esse jogo gerou
        const combinacoes = calcularCombinacoes(game.numbers.length, numAcertos);

        totalSenas += combinacoes.senas;
        totalQuinas += combinacoes.quinas;
        totalQuadras += combinacoes.quadras;

        // Determina a melhor categoria (para exibição)
        let categoria = 'none';
        if (combinacoes.senas > 0) categoria = 'sena';
        else if (combinacoes.quinas > 0) categoria = 'quina';
        else if (combinacoes.quadras > 0) categoria = 'quadra';

        results.push({
            ...game,
            acertos: acertos,
            numAcertos: numAcertos,
            combinacoes: combinacoes,
            categoria: categoria
        });
    }

    // Ordena por categoria (senas primeiro, depois quinas, depois quadras)
    results.sort((a, b) => {
        const order = { sena: 0, quina: 1, quadra: 2, none: 3 };
        return order[a.categoria] - order[b.categoria];
    });

    // Salva resultados no estado
    state.validationResults = {
        results: results,
        totals: {
            senas: totalSenas,
            quinas: totalQuinas,
            quadras: totalQuadras
        }
    };

    // Exibe resultados
    displayResults();

    // Se houver ganhadores, mostra confetti
    if (totalSenas > 0 || totalQuinas > 0 || totalQuadras > 0) {
        triggerConfetti();
    }
}

/**
 * Exibe os resultados da validação
 */
function displayResults() {
    const section = document.getElementById('resultsSection');
    section.style.display = 'block';

    const { results, totals } = state.validationResults;

    // Atualiza resumo
    document.getElementById('senasCount').textContent = totals.senas;
    document.getElementById('quinasCount').textContent = totals.quinas;
    document.getElementById('quadrasCount').textContent = totals.quadras;

    // Atualiza badge
    const badge = document.getElementById('resultsBadge');
    if (totals.senas > 0) {
        badge.textContent = '🎉 SENA!';
        badge.className = 'badge badge-gold';
    } else if (totals.quinas > 0) {
        badge.textContent = '⭐ QUINA!';
        badge.className = 'badge badge-success';
    } else if (totals.quadras > 0) {
        badge.textContent = '🎯 QUADRA!';
        badge.className = 'badge';
    } else {
        badge.textContent = 'Sem prêmios';
        badge.className = 'badge';
    }

    // Lê os valores dos campos de ganhadores no Brasil
    // Se vazio, usa os valores padrão
    const totalSenaWinnersInput = document.getElementById('totalSenaWinners');
    const totalQuinaWinnersInput = document.getElementById('totalQuinaWinners');
    const totalQuadraWinnersInput = document.getElementById('totalQuadraWinners');

    // Pega o valor do input ou usa o padrão
    const totalSenaWinners = parseInt(totalSenaWinnersInput.value) || BOLAO_CONFIG.estimativaGanhadoresSena;
    const totalQuinaWinners = parseInt(totalQuinaWinnersInput.value) || BOLAO_CONFIG.estimativaGanhadoresQuina;
    const totalQuadraWinners = parseInt(totalQuadraWinnersInput.value) || BOLAO_CONFIG.estimativaGanhadoresQuadra;

    // Calcula prêmios baseados nos ganhadores informados
    // Prêmio total por categoria
    const premioTotalSena = BOLAO_CONFIG.premioTotal * BOLAO_CONFIG.percentualSena;
    const premioTotalQuina = BOLAO_CONFIG.premioTotal * BOLAO_CONFIG.percentualQuina;
    const premioTotalQuadra = BOLAO_CONFIG.premioTotal * BOLAO_CONFIG.percentualQuadra;

    // Prêmio por ganhador (dividido pelo total de ganhadores no Brasil)
    const premioSenaPorGanhador = premioTotalSena / totalSenaWinners;
    const premioQuinaPorGanhador = premioTotalQuina / totalQuinaWinners;
    const premioQuadraPorGanhador = premioTotalQuadra / totalQuadraWinners;

    // Prêmio bruto do bolão (multiplicado pela quantidade que o bolão ganhou)
    const senaBruto = totals.senas * premioSenaPorGanhador;
    const quinaBruto = totals.quinas * premioQuinaPorGanhador;
    const quadraBruto = totals.quadras * premioQuadraPorGanhador;
    const totalBruto = senaBruto + quinaBruto + quadraBruto;

    // Prêmio líquido (após desconto do admin de 10%)
    const senaLiquido = senaBruto * (1 - BOLAO_CONFIG.descontoAdmin);
    const quinaLiquido = quinaBruto * (1 - BOLAO_CONFIG.descontoAdmin);
    const quadraLiquido = quadraBruto * (1 - BOLAO_CONFIG.descontoAdmin);
    const totalLiquido = totalBruto * (1 - BOLAO_CONFIG.descontoAdmin);

    // Atualiza tabela de prêmios
    document.getElementById('senaQty').textContent = totals.senas;
    document.getElementById('senaBruto').textContent = formatCurrency(senaBruto);
    document.getElementById('senaLiquido').textContent = formatCurrency(senaLiquido);

    document.getElementById('quinaQty').textContent = totals.quinas;
    document.getElementById('quinaBruto').textContent = formatCurrency(quinaBruto);
    document.getElementById('quinaLiquido').textContent = formatCurrency(quinaLiquido);

    document.getElementById('quadraQty').textContent = totals.quadras;
    document.getElementById('quadraBruto').textContent = formatCurrency(quadraBruto);
    document.getElementById('quadraLiquido').textContent = formatCurrency(quadraLiquido);

    document.getElementById('totalBruto').textContent = formatCurrency(totalBruto);
    document.getElementById('totalLiquido').textContent = formatCurrency(totalLiquido);

    // Mostra informação sobre divisão usada
    updatePrizeNote(totalSenaWinners, totalQuinaWinners, totalQuadraWinners);

    // Renderiza lista de jogos
    renderGamesList(results);

    // Scroll suave até os resultados
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Atualiza a nota de informação sobre divisão de prêmios
 */
function updatePrizeNote(senaWinners, quinaWinners, quadraWinners) {
    const noteEl = document.querySelector('.prize-info-note');
    if (noteEl) {
        noteEl.innerHTML = `
            <em>⚠️ Cálculo baseado em: <strong>${senaWinners}</strong> ganhador(es) de SENA, 
            <strong>${quinaWinners.toLocaleString('pt-BR')}</strong> de QUINA, 
            <strong>${quadraWinners.toLocaleString('pt-BR')}</strong> de QUADRA no Brasil. 
            Prêmio total: R$1 bilhão (~90% SENA, ~5% QUINA, ~5% QUADRA). 
            Desconto de 10% do admin já aplicado.</em>
        `;
    }
}

/**
 * Renderiza a lista de jogos com resultados
 */
function renderGamesList(results, filter = 'all') {
    const list = document.getElementById('gamesList');
    list.innerHTML = '';

    const filtered = filter === 'all'
        ? results
        : results.filter(g => g.categoria === filter);

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhum jogo encontrado nesta categoria.</p>';
        return;
    }

    const sorteados = new Set(state.selectedNumbers);

    for (const game of filtered) {
        const div = document.createElement('div');
        div.className = `game-item ${game.categoria}`;
        div.dataset.categoria = game.categoria;

        // Números do jogo
        let numbersHtml = '<div class="game-numbers">';
        for (const num of game.numbers) {
            const isHit = sorteados.has(num);
            numbersHtml += `<span class="number ${isHit ? 'hit' : ''}">${num.toString().padStart(2, '0')}</span>`;
        }
        numbersHtml += '</div>';

        // Resultado
        let resultHtml = '<div class="game-result">';
        if (game.categoria === 'sena') {
            resultHtml += `<span class="result-type" style="color: var(--sena-color)">🏆 SENA!</span>`;
            resultHtml += `<span class="result-detail">${game.combinacoes.senas}S + ${game.combinacoes.quinas}Q + ${game.combinacoes.quadras}Qd</span>`;
        } else if (game.categoria === 'quina') {
            resultHtml += `<span class="result-type" style="color: var(--quina-color)">⭐ QUINA!</span>`;
            resultHtml += `<span class="result-detail">${game.combinacoes.quinas}Q + ${game.combinacoes.quadras}Qd</span>`;
        } else if (game.categoria === 'quadra') {
            resultHtml += `<span class="result-type" style="color: var(--quadra-color)">🎯 QUADRA</span>`;
            resultHtml += `<span class="result-detail">${game.combinacoes.quadras} quadra(s)</span>`;
        } else {
            resultHtml += `<span class="result-type" style="color: var(--text-muted)">❌ ${game.numAcertos} acerto(s)</span>`;
        }
        resultHtml += '</div>';

        div.innerHTML = `
            <div>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Jogo #${game.id} (${game.numbers.length} nums)</span>
                ${numbersHtml}
            </div>
            ${resultHtml}
        `;

        list.appendChild(div);
    }
}

/**
 * Filtra os resultados por categoria
 */
function filterResults(filter) {
    // Atualiza botões de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    // Re-renderiza lista
    if (state.validationResults) {
        renderGamesList(state.validationResults.results, filter);
    }
}

// ============================================
// EFEITOS VISUAIS
// ============================================

/**
 * Mostra uma notificação toast
 */
function showToast(message, type = 'info') {
    // Remove toast existente
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        background: ${type === 'error' ? 'linear-gradient(135deg, #ff416c, #ff4b2b)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
        color: white;
        border-radius: 10px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
    `;
    toast.textContent = message;

    // Adiciona estilo de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(100px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Remove após 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Dispara efeito de confetti para celebração
 */
function triggerConfetti() {
    const colors = ['#FFD700', '#ff416c', '#38ef7d', '#667eea', '#764ba2', '#f5af19'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';

            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }
}
