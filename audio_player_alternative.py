"""
Audio Player Module - Windows Compatible Version
Alternatif untuk pygame yang sering error di Windows
"""

import os
import threading
from mutagen.mp3 import MP3

# Try multiple audio backends
AUDIO_BACKEND = None

# Try importing pygame first
try:
    import pygame
    pygame.mixer.init()
    AUDIO_BACKEND = 'pygame'
    print("Audio backend: pygame")
except ImportError:
    pass

# If pygame fails, try playsound
if AUDIO_BACKEND is None:
    try:
        from playsound import playsound
        AUDIO_BACKEND = 'playsound'
        print("Audio backend: playsound")
    except ImportError:
        pass

# If playsound fails, try winsound (Windows only)
if AUDIO_BACKEND is None:
    try:
        import winsound
        AUDIO_BACKEND = 'winsound'
        print("Audio backend: winsound (Windows)")
    except ImportError:
        pass

# If all fail, use pydub with simpleaudio
if AUDIO_BACKEND is None:
    try:
        from pydub import AudioSegment
        from pydub.playback import play
        AUDIO_BACKEND = 'pydub'
        print("Audio backend: pydub")
    except ImportError:
        print("WARNING: No audio backend available!")
        print("Install one of: pygame, playsound, or pydub")
        AUDIO_BACKEND = 'none'


class AudioPlayer:
    """Class untuk menangani pemutaran audio dengan multiple backends"""
    
    def __init__(self):
        self.is_playing = False
        self.current_file = None
        self.volume = 0.8
        self.backend = AUDIO_BACKEND
        self._stop_flag = False
        
    def set_volume(self, volume):
        """Set volume (0.0 - 1.0)"""
        self.volume = max(0.0, min(1.0, volume))
        if self.backend == 'pygame':
            pygame.mixer.music.set_volume(self.volume)
    
    def play(self, audio_path, callback=None):
        """Memutar file audio"""
        if not os.path.exists(audio_path):
            print(f"File tidak ditemukan: {audio_path}")
            return False
        
        if self.is_playing:
            self.stop()
        
        self._stop_flag = False
        
        if self.backend == 'pygame':
            return self._play_pygame(audio_path, callback)
        elif self.backend == 'playsound':
            return self._play_playsound(audio_path, callback)
        elif self.backend == 'winsound':
            return self._play_winsound(audio_path, callback)
        elif self.backend == 'pydub':
            return self._play_pydub(audio_path, callback)
        else:
            print("ERROR: No audio backend available!")
            return False
    
    def _play_pygame(self, audio_path, callback):
        """Play using pygame"""
        try:
            pygame.mixer.music.load(audio_path)
            pygame.mixer.music.set_volume(self.volume)
            pygame.mixer.music.play()
            
            self.is_playing = True
            self.current_file = audio_path
            
            if callback:
                monitor_thread = threading.Thread(
                    target=self._monitor_pygame_playback, 
                    args=(callback,)
                )
                monitor_thread.daemon = True
                monitor_thread.start()
            
            print(f"Memutar (pygame): {audio_path}")
            return True
        except Exception as e:
            print(f"Error pygame: {e}")
            return False
    
    def _play_playsound(self, audio_path, callback):
        """Play using playsound"""
        try:
            self.is_playing = True
            self.current_file = audio_path
            
            def play_thread():
                try:
                    from playsound import playsound
                    playsound(audio_path)
                    self.is_playing = False
                    self.current_file = None
                    if callback:
                        callback()
                except Exception as e:
                    print(f"Error playsound: {e}")
                    self.is_playing = False
            
            thread = threading.Thread(target=play_thread)
            thread.daemon = True
            thread.start()
            
            print(f"Memutar (playsound): {audio_path}")
            return True
        except Exception as e:
            print(f"Error playsound: {e}")
            return False
    
    def _play_winsound(self, audio_path, callback):
        """Play using winsound (Windows only, WAV files only)"""
        try:
            import winsound
            
            # winsound only supports WAV files
            if not audio_path.lower().endswith('.wav'):
                print("winsound only supports WAV files")
                return False
            
            self.is_playing = True
            self.current_file = audio_path
            
            def play_thread():
                try:
                    winsound.PlaySound(audio_path, winsound.SND_FILENAME)
                    self.is_playing = False
                    self.current_file = None
                    if callback:
                        callback()
                except Exception as e:
                    print(f"Error winsound: {e}")
                    self.is_playing = False
            
            thread = threading.Thread(target=play_thread)
            thread.daemon = True
            thread.start()
            
            print(f"Memutar (winsound): {audio_path}")
            return True
        except Exception as e:
            print(f"Error winsound: {e}")
            return False
    
    def _play_pydub(self, audio_path, callback):
        """Play using pydub"""
        try:
            from pydub import AudioSegment
            from pydub.playback import play
            
            self.is_playing = True
            self.current_file = audio_path
            
            def play_thread():
                try:
                    audio = AudioSegment.from_mp3(audio_path)
                    play(audio)
                    self.is_playing = False
                    self.current_file = None
                    if callback:
                        callback()
                except Exception as e:
                    print(f"Error pydub: {e}")
                    self.is_playing = False
            
            thread = threading.Thread(target=play_thread)
            thread.daemon = True
            thread.start()
            
            print(f"Memutar (pydub): {audio_path}")
            return True
        except Exception as e:
            print(f"Error pydub: {e}")
            return False
    
    def _monitor_pygame_playback(self, callback):
        """Monitor pygame playback"""
        while pygame.mixer.music.get_busy() and not self._stop_flag:
            pygame.time.Clock().tick(10)
        
        self.is_playing = False
        self.current_file = None
        
        if callback and not self._stop_flag:
            callback()
    
    def stop(self):
        """Stop pemutaran audio"""
        self._stop_flag = True
        
        if self.backend == 'pygame':
            pygame.mixer.music.stop()
        
        self.is_playing = False
        self.current_file = None
        print("Audio dihentikan")
    
    def pause(self):
        """Pause audio (pygame only)"""
        if self.backend == 'pygame' and self.is_playing:
            pygame.mixer.music.pause()
    
    def unpause(self):
        """Resume audio (pygame only)"""
        if self.backend == 'pygame' and self.is_playing:
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
        if self.backend == 'pygame':
            return self.is_playing and pygame.mixer.music.get_busy()
        return self.is_playing


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
