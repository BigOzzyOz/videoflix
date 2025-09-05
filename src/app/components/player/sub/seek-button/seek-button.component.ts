import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';
import { SeekService } from '../../../../shared/services/seek.service';

@Component({
  selector: 'app-seek-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seek-button.component.html',
  styleUrls: ['./seek-button.component.scss']
})
/**
 * Button component for seeking forward or backward in the video player.
 * Uses SeekService to perform seek actions based on direction and seconds.
 */
export class SeekButtonComponent {
  /**
   * Direction to seek: 'forward' or 'back'. Defaults to 'forward'.
   */
  @Input() direction: 'forward' | 'back' = 'forward';
  /**
   * Number of seconds to seek. Defaults to 10.
   */
  @Input() seconds: number = 10;

  playerState = inject(PlayerStateService);
  seekService = inject(SeekService);

  /**
   * Performs seek action using SeekService based on direction and seconds.
   */
  onSeek(): void {
    const seekValue = this.direction === 'forward' ? this.seconds : -this.seconds;
    this.seekService.seekBy(seekValue);
  }

  /**
   * Returns the CSS class for the button based on direction.
   */
  get buttonClass(): string {
    return this.direction === 'forward' ? 'vjs-seek-forward' : 'vjs-seek-back';
  }
}
