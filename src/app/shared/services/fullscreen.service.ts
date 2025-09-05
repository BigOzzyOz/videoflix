import { inject, Injectable } from '@angular/core';
import { PlayerStateService } from './player-state.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for toggling fullscreen mode for the player and updating player state.
 */
export class FullscreenService {
  playerState = inject(PlayerStateService);

  constructor() { }

  /**
   * Toggles fullscreen mode: enters if not active, exits if already fullscreen.
   */
  toggleFullscreen(): void {
    if (this.playerState.isFullscreen()) this.exitFullscreen();
    else this.enterFullscreen();
  }

  /**
   * Enters fullscreen mode and updates player state.
   * Uses browser-specific APIs for compatibility.
   */
  enterFullscreen(): void {
    const element = document.documentElement;
    this.playerState.setIsFullscreen(true);
    if (element.requestFullscreen) element.requestFullscreen();
    else if ((element as any).webkitRequestFullscreen) (element as any).webkitRequestFullscreen();
    else if ((element as any).msRequestFullscreen) (element as any).msRequestFullscreen();
  }

  /**
   * Exits fullscreen mode and updates player state.
   * Uses browser-specific APIs for compatibility.
   */
  exitFullscreen(): void {
    this.playerState.setIsFullscreen(false);
    if (document.exitFullscreen) document.exitFullscreen();
    else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
  }
}
