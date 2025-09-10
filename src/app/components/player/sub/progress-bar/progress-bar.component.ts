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
/**
 * Progress bar component for video playback.
 * Handles seeking, scrubbing, and tooltip display using injected services.
 */
export class ProgressBarComponent {
  playerState = inject(PlayerStateService);
  playerService = inject(PlayerService);
  seekService = inject(SeekService);

  /**
   * Called when user starts seeking (mouse down).
   */
  onSeekStart(): void {
    this.seekService.scrubStart();
  }

  /**
   * Called while user is scrubbing (mouse move).
   * @param event Mouse event
   */
  onScrubbing(event: Event): void {
    this.seekService.scrubbing(event);
  }

  /**
   * Called when user ends seeking (mouse up).
   * @param event Mouse event
   */
  onSeekEnd(event: Event): void {
    this.seekService.scrubEnd(event);
  }

  /**
   * Updates the seek tooltip position and time based on mouse event.
   * @param event Mouse event
   */
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

  /**
   * Hides the seek tooltip.
   */
  hideTooltip(): void {
    this.playerState.setShowSeekTooltip(false);
  }

  /**
   * Called when user starts seeking on touch device.
   * @param event Touch event
   */
  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.seekService.scrubStart();
  }

  /**
   * Called while user is scrubbing on touch device.
   * @param event Touch event
   */
  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    this.seekService.scrubbingTouch(event);
  }

  /**
   * Called when user ends seeking on touch device.
   * @param event Touch event
   */
  onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.seekService.scrubEndTouch(event);
  }

  /**
   * Called when user clicks on the progress bar.
   * @param event Mouse event
   */
  onProgressClick(event: MouseEvent): void {
    this.seekService.progressClick(event);
  }

  /**
   * Returns the current progress percentage of the video.
   */
  get progressPercentage(): number {
    return this.playerState.progress();
  }

  /**
   * Returns the buffered percentage of the video.
   */
  get bufferedPercentage(): number {
    return this.playerState.bufferedPercentage();
  }

  /**
   * Returns the current playback time.
   */
  get progressTime(): number {
    return this.playerState.progressTime();
  }

  /**
   * Returns true if the user is currently scrubbing.
   */
  get isScrubbing(): boolean {
    return this.playerState.isScrubbing();
  }

  /**
   * Returns the total duration of the video.
   */
  get videoDuration(): number {
    return this.playerState.videoDuration();
  }

  /**
   * Returns true if the seek tooltip is visible.
   */
  get showSeekTooltip(): boolean {
    return this.playerState.showSeekTooltip();
  }

  /**
   * Returns the time value shown in the seek tooltip.
   */
  get seekTooltipTime(): number {
    return this.playerState.seekTooltipTime();
  }

  /**
   * Returns the pixel position of the seek tooltip.
   */
  get seekTooltipPosition(): number {
    return this.playerState.seekTooltipPosition();
  }
}
