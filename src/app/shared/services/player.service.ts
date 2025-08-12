import { inject, Injectable } from '@angular/core';
import { PlayerStateService } from './player-state.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  playerState = inject(PlayerStateService);
  errorService = inject(ErrorService);

  constructor() {
  }

  togglePlay(): void {
    const player = this.playerState.player;
    if (player) {
      if (player.paused()) {
        player.play().then(() => {
          this.playerState.setIsPlaying(true);
        }).catch(() => {
          this.errorService.show('Error playing video. Please try again.');
          console.error('Error playing video:', player.error);
        });
      } else {
        player.pause();
        this.playerState.setIsPlaying(false);
      }
    } else {
      this.errorService.show('Player not available. Please check if the video is loaded.');
      console.error('Player not available');
    }
  }

  pause(): void {
    const player = this.playerState.player;
    player.pause();
  }


}
