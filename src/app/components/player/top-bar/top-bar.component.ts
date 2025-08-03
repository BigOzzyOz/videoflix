import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoTitleComponent } from '../sub/video-title/video-title.component';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    VideoTitleComponent
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  // Inputs
  @Input() title: string | undefined = '';
  @Input() isOptimizing = false;

  // Outputs
  @Output() backClick = new EventEmitter<void>();

  // Event Handler Methoden
  toMain(): void {
    this.backClick.emit();
  }
}
