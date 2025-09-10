import { Component, inject, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';
import { VolumeService } from '../../../../shared/services/volume.service';

@Component({
  selector: 'app-volume-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volume-control.component.html',
  styleUrl: './volume-control.component.scss'
})
/**
 * Component for controlling video volume, mute, and tooltip display.
 * Handles mouse/touch events, drag logic, and DOM updates using Renderer2.
 */
export class VolumeControlComponent implements AfterViewInit, OnDestroy {
  playerState = inject(PlayerStateService);
  volumeService = inject(VolumeService);
  renderer = inject(Renderer2);

  private isDragging = false;
  private volumeHideTimeout: any = null;

  /**
   * Initializes volume handle position after view is initialized.
   */
  ngAfterViewInit(): void {
    setTimeout(() => this.updateVolumeHandlePosition(), 100);
  }

  /**
   * Cleans up timeouts on component destroy.
   */
  ngOnDestroy(): void {
    this.clearVolumeHideTimeout();
  }


  /**
   * Shows volume control and schedules it to hide after a delay (touch start).
   */
  onTouchStart(): void {
    this.playerState.setShowVolumeControl(true);
    this.hideVolumeControlDelayed();
  }

  /**
   * Toggles mute/unmute and updates volume handle position.
   */
  onToggleSound(): void {
    this.volumeService.toggleSound();
    this.playerState.setShowVolumeControl(true);
    setTimeout(() => this.updateVolumeHandlePosition(), 50);
  }

  /**
   * Schedules volume control to hide after a delay unless dragging.
   */
  hideVolumeControlDelayed(): void {
    if (!this.isDragging) {
      this.clearVolumeHideTimeout();
      this.volumeHideTimeout = setTimeout(() => {
        this.playerState.setShowVolumeControl(false);
        this.playerState.setShowVolumeTooltip(false);
      }, 1500);
    }
  }

  /**
   * Clears any scheduled volume control hide timeout.
   */
  clearVolumeHideTimeout(): void {
    if (this.volumeHideTimeout) {
      clearTimeout(this.volumeHideTimeout);
      this.volumeHideTimeout = null;
    }
  }

  /**
   * Sets volume based on click position on the volume bar.
   * @param event Mouse event
   */
  setVolumeFromClick(event: MouseEvent): void {
    if (this.isVolumeHandle(event.target as HTMLElement)) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    const percentage = this.calcVolumePercentage(y, rect);

    this.setVolumeAndUpdate(percentage);

    this.playerState.setShowVolumeTooltip(true);
    setTimeout(() => this.playerState.setShowVolumeTooltip(false), 1000);
  }

  private isVolumeHandle(target: HTMLElement): boolean {
    return target.classList.contains('volume-handle');
  }

  /**
   * Sets volume based on touch position on the volume bar.
   * @param event Touch event
   */
  setVolumeFromTouch(event: TouchEvent): void {
    const touch = event.touches[0];
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = touch.clientY - rect.top;
    const percentage = this.calcVolumePercentage(y, rect);

    this.setVolumeAndUpdate(percentage);

    this.playerState.setShowVolumeTooltip(true);
    setTimeout(() => this.playerState.setShowVolumeTooltip(false), 1000);
  }

  /**
   * Starts dragging the volume handle (mouse or touch).
   * @param event Mouse or touch event
   */
  startVolumeDrag(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.startDragDataChange();
    const isTouch = event.type === 'touchstart';
    const handle = event.target as HTMLElement;
    const track = handle.closest('.volume-track') as HTMLElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    handle.classList.add('dragging');

    if (isTouch) this.handleTouchDrag(event as TouchEvent, rect, handle);
    else this.handleMouseDrag(event as MouseEvent, rect, handle);
  }

  /**
   * Prepares state for volume drag.
   */
  private startDragDataChange(): void {
    this.isDragging = true;
    this.playerState.setShowVolumeTooltip(true);
    this.playerState.setShowVolumeControl(true);
    this.clearVolumeHideTimeout();
  }

  /**
   * Handles mouse drag events for volume control.
   */
  private handleMouseDrag(event: MouseEvent, rect: DOMRect, handle: HTMLElement): void {
    const onMouseMove = (e: MouseEvent) => {
      const y = e.clientY - rect.top;
      const percentage = this.calcVolumePercentage(y, rect);
      this.setVolumeAndUpdate(percentage);
    };
    const onMouseUp = () => {
      this.endDrag(handle);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Handles touch drag events for volume control.
   */
  private handleTouchDrag(event: TouchEvent, rect: DOMRect, handle: HTMLElement): void {
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const y = touch.clientY - rect.top;
      const percentage = this.calcVolumePercentage(y, rect);
      this.setVolumeAndUpdate(percentage);
    };
    const onTouchEnd = () => {
      this.endDrag(handle);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  }

  /**
   * Calculates volume percentage based on position and track dimensions.
   */
  private calcVolumePercentage(y: number, rect: DOMRect): number {
    return Math.max(0, Math.min(1, 1 - (y / rect.height)));
  }

  /**
   * Sets volume and updates handle position.
   * @param percentage Volume percentage (0-1)
   */
  private setVolumeAndUpdate(percentage: number): void {
    this.volumeService.setVolume(percentage);
    this.updateVolumeHandlePosition();
  }

  /**
   * Ends volume drag and schedules tooltip hide.
   */
  private endDrag(handle: HTMLElement): void {
    this.isDragging = false;
    handle.classList.remove('dragging');
    setTimeout(() => this.playerState.setShowVolumeTooltip(false), 1000);
    this.hideVolumeControlDelayed();
  }

  /**
   * Updates the position of the volume handle and progress bar.
   */
  private updateVolumeHandlePosition(): void {
    const trackHeight = 14;
    const handleHeight = 1.6;
    const padding = 1;
    const availableHeight = trackHeight - handleHeight;

    const volume = this.playerState.volume();
    const position = padding + (availableHeight * volume);
    const progressHeight = trackHeight * volume;

    this.setVolumeProgress(progressHeight, padding);
    this.setVolumeHandlePosition(position);
  }

  /**
   * Sets the height and position of the volume progress bar using Renderer2.
   * @param progressHeight Height in rem
   * @param padding Padding in rem
   */
  setVolumeProgress(progressHeight: number, padding: number): void {
    const volumeProgress = document.querySelector('.volume-progress') as HTMLElement;
    if (volumeProgress) {
      this.renderer.setStyle(volumeProgress, 'height', `${progressHeight}rem`);
      this.renderer.setStyle(volumeProgress, 'bottom', `${padding}rem`);
    }
  }

  /**
   * Sets the position of the volume handle using Renderer2.
   * @param position Position in rem
   */
  setVolumeHandlePosition(position: number): void {
    const volumeHandle = document.querySelector('.volume-handle') as HTMLElement;
    if (volumeHandle) this.renderer.setStyle(volumeHandle, 'bottom', `${position}rem`);
  }

  /**
   * Updates the position and visibility of the volume tooltip.
   * @param event Mouse event
   */
  updateVolumeTooltip(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = event.clientY - rect.top;

    this.playerState.setVolumeTooltipPosition(y);
    this.playerState.setShowVolumeTooltip(true);
  }

  /**
   * Hides the volume tooltip.
   */
  hideVolumeTooltip(): void {
    this.playerState.setShowVolumeTooltip(false);
  }

  /**
   * Shows volume control when mouse enters container.
   */
  onVolumeContainerEnter(): void {
    this.playerState.setShowVolumeControl(true);
    this.clearVolumeHideTimeout();
  }

  /**
   * Hides volume control when mouse leaves container (unless dragging).
   */
  onVolumeContainerLeave(): void {
    if (!this.isDragging) this.hideVolumeControlDelayed();
  }

  /**
   * Shows volume control when touch starts on slider.
   */
  onTouchStartSlider(): void {
    this.playerState.setShowVolumeControl(true);
  }

  /**
   * Returns the current volume (0-1).
   */
  get volume(): number {
    return this.playerState.volume();
  }

  /**
   * Returns true if the player is muted.
   */
  get isMuted(): boolean {
    return this.playerState.isMuted();
  }

  /**
   * Returns true if the volume control is visible.
   */
  get showVolumeControl(): boolean {
    return this.playerState.showVolumeControl();
  }

  /**
   * Returns the current volume as a percentage (0-100).
   */
  get volumePercentage(): number {
    return Math.round(this.playerState.volume() * 100);
  }
}
