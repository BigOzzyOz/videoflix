import { Component, inject, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
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
/**
 * FeaturedComponent displays a featured video preview with description, sound, and navigation controls.
 * It handles video playback, sound toggling, text overflow detection, and navigation to the video detail page.
 */
export class FeaturedComponent implements OnChanges {
  api = inject(ApiService);
  private router = inject(Router);

  @Input() video: Video | null = null;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoDescription') videoDescription!: ElementRef<HTMLDivElement>;

  isPreviewPlaying: boolean = false;
  isSoundEnabled: boolean = true;
  hasDescriptionOverflow: boolean = false;

  constructor() { }

  /**
   * Handles changes to the input video. Resets preview state, reloads the video, checks for text overflow,
   * and starts playback after a delay.
   * @param changes The changes object containing updated input properties.
   */
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

  /**
   * Checks if the video description overflows the visible area and sets overflow attributes accordingly.
   * Uses helper methods to measure and style the description element.
   */
  private checkTextOverflow(): void {
    if (!this.videoDescription || !this.video) return;
    const element = this.videoDescription.nativeElement;
    const maxVisibleHeight = this.getVisibleHeight(element);
    const naturalHeight = this.styleNormalSize(element);
    this.styleClampedSize(element);
    this.hasDescriptionOverflow = naturalHeight > maxVisibleHeight;
    this.changeOverflowStyle(element);
  }

  /**
   * Calculates the maximum visible height for the description element based on line height and number of lines.
   * @param element The HTMLDivElement to measure.
   * @returns The maximum visible height in pixels for the description area.
   */
  private getVisibleHeight(element: HTMLDivElement): number {
    const actualLineHeight = this.getElementLineHeight(element);
    const maxVisibleLines = 5;
    return maxVisibleLines * actualLineHeight;
  }

  /**
   * Returns the computed line height of the given element, falling back to font size if not available.
   * @param element The HTMLDivElement to measure.
   * @returns The line height in pixels.
   */
  private getElementLineHeight(element: HTMLDivElement): number {
    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const fontSize = parseFloat(computedStyle.fontSize);
    return lineHeight || fontSize;
  }

  /**
   * Sets the element to its natural size to measure scrollHeight for overflow detection.
   * @param element The HTMLDivElement to style and measure.
   * @returns The natural scrollHeight of the element.
   */
  private styleNormalSize(element: HTMLDivElement): number {
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.display = 'block';
    return element.scrollHeight;
  }

  /**
   * Sets the element to its clamped display style for the UI (limited height, hidden overflow).
   * @param element The HTMLDivElement to style.
   */
  private styleClampedSize(element: HTMLDivElement): void {
    element.style.height = '10rem';
    element.style.overflow = 'hidden';
    element.style.display = 'grid';
  }

  /**
   * Sets or removes overflow attributes on the description element based on overflow state.
   * @param element The HTMLDivElement to update attributes on.
   */
  private changeOverflowStyle(element: HTMLDivElement): void {
    if (this.hasDescriptionOverflow) {
      element.setAttribute('data-has-overflow', 'true');
      element.setAttribute('data-full-text', this.video!.description);
    } else {
      element.removeAttribute('data-has-overflow');
      element.removeAttribute('data-full-text');
    }
  }

  /**
   * Toggles video preview playback (play/pause) for the featured video.
   */
  togglePreview() {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      if (video.paused) video.play();
      else video.pause();
    }
  }

  /**
   * Toggles sound on or off for the featured video preview.
   */
  toggleSound() {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      this.isSoundEnabled = !this.isSoundEnabled;
      video.muted = !this.isSoundEnabled;
    }
  }

  /**
   * Ends the video preview, resets playback position, and reloads the video element.
   */
  endPreview() {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      video.pause();
      video.currentTime = 0;
      video.load();
    }
  }

  /**
   * Navigates to the video detail page for the given video ID, ending the preview and updating session storage.
   * @param videoId The ID of the video to play.
   */
  playVideo(videoId: string): void {
    if (!videoId) return;
    this.endPreview();
    this.isPreviewPlaying = false;
    sessionStorage.setItem('videoId', videoId);
    this.router.navigate(['/video'], {
      queryParams: { videoId: videoId },
    });
  }
}
