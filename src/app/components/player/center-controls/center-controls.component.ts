import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayButtonComponent } from '../sub/play-button/play-button.component';
import { SeekButtonComponent } from '../sub/seek-button/seek-button.component';

@Component({
  selector: 'app-center-controls',
  standalone: true,
  imports: [
    CommonModule,
    PlayButtonComponent,
    SeekButtonComponent
  ],
  templateUrl: './center-controls.component.html',
  styleUrl: './center-controls.component.scss'
})
export class CenterControlsComponent {
  // Inputs
  @Input() isPlaying = false;

  // Outputs
  @Output() playToggle = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();

  // Event Handler Methoden
  onTogglePlay(): void {
    this.playToggle.emit();
  }

  onTimeJump(seconds: number): void {
    this.seek.emit(seconds);
  }
}
