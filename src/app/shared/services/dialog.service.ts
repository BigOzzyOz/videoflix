import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Profile } from '../models/profile';

export interface DialogData {
  profiles?: Profile[];
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private profileSelectionVisible$ = new BehaviorSubject<boolean>(false);
  private profileSelectionData$ = new BehaviorSubject<DialogData | null>(null);
  private profileSelectionResult$ = new BehaviorSubject<Profile | null>(null);

  constructor() { }

  get isProfileSelectionVisible(): Observable<boolean> {
    return this.profileSelectionVisible$.asObservable();
  }

  get profileSelectionData(): Observable<DialogData | null> {
    return this.profileSelectionData$.asObservable();
  }

  get profileSelectionResult(): Observable<Profile | null> {
    return this.profileSelectionResult$.asObservable();
  }

  openProfileSelection(profiles: Profile[]): Promise<Profile> {
    return new Promise((resolve, reject) => {
      this.profileSelectionData$.next({ profiles });
      this.profileSelectionVisible$.next(true);

      // Subscribe to result and resolve when profile is selected
      const subscription = this.profileSelectionResult$.subscribe(profile => {
        if (profile) {
          subscription.unsubscribe();
          this.closeProfileSelection();
          resolve(profile);
        }
      });
    });
  }

  selectProfile(profile: Profile): void {
    this.profileSelectionResult$.next(profile);
  }

  closeProfileSelection(): void {
    this.profileSelectionVisible$.next(false);
    this.profileSelectionData$.next(null);
    this.profileSelectionResult$.next(null);
  }
}
