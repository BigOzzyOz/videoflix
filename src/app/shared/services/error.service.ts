import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for displaying and managing error messages in the application.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  errorMessage$ = new BehaviorSubject<string | null>(null);
  errorTimer: number | null = null;

  TIME_OUT: number = 5000;

  constructor() { }

  /**
   * Shows an error message extracted from the response and hides it after 5 seconds.
   * @param response Error response (string, array, object, etc.)
   */
  show(response: any): void {
    let message = 'An unexpected error occurred. Please try again later.';
    message = this.extractErrorMessage(response);
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }
    this.errorMessage$.next(message);
    this.errorTimer = setTimeout(() => this.errorMessage$.next(null), this.TIME_OUT);
  }

  /**
   * Extracts a user-friendly error message from various response formats.
   * @param response Error response
   * @returns Error message string
   */
  private extractErrorMessage(response: any): string {
    let message = 'An unexpected error occurred. Please try again later.';
    const data = response?.error || response?.data || response;
    if (typeof response === 'string') message = response;
    else if (typeof data === 'string') message = data;
    else if (Array.isArray(data)) message = data[0];
    else if (typeof data === 'object' && data !== null) {
      if (data.detail) message = data.detail;
      else message = this.extractFirstError(data) || message;
    }
    return message;
  }

  /**
   * Extracts the first error message from an object, supporting arrays and strings.
   * Used to get a user-friendly error from typical backend error responses like { field: ['error'] }.
   * @param data Error object
   * @returns First error message as string, or undefined if not found
   */
  private extractFirstError(data: any): string | undefined {
    const firstKey = Object.keys(data)[0];
    const firstError = data[firstKey];
    if (Array.isArray(firstError)) return firstError[0];
    if (typeof firstError === 'string') return firstError;
    return undefined;
  }

  /**
   * Clears the current error message and stops the timer.
   */
  clear(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }
    this.errorMessage$.next(null);
  }
}
