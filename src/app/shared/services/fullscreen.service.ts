import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FullscreenService {
  private _isFullscreen = signal<boolean>(false);
  readonly isFullscreen = this._isFullscreen.asReadonly();

  constructor() { }

  setIsFullscreen(fullscreen: boolean): void {
    this._isFullscreen.set(fullscreen);
  }

  resetState(): void {
    this._isFullscreen.set(false);
  }

  toggleFullscreen(): void {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  enterFullscreen(): void {
    const element = document.documentElement;
    this.setIsFullscreen(true);

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }

    console.log('Entering fullscreen');
  }

  exitFullscreen(): void {
    this.setIsFullscreen(false);
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }

    console.log('Exiting fullscreen');
  }
}
