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
export class FullscreenButtonComponent {
  fullScreenService = inject(FullscreenService);
  playerState = inject(PlayerStateService);

  onToggleFullscreen(): void {
    this.fullScreenService.toggleFullscreen();
  }

  get isFullscreen(): boolean {
    return this.playerState.isFullscreen();
  }
}
