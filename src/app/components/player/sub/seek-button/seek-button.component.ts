import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';
import { SeekService } from '../../../../shared/services/seek.service';

@Component({
  selector: 'app-seek-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seek-button.component.html',
  styleUrls: ['./seek-button.component.scss']
})
export class SeekButtonComponent {
  @Input() direction: 'forward' | 'back' = 'forward';
  @Input() seconds: number = 10;

  playerState = inject(PlayerStateService);
  seekService = inject(SeekService);

  onSeek(): void {
    const seekValue = this.direction === 'forward' ? this.seconds : -this.seconds;
    this.seekService.seekBy(seekValue);
  }

  get buttonClass(): string {
    return this.direction === 'forward' ? 'vjs-seek-forward' : 'vjs-seek-back';
  }
}
