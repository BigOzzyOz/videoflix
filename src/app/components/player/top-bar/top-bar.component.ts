import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoTitleComponent } from '../sub/video-title/video-title.component';
import { PlayerStateService } from '../../../shared/services/player-state.service';
import { NavigationService } from '../../../shared/services/navigation.service';

/**
 * Player top bar component. Handles display of video title, close button, and fullscreen toggle.
 * May include logic for user interaction and state display.
 */
@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    VideoTitleComponent
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  navigate = inject(NavigationService)
  playerState = inject(PlayerStateService);

  /**
   * Navigates back to the previous view.
   */
  goBack(): void {
    this.navigate.goBack();
  }

  /**
   * Returns true if the player is currently optimizing.
   */
  get isOptimizing(): boolean {
    return this.playerState.isOptimizing();
  }
}
