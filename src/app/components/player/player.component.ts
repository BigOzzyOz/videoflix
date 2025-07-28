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

@Component({
  selector: 'app-player',
  imports: [FormsModule, VideoTimePipe],
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
  video: Video | null = null;
  player: any;
  videoUrl: string = '';
  videoId: string = '';
  isOptimizing: boolean = false;
  isPortrait: boolean = false;

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

  // Neue Properties für Overlay-Verhalten
  showOverlay: boolean = true;
  overlayTimeoutId: any = null;
  readonly OVERLAY_HIDE_DELAY = 3000; // 3 Sekunden

  // Neue Properties für Speed-Kontrolle
  playbackSpeed: number = 1;
  readonly SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];
  showSpeedMenu: boolean = false;

  private viewInitialized = false;
  private lastSeekTime = 0;

  constructor() {
    this.checkOrientation(); // Initial check
    this.activeRoute.queryParams.subscribe(params => {
      this.videoId = params['videoId'] || '';
    });
    console.log('PlayerComponent initialized with videoId:', this.videoId);
  }

  // Lausche auf Orientierungsänderungen
  @HostListener('window:orientationchange', ['$event'])
  @HostListener('window:resize', ['$event'])
  onOrientationChange(event: Event): void {
    // Kurze Verzögerung damit Browser Zeit hat die Orientierung zu ändern
    setTimeout(() => {
      this.checkOrientation();

      // Player bei Orientierungsänderung neu initialisieren falls nötig
      if (this.player && this.videoUrl) {
        this.reinitializePlayerOnOrientationChange();
      }
    }, 100);
  }

  private checkOrientation(): void {
    this.isPortrait = window.innerHeight > window.innerWidth;
    console.log('Orientation check:', this.isPortrait ? 'Portrait' : 'Landscape');
  }

  private reinitializePlayerOnOrientationChange(): void {
    if (!this.player) return;

    // Aktuelle Zeit und Zustand speichern
    const currentTime = this.player.currentTime();
    const isPaused = this.player.paused();

    // Player kurz neu aufsetzen
    setTimeout(() => {
      if (this.player && currentTime) {
        this.player.currentTime(currentTime);
        if (!isPaused) {
          this.player.play().catch((err: any) => {
            console.error('Error resuming after orientation change:', err);
          });
        }
      }
    }, 200);
  }

  async ngOnInit() {
    const videoData = await this.api.getVideoById(this.videoId);

    if (videoData.isSuccess()) {
      this.video = new Video(videoData.data);
      this.videoUrl = this.video.hls;

      if (this.viewInitialized) this.initializePlayer();
    }
    else {
      this.errorService.show('Video not found or could not be loaded.');
    }
    console.log('Video URL:', this.videoUrl);
  }

  ngAfterViewInit(): void {

    this.viewInitialized = true;

    if (this.videoUrl) this.initializePlayer();
  }

  private initializePlayer(): void {
    // Element-Validierung
    if (!this.vjsRef?.nativeElement) {
      console.error('Video element not found!');
      this.errorService.show('Video player could not be initialized');
      return;
    }

    console.log('Initializing player with element:', this.vjsRef.nativeElement);
    console.log('Video URL:', this.videoUrl);

    // iOS/Safari Detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    this.player = videojs(this.vjsRef.nativeElement, {
      autoplay: false,
      preload: 'metadata',
      controls: false, // Eigene Controls verwenden
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
          overrideNative: !(isIOS || isSafari), // Native HLS für iOS/Safari
          enableLowInitialPlaylist: true,
          smoothQualityChange: true
        }
      },
      techOrder: ['html5']
    });

    this.player.ready(() => {
      console.log('Player ready, tech:', this.player.tech_.name_);

      this.player.one('loadedmetadata', () => {
        console.log('Metadata loaded, duration:', this.player?.duration());
        this.videoDuration = this.player?.duration() || 0;
        this.timeJump(0, true);
      });

      // Erweiterte Error-Behandlung
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

    /* === Fortschritt speichern === */
    let lastSaveTime = 0;
    this.player.on('timeupdate', () => {

      if (!this.videoId || !this.player) return;
      this.isPlaying = !this.player.paused();
      const currentTime = this.player.currentTime();
      const now = Date.now();

      this.progressTime = currentTime;


      if (currentTime && now - lastSaveTime > 2000) {
        localStorage.setItem(this.key(), currentTime.toString());
        lastSaveTime = now;
      }
    });

    this.player.on(['pause', 'ended'], () => {
      if (this.videoId && this.player) {
        const currentTime = this.player.currentTime();
        if (currentTime) {
          localStorage.setItem(this.key(), currentTime.toString());
        }
        this.isPlaying = false;
      }
    });

    // Progress löschen wenn Video zu Ende
    this.player.on('ended', () => {
      localStorage.removeItem(this.key());
    });

    this.player.on('loadedmetadata', () => {
      this.videoDuration = this.player.duration();
    });

    this.player.on('timeupdate', () => {
      if (!this.isScrubbing) { // Nur updaten wenn nicht gerade gezogen wird
        this.progressTime = this.player.currentTime();
      }
    });
  }

  // Mouse and Touch Events für Overlay-Steuerung
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

    // Tastatur-Shortcuts
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

  ngOnDestroy(): void {
    if (this.player) {
      const currentTime = this.player.currentTime();
      if (this.videoId && currentTime && currentTime > 0) {
        localStorage.setItem(this.key(), currentTime.toString());
      }
      this.player.dispose();
    }
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
    }
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

    const resume = this.videoId ? Number(localStorage.getItem(this.key())) : 0;
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
        this.resetOverlayTimer(); // Timer starten wenn Video startet
      } else {
        this.player.pause();
        this.showOverlay = true; // Overlay anzeigen wenn pausiert
        if (this.overlayTimeoutId) {
          clearTimeout(this.overlayTimeoutId);
        }
      }
    }
  }

  toggleSound(): void {
    if (this.player) {
      this.player.muted(!this.player.muted());
    }
  }

  toggleFullscreen(): void {
    if (this.player) {
      if (this.player.isFullscreen()) {
        this.player.exitFullscreen();
      } else {
        this.player.requestFullscreen();
      }
    }
  }

  setVolume(volume: number): void {
    if (this.player) {
      this.player.volume(volume);
    }
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

  // Range Input Methods:
  onSeekStart(): void {
    this.isScrubbing = true;
    if (this.player) {
      this.player.pause(); // Video pausieren während scrubbing
    }
  }

  onScrubbing(event: Event): void {
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);
    this.progressTime = time;
    this.tooltipTime = time; // Tooltip beim Scrubbing updaten

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
    // Bestehenden Timer löschen
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
    }

    // Neuen Timer nur setzen wenn Video spielt
    if (this.isPlaying) {
      this.overlayTimeoutId = setTimeout(() => {
        this.showOverlay = false;
      }, this.OVERLAY_HIDE_DELAY);
    }
  }

  // Speed-Kontrolle Methoden
  toggleSpeedMenu(): void {
    this.showSpeedMenu = !this.showSpeedMenu;
  }

  setPlaybackSpeed(speed: number): void {
    if (this.player) {
      this.player.playbackRate(speed);
      this.playbackSpeed = speed;
      // Menu nach Auswahl schließen (optional)
      // this.showSpeedMenu = false;
    }
  }
}
