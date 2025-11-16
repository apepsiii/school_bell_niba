// PWA UI Controller - Manages the PWA interface
class PWAUI {
    constructor() {
        this.installPrompt = null;
        this.isOnline = navigator.onLine;
        this.currentPage = 'dashboard';
        
        this.init();
    }
    
    async init() {
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Setup online/offline listeners
        this.setupConnectivityListeners();
        
        // Initialize UI components
        this.initializeUI();
        
        // Start UI updates
        this.startUIUpdates();
        
        // Handle URL parameters
        this.handleURLParams();
        
        console.log('PWA UI initialized');
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/static/js/service-worker.js');
                console.log('Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }
    
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallPrompt();
        });
        
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('App is already installed');
        }
    }
    
    setupConnectivityListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectivityStatus();
            this.showNotification('Koneksi tersambung kembali', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectivityStatus();
            this.showNotification('Mode offline diaktifkan', 'warning');
        });
    }
    
    initializeUI() {
        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value;
                volumeValue.textContent = volume + '%';
                
                if (window.pwaAudioPlayer) {
                    window.pwaAudioPlayer.setVolume(volume / 100);
                }
            });
            
            // Load saved volume
            const savedVolume = localStorage.getItem('audio-volume');
            if (savedVolume) {
                volumeSlider.value = savedVolume * 100;
                volumeValue.textContent = Math.round(savedVolume * 100) + '%';
            }
        }
        
        // Holiday mode
        const holidayMode = document.getElementById('holidayMode');
        if (holidayMode) {
            holidayMode.addEventListener('change', (e) => {
                const isHoliday = e.target.checked;
                localStorage.setItem('holiday-mode', isHoliday.toString());
                
                if (window.pwaScheduler) {
                    window.pwaScheduler.checkSchedules();
                }
                
                this.showNotification(
                    isHoliday ? 'Mode libur diaktifkan' : 'Mode libur dinonaktifkan',
                    'info'
                );
            });
            
            // Load saved holiday mode
            const savedHolidayMode = localStorage.getItem('holiday-mode');
            if (savedHolidayMode) {
                holidayMode.checked = savedHolidayMode === 'true';
            }
        }
        
        // Quick action buttons
        this.setupQuickActions();
    }
    
    setupQuickActions() {
        // These will be implemented when we create the modal pages
        window.showSchedules = () => this.showPage('schedules');
        window.showAudio = () => this.showPage('audio');
        window.showAnnouncements = () => this.showPage('announcements');
        window.showLogs = () => this.showPage('logs');
    }
    
    startUIUpdates() {
        // Update date/time every second
        setInterval(() => this.updateDateTime(), 1000);
        this.updateDateTime();
        
        // Update schedules every 30 seconds
        setInterval(() => this.updateSchedules(), 30000);
        this.updateSchedules();
        
        // Update next schedule every minute
        setInterval(() => this.updateNextSchedule(), 60000);
        this.updateNextSchedule();
        
        // Update connectivity status
        this.updateConnectivityStatus();
    }
    
    updateDateTime() {
        const element = document.getElementById('currentDateTime');
        if (element) {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            element.textContent = now.toLocaleDateString('id-ID', options);
        }
    }
    
    async updateSchedules() {
        try {
            if (window.pwaScheduler) {
                const schedules = window.pwaScheduler.getTodaySchedules();
                this.displayTodaySchedules(schedules);
                
                // Update counts
                const scheduleCount = document.getElementById('scheduleCount');
                if (scheduleCount) {
                    scheduleCount.textContent = schedules.length;
                }
            }
            
            // Update audio count
            const audioCount = await this.getAudioCount();
            const audioCountElement = document.getElementById('audioCount');
            if (audioCountElement) {
                audioCountElement.textContent = audioCount;
            }
            
        } catch (error) {
            console.error('Error updating schedules:', error);
        }
    }
    
    displayTodaySchedules(schedules) {
        const container = document.getElementById('todaySchedules');
        if (!container) return;
        
        if (schedules.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-calendar-x" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">Tidak ada jadwal hari ini</p>
                </div>
            `;
            return;
        }
        
        const now = new Date();
        const currentTime = this.formatTime(now);
        
        container.innerHTML = schedules.map(schedule => {
            const isPast = schedule.time < currentTime;
            const isNext = schedule.time > currentTime &&
                           schedules.indexOf(schedule) === schedules.findIndex(s => s.time > currentTime);
            
            let className = 'schedule-item';
            if (isNext) className += ' next';
            else if (!isPast) className += ' active';
            
            return `
                <div class="${className}">
                    <div class="schedule-time">${schedule.time}</div>
                    <div class="schedule-name">${schedule.name}</div>
                    <button class="play-button" onclick="playScheduleAudio('${schedule.audio_file}')"
                            ${isPast ? 'disabled' : ''}>
                        <i class="bi ${isPast ? 'bi-check-circle' : 'bi-play-fill'}"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        console.log('Displayed schedules:', schedules);
    }
    
    updateNextSchedule() {
        if (window.pwaScheduler) {
            const nextSchedule = window.pwaScheduler.getNextSchedule();
            this.displayNextSchedule(nextSchedule);
            console.log('Next schedule:', nextSchedule);
        }
    }
    
    displayNextSchedule(schedule) {
        const container = document.getElementById('nextScheduleInfo');
        if (!container) return;
        
        if (!schedule) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-calendar-x" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">Tidak ada jadwal berikutnya</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="text-center">
                <i class="bi bi-alarm" style="font-size: 2rem; color: #ffc107;"></i>
                <h5 class="mt-2">${schedule.name}</h5>
                <p class="mb-0">
                    <strong>${schedule.time}</strong> - ${schedule.audio_file}
                </p>
            </div>
        `;
        
        console.log('Displayed next schedule:', schedule);
    }
    
    updateConnectivityStatus() {
        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');
        const offlineIndicator = document.getElementById('offlineIndicator');
        
        if (indicator) {
            indicator.className = `status-indicator ${this.isOnline ? 'online' : 'offline'}`;
        }
        
        if (text) {
            text.textContent = this.isOnline ? 'Online' : 'Offline';
        }
        
        if (offlineIndicator) {
            offlineIndicator.className = `offline-indicator ${!this.isOnline ? 'show' : ''}`;
        }
        
        // Update system status
        const systemStatus = document.getElementById('systemStatus');
        if (systemStatus) {
            if (this.isOnline) {
                systemStatus.textContent = 'Online - Ready';
                systemStatus.className = 'text-success';
            } else {
                systemStatus.textContent = 'Offline - Local Mode';
                systemStatus.className = 'text-warning';
            }
        }
    }
    
    async getAudioCount() {
        try {
            if (this.isOnline) {
                const response = await fetch('/api/audio');
                if (response.ok) {
                    const audioFiles = await response.json();
                    localStorage.setItem('audio-files-list', JSON.stringify(audioFiles));
                    return audioFiles.length;
                }
            }
        } catch (error) {
            console.log('Using cached audio count');
        }
        
        // Fallback to cached data
        const cached = localStorage.getItem('audio-files-list');
        return cached ? JSON.parse(cached).length : 0;
    }
    
    showInstallPrompt() {
        const prompt = document.getElementById('installPrompt');
        if (prompt && this.installPrompt) {
            prompt.classList.add('show');
        }
    }
    
    async installApp() {
        if (!this.installPrompt) return;
        
        this.installPrompt.prompt();
        const result = await this.installPrompt.userChoice;
        
        if (result.outcome === 'accepted') {
            console.log('App installed');
            this.showNotification('Aplikasi berhasil diinstall!', 'success');
        }
        
        this.installPrompt = null;
        
        const prompt = document.getElementById('installPrompt');
        if (prompt) {
            prompt.classList.remove('show');
        }
    }
    
    showUpdateNotification() {
        if (confirm('Update tersedia! Muat ulang halaman untuk mengupdate?')) {
            window.location.reload();
        }
    }
    
    showNotification(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="bi ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'bi-check-circle',
            error: 'bi-x-circle',
            warning: 'bi-exclamation-triangle',
            info: 'bi-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }
    
    handleURLParams() {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        
        if (action === 'play') {
            // Handle play action from notification
            this.showAnnouncements();
        }
    }
    
    showPage(page) {
        this.currentPage = page;
        
        // This would typically show different modal pages
        // For now, we'll just show a simple implementation
        console.log(`Showing page: ${page}`);
        
        // In a full implementation, this would:
        // 1. Hide current page
        // 2. Show requested page modal
        // 3. Update navigation
        // 4. Load page-specific data
        
        // For demo purposes, we'll just show a notification
        this.showNotification(`Halaman ${page} akan segera tersedia`, 'info');
    }
    
    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Utility methods
    vibrate(pattern = [200, 100, 200]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
    
    share(data) {
        if (navigator.share) {
            navigator.share(data);
        } else {
            // Fallback
            this.showNotification('Sharing tidak didukung di browser ini', 'warning');
        }
    }
    
    // Export/Import functionality
    exportData() {
        const data = {
            schedules: window.pwaScheduler ? window.pwaScheduler.getSchedules() : [],
            settings: {
                volume: localStorage.getItem('audio-volume'),
                holidayMode: localStorage.getItem('holiday-mode')
            },
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `school-bell-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Data berhasil diekspor', 'success');
    }
    
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Import schedules
            if (data.schedules && window.pwaScheduler) {
                for (const schedule of data.schedules) {
                    await window.pwaScheduler.addSchedule(schedule);
                }
            }
            
            // Import settings
            if (data.settings) {
                if (data.settings.volume) {
                    localStorage.setItem('audio-volume', data.settings.volume);
                    const volumeSlider = document.getElementById('volumeSlider');
                    if (volumeSlider) {
                        volumeSlider.value = data.settings.volume * 100;
                    }
                }
                
                if (data.settings.holidayMode) {
                    localStorage.setItem('holiday-mode', data.settings.holidayMode);
                    const holidayMode = document.getElementById('holidayMode');
                    if (holidayMode) {
                        holidayMode.checked = data.settings.holidayMode === 'true';
                    }
                }
            }
            
            this.showNotification('Data berhasil diimpor', 'success');
            this.updateSchedules();
            
        } catch (error) {
            console.error('Error importing data:', error);
            this.showNotification('Gagal mengimpor data', 'error');
        }
    }
}

// Global function for playing schedule audio
window.playScheduleAudio = async function(filename) {
    if (window.pwaAudioPlayer) {
        try {
            await window.pwaAudioPlayer.play(filename);
            // Visual feedback
            event.target.classList.add('playing');
            setTimeout(() => {
                event.target.classList.remove('playing');
            }, 2000);
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }
};

// Initialize PWA UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pwaUI = new PWAUI();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100%); opacity: 0; }
    }
    
    .toast-notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .toast-content i {
        font-size: 16px;
    }
`;
document.head.appendChild(style);