export type AudioMode =
  | "normal"
  | "crystal_clear"
  | "3d_surround"
  | "volume_boost"
  | "dj_mode"
  | "bass_boost"
  | "vocal_boost"
  | "night_mode";

export interface AudioModeInfo {
  id: AudioMode;
  name: string;
  description: string;
  icon: string;
}

export const AUDIO_MODES: AudioModeInfo[] = [
  { id: "normal", name: "Normal", description: "Standard playback", icon: "🎵" },
  { id: "crystal_clear", name: "Crystal Clear", description: "HD voice, crystal clear audio", icon: "💎" },
  { id: "3d_surround", name: "3D Surround", description: "Immersive 3D spatial audio", icon: "🌐" },
  { id: "volume_boost", name: "Volume Boost", description: "500x maximum amplification", icon: "🔊" },
  { id: "dj_mode", name: "DJ Mode", description: "Enhanced bass & treble for party", icon: "🎧" },
  { id: "bass_boost", name: "Bass Boost", description: "Deep, powerful bass", icon: "🔉" },
  { id: "vocal_boost", name: "Vocal Boost", description: "Enhanced vocals & clarity", icon: "🎤" },
  { id: "night_mode", name: "Night Mode", description: "Soft, balanced for low volume", icon: "🌙" },
];

export class AudioEnhancer {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private presenceFilter: BiquadFilterNode | null = null;
  private subBassFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private convolver: ConvolverNode | null = null;
  private delayLeft: DelayNode | null = null;
  private delayRight: DelayNode | null = null;
  private surroundGain: GainNode | null = null;
  private boostGainNode: GainNode | null = null;
  private currentMode: AudioMode = "normal";
  private isInitialized = false;
  private audioElement: HTMLAudioElement | null = null;

  async init(audio: HTMLAudioElement): Promise<void> {
    if (this.isInitialized && this.audioElement === audio) return;

    try {
      this.audioContext = new AudioContext();
      this.audioElement = audio;

      // Resume AudioContext FIRST — on mobile, it starts suspended
      // and createMediaElementSource won't produce sound until it's running
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaElementSource(audio);

      this.subBassFilter = this.audioContext.createBiquadFilter();
      this.subBassFilter.type = "lowshelf";
      this.subBassFilter.frequency.value = 60;
      this.subBassFilter.gain.value = 0;

      this.bassFilter = this.audioContext.createBiquadFilter();
      this.bassFilter.type = "lowshelf";
      this.bassFilter.frequency.value = 200;
      this.bassFilter.gain.value = 0;

      this.midFilter = this.audioContext.createBiquadFilter();
      this.midFilter.type = "peaking";
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1;
      this.midFilter.gain.value = 0;

      this.presenceFilter = this.audioContext.createBiquadFilter();
      this.presenceFilter.type = "peaking";
      this.presenceFilter.frequency.value = 3500;
      this.presenceFilter.Q.value = 1;
      this.presenceFilter.gain.value = 0;

      this.trebleFilter = this.audioContext.createBiquadFilter();
      this.trebleFilter.type = "highshelf";
      this.trebleFilter.frequency.value = 8000;
      this.trebleFilter.gain.value = 0;

      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1;

      this.pannerNode = this.audioContext.createStereoPanner();
      this.pannerNode.pan.value = 0;

      this.delayLeft = this.audioContext.createDelay(0.05);
      this.delayLeft.delayTime.value = 0;

      this.delayRight = this.audioContext.createDelay(0.05);
      this.delayRight.delayTime.value = 0;

      this.surroundGain = this.audioContext.createGain();
      this.surroundGain.gain.value = 0;

      this.boostGainNode = this.audioContext.createGain();
      this.boostGainNode.gain.value = 1;

      // Start in bypass — connect source directly to output
      // applyMode will reconnect through the filter chain if needed
      this.sourceNode.connect(this.audioContext.destination);

      this.isInitialized = true;
      this.applyMode(this.currentMode);
    } catch {
      // Web Audio API not supported, fall back silently
      this.isInitialized = false;
    }
  }

  private resetFilters(): void {
    if (!this.isInitialized) return;

    this.subBassFilter!.gain.value = 0;
    this.bassFilter!.gain.value = 0;
    this.midFilter!.gain.value = 0;
    this.presenceFilter!.gain.value = 0;
    this.trebleFilter!.gain.value = 0;
    this.gainNode!.gain.value = 1;
    this.compressor!.threshold.value = -24;
    this.compressor!.knee.value = 30;
    this.compressor!.ratio.value = 4;
    this.compressor!.attack.value = 0.003;
    this.compressor!.release.value = 0.25;
    this.pannerNode!.pan.value = 0;
    this.boostGainNode!.gain.value = 1;
  }

