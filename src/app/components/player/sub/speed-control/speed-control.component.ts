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

  // Speed Options können auch über Service kommen oder hier definiert bleiben
  readonly SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  onToggleSpeedMenu(): void {
    console.log('Toggle speed menu');
    this.playerState.toggleSpeedMenu();
  }

  onSelectSpeed(speed: number): void {
    console.log('Select speed:', speed);
    this.playerState.setPlaybackSpeed(speed);

    // Menu nach Auswahl schließen
    setTimeout(() => {
      this.playerState.setShowSpeedMenu(false);
    }, 150);
  }

  // Speed Label für bessere UX
  getSpeedLabel(speed: number): string {
    return this.playerState.getSpeedLabel(speed);
  }

  // Current Speed für Template
  get currentSpeed(): number {
    return this.playerState.playbackSpeed();
  }

  get showSpeedMenu(): boolean {
    return this.playerState.showSpeedMenu();
  }

  // Click outside to close menu
  onContainerClick(event: Event): void {
    event.stopPropagation();
  }

  // Document click handler (optional - kann auch über PlayerComponent)
  onDocumentClick(): void {
    this.playerState.setShowSpeedMenu(false);
  }
}
