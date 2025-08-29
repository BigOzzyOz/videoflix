import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Profile } from '../models/profile';
import { DialogData } from '../interfaces/dialog-data';


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
    return this.openProfileDialog({ profiles, mode: 'select' });
  }

  openProfileCreate(): Promise<Profile> {
    return this.openProfileDialog({ mode: 'create' });
  }

  openProfileEdit(profile: Profile): Promise<Profile> {
    return this.openProfileDialog({ mode: 'edit', profileToEdit: profile });
  }

  private openProfileDialog(data: DialogData): Promise<Profile> {
    return new Promise((resolve) => {
      this.profileSelectionData$.next(data);
      this.profileSelectionVisible$.next(true);

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
