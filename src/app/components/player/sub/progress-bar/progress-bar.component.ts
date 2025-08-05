import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoTimePipe } from '../../../../shared/pipes/video-time.pipe';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

@Component({
  selector: 'app-progress-bar',
  imports: [CommonModule, VideoTimePipe],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  playerState = inject(PlayerStateService);

  // Seeking Methods
  onSeekStart(): void {
    console.log('Seek start');
    this.playerState.setIsScrubbing(true);

    const player = this.playerState.player;
    if (player) {
      player.pause();
    }
  }

  onScrubbing(event: Event): void {
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);

    console.log('Scrubbing to:', time);
    this.playerState.setProgressTime(time);

    const player = this.playerState.player;
    if (player) {
      player.currentTime(time);
    }
  }

  onSeekEnd(event: Event): void {
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);

    console.log('Seek end at:', time);
    this.playerState.setIsScrubbing(false);

    const player = this.playerState.player;
    if (player) {
      player.currentTime(time);
      player.play().catch((err: any) => {
        console.error('Error playing after seek:', err);
      });
    }
  }

  // Tooltip Methods - MIT EVENT PARAMETER
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

  // Touch Support
  onTouchStart(event: TouchEvent): void {
    console.log('Touch seek start');
    event.preventDefault();
    this.onSeekStart();
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * this.playerState.videoDuration();

    console.log('Touch move to:', time);
    this.playerState.setProgressTime(time);

    const player = this.playerState.player;
    if (player) {
      player.currentTime(time);
    }
  }

  onTouchEnd(event: TouchEvent): void {
    console.log('Touch seek end');
    event.preventDefault();
    this.playerState.setIsScrubbing(false);

    const player = this.playerState.player;
    if (player) {
      player.play().catch((err: any) => {
        console.error('Error playing after touch seek:', err);
      });
    }
  }

  // Progress Bar Click
  onProgressClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * this.playerState.videoDuration();

    console.log('Progress clicked at:', time);

    const player = this.playerState.player;
    if (player) {
      player.currentTime(time);
      this.playerState.setProgressTime(time);
    }
  }

  // Computed Properties für Template
  get progressPercentage(): number {
    return this.playerState.progress();
  }

  get bufferedPercentage(): number {
    return this.playerState.bufferedPercentage();
  }
}
