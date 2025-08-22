import { inject, Injectable } from '@angular/core';
import { PlayerStateService } from './player-state.service';

@Injectable({
  providedIn: 'root'
})
export class VolumeService {
  playerState = inject(PlayerStateService);


  constructor() { }
  setVolume(volume: number): void {
    const player = this.playerState.player;
    if (player) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.playerState.setVolume(clampedVolume);
      player.volume(clampedVolume);

      if (clampedVolume > 0 && player.muted()) {
        player.muted(false);
        this.playerState.setIsMuted(false);
      } else if (clampedVolume === 0 && !player.muted()) {
        player.muted(true);
        this.playerState.setIsMuted(true);
      }
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
