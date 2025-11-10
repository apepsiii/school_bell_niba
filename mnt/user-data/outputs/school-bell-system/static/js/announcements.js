// Announcements JavaScript

let statusCheckInterval = null;

function playAnnouncement() {
    const audioSelect = document.getElementById('audioSelect');
    const audioFile = audioSelect.value;
    
    if (!audioFile) {
        showNotification('Mohon pilih audio terlebih dahulu', 'warning');
        return;
    }
    
    fetch('/api/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            audio_file: audioFile
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Audio sedang diputar', 'success');
            updatePlayingStatus(true, audioSelect.options[audioSelect.selectedIndex].text);
            
            // Start checking status
            startStatusCheck();
        } else {
            showNotification('Gagal memutar audio', 'danger');
        }
    })
    .catch(error => {
        console.error('Error playing audio:', error);
        showNotification('Gagal memutar audio', 'danger');
    });
}

function stopAnnouncement() {
    fetch('/api/stop', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Audio dihentikan', 'info');
            updatePlayingStatus(false);
            stopStatusCheck();
        }
    })
    .catch(error => {
        console.error('Error stopping audio:', error);
        showNotification('Gagal menghentikan audio', 'danger');
    });
}

function updatePlayingStatus(isPlaying, audioName = '') {
    const playingStatusDiv = document.getElementById('playingStatus');
    const currentlyPlayingDiv = document.getElementById('currentlyPlaying');
    
    if (isPlaying) {
        playingStatusDiv.style.display = 'none';
        currentlyPlayingDiv.style.display = 'block';
        document.getElementById('currentAudioName').textContent = audioName;
    } else {
        playingStatusDiv.style.display = 'block';
        currentlyPlayingDiv.style.display = 'none';
    }
}

function checkPlayingStatus() {
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            if (!data.is_playing) {
                updatePlayingStatus(false);
                stopStatusCheck();
            }
        })
        .catch(error => console.error('Error checking status:', error));
}

function startStatusCheck() {
    if (!statusCheckInterval) {
        statusCheckInterval = setInterval(checkPlayingStatus, 2000);
    }
}

function stopStatusCheck() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
    }
}

// Volume control
document.getElementById('volumeSlider')?.addEventListener('input', function() {
    document.getElementById('volumeDisplay').textContent = this.value;
});

document.getElementById('volumeSlider')?.addEventListener('change', function() {
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

// Load initial status
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            // Set volume
            const volumeSlider = document.getElementById('volumeSlider');
            const volumeDisplay = document.getElementById('volumeDisplay');
            if (volumeSlider && volumeDisplay) {
                volumeSlider.value = data.volume;
                volumeDisplay.textContent = data.volume;
            }
            
            // Check if playing
            if (data.is_playing) {
                const audioSelect = document.getElementById('audioSelect');
                updatePlayingStatus(true, 'Audio sedang diputar...');
                startStatusCheck();
            }
        })
        .catch(error => console.error('Error loading status:', error));
});

// Cleanup saat leave page
window.addEventListener('beforeunload', function() {
    stopStatusCheck();
});
