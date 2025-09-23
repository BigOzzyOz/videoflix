import { inject, Injectable } from '@angular/core';
import { PlayerStateService } from './player-state.service';

/**
 * Service for managing the visibility and auto-hide behavior of the player overlay.
 */
@Injectable({ providedIn: 'root' })
export class OverlayService {
  private playerState = inject(PlayerStateService);
  private overlayTimeoutId: any = null;
  private readonly OVERLAY_HIDE_DELAY = 3000;


  /**
   * Resets the overlay timer and auto-hides overlay if playing.
   * @param isPlaying True if video is playing, triggers auto-hide
   */
  resetOverlayTimer(isPlaying: boolean): void {
    this.playerState.setShowOverlay(true);
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
    }
    if (isPlaying) {
      this.overlayTimeoutId = setTimeout(() => this.playerState.toggleOverlay(), this.OVERLAY_HIDE_DELAY);
    }
  }

  /**
   * Clears the overlay auto-hide timer.
   */
  clearOverlayTimer(): void {
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
      this.overlayTimeoutId = null;
    }
  }
}
