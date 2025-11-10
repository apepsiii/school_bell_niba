// Schedules JavaScript

let isEditMode = false;
let editScheduleId = null;

function saveSchedule() {
    const name = document.getElementById('scheduleName').value;
    const dayOfWeek = document.getElementById('scheduleDayOfWeek').value;
    const time = document.getElementById('scheduleTime').value;
    const audioFile = document.getElementById('scheduleAudioFile').value;
    
    if (!name || !dayOfWeek || !time || !audioFile) {
        showNotification('Mohon lengkapi semua field', 'warning');
        return;
    }
    
    const data = {
        name: name,
        day_of_week: dayOfWeek,
        time: time,
        audio_file: audioFile
    };
    
    const url = isEditMode ? `/api/schedules/${editScheduleId}` : '/api/schedules';
    const method = isEditMode ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification(
                isEditMode ? 'Jadwal berhasil diupdate' : 'Jadwal berhasil ditambahkan',
                'success'
            );
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addScheduleModal'));
            modal.hide();
            
            // Reset form
            document.getElementById('scheduleForm').reset();
            isEditMode = false;
            editScheduleId = null;
            
            // Reload page
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Error saving schedule:', error);
        showNotification('Gagal menyimpan jadwal', 'danger');
    });
}

function editSchedule(scheduleId) {
    // Ambil data schedule
    fetch('/api/schedules')
        .then(response => response.json())
        .then(schedules => {
            const schedule = schedules.find(s => s.id === scheduleId);
            
            if (schedule) {
                // Set form values
                document.getElementById('scheduleName').value = schedule.name;
                document.getElementById('scheduleDayOfWeek').value = schedule.day_of_week;
                document.getElementById('scheduleTime').value = schedule.time;
                document.getElementById('scheduleAudioFile').value = schedule.audio_file;
                
                // Set edit mode
                isEditMode = true;
                editScheduleId = scheduleId;
                
                // Change modal title
                document.querySelector('#addScheduleModal .modal-title').textContent = 'Edit Jadwal';
                
                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('addScheduleModal'));
                modal.show();
            }
        })
        .catch(error => console.error('Error loading schedule:', error));
}

function deleteSchedule(scheduleId) {
    if (!confirmAction('Apakah Anda yakin ingin menghapus jadwal ini?')) {
        return;
    }
    
    fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Jadwal berhasil dihapus', 'success');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Error deleting schedule:', error);
        showNotification('Gagal menghapus jadwal', 'danger');
    });
}

function toggleSchedule(scheduleId) {
    fetch(`/api/schedules/${scheduleId}/toggle`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Status jadwal berhasil diubah', 'success');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Error toggling schedule:', error);
        showNotification('Gagal mengubah status jadwal', 'danger');
    });
}

// Reset modal saat ditutup
document.getElementById('addScheduleModal')?.addEventListener('hidden.bs.modal', function () {
    document.getElementById('scheduleForm').reset();
    document.querySelector('#addScheduleModal .modal-title').textContent = 'Tambah Jadwal Baru';
    isEditMode = false;
    editScheduleId = null;
});
