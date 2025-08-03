import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-play-button',
  imports: [CommonModule],
  templateUrl: './play-button.component.html',
  styleUrl: './play-button.component.scss'
})
export class PlayButtonComponent {
  @Input() isPlaying = false;
  @Output() playToggle = new EventEmitter<void>();

  onTogglePlay(): void {
    this.playToggle.emit();
  }
}
