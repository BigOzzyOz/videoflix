import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  errorMessage$ = new BehaviorSubject<string | null>(null);
  errorTimer: number | null = null;

  constructor() { }


  show(response: any): void {
    let message = 'An unexpected error occurred. Please try again later.';

    const data = response?.error || response?.data || response;


    if (typeof response === 'string') {
      message = response;
    } else if (typeof data === 'string') {
      message = data;
    } else if (Array.isArray(data)) {
      message = data[0];
    } else if (typeof data === 'object' && data !== null) {
      if (data.detail) {
        message = data.detail;
      } else {
        const firstKey = Object.keys(data)[0];
        const firstError = data[firstKey];
        if (Array.isArray(firstError)) {
          message = firstError[0];
        } else if (typeof firstError === 'string') {
          message = firstError;
        }
      }
    }

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
