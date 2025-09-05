// Configuration for the Ranking Command Center
const CONFIG = {
    // N8N Webhook URL
    WEBHOOK_URL: 'https://aldeia0225.app.n8n.cloud/webhook/a83cd7e6-b8e4-49ea-b524-9780b993c9ad',
    
    // Timing configurations
    DATA_REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes
    VIEW_ROTATION_INTERVAL: 15 * 1000,  // 15 seconds
    
    // Currency formatting - Changed to USD
    CURRENCY_CONFIG: {
        locale: 'en-US',
        currency: 'USD',
        symbol: '$'
    },
    
    // Date filtering - July 2025 onwards
    MIN_DATE: new Date(2025, 6, 1), // July 1, 2025
    
    // Enhanced UI Configuration
    UI_CONFIG: {
        animations: {
            fadeInDelay: 100,
            slideTransition: 700,
            highlightDuration: 1500,
            particleSpeed: 0.5
        },
        colors: {
            primary: '#38BDF8',
            secondary: '#06B6D4',
            accent: '#FFD700',
            success: '#10B981', // Usando o verde mais vibrante do seu tema
            warning: '#F59E0B', // Mantido
            danger: '#EF4444', // Mantido
            dollarGods: '#FFD700', // Mantido
            eliteSquad: '#38BDF8' // Mantido
        },
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1280
        }
    },
    
    // Team configurations
    TEAMS: {
        'DOLLAR GODS': ['Felipe Pauluk', 'Natan', 'Allison', 'João', 'Raul', 'Otavio', 'Lucas Vinicius'],
        'ELITE SQUAD': ['Luan', 'Victor', 'Gabriel Dias', 'Gabriel Wagner', 'Ruan', 'Arthur', 'Laurence', 'Davi']
    },
    
    // Broker name mapping
    BROKER_MAP: {
        'Felipe Pauluk': 'Felipe', 
        'João Lucas': 'João', 
        'Gabriel Dias': 'G. Dias', 
        'Gabriel Wagner': 'G. Wagner',
        'Luan Felipe': 'Luan', 
        'Victor Renan': 'Victor', 
        'Ruan Neuberger': 'Ruan', 
        'Arthur De Oliveira': 'Arthur',
        'Laurence Dias': 'Laurence', 
        'Davi Dias do Nascimento': 'Davi', 
        'Allison Moreira': 'Allison', 
        'Otavio': 'Otavio', 
        'Raul': 'Raul', 
        'Natan': 'Natan', 
        'Lucas Vinicius': 'Lucas'
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
