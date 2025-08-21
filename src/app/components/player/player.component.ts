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
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { Video } from '../../shared/models/video';
import { OrientationWarningComponent } from '../../shared/components/orientation-warning/orientation-warning.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { CenterControlsComponent } from './center-controls/center-controls.component';
import { TopBarComponent } from "./top-bar/top-bar.component";
import { PlayerStateService } from '../../shared/services/player-state.service';
import { FullscreenService } from '../../shared/services/fullscreen.service';
import { SeekService } from '../../shared/services/seek.service';
import { PlayerService } from '../../shared/services/player.service';
import { VolumeService } from '../../shared/services/volume.service';
import { OverlayService } from '../../shared/services/overlay.service';
import { ProgressService } from '../../shared/services/progress.service';

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
  playerService = inject(PlayerService);
  fullScreenService = inject(FullscreenService);
  seekService = inject(SeekService);
  volumeService = inject(VolumeService);
  overlayService = inject(OverlayService);
  progressService = inject(ProgressService);

  @ViewChild('vjs', { static: true }) vjsRef!: ElementRef<HTMLVideoElement>;

  readonly OVERLAY_HIDE_DELAY = 3000;

  constructor() {
    this.activeRoute.queryParams.subscribe(params => {
      this.playerState.setVideoId(params['videoId'] || '');
    });
    if (sessionStorage.getItem(this.playerState.videoId())) {
      const video = new Video(JSON.parse(sessionStorage.getItem(this.playerState.videoId())!));
      this.playerState.setVideo(video);
      this.playerState.setVideoId(video.id);
      this.playerState.setVideoUrl(video.hls);
    }
  }

  async ngOnInit() {
    if (!sessionStorage.getItem(this.playerState.videoId()) || !this.playerState.videoUrl()) {
      const videoData = await this.api.getVideoById(this.playerState.videoId());

      if (videoData.isSuccess()) {
        this.playerState.setVideo(new Video(videoData.data));
        this.playerState.setVideoUrl(this.playerState.video()!.hls);
        sessionStorage.setItem('videoId', this.playerState.videoId());

        if (this.playerState.viewInitialized()) this.playerService.initializePlayer(this.vjsRef.nativeElement);
      }
      else this.errorService.show('Video not found or could not be loaded.');
    }
  }

  ngAfterViewInit(): void {
    this.playerState.setViewInitialized(true);

    if (this.playerState.videoUrl()) this.playerService.initializePlayer(this.vjsRef.nativeElement);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(): void {
    this.overlayService.resetOverlayTimer(this.playerState.isPlaying());
  }

  @HostListener('document:touchstart', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onTouch(): void {
    this.overlayService.resetOverlayTimer(this.playerState.isPlaying());
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.overlayService.resetOverlayTimer(this.playerState.isPlaying());

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.playerService.togglePlay();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.seekService.handleKeyboardSeek('left', 10);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.seekService.handleKeyboardSeek('right', 10);
        break;
      case 'KeyM':
        event.preventDefault();
        this.volumeService.toggleSound();
        break;
      case 'KeyF':
        event.preventDefault();
        this.fullScreenService.toggleFullscreen();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.vjs-sound-control')) {
      this.playerState.setShowVolumeControl(false);
    }

    if (!target.closest('.vjs-speed-control')) {
      this.playerState.setShowSpeedMenu(false);
    }
  }

  async ngOnDestroy(): Promise<void> {
    if (this.playerState.player) {
      await this.playerService.playerEndHandler();
      this.playerState.resetState();
      this.playerState.player.dispose();
    }
    this.overlayService.clearOverlayTimer();
  }

  get showOverlay(): boolean {
    return this.overlayService.showOverlay();
  }

  get isPlaying(): boolean {
    return this.playerState.isPlaying();
  }

}

