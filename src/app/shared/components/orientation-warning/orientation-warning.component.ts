import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrientationService } from '../../services/orientation.service';

export type OrientationMode = 'portrait' | 'landscape';

@Component({
  selector: 'app-orientation-warning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orientation-warning.component.html',
  styleUrl: './orientation-warning.component.scss'
})
/**
 * OrientationWarningComponent displays a warning if the device orientation does not match the required orientation.
 * It supports custom messages and mobile-only display.
 */
export class OrientationWarningComponent {
  public orientationService = inject(OrientationService);
  @Input() message: string = 'Please rotate your device for the best experience';
  @Input() showOnlyOnMobile: boolean = true;
  @Input() requiredOrientation: OrientationMode = 'landscape';

  constructor() { }

  /**
   * Determines if the warning should be shown based on device and orientation.
   */
  get shouldShow(): boolean {
    if (this.showOnlyOnMobile && window.innerWidth >= 768) return false;
    if (this.requiredOrientation === 'landscape') return this.orientationService.isPortrait;
    else return this.orientationService.isLandscape;
  }

  /**
   * Returns the icon type for the current required orientation.
   */
  get orientationIcon(): string {
    return this.requiredOrientation === 'landscape' ? 'landscape' : 'portrait';
  }
}
