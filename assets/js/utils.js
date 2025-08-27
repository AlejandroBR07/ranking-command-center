// Utility functions for the Ranking Command Center

class RankingUtils {
    static getValue(item, ...keys) {
        for (const key of keys) {
            if (item?.[key] != null) return item[key];
        }
        return '';
    }

    static parseCurrency(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string' && value.trim() !== '') {
            // Handle both comma and dot as decimal separators
            // If there's a dot followed by exactly 3 digits, treat it as thousands separator
            let cleaned = value.replace(/[^\d.,-]/g, '');
            
            // Check if dot is used as thousands separator (e.g., 1.000,50 or 1.000)
            if (cleaned.includes('.') && cleaned.includes(',')) {
                // Format like 1.000,50 - dot is thousands, comma is decimal
                cleaned = cleaned.replace(/\./g, '').replace(',', '.');
            } else if (cleaned.includes('.') && /\.\d{3}$/.test(cleaned)) {
                // Format like 1.000 - dot is thousands separator
                cleaned = cleaned.replace(/\./g, '');
            } else if (cleaned.includes(',')) {
                // Format like 1000,50 - comma is decimal
                cleaned = cleaned.replace(',', '.');
            }
            
            return parseFloat(cleaned) || 0;
        }
        return 0;
    }

    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value).replace('US$', '$');
    }

    static getTeamByBroker(brokerName) {
        const shortName = CONFIG.BROKER_MAP[brokerName] || brokerName;
        for (const team in CONFIG.TEAMS) {
            if (CONFIG.TEAMS[team].some(member => member === brokerName || member === shortName)) {
                return team;
            }
        }
        return 'Sem Time';
    }

    static parseDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;
        
        // Try YYYY-MM-DD format first
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        
        // Try DD/MM/YYYY format
        const partsBR = dateStr.split('/');
        if (partsBR.length === 3) {
            return new Date(parseInt(partsBR[2]), parseInt(partsBR[1]) - 1, parseInt(partsBR[0]));
        }
        
        return null;
    }

    static isDateAfterMinimum(date) {
        if (!date) return false;
        return date >= CONFIG.MIN_DATE;
    }

    static formatDatePeriod(date) {
        const months = {
            0: 'Janeiro', 1: 'Fevereiro', 2: 'Março', 3: 'Abril',
            4: 'Maio', 5: 'Junho', 6: 'Julho', 7: 'Agosto',
            8: 'Setembro', 9: 'Outubro', 10: 'Novembro', 11: 'Dezembro'
        };
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    static getInitials(name) {
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static createParticles() {
        const container = document.body;
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            container.appendChild(particle);
        }
    }

    static showNotification(title, message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        
        if (typeof window !== 'undefined' && window.commandCenterFeatures) {
            window.commandCenterFeatures.showNotification(`${title}: ${message}`, type);
        } else {
            const notification = document.createElement('div');
            notification.className = `notification ${type} show`;
            notification.textContent = `${title}: ${message}`;
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 1000;
                padding: 12px 16px; border-radius: 8px; color: white;
                background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    }

    static animateValue(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * RankingUtils.easeOutCubic(progress);
            element.textContent = RankingUtils.formatCurrency(Math.round(current));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    static easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    static generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Copiado!', 'Texto copiado para a área de transferência', 'success');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Copiado!', 'Texto copiado para a área de transferência', 'success');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RankingUtils;
}
