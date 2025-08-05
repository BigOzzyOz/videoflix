import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

@Component({
  selector: 'app-fullscreen-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fullscreen-button.component.html',
  styleUrl: './fullscreen-button.component.scss'
})
export class FullscreenButtonComponent {
  playerState = inject(PlayerStateService);

  onToggleFullscreen(): void {
    console.log('Toggle fullscreen');
    this.playerState.toggleFullscreen();
  }

  // Getter für Template
  get isFullscreen(): boolean {
    return this.playerState.isFullscreen();
  }
}
