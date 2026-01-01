/* ============================================
   MEGA DA VIRADA 2025 - VALIDADOR DE BOLÃO
   JavaScript Logic
   ============================================ */

// ============================================
// CONFIGURAÇÕES E DADOS DO BOLÃO
// ============================================
const BOLAO_CONFIG = {
    // Prêmio estimado da Mega da Virada 2025
    premioTotal: 1_090_000_000, // R$ 1,09 bilhão

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
    jogos9Numeros: 1101,
    jogos6Numeros: 63,

    // Dados do Bolão 2
    totalCotasBolao2: 4818, // Atualizado manual user
    valorCotaBolao2: 6.00,

    // Estimativas de ganhadores (para cálculo)
    // Valores default baseados no resultado real - serão sobrescritos pela API
    estimativaGanhadoresSena: 6,
    estimativaGanhadoresQuina: 3921,
    estimativaGanhadoresQuadra: 308315
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
    validationResults: null,
    totalLiquidoPrincipal: 0, // Prêmio líquido do Bolão Principal
    totalLiquidoBolao2: 0,    // Prêmio líquido do Bolão 2
    activeBolao: 9,  // 9 ou 6 - qual bolão está sendo visualizado
    participaBolao9: true,  // Usuário participa do bolão de 9 números
    participaBolao6: false  // Usuário participa do bolão de 6 números
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
    // Inicialização defensiva para evitar que um erro pare tudo
    try { initParticles(); } catch (e) { console.error('Erro particles:', e); }
    try { initNumbersGrid(); } catch (e) { console.error('Erro grid:', e); }
    try { initCalculator(); } catch (e) { console.error('Erro calculator:', e); }
    try { initEventListeners(); } catch (e) { console.error('Erro listeners:', e); }
    try { initVisitCounter(); } catch (e) { console.error('Erro visit counter:', e); }
    try { initCountdown(); } catch (e) { console.error('Erro countdown:', e); }
    try { initBolaoEdit(); } catch (e) { console.error('Erro bolao edit:', e); }

    // Carrega números sorteados por default (enquanto API não funciona)
    try { initDefaultNumbers(); } catch (e) { console.error('Erro default numbers:', e); }

    // FALLBACK: Garante que o splash será escondido mesmo se houver erro
    setTimeout(() => {
        const splash = document.getElementById('victorySplash');
        if (splash && !splash.classList.contains('hidden')) {
            console.log('Fallback: Escondendo splash');
            splash.classList.add('hidden');
        }
    }, 3000);
});

/**
 * Carrega os números sorteados por default (resultado confirmado)
 * Quando a API funcionar, ela sobrescreverá esses valores
 */
function initDefaultNumbers() {
    // Números sorteados da Mega da Virada 2025 (Concurso 2955)
    const numerosOficiais = [9, 13, 21, 32, 33, 59];

    // Limpa seleção atual
    state.selectedNumbers = [];

    // Seleciona cada número
    numerosOficiais.forEach(num => {
        if (!state.selectedNumbers.includes(num)) {
            state.selectedNumbers.push(num);
        }
    });

    // Atualiza UI da grade de números
    updateNumbersUI();

    // Transição do Splash após 2.5 segundos
    setTimeout(() => {
        const splash = document.getElementById('victorySplash');
        if (splash) {
            splash.classList.add('hidden');
        }

        // Após a transição, dispara confetti e valida jogos
        setTimeout(() => {
            triggerConfetti();
            showToast('🎉 PARABÉNS! Ganhamos a SENA da Mega da Virada!', 'success');

            // Valida os jogos automaticamente após pequeno delay
            setTimeout(() => {
                validateGames();
            }, 500);
        }, 800);
    }, 2500);
}

/**
 * Inicializa o cronômetro regressivo até o sorteio
 * (Mantido para compatibilidade, mas no modo vitória ele apenas tenta buscar a API)
 */
