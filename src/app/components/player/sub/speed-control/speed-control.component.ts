import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

@Component({
  selector: 'app-speed-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speed-control.component.html',
  styleUrls: ['./speed-control.component.scss']
})
export class SpeedControlComponent {
  playerState = inject(PlayerStateService);

  readonly SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  onToggleSpeedMenu(): void {
    this.playerState.toggleSpeedMenu();
  }

  onSelectSpeed(speed: number): void {
    this.playerState.setPlaybackSpeed(speed);

    setTimeout(() => {
      this.playerState.setShowSpeedMenu(false);
    }, 150);
  }

  getSpeedLabel(speed: number): string {
    return this.getSpeedLabelName(speed);
  }

  get currentSpeed(): number {
    return this.playerState.playbackSpeed();
  }

  get showSpeedMenu(): boolean {
    return this.playerState.showSpeedMenu();
  }

  onContainerClick(event: Event): void {
    event.stopPropagation();
  }

  onDocumentClick(): void {
    this.playerState.setShowSpeedMenu(false);
  }

  getSpeedLabelName(speed: number): string {
    return speed === 1 ? 'Normal' : `${speed}x`;
  }
}
