// Data processing functions for the Ranking Command Center

class DataProcessor {
    constructor() {
        this.rawData = [];
        this.previousRankings = {};
    }

    async fetchData() {
        try {
            console.log('Fetching data from:', CONFIG.WEBHOOK_URL);
            const response = await fetch(CONFIG.WEBHOOK_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Raw data received:', data);
            console.log('Data type:', typeof data, 'Is array:', Array.isArray(data));
            
            this.rawData = Array.isArray(data) ? data : [];
            console.log('Processed rawData length:', this.rawData.length);
            
            return this.rawData;
        } catch (error) {
            console.error('Data fetch failed:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Try to use mock data for development
            console.log('Using mock data for development...');
            this.rawData = this.getMockData();
            RankingUtils.showNotification('Usando dados de teste', 'Webhook indisponível - dados simulados', 'warning');
            return this.rawData;
        }
    }

    getMockData() {
        return [
            {
                'Nome': 'João Silva',
                'Valor Depósito': '1500,00',
                'Data': '2025-07-15',
                'Ativação?': 'Ativação'
            },
            {
                'Nome': 'Maria Santos',
                'Valor Depósito': '2300,50',
                'Data': '2025-07-20',
                'Ativação?': 'Ativação'
            },
            {
                'Nome': 'Pedro Costa',
                'Valor Depósito': '1800,75',
                'Data': '2025-07-25',
                'Ativação?': 'Não'
            },
            {
                'Nome': 'Ana Oliveira',
                'Valor Depósito': '3200,00',
                'Data': '2025-08-01',
                'Ativação?': 'Ativação'
            },
            {
                'Nome': 'Carlos Mendes',
                'Valor Depósito': '950,25',
                'Data': '2025-08-05',
                'Ativação?': 'Não'
            }
        ];
    }

    processData(selectedPeriod) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        
        return this.rawData.map(item => ({
            ...item,
            parsedDate: RankingUtils.parseDate(RankingUtils.getValue(item, 'Data')),
            team: RankingUtils.getTeamByBroker(RankingUtils.getValue(item, 'Nome'))
        })).filter(item => {
            if (!item.parsedDate) return selectedPeriod === 'all';
            
            const itemDate = new Date(item.parsedDate.getFullYear(), item.parsedDate.getMonth(), item.parsedDate.getDate());
            
            switch (selectedPeriod) {
                case 'all':
                    return true;
                case 'today':
                    return itemDate.getTime() === today.getTime();
                case 'this_week':
                    return itemDate >= startOfWeek && itemDate <= today;
                default:
                    return `${item.parsedDate.getMonth()}_${item.parsedDate.getFullYear()}` === selectedPeriod;
            }
        });
    }

    calculateRankings(data) {
        const summary = data.reduce((acc, item) => {
            const brokerName = RankingUtils.getValue(item, 'Nome');
            const shortName = CONFIG.BROKER_MAP[brokerName] || brokerName;
            if (!shortName) return acc;
            
            if (!acc[shortName]) {
                acc[shortName] = {
                    brokerName: shortName,
                    fullName: brokerName,
                    team: item.team,
                    totalDeposito: 0,
                    activationCount: 0
                };
            }
            
            // Use 'Valor Depósito' from webhook - accept ALL deposits, no validation filter
            const depositValue = RankingUtils.parseCurrency(RankingUtils.getValue(item, 'Valor Depósito'));
            if (depositValue > 0) {
                acc[shortName].totalDeposito += depositValue;
            }
            
            // Use 'Ativação?' from webhook - only count 'Ativação' as activated
            const ativacao = RankingUtils.getValue(item, 'Ativação?');
            if (ativacao === 'Ativação') {
                acc[shortName].activationCount++;
            }
            
            return acc;
        }, {});
        
        const allBrokers = Object.values(summary);
        const valueRanking = [...allBrokers].sort((a, b) => b.totalDeposito - a.totalDeposito);
        const activationRanking = [...allBrokers].sort((a, b) => b.activationCount - a.activationCount);
        
        // Calculate general score (60% deposits, 40% activations)
        const maxDeposito = Math.max(...valueRanking.map(b => b.totalDeposito), 1);
        const maxActivations = Math.max(...activationRanking.map(b => b.activationCount), 1);
        
        allBrokers.forEach(broker => {
            broker.generalScore = ((broker.totalDeposito / maxDeposito) * 0.6) + 
                                ((broker.activationCount / maxActivations) * 0.4);
        });
        
        const generalRanking = allBrokers.sort((a, b) => b.generalScore - a.generalScore);
        
        return { valueRanking, activationRanking, generalRanking };
    }

    calculateTeamKPIs(data) {
        return data.reduce((acc, item) => {
            if (!acc[item.team]) {
                acc[item.team] = { 
                    totalDeposito: 0, 
                    activationCount: 0, 
                    memberCount: 0,
                    avgDeposit: 0 
                };
            }
            
            // Accept ALL deposits, no validation filter
            const depositValue = RankingUtils.parseCurrency(RankingUtils.getValue(item, 'Valor Depósito'));
            if (depositValue > 0) {
                acc[item.team].totalDeposito += depositValue;
            }
            
            if (RankingUtils.getValue(item, 'Ativação?') === 'Ativação') {
                acc[item.team].activationCount++;
            }
            
            return acc;
        }, {});
        
        // Calculate additional metrics
        Object.keys(kpis).forEach(team => {
            const teamMembers = CONFIG.TEAMS[team] || [];
            kpis[team].memberCount = teamMembers.length;
            
            // Only track total deposits
            console.log(`📊 Team ${team} total deposits:`, {
                totalDeposit: kpis[team].totalDeposito,
                activations: kpis[team].activationCount
            });
            
            // Ensure all required properties exist
            kpis[team].totalDeposito = kpis[team].totalDeposito || 0;
            kpis[team].activationCount = kpis[team].activationCount || 0;
        });
        
        return kpis;
    }

    getAvailablePeriods() {
        const months = new Set();
        
        this.rawData.forEach(item => {
            const date = RankingUtils.parseDate(RankingUtils.getValue(item, 'Data'));
            if (date && RankingUtils.isDateAfterMinimum(date)) {
                const monthYear = `${date.getMonth()}_${date.getFullYear()}`;
                const monthName = RankingUtils.formatDatePeriod(date);
                months.add(JSON.stringify({ value: monthYear, text: monthName }));
            }
        });
        
        return Array.from(months)
            .map(m => JSON.parse(m))
            .sort((a, b) => {
                const [aMonth, aYear] = a.value.split('_').map(Number);
                const [bMonth, bYear] = b.value.split('_').map(Number);
                return (bYear - aYear) || (bMonth - aMonth);
            });
    }

    updatePreviousRankings(rankings) {
        Object.keys(rankings).forEach(type => {
            const rankMap = new Map(rankings[type].map((broker, index) => [broker.brokerName, index + 1]));
            this.previousRankings[type] = rankMap;
        });
    }

    getRankChange(brokerName, currentRank, rankingType) {
        const previousRank = this.previousRankings[rankingType]?.get(brokerName);
        
        if (!previousRank) {
            return { indicator: '-', class: 'rank-stable', isNew: true };
        }
        
        if (currentRank < previousRank) {
            return { indicator: '▲', class: 'rank-up', change: previousRank - currentRank };
        } else if (currentRank > previousRank) {
            return { indicator: '▼', class: 'rank-down', change: currentRank - previousRank };
        } else {
            return { indicator: '-', class: 'rank-stable', change: 0 };
        }
    }

    getChartData(data) {
        const summary = data.reduce((acc, item) => {
            const brokerName = RankingUtils.getValue(item, 'Nome');
            const shortName = CONFIG.BROKER_MAP[brokerName] || brokerName;
            
            if (!acc[shortName]) {
                acc[shortName] = {
                    brokerName: shortName,
                    totalDeposito: 0,
                    depositoCount: 0,
                    team: RankingUtils.getTeamByBroker(brokerName)
                };
            }
            
            const depositValue = RankingUtils.parseCurrency(RankingUtils.getValue(item, 'Valor Depósito'));
            if (depositValue > 0) {
                acc[shortName].totalDeposito += depositValue;
                acc[shortName].depositoCount++;
            }
            
            return acc;
        }, {});
        
        return Object.values(summary)
            .sort((a, b) => b.totalDeposito - a.totalDeposito)
            .slice(0, 15);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataProcessor;
}
