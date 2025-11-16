/**
 * School Bell Client Player
 * Handles WebSocket connection, real-time updates, and audio playback
 */

// Configuration
const API_URL = window.location.origin;
const SOCKET_URL = window.location.origin;

// Global variables
let socket = null;
let currentAudio = null;
let countdownInterval = null;
let clockInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔔 School Bell Client Player Starting...');
    
    // Start clock
    startClock();
    
    // Initialize Socket.IO connection
    initializeSocket();
    
    // Fetch initial data
    fetchStatus();
    fetchTodaySchedules();
    
    // Refresh data periodically
    setInterval(fetchStatus, 30000); // Every 30 seconds
    setInterval(fetchTodaySchedules, 60000); // Every minute
    
    // Hide loading overlay after 2 seconds
    setTimeout(() => {
        document.getElementById('loadingOverlay').style.display = 'none';
    }, 2000);
});

// ==================== SOCKET.IO CONNECTION ====================

function initializeSocket() {
    console.log('🔌 Connecting to WebSocket...');
    
    socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
    });
    
    socket.on('connect', function() {
        console.log('✅ WebSocket connected');
        updateConnectionStatus(true);
        socket.emit('request_status');
    });
    
    socket.on('disconnect', function() {
        console.log('❌ WebSocket disconnected');
        updateConnectionStatus(false);
    });
    
    socket.on('connection_status', function(data) {
        console.log('Connection status:', data);
    });
    
    socket.on('status_update', function(data) {
        console.log('📊 Status update received:', data);
        updateStatus(data);
    });
    
    socket.on('bell_triggered', function(data) {
        console.log('🔔 Bell triggered:', data);
        handleBellTriggered(data);
    });
    
    socket.on('connect_error', function(error) {
        console.error('Connection error:', error);
        updateConnectionStatus(false);
    });
}

function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    
    if (connected) {
        statusEl.className = 'connection-status connected';
        statusEl.innerHTML = '<i class="bi bi-wifi"></i> <span>Terhubung</span>';
    } else {
        statusEl.className = 'connection-status disconnected';
        statusEl.innerHTML = '<div class="spinner"></div> <span>Menghubungkan...</span>';
    }
}

// ==================== CLOCK ====================