function initCountdown() {
    // Data do sorteio: 01/01/2026 às 10:00:00
    const sorteioDate = new Date('2026-01-01T10:00:00-03:00');
    let autoFetchDone = false;

    function updateCountdown() {
        const now = new Date();
        const diff = sorteioDate - now;

        if (diff <= 0) {
            // Sorteio já aconteceu - tenta buscar API automaticamente (apenas 1x)
            if (!autoFetchDone) {
                autoFetchDone = true;
                // Tenta buscar resultado da API em segundo plano
                setTimeout(() => {
                    fetchCaixaResult(true);
                }, 3000);
            }
            return; // Não altera mais o HTML - o banner de vitória já está lá
        }

        // Se ainda não passou, mostra countdown (caso de uso futuro)
        const countdownEl = document.getElementById('countdownTime');
        if (!countdownEl) return;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

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
    const clearSelectionBtn = document.getElementById('clearSelection');
    if (clearSelectionBtn) clearSelectionBtn.addEventListener('click', clearSelection);

    // Botão carregar exemplo (pode nao existir em algumas versoes)
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    if (loadSampleBtn) loadSampleBtn.addEventListener('click', loadSampleGames);

    // Botão validar
    const validateBtn = document.getElementById('validateBtn');
    if (validateBtn) validateBtn.addEventListener('click', validateGames);

    // Textarea de jogos
    const gamesTextarea = document.getElementById('gamesTextarea');
    if (gamesTextarea) gamesTextarea.addEventListener('input', updateGamesCount);

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
    // Botão buscar resultado da Caixa
    document.getElementById('fetchResultBtn').addEventListener('click', fetchCaixaResult);

    // Botões de Exportação e Visualização
    const btnConfetti = document.getElementById('confettiBtn');
    const btnDownloadExcel = document.getElementById('downloadExcelBtn');
    const btnDownloadCsv = document.getElementById('downloadCsvBtn');
    const btnDownloadTxt = document.getElementById('downloadTxtBtn');

    // Listeners diretos
    if (btnDownloadExcel) btnDownloadExcel.addEventListener('click', downloadExcel);
    if (btnDownloadCsv) btnDownloadCsv.addEventListener('click', downloadCSV);
    if (btnDownloadTxt) btnDownloadTxt.addEventListener('click', downloadTXT);
    if (btnConfetti) btnConfetti.addEventListener('click', triggerConfetti);

    // Botao de visualizar/ocultar lista
    const btnViewGames = document.getElementById('viewGamesBtn');
    if (btnViewGames) {
        btnViewGames.addEventListener('click', () => {
            showGamesModal();
        });
    }

    // Modal de Jogos
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) modalClose.addEventListener('click', closeGamesModal);

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('gamesListModal');
        if (e.target === modal) closeGamesModal();
    });

    // Busca de jogos no modal
    const searchInput = document.getElementById('searchGameInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterGamesList(e.target.value);
        });
    }

    // Botão limpar e inserir jogos
    const clearGamesBtn = document.getElementById('clearGamesBtn');
    if (clearGamesBtn) {
        clearGamesBtn.addEventListener('click', () => {
            const textarea = document.getElementById('gamesTextarea');
            if (textarea.value.trim() !== '' && !confirm('Tem certeza que deseja limpar todos os jogos atuais?')) {
                return;
            }
            textarea.value = '';
            textarea.focus();
            updateGamesCount();
            showToast('🗑️ Área de jogos limpa. Cole seus jogos!', 'info');
        });
    }

    // Carrega jogos padrão se disponíveis (vindo de games-data.js)
    if (typeof DEFAULT_GAMES_LIST !== 'undefined') {
        const textarea = document.getElementById('gamesTextarea');
        if (textarea && textarea.value.trim() === '') {
            textarea.value = DEFAULT_GAMES_LIST.trim();
            updateGamesCount();
        }
    }

    // Toggle de Bolões
    const toggleBolao9 = document.getElementById('toggleBolao9');
    const toggleBolao6 = document.getElementById('toggleBolao6');

    if (toggleBolao9) {
        toggleBolao9.addEventListener('click', () => switchBolao(9));
    }
    if (toggleBolao6) {
        toggleBolao6.addEventListener('click', () => switchBolao(6));
    }

    // Checkboxes de Participação
    const participaBolao9 = document.getElementById('participaBolao9');
    const participaBolao6 = document.getElementById('participaBolao6');

    if (participaBolao9) {
        participaBolao9.addEventListener('change', (e) => {
            state.participaBolao9 = e.target.checked;
            updateCalculator();
        });
    }
    if (participaBolao6) {
        participaBolao6.addEventListener('change', (e) => {
            state.participaBolao6 = e.target.checked;
            updateCalculator();
        });
    }
}

/**
 * Busca o resultado oficial da API da Caixa
 */
