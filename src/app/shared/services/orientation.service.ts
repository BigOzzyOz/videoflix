import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for detecting and reacting to device orientation changes.
 */
export class OrientationService {
  private isPortraitSubject = new BehaviorSubject<boolean>(this.checkIsPortrait());
  public isPortrait$ = this.isPortraitSubject.asObservable();

  constructor() {

    fromEvent(window, 'orientationchange')
      .pipe(
        startWith(null),
        map(() => this.checkIsPortrait())
      )
      .subscribe(isPortrait => {
        this.isPortraitSubject.next(isPortrait);
      });

    // Listen for window resize and update state
    fromEvent(window, 'resize')
      .pipe(
        map(() => this.checkIsPortrait())
      )
      .subscribe(isPortrait => {
        this.isPortraitSubject.next(isPortrait);
      });
  }

  /**
   * Checks if the device is currently in portrait mode.
   * @returns True if portrait, false otherwise
   */
  private checkIsPortrait(): boolean {
    return window.innerHeight > window.innerWidth;
  }

  /**
   * Returns true if device is in portrait mode.
   */
  get isPortrait(): boolean {
    return this.isPortraitSubject.value;
  }

  /**
   * Returns true if device is in landscape mode.
   */
  get isLandscape(): boolean {
    return !this.isPortrait;
  }
}
