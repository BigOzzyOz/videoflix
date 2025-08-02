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
import { VideoTimePipe } from '../../shared/pipes/video-time.pipe';
import { OrientationWarningComponent } from '../../shared/components/orientation-warning/orientation-warning.component';
import { Profile } from '../../shared/models/profile';

@Component({
  selector: 'app-player',
  imports: [FormsModule, VideoTimePipe, OrientationWarningComponent],
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

  @ViewChild('vjs', { static: true }) vjsRef!: ElementRef<HTMLVideoElement>;

  readonly OVERLAY_HIDE_DELAY = 3000;
  readonly SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];

  video: Video | null = null;
  player: any;
  videoUrl: string = '';
  videoId: string = '';
  isOptimizing: boolean = false;
  isPlaying: boolean = false;
  progressTime: number = 0;
  videoDuration: number = 0;
  isMuted: boolean = false;
  volume: number = 0.5;
  isFullscreen: boolean = false;
  isScrubbing: boolean = false;
  showTooltip: boolean = false;
  tooltipTime: number = 0;
  tooltipPosition: number = 0;
  showOverlay: boolean = true;
  overlayTimeoutId: any = null;
  playbackSpeed: number = 1;
  showSpeedMenu: boolean = false;
  private viewInitialized = false;
  private lastSeekTime = 0;

  // Füge diese Properties hinzu:
  showVolumeControl: boolean = false;
  volumeTooltipPosition: number = 0;
  showVolumeTooltip: boolean = false;
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
    if (!this.video) {
      const videoData = await this.api.getVideoById(this.videoId);

      if (videoData.isSuccess()) {
        this.video = new Video(videoData.data);
        this.videoUrl = this.video.hls;
        sessionStorage.setItem('videoId', this.video.id);
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

    // Initial volume handle position setzen
    setTimeout(() => {
      this.updateVolumeHandlePosition();
    }, 100);

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

    this.player.ready(() => {
      console.log('Player ready, tech:', this.player.tech_.name_);

      // Event Handler nur einmal registrieren
      let lastSaveTime = 0;

      // EINMAL loadedmetadata Handler
      this.player.one('loadedmetadata', () => {
        console.log('Metadata loaded, duration:', this.player?.duration());
        this.videoDuration = this.player?.duration() || 0;
        this.timeJump(0, true);
      });

      // EINMAL timeupdate Handler
      this.player.on('timeupdate', async () => {
        if (!this.isScrubbing) {
          this.progressTime = this.player.currentTime();
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
          this.isPlaying = false;
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
        this.toggleFullscreen();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Volume Control nur schließen wenn außerhalb geklickt UND nicht gedraggt wird
    if (!target.closest('.vjs-sound-control') && !this.isDraggingVolume) {
      this.showVolumeControl = false;
    }

    if (!target.closest('.vjs-speed-control')) {
      this.showSpeedMenu = false;
    }
  }

  // Volume Control ein-/ausblenden (Netflix-Style)
  toggleVolumeControl(): void {
    // Beim ersten Klick: Mute/Unmute
    if (!this.showVolumeControl) {
      this.toggleSound();
    }

    // Volume Control anzeigen/verstecken
    this.showVolumeControl = !this.showVolumeControl;
    if (this.showVolumeControl) {
      this.clearVolumeHideTimeout();
    }
  }

  // Hide Delayed Methode erweitern
  hideVolumeControlDelayed(): void {
    if (!this.isDraggingVolume) {
      this.volumeHideTimeout = setTimeout(() => {
        this.showVolumeControl = false;
        this.showVolumeTooltip = false;
      }, 1500); // Längeres Delay für bessere UX
    }
  }

  clearVolumeHideTimeout(): void {
    if (this.volumeHideTimeout) {
      clearTimeout(this.volumeHideTimeout);
      this.volumeHideTimeout = null;
    }
  }

  // Netflix-Style Volume Click
  setVolumeFromClick(event: MouseEvent): void {
    // Nur wenn nicht auf Handle geklickt wurde
    if ((event.target as HTMLElement).classList.contains('volume-handle')) {
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));

    console.log('Click volume:', percentage);
    this.setVolume(percentage);
    this.showVolumeTooltip = true;

    setTimeout(() => {
      this.showVolumeTooltip = false;
    }, 1000);
  }

  startVolumeDrag(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDraggingVolume = true;
    this.showVolumeTooltip = true;
    this.showVolumeControl = true; // Force zeigen während Drag
    this.clearVolumeHideTimeout();

    const handle = event.target as HTMLElement;
    handle.classList.add('dragging');

    const track = handle.parentElement as HTMLElement;
    const rect = track.getBoundingClientRect();

    console.log('Drag started', { track: rect });

    const onMouseMove = (e: MouseEvent) => {
      // Auch außerhalb der Bounds erlauben
      const y = e.clientY - rect.top;
      const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));
      console.log('Dragging to:', percentage);
      this.setVolume(percentage);
    };

    const onMouseUp = () => {
      console.log('Drag ended');
      this.isDraggingVolume = false;
      handle.classList.remove('dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Volume Control sichtbar lassen nach Drag
      setTimeout(() => {
        this.showVolumeTooltip = false;
        // Volume Control bleibt offen für weitere Interaktion
      }, 1000);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // Touch Drag erweitern
  startVolumeTouchDrag(event: TouchEvent): void {
    event.preventDefault();
    this.isDraggingVolume = true;
    this.showVolumeTooltip = true;
    this.showVolumeControl = true; // Force zeigen während Drag
    this.clearVolumeHideTimeout();

    const touch = event.touches[0];
    const handle = event.target as HTMLElement;
    handle.classList.add('dragging');

    const track = handle.parentElement as HTMLElement;
    const rect = track.getBoundingClientRect();

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const y = touch.clientY - rect.top;
      const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));
      this.setVolume(percentage);
    };

    const onTouchEnd = () => {
      this.isDraggingVolume = false;
      handle.classList.remove('dragging');
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);

      setTimeout(() => {
        this.showVolumeTooltip = false;
        // Volume Control bleibt offen
      }, 1000);
    };

    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  }

  // Verbesserte setVolume Methode
  setVolume(volume: number): void {
    if (this.player) {
      this.volume = Math.max(0, Math.min(1, volume));
      this.player.volume(this.volume);

      // Beide - Progress und Handle - in einer Methode updaten
      this.updateVolumeHandlePosition();

      // Auto unmute/mute
      if (this.volume > 0 && this.player.muted()) {
        this.player.muted(false);
        this.isMuted = false;
      } else if (this.volume === 0 && !this.player.muted()) {
        this.player.muted(true);
        this.isMuted = true;
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

  toMain(): void {
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
    } else {
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration - 1));
      this.player.currentTime(newTime);
    }
  }

  togglePlay(): void {
    if (this.player) {
      if (this.player.paused()) {
        this.player.play().catch((err: any) => {
          console.error('Error playing video:', err);
        });
        this.resetOverlayTimer();
      } else {
        this.player.pause();
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
      if (this.player.muted() || this.volume === 0) {
        // Unmute und restore volume
        this.player.muted(false);
        this.isMuted = false;
        const targetVolume = this.volume > 0 ? this.volume : 0.5;
        this.setVolume(targetVolume);
      } else {
        // Mute
        this.player.muted(true);
        this.isMuted = true;
      }
    }
  }

  toggleFullscreen(): void {
    if (this.player) {
      if (this.player.isFullscreen()) {
        this.player.exitFullscreen();
        this.isFullscreen = false;
      } else {
        this.player.requestFullscreen();
        this.isFullscreen = true;
      }
    }
  }

  // Volume Tooltip Methoden
  updateVolumeTooltip(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const percentage = 1 - (y / rect.height); // Umgekehrt weil vertical

    this.volumeTooltipPosition = y;
    this.showVolumeTooltip = true;
  }

  hideVolumeTooltip(): void {
    this.showVolumeTooltip = false;
  }

  onVolumeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const volume = parseFloat(target.value);
    this.setVolume(volume);

    // CSS Variable für Progress-Anzeige updaten
    const volumeElement = target as HTMLElement;
    volumeElement.style.setProperty('--volume-progress', `${volume * 100}%`);
  }

  // Volume in Prozent für Tooltip
  get volumePercentage(): number {
    return Math.round(this.volume * 100);
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

  onSeekStart(): void {
    this.isScrubbing = true;
    if (this.player) {
      this.player.pause();
    }
  }

  onScrubbing(event: Event): void {
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);
    this.progressTime = time;
    this.tooltipTime = time;

    if (this.player) {
      this.player.currentTime(time);
    }
  }

  onSeekEnd(event: Event): void {
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);

    this.isScrubbing = false;

    if (this.player) {
      this.player.currentTime(time);
      this.player.play().catch((err: any) => {
        console.error('Error playing after seek:', err);
      });
    }
  }

  updateTooltip(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;

    this.tooltipTime = percentage * this.videoDuration;
    this.tooltipPosition = x;
    this.showTooltip = true;
  }

  hideTooltip(): void {
    this.showTooltip = false;
  }

  private resetOverlayTimer(): void {
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
    }

    if (this.isPlaying) {
      this.overlayTimeoutId = setTimeout(() => {
        this.showOverlay = false;
      }, this.OVERLAY_HIDE_DELAY);
    }
  }

  toggleSpeedMenu(): void {
    this.showSpeedMenu = !this.showSpeedMenu;
  }

  setPlaybackSpeed(speed: number): void {
    if (this.player) {
      this.player.playbackRate(speed);
      this.playbackSpeed = speed;
      this.showSpeedMenu = false;
    }
  }

  async updateProgress(profileId: string, videoFileId: string, lastSaveTime: number): Promise<number> {
    if (!this.player || !this.videoId) return lastSaveTime;

    const currentTime = this.player.currentTime();
    if (currentTime <= 0) return lastSaveTime;

    this.isPlaying = !this.player.paused();
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

  // Hilfsmethode hinzufügen
  private updateVolumeHandlePosition(): void {
    const trackHeight = 14; // rem
    const handleHeight = 1.6; // rem  
    const padding = 1; // rem
    const availableHeight = trackHeight - handleHeight; // 12.4rem
    const position = padding + (availableHeight * this.volume); // Handle Position
    const progressHeight = trackHeight * this.volume; // Progress Höhe

    // Volume Progress updaten
    const volumeProgress = document.querySelector('.volume-progress') as HTMLElement;
    if (volumeProgress) {
      volumeProgress.style.height = `${progressHeight}rem`;
      volumeProgress.style.bottom = `${padding}rem`;
      console.log('Volume progress height set to:', progressHeight);
    }

    // Volume Handle updaten
    const volumeHandle = document.querySelector('.volume-handle') as HTMLElement;
    if (volumeHandle) {
      volumeHandle.style.bottom = `${position}rem`;
      console.log('Volume handle position set to:', position);
    }
  }
}