async function fetchCaixaResult(isAuto = false) {
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

        // VALIDAÇÃO DE SEGURANÇA: Garante que é o sorteio da Virada
        if (data.dataApuracao !== '31/12/2025' && data.dataApuracao !== '01/01/2026') {
            statusEl.className = 'api-status error';
            statusIcon.textContent = '⚠️';
            statusText.textContent = `Ainda não saiu! Último sorteio disponível: ${data.dataApuracao} (Conc. ${data.numero}). Tente novamente em alguns minutos.`;

            showToast(`⚠️ Resultado ainda não disponível! Último: ${data.dataApuracao}`, 'warning');
            return;
        }

        // Extrai os dados de ganhadores E valores dos prêmios
        const premiacoes = data.listaRateioPremio || [];

        let senaWinners = 0;
        let quinaWinners = 0;
        let quadraWinners = 0;

        let valorSena = 0;
        let valorQuina = 0;
        let valorQuadra = 0;

        premiacoes.forEach(p => {
            if (p.faixa === 1) {
                senaWinners = p.numeroDeGanhadores;
                valorSena = p.valorPremio;
            }
            if (p.faixa === 2) {
                quinaWinners = p.numeroDeGanhadores;
                valorQuina = p.valorPremio;
            }
            if (p.faixa === 3) {
                quadraWinners = p.numeroDeGanhadores;
                valorQuadra = p.valorPremio;
            }
        });

        // Salva os valores reais no state para usar no displayResults
        state.premiosReais = {
            sena: valorSena,
            quina: valorQuina,
            quadra: valorQuadra
        };

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

            // Valida automaticamente os jogos já cadastrados
            validateGames();
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
 * Abre/Fecha modal do último sorteio
 */
function toggleLastDraw() {
    const modal = document.getElementById('lastDrawModal');

    if (modal.style.display === 'none') {
        modal.style.display = 'flex';
        // Carrega dados se estiver vazio ou com loading
        const content = document.getElementById('lastDrawContent');
        if (content.querySelector('.loading-draw')) {
            fetchLastDrawData();
        }
    } else {
        modal.style.display = 'none';
    }
}

/**
 * Busca dados detalhados do último sorteio para o modal
 * Só exibe se for o concurso da Virada (31/12/2025 ou 01/01/2026)
 */
async function fetchLastDrawData() {
    const content = document.getElementById('lastDrawContent');

    try {
        const response = await fetch('https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena');
        if (!response.ok) throw new Error('API Indisponível');

        const data = await response.json();

        // VALIDAÇÃO: Só exibe se for o concurso da Virada
        if (data.dataApuracao !== '31/12/2025' && data.dataApuracao !== '01/01/2026') {
            content.innerHTML = `
                <div class="loading-draw" style="text-align: center; padding: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
                    <h3 style="color: #FFD700; margin-bottom: 10px;">Dados Não Disponíveis</h3>
                    <p style="color: var(--text-secondary);">A API oficial da Caixa ainda não atualizou com o resultado da Mega da Virada 2025.</p>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 15px;">Último concurso disponível: ${data.numero} (${data.dataApuracao})</p>
                    <button class="btn btn-primary" onclick="fetchLastDrawData()" style="margin-top: 20px;">🔄 Tentar Novamente</button>
                </div>
            `;
            return;
        }

        // Formata data
        const premios = data.listaRateioPremio || [];
        const sena = premios.find(p => p.faixa === 1) || { numeroDeGanhadores: 0, valorPremio: 0 };
        const quina = premios.find(p => p.faixa === 2) || { numeroDeGanhadores: 0, valorPremio: 0 };
        const quadra = premios.find(p => p.faixa === 3) || { numeroDeGanhadores: 0, valorPremio: 0 };

        const html = `
            <div class="draw-info-header">
                <span class="draw-number-badge">🎉 Concurso ${data.numero} - MEGA DA VIRADA!</span>
                <span class="draw-date">${data.dataApuracao} - ${data.localSorteio} (${data.nomeMunicipioUFSorteio})</span>
            </div>
            
            <div class="draw-numbers-container">
                ${data.listaDezenas.map(d => `<div class="draw-ball">${d}</div>`).join('')}
            </div>
            
            <div class="awards-list">
                <div class="award-item">
                    <span class="award-category">SENA (6 acertos)</span>
                    <div class="game-result">
                        <span class="award-value">${sena.numeroDeGanhadores === 0 ? 'ACUMULOU!' : 'R$ ' + formatCurrencyValue(sena.valorPremio)}</span>
                        <span class="award-winners">${sena.numeroDeGanhadores} ganhadores</span>
                    </div>
                </div>
                <div class="award-item">
                    <span class="award-category">QUINA (5 acertos)</span>
                    <div class="game-result">
                        <span class="award-value">R$ ${formatCurrencyValue(quina.valorPremio)}</span>
                        <span class="award-winners">${quina.numeroDeGanhadores} ganhadores</span>
                    </div>
                </div>
                <div class="award-item">
                    <span class="award-category">QUADRA (4 acertos)</span>
                    <div class="game-result">
                        <span class="award-value">R$ ${formatCurrencyValue(quadra.valorPremio)}</span>
                        <span class="award-winners">${quadra.numeroDeGanhadores} ganhadores</span>
                    </div>
                </div>
            </div>
            
            <div class="explain-card" style="margin-top: 20px;">
                <p><strong>Arrecadação Total:</strong> R$ ${formatCurrencyValue(data.valorArrecadado)}</p>
                <p><strong>Prêmio Total:</strong> R$ ${formatCurrencyValue(data.valorAcumuladoConcurso_0_5 || data.valorEstimadoProximoConcurso)}</p>
            </div>
        `;

        content.innerHTML = html;

    } catch (error) {
        content.innerHTML = `
            <div class="loading-draw" style="text-align: center; padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">❌</div>
                <h3 style="color: #ff6b6b; margin-bottom: 10px;">Erro de Conexão</h3>
                <p style="color: var(--text-secondary);">Não foi possível conectar à API oficial da Caixa.</p>
                <button class="btn btn-primary" onclick="fetchLastDrawData()" style="margin-top: 20px;">🔄 Tentar Novamente</button>
            </div>
        `;
    }
}

/**
 * Formata valor monetário sem cifrão
 */
function formatCurrencyValue(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Inicializa o contador de visitas GLOBAL
 * Usa API V1 pública do CounterAPI (sem token)
 */
async function initVisitCounter() {
    const totalEl = document.getElementById('totalVisits');
    const NAMESPACE = 'bolao-mega-virada-2025';

    try {
        // Total de Visitas: Incrementa sempre
        const totalResp = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/visitas/up`);
        const totalData = await totalResp.json();
        totalEl.textContent = formatNumber(totalData.count);
    } catch (error) {
        console.error('Erro no contador:', error);
        if (totalEl.textContent === '-') totalEl.textContent = '1';
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

/**
 * Alterna entre bolões (9 ou 6 números)
 */
function switchBolao(bolaoType) {
    state.activeBolao = bolaoType;

    // Atualiza botões toggle
    const toggle9 = document.getElementById('toggleBolao9');
    const toggle6 = document.getElementById('toggleBolao6');

    if (toggle9) toggle9.classList.toggle('active', bolaoType === 9);
    if (toggle6) toggle6.classList.toggle('active', bolaoType === 6);

    // Atualiza indicador
    const indicator = document.getElementById('bolaoIndicator');
    if (indicator) {
        indicator.innerHTML = bolaoType === 9
            ? '🏆 Bolão Principal'
            : '🎲 Bolão 2';
    }

    // Carrega jogos do bolão selecionado
    const textarea = document.getElementById('gamesTextarea');
    if (textarea) {
        if (bolaoType === 9 && typeof DEFAULT_GAMES_LIST !== 'undefined') {
            textarea.value = DEFAULT_GAMES_LIST.trim();
        } else if (bolaoType === 6 && typeof DEFAULT_GAMES_LIST_6 !== 'undefined') {
            textarea.value = DEFAULT_GAMES_LIST_6.trim() || '# Bolão 2\n# Jogos ainda não cadastrados...';
        }
        updateGamesCount();
    }

    // Toast de feedback
    showToast(bolaoType === 9
        ? '🏆 Visualizando Bolão Principal'
        : '🎲 Visualizando Bolão 2', 'info');
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

    // Validação automática ao completar 6 números
    if (state.selectedNumbers.length === 6) {
        validateGames();
    }
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
/**
 * Atualiza os cálculos da calculadora de cotas
 */
function updateCalculator() {
    // Inputs de cotas
    const inputPrincipal = document.getElementById('quotasInput');
    const inputBolao2 = document.getElementById('quotasInputBolao2');

    const cotasPrincipal = parseInt(inputPrincipal?.value) || 0;
    const cotasBolao2 = parseInt(inputBolao2?.value) || 0;

    // Valor investido
    const investidoPrincipal = cotasPrincipal * BOLAO_CONFIG.valorCota; // 25.20
    const investidoBolao2 = cotasBolao2 * BOLAO_CONFIG.valorCotaBolao2; // 6.00
    const investidoTotal = investidoPrincipal + investidoBolao2;

    document.getElementById('investedValue').textContent = formatCurrency(investidoTotal);

    // Participação percentual (apenas para referência interna ou tooltip, não exibido diretamente mais como % único)
    const partPrincipal = cotasPrincipal / BOLAO_CONFIG.totalCotas;
    const partBolao2 = cotasBolao2 / BOLAO_CONFIG.totalCotasBolao2;

    // SE TEMOS DADOS REAIS DE VALIDAÇÃO (O BOLÃO GANHOU ALGO?)
    if (state.totalLiquidoValidado !== undefined && state.totalLiquidoValidado >= 0) {
        // Cálculo de Retorno Real

        // Retorno vindo do Bolão Principal
        // (Prêmio Líquido Principal / Total Cotas Princ) * Minhas Cotas Princ
        // Mas calculate prêmio líquido total já, então:
        // state.totalLiquidoPrincipal é o valor TOTAL ganho pelo bolão inteiro.
        const retornoPrincipal = state.totalLiquidoPrincipal * partPrincipal;

        // Retorno vindo do Bolão 2
        const retornoBolao2 = state.totalLiquidoBolao2 * partBolao2;

        const retornoTotal = retornoPrincipal + retornoBolao2;

        // Atualiza UI
        const elReturnPrincipal = document.getElementById('returnPrincipal');
        const elReturnBolao2 = document.getElementById('returnBolao2');
        const elReturnTotal = document.getElementById('estimatedReturn');

        if (elReturnPrincipal) elReturnPrincipal.textContent = formatCurrency(retornoPrincipal);
        if (elReturnBolao2) elReturnBolao2.textContent = formatCurrency(retornoBolao2);
        if (elReturnTotal) {
            elReturnTotal.innerHTML = `<span style="color: #2ecc71; font-weight: bold; font-size: 1.2em">${formatCurrency(retornoTotal)}</span>`;
        }

        // Resultados Detalhados
        const detailsContainer = document.getElementById('resultDetails');
        if (state.breakdown && (retornoPrincipal > 0 || retornoBolao2 > 0)) {
            if (detailsContainer) detailsContainer.style.display = 'block';

            // Helper para calcular parcela
            const calcParcela = (valorTotal, totalCotas, minhasCotas) => {
                if (!valorTotal || totalCotas === 0) return 0;
                return (valorTotal / totalCotas) * minhasCotas;
            };

            // Principal
            const senaP = calcParcela(state.breakdown.principal?.sena, BOLAO_CONFIG.totalCotas, cotasPrincipal);
            const quinaP = calcParcela(state.breakdown.principal?.quina, BOLAO_CONFIG.totalCotas, cotasPrincipal);
            const quadraP = calcParcela(state.breakdown.principal?.quadra, BOLAO_CONFIG.totalCotas, cotasPrincipal);

            const elPrincSena = document.getElementById('detailPrincipalSena');
            const elPrincQuina = document.getElementById('detailPrincipalQuina');
            const elPrincQuadra = document.getElementById('detailPrincipalQuadra');

            if (elPrincSena) elPrincSena.textContent = formatCurrency(senaP);
            if (elPrincQuina) elPrincQuina.textContent = formatCurrency(quinaP);
            if (elPrincQuadra) elPrincQuadra.textContent = formatCurrency(quadraP);

            // Bolao 2
            const senaB2 = calcParcela(state.breakdown.bolao2?.sena, BOLAO_CONFIG.totalCotasBolao2, cotasBolao2);
            const quinaB2 = calcParcela(state.breakdown.bolao2?.quina, BOLAO_CONFIG.totalCotasBolao2, cotasBolao2);
            const quadraB2 = calcParcela(state.breakdown.bolao2?.quadra, BOLAO_CONFIG.totalCotasBolao2, cotasBolao2);

            const elB2Sena = document.getElementById('detailBolao2Sena');
            const elB2Quina = document.getElementById('detailBolao2Quina');
            const elB2Quadra = document.getElementById('detailBolao2Quadra');

            if (elB2Sena) elB2Sena.textContent = formatCurrency(senaB2);
            if (elB2Quina) elB2Quina.textContent = formatCurrency(quinaB2);
            if (elB2Quadra) elB2Quadra.textContent = formatCurrency(quadraB2);

            // MEMÓRIA DE CÁLCULO VISUAL
            const calcMemory = document.getElementById('calculationMemory');
            if (calcMemory && state.calculoDetalhado) {
                calcMemory.style.display = 'block';
                const cd = state.calculoDetalhado;

                // Detalhamento por faixa
                document.getElementById('calcSenaTotal').textContent = formatCurrency(cd.senaBruto);
                document.getElementById('calcQuinaTotal').textContent = formatCurrency(cd.quinaBruto);
                document.getElementById('calcQuadraTotal').textContent = formatCurrency(cd.quadraBruto);

                // Totais consolidados
                document.getElementById('calcPremioBruto').textContent = formatCurrency(cd.totalBruto);
                document.getElementById('calcTaxaAdmin').textContent = formatCurrency(cd.taxaAdmin);
                document.getElementById('calcPremioLiquido').textContent = formatCurrency(cd.totalLiquido);
                document.getElementById('calcTotalCotas').textContent = cd.totalCotas.toLocaleString('pt-BR');
                document.getElementById('calcPremioPorCota').textContent = formatCurrency(cd.premioPorCota);
                document.getElementById('calcSuasCotas').textContent = (cotasPrincipal + cotasBolao2).toLocaleString('pt-BR');
                document.getElementById('calcSeuPremio').textContent = formatCurrency(retornoTotal);
            }

        } else {
            if (detailsContainer) detailsContainer.style.display = 'none';
            const calcMemory = document.getElementById('calculationMemory');
            if (calcMemory) calcMemory.style.display = 'none';
        }

    } else {
        // Modo Estimativa (sem validação)
        // Mostra zerado ou traços
        document.getElementById('returnPrincipal').textContent = "R$ 0,00";
        document.getElementById('returnBolao2').textContent = "R$ 0,00";
        document.getElementById('estimatedReturn').textContent = "R$ 0,00";
    }
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
    let currentSource = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detecta marcador de arquivo (Ex: # Arquivo: XYZ.pdf ou // Arquivo: XYZ)
        if (/^([#\/]+)\s*Arquivo:/i.test(line)) {
            // Extrai o nome do arquivo
            currentSource = line.replace(/^([#\/]+)\s*Arquivo:\s*/i, '').trim();
            continue;
        }

        // Ignora linhas de comentário que não são de arquivo, ou vazias
        if (line === '' || line.startsWith('//') || (line.startsWith('#') && !line.toLowerCase().includes('arquivo'))) continue;

        // Remove múltiplos espaços e divide
        const numbers = line
            .replace(/[\s,;\-]+/g, ' ')
            .trim()
            .split(' ')
            .map(n => parseInt(n))
            .filter(n => !isNaN(n) && n >= 1 && n <= 60);

        const uniqueNumbers = [...new Set(numbers)];

        if (uniqueNumbers.length >= 6 && uniqueNumbers.length <= 15) {
            games.push({
                id: games.length + 1,
                numbers: uniqueNumbers.sort((a, b) => a - b),
                lineNumber: i + 1,
                source: currentSource
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
 * Considera jogos de ambos os bolões se os checkboxes estiverem marcados
 */
function validateGames() {
    // Verifica se 6 números foram selecionados
    if (state.selectedNumbers.length !== 6) {
        showToast('Por favor, selecione exatamente 6 números sorteados!', 'error');
        return;
    }

    // Coleta jogos de todos os bolões marcados para participação
    let allGames = [];

    // Bolão Principal
    if (state.participaBolao9 && typeof GAMES_DATABASE_9 !== 'undefined') {
        GAMES_DATABASE_9.forEach(group => {
            group.games.forEach(game => {
                const numbers = game.split(/\s+/).map(n => parseInt(n));
                allGames.push({
                    numbers: numbers,
                    source: group.source,
                    bolao: 'Principal'
                });
            });
        });
    }

    // Bolão 2
    if (state.participaBolao6 && typeof GAMES_DATABASE_6 !== 'undefined') {
        GAMES_DATABASE_6.forEach(group => {
            group.games.forEach(game => {
                const numbers = game.split(/\s+/).map(n => parseInt(n));
                allGames.push({
                    numbers: numbers,
                    source: group.source,
                    bolao: 'Bolão 2'
                });
            });
        });
    }

    // Se nenhum bolão marcado, usa os jogos do textarea (como fallback)
    if (allGames.length === 0) {
        if (state.parsedGames.length === 0) {
            showToast('Marque pelo menos um bolão ou cole jogos no campo!', 'error');
            return;
        }
        allGames = state.parsedGames;
    }

    const sorteados = new Set(state.selectedNumbers);
    const results = [];

    let totalSenas = 0;
    let totalQuinas = 0;
    let totalQuadras = 0;

    // Totais separados por bolão
    let totalsPrincipal = { senas: 0, quinas: 0, quadras: 0 };
    let totalsBolao2 = { senas: 0, quinas: 0, quadras: 0 };

    for (const game of allGames) {
        // Conta quantos números do jogo foram sorteados
        const acertos = game.numbers.filter(n => sorteados.has(n));
        const numAcertos = acertos.length;

        // Calcula quantas senas/quinas/quadras esse jogo gerou
        const combinacoes = calcularCombinacoes(game.numbers.length, numAcertos);

        totalSenas += combinacoes.senas;
        totalQuinas += combinacoes.quinas;
        totalQuadras += combinacoes.quadras;

        // Soma nos totais específicos
        if (game.bolao === 'Principal') {
            totalsPrincipal.senas += combinacoes.senas;
            totalsPrincipal.quinas += combinacoes.quinas;
            totalsPrincipal.quadras += combinacoes.quadras;
        } else if (game.bolao === 'Bolão 2') {
            totalsBolao2.senas += combinacoes.senas;
            totalsBolao2.quinas += combinacoes.quinas;
            totalsBolao2.quadras += combinacoes.quadras;
        }

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
        },
        totalsPrincipal: totalsPrincipal,
        totalsBolao2: totalsBolao2
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

    // Lê os valores dos campos    // Calculadora de Cotas
    const quotasInput = document.getElementById('quotasInput'); // Principal
    const quotasInputBolao2 = document.getElementById('quotasInputBolao2'); // Bolão 2

    // Ganhadores Brasil
    const totalSenaWinnersInput = document.getElementById('totalSenaWinners');
    const totalQuinaWinnersInput = document.getElementById('totalQuinaWinners');
    const totalQuadraWinnersInput = document.getElementById('totalQuadraWinners');

    if (quotasInput) {
        quotasInput.addEventListener('input', updateCalculator);
    }
    if (quotasInputBolao2) {
        quotasInputBolao2.addEventListener('input', updateCalculator);
    }
    const totalSenaWinners = parseInt(totalSenaWinnersInput.value) || BOLAO_CONFIG.estimativaGanhadoresSena;
    const totalQuinaWinners = parseInt(totalQuinaWinnersInput.value) || BOLAO_CONFIG.estimativaGanhadoresQuina;
    const totalQuadraWinners = parseInt(totalQuadraWinnersInput.value) || BOLAO_CONFIG.estimativaGanhadoresQuadra;

    // Calcula prêmios baseados nos ganhadores informados
    // Se tivermos os valores reais da API, usamos eles. Senão, estimamos.
    let premioSenaPorGanhador, premioQuinaPorGanhador, premioQuadraPorGanhador;

    if (state.premiosReais && state.premiosReais.sena > 0) {
        premioSenaPorGanhador = state.premiosReais.sena;
        premioQuinaPorGanhador = state.premiosReais.quina;
        premioQuadraPorGanhador = state.premiosReais.quadra;
    } else {
        // Estimativa baseada no rateio teórico
        const premioTotalSena = BOLAO_CONFIG.premioTotal * BOLAO_CONFIG.percentualSena;
        const premioTotalQuina = BOLAO_CONFIG.premioTotal * BOLAO_CONFIG.percentualQuina;
        const premioTotalQuadra = BOLAO_CONFIG.premioTotal * BOLAO_CONFIG.percentualQuadra;

        premioSenaPorGanhador = premioTotalSena / totalSenaWinners;
        premioQuinaPorGanhador = premioTotalQuina / totalQuinaWinners;
        premioQuadraPorGanhador = premioTotalQuadra / totalQuadraWinners;
    }

    // Prêmio bruto do bolão (multiplicado pela quantidade que o bolão ganhou)
    const senaBruto = totals.senas * premioSenaPorGanhador;
    const quinaBruto = totals.quinas * premioQuinaPorGanhador;
    const quadraBruto = totals.quadras * premioQuadraPorGanhador;
    const totalBruto = senaBruto + quinaBruto + quadraBruto;

    // Prêmio líquido geral (após desconto do admin de 10%)
    const senaLiquido = senaBruto * (1 - BOLAO_CONFIG.descontoAdmin);
    const quinaLiquido = quinaBruto * (1 - BOLAO_CONFIG.descontoAdmin);
    const quadraLiquido = quadraBruto * (1 - BOLAO_CONFIG.descontoAdmin);
    const totalLiquido = totalBruto * (1 - BOLAO_CONFIG.descontoAdmin);

    // CÁLCULO SEPARADO POR BOLÃO E POR CATEGORIA
    const desconto = 1 - BOLAO_CONFIG.descontoAdmin;

    // Bolão Principal
    const { totalsPrincipal } = state.validationResults;

    const senaBrutoPrincipal = totalsPrincipal.senas * premioSenaPorGanhador;
    const quinaBrutoPrincipal = totalsPrincipal.quinas * premioQuinaPorGanhador;
    const quadraBrutoPrincipal = totalsPrincipal.quadras * premioQuadraPorGanhador;

    // Bolão 2
    const { totalsBolao2 } = state.validationResults;

    const senaBrutoBolao2 = totalsBolao2.senas * premioSenaPorGanhador;
    const quinaBrutoBolao2 = totalsBolao2.quinas * premioQuinaPorGanhador;
    const quadraBrutoBolao2 = totalsBolao2.quadras * premioQuadraPorGanhador;

    // Totais Líquidos
    const liquidoPrincipal = (senaBrutoPrincipal + quinaBrutoPrincipal + quadraBrutoPrincipal) * desconto;
    const liquidoBolao2 = (senaBrutoBolao2 + quinaBrutoBolao2 + quadraBrutoBolao2) * desconto;

    // Salva no estado para a calculadora usar, incluindo breakdown
    state.totalLiquidoValidado = totalLiquido;
    state.totalLiquidoPrincipal = liquidoPrincipal;
    state.totalLiquidoBolao2 = liquidoBolao2;
    state.breakdown = {
        principal: {
            sena: senaBrutoPrincipal * desconto,
            quina: quinaBrutoPrincipal * desconto,
            quadra: quadraBrutoPrincipal * desconto
        },
        bolao2: {
            sena: senaBrutoBolao2 * desconto,
            quina: quinaBrutoBolao2 * desconto,
            quadra: quadraBrutoBolao2 * desconto
        }
    };

    // MEMÓRIA DE CÁLCULO DETALHADO (para exibição visual passo a passo)
    state.calculoDetalhado = {
        // Valores por faixa (bruto)
        senaBruto: senaBruto,
        quinaBruto: quinaBruto,
        quadraBruto: quadraBruto,

        // Totais consolidados
        totalBruto: totalBruto,
        taxaAdmin: totalBruto * BOLAO_CONFIG.descontoAdmin,
        totalLiquido: totalLiquido,

        // Cálculo por cota
        totalCotas: BOLAO_CONFIG.totalCotas + BOLAO_CONFIG.totalCotasBolao2,
        premioPorCota: totalLiquido / (BOLAO_CONFIG.totalCotas + BOLAO_CONFIG.totalCotasBolao2)
    };

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

    // Atualiza a calculadora para refletir o prêmio real instantaneamente
    updateCalculator();

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
 * @param {Array} results - Resultados da validação
 * @param {string} filter - Filtro: 'all', 'sena', 'quina', 'quadra', 'bolao-principal', 'bolao-2'
 */
function renderGamesList(results, filter = 'all') {
    const list = document.getElementById('gamesList');
    list.innerHTML = '';

    // Aplica filtro
    let filtered = results;
    if (filter === 'bolao-principal') {
        filtered = results.filter(g => g.bolao === 'Principal');
    } else if (filter === 'bolao-2') {
        filtered = results.filter(g => g.bolao === 'Bolão 2');
    } else if (filter !== 'all') {
        filtered = results.filter(g => g.categoria === filter);
    }

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhum jogo encontrado nesta categoria.</p>';
        return;
    }

    const sorteados = new Set(state.selectedNumbers);

    for (const game of filtered) {
        const div = document.createElement('div');
        div.className = `game-item ${game.categoria}`;
        div.dataset.categoria = game.categoria;
        div.dataset.bolao = game.bolao || '';

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

        // Badge de Bolão (colorido)
        let bolaoBadge = '';
        if (game.bolao === 'Principal') {
            bolaoBadge = '<span style="display: inline-block; background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; margin-left: 6px;">🏆 PRINCIPAL</span>';
        } else if (game.bolao === 'Bolão 2') {
            bolaoBadge = '<span style="display: inline-block; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; margin-left: 6px;">🎲 BOLÃO 2</span>';
        }

        // Badge de Origem (arquivo)
        const sourceBadge = game.source ? `<span style="display: inline-block; background: rgba(255, 255, 255, 0.1); color: #aaa; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; margin-left: 6px; border: 1px solid rgba(255, 255, 255, 0.2);">📂 ${game.source}</span>` : '';

        div.innerHTML = `
            <div>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Jogo #${game.id} (${game.numbers.length} nums)</span>
                ${bolaoBadge}
                ${sourceBadge}
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

// ============================================
// EDIÇÃO DE DADOS DO BOLÃO
// ============================================

function initBolaoEdit() {
    const btnEdit = document.getElementById('editBolaoBtn');
    const btnSave = document.getElementById('saveBolaoBtn');

    if (btnEdit) btnEdit.addEventListener('click', toggleEditBolao);
    if (btnSave) btnSave.addEventListener('click', saveBolaoInfo);
}

function toggleEditBolao() {
    const isEditing = document.getElementById('saveBolaoBtn').style.display !== 'none';

    // Elementos
    const viewEls = ['viewArrecadacao', 'viewParticipantes', 'viewTotalCotas', 'viewTotalCotasBolao2', 'viewValorCota', 'viewPixes'];
    const editEls = ['editArrecadacao', 'editParticipantes', 'editTotalCotas', 'editTotalCotasBolao2', 'editValorCota', 'editPixes'];

    // Toggle buttons
    document.getElementById('editBolaoBtn').style.display = isEditing ? 'block' : 'none';
    document.getElementById('saveBolaoBtn').style.display = isEditing ? 'none' : 'block';

    if (!isEditing) {
        // Entrando no modo edição - Preenche inputs com valores atuais
        // Arrecadacao
        const arrecadacao = BOLAO_CONFIG.arrecadacaoTotal;
        document.getElementById('editArrecadacao').value = arrecadacao.toFixed(2);

        // Participantes
        document.getElementById('editParticipantes').value = BOLAO_CONFIG.participantes;

        // Total Cotas
        // Total Cotas
        document.getElementById('editTotalCotas').value = BOLAO_CONFIG.totalCotas;
        document.getElementById('editTotalCotasBolao2').value = BOLAO_CONFIG.totalCotasBolao2;

        // Valor Cota
        document.getElementById('editValorCota').value = BOLAO_CONFIG.valorCota.toFixed(2);

        // Pixes
        document.getElementById('editPixes').value = BOLAO_CONFIG.pixes;
    }

    // Toggle visibility e estilo visual
    viewEls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = isEditing ? 'block' : 'none';
    });

    editEls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = isEditing ? 'none' : 'block';
    });
}

