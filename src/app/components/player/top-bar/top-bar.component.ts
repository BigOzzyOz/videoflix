import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoTitleComponent } from '../sub/video-title/video-title.component';
import { PlayerStateService } from '../../../shared/services/player-state.service';
import { NavigationService } from '../../../shared/services/navigation.service';

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
  navigate = inject(NavigationService)
  playerState = inject(PlayerStateService);

  goBack(): void {
    this.navigate.goBack();
  }

  get isOptimizing(): boolean {
    return this.playerState.isOptimizing();
  }
}
