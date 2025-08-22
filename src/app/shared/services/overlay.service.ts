import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private overlayTimeoutId: any = null;
  private readonly OVERLAY_HIDE_DELAY = 3000;
  private _showOverlay = signal<boolean>(true);

  readonly showOverlay = this._showOverlay.asReadonly();

  setShowOverlay(value: boolean) {
    this._showOverlay.set(value);
  }

  resetOverlayTimer(isPlaying: boolean): void {
    this.setShowOverlay(true);
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
    }
    if (isPlaying) {
      this.overlayTimeoutId = setTimeout(() => {
        this.setShowOverlay(false);
      }, this.OVERLAY_HIDE_DELAY);
    }
  }

  clearOverlayTimer(): void {
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
      this.overlayTimeoutId = null;
    }
  }
}
