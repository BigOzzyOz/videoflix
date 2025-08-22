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
export class OrientationWarningComponent {
  public orientationService = inject(OrientationService);
  @Input() message: string = 'Please rotate your device for the best experience';
  @Input() showOnlyOnMobile: boolean = true;
  @Input() requiredOrientation: OrientationMode = 'landscape';

  constructor() { }

  get shouldShow(): boolean {
    if (this.showOnlyOnMobile && window.innerWidth >= 768) {
      return false;
    }

    if (this.requiredOrientation === 'landscape') {
      return this.orientationService.isPortrait;
    } else {
      return this.orientationService.isLandscape;
    }
  }

  get orientationIcon(): string {
    return this.requiredOrientation === 'landscape' ? 'landscape' : 'portrait';
  }
}
