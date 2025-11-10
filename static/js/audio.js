// Audio Management JavaScript

function uploadAudio() {
    const displayName = document.getElementById('displayName').value;
    const fileInput = document.getElementById('audioFile');
    const file = fileInput.files[0];
    
    if (!displayName || !file) {
        showNotification('Mohon lengkapi semua field', 'warning');
        return;
    }
    
    // Validasi ukuran file (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
        showNotification('Ukuran file maksimal 50MB', 'danger');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('display_name', displayName);
    
    // Show progress
    document.getElementById('uploadProgress').style.display = 'block';
    
    fetch('/api/audio/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        document.getElementById('uploadProgress').style.display = 'none';
        
        if (result.success) {
            showNotification('File audio berhasil diupload', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('uploadAudioModal'));
            modal.hide();
            
            // Reset form
            document.getElementById('uploadForm').reset();
            
            // Reload page
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showNotification('Gagal upload file: ' + result.error, 'danger');
        }
    })
    .catch(error => {
        document.getElementById('uploadProgress').style.display = 'none';
        console.error('Error uploading audio:', error);
        showNotification('Gagal upload file audio', 'danger');
    });
}

function deleteAudio(audioId, displayName) {
    if (!confirmAction(`Apakah Anda yakin ingin menghapus "${displayName}"?\n\nPerhatian: Jadwal yang menggunakan audio ini akan error!`)) {
        return;
    }
    
    fetch(`/api/audio/${audioId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('File audio berhasil dihapus', 'success');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Error deleting audio:', error);
        showNotification('Gagal menghapus file audio', 'danger');
    });
}

function previewAudio(filename) {
    const audioPreview = document.getElementById('audioPreview');
    const audioPreviewSection = document.getElementById('audioPreviewSection');
    
    audioPreview.src = `/static/audio/${filename}`;
    audioPreviewSection.style.display = 'block';
    
    // Scroll to preview
    audioPreviewSection.scrollIntoView({ behavior: 'smooth' });
}

function closePreview() {
    const audioPreview = document.getElementById('audioPreview');
    const audioPreviewSection = document.getElementById('audioPreviewSection');
    
    audioPreview.pause();
    audioPreview.src = '';
    audioPreviewSection.style.display = 'none';
}

// Auto-fill display name dari filename
document.getElementById('audioFile')?.addEventListener('change', function() {
    const displayNameInput = document.getElementById('displayName');
    
    if (this.files.length > 0 && !displayNameInput.value) {
        const filename = this.files[0].name;
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        displayNameInput.value = nameWithoutExt;
    }
});

// Reset modal saat ditutup
document.getElementById('uploadAudioModal')?.addEventListener('hidden.bs.modal', function () {
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadProgress').style.display = 'none';
});
