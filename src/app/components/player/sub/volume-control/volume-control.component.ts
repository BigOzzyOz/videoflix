import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

@Component({
  selector: 'app-volume-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volume-control.component.html',
  styleUrl: './volume-control.component.scss'
})
export class VolumeControlComponent implements AfterViewInit {
  playerState = inject(PlayerStateService);

  private isDragging = false;
  private volumeHideTimeout: any = null;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateVolumeHandlePosition();
    }, 100);
  }

  get volumePercentage(): number {
    return Math.round(this.playerState.volume() * 100);
  }

  onTouchStart(): void {
    console.log('Volume touch start - opening control');
    this.playerState.setShowVolumeControl(true);
  }

  onToggleSound(): void {
    const player = this.playerState.player;
    if (player) {
      if (player.muted() || this.playerState.volume() === 0) {
        player.muted(false);
        this.playerState.setIsMuted(false);
        this.playerState.setVolume(this.playerState.volume() > 0 ? this.playerState.volume() : 0.5);
      } else {
        player.muted(true);
        this.playerState.setIsMuted(true);
      }
    }
    // Bei Touch auch Volume Control anzeigen
    this.playerState.setShowVolumeControl(true);

    // Volume Handle Position updaten
    setTimeout(() => this.updateVolumeHandlePosition(), 50);
  }

  hideVolumeControlDelayed(): void {
    // Nur verstecken wenn nicht gedraggt wird
    if (!this.isDragging) {
      this.clearVolumeHideTimeout();
      this.volumeHideTimeout = setTimeout(() => {
        console.log('⏰ HIDING VOLUME CONTROL');
        this.playerState.setShowVolumeControl(false);
        this.playerState.setShowVolumeTooltip(false);
      }, 1500);
    }
  }

  clearVolumeHideTimeout(): void {
    if (this.volumeHideTimeout) {
      clearTimeout(this.volumeHideTimeout);
      this.volumeHideTimeout = null;
      console.log('❌ CLEAR TIMEOUT');
    }
  }

  setVolumeFromClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('volume-handle')) {
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height))); // 1 - y weil Volume von unten nach oben geht

    const player = this.playerState.player;
    if (player) {
      player.volume(percentage);
      this.playerState.setVolume(percentage);
    }

    // Volume Handle Position updaten
    this.updateVolumeHandlePosition();

    this.playerState.setShowVolumeTooltip(true);
    setTimeout(() => {
      this.playerState.setShowVolumeTooltip(false);
    }, 1000);
  }

  setVolumeFromTouch(event: TouchEvent): void {
    console.log('Volume touch click');
    const touch = event.touches[0];
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = touch.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height))); // 1 - y weil Volume von unten nach oben geht

    const player = this.playerState.player;
    if (player) {
      player.volume(percentage);
      this.playerState.setVolume(percentage);
    }

    // Volume Handle Position updaten
    this.updateVolumeHandlePosition();

    this.playerState.setShowVolumeTooltip(true);
    setTimeout(() => {
      this.playerState.setShowVolumeTooltip(false);
    }, 1000);
  }

  startVolumeDrag(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // WICHTIG: Dragging-State setzen
    this.isDragging = true;

    this.playerState.setShowVolumeTooltip(true);
    this.playerState.setShowVolumeControl(true);

    // Alle Hide-Timer löschen während Drag
    this.clearVolumeHideTimeout();

    console.log('Volume drag started', event.type);

    const isTouch = event.type === 'touchstart';
    const handle = event.target as HTMLElement;
    const track = handle.closest('.volume-track') as HTMLElement;

    if (!track) {
      console.log('No volume track found');
      return;
    }

    const rect = track.getBoundingClientRect();
    handle.classList.add('dragging');

    if (isTouch) {
      this.handleTouchDrag(event as TouchEvent, rect, handle);
    } else {
      this.handleMouseDrag(event as MouseEvent, rect, handle);
    }
  }

  private handleMouseDrag(event: MouseEvent, rect: DOMRect, handle: HTMLElement): void {
    const onMouseMove = (e: MouseEvent) => {
      const y = e.clientY - rect.top;
      const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));
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
      const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));
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

  private setVolumeAndUpdate(percentage: number): void {
    console.log('Setting volume to:', percentage);
    const player = this.playerState.player;
    if (player) {
      player.volume(percentage);
      this.playerState.setVolume(percentage);
    }
    this.updateVolumeHandlePosition();
  }

  private endDrag(handle: HTMLElement): void {
    console.log('Volume drag ended');

    // WICHTIG: Dragging-State zurücksetzen
    this.isDragging = false;

    handle.classList.remove('dragging');

    // Tooltip nach kurzer Zeit verstecken
    setTimeout(() => {
      this.playerState.setShowVolumeTooltip(false);
    }, 1000);

    // Volume Control nach längerer Zeit verstecken (nur wenn nicht gehovered)
    this.hideVolumeControlDelayed();
  }

  // Die ursprüngliche updateVolumeHandlePosition Methode hierher verschieben
  private updateVolumeHandlePosition(): void {
    const trackHeight = 14; // rem
    const handleHeight = 1.6; // rem  
    const padding = 1; // rem
    const availableHeight = trackHeight - handleHeight; // 12.4rem

    const volume = this.playerState.volume();
    const position = padding + (availableHeight * volume); // Handle Position von unten
    const progressHeight = trackHeight * volume; // Progress Höhe von unten

    // Volume Progress updaten (von unten nach oben)
    const volumeProgress = document.querySelector('.volume-progress') as HTMLElement;
    if (volumeProgress) {
      volumeProgress.style.height = `${progressHeight}rem`;
      volumeProgress.style.bottom = `${padding}rem`; // bottom statt top!
      console.log('Volume progress height set to:', progressHeight);
    }

    // Volume Handle updaten (von unten nach oben)
    const volumeHandle = document.querySelector('.volume-handle') as HTMLElement;
    if (volumeHandle) {
      volumeHandle.style.bottom = `${position}rem`; // bottom statt top!
      console.log('Volume handle position set to:', position);
    }
  }

  // HINZUFÜGEN: Volume Tooltip Methoden
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

  // Mouse Enter auf Volume Container
  onVolumeContainerEnter(): void {
    this.playerState.setShowVolumeControl(true);
    this.clearVolumeHideTimeout();
  }

  // Mouse Leave auf Volume Container
  onVolumeContainerLeave(): void {
    if (!this.isDragging) {
      this.hideVolumeControlDelayed();
    }
  }
}
