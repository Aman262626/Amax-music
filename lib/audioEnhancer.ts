export type AudioMode =
  | "normal"
  | "ultra_hd"
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
  { id: "ultra_hd", name: "Ultra HD", description: "Studio-grade clarity, max quality", icon: "✨" },
  { id: "crystal_clear", name: "Crystal Clear", description: "HD voice, crystal clear audio", icon: "💎" },
  { id: "3d_surround", name: "3D Surround", description: "Immersive 3D spatial audio", icon: "🌐" },
  { id: "volume_boost", name: "Volume Boost", description: "500x maximum amplification", icon: "🔊" },
  { id: "dj_mode", name: "DJ Mode", description: "Enhanced bass & treble for party", icon: "🎧" },
  { id: "bass_boost", name: "Bass Boost", description: "Deep, powerful bass", icon: "🔉" },
  { id: "vocal_boost", name: "Vocal Boost", description: "Enhanced vocals & clarity", icon: "🎤" },
  { id: "night_mode", name: "Night Mode", description: "Soft, balanced for low volume", icon: "🌙" },
];

// Singleton audio enhancer — initialized ONCE, never destroyed.
// Uses Web Audio API to route audio through EQ filters + compressor.
// On mobile, AudioContext is kept alive via auto-resume on suspend
// and global touch/click listeners.
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
  private boostGainNode: GainNode | null = null;
  private currentMode: AudioMode = "normal";
  private isInitialized = false;
  private audioElement: HTMLAudioElement | null = null;
  private surroundAnimationId: number | null = null;

  // Initialize SYNCHRONOUSLY — must be called within a user gesture
  // (tap/click handler) so AudioContext is allowed to run on mobile.
  // Call this ONCE per audio element. Do NOT call repeatedly.
  init(audio: HTMLAudioElement): boolean {
    // Already initialized with same element — just resume
    if (this.isInitialized && this.audioElement === audio) {
      this.resumeContext();
      return true;
    }

    // Different element — must create new context
    if (this.isInitialized) {
      this.cleanup();
    }

    try {
      this.audioContext = new AudioContext();
      this.audioElement = audio;

      // Auto-resume when mobile browser suspends AudioContext
      this.audioContext.onstatechange = () => {
        if (this.audioContext?.state === "suspended") {
          this.audioContext.resume().catch(() => {});
        }
      };

      // Resume immediately (synchronous call — no await)
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      // Capture audio element into Web Audio graph
      this.sourceNode = this.audioContext.createMediaElementSource(audio);

      // Create EQ filter chain
      this.subBassFilter = this.createFilter("lowshelf", 60);
      this.bassFilter = this.createFilter("lowshelf", 200);
      this.midFilter = this.createFilter("peaking", 1000);
      this.presenceFilter = this.createFilter("peaking", 3500);
      this.trebleFilter = this.createFilter("highshelf", 8000);

      // Dynamics compressor
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Gain nodes
      this.gainNode = this.audioContext.createGain();
      this.boostGainNode = this.audioContext.createGain();
      this.pannerNode = this.audioContext.createStereoPanner();

      // Connect source → destination (bypass mode initially)
      this.sourceNode.connect(this.audioContext.destination);

      this.isInitialized = true;
      return true;
    } catch {
      this.isInitialized = false;
      return false;
    }
  }

  private createFilter(type: BiquadFilterType, freq: number): BiquadFilterNode {
    const filter = this.audioContext!.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.gain.value = 0;
    if (type === "peaking") filter.Q.value = 1;
    return filter;
  }

  // Switch audio mode — just changes filter values, no element recreation
  setMode(mode: AudioMode): void {
    if (mode !== "3d_surround") {
      this.stopSurroundEffect();
    }
    this.resumeContext();

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
    if (!this.isInitialized || !this.sourceNode || !this.subBassFilter ||
        !this.pannerNode || !this.audioContext) return;
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

  private resetFilters(): void {
    if (!this.isInitialized) return;
    this.subBassFilter!.gain.value = 0;
    this.subBassFilter!.frequency.value = 60;
    this.bassFilter!.gain.value = 0;
    this.bassFilter!.frequency.value = 200;
    this.midFilter!.gain.value = 0;
    this.midFilter!.frequency.value = 1000;
    this.midFilter!.Q.value = 1;
    this.presenceFilter!.gain.value = 0;
    this.presenceFilter!.frequency.value = 3500;
    this.presenceFilter!.Q.value = 1;
    this.trebleFilter!.gain.value = 0;
    this.trebleFilter!.frequency.value = 8000;
    this.gainNode!.gain.value = 1;
    this.compressor!.threshold.value = -24;
    this.compressor!.knee.value = 30;
    this.compressor!.ratio.value = 4;
    this.compressor!.attack.value = 0.003;
    this.compressor!.release.value = 0.25;
    this.pannerNode!.pan.value = 0;
    this.boostGainNode!.gain.value = 1;
  }

  private applyMode(mode: AudioMode): void {
    this.currentMode = mode;
    if (!this.isInitialized) return;
    this.resetFilters();

    switch (mode) {
      case "ultra_hd":
        this.subBassFilter!.gain.value = -2;
        this.subBassFilter!.frequency.value = 40;
        this.bassFilter!.gain.value = 2;
        this.bassFilter!.frequency.value = 150;
        this.midFilter!.gain.value = 1.5;
        this.midFilter!.frequency.value = 1200;
        this.midFilter!.Q.value = 0.7;
        this.presenceFilter!.gain.value = 5;
        this.presenceFilter!.frequency.value = 4000;
        this.presenceFilter!.Q.value = 0.8;
        this.trebleFilter!.gain.value = 4;
        this.trebleFilter!.frequency.value = 10000;
        this.compressor!.threshold.value = -16;
        this.compressor!.ratio.value = 2.5;
        this.compressor!.knee.value = 15;
        this.compressor!.attack.value = 0.005;
        this.compressor!.release.value = 0.15;
        this.gainNode!.gain.value = 1.25;
        break;

      case "crystal_clear":
        this.presenceFilter!.gain.value = 6;
        this.presenceFilter!.frequency.value = 3500;
        this.trebleFilter!.gain.value = 5;
        this.trebleFilter!.frequency.value = 9000;
        this.midFilter!.gain.value = -1;
        this.midFilter!.Q.value = 0.8;
        this.bassFilter!.gain.value = 1.5;
        this.subBassFilter!.gain.value = -1;
        this.compressor!.threshold.value = -18;
        this.compressor!.ratio.value = 3;
        this.compressor!.knee.value = 15;
        this.compressor!.attack.value = 0.003;
        this.compressor!.release.value = 0.2;
        this.gainNode!.gain.value = 1.2;
        break;

      case "3d_surround":
        this.bassFilter!.gain.value = 2;
        this.presenceFilter!.gain.value = 3;
        this.trebleFilter!.gain.value = 2;
        this.midFilter!.gain.value = -2;
        this.compressor!.threshold.value = -18;
        this.compressor!.ratio.value = 2.5;
        this.gainNode!.gain.value = 1.1;
        this.startSurroundEffect();
        break;

      case "volume_boost":
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

  get initialized(): boolean {
    return this.isInitialized;
  }

  resumeContext(): void {
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }
  }

  private cleanup(): void {
    this.stopSurroundEffect();
    try { this.sourceNode?.disconnect(); } catch { /* already disconnected */ }
    this.sourceNode = null;
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
    }
    this.audioContext = null;
    this.gainNode = null;
    this.bassFilter = null;
    this.midFilter = null;
    this.trebleFilter = null;
    this.presenceFilter = null;
    this.subBassFilter = null;
    this.compressor = null;
    this.pannerNode = null;
    this.boostGainNode = null;
    this.isInitialized = false;
    this.audioElement = null;
  }

  destroy(): void {
    this.cleanup();
  }
}
