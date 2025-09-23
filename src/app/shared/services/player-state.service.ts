import { Injectable, signal, computed } from '@angular/core';
import { Video } from '../models/video';

/**
 * Service for managing all state related to the video player, including playback, audio, UI, and progress.
 */
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
  private _lastSaveTime = signal<number>(0);
  private _lastSeekTime = signal<number>(0);

  // === Progress Bar Tooltip State ===
  private _showSeekTooltip = signal<boolean>(false);
  private _seekTooltipTime = signal<number>(0);
  private _seekTooltipPosition = signal<number>(0);
  private _bufferedTime = signal<number>(0);

  // === Speed Control State ===
  private _availableSpeeds = signal<number[]>([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);

  // === Quality Control State ===
  private _availableQualities = signal<string[]>(['auto']); // z.B. ['auto', '1080p', '720p', '480p']
  private _currentQuality = signal<string>('auto');
  private _showQualityMenu = signal<boolean>(false);

  // === Player Reference ===
  /** Reference to the player instance. */
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
  readonly lastSaveTime = this._lastSaveTime.asReadonly();
  readonly lastSeekTime = this._lastSeekTime.asReadonly();
  readonly showSeekTooltip = this._showSeekTooltip.asReadonly();
  readonly seekTooltipTime = this._seekTooltipTime.asReadonly();
  readonly seekTooltipPosition = this._seekTooltipPosition.asReadonly();
  readonly bufferedTime = this._bufferedTime.asReadonly();
  readonly availableSpeeds = this._availableSpeeds.asReadonly();
  readonly availableQualities = this._availableQualities.asReadonly();
  readonly currentQuality = this._currentQuality.asReadonly();
  readonly showQualityMenu = this._showQualityMenu.asReadonly();

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
  /**
   * Sets the current video and updates related state.
   * @param video Video object or null
   */
  setVideo(video: Video | null): void {
    this._video.set(video);
    if (video) {
      this._videoUrl.set(video.hls);
      this._videoId.set(video.id);
    }
  }

  /** Sets the video URL. */
  setVideoUrl(url: string): void {
    this._videoUrl.set(url);
  }

  /** Sets the video ID. */
  setVideoId(id: string): void {
    this._videoId.set(id);
  }

  /** Sets the playing state. */
  setIsPlaying(playing: boolean): void {
    this._isPlaying.set(playing);
  }

  /** Sets the optimizing state. */
  setIsOptimizing(optimizing: boolean): void {
    this._isOptimizing.set(optimizing);
  }

  /** Sets the current progress time. */
  setProgressTime(time: number): void {
    this._progressTime.set(time);
  }

  /** Sets the video duration. */
  setVideoDuration(duration: number): void {
    this._videoDuration.set(duration);
  }

  /** Sets the scrubbing state. */
  setIsScrubbing(scrubbing: boolean): void {
    this._isScrubbing.set(scrubbing);
  }

  /** Sets the playback speed and updates the player instance. */
  setPlaybackSpeed(speed: number): void {
    const player = this.player;
    if (player) {
      player.playbackRate(speed);
      this._playbackSpeed.set(speed);
    }
  }

  /** Sets the fullscreen state. */
  setIsFullscreen(fullscreen: boolean): void {
    this._isFullscreen.set(fullscreen);
  }

  /** Sets the volume (clamped between 0 and 1). */
  setVolume(volume: number): void {
    this._volume.set(Math.max(0, Math.min(1, volume)));
  }

  /** Sets the muted state. */
  setIsMuted(muted: boolean): void {
    this._isMuted.set(muted);
  }

  /** Sets the overlay visibility. */
  setShowOverlay(show: boolean): void {
    this._showOverlay.set(show);
  }

  /** Sets the speed menu visibility. */
  setShowSpeedMenu(show: boolean): void {
    this._showSpeedMenu.set(show);
  }

  /** Sets the volume control visibility. */
  setShowVolumeControl(show: boolean): void {
    this._showVolumeControl.set(show);
  }

  /** Sets the volume tooltip visibility. */
  setShowVolumeTooltip(show: boolean): void {
    this._showVolumeTooltip.set(show);
  }

  /** Sets the volume tooltip position. */
  setVolumeTooltipPosition(position: number): void {
    this._volumeTooltipPosition.set(position);
  }

  /** Sets the view initialized state. */
  setViewInitialized(initialized: boolean): void {
    this._viewInitialized.set(initialized);
  }

  /** Sets the last save time. */
  setLastSaveTime(time: number): void {
    this._lastSaveTime.set(time);
  }

  /** Sets the last seek time. */
  setLastSeekTime(time: number): void {
    this._lastSeekTime.set(time);
  }

  /** Sets the seek tooltip visibility. */
  setShowSeekTooltip(show: boolean): void {
    this._showSeekTooltip.set(show);
  }

  /** Sets the seek tooltip time. */
  setSeekTooltipTime(time: number): void {
    this._seekTooltipTime.set(time);
  }

  /** Sets the seek tooltip position. */
  setSeekTooltipPosition(position: number): void {
    this._seekTooltipPosition.set(position);
  }

  /** Sets the buffered time. */
  setBufferedTime(buffered: number): void {
    this._bufferedTime.set(buffered);
  }

  /** Sets the available playback speeds. */
  setAvailableSpeeds(speeds: number[]): void {
    this._availableSpeeds.set(speeds);
  }

  /** Sets the available video qualities. */
  setAvailableQualities(qualities: string[]): void {
    this._availableQualities.set(qualities);
  }

  /** Sets the current video quality. */
  setCurrentQuality(quality: string): void {
    this._currentQuality.set(quality);
  }

  /** Sets the quality menu visibility. */
  setShowQualityMenu(show: boolean): void {
    this._showQualityMenu.set(show);
  }

  // === Toggle Methods ===
  /** Toggles the playing state. */
  togglePlay(): void {
    this.setIsPlaying(!this.isPlaying());
  }

  /** Toggles the muted state. */
  toggleMute(): void {
    this.setIsMuted(!this.isMuted());
  }

  /** Toggles the speed menu visibility.
   * If opening, closes quality and volume controls.
   */
  toggleSpeedMenu(): void {
    const isOpen = this.showSpeedMenu();
    this.setShowSpeedMenu(!isOpen);
    if (!isOpen) {
      this.setShowQualityMenu(false);
      this.setShowVolumeControl(false);
    }
  }

  /**
   * Toggles the volume control visibility.
   * If opening, closes speed and quality menus.
   */
  toggleVolumeControl(): void {
    const isOpen = this.showVolumeControl();
    this.setShowVolumeControl(!isOpen);
    if (!isOpen) {
      this.setShowSpeedMenu(false);
      this.setShowQualityMenu(false);
    }
  }

  /**
   * Toggles the quality menu visibility.
   * If opening, closes speed and volume controls.
   */
  toggleQualityMenu(): void {
    console.log('Toggling Quality Menu');
    const isOpen = this.showQualityMenu();
    this.setShowQualityMenu(!isOpen);
    if (!isOpen) {
      this.setShowSpeedMenu(false);
      this.setShowVolumeControl(false);
    }
  }

  /**
   * Toggles the overlay visibility.
   * If closing, also closes speed, volume, and quality menus.
   */
  toggleOverlay(): void {
    const isOpen = this.showOverlay();
    this.setShowOverlay(!isOpen);
    if (isOpen) {
      this.setShowSpeedMenu(false);
      this.setShowVolumeControl(false);
      this.setShowQualityMenu(false);
    }
  }

  // === Reset Methods ===
  /** Resets all player state to initial values. */
  resetState(): void {
    this.setVideo(null);
    this.setVideoUrl('');
    this._isFullscreen.set(false);
    this._isPlaying.set(false);
    this._progressTime.set(0);
    this._videoDuration.set(0);
    this._isScrubbing.set(false);
    this._playbackSpeed.set(1);
    this._volume.set(0.5);
    this._isMuted.set(false);
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
  /** Returns the current time as a percentage of the video duration. */
  getCurrentTimePercentage(): number {
    const duration = this.videoDuration();
    return duration > 0 ? (this.progressTime() / duration) * 100 : 0;
  }

  /** Formats a time value (seconds) as mm:ss. */
  getFormattedTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /** Returns the current time formatted as mm:ss. */
  getCurrentTimeFormatted(): string {
    return this.getFormattedTime(this.progressTime());
  }

  /** Returns the video duration formatted as mm:ss. */
  getDurationFormatted(): string {
    return this.getFormattedTime(this.videoDuration());
  }

}
