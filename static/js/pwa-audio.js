// PWA Audio Player - Client-side audio playback system
class PWAAudioPlayer {
    constructor() {
        this.audioContext = null;
        this.currentAudio = null;
        this.isPlaying = false;
        this.volume = 0.8;
        this.audioCache = new Map();
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Web Audio API
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Load volume from localStorage
            const savedVolume = localStorage.getItem('audio-volume');
            if (savedVolume) {
                this.volume = parseFloat(savedVolume);
            }
            
            // Preload common audio files
            await this.preloadAudioFiles();
            
            this.isInitialized = true;
            console.log('PWA Audio Player initialized');
            
        } catch (error) {
            console.error('Error initializing audio player:', error);
            // Fallback to HTML5 Audio
            this.initHTML5Audio();
        }
    }
    
    initHTML5Audio() {
        console.log('Using HTML5 Audio fallback');
        this.useHTML5Audio = true;
        this.isInitialized = true;
    }
    
    async preloadAudioFiles() {
        try {
            // Get list of audio files from localStorage or server
            const audioFiles = await this.getAudioFileList();
            
            for (const file of audioFiles) {
                try {
                    await this.cacheAudioFile(file.filename);
                } catch (error) {
                    console.warn(`Failed to preload ${file.filename}:`, error);
                }
            }
            
            console.log(`Preloaded ${this.audioCache.size} audio files`);
        } catch (error) {
            console.error('Error preloading audio files:', error);
        }
    }
    
    async getAudioFileList() {
        try {
            // Try to get from server first
            const response = await fetch('/api/audio');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('Server unavailable, using cached audio list');
        }
        
        // Fallback to localStorage
        const cached = localStorage.getItem('audio-files-list');
        return cached ? JSON.parse(cached) : [];
    }
    
    async cacheAudioFile(filename) {
        try {
            const response = await fetch(`/static/audio/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            this.audioCache.set(filename, arrayBuffer);
            
            return true;
        } catch (error) {
            console.error(`Error caching ${filename}:`, error);
            return false;
        }
    }
    
    async play(filename, options = {}) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        try {
            // Stop current playback
            if (this.isPlaying) {
                await this.stop();
            }
            
            // Resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            let audioBuffer;
            
            if (this.useHTML5Audio) {
                // HTML5 Audio fallback
                return this.playHTML5Audio(filename, options);
            } else {
                // Web Audio API
                audioBuffer = await this.getAudioBuffer(filename);
                return this.playWebAudio(audioBuffer, options);
            }
            
        } catch (error) {
            console.error('Error playing audio:', error);
            throw error;
        }
    }
    
    async getAudioBuffer(filename) {
        // Check cache first
        if (this.audioCache.has(filename)) {
            const arrayBuffer = this.audioCache.get(filename);
            return await this.audioContext.decodeAudioData(arrayBuffer);
        }
        
        // Try to load and cache
        const cached = await this.cacheAudioFile(filename);
        if (cached) {
            const arrayBuffer = this.audioCache.get(filename);
            return await this.audioContext.decodeAudioData(arrayBuffer);
        }
        
        // Fallback to direct fetch
        try {
            const response = await fetch(`/static/audio/${filename}`);
            const arrayBuffer = await response.arrayBuffer();
            return await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            throw new Error(`Failed to load audio file: ${filename}`);
        }
    }
    
    async playWebAudio(audioBuffer, options = {}) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set volume
        gainNode.gain.value = this.volume * (options.volume || 1);
        
        // Handle playback end
        source.onended = () => {
            this.isPlaying = false;
            this.currentAudio = null;
            
            if (options.onEnded) {
                options.onEnded();
            }
        };
        
        // Start playback
        source.start(0);
        this.isPlaying = true;
        this.currentAudio = { source, gainNode };
        
        // Store for stop control
        this.currentAudioBuffer = audioBuffer;
        
        return true;
    }
    
    async playHTML5Audio(filename, options = {}) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(`/static/audio/${filename}`);
            
            audio.volume = this.volume * (options.volume || 1);
            audio.preload = 'auto';
            
            audio.onended = () => {
                this.isPlaying = false;
                this.currentAudio = null;
                
                if (options.onEnded) {
                    options.onEnded();
                }
                
                resolve(true);
            };
            
            audio.onerror = (error) => {
                this.isPlaying = false;
                this.currentAudio = null;
                reject(error);
            };
            
            audio.play();
            this.isPlaying = true;
            this.currentAudio = audio;
        });
    }
    
    async stop() {
        if (!this.isPlaying || !this.currentAudio) {
            return;
        }
        
        try {
            if (this.useHTML5Audio) {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } else {
                this.currentAudio.source.stop();
                this.currentAudio.source.disconnect();
                this.currentAudio.gainNode.disconnect();
            }
            
            this.isPlaying = false;
            this.currentAudio = null;
            
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Save to localStorage
        localStorage.setItem('audio-volume', this.volume.toString());
        
        // Update current playback if active
        if (this.isPlaying && this.currentAudio) {
            if (this.useHTML5Audio) {
                this.currentAudio.volume = this.volume;
            } else {
                this.currentAudio.gainNode.gain.value = this.volume;
            }
        }
    }
    
    getVolume() {
        return this.volume;
    }
    
    isCurrentlyPlaying() {
        return this.isPlaying;
    }
    
    getCurrentFile() {
        return this.currentAudio ? this.currentAudio.filename : null;
    }
    
    async getAudioDuration(filename) {
        try {
            if (this.useHTML5Audio) {
                const audio = new Audio(`/static/audio/${filename}`);
                return new Promise((resolve) => {
                    audio.addEventListener('loadedmetadata', () => {
                        resolve(audio.duration);
                    });
                    audio.addEventListener('error', () => {
                        resolve(0);
                    });
                });
            } else {
                const audioBuffer = await this.getAudioBuffer(filename);
                return audioBuffer.duration;
            }
        } catch (error) {
            console.error('Error getting audio duration:', error);
            return 0;
        }
    }
    
    async previewAudio(filename, callback) {
        try {
            await this.play(filename, {
                onEnded: callback,
                volume: 0.5 // Preview at lower volume
            });
            return true;
        } catch (error) {
            console.error('Error previewing audio:', error);
            return false;
        }
    }
    
    // Cache management
    async clearCache() {
        this.audioCache.clear();
        console.log('Audio cache cleared');
    }
    
    getCacheSize() {
        let totalSize = 0;
        for (const [filename, buffer] of this.audioCache) {
            totalSize += buffer.byteLength;
        }
        return totalSize;
    }
    
    getCacheInfo() {
        return {
            files: this.audioCache.size,
            size: this.getCacheSize(),
            sizeFormatted: this.formatBytes(this.getCacheSize())
        };
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Audio analysis
    async analyzeAudio(filename) {
        try {
            const audioBuffer = await this.getAudioBuffer(filename);
            
            const channelData = audioBuffer.getChannelData(0);
            const sampleRate = audioBuffer.sampleRate;
            const duration = audioBuffer.duration;
            
            // Calculate RMS (volume)
            let sum = 0;
            for (let i = 0; i < channelData.length; i++) {
                sum += channelData[i] * channelData[i];
            }
            const rms = Math.sqrt(sum / channelData.length);
            
            // Find peaks
            let peak = 0;
            for (let i = 0; i < channelData.length; i++) {
                const abs = Math.abs(channelData[i]);
                if (abs > peak) peak = abs;
            }
            
            return {
                duration: duration,
                sampleRate: sampleRate,
                channels: audioBuffer.numberOfChannels,
                rms: rms,
                peak: peak,
                normalized: rms / peak
            };
            
        } catch (error) {
            console.error('Error analyzing audio:', error);
            return null;
        }
    }
    
    // Audio effects (for future enhancement)
    async applyFadeIn(duration = 1.0) {
        if (!this.isPlaying || !this.currentAudio || this.useHTML5Audio) {
            return;
        }
        
        const gainNode = this.currentAudio.gainNode;
        const currentTime = this.audioContext.currentTime;
        
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, currentTime + duration);
    }
    
    async applyFadeOut(duration = 1.0) {
        if (!this.isPlaying || !this.currentAudio || this.useHTML5Audio) {
            return;
        }
        
        const gainNode = this.currentAudio.gainNode;
        const currentTime = this.audioContext.currentTime;
        
        gainNode.gain.setValueAtTime(this.volume, currentTime);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
    }
    
    // Device compatibility check
    checkCompatibility() {
        const compatibility = {
            webAudioAPI: !!(window.AudioContext || window.webkitAudioContext),
            html5Audio: !!document.createElement('audio').canPlayType,
            notifications: 'Notification' in window,
            serviceWorker: 'serviceWorker' in navigator,
            indexedDB: 'indexedDB' in window,
            localStorage: 'localStorage' in window
        };
        
        console.log('Browser compatibility:', compatibility);
        return compatibility;
    }
    
    // Export/Import settings
    exportSettings() {
        return {
            volume: this.volume,
            cacheInfo: this.getCacheInfo(),
            compatibility: this.checkCompatibility()
        };
    }
    
    importSettings(settings) {
        if (settings.volume !== undefined) {
            this.setVolume(settings.volume);
        }
    }
}

// Initialize PWA Audio Player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pwaAudioPlayer = new PWAAudioPlayer();
});