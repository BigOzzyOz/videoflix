import { inject, Injectable } from '@angular/core';
import { PlayerStateService } from './player-state.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for managing video player volume and mute state.
 * Provides methods to set volume and toggle sound, integrating with PlayerStateService.
 */
export class VolumeService {
  playerState = inject(PlayerStateService);



  /**
   * Constructs the VolumeService and injects required dependencies.
   */
  constructor() { }

  /**
   * Sets the player volume, clamps between 0 and 1, and updates mute state accordingly.
   * @param volume Volume value between 0 and 1.
   */
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

  /**
   * Toggles the mute state of the player. Unmutes and sets volume to 0.5 if currently muted or volume is 0.
   */
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
