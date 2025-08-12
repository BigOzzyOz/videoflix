import { inject, Injectable } from '@angular/core';
import { PlayerStateService } from './player-state.service';
import { PlayerService } from './player.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class SeekService {
  playerState = inject(PlayerStateService);
  playerService = inject(PlayerService);
  errorService = inject(ErrorService);

  constructor() { }

  scrubStart(): void {
    this.playerState.setIsScrubbing(true);
    this.playerService.pause();
  }

  scrubbing(event: Event): void {
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);

    this.setSeekTime(time, false);
  }

  scrubbingTouch(event: TouchEvent): void {
    const touch = event.touches[0];
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * this.playerState.videoDuration();

    this.setSeekTime(time, false);
  }

  scrubEnd(event: Event): void {
    this.playerState.setIsScrubbing(false);
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);

    this.playerState.setIsScrubbing(false);

    this.setSeekTime(time, true);
  }

  scrubEndTouch(event: TouchEvent): void {
    this.playerState.setIsScrubbing(false);
    this.setSeekTime(this.playerState.progressTime(), true);
  }

  progressClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * this.playerState.videoDuration();

    this.setSeekTime(time, false);
  }

  canSeek(): boolean {
    return this.playerState.canPlay() && this.playerState.videoDuration() > 0;
  }

  seekBy(seconds: number): void {
    const player = this.playerState.player;

    if (player && this.canSeek()) {
      const currentTime = this.playerState.progressTime();
      const duration = this.playerState.videoDuration();
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration - 1));

      this.setSeekTime(newTime, false);
    }
  }

  seekTo(time: number): void {
    const player = this.playerState.player;
    if (player && this.canSeek()) {
      const clampedTime = Math.max(0, Math.min(time, this.playerState.videoDuration()));
      this.setSeekTime(clampedTime, false);
    }
  }

  seekToPercentage(percentage: number): void {
    const time = percentage * this.playerState.videoDuration();
    this.seekTo(time);
  }

  handleKeyboardSeek(direction: 'left' | 'right', seconds: number = 10): void {
    const seekValue = direction === 'right' ? seconds : -seconds;
    this.seekBy(seekValue);
  }

  setSeekTime(time: number, run: boolean): void {
    this.playerState.setProgressTime(time);

    const player = this.playerState.player;
    if (player) player.currentTime(time);
    if (run) {
      player.play().catch((err: any) => {
        this.errorService.show('Error resuming playback after seek. Please try again.');
        console.error('Error resuming playback:', err);
      });
    }
  }
}
