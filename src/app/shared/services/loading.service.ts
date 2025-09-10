import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for managing global loading state in the application.
 */
export class LoadingService {
  private _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  constructor() { }

  /**
   * Sets the loading state.
   * @param loading True if loading, false otherwise
   */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }
}
