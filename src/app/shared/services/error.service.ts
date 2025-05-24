import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  errorMessage$ = new BehaviorSubject<string | null>(null);
  errorTimer: number | null = null;

  constructor() { }

  show(message: string): void {
    this.errorMessage$.next(message);
    this.errorTimer = setTimeout(() => {
      this.errorMessage$.next(null);
    }, 5000);
  }

  clear(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }
    this.errorMessage$.next(null);
  }
}
