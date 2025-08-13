import { inject, Injectable } from '@angular/core';
import { PlayerStateService } from './player-state.service';

@Injectable({
  providedIn: 'root'
})
export class VolumeService {
  playerState = inject(PlayerStateService);


  constructor() { }
  setVolume(percentage: number): void {
    const player = this.playerState.player;
    if (player) {
      player.volume(percentage);
      this.playerState.setVolume(percentage);
    }
  }

  toggleSound(): void {
    const player = this.playerState.player;
    if (player) {
      if (player.muted() || this.playerState.volume() === 0) {
        player.muted(false);
        this.playerState.setIsMuted(false);
        this.playerState.setVolume(this.playerState.volume() > 0 ? this.playerState.volume() : 0.5);
      } else {
        player.muted(true);
        this.playerState.setIsMuted(true);
      }
    }
  }
}
