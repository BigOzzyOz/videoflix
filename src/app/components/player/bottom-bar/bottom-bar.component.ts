import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayButtonComponent } from '../sub/play-button/play-button.component';
import { SeekButtonComponent } from '../sub/seek-button/seek-button.component';
import { VolumeControlComponent } from '../sub/volume-control/volume-control.component';
import { VideoTitleComponent } from '../sub/video-title/video-title.component';
import { SpeedControlComponent } from '../sub/speed-control/speed-control.component';
import { FullscreenButtonComponent } from '../sub/fullscreen-button/fullscreen-button.component';
import { ProgressBarComponent } from '../sub/progress-bar/progress-bar.component';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [
    CommonModule,
    PlayButtonComponent,
    SeekButtonComponent,
    VolumeControlComponent,
    VideoTitleComponent,
    SpeedControlComponent,
    FullscreenButtonComponent,
    ProgressBarComponent
  ],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss'
})
export class BottomBarComponent {
  // Play Button Inputs
  @Input() isPlaying = false;

  // Volume Control Inputs
  @Input() volume = 0.5;
  @Input() isMuted = false;
  @Input() showVolumeControl = false;
  @Input() showVolumeTooltip = false;

  // Video Title Input
  @Input() title: string | undefined = '';

  // Speed Control Inputs
  @Input() playbackSpeed = 1;
  @Input() showSpeedMenu = false;

  // Progress Bar Inputs
  @Input() progressTime = 0;
  @Input() videoDuration = 0;
  @Input() isScrubbing = false;

  // Play Button Output
  @Output() playToggle = new EventEmitter<void>();

  // Seek Button Output
  @Output() seek = new EventEmitter<number>();

  // Volume Control Outputs
  @Output() toggleSound = new EventEmitter<void>();
  @Output() showVolumeControlChange = new EventEmitter<boolean>();
  @Output() volumeControlDelayed = new EventEmitter<void>();
  @Output() clearVolumeTimeout = new EventEmitter<void>();
  @Output() volumeClick = new EventEmitter<MouseEvent>();
  @Output() volumeDragStart = new EventEmitter<MouseEvent>();

  // Speed Control Outputs
  @Output() speedChange = new EventEmitter<number>();
  @Output() speedMenuToggle = new EventEmitter<void>();

  // Progress Bar Outputs
  @Output() seekStart = new EventEmitter<void>();
  @Output() scrubbing = new EventEmitter<Event>();
  @Output() seekEnd = new EventEmitter<Event>();

  // Methoden für Template
  onTogglePlay(): void {
    this.playToggle.emit();
  }

  onTimeJump(seconds: number): void {
    this.seek.emit(seconds);
  }
}