function saveBolaoInfo() {
    // Lê e valida valores
    const newArrecadacao = parseFloat(document.getElementById('editArrecadacao').value);
    const newParticipantes = parseInt(document.getElementById('editParticipantes').value);
    const newTotalCotas = parseInt(document.getElementById('editTotalCotas').value);
    const newTotalCotasBolao2 = parseInt(document.getElementById('editTotalCotasBolao2').value);
    const newValorCota = parseFloat(document.getElementById('editValorCota').value);
    const newPixes = parseInt(document.getElementById('editPixes').value);

    if (isNaN(newArrecadacao) || isNaN(newParticipantes) || isNaN(newTotalCotas) || isNaN(newValorCota)) {
        showToast('❌ Valores inválidos! Verifique os números.', 'error');
        return;
    }

    // Atualiza Config
    BOLAO_CONFIG.arrecadacaoTotal = newArrecadacao;
    BOLAO_CONFIG.participantes = newParticipantes;
    BOLAO_CONFIG.totalCotas = newTotalCotas;
    BOLAO_CONFIG.totalCotasBolao2 = newTotalCotasBolao2;
    BOLAO_CONFIG.valorCota = newValorCota;
    BOLAO_CONFIG.pixes = newPixes;

    // Atualiza Views View
    document.getElementById('viewArrecadacao').textContent = formatCurrency(newArrecadacao);
    document.getElementById('viewParticipantes').textContent = newParticipantes.toLocaleString('pt-BR') + ' pessoas';
    document.getElementById('viewTotalCotas').textContent = newTotalCotas.toLocaleString('pt-BR');
    document.getElementById('viewTotalCotasBolao2').textContent = newTotalCotasBolao2.toLocaleString('pt-BR');
    document.getElementById('viewValorCota').textContent = formatCurrency(newValorCota);
    document.getElementById('viewPixes').textContent = newPixes.toLocaleString('pt-BR');

    // Atualiza Helper da Calculadora
    const helper = document.getElementById('helperValorCota');
    if (helper) helper.textContent = formatCurrency(newValorCota);

    // Atualiza Cálculos existentes
    updateCalculator();

    // Sai do modo edição
    toggleEditBolao();

    showToast('💾 Dados do bolão atualizados!', 'info');
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

/* ============================================
   FUNCIONALIDADES DE EXPORTAÇÃO E VISUALIZAÇÃO
   ============================================ */

function showGamesModal() {
    const modal = document.getElementById('gamesListModal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.getElementById('searchGameInput').value = '';
    filterGamesList('');
}

function closeGamesModal() {
    const modal = document.getElementById('gamesListModal');
    if (modal) modal.style.display = 'none';
}

function getGamesFromStruct() {
    let list = [];

    // Seleciona banco de dados baseado no bolão ativo
    const db = state.activeBolao === 6 ? GAMES_DATABASE_6 : GAMES_DATABASE_9;

    if (db && Array.isArray(db)) {
        db.forEach(group => {
            group.games.forEach(g => list.push({ source: group.source, numbers: g }));
        });
    }
    return list;
}

function parseTextareaToGames(text) {
    let list = [];
    const lines = text.split('\n');
    let currentSource = 'Manual / Desconhecido';
    lines.forEach(line => {
        const l = line.trim();
        if (!l) return;
        if (l.startsWith('# Arquivo:')) {
            currentSource = l.replace('# Arquivo:', '').trim();
        } else if (l.replace(/[^0-9]/g, '').length >= 6) {
            list.push({ source: currentSource, numbers: l });
        }
    });
    return list;
}

function getFlatGamesList() {
    const textarea = document.getElementById('gamesTextarea');
    // Se o textarea estiver vazio ou oculto, usa a estrutura de dados interna
    // Isso prioriza os dados carregados do arquivo .js
    return getGamesFromStruct();
}

function filterGamesList(query) {
    const allGames = getFlatGamesList();
    const searchTerm = query.toLowerCase().trim();

    const filtered = allGames.filter(g => {
        return g.numbers.includes(searchTerm) || g.source.toLowerCase().includes(searchTerm);
    });

    populateGamesTable(filtered);
}

function populateGamesTable(games) {
    const table = document.getElementById('gamesTablePreview');
    if (!table) return;
    const actualTbody = table.getElementsByTagName('tbody')[0];

    actualTbody.innerHTML = '';

    const gamesToShow = games.slice(0, 500);

    gamesToShow.forEach((game, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">${index + 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9em; color: #aaa;">${game.source}</td>
            <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); font-family: monospace; font-size: 1.1em; color: #ffd700;">
                ${game.numbers.split(' ').map(n => `<span style="display:inline-block; padding:2px 6px; background:rgba(255,255,255,0.1); border-radius:4px; margin:0 2px;">${n}</span>`).join('')}
            </td>
        `;
        actualTbody.appendChild(row);
    });

    if (games.length > 500) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="3" style="text-align:center; padding: 15px; color: #aaa;">... e mais ${games.length - 500} jogos (use a busca ou baixe o Excel)</td>`;
        actualTbody.appendChild(row);
    }

    if (games.length === 0) {
        actualTbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">Nenhum jogo encontrado.</td></tr>';
    }
}

function getDownloadFilename(ext) {
    const tipo = state.activeBolao === 6 ? 'Bolao2_Jogos' : 'BolaoPrincipal_Jogos';
    return `${tipo}_MegaVirada2025.${ext}`;
}

function downloadExcel() {
    const games = getFlatGamesList();
    if (games.length === 0) {
        showToast('Nenhum jogo para baixar.', 'warning');
        return;
    }

    const data = games.map((g, i) => ({
        'ID': i + 1,
        'Arquivo de Origem': g.source,
        'Dezenas': g.numbers
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    const wscols = [{ wch: 6 }, { wch: 50 }, { wch: 30 }];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Jogos Bolão");
    XLSX.writeFile(wb, getDownloadFilename('xlsx'));
    showToast('📊 Download do Excel iniciado!');
}

function downloadCSV() {
    const games = getFlatGamesList();
    if (games.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Origem,Dezenas\r\n";

    games.forEach((g, i) => {
        csvContent += `${i + 1},"${g.source}","${g.numbers}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", getDownloadFilename('csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📄 Download do CSV iniciado!');
}

function downloadTXT() {
    const games = getFlatGamesList();
    if (games.length === 0) return;

    let txtContent = "";
    let lastSource = "";

    games.forEach((g) => {
        // Agrupa por fonte para ficar mais legível
        if (g.source !== lastSource) {
            txtContent += `\n# Arquivo: ${g.source}\n`;
            lastSource = g.source;
        }
        txtContent += `${g.numbers}\n`;
    });

    // Remove primeira quebra de linha se houver
    txtContent = txtContent.trim();

    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getDownloadFilename('txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📝 Download do TXT iniciado!');
}
