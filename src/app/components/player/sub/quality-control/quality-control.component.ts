import { Component, inject } from '@angular/core';
import { PlayerStateService } from '../../../../shared/services/player-state.service';
import { PlayerService } from '../../../../shared/services/player.service';

@Component({
  selector: 'app-quality-control',
  imports: [],
  templateUrl: './quality-control.component.html',
  styleUrl: './quality-control.component.scss',
  standalone: true
})
export class QualityControlComponent {
  playerState = inject(PlayerStateService);
  playerService = inject(PlayerService);

  /**
   * Handles selection of a video quality.
   * Sets the selected quality in the player and closes the quality menu.
   * @param quality The selected quality label (e.g., 'auto', '1080p').
   */
  onSelectQuality(quality: string) {
    this.playerService.setQuality(quality);
    this.playerState.setCurrentQuality(quality);
    this.playerState.setShowQualityMenu(false);
  }

  /**
   * Prevents click events from propagating outside the quality control container.
   * Used to avoid closing the menu when clicking inside the dropdown.
   * @param event MouseEvent
   */
  onContainerClick(event: MouseEvent) {
    event.stopPropagation();
  }
}
