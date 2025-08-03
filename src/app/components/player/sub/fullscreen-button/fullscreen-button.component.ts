import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fullscreen-button',
  imports: [CommonModule],
  templateUrl: './fullscreen-button.component.html',
  styleUrl: './fullscreen-button.component.scss'
})
export class FullscreenButtonComponent {
  @Input() isFullscreen = false;
  @Output() fullscreenToggle = new EventEmitter<void>();

  onToggleFullscreen(): void {
    this.fullscreenToggle.emit();
  }
}
