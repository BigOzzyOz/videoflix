import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayButtonComponent } from '../sub/play-button/play-button.component';
import { SeekButtonComponent } from '../sub/seek-button/seek-button.component';
import { PlayerStateService } from '../../../shared/services/player-state.service';

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
  playerState = inject(PlayerStateService);
}
