// Galaga - 8-bit audio engine using Web Audio API

/** Handles all game audio with authentic chiptune sounds */
class GalagaAudio {
    constructor() {
        /** @type {AudioContext|null} */
        this.ctx = null;
        /** @type {GainNode|null} */
        this.masterGain = null;
        /** @type {GainNode|null} */
        this.musicGain = null;
        /** @type {GainNode|null} */
        this.sfxGain = null;
        /** @type {boolean} */
        this.isPlaying = false;
        /** @type {boolean} */
        this.isMuted = false;
        /** @type {number|null} */
        this.musicInterval = null;
        /** @type {number} */
        this.noteIndex = 0;
        /** @type {number|null} */
        this.entryMusicInterval = null;
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initializes audio context on user interaction
     * Must be called after user gesture due to browser autoplay policies
     */
    init() {
        if (this.ctx) return;
        
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master volume control
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
        
        // Separate channels for music and sound effects
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.35;
        this.musicGain.connect(this.masterGain);
        
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.5;
        this.sfxGain.connect(this.masterGain);
    }

    // ========================================================================
    // SOUND GENERATION HELPERS
    // ========================================================================

    /**
     * Creates an oscillator with attack-decay envelope
     * @param {OscillatorType} type - Waveform type (sine, square, sawtooth, triangle)
     * @param {number} freq - Frequency in Hz
     * @param {number} gain - Initial gain (0-1)
     * @param {number} duration - Duration in seconds
     * @param {AudioNode} [dest] - Destination node (default: sfxGain)
     * @param {number} [attack=0.01] - Attack time in seconds
     * @returns {{osc: OscillatorNode, gainNode: GainNode}|undefined}
     */
    createOsc(type, freq, gain, duration, dest, attack = 0.01) {
        if (!this.ctx || this.isMuted) return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        
        osc.connect(gainNode);
        gainNode.connect(dest || this.sfxGain);
        
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(gain, now + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
        
        // Clean up nodes after sound finishes
        setTimeout(() => {
            osc.disconnect();
            gainNode.disconnect();
        }, (duration + 0.1) * 1000);
        
        return { osc, gainNode };
    }

    /**
     * Creates frequency sweep oscillator (for laser/dive sounds)
     * @param {OscillatorType} type - Waveform type
     * @param {number} startFreq - Starting frequency
     * @param {number} endFreq - Ending frequency
     * @param {number} gain - Gain value
     * @param {number} duration - Duration in seconds
     * @param {AudioNode} [dest] - Destination node
     */
    createSweep(type, startFreq, endFreq, gain, duration, dest) {
        if (!this.ctx || this.isMuted) return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = startFreq;
        
        osc.connect(gainNode);
        gainNode.connect(dest || this.sfxGain);
        
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(gain, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.8);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * Creates white noise for explosions
     * @param {number} duration - Duration in seconds
     * @param {AudioNode} [dest] - Destination node
     * @param {number} [filterFreq=1000] - Low-pass filter frequency
     */
    createNoise(duration, dest, filterFreq = 1000) {
        if (!this.ctx || this.isMuted) return;
        
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
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
        filter.frequency.value = filterFreq;
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(dest || this.sfxGain);
        
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        filter.frequency.exponentialRampToValueAtTime(100, now + duration);
        
        noise.start(now);
        noise.stop(now + duration);
    }

    // ========================================================================
    // PLAYER SOUND EFFECTS
    // ========================================================================

    /**
     * Player shooting sound - classic arcade laser
     */
    shoot() {
        // High-pitched laser sound
        this.createSweep('square', 1200, 200, 0.12, 0.08);
        this.createOsc('square', 880, 0.08, 0.05);
    }

    /**
     * Player bullet hitting enemy
     */
    hit() {
        this.createOsc('square', 200, 0.15, 0.05);
        this.createOsc('noise', 150, 0.1, 0.08);
    }

    /**
     * Player death sound - descending tones with explosion
     */
    playerDeath() {
        this.createNoise(0.5, null, 2000);
        
        // Descending doom tones
        const freqs = [300, 250, 200, 150, 100];
        freqs.forEach((f, i) => {
            setTimeout(() => {
                if (!this.isMuted) {
                    this.createOsc('square', f, 0.2, 0.15);
                    this.createOsc('sawtooth', f * 0.5, 0.1, 0.2);
                }
            }, i * 80);
        });
    }

    /**
     * Player respawn fanfare
     */
    respawn() {
        const notes = [262, 330, 392, 523]; // C-E-G-C ascending
        notes.forEach((f, i) => {
            setTimeout(() => {
                if (!this.isMuted) {
                    this.createOsc('square', f, 0.15, 0.12);
                    this.createOsc('triangle', f * 2, 0.08, 0.1);
                }
            }, i * 80);
        });
    }

    // ========================================================================
    // ENEMY SOUND EFFECTS
    // ========================================================================

    /**
     * Enemy explosion - varies based on enemy type
     * @param {string} [type='bee'] - Enemy type: bee, butterfly, boss
     */
    enemyExplosion(type = 'bee') {
        this.createNoise(0.25);
        
        switch (type) {
            case 'boss':
                // Boss explosion - bigger, more dramatic
                this.createOsc('sine', 80, 0.3, 0.3);
                this.createOsc('square', 60, 0.2, 0.4);
                this.createNoise(0.4, null, 1500);
                break;
            case 'butterfly':
                // Butterfly - medium explosion
                this.createOsc('sine', 100, 0.25, 0.2);
                this.createOsc('sawtooth', 80, 0.15, 0.25);
                break;
            default: // bee
                // Bee - small pop
                this.createOsc('sine', 120, 0.2, 0.15);
                this.createOsc('square', 100, 0.1, 0.1);
        }
    }

    /**
     * Enemy diving attack sound - descending whoosh
     */
    dive() {
        this.createSweep('sawtooth', 400, 150, 0.1, 0.3);
        this.createSweep('square', 300, 100, 0.05, 0.25);
    }

    /**
     * Enemy shooting sound
     */
    enemyShoot() {
        this.createSweep('square', 600, 200, 0.08, 0.1);
    }

    // ========================================================================
    // BOSS GALAGA SPECIAL SOUNDS
    // ========================================================================

    /**
     * Tractor beam activation - eerie warbling sound
     */
    tractorBeam() {
        if (!this.ctx || this.isMuted) return;
        
        const duration = 2.5;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        
        // LFO for warbling effect
        lfo.type = 'sine';
        lfo.frequency.value = 8;
        lfoGain.gain.value = 50;
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);
        
        osc1.type = 'sine';
        osc1.frequency.value = 180;
        osc2.type = 'triangle';
        osc2.frequency.value = 90;
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now + duration - 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        lfo.start(now);
        osc1.start(now);
        osc2.start(now);
        
        lfo.stop(now + duration);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    }

    /**
     * Ship capture sound - descending spiral
     */
    capture() {
        const notes = [800, 700, 600, 500, 400, 300, 200];
        notes.forEach((f, i) => {
            setTimeout(() => {
                if (!this.isMuted) {
                    this.createOsc('square', f, 0.15, 0.15);
                }
            }, i * 100);
        });
    }

    /**
     * Ship rescue success - triumphant ascending
     */
    rescue() {
        const notes = [262, 330, 392, 523, 659]; // C major arpeggio up
        notes.forEach((f, i) => {
            setTimeout(() => {
                if (!this.isMuted) {
                    this.createOsc('square', f, 0.18, 0.15);
                    this.createOsc('triangle', f * 2, 0.1, 0.12);
                }
            }, i * 100);
        });
    }

    // ========================================================================
    // GAME STATE SOUNDS
    // ========================================================================

    /**
     * Game start jingle - classic Galaga intro theme
     */
    gameStart() {
        // Simplified Galaga intro melody
        const melody = [
            { freq: 392, dur: 0.15, delay: 0 },      // G
            { freq: 440, dur: 0.15, delay: 150 },    // A
            { freq: 494, dur: 0.15, delay: 300 },    // B
            { freq: 523, dur: 0.3, delay: 450 },     // C
            { freq: 659, dur: 0.15, delay: 750 },    // E
            { freq: 523, dur: 0.15, delay: 900 },    // C
            { freq: 659, dur: 0.4, delay: 1050 }     // E (hold)
        ];
        
        melody.forEach(note => {
            setTimeout(() => {
                if (!this.isMuted) {
                    this.createOsc('square', note.freq, 0.18, note.dur);
                    this.createOsc('triangle', note.freq * 0.5, 0.1, note.dur);
                }
            }, note.delay);
        });
    }

    /**
     * Stage clear fanfare
     */
    stageClear() {
        const melody = [
            { freq: 523, dur: 0.15, delay: 0 },
            { freq: 659, dur: 0.15, delay: 150 },
            { freq: 784, dur: 0.15, delay: 300 },
            { freq: 1047, dur: 0.4, delay: 450 }
        ];
        
        melody.forEach(note => {
            setTimeout(() => {
                if (!this.isMuted) {
                    this.createOsc('square', note.freq, 0.15, note.dur);
                    this.createOsc('triangle', note.freq * 2, 0.08, note.dur * 0.8);
                }
            }, note.delay);
        });
    }

    /**
     * Challenging stage intro
     */
    challengingStage() {
        const melody = [
            { freq: 523, dur: 0.12, delay: 0 },
            { freq: 659, dur: 0.12, delay: 120 },
            { freq: 784, dur: 0.12, delay: 240 },
            { freq: 659, dur: 0.12, delay: 360 },
            { freq: 784, dur: 0.12, delay: 480 },
            { freq: 1047, dur: 0.3, delay: 600 }
        ];
        
        melody.forEach(note => {
            setTimeout(() => {
                if (!this.isMuted) {
                    this.createOsc('square', note.freq, 0.15, note.dur);
                }
            }, note.delay);
        });
    }

    /**
     * Game over theme - somber descending
     */
    gameOver() {
        const melody = [
            { freq: 392, dur: 0.25, delay: 0 },
            { freq: 349, dur: 0.25, delay: 300 },
            { freq: 330, dur: 0.25, delay: 600 },
            { freq: 294, dur: 0.5, delay: 900 }
        ];
        
        melody.forEach(note => {
            setTimeout(() => {
                if (!this.isMuted) {
                    this.createOsc('square', note.freq, 0.15, note.dur);
                    this.createOsc('sawtooth', note.freq * 0.5, 0.08, note.dur);
                }
            }, note.delay);
        });
    }

    /**
     * Extra life awarded
     */
    extraLife() {
        const arp = [523, 659, 784, 1047, 784, 659, 523];
        arp.forEach((f, i) => {
            setTimeout(() => {
                if (!this.isMuted) {
                    this.createOsc('square', f, 0.12, 0.08);
                }
            }, i * 50);
        });
    }

    // ========================================================================
    // BACKGROUND MUSIC
    // ========================================================================

    /**
     * Starts the main gameplay music loop
     * Simplified Galaga-inspired melody
     */
    startMusic() {
        if (!this.ctx || this.isPlaying) return;
        
        this.isPlaying = true;
        this.noteIndex = 0;
        
        // Galaga-style pentatonic melody
        const melody = [
            220, 262, 294, 330, 392, 330, 294, 262,
            196, 262, 330, 392, 330, 262, 196, 175
        ];
        
        const bass = [110, 110, 131, 131, 98, 98, 87, 87];
        
        const playNote = () => {
            if (!this.isPlaying || this.isMuted) return;
            
            const idx = this.noteIndex % melody.length;
            const bassIdx = Math.floor(this.noteIndex / 2) % bass.length;
            
            // Melody line
            this.createOsc('triangle', melody[idx], 0.12, 0.18, this.musicGain);
            
            // Bass (every 2 notes)
            if (this.noteIndex % 2 === 0) {
                this.createOsc('sine', bass[bassIdx], 0.15, 0.3, this.musicGain);
            }
            
            // Accent on beat 1 and 5
            if (this.noteIndex % 4 === 0) {
                setTimeout(() => {
                    if (this.isPlaying && !this.isMuted) {
                        this.createOsc('square', melody[idx] * 2, 0.06, 0.08, this.musicGain);
                    }
                }, 80);
            }
            
            this.noteIndex++;
        };
        
        // 140 BPM = ~214ms per 8th note
        this.musicInterval = setInterval(playNote, 214);
        playNote();
    }

    /**
     * Stops background music
     */
    stopMusic() {
        this.isPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    /**
     * Plays the enemy entry formation music
     * Used during wave entry phase
     */
    playEntryMusic() {
        if (!this.ctx || this.isMuted) return;
        
        // Quick marching pattern
        let beat = 0;
        const pattern = [196, 220, 196, 175, 196, 220, 262, 220];
        
        const playBeat = () => {
            if (this.isMuted) return;
            
            const note = pattern[beat % pattern.length];
            this.createOsc('square', note, 0.12, 0.1, this.musicGain);
            
            if (beat % 2 === 0) {
                this.createOsc('triangle', note * 0.5, 0.1, 0.15, this.musicGain);
            }
            
            beat++;
        };
        
        // Faster tempo for entry
        this.entryMusicInterval = setInterval(playBeat, 150);
        playBeat();
    }

    /**
     * Stops entry music
     */
    stopEntryMusic() {
        if (this.entryMusicInterval) {
            clearInterval(this.entryMusicInterval);
            this.entryMusicInterval = null;
        }
    }

    // ========================================================================
    // VOLUME CONTROLS
    // ========================================================================

    /**
     * Sets master volume
     * @param {number} val - Volume level (0-1)
     */
    setMasterVolume(val) {
        if (this.masterGain) this.masterGain.gain.value = val;
    }

    /**
     * Sets music volume
     * @param {number} val - Volume level (0-1)
     */
    setMusicVolume(val) {
        if (this.musicGain) this.musicGain.gain.value = val;
    }

    /**
     * Sets SFX volume
     * @param {number} val - Volume level (0-1)
     */
    setSfxVolume(val) {
        if (this.sfxGain) this.sfxGain.gain.value = val;
    }

    /**
     * Toggles mute state
     * @returns {boolean} New mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
        }
        return this.isMuted;
    }

    /**
     * Sets mute state
     * @param {boolean} muted - Whether to mute
     */
    setMuted(muted) {
        this.isMuted = muted;
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : 0.3;
        }
    }
}

// Export singleton instance
export const audio = new GalagaAudio();
