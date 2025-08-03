import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-speed-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speed-control.component.html',
  styleUrls: ['./speed-control.component.scss']
})
export class SpeedControlComponent {
  @Input() playbackSpeed = 1;
  @Input() showSpeedMenu = false;

  @Output() speedChange = new EventEmitter<number>();
  @Output() speedMenuToggle = new EventEmitter<void>();

  // Direkt in der Komponente definieren
  readonly SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];

  onToggleSpeedMenu(): void {
    this.speedMenuToggle.emit();
  }

  onSelectSpeed(speed: number): void {
    this.speedChange.emit(speed);
  }
}
