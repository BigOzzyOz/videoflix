import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

@Component({
  selector: 'app-video-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vjs-title">
      {{ playerState.title() }}
    </div>
  `,
  styleUrl: './video-title.component.scss'
})
export class VideoTitleComponent {
  playerState = inject(PlayerStateService);
}
