class AudioService {
  private ctx: AudioContext | null = null;
  private bgmVol = 0.4;
  private sfxVol = 0.7;
  private isMutedBgm = false;
  private isMutedSfx = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSFX(type: 
    | 'night_howl' 
    | 'morning_rooster' 
    | 'gavel_strike' 
    | 'victory_fanfare' 
    | 'click' 
    | 'alert' 
    | 'chat_pop' 
    | 'vote_cast' 
    | 'skill_cast' 
    | 'death_bell' 
    | 'card_flip'
  ) {
    if (this.isMutedSfx) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.value = this.sfxVol;
    gain.connect(this.ctx.destination);

    if (type === 'click') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
      gain.gain.setValueAtTime(this.sfxVol * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.04);
    } 
    else if (type === 'chat_pop') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
      gain.gain.setValueAtTime(this.sfxVol * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.06);
    }
    else if (type === 'vote_cast') {
      // Heavy stamp thud
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
      gain.gain.setValueAtTime(this.sfxVol * 1.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.15);
    }
    else if (type === 'skill_cast') {
      // Magic shimmer sweep
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const start = now + idx * 0.05;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(this.sfxVol * 0.4, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    }
    else if (type === 'death_bell') {
      // Metallic tolling bell
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc.type = 'sine';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc2.frequency.setValueAtTime(223, now); // Slight detune for resonance
      
      gain.gain.setValueAtTime(this.sfxVol * 1.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      
      osc.connect(gain);
      osc2.connect(gain);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 1.8);
      osc2.stop(now + 1.8);
    }
    else if (type === 'card_flip') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
      gain.gain.setValueAtTime(this.sfxVol * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.12);
    }
    else if (type === 'gavel_strike') {
      // Deep impact boom
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
      
      gain.gain.setValueAtTime(this.sfxVol * 1.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.4);
    } 
    else if (type === 'night_howl') {
      // Atmospheric wolf howl swoop
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(220, now + 1.4);
      
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.sfxVol * 0.9, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 1.5);
    } 
    else if (type === 'morning_rooster') {
      // Bright chime chord
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(this.sfxVol * 0.5, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
        osc.connect(gain);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.6);
      });
    } 
    else if (type === 'victory_fanfare') {
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        const start = now + idx * 0.12;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(this.sfxVol * 0.4, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } 
    else if (type === 'alert') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(450, now + 0.1);
      gain.gain.setValueAtTime(this.sfxVol * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  setVolumes(bgm: number, sfx: number) {
    this.bgmVol = bgm;
    this.sfxVol = sfx;
  }

  toggleMuteBgm() {
    this.isMutedBgm = !this.isMutedBgm;
    return this.isMutedBgm;
  }

  toggleMuteSfx() {
    this.isMutedSfx = !this.isMutedSfx;
    return this.isMutedSfx;
  }
}

export const sound = new AudioService();
