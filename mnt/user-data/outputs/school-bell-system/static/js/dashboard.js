// Dashboard JavaScript

// Load status dan data dashboard
function loadDashboard() {
    loadSystemStatus();
    loadNextSchedule();
    loadRecentLogs();
}

// Load system status
function loadSystemStatus() {
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            // Update playing status
            const playingStatus = document.getElementById('playingStatus');
            if (data.is_playing) {
                playingStatus.innerHTML = '<span class="badge bg-success">Sedang Diputar</span>';
            } else {
                playingStatus.innerHTML = '<span class="badge bg-secondary">Diam</span>';
            }
            
            // Update holiday mode
            const holidaySwitch = document.getElementById('holidayModeSwitch');
            const holidayLabel = document.getElementById('holidayModeLabel');
            holidaySwitch.checked = data.holiday_mode;
            holidayLabel.textContent = data.holiday_mode ? 'Aktif' : 'Nonaktif';
            
            // Update volume
            const volumeControl = document.getElementById('volumeControl');
            const volumeValue = document.getElementById('volumeValue');
            volumeControl.value = data.volume;
            volumeValue.textContent = data.volume;
        })
        .catch(error => console.error('Error loading status:', error));
}

// Load next schedule
function loadNextSchedule() {
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            const nextScheduleInfo = document.getElementById('nextScheduleInfo');
            
            if (data.next_schedule) {
                const schedule = data.next_schedule;
                nextScheduleInfo.innerHTML = `
                    <div class="row align-items-center">
                        <div class="col-md-3 text-center">
                            <i class="bi bi-alarm" style="font-size: 3rem; color: #0d6efd;"></i>
                        </div>
                        <div class="col-md-9">
                            <h4>${schedule.name}</h4>
                            <p class="mb-1">
                                <i class="bi bi-calendar"></i> <strong>${data.current_day}</strong>
                                <i class="bi bi-clock ms-3"></i> <strong>${schedule.time}</strong>
                            </p>
                            <p class="mb-0 text-muted">
                                <i class="bi bi-music-note"></i> ${schedule.audio_file}
                            </p>
                        </div>
                    </div>
                `;
            } else {
                nextScheduleInfo.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="bi bi-calendar-x" style="font-size: 3rem;"></i>
                        <p class="mt-2 mb-0">Tidak ada jadwal berikutnya hari ini</p>
                    </div>
                `;
            }
        })
        .catch(error => console.error('Error loading next schedule:', error));
}

// Load recent logs
function loadRecentLogs() {
    fetch('/api/logs?limit=5')
        .then(response => response.json())
        .then(logs => {
            const tbody = document.getElementById('recentLogs');
            
            if (logs.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-muted">Belum ada log pemutaran</td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = logs.map(log => {
                let statusBadge = '';
                if (log.status === 'success') {
                    statusBadge = '<span class="badge bg-success">Sukses</span>';
                } else if (log.status === 'failed') {
                    statusBadge = '<span class="badge bg-danger">Gagal</span>';
                } else if (log.status === 'manual_play') {
                    statusBadge = '<span class="badge bg-info">Manual</span>';
                } else if (log.status === 'cancelled') {
                    statusBadge = '<span class="badge bg-warning">Dibatalkan</span>';
                }
                
                return `
                    <tr>
                        <td>${log.played_at}</td>
                        <td>${log.schedule_name || '<span class="badge bg-info">Manual</span>'}</td>
                        <td>${log.audio_file}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            }).join('');
        })
        .catch(error => console.error('Error loading logs:', error));
}

// Event listeners
document.getElementById('holidayModeSwitch')?.addEventListener('change', function() {
    const isChecked = this.checked;
    
    fetch('/api/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            holiday_mode: isChecked
        })
    })
    .then(response => response.json())
    .then(data => {
        const label = document.getElementById('holidayModeLabel');
        label.textContent = isChecked ? 'Aktif' : 'Nonaktif';
        showNotification(
            isChecked ? 'Mode libur diaktifkan - Bel tidak akan berbunyi' : 'Mode libur dinonaktifkan',
            'success'
        );
    })
    .catch(error => {
        console.error('Error updating holiday mode:', error);
        showNotification('Gagal mengubah mode libur', 'danger');
    });
});

document.getElementById('volumeControl')?.addEventListener('input', function() {
    const volume = this.value;
    document.getElementById('volumeValue').textContent = volume;
});

document.getElementById('volumeControl')?.addEventListener('change', function() {
    const volume = this.value;
    
    fetch('/api/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            volume: parseInt(volume)
        })
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Volume diubah ke ' + volume + '%', 'success');
    })
    .catch(error => {
        console.error('Error updating volume:', error);
        showNotification('Gagal mengubah volume', 'danger');
    });
});

// Refresh dashboard setiap 10 detik
setInterval(loadDashboard, 10000);

// Load saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadDashboard);
