// Rendering functions for the Ranking Command Center

class Renderer {
    constructor() {
        this.mainChartInstance = null;
    }

    renderTeamCompetition(kpis) {
        const dg = kpis['DOLLAR GODS'] || { totalDeposito: 0, activationCount: 0, avgDeposit: 0 };
        const es = kpis['ELITE SQUAD'] || { totalDeposito: 0, activationCount: 0, avgDeposit: 0 };
        
        const winner = dg.totalDeposito > es.totalDeposito ? 'DOLLAR GODS' : 
                      (es.totalDeposito > dg.totalDeposito ? 'ELITE SQUAD' : null);
        
        const teamContent = document.getElementById('team-competition-content');
        teamContent.innerHTML = `
            <div class="fade-in-child team-card transition-all duration-500 ${winner === 'DOLLAR GODS' ? 'winning-team' : ''}" 
                 style="animation-delay: 200ms;">
                <div class="h-full">
                    <div class="text-center mb-6">
                        <h2 class="text-4xl font-black text-white mb-2">DOLLAR GODS</h2>
                        <div class="h-8 flex items-center justify-center">
                            ${winner === 'DOLLAR GODS' ? 
                                '<span class="text-yellow-400 font-bold text-lg animate-pulse">🏆 LIDERANDO</span>' : 
                                '<span class="text-gray-400">Em competição</span>'
                            }
                        </div>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                        <div class="bg-black/30 rounded-xl border border-blue-500/20 kpi-card">
                            <p class="kpi-label">Total em Depósitos</p>
                            <p class="currency-value text-blue-400">${RankingUtils.formatCurrency(dg.totalDeposito)}</p>
                        </div>
                        <div class="bg-black/30 rounded-xl border border-teal-500/20 kpi-card">
                            <p class="kpi-label">Ativações</p>
                            <p class="kpi-value text-teal-400">${dg.activationCount}</p>
                        </div>
                        <div class="bg-black/30 rounded-xl border border-purple-500/20 kpi-card">
                            <p class="kpi-label">Taxa de Conversão</p>
                            <p class="kpi-value text-purple-400">${(dg.conversionRate || 0).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="fade-in-child team-card transition-all duration-500 ${winner === 'ELITE SQUAD' ? 'winning-team' : ''}" 
                 style="animation-delay: 300ms;">
                <div class="h-full">
                    <div class="text-center mb-6">
                        <h2 class="text-4xl font-black text-white mb-2">ELITE SQUAD</h2>
                        <div class="h-8 flex items-center justify-center">
                            ${winner === 'ELITE SQUAD' ? 
                                '<span class="text-yellow-400 font-bold text-lg animate-pulse">🏆 LIDERANDO</span>' : 
                                '<span class="text-gray-400">Em competição</span>'
                            }
                        </div>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                        <div class="bg-black/30 rounded-xl border border-blue-500/20 kpi-card">
                            <p class="kpi-label">Total em Depósitos</p>
                            <p class="currency-value text-blue-400">${RankingUtils.formatCurrency(es.totalDeposito)}</p>
                        </div>
                        <div class="bg-black/30 rounded-xl border border-teal-500/20 kpi-card">
                            <p class="kpi-label">Ativações</p>
                            <p class="kpi-value text-teal-400">${es.activationCount}</p>
                        </div>
                        <div class="bg-black/30 rounded-xl border border-purple-500/20 kpi-card">
                            <p class="kpi-label">Taxa de Conversão</p>
                            <p class="kpi-value text-purple-400">${(es.conversionRate || 0).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSingleRanking(title, data, rankingType, isOverall = false, dataProcessor) {
        let contentHTML = `
            <div class="min-h-0 flex flex-col fade-in-child">
                <h3 class="text-2xl font-bold text-white mb-6 text-center">${title}</h3>
        `;
        
        if (data.length === 0) {
            contentHTML += `
                <div class="bg-black/20 rounded-xl flex-grow flex items-center justify-center">
                    <p class="text-gray-500">Nenhum dado disponível.</p>
                </div>
            </div>`;
        } else {
            let listHTML = '<div class="space-y-3 overflow-y-auto flex-grow pr-2 ranking-list">';
            
            data.forEach((broker, index) => {
                const rank = index + 1;
                const rankChange = dataProcessor.getRankChange(broker.brokerName, rank, rankingType);
                
                let valueText;
                if (rankingType === 'value') {
                    valueText = RankingUtils.formatCurrency(broker.totalDeposito);
                } else if (rankingType === 'activation') {
                    valueText = `${broker.activationCount} Ativações`;
                } else {
                    valueText = `${(broker.generalScore * 100).toFixed(1)}%`;
                }
                
                const initials = RankingUtils.getInitials(broker.brokerName);
                const teamColorClass = isOverall ? 
                    (broker.team === 'DOLLAR GODS' ? 'avatar-team-dg' : 'avatar-team-es') : '';
                
                const podiumClass = rank <= 3 && isOverall ? `podium-${rank}` : '';
                const highlightClass = rankChange.change !== 0 ? 'highlight-change' : '';
                
                const rankIndicator = rankChange.change > 0 ? `<span class="text-green-400 font-bold text-lg">↑${rankChange.change}</span>` : 
                                  rankChange.change < 0 ? `<span class="text-red-400 font-bold text-lg">↓${Math.abs(rankChange.change)}</span>` : 
                                  `<span class="text-gray-400 font-bold text-lg">-</span>`;
                
                listHTML += `
                    <div class="flex items-center bg-black/20 p-2 rounded-xl transition duration-300 ${highlightClass} leaderboard-item">
                        <span class="text-md font-bold text-gray-400 w-8 text-center">${rank}º</span>
                        <div class="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm text-white mx-2 border-2 avatar-ring ${rank <= 3 && isOverall ? `podium-${rank}`: ''} ${teamColorClass}">
                            ${initials}
                        </div>
                        <span class="font-semibold text-gray-200 broker-name">${broker.brokerName}</span>
                        ${rankIndicator}
                        <span class="text-sm font-semibold text-gray-300 ml-2 value-text text-right">${valueText}</span>
                    </div>
                `;
            });
            
            listHTML += '</div>';
            contentHTML += listHTML + '</div>';
        }
        
        return contentHTML;
    }

    renderLeaderboard(rankingData, rankingType, dataProcessor) {
        const dollarGodsData = rankingData.filter(b => b.team === 'DOLLAR GODS');
        const eliteSquadData = rankingData.filter(b => b.team === 'ELITE SQUAD');

        const leaderboardContent = document.getElementById('leaderboard-content');
        leaderboardContent.innerHTML = 
            this.renderSingleRanking('DOLLAR GODS', dollarGodsData, rankingType, false, dataProcessor) +
            this.renderSingleRanking('RANKING GERAL', rankingData, rankingType, true, dataProcessor) +
            this.renderSingleRanking('ELITE SQUAD', eliteSquadData, rankingType, false, dataProcessor);
    }

    renderAnalysisChart(chartData) {
        const existingChart = Chart.getChart('mainChart');
        if (existingChart) {
            existingChart.destroy();
        }

        // Enhanced chart configuration
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.font.family = 'Inter';
        
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        // Create gradient backgrounds
        const depositGradient = ctx.createLinearGradient(0, 0, 0, 400);
        depositGradient.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
        depositGradient.addColorStop(1, 'rgba(56, 189, 248, 0.1)');
        
        const activationGradient = ctx.createLinearGradient(0, 0, 0, 400);
        activationGradient.addColorStop(0, 'rgba(6, 214, 160, 0.8)');
        activationGradient.addColorStop(1, 'rgba(6, 214, 160, 0.1)');

        this.mainChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.brokerName),
                datasets: [
                    {
                        label: 'Valor Total Depositado',
                        data: chartData.map(d => d.totalDeposito),
                        backgroundColor: depositGradient,
                        borderColor: '#38BDF8',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Quantidade de Depósitos',
                        data: chartData.map(d => d.depositoCount),
                        type: 'line',
                        borderColor: '#06D6A0',
                        backgroundColor: activationGradient,
                        tension: 0.4,
                        yAxisID: 'y1',
                        pointBackgroundColor: '#06D6A0',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 18, 32, 0.95)',
                        titleColor: '#E5E7EB',
                        bodyColor: '#9CA3AF',
                        borderColor: '#38BDF8',
                        borderWidth: 1,
                        cornerRadius: 12,
                        padding: 16,
                        titleFont: {
                            size: 16,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                
                                if (context.dataset.yAxisID === 'y') {
                                    label += RankingUtils.formatCurrency(context.parsed.y);
                                } else {
                                    label += context.parsed.y + ' depósitos';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(56, 73, 117, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9CA3AF',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(56, 73, 117, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9CA3AF',
                            font: {
                                size: 12
                            },
                            callback: (value) => RankingUtils.formatCurrency(value)
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(6, 214, 160, 0.3)'
                        },
                        ticks: {
                            color: '#06D6A0',
                            font: {
                                size: 12
                            },
                            stepSize: 1,
                            precision: 0
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutCubic'
                }
            }
        });
    }

    populateFilters(availablePeriods) {
        const filterContainer = document.getElementById('filter-container');
        const tabsContainer = document.getElementById('tabs-container');
        const dotsContainer = document.getElementById('nav-dots-container');
        
        filterContainer.innerHTML = `
            <button class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold" data-period="all">
                Todos os Períodos
            </button>
            <button class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold" data-period="today">
                Hoje
            </button>
            <button class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold" data-period="this_week">
                Esta Semana
            </button>
            ${availablePeriods.map(period => `
                <button class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold" 
                        data-period="${period.value}">
                    ${period.text}
                </button>
            `).join('')}
        `;
        
        tabsContainer.innerHTML = `
            <button data-ranking="value" class="ranking-tab px-6 py-3 text-sm font-semibold rounded-lg transition">
                💰 Depósitos
            </button>
            <button data-ranking="activation" class="ranking-tab px-6 py-3 text-sm font-semibold rounded-lg transition">
                ⚡ Ativações
            </button>
            <button data-ranking="general" class="ranking-tab px-6 py-3 text-sm font-semibold rounded-lg transition">
                🏆 Geral
            </button>
        `;
        
        const views = ['view-teams', 'view-leaderboard', 'view-chart'];
        dotsContainer.innerHTML = views.map((_, i) => 
            `<div class="nav-dot" data-index="${i}"></div>`
        ).join('');
    }

    updateActiveFiltersAndTabs(currentPeriod, currentRankingType) {
        document.querySelectorAll('.filter-btn').forEach(btn => 
            btn.classList.toggle('filter-btn-active', btn.dataset.period === currentPeriod)
        );
        
        document.querySelectorAll('.ranking-tab').forEach(btn => 
            btn.classList.toggle('filter-btn-active', btn.dataset.ranking === currentRankingType)
        );
    }

    showLoader(message = 'Carregando...') {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'flex';
            const text = loader.querySelector('p');
            if (text) text.textContent = message;
        }
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    updateCountdown(secondsLeft) {
        const timer = document.getElementById('countdown-timer');
        if (timer) {
            if (secondsLeft <= 0) {
                timer.textContent = 'Atualizando...';
                return;
            }
            
            const minutes = Math.floor(secondsLeft / 60);
            const seconds = secondsLeft % 60;
            timer.textContent = `Próxima atualização: ${minutes}m ${seconds.toString().padStart(2, '0')}s`;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}
