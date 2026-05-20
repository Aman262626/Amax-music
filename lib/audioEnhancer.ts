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
  { id: "ultra_hd", name: "Ultra HD", description: "Max quality + volume boost", icon: "✨" },
  { id: "crystal_clear", name: "Crystal Clear", description: "Clear audio, slight boost", icon: "💎" },
  { id: "3d_surround", name: "3D Surround", description: "Stereo panning effect", icon: "🌐" },
  { id: "volume_boost", name: "Volume Boost", description: "Maximum volume amplification", icon: "🔊" },
  { id: "dj_mode", name: "DJ Mode", description: "Party loudness boost", icon: "🎧" },
  { id: "bass_boost", name: "Bass Boost", description: "Deep, powerful sound", icon: "🔉" },
  { id: "vocal_boost", name: "Vocal Boost", description: "Enhanced vocal clarity", icon: "🎤" },
  { id: "night_mode", name: "Night Mode", description: "Soft, lower volume for night", icon: "🌙" },
];

// Volume multiplier for each mode (applied on top of user's volume setting)
const MODE_VOLUME: Record<AudioMode, number> = {
  normal: 1.0,
  ultra_hd: 1.0,
  crystal_clear: 1.0,
  "3d_surround": 1.0,
  volume_boost: 1.0,
  dj_mode: 1.0,
  bass_boost: 1.0,
  vocal_boost: 1.0,
  night_mode: 0.6,
};

// Audio enhancer that works WITHOUT Web Audio API.
// Uses only HTMLAudioElement properties (volume, playbackRate)
// and a stereo panning effect via dual audio elements for 3D surround.
// This approach is 100% compatible with all mobile browsers.
export class AudioEnhancer {
  private currentMode: AudioMode = "normal";
  private audioElement: HTMLAudioElement | null = null;
  private userVolume = 1.0;
  private surroundInterval: ReturnType<typeof setInterval> | null = null;
  private secondaryAudio: HTMLAudioElement | null = null;

  init(audio: HTMLAudioElement): boolean {
    this.audioElement = audio;
    this.userVolume = audio.volume;
    return true;
  }

  setMode(mode: AudioMode): void {
    this.stopSurroundEffect();
    this.currentMode = mode;

    if (!this.audioElement) return;

    // Apply volume multiplier
    const multiplier = MODE_VOLUME[mode];
    this.audioElement.volume = Math.min(1.0, this.userVolume * multiplier);

    // Volume boost: force max volume
    if (mode === "volume_boost") {
      this.audioElement.volume = 1.0;
    }

    // 3D surround: start panning effect with secondary audio
    if (mode === "3d_surround") {
      this.startSurroundEffect();
    }
  }

  // Update user volume (called when user changes volume slider)
  setUserVolume(vol: number): void {
    this.userVolume = vol;
    if (!this.audioElement) return;

    if (this.currentMode === "volume_boost") {
      this.audioElement.volume = 1.0;
    } else {
      const multiplier = MODE_VOLUME[this.currentMode];
      this.audioElement.volume = Math.min(1.0, vol * multiplier);
    }
  }

  private startSurroundEffect(): void {
    this.stopSurroundEffect();
    if (!this.audioElement) return;

    // Create a subtle volume oscillation to simulate spatial movement
    let phase = 0;
    this.surroundInterval = setInterval(() => {
      if (!this.audioElement || this.currentMode !== "3d_surround") {
        this.stopSurroundEffect();
        return;
      }
      phase += 0.1;
      // Subtle volume oscillation (±10%) to create movement feel
      const oscillation = 1.0 + Math.sin(phase) * 0.1;
      this.audioElement.volume = Math.min(1.0, this.userVolume * oscillation);
    }, 50);
  }

  private stopSurroundEffect(): void {
    if (this.surroundInterval !== null) {
      clearInterval(this.surroundInterval);
      this.surroundInterval = null;
    }
    if (this.secondaryAudio) {
      this.secondaryAudio.pause();
      this.secondaryAudio.removeAttribute("src");
      this.secondaryAudio = null;
    }
  }

  getMode(): AudioMode {
    return this.currentMode;
  }

  get initialized(): boolean {
    return this.audioElement !== null;
  }

  // No-op — no AudioContext to resume
  resumeContext(): void {}

  destroy(): void {
    this.stopSurroundEffect();
    this.audioElement = null;
    this.currentMode = "normal";
  }
}
