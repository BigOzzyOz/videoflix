import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayButtonComponent } from '../sub/play-button/play-button.component';
import { SeekButtonComponent } from '../sub/seek-button/seek-button.component';
import { VolumeControlComponent } from '../sub/volume-control/volume-control.component';
import { VideoTitleComponent } from '../sub/video-title/video-title.component';
import { SpeedControlComponent } from '../sub/speed-control/speed-control.component';
import { FullscreenButtonComponent } from '../sub/fullscreen-button/fullscreen-button.component';
import { ProgressBarComponent } from '../sub/progress-bar/progress-bar.component';
import { QualityControlComponent } from '../sub/quality-control/quality-control.component';

/**
 * UI wrapper for the player bottom bar controls.
 */
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
    ProgressBarComponent,
    QualityControlComponent
  ],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss'
})
export class BottomBarComponent {
}
