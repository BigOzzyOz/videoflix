import { Component } from '@angular/core';
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
/**
 * UI wrapper for the player center controls (play/pause, seek, etc.).
 */
export class CenterControlsComponent {
}
