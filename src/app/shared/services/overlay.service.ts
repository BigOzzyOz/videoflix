import { Injectable, signal } from '@angular/core';

/**
 * Service for managing the visibility and auto-hide behavior of the player overlay.
 */
@Injectable({ providedIn: 'root' })
export class OverlayService {
  private overlayTimeoutId: any = null;
  private readonly OVERLAY_HIDE_DELAY = 3000;
  private _showOverlay = signal<boolean>(true);

  readonly showOverlay = this._showOverlay.asReadonly();

  /**
   * Sets the overlay visibility state.
   * @param value True to show overlay, false to hide
   */
  setShowOverlay(value: boolean) {
    this._showOverlay.set(value);
  }

  /**
   * Resets the overlay timer and auto-hides overlay if playing.
   * @param isPlaying True if video is playing, triggers auto-hide
   */
  resetOverlayTimer(isPlaying: boolean): void {
    this.setShowOverlay(true);
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
    }
    if (isPlaying) {
      this.overlayTimeoutId = setTimeout(() => this.setShowOverlay(false), this.OVERLAY_HIDE_DELAY);
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
