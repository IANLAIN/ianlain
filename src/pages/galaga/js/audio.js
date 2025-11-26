/**
 * Galaga Audio System
 * Web Audio API based sound effects and music
 */

class GalagaAudio {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isPlaying = false;
        this.musicInterval = null;
        this.noteIndex = 0;
    }

    /**
     * Initialize audio context on user interaction
     */
    init() {
        if (this.ctx) return;
        
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master volume
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
        
        // Separate channels for music and SFX
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.4;
        this.musicGain.connect(this.masterGain);
        
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.6;
        this.sfxGain.connect(this.masterGain);
    }

    /**
     * Create an oscillator with envelope
     * @param {string} type - Oscillator type
     * @param {number} freq - Frequency in Hz
     * @param {number} gain - Gain value
     * @param {number} duration - Duration in seconds
     * @param {AudioNode} dest - Destination node
     */
    createOsc(type, freq, gain, duration, dest) {
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        gainNode.gain.value = gain;
        
        osc.connect(gainNode);
        gainNode.connect(dest || this.sfxGain);
        
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(gain, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
        
        return { osc, gainNode };
    }

    /**
     * Create white noise for explosions
     * @param {number} duration - Duration in seconds
     * @param {AudioNode} dest - Destination node
     */
    createNoise(duration, dest) {
        if (!this.ctx) return;
        
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(dest || this.sfxGain);
        
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        filter.frequency.exponentialRampToValueAtTime(100, now + duration);
        
        noise.start(now);
        noise.stop(now + duration);
    }

    // === SOUND EFFECTS ===
    
    shoot() {
        this.createOsc('square', 880, 0.15, 0.08);
        this.createOsc('sawtooth', 440, 0.1, 0.06);
    }

    explosion() {
        this.createNoise(0.3);
        this.createOsc('sine', 80, 0.3, 0.2);
        this.createOsc('sine', 60, 0.2, 0.3);
    }

    playerHit() {
        this.createNoise(0.5);
        this.createOsc('sine', 120, 0.4, 0.3);
        this.createOsc('sawtooth', 80, 0.2, 0.4);
    }

    gameOver() {
        const freqs = [400, 300, 200, 100];
        freqs.forEach((f, i) => {
            setTimeout(() => this.createOsc('square', f, 0.2, 0.3), i * 200);
        });
    }

    // === BACKGROUND MUSIC ===
    
    startMusic() {
        if (!this.ctx || this.isPlaying) return;
        
        this.isPlaying = true;
        this.noteIndex = 0;
        
        // Pentatonic scale - space feel
        const melody = [
            196, 220, 262, 294, 330, 294, 262, 220,
            196, 262, 330, 392, 330, 262, 196, 165
        ];
        
        const bass = [98, 98, 131, 131, 98, 98, 82, 82];
        
        const playNote = () => {
            if (!this.isPlaying) return;
            
            const idx = this.noteIndex % melody.length;
            const bassIdx = this.noteIndex % bass.length;
            
            // Melody
            this.createOsc('triangle', melody[idx], 0.15, 0.2, this.musicGain);
            
            // Bass (every 2 beats)
            if (this.noteIndex % 2 === 0) {
                this.createOsc('sine', bass[bassIdx], 0.2, 0.35, this.musicGain);
            }
            
            // Arpeggio accent (every 4 beats)
            if (this.noteIndex % 4 === 0) {
                setTimeout(() => {
                    if (this.isPlaying) {
                        this.createOsc('square', melody[idx] * 2, 0.08, 0.1, this.musicGain);
                    }
                }, 100);
            }
            
            this.noteIndex++;
        };
        
        // 140 BPM = ~214ms per 8th note
        this.musicInterval = setInterval(playNote, 214);
        playNote();
    }

    stopMusic() {
        this.isPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    // === VOLUME CONTROLS ===
    
    setMasterVolume(val) {
        if (this.masterGain) this.masterGain.gain.value = val;
    }

    setMusicVolume(val) {
        if (this.musicGain) this.musicGain.gain.value = val;
    }

    setSfxVolume(val) {
        if (this.sfxGain) this.sfxGain.gain.value = val;
    }
}

// Export singleton instance
export const audio = new GalagaAudio();
