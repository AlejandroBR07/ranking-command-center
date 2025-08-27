// Advanced features for the Ranking Command Center
class CommandCenterFeatures {
    constructor() {
        this.notifications = [];
        this.soundEnabled = true;
        this.fullscreenMode = false;
        this.performanceMetrics = {
            dataFetches: 0,
            renderTime: 0,
            lastUpdate: null
        };
    }

    // Enhanced notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="notification-icon">
                    ${this.getNotificationIcon(type)}
                </div>
                <span>${message}</span>
                <button class="notification-close ml-auto" onclick="this.parentElement.parentElement.remove()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);

        this.notifications.push({
            message,
            type,
            timestamp: new Date()
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        return icons[type] || icons.info;
    }

    // Performance monitoring
    startPerformanceTimer() {
        this.performanceMetrics.startTime = performance.now();
    }

    endPerformanceTimer(operation) {
        const endTime = performance.now();
        const duration = endTime - this.performanceMetrics.startTime;
        this.performanceMetrics.renderTime = duration;
        
        if (duration > 100) {
            console.warn(`Performance warning: ${operation} took ${duration.toFixed(2)}ms`);
        }
    }

    // Fullscreen toggle
    toggleFullscreen() {
        const element = document.getElementById('command-center');
        
        if (!this.fullscreenMode) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
            this.fullscreenMode = true;
            this.showNotification('Modo tela cheia ativado', 'success');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.fullscreenMode = false;
            this.showNotification('Modo tela cheia desativado', 'info');
        }
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F11 - Toggle fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
            
            // Space - Pause/Resume rotation
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                if (window.app && window.app.isPaused) {
                    window.app.resumeRotation();
                    this.showNotification('Rotação retomada', 'success');
                } else if (window.app) {
                    window.app.pauseRotation();
                    this.showNotification('Rotação pausada', 'warning');
                }
            }
            
            // Arrow keys - Manual navigation
            if (e.key === 'ArrowLeft' && window.app) {
                e.preventDefault();
                window.app.prevView();
            }
            if (e.key === 'ArrowRight' && window.app) {
                e.preventDefault();
                window.app.nextView(true);
            }
            
            // R - Refresh data
            if (e.key === 'r' || e.key === 'R') {
                if (e.ctrlKey || e.metaKey) return; // Allow browser refresh
                e.preventDefault();
                if (window.app && window.app.fetchDataAndUpdate) {
                    window.app.fetchDataAndUpdate(false);
                    this.showNotification('Dados atualizados manualmente', 'success');
                }
            }
        });
    }

    // Data export functionality
    exportData(data, filename = 'ranking-data') {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Dados exportados com sucesso', 'success');
    }

    // Theme switching
    switchTheme(theme = 'dark') {
        const themes = {
            dark: {
                '--bg-color': '#0A0A0F',
                '--panel-bg': 'rgba(15, 18, 32, 0.5)',
                '--text-primary': '#E5E7EB'
            },
            blue: {
                '--bg-color': '#0F172A',
                '--panel-bg': 'rgba(30, 41, 59, 0.5)',
                '--text-primary': '#F1F5F9'
            },
            purple: {
                '--bg-color': '#1E1B4B',
                '--panel-bg': 'rgba(67, 56, 202, 0.3)',
                '--text-primary': '#F3F4F6'
            }
        };

        const selectedTheme = themes[theme];
        if (selectedTheme) {
            Object.entries(selectedTheme).forEach(([property, value]) => {
                document.documentElement.style.setProperty(property, value);
            });
            this.showNotification(`Tema ${theme} aplicado`, 'success');
        }
    }

    // Connection status monitoring
    monitorConnection() {
        window.addEventListener('online', () => {
            this.showNotification('Conexão restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Conexão perdida - dados podem estar desatualizados', 'warning');
        });
    }

    // Initialize all features
    init() {
        this.setupKeyboardShortcuts();
        this.monitorConnection();
        
        // Add fullscreen button to UI
        this.addFullscreenButton();
        
        // Add export button
        this.addExportButton();
        
        // Add theme selector
        this.addThemeSelector();
        
        this.showNotification('Command Center Enhanced - Recursos avançados ativados', 'success');
    }

    addFullscreenButton() {
        const button = document.createElement('button');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
        `;
        button.className = 'p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition duration-300';
        button.title = 'Tela Cheia (F11)';
        button.onclick = () => this.toggleFullscreen();
        
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.parentNode.insertBefore(button, refreshBtn);
        }
    }

    addExportButton() {
        const button = document.createElement('button');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
        `;
        button.className = 'p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition duration-300';
        button.title = 'Exportar Dados';
        button.onclick = () => {
            if (window.app && window.app.rawData) {
                this.exportData(window.app.rawData);
            }
        };
        
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.parentNode.insertBefore(button, refreshBtn);
        }
    }

    addThemeSelector() {
        const selector = document.createElement('select');
        selector.innerHTML = `
            <option value="dark">Dark</option>
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
        `;
        selector.className = 'bg-black/20 text-white text-xs rounded px-2 py-1 border border-gray-600';
        selector.onchange = (e) => this.switchTheme(e.target.value);
        
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.parentNode.insertBefore(selector, refreshBtn);
        }
    }
}

// Initialize features when DOM is loaded
if (typeof window !== 'undefined') {
    window.commandCenterFeatures = new CommandCenterFeatures();
}
