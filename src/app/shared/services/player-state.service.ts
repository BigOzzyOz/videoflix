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

  // === Computed Values ===
  readonly volumePercentage = computed(() => Math.round(this.volume() * 100));
  readonly title = computed(() => this.video()?.title || '');
  readonly canPlay = computed(() => !!this.player && this.viewInitialized());
  readonly progress = computed(() => {
    const duration = this.videoDuration();
    return duration > 0 ? (this.progressTime() / duration) * 100 : 0;
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
    this._playbackSpeed.set(speed);
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

  // === Toggle Methods ===
  togglePlay(): void {
    this.setIsPlaying(!this.isPlaying());
  }

  toggleMute(): void {
    this.setIsMuted(!this.isMuted());
  }

  toggleFullscreen(): void {
    this.setIsFullscreen(!this.isFullscreen());
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
}
