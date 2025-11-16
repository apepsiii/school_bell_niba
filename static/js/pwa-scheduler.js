// PWA Scheduler - Client-side scheduling system
class PWAScheduler {
    constructor() {
        this.schedules = [];
        this.isOnline = navigator.onLine;
        this.audioPlayer = null;
        this.notificationPermission = 'default';
        this.checkInterval = null;
        this.nextScheduleTimer = null;
        
        this.init();
    }
    
    async init() {
        // Initialize audio player
        this.audioPlayer = new PWAAudioPlayer();
        
        // Load schedules from storage
        await this.loadSchedules();
        
        // Check notification permission
        await this.requestNotificationPermission();
        
        // Start schedule checking
        this.startScheduleChecking();
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Listen for visibility change
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        console.log('PWA Scheduler initialized');
    }
    
    async loadSchedules() {
        try {
            // If online, try to sync with server first
            if (this.isOnline) {
                await this.syncWithServer();
            } else {
                // Try to load from IndexedDB first
                const indexedDBSchedules = await this.loadFromIndexedDB();
                if (indexedDBSchedules.length > 0) {
                    this.schedules = indexedDBSchedules;
                } else {
                    // Fallback to localStorage
                    const localSchedules = localStorage.getItem('school-bell-schedules');
                    if (localSchedules) {
                        this.schedules = JSON.parse(localSchedules);
                    }
                }
            }
            
            console.log(`Loaded ${this.schedules.length} schedules`);
            
            // Update UI immediately
            if (window.updateSchedulesDisplay) {
                window.updateSchedulesDisplay(this.schedules);
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    }
    
    async loadFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SchoolBellDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('schedules')) {
                    resolve([]);
                    return;
                }
                
                const transaction = db.transaction(['schedules'], 'readonly');
                const store = transaction.objectStore('schedules');
                const getAllRequest = store.getAll();
                
                getAllRequest.onerror = () => reject(getAllRequest.error);
                getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
            };
        });
    }
    
    async saveToIndexedDB(schedules) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SchoolBellDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['schedules'], 'readwrite');
                const store = transaction.objectStore('schedules');
                
                // Clear existing data
                store.clear();
                
                // Add new schedules
                schedules.forEach(schedule => {
                    store.add(schedule);
                });
                
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };
        });
    }
    
    async saveSchedules() {
        try {
            // Save to localStorage as backup
            localStorage.setItem('school-bell-schedules', JSON.stringify(this.schedules));
            
            // Save to IndexedDB
            await this.saveToIndexedDB(this.schedules);
            
            console.log('Schedules saved successfully');
        } catch (error) {
            console.error('Error saving schedules:', error);
        }
    }
    
    async syncWithServer() {
        try {
            const response = await fetch('/api/schedules');
            if (response.ok) {
                const serverSchedules = await response.json();
                
                // Compare and update if different
                if (JSON.stringify(serverSchedules) !== JSON.stringify(this.schedules)) {
                    this.schedules = serverSchedules;
                    await this.saveSchedules();
                    console.log('Schedules synced with server');
                }
            }
        } catch (error) {
            console.error('Error syncing with server:', error);
        }
    }
    
    startScheduleChecking() {
        // Check every minute
        this.checkInterval = setInterval(() => {
            this.checkSchedules();
        }, 60000);
        
        // Check immediately
        this.checkSchedules();
    }
    
    checkSchedules() {
        const now = new Date();
        const currentDay = this.getDayName(now.getDay());
        const currentTime = this.formatTime(now);
        
        // Find schedules that should trigger now
        const dueSchedules = this.schedules.filter(schedule => {
            return schedule.is_active === 1 &&
                   schedule.day_of_week === currentDay &&
                   schedule.time === currentTime;
        });
        
        // Trigger due schedules
        dueSchedules.forEach(schedule => {
            this.triggerSchedule(schedule);
        });
        
        // Find next schedule
        this.updateNextSchedule(currentDay, currentTime);
    }
    
    async triggerSchedule(schedule) {
        console.log('Triggering schedule:', schedule.name);
        
        // Check holiday mode
        const holidayMode = localStorage.getItem('holiday-mode') === 'true';
        if (holidayMode) {
            console.log('Holiday mode active, skipping schedule');
            return;
        }
        
        // Play audio
        try {
            await this.audioPlayer.play(schedule.audio_file);
            
            // Show notification
            await this.showNotification(
                '🔔 ' + schedule.name,
                `Bel ${schedule.name} telah berbunyi`
            );
            
            // Log the play
            this.logPlay(schedule, 'success');
            
        } catch (error) {
            console.error('Error playing schedule:', error);
            this.logPlay(schedule, 'failed', error.message);
        }
    }
    
    updateNextSchedule(currentDay, currentTime) {
        const todaySchedules = this.schedules
            .filter(s => s.is_active === 1 && s.day_of_week === currentDay)
            .sort((a, b) => a.time.localeCompare(b.time));
        
        const nextSchedule = todaySchedules.find(s => s.time > currentTime);
        
        if (nextSchedule) {
            this.scheduleNextNotification(nextSchedule);
            
            // Update UI if available
            if (window.updateNextScheduleDisplay) {
                window.updateNextScheduleDisplay(nextSchedule);
            }
        }
    }
    
    scheduleNextNotification(schedule) {
        // Clear existing timer
        if (this.nextScheduleTimer) {
            clearTimeout(this.nextScheduleTimer);
        }
        
        // Calculate time until next schedule
        const now = new Date();
        const [hours, minutes] = schedule.time.split(':').map(Number);
        const scheduleTime = new Date();
        scheduleTime.setHours(hours, minutes, 0, 0);
        
        // If schedule time has passed, schedule for tomorrow
        if (scheduleTime <= now) {
            scheduleTime.setDate(scheduleTime.getDate() + 1);
        }
        
        const timeUntil = scheduleTime - now;
        
        // Show notification 1 minute before
        const notificationTime = timeUntil - 60000;
        if (notificationTime > 0) {
            this.nextScheduleTimer = setTimeout(() => {
                this.showNotification(
                    '⏰ Jadwal Akan Datang',
                    `${schedule.name} akan berbunyi dalam 1 menit`
                );
            }, notificationTime);
        }
    }
    
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            console.log('Notification permission:', permission);
        }
    }
    
    async showNotification(title, body) {
        if (this.notificationPermission === 'granted' && document.visibilityState !== 'visible') {
            const notification = new Notification(title, {
                body: body,
                icon: '/static/icons/icon-192.png',
                badge: '/static/icons/badge-72.png',
                vibrate: [200, 100, 200],
                tag: 'school-bell'
            });
            
            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        }
    }
    
    logPlay(schedule, status, notes = '') {
        const log = {
            id: Date.now(),
            schedule_id: schedule.id,
            schedule_name: schedule.name,
            audio_file: schedule.audio_file,
            played_at: new Date().toISOString(),
            status: status,
            notes: notes
        };
        
        // Save to localStorage
        const logs = JSON.parse(localStorage.getItem('school-bell-logs') || '[]');
        logs.unshift(log);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(100);
        }
        
        localStorage.setItem('school-bell-logs', JSON.stringify(logs));
        
        // Try to sync with server if online
        if (this.isOnline) {
            this.syncLogToServer(log);
        }
    }
    
    async syncLogToServer(log) {
        try {
            await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(log)
            });
        } catch (error) {
            console.error('Error syncing log to server:', error);
        }
    }
    
    handleOnline() {
        this.isOnline = true;
        console.log('Back online, syncing...');
        
        // Sync schedules and logs
        this.syncWithServer();
        this.syncPendingLogs();
    }
    
    handleOffline() {
        this.isOnline = false;
        console.log('Gone offline, using local data');
    }
    
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Page is visible, check for missed schedules
            this.checkSchedules();
        }
    }
    
    async syncPendingLogs() {
        const logs = JSON.parse(localStorage.getItem('school-bell-logs') || '[]');
        const pendingLogs = logs.filter(log => !log.synced);
        
        for (const log of pendingLogs) {
            try {
                await this.syncLogToServer(log);
                log.synced = true;
            } catch (error) {
                console.error('Failed to sync log:', log.id);
            }
        }
        
        localStorage.setItem('school-bell-logs', JSON.stringify(logs));
    }
    
    getDayName(dayIndex) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[dayIndex];
    }
    
    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Public methods
    async addSchedule(schedule) {
        this.schedules.push(schedule);
        await this.saveSchedules();
        this.checkSchedules();
    }
    
    async updateSchedule(scheduleId, updatedSchedule) {
        const index = this.schedules.findIndex(s => s.id === scheduleId);
        if (index !== -1) {
            this.schedules[index] = { ...this.schedules[index], ...updatedSchedule };
            await this.saveSchedules();
            this.checkSchedules();
        }
    }
    
    async deleteSchedule(scheduleId) {
        this.schedules = this.schedules.filter(s => s.id !== scheduleId);
        await this.saveSchedules();
        this.checkSchedules();
    }
    
    async toggleSchedule(scheduleId) {
        const schedule = this.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            schedule.is_active = schedule.is_active ? 0 : 1;
            await this.saveSchedules();
            this.checkSchedules();
        }
    }
    
    getSchedules() {
        return this.schedules;
    }
    
    getTodaySchedules() {
        const today = this.getDayName(new Date().getDay());
        return this.schedules
            .filter(s => s.is_active === 1 && s.day_of_week === today)
            .sort((a, b) => a.time.localeCompare(b.time));
    }
    
    getNextSchedule() {
        const now = new Date();
        const currentDay = this.getDayName(now.getDay());
        const currentTime = this.formatTime(now);
        
        const todaySchedules = this.schedules
            .filter(s => s.is_active === 1 && s.day_of_week === currentDay)
            .sort((a, b) => a.time.localeCompare(b.time));
        
        return todaySchedules.find(s => s.time > currentTime);
    }
    
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        if (this.nextScheduleTimer) {
            clearTimeout(this.nextScheduleTimer);
        }
    }
}

// Initialize PWA Scheduler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pwaScheduler = new PWAScheduler();
});