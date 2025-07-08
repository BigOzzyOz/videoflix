import { Component, inject, Input, OnDestroy, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Video } from '../../../shared/models/video';
import { ApiService } from '../../../shared/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-featured',
  imports: [CommonModule],
  templateUrl: './featured.component.html',
  styleUrl: './featured.component.scss'
})
export class FeaturedComponent implements OnInit, OnDestroy, OnChanges {
  api = inject(ApiService);

  @Input() video: Video | null = null;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  isPreviewPlaying: boolean = false;
  isSoundEnabled: boolean = true;

  constructor() {

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['video'] && this.video) {
      this.isPreviewPlaying = false;
      if (this.videoElement && this.videoElement.nativeElement) {
        const video = this.videoElement.nativeElement;
        video.currentTime = 0;
        video.load();
        setTimeout(() => {
          video.play();
        }, 2000);
      }
    }
  }


  ngOnDestroy(): void {

  }

  togglePreview() {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  toggleSound() {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      this.isSoundEnabled = !this.isSoundEnabled;
      video.muted = !this.isSoundEnabled;
    }
  }

  endPreview() {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      video.pause();
      video.currentTime = 0;
      video.load();
    }
  }

  playVideo() {
    throw new Error('Method not implemented.');
  }
}
