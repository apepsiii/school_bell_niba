import pygame
import os
import threading
from mutagen.mp3 import MP3

class AudioPlayer:
    """Class untuk menangani pemutaran audio"""
    
    def __init__(self):
        pygame.mixer.init()
        self.is_playing = False
        self.current_file = None
        self.volume = 0.8  # Default volume 80%
        
    def set_volume(self, volume):
        """Set volume (0.0 - 1.0)"""
        self.volume = max(0.0, min(1.0, volume))
        pygame.mixer.music.set_volume(self.volume)
    
    def play(self, audio_path, callback=None):
        """
        Memutar file audio
        callback: function yang dipanggil setelah selesai
        """
        if not os.path.exists(audio_path):
            print(f"File tidak ditemukan: {audio_path}")
            return False
        
        try:
            # Stop audio yang sedang diputar
            if self.is_playing:
                self.stop()
            
            # Load dan play audio
            pygame.mixer.music.load(audio_path)
            pygame.mixer.music.set_volume(self.volume)
            pygame.mixer.music.play()
            
            self.is_playing = True
            self.current_file = audio_path
            
            print(f"Memutar: {audio_path}")
            
            # Thread untuk monitor kapan audio selesai
            if callback:
                monitor_thread = threading.Thread(
                    target=self._monitor_playback, 
                    args=(callback,)
                )
                monitor_thread.daemon = True
                monitor_thread.start()
            
            return True
            
        except Exception as e:
            print(f"Error memutar audio: {e}")
            self.is_playing = False
            return False
    
    def _monitor_playback(self, callback):
        """Monitor pemutaran dan panggil callback saat selesai"""
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
        
        self.is_playing = False
        self.current_file = None
        
        if callback:
            callback()
    
    def stop(self):
        """Stop pemutaran audio"""
        if self.is_playing:
            pygame.mixer.music.stop()
            self.is_playing = False
            self.current_file = None
            print("Audio dihentikan")
    
    def pause(self):
        """Pause audio"""
        if self.is_playing:
            pygame.mixer.music.pause()
    
    def unpause(self):
        """Resume audio yang di-pause"""
        if self.is_playing:
            pygame.mixer.music.unpause()
    
    def get_audio_duration(self, audio_path):
        """Mendapatkan durasi audio dalam detik"""
        try:
            audio = MP3(audio_path)
            return audio.info.length
        except:
            return 0
    
    def is_audio_playing(self):
        """Cek apakah sedang ada audio yang diputar"""
        return self.is_playing and pygame.mixer.music.get_busy()

# Global audio player instance
audio_player = AudioPlayer()

def play_audio(audio_path, callback=None):
    """Helper function untuk play audio"""
    return audio_player.play(audio_path, callback)

def stop_audio():
    """Helper function untuk stop audio"""
    audio_player.stop()

def set_volume(volume_percent):
    """Helper function untuk set volume (0-100)"""
    audio_player.set_volume(volume_percent / 100.0)

def is_playing():
    """Helper function untuk cek status playing"""
    return audio_player.is_audio_playing()
