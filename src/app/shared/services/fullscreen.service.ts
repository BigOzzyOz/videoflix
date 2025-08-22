import { inject, Injectable } from '@angular/core';
import { PlayerStateService } from './player-state.service';

@Injectable({
  providedIn: 'root'
})
export class FullscreenService {
  playerState = inject(PlayerStateService);


  constructor() { }



  toggleFullscreen(): void {
    if (this.playerState.isFullscreen()) this.exitFullscreen();
    else this.enterFullscreen();
  }

  enterFullscreen(): void {
    const element = document.documentElement;
    this.playerState.setIsFullscreen(true);

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  }

  exitFullscreen(): void {
    this.playerState.setIsFullscreen(false);
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }
}
