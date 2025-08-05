import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

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

  onSeek(): void {
    const seekValue = this.direction === 'forward' ? this.seconds : -this.seconds;

    console.log(`Seeking ${this.direction} by ${this.seconds} seconds`);

    // PlayerStateService seekBy Methode nutzen (die wir hinzufügen)
    this.playerState.seekBy(seekValue);
  }

  get buttonClass(): string {
    return this.direction === 'forward' ? 'vjs-seek-forward' : 'vjs-seek-back';
  }
}
