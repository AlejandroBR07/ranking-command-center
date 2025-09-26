// Data processing functions for the Ranking Command Center

class DataProcessor {
    constructor() {
        this.rawData = [];
        this.previousRankings = {};
    }

    async fetchData() {
        try {
            const response = await fetch(CONFIG.WEBHOOK_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();

            this.rawData = Array.isArray(data) ? data : [];
            
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
                'Broker': 'Felipe Pauluk',
                'Depósito': '100.46',
                'Data': '2025-01-06',
                'Ativação': 'Não Ativação'
            },
            {
                'Broker': 'Felipe Pauluk',
                'Depósito': '100.74',
                'Data': '2025-06-23',
                'Ativação': 'Não Ativação'
            },
            {
                'Broker': 'Felipe Pauluk',
                'Depósito': '918.85',
                'Data': '2025-08-31',
                'Ativação': 'Não Ativação'
            }
        ];
    }

    processData(selectedPeriod) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        const minDate = new Date(2025, 6, 1); // July 1, 2025

        return this.rawData.map(item => ({
            ...item,
            parsedDate: RankingUtils.parseDate(RankingUtils.getValue(item, 'Data')),
            team: RankingUtils.getTeamByBroker(RankingUtils.getValue(item, 'Broker'))
        })).filter(item => {
            // Allow items without valid date for 'all' period
            if (!item.parsedDate) {
                return selectedPeriod === 'all';
            }

            const itemDate = new Date(item.parsedDate.getFullYear(), item.parsedDate.getMonth(), item.parsedDate.getDate());

            // Always filter out dates before July 2025
            if (itemDate < minDate) return false;

            // Apply the selected period filter
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
            const brokerName = RankingUtils.getValue(item, 'Broker');
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
            const depositValue = RankingUtils.parseCurrency(RankingUtils.getValue(item, 'Depósito'));
            if (depositValue > 0) {
                acc[shortName].totalDeposito += depositValue;
            }
            
            // Use 'Ativação?' from webhook - only count 'Ativação' as activated
            const ativacao = RankingUtils.getValue(item, 'Ativação');
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
        const kpis = data.reduce((acc, item) => {
            if (!acc[item.team]) {
                acc[item.team] = { 
                    totalDeposito: 0, 
                    activationCount: 0, 
                    memberCount: 0,
                    avgDeposit: 0 
                };
            }
            
            // Accept ALL deposits, no validation filter
            const depositValue = RankingUtils.parseCurrency(RankingUtils.getValue(item, 'Depósito'));
            if (depositValue > 0) {
                acc[item.team].totalDeposito += depositValue;
            }
            
            if (RankingUtils.getValue(item, 'Ativação') === 'Ativação') {
                acc[item.team].activationCount++;
            }
            
            return acc;
        }, { 'DOLLAR GODS': { totalDeposito: 0, activationCount: 0 }, 'ELITE SQUAD': { totalDeposito: 0, activationCount: 0 } });
        
        // Calculate additional metrics
        Object.keys(kpis).forEach(team => {
            const teamMembers = CONFIG.TEAMS[team] || [];
            kpis[team].memberCount = teamMembers.length;
            
            // Only track total deposits

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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if the broker is new (first deposit ever was today)
        const allEntriesForBroker = this.rawData.filter(item => (CONFIG.BROKER_MAP[RankingUtils.getValue(item, 'Broker')] || RankingUtils.getValue(item, 'Broker')) === brokerName);
        const firstDepositDate = allEntriesForBroker
            .map(item => RankingUtils.parseDate(RankingUtils.getValue(item, 'Data')))
            .filter(Boolean)
            .sort((a, b) => a - b)[0];
        
        const isNewToday = firstDepositDate && firstDepositDate.setHours(0, 0, 0, 0) === today.getTime();

        if (isNewToday) {
            return { indicator: '⭐', class: 'rank-new', isNew: true, change: 0 };
        }

        const previousRank = this.previousRankings[rankingType]?.get(brokerName);
        if (!previousRank) {
            return { indicator: '▬', class: 'rank-stable', isNew: false, change: 0 };
        }
        
        if (currentRank < previousRank) {
            return { indicator: '▲', class: 'rank-up', change: previousRank - currentRank };
        } else if (currentRank > previousRank) {
            return { indicator: '▼', class: 'rank-down', change: previousRank - currentRank };
        } else {
            return { indicator: '▬', class: 'rank-stable', change: 0 };
        }
    }

    getChartData(data) {
        const summary = data.reduce((acc, item) => {
            const brokerName = RankingUtils.getValue(item, 'Broker');
            const shortName = CONFIG.BROKER_MAP[brokerName] || brokerName;
            
            if (!acc[shortName]) {
                acc[shortName] = {
                    brokerName: shortName,
                    totalDeposito: 0,
                    depositoCount: 0,
                    team: RankingUtils.getTeamByBroker(brokerName)
                };
            }
            
            const depositValue = RankingUtils.parseCurrency(RankingUtils.getValue(item, 'Depósito'));
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
