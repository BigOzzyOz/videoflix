import { inject, Injectable } from '@angular/core';
import { PlayerStateService } from './player-state.service';
import { ErrorService } from './error.service';
import { ProgressService } from './progress.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for handling seeking and scrubbing in the video player.
 * Provides methods for mouse, touch, keyboard, and programmatic seeking.
 * Integrates with PlayerStateService, ProgressService, and ErrorService.
 */
export class SeekService {
  playerState = inject(PlayerStateService);
  progressService = inject(ProgressService);
  errorService = inject(ErrorService);

  private lastSeekTime = 0;


  /**
   * Constructs the SeekService and injects required dependencies.
   */
  constructor() { }

  /**
   * Starts scrubbing (seeking) and pauses the player.
   */
  scrubStart(): void {
    this.playerState.setIsScrubbing(true);
    this.playerState.player.pause();
  }

  /**
   * Handles scrubbing via mouse or input event.
   * @param event Input event containing the target value.
   */
  scrubbing(event: Event): void {
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);

    this.setSeekTime(time, false);
  }

  /**
   * Handles scrubbing via touch event.
   * @param event Touch event containing position data.
   */
  scrubbingTouch(event: TouchEvent): void {
    const touch = event.touches[0];
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * this.playerState.videoDuration();

    this.setSeekTime(time, false);
  }

  /**
   * Ends scrubbing via mouse or input event and resumes playback.
   * @param event Input event containing the target value.
   */
  scrubEnd(event: Event): void {
    this.playerState.setIsScrubbing(false);
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);

    this.playerState.setIsScrubbing(false);

    this.setSeekTime(time, true);
  }

  /**
   * Ends scrubbing via touch event and resumes playback.
   * @param event Touch event.
   */
  scrubEndTouch(event: TouchEvent): void {
    this.playerState.setIsScrubbing(false);
    this.setSeekTime(this.playerState.progressTime(), true);
  }

  /**
   * Handles click on the progress bar to seek to a specific time.
   * @param event Mouse event containing position data.
   */
  progressClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * this.playerState.videoDuration();

    this.setSeekTime(time, false);
  }

  /**
   * Determines if seeking is currently possible.
   * @returns True if seeking is allowed, false otherwise.
   */
  canSeek(): boolean {
    return this.playerState.canPlay() && this.playerState.videoDuration() > 0;
  }

  /**
   * Seeks forward or backward by a given number of seconds.
   * @param seconds Number of seconds to seek (positive or negative).
   */
  seekBy(seconds: number): void {
    const player = this.playerState.player;

    if (player && this.canSeek()) {
      const currentTime = this.playerState.progressTime();
      const duration = this.playerState.videoDuration();
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration - 1));

      this.setSeekTime(newTime, false);
    }
  }

  /**
   * Seeks to a specific time in the video.
   * @param time Time in seconds to seek to.
   */
  seekTo(time: number): void {
    const player = this.playerState.player;
    if (player && this.canSeek()) {
      const clampedTime = Math.max(0, Math.min(time, this.playerState.videoDuration()));
      this.setSeekTime(clampedTime, false);
    }
  }

  /**
   * Seeks to a specific percentage of the video duration.
   * @param percentage Value between 0 and 1 representing the position.
   */
  seekToPercentage(percentage: number): void {
    const time = percentage * this.playerState.videoDuration();
    this.seekTo(time);
  }

  /**
   * Handles keyboard seeking (left/right arrows).
   * @param direction 'left' or 'right' direction.
   * @param seconds Number of seconds to seek (default 10).
   */
  handleKeyboardSeek(direction: 'left' | 'right', seconds: number = 10): void {
    const seekValue = direction === 'right' ? seconds : -seconds;
    this.seekBy(seekValue);
  }

  /**
   * Sets the seek time and optionally resumes playback.
   * @param time Time in seconds to seek to.
   * @param run If true, resumes playback after seeking.
   */
  setSeekTime(time: number, run: boolean): void {
    this.playerState.setProgressTime(time);

    const player = this.playerState.player;
    if (player) player.currentTime(time);
    if (run) {
      player.play().catch((err: any) => {
        this.errorService.show('Error resuming playback after seek. Please try again.');
      });
    }
  }

  /**
   * Jumps forward or backward by a given number of seconds, with debounce and resume logic.
   * @param seconds Number of seconds to jump.
   * @param isInit If true, uses resume time for initial seek.
   */
  jumpTime(seconds: number, isInit: boolean = false): void {
    const now = Date.now();
    if (!isInit && now - this.lastSeekTime < 500) return;
    this.lastSeekTime = now;
    const resume = this.playerState.videoId() ? this.progressService.getResumeTime() : 0;
    const duration = this.playerState.videoDuration();

    if (!this.playerState.viewInitialized() || !this.playerState.player ||
      duration === undefined || duration <= 0) {
      this.errorService.show('Player is not ready for seeking');
      return;
    }
    if (resume > 0 && isInit) this.seekTo(Math.min(resume, duration - 1));
    else {
      const currentTime = this.playerState.progressTime();
      this.seekTo(Math.max(0, Math.min(currentTime + seconds, duration - 1)));
    }
  }
}
