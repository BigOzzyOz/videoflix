import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Profile } from '../models/profile';
import { DialogData } from '../interfaces/dialog-data';


@Injectable({
  providedIn: 'root'
})
/**
 * Service for managing profile selection, creation, and editing dialogs using reactive state.
 */
export class DialogService {
  private profileSelectionVisible$ = new BehaviorSubject<boolean>(false);
  private profileSelectionData$ = new BehaviorSubject<DialogData | null>(null);
  private profileSelectionResult$ = new BehaviorSubject<Profile | null>(null);
  private confirmDialogVisible$ = new BehaviorSubject<boolean>(false);
  private confirmDialogData$ = new BehaviorSubject<{ title: string, message: string } | null>(null);
  private confirmDialogResult: ((result: boolean) => void) | null = null;


  constructor() { }

  /**
   * Observable for dialog visibility state.
   */
  get isProfileSelectionVisible(): Observable<boolean> {
    return this.profileSelectionVisible$.asObservable();
  }

  /**
   * Observable for dialog data (profiles, mode, etc.).
   */
  get profileSelectionData(): Observable<DialogData | null> {
    return this.profileSelectionData$.asObservable();
  }

  /**
   * Observable for selected profile result.
   */
  get profileSelectionResult(): Observable<Profile | null> {
    return this.profileSelectionResult$.asObservable();
  }

  /**
   * Opens the profile selection dialog.
   * @param profiles List of profiles to select from.
   * @returns Promise resolving with selected profile.
   */
  openProfileSelection(profiles: Profile[]): Promise<Profile> {
    return this.openProfileDialog({ profiles, mode: 'select' });
  }

  /**
   * Opens the profile creation dialog.
   * @returns Promise resolving with created profile.
   */
  openProfileCreate(): Promise<Profile> {
    return this.openProfileDialog({ mode: 'create' });
  }

  /**
   * Opens the profile editing dialog.
   * @param profile Profile to edit.
   * @returns Promise resolving with edited profile.
   */
  openProfileEdit(profile: Profile): Promise<Profile> {
    return this.openProfileDialog({ mode: 'edit', profileToEdit: profile });
  }

  /**
   * Öffnet einen Profil-Dialog und gibt ein Promise zurück, das mit dem ausgewählten Profil aufgelöst wird.
   * @param data Dialog-Daten (Modus, Profile, zu bearbeitendes Profil)
   * @returns Promise, das mit dem ausgewählten Profil aufgelöst wird.
   */
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

  /**
   * Selects a profile and resolves the dialog promise.
   * @param profile Selected profile.
   */
  selectProfile(profile: Profile): void {
    this.profileSelectionResult$.next(profile);
  }

  /**
   * Closes the profile dialog and resets all dialog state.
   */
  closeProfileSelection(): void {
    this.profileSelectionVisible$.next(false);
    this.profileSelectionData$.next(null);
    this.profileSelectionResult$.next(null);
  }

  get isConfirmDialogVisible(): Observable<boolean> {
    return this.confirmDialogVisible$.asObservable();
  }

  get confirmDialogData(): Observable<{ title: string, message: string } | null> {
    return this.confirmDialogData$.asObservable();
  }

  openConfirmationDialog(dialogData: { title: string, message: string }): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmDialogData$.next(dialogData);
      this.confirmDialogVisible$.next(true);
      this.confirmDialogResult = (result: boolean) => {
        this.confirmDialogVisible$.next(false);
        this.confirmDialogData$.next(null);
        this.confirmDialogResult = null;
        resolve(result);
      };
    });
  }

  // Diese Methode rufst du aus dem ConfirmDialogComponent auf:
  confirmDialogResponse(result: boolean) {
    if (this.confirmDialogResult) {
      this.confirmDialogResult(result);
    }
  }
}
