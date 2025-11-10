// Main JavaScript untuk School Bell System

// Update waktu di navbar setiap detik
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID');
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Jalankan update waktu setiap detik
setInterval(updateTime, 1000);
updateTime();

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'info') {
    // Buat elemen alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto close setelah 3 detik
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Fungsi untuk konfirmasi aksi
function confirmAction(message) {
    return confirm(message);
}

// Fungsi untuk format waktu
function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleString('id-ID');
}

// Cek status sistem secara berkala
function checkSystemStatus() {
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            const statusBadge = document.getElementById('statusBadge');
            if (statusBadge) {
                if (data.is_playing) {
                    statusBadge.innerHTML = '<i class="bi bi-circle-fill"></i> Playing';
                    statusBadge.className = 'badge bg-warning';
                } else {
                    statusBadge.innerHTML = '<i class="bi bi-circle-fill"></i> Online';
                    statusBadge.className = 'badge bg-success';
                }
            }
        })
        .catch(error => {
            console.error('Error checking status:', error);
            const statusBadge = document.getElementById('statusBadge');
            if (statusBadge) {
                statusBadge.innerHTML = '<i class="bi bi-circle-fill"></i> Offline';
                statusBadge.className = 'badge bg-danger';
            }
        });
}

// Cek status setiap 5 detik
setInterval(checkSystemStatus, 5000);
checkSystemStatus();

// Fungsi utility untuk API calls
async function apiCall(url, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Set active menu berdasarkan halaman saat ini
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});
