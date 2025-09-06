import { inject, Injectable } from '@angular/core';
import videojs from 'video.js';
import '@videojs/http-streaming';
import { PlayerStateService } from './player-state.service';
import { ErrorService } from './error.service';
import { OverlayService } from './overlay.service';
import { ApiService } from './api.service';
import { SeekService } from './seek.service';
import { ProgressService } from './progress.service';
import { LoadingService } from './loading.service';
import type VideoJsMediaError from 'video.js/dist/types/media-error';

/**
 * Service for managing the video.js player instance, playback control, event handling, and integration with state and UI services.
 */
@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  api = inject(ApiService);
  playerState = inject(PlayerStateService);
  errorService = inject(ErrorService);
  overlayService = inject(OverlayService);
  seekService = inject(SeekService);
  progressService = inject(ProgressService);
  loadingService = inject(LoadingService);

  /**
   * Constructs the PlayerService and injects all required dependencies.
   */
  constructor() { }

  /**
   * Toggles playback: plays if paused, pauses if playing. Updates state and overlay timer.
   */
  togglePlay(): void {
    const player = this.playerState.player;
    if (player) {
      if (player.paused()) {
        player.play().then(() => {
          this.playerState.setIsPlaying(true);
          this.overlayService.resetOverlayTimer(true);
        }).catch(() => this.errorService.show('Error playing video. Please try again.'));
      } else {
        player.pause();
        this.playerState.setIsPlaying(false);
      }
    } else this.errorService.show('Player not available.');
  }

  /**
   * Pauses the video player if available.
   */
  pause(): void {
    const player = this.playerState.player;
    if (player) player.pause();
  }

  /**
   * Initializes the video.js player on the given video element and binds all event handlers.
   * @param videoElement The HTML video element to initialize the player on.
   */
  initializePlayer(videoElement: HTMLVideoElement): void {
    if (!videoElement) return this.errorService.show('Video player could not be initialized');

    const player = this.playerCreateHandler(videoElement);
    this.playerState.player = player;

    player.ready(() => this.playerState.setViewInitialized(true));
    player.one('loadedmetadata', () => this.loadMetaHandler());
    player.on('timeupdate', async () => await this.timeUpdateHandler());
    player.on('canplay', () => this.loadingService.setLoading(false));
    player.on('pause', async () => await this.playerPauseHandler());
    player.on('ended', async () => await this.playerEndHandler());
    player.on('error', (error: any) => {
      const playerError = player.error();
      this.playerErrorHandler(playerError);
    });
  }

  /**
   * Creates and configures a new video.js player instance for the given video element.
   * @param videoElement The HTML video element to attach the player to.
   * @returns The created video.js player instance.
   */
  playerCreateHandler(videoElement: HTMLVideoElement): ReturnType<typeof videojs> {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    return videojs(videoElement, {
      autoplay: false,
      preload: 'metadata',
      controls: false,
      fluid: true,
      responsive: true,
      playsinline: true,
      sources: [
        {
          src: this.playerState.videoUrl(),
          type: 'application/x-mpegURL'
        }
      ],
      html5: {
        vhs: {
          overrideNative: !(isIOS || isSafari),
          enableLowInitialPlaylist: true,
          smoothQualityChange: true
        }
      },
      techOrder: ['html5']
    });
  }

  /**
   * Handles the 'loadedmetadata' event: sets video duration and seeks to start.
   */
  loadMetaHandler(): void {
    this.playerState.setVideoDuration(this.playerState.player.duration() || 0);
    this.seekService.jumpTime(0, true);
  }

  /**
   * Handles the 'timeupdate' event: updates progress time and saves progress to the API.
   */
  async timeUpdateHandler(): Promise<void> {
    const currentTime = this.playerState.player.currentTime();
    if (typeof currentTime === 'number') this.playerState.setProgressTime(currentTime);
    const lastSaveTime = await this.progressService.updateProgress(
      this.api.CurrentProfile.id || '',
      this.playerState.videoId() || '',
      this.playerState.lastSaveTime() || 0
    );
    this.playerState.setLastSaveTime(lastSaveTime);
  }

  /**
   * Handles the 'pause' event: sets end state and saves progress.
   */
  async playerPauseHandler(): Promise<void> {
    if (!this.playerState.videoId() || !this.playerState.player) return;
    const currentTime = this.playerState.player.currentTime();
    this.setEndState();
    if (!currentTime) return;
    const lastSaveTime = await this.progressService.updateProgress(
      this.api.CurrentProfile.id || '',
      this.playerState.videoId() || '',
      0
    );
    this.playerState.setLastSaveTime(lastSaveTime);
  }

  /**
   * Handles the 'ended' event: sets end state and saves progress.
   */
  async playerEndHandler(): Promise<void> {
    if (!this.playerState.videoId() && !this.playerState.player()) return;
    const currentTime = this.playerState.player.currentTime();
    this.setEndState();
    if (!currentTime) return;
    const lastSaveTime = await this.progressService.updateProgress(
      this.api.CurrentProfile.id || '',
      this.playerState.videoId() || '',
      0
    );
    this.setEndState(lastSaveTime);
  }

  /**
   * Sets the end state for the player, updates state and session storage, and resets player state if needed.
   * @param lastSaveTime The last saved time, if available.
   */
  setEndState(lastSaveTime?: number): void {
    if (!lastSaveTime) {
      this.playerState.setIsPlaying(false);
      this.overlayService.resetOverlayTimer(true);
      this.overlayService.clearOverlayTimer();
    } else {
      this.playerState.setLastSaveTime(lastSaveTime);
      sessionStorage.removeItem(this.progressService.key());
      this.playerState.resetState();
    }
  }

  /**
   * Handles player errors and displays user-friendly error messages.
   * @param error The Video.js media error object.
   */
  playerErrorHandler(error: VideoJsMediaError | null | undefined): void {
    if (error && typeof error.code === 'number') {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          this.errorService.show('Video loading was aborted');
          break;
        case error.MEDIA_ERR_NETWORK:
          this.errorService.show('Network error while loading video');
          break;
        case error.MEDIA_ERR_DECODE:
          this.errorService.show('Video could not be decoded');
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          this.errorService.show('Video format not supported');
          break;
        default: this.errorService.show('Unknown video error occurred');
      }
    } else this.errorService.show('An unexpected error occurred');
  }
}
