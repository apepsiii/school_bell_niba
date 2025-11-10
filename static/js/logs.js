// Logs JavaScript

function loadLogs() {
    fetch('/api/logs?limit=100')
        .then(response => response.json())
        .then(logs => {
            updateLogTable(logs);
            updateStatistics(logs);
        })
        .catch(error => console.error('Error loading logs:', error));
}

function updateLogTable(logs) {
    const tbody = document.getElementById('logsTableBody');
    
    if (logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">Belum ada log pemutaran</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = logs.map(log => {
        let statusBadge = '';
        if (log.status === 'success') {
            statusBadge = '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Sukses</span>';
        } else if (log.status === 'failed') {
            statusBadge = '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Gagal</span>';
        } else if (log.status === 'manual_play') {
            statusBadge = '<span class="badge bg-info"><i class="bi bi-hand-index"></i> Manual</span>';
        } else if (log.status === 'cancelled') {
            statusBadge = '<span class="badge bg-warning"><i class="bi bi-dash-circle"></i> Dibatalkan</span>';
        }
        
        return `
            <tr>
                <td>${log.played_at}</td>
                <td>${log.schedule_name || '<span class="badge bg-info">Manual</span>'}</td>
                <td>${log.audio_file}</td>
                <td>${statusBadge}</td>
                <td><small class="text-muted">${log.notes || '-'}</small></td>
            </tr>
        `;
    }).join('');
}

function updateStatistics(logs) {
    const successCount = logs.filter(log => log.status === 'success').length;
    const failedCount = logs.filter(log => log.status === 'failed').length;
    const manualCount = logs.filter(log => log.status === 'manual_play').length;
    
    document.getElementById('successCount').textContent = successCount;
    document.getElementById('failedCount').textContent = failedCount;
    document.getElementById('manualCount').textContent = manualCount;
}

function refreshLogs() {
    showNotification('Memuat ulang log...', 'info');
    loadLogs();
}

// Load logs saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadLogs);

// Auto refresh setiap 30 detik
setInterval(loadLogs, 30000);
