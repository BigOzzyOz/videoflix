import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoTimePipe } from '../../../../shared/pipes/video-time.pipe';


@Component({
  selector: 'app-progress-bar',
  imports: [CommonModule, VideoTimePipe],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  @Input() progressTime = 0;
  @Input() videoDuration = 0;
  @Input() isScrubbing = false;

  @Output() seekStart = new EventEmitter<void>();
  @Output() scrubbing = new EventEmitter<Event>();  // Event weiterleiten
  @Output() seekEnd = new EventEmitter<Event>();

  showTooltip = false;
  tooltipTime = 0;
  tooltipPosition = 0;

  onSeekStart(): void {
    this.seekStart.emit();
  }

  onScrubbing(event: Event): void {
    this.scrubbing.emit(event);
  }

  onSeekEnd(event: Event): void {
    this.seekEnd.emit(event);
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
}
