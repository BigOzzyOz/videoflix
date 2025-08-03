import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VideoTitleComponent } from '../sub/video-title/video-title.component';
import { PlayerStateService } from '../../../shared/services/player-state.service';

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
  private router = inject(Router);
  playerState = inject(PlayerStateService);

  goBack(): void {
    this.router.navigate(['/main']);
  }
}
