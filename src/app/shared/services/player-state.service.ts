import { Injectable, signal, computed } from '@angular/core';
import { Video } from '../models/video';

@Injectable({
  providedIn: 'root'
})
export class PlayerStateService {

  // === Core Player State ===
  private _player: any = null;
  private _video = signal<Video | null>(null);
  private _videoUrl = signal<string>('');
  private _videoId = signal<string>('');

  // === Playback State ===
  private _isPlaying = signal<boolean>(false);
  private _isOptimizing = signal<boolean>(false);
  private _progressTime = signal<number>(0);
  private _videoDuration = signal<number>(0);
  private _isScrubbing = signal<boolean>(false);
  private _playbackSpeed = signal<number>(1);

  // === Audio State ===
  private _volume = signal<number>(0.5);
  private _isMuted = signal<boolean>(false);

  // === UI State ===
  private _isFullscreen = signal<boolean>(false);
  private _showOverlay = signal<boolean>(true);
  private _showSpeedMenu = signal<boolean>(false);

  // === Volume Control State ===
  private _showVolumeControl = signal<boolean>(false);
  private _showVolumeTooltip = signal<boolean>(false);
  private _volumeTooltipPosition = signal<number>(0);

  // === Private State ===
  private _viewInitialized = signal<boolean>(false);
  private _lastSeekTime = signal<number>(0);

  // === Progress Bar Tooltip State ===
  private _showSeekTooltip = signal<boolean>(false);
  private _seekTooltipTime = signal<number>(0);
  private _seekTooltipPosition = signal<number>(0);
  private _bufferedTime = signal<number>(0);

  // === Speed Control State ===
  private _availableSpeeds = signal<number[]>([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);

  // === Player Reference ===
  get player() { return this._player; }
  set player(value: any) { this._player = value; }

  // === Public Readonly Signals ===
  readonly video = this._video.asReadonly();
  readonly videoUrl = this._videoUrl.asReadonly();
  readonly videoId = this._videoId.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly isOptimizing = this._isOptimizing.asReadonly();
  readonly progressTime = this._progressTime.asReadonly();
  readonly videoDuration = this._videoDuration.asReadonly();
  readonly isScrubbing = this._isScrubbing.asReadonly();
  readonly playbackSpeed = this._playbackSpeed.asReadonly();
  readonly volume = this._volume.asReadonly();
  readonly isMuted = this._isMuted.asReadonly();
  readonly isFullscreen = this._isFullscreen.asReadonly();
  readonly showOverlay = this._showOverlay.asReadonly();
  readonly showSpeedMenu = this._showSpeedMenu.asReadonly();
  readonly showVolumeControl = this._showVolumeControl.asReadonly();
  readonly showVolumeTooltip = this._showVolumeTooltip.asReadonly();
  readonly volumeTooltipPosition = this._volumeTooltipPosition.asReadonly();
  readonly viewInitialized = this._viewInitialized.asReadonly();
  readonly lastSeekTime = this._lastSeekTime.asReadonly();
  readonly showSeekTooltip = this._showSeekTooltip.asReadonly();
  readonly seekTooltipTime = this._seekTooltipTime.asReadonly();
  readonly seekTooltipPosition = this._seekTooltipPosition.asReadonly();
  readonly bufferedTime = this._bufferedTime.asReadonly();
  readonly availableSpeeds = this._availableSpeeds.asReadonly();

  // === Computed Values ===
  readonly volumePercentage = computed(() => Math.round(this.volume() * 100));
  readonly title = computed(() => this.video()?.title || '');
  readonly canPlay = computed(() => !!this.player && this.viewInitialized());
  readonly progress = computed(() => {
    const duration = this.videoDuration();
    return duration > 0 ? (this.progressTime() / duration) * 100 : 0;
  });
  readonly bufferedPercentage = computed(() => {
    const buffered = this.bufferedTime();
    const total = this.videoDuration();
    return total > 0 ? (buffered / total) * 100 : 0;
  });
  readonly seekTooltipTimeFormatted = computed(() => {
    return this.getFormattedTime(this.seekTooltipTime());
  });

  // === State Setters ===
  setVideo(video: Video | null): void {
    this._video.set(video);
    if (video) {
      this._videoUrl.set(video.hls);
      this._videoId.set(video.id);
    }
  }

  setVideoUrl(url: string): void {
    this._videoUrl.set(url);
  }

  setVideoId(id: string): void {
    this._videoId.set(id);
  }

  setIsPlaying(playing: boolean): void {
    this._isPlaying.set(playing);
  }

  setIsOptimizing(optimizing: boolean): void {
    this._isOptimizing.set(optimizing);
  }

  setProgressTime(time: number): void {
    this._progressTime.set(time);
  }

  setVideoDuration(duration: number): void {
    this._videoDuration.set(duration);
  }

  setIsScrubbing(scrubbing: boolean): void {
    this._isScrubbing.set(scrubbing);
  }

  setPlaybackSpeed(speed: number): void {
    const player = this.player;
    if (player) {
      player.playbackRate(speed);
      this._playbackSpeed.set(speed);
      console.log('Playback speed set to:', speed);
    }
  }

  setVolume(volume: number): void {
    this._volume.set(Math.max(0, Math.min(1, volume)));
  }

  setIsMuted(muted: boolean): void {
    this._isMuted.set(muted);
  }

  setIsFullscreen(fullscreen: boolean): void {
    this._isFullscreen.set(fullscreen);
  }

  setShowOverlay(show: boolean): void {
    this._showOverlay.set(show);
  }

  setShowSpeedMenu(show: boolean): void {
    this._showSpeedMenu.set(show);
  }

  setShowVolumeControl(show: boolean): void {
    this._showVolumeControl.set(show);
  }

  setShowVolumeTooltip(show: boolean): void {
    this._showVolumeTooltip.set(show);
  }

  setVolumeTooltipPosition(position: number): void {
    this._volumeTooltipPosition.set(position);
  }

  setViewInitialized(initialized: boolean): void {
    this._viewInitialized.set(initialized);
  }

  setLastSeekTime(time: number): void {
    this._lastSeekTime.set(time);
  }

  setShowSeekTooltip(show: boolean): void {
    this._showSeekTooltip.set(show);
  }

  setSeekTooltipTime(time: number): void {
    this._seekTooltipTime.set(time);
  }

  setSeekTooltipPosition(position: number): void {
    this._seekTooltipPosition.set(position);
  }

  setBufferedTime(buffered: number): void {
    this._bufferedTime.set(buffered);
  }

  setAvailableSpeeds(speeds: number[]): void {
    this._availableSpeeds.set(speeds);
  }

  // === Toggle Methods ===
  togglePlay(): void {
    this.setIsPlaying(!this.isPlaying());
  }

  toggleMute(): void {
    this.setIsMuted(!this.isMuted());
  }

  toggleFullscreen(): void {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  enterFullscreen(): void {
    const element = document.documentElement;

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }

    console.log('Entering fullscreen');
  }

  exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }

