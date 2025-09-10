import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../../shared/services/player.service';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

@Component({
  selector: 'app-play-button',
  imports: [CommonModule],
  templateUrl: './play-button.component.html',
  styleUrl: './play-button.component.scss'
})
/**
 * Button component for toggling play/pause in the video player.
 * Delegates play logic to PlayerService and exposes playing state.
 */
export class PlayButtonComponent {
  playerService = inject(PlayerService);
  playerState = inject(PlayerStateService);

  /**
   * Toggles play/pause using the PlayerService.
   */
  onTogglePlay(): void {
    this.playerService.togglePlay();
  }

  /**
   * Returns true if the player is currently playing.
   */
  get isPlaying(): boolean {
    return this.playerState.isPlaying();
  }

}
