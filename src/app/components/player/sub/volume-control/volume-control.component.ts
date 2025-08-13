import { Component, inject, AfterViewInit } from '@angular/core';
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
export class VolumeControlComponent implements AfterViewInit {
  playerState = inject(PlayerStateService);
  volumeService = inject(VolumeService);

  private isDragging = false;
  private volumeHideTimeout: any = null;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateVolumeHandlePosition();
    }, 100);
  }


  onTouchStart(): void {
    this.playerState.setShowVolumeControl(true);
  }

  onToggleSound(): void {
    this.volumeService.toggleSound();

    this.playerState.setShowVolumeControl(true);

    setTimeout(() => this.updateVolumeHandlePosition(), 50);
  }

  hideVolumeControlDelayed(): void {
    if (!this.isDragging) {
      this.clearVolumeHideTimeout();
      this.volumeHideTimeout = setTimeout(() => {
        this.playerState.setShowVolumeControl(false);
        this.playerState.setShowVolumeTooltip(false);
      }, 1500);
    }
  }

  clearVolumeHideTimeout(): void {
    if (this.volumeHideTimeout) {
      clearTimeout(this.volumeHideTimeout);
      this.volumeHideTimeout = null;
    }
  }

  setVolumeFromClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('volume-handle')) {
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));

    this.setVolumeAndUpdate(percentage);

    this.playerState.setShowVolumeTooltip(true);
    setTimeout(() => {
      this.playerState.setShowVolumeTooltip(false);
    }, 1000);
  }

  setVolumeFromTouch(event: TouchEvent): void {
    const touch = event.touches[0];
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = touch.clientY - rect.top;
    const percentage = this.calcVolumePercentage(y, rect);

    this.setVolumeAndUpdate(percentage);

    this.playerState.setShowVolumeTooltip(true);
    setTimeout(() => {
      this.playerState.setShowVolumeTooltip(false);
    }, 1000);
  }

  startVolumeDrag(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;

    this.playerState.setShowVolumeTooltip(true);
    this.playerState.setShowVolumeControl(true);

    this.clearVolumeHideTimeout();

    const isTouch = event.type === 'touchstart';
    const handle = event.target as HTMLElement;
    const track = handle.closest('.volume-track') as HTMLElement;

    if (!track) return;

    const rect = track.getBoundingClientRect();
    handle.classList.add('dragging');

    if (isTouch) this.handleTouchDrag(event as TouchEvent, rect, handle);
    else this.handleMouseDrag(event as MouseEvent, rect, handle);
  }

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

  private calcVolumePercentage(y: number, rect: DOMRect): number {
    return Math.max(0, Math.min(1, 1 - (y / rect.height)));
  }

  private setVolumeAndUpdate(percentage: number): void {
    this.volumeService.setVolume(percentage);
    this.updateVolumeHandlePosition();
  }

  private endDrag(handle: HTMLElement): void {
    this.isDragging = false;

    handle.classList.remove('dragging');

    setTimeout(() => {
      this.playerState.setShowVolumeTooltip(false);
    }, 1000);

    this.hideVolumeControlDelayed();
  }

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

  setVolumeProgress(progressHeight: number, padding: number): void {
    const volumeProgress = document.querySelector('.volume-progress') as HTMLElement;
    if (volumeProgress) {
      volumeProgress.style.height = `${progressHeight}rem`;
      volumeProgress.style.bottom = `${padding}rem`;
    }
  }

  setVolumeHandlePosition(position: number): void {
    const volumeHandle = document.querySelector('.volume-handle') as HTMLElement;
    if (volumeHandle) {
      volumeHandle.style.bottom = `${position}rem`;
    }
  }

  updateVolumeTooltip(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = event.clientY - rect.top;

    this.playerState.setVolumeTooltipPosition(y);
    this.playerState.setShowVolumeTooltip(true);
  }

  hideVolumeTooltip(): void {
    this.playerState.setShowVolumeTooltip(false);
  }

  onVolumeContainerEnter(): void {
    this.playerState.setShowVolumeControl(true);
    this.clearVolumeHideTimeout();
  }

  onVolumeContainerLeave(): void {
    if (!this.isDragging) {
      this.hideVolumeControlDelayed();
    }
  }

  onTouchStartSlider(): void {
    this.playerState.setShowVolumeControl(true);
  }

  get volume(): number {
    return this.playerState.volume();
  }

  get isMuted(): boolean {
    return this.playerState.isMuted();
  }

  get showVolumeControl(): boolean {
    return this.playerState.showVolumeControl();
  }

  get volumePercentage(): number {
    return Math.round(this.playerState.volume() * 100);
  }
}
