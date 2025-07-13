import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import videojs from 'video.js';
import VideoJsPlayer from 'video.js/dist/types/player';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { Video } from '../../shared/models/video';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  activeRoute = inject(ActivatedRoute);
  api = inject(ApiService);
  errorService = inject(ErrorService);

  @ViewChild('vjs', { static: true }) vjsRef!: ElementRef<HTMLVideoElement>;
  video: Video | null = null;
  videoUrl: string = '';
  videoId: string = '';

  private player!: VideoJsPlayer;
  private viewInitialized = false;

  constructor() {
    this.activeRoute.queryParams.subscribe(params => {
      this.videoId = params['videoId'] || '';
    });
    console.log('PlayerComponent initialized with videoId:', this.videoId);
  }
  async ngOnInit() {
    const videoData = await this.api.getVideoById(this.videoId);

    if (videoData.isSuccess()) {
      this.video = new Video(videoData.data);
      this.videoUrl = this.video.hls;

      // Player initialisieren, wenn View bereit ist
      if (this.viewInitialized) {
        this.initializePlayer();
      }
    }
    else {
      this.errorService.show('Video not found or could not be loaded.');
    }
    console.log('Video URL:', this.videoUrl);
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;

    // Player initialisieren, wenn URL bereits geladen ist
    if (this.videoUrl) {
      this.initializePlayer();
    }
  }

  private initializePlayer(): void {
    this.player = videojs(this.vjsRef.nativeElement, {
      autoplay: true,
      preload: 'auto',
      controls: true,
      fluid: true,
      sources: [
        { src: this.videoUrl, type: 'application/x-mpegURL' }
      ],
      html5: {
        vhs: { overrideNative: true }
      }
    });

    /* === Resume‑Playback === */
    const resume = this.videoId ? Number(localStorage.getItem(this.key())) : 0;
    if (resume) {
      this.player.ready(() => this.player.currentTime(resume));
    }

    /* === Fortschritt speichern === */
    this.player.on('timeupdate', () => {
      if (!this.videoId) return;
      localStorage.setItem(this.key(), this.player?.currentTime()?.toString() ?? '0');
    });
  }

  ngOnDestroy(): void {
    this.player?.dispose();
  }

  private key() { return `resume:${this.videoId}`; }
}
