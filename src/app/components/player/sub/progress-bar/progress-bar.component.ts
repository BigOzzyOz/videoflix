import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoTimePipe } from '../../../../shared/pipes/video-time.pipe';
import { PlayerStateService } from '../../../../shared/services/player-state.service';
import { PlayerService } from '../../../../shared/services/player.service';
import { SeekService } from '../../../../shared/services/seek.service';

@Component({
  selector: 'app-progress-bar',
  imports: [CommonModule, VideoTimePipe],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  playerState = inject(PlayerStateService);
  playerService = inject(PlayerService);
  seekService = inject(SeekService);

  // Seeking Methods
  onSeekStart(): void {
    this.seekService.scrubStart();
  }

  onScrubbing(event: Event): void {
    this.seekService.scrubbing(event);
  }

  onSeekEnd(event: Event): void {
    this.seekService.scrubEnd(event);
  }

  updateTooltip(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));

    const tooltipTime = percentage * this.playerState.videoDuration();

    this.playerState.setSeekTooltipTime(tooltipTime);
    this.playerState.setSeekTooltipPosition(x);
    this.playerState.setShowSeekTooltip(true);
  }

  hideTooltip(): void {
    this.playerState.setShowSeekTooltip(false);
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.seekService.scrubStart();
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    this.seekService.scrubbingTouch(event);
  }

  onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.seekService.scrubEndTouch(event);
  }

  onProgressClick(event: MouseEvent): void {
    this.seekService.progressClick(event);
  }

  get progressPercentage(): number {
    return this.playerState.progress();
  }

  get bufferedPercentage(): number {
    return this.playerState.bufferedPercentage();
  }

  get progressTime(): number {
    return this.playerState.progressTime();
  }

  get isScrubbing(): boolean {
    return this.playerState.isScrubbing();
  }

  get videoDuration(): number {
    return this.playerState.videoDuration();
  }

  get showSeekTooltip(): boolean {
    return this.playerState.showSeekTooltip();
  }

  get seekTooltipTime(): number {
    return this.playerState.seekTooltipTime();
  }

  get seekTooltipPosition(): number {
    return this.playerState.seekTooltipPosition();
  }
}
