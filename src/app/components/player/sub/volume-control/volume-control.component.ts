import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-volume-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volume-control.component.html',
  styleUrl: './volume-control.component.scss'
})
export class VolumeControlComponent {
  @Input() volume = 0.5;
  @Input() isMuted = false;
  @Input() showVolumeControl = false;
  @Input() showVolumeTooltip = false;

  @Output() toggleSound = new EventEmitter<void>();
  @Output() showVolumeControlChange = new EventEmitter<boolean>();
  @Output() volumeControlDelayed = new EventEmitter<void>();
  @Output() clearVolumeTimeout = new EventEmitter<void>();
  @Output() volumeClick = new EventEmitter<MouseEvent>();
  @Output() volumeDragStart = new EventEmitter<MouseEvent>();

  get volumePercentage(): number {
    return Math.round(this.volume * 100);
  }

  onToggleSound(): void {
    this.toggleSound.emit();
  }

  hideVolumeControlDelayed(): void {
    this.volumeControlDelayed.emit();
  }

  clearVolumeHideTimeout(): void {
    this.clearVolumeTimeout.emit();
  }

  setVolumeFromClick(event: MouseEvent): void {
    this.volumeClick.emit(event);
  }

  startVolumeDrag(event: MouseEvent): void {
    this.volumeDragStart.emit(event);
  }
}
