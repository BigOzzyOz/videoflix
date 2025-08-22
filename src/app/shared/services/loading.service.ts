import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _loading = signal<boolean>(false);

  readonly loading = this._loading.asReadonly();

  constructor() { }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }
}
