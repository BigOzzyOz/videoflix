import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullscreenService } from '../../../../shared/services/fullscreen.service';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

@Component({
  selector: 'app-fullscreen-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fullscreen-button.component.html',
  styleUrl: './fullscreen-button.component.scss'
})
/**
 * Button component for toggling fullscreen mode in the video player.
 * Delegates fullscreen logic to FullscreenService and exposes fullscreen state.
 */
export class FullscreenButtonComponent {
  fullScreenService = inject(FullscreenService);
  playerState = inject(PlayerStateService);

  /**
   * Toggles fullscreen mode using the FullscreenService.
   */
  onToggleFullscreen(): void {
    this.fullScreenService.toggleFullscreen();
  }

  /**
   * Returns true if the player is currently in fullscreen mode.
   */
  get isFullscreen(): boolean {
    return this.playerState.isFullscreen();
  }
}
