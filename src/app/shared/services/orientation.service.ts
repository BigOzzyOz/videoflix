import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
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

    fromEvent(window, 'resize')
      .pipe(
        map(() => this.checkIsPortrait())
      )
      .subscribe(isPortrait => {
        this.isPortraitSubject.next(isPortrait);
      });
  }

  private checkIsPortrait(): boolean {
    return window.innerHeight > window.innerWidth;
  }

  get isPortrait(): boolean {
    return this.isPortraitSubject.value;
  }

  get isLandscape(): boolean {
    return !this.isPortrait;
  }
}