function startClock() {
    function updateClock() {
        const now = new Date();
        
        // Format time
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        document.getElementById('clockTime').textContent = `${hours}:${minutes}:${seconds}`;
        
        // Format date
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        
        document.getElementById('clockDate').textContent = 
            `${dayName}, ${day} ${month} ${year}`;
    }
    
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

// ==================== API CALLS ====================

async function fetchStatus() {
    try {
        const response = await fetch(`${API_URL}/api/client/status`);
        const data = await response.json();
        
        if (data.success) {
            updateStatus(data);
        }
    } catch (error) {
        console.error('Error fetching status:', error);
    }
}

async function fetchTodaySchedules() {
    try {
        const response = await fetch(`${API_URL}/api/client/schedules/today`);
        const data = await response.json();
        
        if (data.success) {
            displaySchedules(data.schedules);
        }
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
}

// ==================== UI UPDATES ====================

function updateStatus(data) {
    const statusIndicator = document.getElementById('statusIndicator');
    
    // Update status indicator
    if (data.is_playing) {
        statusIndicator.className = 'status-indicator playing';
        statusIndicator.innerHTML = `
            <div class="status-icon">
                <i class="bi bi-music-note-beamed"></i>
            </div>
            <div>
                <h4 class="mb-0">Sedang Memutar</h4>
                <small>${data.current_file || 'Audio'}</small>
            </div>
        `;
    } else if (data.holiday_mode) {
        statusIndicator.className = 'status-indicator holiday';
        statusIndicator.innerHTML = `
            <div class="status-icon">
                <i class="bi bi-calendar-x"></i>
            </div>
            <div>
                <h4 class="mb-0">Mode Libur</h4>
                <small>Semua bel dinonaktifkan</small>
            </div>
        `;
    } else {
        statusIndicator.className = 'status-indicator online';
        statusIndicator.innerHTML = `
            <div class="status-icon">
                <i class="bi bi-check-circle-fill"></i>
            </div>
            <div>
                <h4 class="mb-0">Sistem Aktif</h4>
                <small>Menunggu jadwal berikutnya</small>
            </div>
        `;
    }
    
    // Update next bell
    if (data.next_schedule && !data.holiday_mode) {
        showNextBell(data.next_schedule);
    } else {
        hideNextBell();
    }
}

function showNextBell(schedule) {
    const nextBellCard = document.getElementById('nextBellCard');
    document.getElementById('nextBellName').textContent = schedule.name;
    document.getElementById('nextBellTime').textContent = schedule.time;
    nextBellCard.style.display = 'block';
    
    // Start countdown
    startCountdown(schedule.in_seconds || 0);
}

function hideNextBell() {
    document.getElementById('nextBellCard').style.display = 'none';
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
}

function startCountdown(seconds) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    let remaining = seconds;
    
    function updateCountdown() {
        if (remaining <= 0) {
            document.getElementById('countdownDisplay').textContent = '00:00:00';
            clearInterval(countdownInterval);
            // Refresh status after bell time
            setTimeout(fetchStatus, 2000);
            return;
        }
        
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        
        document.getElementById('countdownDisplay').textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        remaining--;
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function displaySchedules(schedules) {
    const scheduleList = document.getElementById('scheduleList');
    
    if (!schedules || schedules.length === 0) {
        scheduleList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-calendar-x"></i>
                <p>Tidak ada jadwal untuk hari ini</p>
            </div>
        `;
        return;
    }
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    let html = '';
    
    schedules.forEach(schedule => {
        let statusClass = 'upcoming';
        let icon = 'alarm';
        
        if (schedule.time < currentTime) {
            statusClass = 'past';
            icon = 'check-circle';
        } else if (schedule.time === currentTime) {
            statusClass = 'active';
            icon = 'bell-fill';
        }
        
        html += `
            <div class="schedule-item ${statusClass}">
                <div class="schedule-time">${schedule.time}</div>
                <div class="schedule-name">${schedule.name}</div>
                <div class="schedule-icon">
                    <i class="bi bi-${icon}"></i>
                </div>
            </div>
        `;
    });
    
    scheduleList.innerHTML = html;
}

// ==================== BELL EVENT HANDLING ====================

function handleBellTriggered(data) {
    console.log('🔔 Bell event received:', data);
    
    // Play audio
    playBellAudio(data.audio_file);
    
    // Show notification if supported
    showNotification(data.schedule_name, data.time);
    
    // Refresh status and schedules
    setTimeout(() => {
        fetchStatus();
        fetchTodaySchedules();
    }, 1000);
}

async function playBellAudio(audioFile) {
    try {
        // Stop current audio if playing
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        // Create and play new audio
        const audioUrl = `${API_URL}/api/client/audio/${audioFile}`;
        currentAudio = new Audio(audioUrl);
        
        currentAudio.addEventListener('canplay', () => {
            console.log('🔊 Playing bell audio:', audioFile);
            currentAudio.play().catch(err => {
                console.error('Error playing audio:', err);
                // Browser might block autoplay, show user interaction required
            });
        });
        
        currentAudio.addEventListener('ended', () => {
            console.log('✅ Audio playback completed');
            currentAudio = null;
        });
        
        currentAudio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
        });
        
    } catch (error) {
        console.error('Error setting up audio:', error);
    }
}

function showNotification(title, time) {
    if (!('Notification' in window)) {
        return;
    }
    
    if (Notification.permission === 'granted') {
        new Notification('🔔 ' + title, {
            body: `Bel berbunyi pada ${time}`,
            icon: '/static/img/bell-icon.png',
            badge: '/static/img/bell-badge.png'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(title, time);
            }
        });
    }
}

// ==================== OFFLINE SUPPORT ====================

window.addEventListener('online', function() {
    console.log('🌐 Back online');
    updateConnectionStatus(true);
    fetchStatus();
    fetchTodaySchedules();
});

window.addEventListener('offline', function() {
    console.log('📡 Gone offline');
    updateConnectionStatus(false);
});

// ==================== ERROR HANDLING ====================

window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

console.log('✅ Client player initialized');