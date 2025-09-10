import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

@Component({
  selector: 'app-video-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-title.component.html',
  styleUrl: './video-title.component.scss'
})
/**
 * Component for displaying the current video title.
 * Retrieves the title from PlayerStateService.
 */
export class VideoTitleComponent {
  playerState = inject(PlayerStateService);

  /**
   * Returns the current video title from PlayerStateService.
   */
  get videoTitle(): string {
    return this.playerState.title();
  }
}
