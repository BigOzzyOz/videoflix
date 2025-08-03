import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  @Output() seek = new EventEmitter<number>();

  onSeek(): void {
    const seekValue = this.direction === 'forward' ? this.seconds : -this.seconds;
    this.seek.emit(seekValue);
  }

  get buttonClass(): string {
    return this.direction === 'forward' ? 'vjs-seek-forward' : 'vjs-seek-back';
  }
}
