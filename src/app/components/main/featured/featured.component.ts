import { Component, inject, Input, OnDestroy, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Video } from '../../../shared/models/video';
import { ApiService } from '../../../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-featured',
  imports: [CommonModule],
  templateUrl: './featured.component.html',
  styleUrl: './featured.component.scss'
})
export class FeaturedComponent implements OnInit, OnDestroy, OnChanges {
  api = inject(ApiService);
  private router = inject(Router);

  @Input() video: Video | null = null;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoDescription') videoDescription!: ElementRef<HTMLDivElement>;

  isPreviewPlaying: boolean = false;
  isSoundEnabled: boolean = true;
  hasDescriptionOverflow: boolean = false;

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
          this.checkTextOverflow();
        }, 100);
        setTimeout(() => {
          video.play();
        }, 2000);
      }
    }
  }


  ngOnDestroy(): void {

  }

  private checkTextOverflow(): void {
    if (!this.videoDescription || !this.video) return;

    const element = this.videoDescription.nativeElement;

    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const fontSize = parseFloat(computedStyle.fontSize);

    const actualLineHeight = lineHeight || fontSize;

    const maxVisibleLines = 5;
    const maxVisibleHeight = maxVisibleLines * actualLineHeight;

    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.display = 'block';

    const naturalHeight = element.scrollHeight;

    element.style.height = '10rem';
    element.style.overflow = 'hidden';
    element.style.display = 'grid';

    const hasOverflow = naturalHeight > maxVisibleHeight;

    this.hasDescriptionOverflow = hasOverflow;

    if (hasOverflow) {
      element.setAttribute('data-has-overflow', 'true');
      element.setAttribute('data-full-text', this.video.description);
    } else {
      element.removeAttribute('data-has-overflow');
      element.removeAttribute('data-full-text');
    }
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

  playVideo(videoId: string): void {
    if (!videoId) return;
    this.endPreview();
    this.isPreviewPlaying = false;
    this.router.navigate(['/video'], {
      queryParams: { videoId: videoId },
    });
  }
}
