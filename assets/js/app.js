// Main application controller for the Ranking Command Center

class RankingApp {
    constructor() {
        this.dataProcessor = new DataProcessor();
        this.renderer = new Renderer();
        this.currentViewIndex = 0;
        this.currentRankingType = 'value';
        this.currentPeriod = 'all';
        this.isPaused = false;
        this.rotationStartTime = 0;
        this.rotationRemainingTime = CONFIG.VIEW_ROTATION_INTERVAL;
        this.views = ['view-teams', 'view-leaderboard', 'view-chart'];
        
        // Timers and intervals
        this.dataRefreshIntervalId = null;
        this.countdownIntervalId = null;
        this.rotationTimeoutId = null;
        this.animationFrameId = null;
        
        this.initializeDOM();
    }

    initializeDOM() {
        this.DOM = {
            commandCenter: document.getElementById('command-center'),
            loader: document.getElementById('loader'),
            slides: this.views.map(id => document.getElementById(id)),
            progressBar: document.getElementById('progress-bar'),
            filterContainer: document.getElementById('filter-container'),
            tabsContainer: document.getElementById('tabs-container'),
            dotsContainer: document.getElementById('nav-dots-container'),
            chartPeriodTitle: document.getElementById('chart-period-title'),
            teamContent: document.getElementById('team-competition-content'),
            leaderboardContent: document.getElementById('leaderboard-content'),
            countdownTimer: document.getElementById('countdown-timer'),
            refreshBtn: document.getElementById('refresh-btn'),
            prevBtn: document.getElementById('prev-slide'),
            nextBtn: document.getElementById('next-slide')
        };
    }

