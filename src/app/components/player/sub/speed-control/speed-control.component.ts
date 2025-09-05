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
/**
 * Component for controlling video playback speed.
 * Handles speed menu toggling, speed selection, and label generation.
 */
export class SpeedControlComponent {
  playerState = inject(PlayerStateService);

  /**
   * Available speed options for playback.
   */
  readonly SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  /**
   * Toggles the visibility of the speed selection menu.
   */
  onToggleSpeedMenu(): void {
    this.playerState.toggleSpeedMenu();
  }

  /**
   * Sets the playback speed and closes the speed menu after a short delay.
   * @param speed Selected playback speed
   */
  onSelectSpeed(speed: number): void {
    this.playerState.setPlaybackSpeed(speed);
    setTimeout(() => {
      this.playerState.setShowSpeedMenu(false);
    }, 150);
  }

  /**
   * Returns the display label for a given speed value.
   * @param speed Playback speed
   */
  getSpeedLabel(speed: number): string {
    return this.getSpeedLabelName(speed);
  }

  /**
   * Returns the current playback speed.
   */
  get currentSpeed(): number {
    return this.playerState.playbackSpeed();
  }

  /**
   * Returns true if the speed menu is visible.
   */
  get showSpeedMenu(): boolean {
    return this.playerState.showSpeedMenu();
  }

  /**
   * Prevents click events from propagating outside the speed menu container.
   * @param event Click event
   */
  onContainerClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Closes the speed menu when clicking outside of it.
   */
  onDocumentClick(): void {
    this.playerState.setShowSpeedMenu(false);
  }

  /**
   * Returns the label name for a given speed value.
   * @param speed Playback speed
   */
  getSpeedLabelName(speed: number): string {
    return speed === 1 ? 'Normal' : `${speed}x`;
  }
}
