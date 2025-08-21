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

  constructor() {
  }

  togglePlay(): void {
    const player = this.playerState.player;
    if (player) {
      if (player.paused()) {
        player.play().then(() => {
          this.playerState.setIsPlaying(true);
          this.overlayService.resetOverlayTimer(true);
        }).catch(() => {
          this.errorService.show('Error playing video. Please try again.');
          console.error('Error playing video:', player.error);
        });
      } else {
        player.pause();
        this.playerState.setIsPlaying(false);
      }
    } else {
      this.errorService.show('Player not available. Please check if the video is loaded.');
      console.error('Player not available');
    }
  }

  pause(): void {
    const player = this.playerState.player;
    player.pause();
  }

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

  playerCreateHandler(videoElement: HTMLVideoElement): any {
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


  loadMetaHandler(): void {
    this.playerState.setVideoDuration(this.playerState.player.duration() || 0);
    this.seekService.jumpTime(0, true);
  }

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

  async playerPauseHandler(): Promise<void> {
    if (!this.playerState.videoId() && !this.playerState.player()) return;
    const currentTime = this.playerState.player.currentTime();

    this.playerState.setIsPlaying(false);
    this.overlayService.resetOverlayTimer(true);
    this.overlayService.clearOverlayTimer();

    if (!currentTime) return;

    const lastSaveTime = await this.progressService.updateProgress(
      this.api.CurrentProfile.id || '',
      this.playerState.videoId() || '',
      0
    );
    this.playerState.setLastSaveTime(lastSaveTime);
  }

  async playerEndHandler(): Promise<void> {
    if (!this.playerState.videoId() && !this.playerState.player()) return;
    const currentTime = this.playerState.player.currentTime();

    this.playerState.setIsPlaying(false);
    this.overlayService.resetOverlayTimer(true);
    this.overlayService.clearOverlayTimer();

    if (!currentTime) return;

    const lastSaveTime = await this.progressService.updateProgress(
      this.api.CurrentProfile.id || '',
      this.playerState.videoId() || '',
      0
    );
    this.playerState.setLastSaveTime(lastSaveTime);
    sessionStorage.removeItem(this.progressService.key());
    this.playerState.resetState();
  }

  playerErrorHandler(error: any): void {
    if (error && error.code) {
      switch (error.code) {
        case 1: this.errorService.show('Video loading was aborted'); break;
        case 2: this.errorService.show('Network error while loading video'); break;
        case 3: this.errorService.show('Video could not be decoded'); break;
        case 4: this.errorService.show('Video format not supported'); break;
        default: this.errorService.show('Unknown video error occurred');
      }
    } else {
      this.errorService.show('An unexpected error occurred');
    }
  }

}