  applyMode(mode: AudioMode): void {
    this.currentMode = mode;
    if (!this.isInitialized) return;

    this.resetFilters();

    switch (mode) {
      case "crystal_clear":
        // Enhance clarity: boost presence & treble, slight mid cut, gentle compression
        this.presenceFilter!.gain.value = 5;
        this.trebleFilter!.gain.value = 4;
        this.midFilter!.gain.value = -1;
        this.midFilter!.Q.value = 0.8;
        this.bassFilter!.gain.value = 1;
        this.compressor!.threshold.value = -20;
        this.compressor!.ratio.value = 3;
        this.compressor!.knee.value = 20;
        this.gainNode!.gain.value = 1.15;
        break;

      case "3d_surround":
        // 3D spatial effect: subtle stereo widening, enhanced depth
        this.bassFilter!.gain.value = 2;
        this.presenceFilter!.gain.value = 3;
        this.trebleFilter!.gain.value = 2;
        this.midFilter!.gain.value = -2;
        this.compressor!.threshold.value = -18;
        this.compressor!.ratio.value = 2.5;
        this.gainNode!.gain.value = 1.1;
        // Use subtle panning automation via the panner node
        this.startSurroundEffect();
        break;

      case "volume_boost":
        // 500x maximum loudness with multi-stage amplification
        this.subBassFilter!.gain.value = 10;
        this.bassFilter!.gain.value = 10;
        this.midFilter!.gain.value = 10;
        this.presenceFilter!.gain.value = 10;
        this.trebleFilter!.gain.value = 8;
        this.gainNode!.gain.value = 15;
        this.compressor!.threshold.value = -50;
        this.compressor!.ratio.value = 20;
        this.compressor!.knee.value = 0;
        this.compressor!.attack.value = 0;
        this.compressor!.release.value = 0.01;
        this.boostGainNode!.gain.value = 30;
        if (this.audioElement) this.audioElement.volume = 1.0;
        break;

      case "dj_mode":
        // Party sound: heavy bass, enhanced highs, punchy compression
        this.subBassFilter!.gain.value = 8;
        this.bassFilter!.gain.value = 6;
        this.midFilter!.gain.value = -2;
        this.presenceFilter!.gain.value = 4;
        this.trebleFilter!.gain.value = 5;
        this.compressor!.threshold.value = -25;
        this.compressor!.ratio.value = 6;
        this.compressor!.knee.value = 5;
        this.compressor!.attack.value = 0.001;
        this.compressor!.release.value = 0.05;
        this.gainNode!.gain.value = 1.3;
        break;

      case "bass_boost":
        // Deep bass enhancement
        this.subBassFilter!.gain.value = 10;
        this.bassFilter!.gain.value = 8;
        this.midFilter!.gain.value = -1;
        this.presenceFilter!.gain.value = 1;
        this.trebleFilter!.gain.value = 0;
        this.compressor!.threshold.value = -22;
        this.compressor!.ratio.value = 5;
        this.gainNode!.gain.value = 1.2;
        break;

      case "vocal_boost":
        // Enhanced vocals with clarity
        this.subBassFilter!.gain.value = -2;
        this.bassFilter!.gain.value = -1;
        this.midFilter!.gain.value = 5;
        this.midFilter!.frequency.value = 2500;
        this.midFilter!.Q.value = 1.5;
        this.presenceFilter!.gain.value = 6;
        this.presenceFilter!.frequency.value = 4000;
        this.trebleFilter!.gain.value = 3;
        this.compressor!.threshold.value = -18;
        this.compressor!.ratio.value = 3;
        this.gainNode!.gain.value = 1.15;
        break;

      case "night_mode":
        // Soft, balanced sound for low volumes
        this.subBassFilter!.gain.value = 3;
        this.bassFilter!.gain.value = 4;
        this.midFilter!.gain.value = 1;
        this.presenceFilter!.gain.value = 2;
        this.trebleFilter!.gain.value = -2;
        this.compressor!.threshold.value = -35;
        this.compressor!.ratio.value = 8;
        this.compressor!.knee.value = 40;
        this.compressor!.attack.value = 0.01;
        this.compressor!.release.value = 0.5;
        this.gainNode!.gain.value = 0.9;
        break;

      case "normal":
      default:
        break;
    }
  }

  private surroundAnimationId: number | null = null;

  private startSurroundEffect(): void {
    this.stopSurroundEffect();
    if (!this.audioContext || !this.pannerNode) return;

    let phase = 0;
    const animate = () => {
      phase += 0.02;
      if (this.pannerNode && this.currentMode === "3d_surround") {
        this.pannerNode.pan.value = Math.sin(phase) * 0.3;
      }
      this.surroundAnimationId = requestAnimationFrame(animate);
    };
    animate();
  }

  private stopSurroundEffect(): void {
    if (this.surroundAnimationId !== null) {
      cancelAnimationFrame(this.surroundAnimationId);
      this.surroundAnimationId = null;
    }
    if (this.pannerNode) {
      this.pannerNode.pan.value = 0;
    }
  }

  getMode(): AudioMode {
    return this.currentMode;
  }

  setMode(mode: AudioMode): void {
    if (mode !== "3d_surround") {
      this.stopSurroundEffect();
    }
    // Ensure AudioContext is running before routing audio
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }
    if (mode === "normal") {
      this.bypass();
    } else {
      this.unbypass();
      this.applyMode(mode);
    }
  }

  private bypass(): void {
    if (!this.isInitialized || !this.sourceNode || !this.audioContext) return;
    this.currentMode = "normal";
    this.sourceNode.disconnect();
    this.sourceNode.connect(this.audioContext.destination);
  }

  private unbypass(): void {
    if (!this.isInitialized || !this.sourceNode || !this.subBassFilter || !this.pannerNode || !this.audioContext) return;
    this.sourceNode.disconnect();
    this.sourceNode
      .connect(this.subBassFilter)
      .connect(this.bassFilter!)
      .connect(this.midFilter!)
      .connect(this.presenceFilter!)
      .connect(this.trebleFilter!)
      .connect(this.gainNode!)
      .connect(this.compressor!)
      .connect(this.boostGainNode!)
      .connect(this.pannerNode)
      .connect(this.audioContext.destination);
  }

  resumeContext(): void {
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }
  }

  destroy(): void {
    this.stopSurroundEffect();
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
    }
    this.isInitialized = false;
    this.audioElement = null;
  }
}
