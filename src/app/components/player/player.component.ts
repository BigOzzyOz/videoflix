import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import videojs from 'video.js';
import '@videojs/http-streaming';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { Video } from '../../shared/models/video';
import { OrientationWarningComponent } from '../../shared/components/orientation-warning/orientation-warning.component';
import { Profile } from '../../shared/models/profile';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { CenterControlsComponent } from './center-controls/center-controls.component';
import { TopBarComponent } from "./top-bar/top-bar.component";
import { PlayerStateService } from '../../shared/services/player-state.service';

@Component({
  selector: 'app-player',
  imports: [FormsModule, OrientationWarningComponent, BottomBarComponent, CenterControlsComponent, TopBarComponent],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  providers: []
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  activeRoute = inject(ActivatedRoute);
  api = inject(ApiService);
  errorService = inject(ErrorService);
  playerState = inject(PlayerStateService);

  @ViewChild('vjs', { static: true }) vjsRef!: ElementRef<HTMLVideoElement>;

  readonly OVERLAY_HIDE_DELAY = 3000;

  video: Video | null = null;
  player: any;
  videoUrl: string = '';
  videoId: string = '';
  isOptimizing: boolean = false;
  isScrubbing: boolean = false;
  showOverlay: boolean = true;
  overlayTimeoutId: any = null;
  private viewInitialized = false;
  private lastSeekTime = 0;

  private volumeHideTimeout: any = null;
  private isDraggingVolume: boolean = false;

  constructor() {
    this.activeRoute.queryParams.subscribe(params => {
      this.videoId = params['videoId'] || '';
    });
    if (sessionStorage.getItem(this.videoId)) {
      this.video = new Video(JSON.parse(sessionStorage.getItem(this.videoId)!));
      this.videoUrl = this.video.hls;
      this.videoId = this.video.id;
    }
    console.log('PlayerComponent initialized with videoId:', this.videoId);
  }

  async ngOnInit() {
    console.log('PlayerState Service injected:', this.playerState);
    this.playerState.setVideoId(this.videoId);

    // TEST: Video auch im Service setzen
    if (this.video) {
      this.playerState.setVideo(this.video);
    }

    if (!this.video) {
      const videoData = await this.api.getVideoById(this.videoId);

      if (videoData.isSuccess()) {
        this.video = new Video(videoData.data);
        this.videoUrl = this.video.hls;
        sessionStorage.setItem('videoId', this.video.id);

        // TEST: Video auch im Service setzen
        this.playerState.setVideo(this.video);

        if (this.viewInitialized) this.initializePlayer();
      }
      else {
        this.errorService.show('Video not found or could not be loaded.');
      }
    }
    console.log('Video URL:', this.videoUrl);
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;

    if (this.videoUrl) this.initializePlayer();
  }

  private initializePlayer(): void {
    if (!this.vjsRef?.nativeElement) {
      console.error('Video element not found!');
      this.errorService.show('Video player could not be initialized');
      return;
    }

    console.log('Initializing player with element:', this.vjsRef.nativeElement);
    console.log('Video URL:', this.videoUrl);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    this.player = videojs(this.vjsRef.nativeElement, {
      autoplay: false,
      preload: 'metadata',
      controls: false,
      fluid: true,
      responsive: true,
      playsinline: true,
      sources: [
        {
          src: this.videoUrl,
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

    // WICHTIG: Player an Service weiterleiten
    this.playerState.player = this.player;

    this.player.ready(() => {
      console.log('Player ready, tech:', this.player.tech_.name_);
      console.log('Player available in service:', !!this.playerState.player);
      this.playerState.setViewInitialized(true);
    });

    // Event Handler nur einmal registrieren
    let lastSaveTime = 0;

    // EINMAL loadedmetadata Handler
    this.player.one('loadedmetadata', () => {
      console.log('Metadata loaded, duration:', this.player?.duration());
      this.playerState.setVideoDuration(this.player?.duration() || 0);
      this.timeJump(0, true);
    });

    // EINMAL timeupdate Handler
    this.player.on('timeupdate', async () => {
      if (!this.isScrubbing) {
        this.playerState.setProgressTime(this.player.currentTime());
      }

      // Progress Update nur alle 15 Sekunden
      lastSaveTime = await this.updateProgress(
        this.api.CurrentProfile.id || '',
        this.video?.id || '',
        lastSaveTime
      );
    });

    // Pause/End Handler
    this.player.on(['pause', 'ended'], async () => {
      if (this.videoId && this.player) {
        const currentTime = this.player.currentTime();
        if (currentTime) {
          lastSaveTime = await this.updateProgress(
            this.api.CurrentProfile.id || '',
            this.videoId,
            0 // Force save on pause/end
          );
        }
        this.playerState.setIsPlaying(false);
      }
    });

    // Video Ende - SessionStorage cleanen
    this.player.on('ended', () => {
      sessionStorage.removeItem(this.key());
    });

    // Error Handler
    this.player.on('error', (error: any) => {
      console.error('Player error:', error);
      const playerError = this.player.error();
      console.error('Player error details:', playerError);

      if (playerError) {
        switch (playerError.code) {
          case 1: // MEDIA_ERR_ABORTED
            this.errorService.show('Video loading was aborted');
            break;
          case 2: // MEDIA_ERR_NETWORK
            this.errorService.show('Network error while loading video');
            break;
          case 3: // MEDIA_ERR_DECODE
            this.errorService.show('Video could not be decoded');
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            this.errorService.show('Video format not supported');
            break;
          default:
            this.errorService.show('Unknown video error occurred');
        }
      }
    });
  }


  @HostListener('document:mousemove', ['$event'])
  onMouseMove(): void {
    this.showOverlay = true;
    this.resetOverlayTimer();
  }

  @HostListener('document:touchstart', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onTouch(): void {
    this.showOverlay = true;
    this.resetOverlayTimer();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.showOverlay = true;
    this.resetOverlayTimer();

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.timeJump(-10);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.timeJump(10);
        break;
      case 'KeyM':
        event.preventDefault();
        this.toggleSound();
        break;
      case 'KeyF':
        event.preventDefault();
        this.playerState.toggleFullscreen();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Volume Control schließen
    if (!target.closest('.vjs-sound-control')) {
      this.playerState.setShowVolumeControl(false);
    }

    // Speed Control schließen
    if (!target.closest('.vjs-speed-control')) {
      this.playerState.setShowSpeedMenu(false);
    }
  }

  // Volume Control ein-/ausblenden (Netflix-Style)
  toggleVolumeControl(): void {
    if (!this.playerState.showVolumeControl()) {
      this.toggleSound();
    }
    // ÄNDERN: PlayerStateService nutzen
    this.playerState.toggleVolumeControl();

    if (this.playerState.showVolumeControl()) {
      this.clearVolumeHideTimeout();
    }
  }

  // Hide Delayed Methode erweitern
  hideVolumeControlDelayed(): void {
    console.log('hideVolumeControlDelayed called');
    if (!this.isDraggingVolume) {
      this.volumeHideTimeout = setTimeout(() => {
        console.log('Hiding volume control after timeout');
        // ÄNDERN: PlayerStateService nutzen
        this.playerState.setShowVolumeControl(false);
        this.playerState.setShowVolumeTooltip(false);
      }, 1500);
    }
  }

  clearVolumeHideTimeout(): void {
    if (this.volumeHideTimeout) {
      clearTimeout(this.volumeHideTimeout);
      this.volumeHideTimeout = null;
    }
  }

  // Verbesserte setVolume Methode
  setVolume(volume: number): void {
    if (this.player) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.playerState.setVolume(clampedVolume);
      this.player.volume(clampedVolume);

      if (clampedVolume > 0 && this.player.muted()) {
        this.player.muted(false);
        this.playerState.setIsMuted(false);
      } else if (clampedVolume === 0 && !this.player.muted()) {
        this.player.muted(true);
        this.playerState.setIsMuted(true);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.player) {
      const currentTime = this.player.currentTime();
      if (this.videoId && currentTime && currentTime > 0) {
        sessionStorage.setItem(this.key(), currentTime.toString());
      }
      this.player.dispose();
    }
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
    }
    this.clearVolumeHideTimeout();
  }

  private key(): string {
    return `resume:${this.videoId}`;
  }

  goBack(): void {
    window.history.back();
  }

  timeJump(seconds: number, isInit: boolean = false): void {
    const now = Date.now();
    if (!isInit && now - this.lastSeekTime < 500) return;
    this.lastSeekTime = now;

    const resume = this.videoId ? this.getResumeTime() : 0;
    const duration = this.player?.duration();
    const currentTime = this.player?.currentTime();

    if (!this.viewInitialized || !this.player ||
      currentTime === undefined || !duration || duration <= 0) {
      this.errorService.show('Player is not ready for seeking');
      return;
    }

    if (resume > 0 && isInit) {
      const resumeTime = Math.min(resume, duration - 1);
      this.player.currentTime(resumeTime);

      // HINZUFÜGEN: PlayerStateService aktualisieren
      this.playerState.setProgressTime(resumeTime);
    } else {
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration - 1));
      this.player.currentTime(newTime);

      // HINZUFÜGEN: PlayerStateService aktualisieren
      this.playerState.setProgressTime(newTime);
    }
  }

  togglePlay(): void {
    if (this.player) {
      if (this.player.paused()) {
        this.player.play().catch((err: any) => {
          console.error('Error playing video:', err);
        });

        // ÄNDERN: PlayerStateService nutzen statt this.isPlaying = true
        this.playerState.setIsPlaying(true);

        this.resetOverlayTimer();
      } else {
        this.player.pause();

        // ÄNDERN: PlayerStateService nutzen statt this.isPlaying = false
        this.playerState.setIsPlaying(false);

        this.showOverlay = true;
        if (this.overlayTimeoutId) {
          clearTimeout(this.overlayTimeoutId);
        }
      }
    }
  }

  // Sound Icon Click Handler hinzufügen
  toggleSound(): void {
    if (this.player) {
      if (this.player.muted() || this.playerState.volume() === 0) {
        this.player.muted(false);
        this.playerState.setIsMuted(false);
        this.setVolume(this.playerState.volume() > 0 ? this.playerState.volume() : 0.5);
      } else {
        this.player.muted(true);
        this.playerState.setIsMuted(true);
      }
    }
  }

  // Volume in Prozent für Tooltip
  get volumePercentage(): number {
    return Math.round(this.playerState.volume() * 100);
  }

  seekTo(time: number): void {
    if (this.player && time >= 0 && time <= this.player.duration()) {
      this.player.currentTime(time);
      this.player.on('seeking', () => {
        this.player.pause();
      });
      this.player.one('seeked', () => {
        this.lastSeekTime = Date.now();
        console.log('Seeked to time:', time);
        this.player.play().catch((err: any) => {
          console.error('Error seeking to time:', err);
        });
      });
    } else {
      this.errorService.show('Invalid seek time');
    }
  }


  private resetOverlayTimer(): void {
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
    }

    if (this.playerState.isPlaying()) {
      this.overlayTimeoutId = setTimeout(() => {
        this.showOverlay = false;
      }, this.OVERLAY_HIDE_DELAY);
    }
  }

  async updateProgress(profileId: string, videoFileId: string, lastSaveTime: number): Promise<number> {
    if (!this.player || !this.videoId) return lastSaveTime;

    const currentTime = this.player.currentTime();
    if (currentTime <= 0) return lastSaveTime;

    this.playerState.setIsPlaying(!this.player.paused());
    const now = Date.now();

    // Force save wenn lastSaveTime = 0 (bei pause/end)
    const shouldSave = lastSaveTime === 0 || (now - lastSaveTime > 15000);

    if (currentTime && shouldSave) {
      sessionStorage.setItem(this.key(), currentTime.toString());
      const newLastSaveTime = now;

      try {
        const response = await this.api.updateVideoProgress(profileId, videoFileId, currentTime);

        if (response.isSuccess()) {
          this.api.CurrentProfile = new Profile(response.data);
          console.log('Progress updated successfully');
          return newLastSaveTime;
        } else {
          this.errorService.show('Failed to update video progress');
          return lastSaveTime;
        }
      } catch (error) {
        console.error('Error updating video progress:', error);
        this.errorService.show('An error occurred while updating video progress');
        return lastSaveTime;
      }
    }

    return lastSaveTime;
  }

  getResumeTime(): number {
    if (!this.videoId || !this.api.CurrentProfile) {
      return 0;
    }

    const data = this.api.CurrentProfile.videoProgress || [];
    const videoProgress = data.find(item => item.id === this.videoId);

    if (videoProgress && videoProgress.currentTime) {
      console.log('Resume time found:', videoProgress.currentTime);
      sessionStorage.setItem(this.key(), videoProgress.currentTime.toString());
      return videoProgress.currentTime;
    }

    const localResumeTime = Number(sessionStorage.getItem(this.key())) || 0;
    console.log('Local resume time:', localResumeTime);

    return localResumeTime;
  }

}