    console.log('Exiting fullscreen');
  }

  toggleSpeedMenu(): void {
    this.setShowSpeedMenu(!this.showSpeedMenu());
  }

  toggleVolumeControl(): void {
    this.setShowVolumeControl(!this.showVolumeControl());
  }

  toggleOverlay(): void {
    this.setShowOverlay(!this.showOverlay());
  }

  // === Reset Methods ===
  resetState(): void {
    this._isPlaying.set(false);
    this._progressTime.set(0);
    this._videoDuration.set(0);
    this._isScrubbing.set(false);
    this._playbackSpeed.set(1);
    this._volume.set(0.5);
    this._isMuted.set(false);
    this._isFullscreen.set(false);
    this._showOverlay.set(true);
    this._showSpeedMenu.set(false);
    this._showVolumeControl.set(false);
    this._showVolumeTooltip.set(false);
    this._volumeTooltipPosition.set(0);
    this._viewInitialized.set(false);
    this._lastSeekTime.set(0);
    this._showSeekTooltip.set(false);
    this._seekTooltipTime.set(0);
    this._seekTooltipPosition.set(0);
    this._bufferedTime.set(0);
    this._showSpeedMenu.set(false);
    this._playbackSpeed.set(1);
  }

  // === Utility Methods ===
  canSeek(): boolean {
    return this.canPlay() && this.videoDuration() > 0;
  }

  getCurrentTimePercentage(): number {
    const duration = this.videoDuration();
    return duration > 0 ? (this.progressTime() / duration) * 100 : 0;
  }

  getFormattedTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getCurrentTimeFormatted(): string {
    return this.getFormattedTime(this.progressTime());
  }

  getDurationFormatted(): string {
    return this.getFormattedTime(this.videoDuration());
  }

  // Speed-Formatierung für UI
  getSpeedLabel(speed: number): string {
    return speed === 1 ? 'Normal' : `${speed}x`;
  }

  // === Seeking Utility Methods ===
  seekBy(seconds: number): void {
    const player = this.player;
    console.log(!!this.player, this.viewInitialized());
    if (player && this.canSeek()) { // Verwende die oben definierte canSeek()
      const currentTime = this.progressTime();
      const duration = this.videoDuration();
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration - 1));

      player.currentTime(newTime);
      this.setProgressTime(newTime);

      console.log(`Seeked by ${seconds}s from ${currentTime} to ${newTime}`);
    }
  }

  seekTo(time: number): void {
    const player = this.player;
    if (player && this.canSeek()) { // Verwende die oben definierte canSeek()
      const clampedTime = Math.max(0, Math.min(time, this.videoDuration()));
      player.currentTime(clampedTime);
      this.setProgressTime(clampedTime);

      console.log(`Seeked to ${clampedTime}`);
    }
  }

  seekToPercentage(percentage: number): void {
    const time = percentage * this.videoDuration();
    this.seekTo(time);
  }

  // Keyboard Shortcuts Support
  handleKeyboardSeek(direction: 'left' | 'right', seconds: number = 10): void {
    const seekValue = direction === 'right' ? seconds : -seconds;
    this.seekBy(seekValue);
  }
}
