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
export class PlayButtonComponent {
  playerService = inject(PlayerService);
  playerState = inject(PlayerStateService);

  onTogglePlay(): void {
    this.playerService.togglePlay();
  }

  get isPlaying(): boolean {
    return this.playerState.isPlaying();
  }

}