    async initialize() {
        try {
            console.log('Starting Command Center initialization...');
            this.renderer.showLoader('Iniciando Command Center...');
            
            console.log('Creating particles...');
            RankingUtils.createParticles();
            
            console.log('Fetching initial data...');
            await this.fetchDataAndUpdate(true);
            
            console.log('Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('Showing initial view...');
            this.showView(0);
            
            console.log('Starting rotation...');
            this.startRotation();
            
            console.log('Hiding loader...');
            this.renderer.hideLoader();
            
            console.log('Showing success notification...');
            RankingUtils.showNotification(
                'Sistema Iniciado!', 
                'Centro de Comandos de Rankings está funcionando', 
                'success'
            );
            
            // Initialize enhanced features
            console.log('Initializing enhanced features...');
            if (window.commandCenterFeatures) {
                window.commandCenterFeatures.init();
            }
            
            // Expose app instance globally for features
            console.log('Exposing app globally...');
            window.app = {
                isPaused: this.isPaused,
                pauseRotation: () => this.pauseRotation(),
                resumeRotation: () => this.resumeRotation(),
                nextView: (isManual) => this.nextView(isManual),
                prevView: () => this.prevView(),
                fetchDataAndUpdate: (isInitial) => this.fetchDataAndUpdate(isInitial),
                rawData: this.dataProcessor.rawData
            };
            
            console.log('Command Center initialization completed successfully!');
            
        } catch (error) {
            console.error('Failed to initialize Command Center:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Try to show a basic error message
            const loader = document.getElementById('loader');
            if (loader) {
                loader.innerHTML = '<p class="text-red-400 text-lg">Erro na inicialização. Verifique o console.</p>';
            }
            
            if (window.commandCenterFeatures) {
                window.commandCenterFeatures.showNotification('Erro ao inicializar o sistema', 'error');
            }
        }
    }

    async fetchDataAndUpdate(isInitial = false) {
        try {
            if (!isInitial) {
                this.renderer.updateCountdown(0);
            }
            
            await this.dataProcessor.fetchData();
            
            if (isInitial) {
                const availablePeriods = this.dataProcessor.getAvailablePeriods();
                this.renderer.populateFilters(availablePeriods);
                this.currentPeriod = availablePeriods.length > 0 ? availablePeriods[0].value : 'all';
            }
            
            this.updateActiveFiltersAndTabs();
            const filteredData = this.dataProcessor.processData(this.currentPeriod);
            const rankings = this.dataProcessor.calculateRankings(filteredData);
            
            if (Object.keys(this.dataProcessor.previousRankings).length === 0) {
                this.dataProcessor.updatePreviousRankings(rankings);
            }
            
            this.renderAll(filteredData, rankings);
            
            if (isInitial) {
                // Setup data refresh interval
                this.dataRefreshIntervalId = setInterval(() => {
                    this.fetchDataAndUpdate(false);
                }, CONFIG.DATA_REFRESH_INTERVAL);
            }
            
            this.startCountdown();
            
        } catch (error) {
            console.error("Data fetch failed:", error);
            
            // Force use mock data when fetch fails
            console.log('Forcing mock data due to fetch failure...');
            this.dataProcessor.rawData = this.dataProcessor.getMockData();
            
            const filteredData = this.dataProcessor.processData(this.currentPeriod);
            const rankings = this.dataProcessor.calculateRankings(filteredData);
            
            if (Object.keys(this.dataProcessor.previousRankings).length === 0) {
                this.dataProcessor.updatePreviousRankings(rankings);
            }
            
            this.renderAll(filteredData, rankings);
            
            RankingUtils.showNotification(
                'Usando Dados de Teste', 
                'Webhook indisponível - sistema funcionando com dados simulados', 
                'warning'
            );
        }
    }

    renderAll(filteredData, rankings) {
        const periodText = document.querySelector(`.filter-btn[data-period="${this.currentPeriod}"]`)?.textContent || 'Período Atual';
        
        // Update chart period title
        if (this.DOM.chartPeriodTitle) {
            this.DOM.chartPeriodTitle.textContent = periodText;
        }
        
        // Calculate team KPIs
        const teamKPIs = this.dataProcessor.calculateTeamKPIs(filteredData);
        this.renderer.renderTeamCompetition(teamKPIs);
        
        // Get ranking data based on current type
        let rankingData = rankings.valueRanking;
        if (this.currentRankingType === 'activation') {
            rankingData = rankings.activationRanking;
        } else if (this.currentRankingType === 'general') {
            rankingData = rankings.generalRanking;
        }
        
        this.renderer.renderLeaderboard(rankingData, this.currentRankingType, this.dataProcessor);
        
        // Render chart
        const chartData = this.dataProcessor.getChartData(filteredData);
        this.renderer.renderAnalysisChart(chartData);
        
        this.dataProcessor.updatePreviousRankings(rankings);
    }

    showView(index, isManual = false) {
        this.DOM.slides.forEach((slide, i) => 
            slide.classList.toggle('active', i === index)
        );
        
        document.querySelectorAll('.nav-dot').forEach((dot, i) => 
            dot.classList.toggle('active', i === index)
        );
        
        this.currentViewIndex = index;
        
        if (isManual) {
            clearTimeout(this.rotationTimeoutId);
            cancelAnimationFrame(this.animationFrameId);
            this.rotationRemainingTime = CONFIG.VIEW_ROTATION_INTERVAL;
            if (!this.isPaused) {
                this.startRotation();
            }
        }
    }

    nextView(isManual = false) {
        this.showView((this.currentViewIndex + 1) % this.views.length, isManual);
    }

    prevView() {
        this.showView((this.currentViewIndex - 1 + this.views.length) % this.views.length, true);
    }

    updateProgressBar() {
        if (this.isPaused) return;
        
        const elapsedTime = Date.now() - this.rotationStartTime;
        const progress = (elapsedTime / this.rotationRemainingTime) * 100;
        
        if (this.DOM.progressBar) {
            this.DOM.progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.updateProgressBar());
    }

    startRotation() {
        if (this.isPaused) return;
        
        this.rotationStartTime = Date.now();
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame(() => this.updateProgressBar());
        
        this.rotationTimeoutId = setTimeout(() => {
            this.nextView();
            this.rotationRemainingTime = CONFIG.VIEW_ROTATION_INTERVAL;
            this.startRotation();
        }, this.rotationRemainingTime);
    }

    pauseRotation() {
        if (this.isPaused) return;
        
        this.isPaused = true;
        clearTimeout(this.rotationTimeoutId);
        cancelAnimationFrame(this.animationFrameId);
        
        const elapsedTime = Date.now() - this.rotationStartTime;
        this.rotationRemainingTime -= elapsedTime;
    }

    resumeRotation() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.startRotation();
    }

    startCountdown() {
        clearInterval(this.countdownIntervalId);
        let secondsLeft = CONFIG.DATA_REFRESH_INTERVAL / 1000;
        
        const updateTimer = () => {
            secondsLeft--;
            if (secondsLeft < 0) secondsLeft = 0;
            this.renderer.updateCountdown(secondsLeft);
        };
        
        updateTimer();
        this.countdownIntervalId = setInterval(updateTimer, 1000);
    }

    updateActiveFiltersAndTabs() {
        this.renderer.updateActiveFiltersAndTabs(this.currentPeriod, this.currentRankingType);
    }

    setupEventListeners() {
        // Filter buttons
        if (this.DOM.filterContainer) {
            this.DOM.filterContainer.addEventListener('click', (e) => {
                if (e.target.matches('.filter-btn')) {
                    this.currentPeriod = e.target.dataset.period;
                    this.updateActiveFiltersAndTabs();
                    
                    const filteredData = this.dataProcessor.processData(this.currentPeriod);
                    const rankings = this.dataProcessor.calculateRankings(filteredData);
                    this.renderAll(filteredData, rankings);
                }
            });
        }

        // Ranking tabs
        if (this.DOM.tabsContainer) {
            this.DOM.tabsContainer.addEventListener('click', (e) => {
                if (e.target.matches('.ranking-tab')) {
                    this.currentRankingType = e.target.dataset.ranking;
                    this.updateActiveFiltersAndTabs();
                    
                    const filteredData = this.dataProcessor.processData(this.currentPeriod);
                    const rankings = this.dataProcessor.calculateRankings(filteredData);
                    this.renderAll(filteredData, rankings);
                }
            });
        }

        // Navigation dots
        if (this.DOM.dotsContainer) {
            this.DOM.dotsContainer.addEventListener('click', (e) => {
                if (e.target.matches('.nav-dot')) {
                    this.showView(parseInt(e.target.dataset.index), true);
                }
            });
        }

        // Navigation arrows
        if (this.DOM.nextBtn) {
            this.DOM.nextBtn.addEventListener('click', () => this.nextView(true));
        }
        
        if (this.DOM.prevBtn) {
            this.DOM.prevBtn.addEventListener('click', () => this.prevView());
        }

        // Refresh button
        if (this.DOM.refreshBtn) {
            this.DOM.refreshBtn.addEventListener('click', () => {
                RankingUtils.showNotification('Atualizando', 'Buscando dados mais recentes...', 'info');
                this.fetchDataAndUpdate(false);
            });
        }

        // Pause/resume on hover
        if (this.DOM.commandCenter) {
            this.DOM.commandCenter.addEventListener('mouseenter', () => this.pauseRotation());
            this.DOM.commandCenter.addEventListener('mouseleave', () => this.resumeRotation());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevView();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextView(true);
                    break;
                case ' ':
                    e.preventDefault();
                    if (this.isPaused) {
                        this.resumeRotation();
                    } else {
                        this.pauseRotation();
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.fetchDataAndUpdate(false);
                    }
                    break;
            }
        });

        // Visibility API for pause/resume when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseRotation();
            } else {
                this.resumeRotation();
            }
        });
    }

    destroy() {
        // Clean up intervals and timeouts
        if (this.dataRefreshIntervalId) {
            clearInterval(this.dataRefreshIntervalId);
        }
        if (this.countdownIntervalId) {
            clearInterval(this.countdownIntervalId);
        }
        if (this.rotationTimeoutId) {
            clearTimeout(this.rotationTimeoutId);
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Destroy chart
        if (this.renderer.mainChartInstance) {
            this.renderer.mainChartInstance.destroy();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rankingApp = new RankingApp();
    window.rankingApp.initialize();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.rankingApp) {
        window.rankingApp.destroy();
    }
});
