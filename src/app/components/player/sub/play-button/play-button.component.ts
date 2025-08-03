import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

@Component({
  selector: 'app-play-button',
  imports: [CommonModule],
  templateUrl: './play-button.component.html',
  styleUrl: './play-button.component.scss'
})
export class PlayButtonComponent {
  playerState = inject(PlayerStateService);

  togglePlay(): void {
    const player = this.playerState.player;

    if (player) {
      if (player.paused()) {
        player.play().then(() => {
          this.playerState.setIsPlaying(true);
          console.log('Video started playing');
        }).catch((error: any) => {
          console.error('Play failed:', error);
        });
      } else {
        player.pause();
        this.playerState.setIsPlaying(false);
        console.log('Video paused');
      }
    } else {
      console.error('Player not available');
    }
  }
}
