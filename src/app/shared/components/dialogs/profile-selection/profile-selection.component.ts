import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../../services/dialog.service';
import { Profile } from '../../../models/profile';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ErrorService } from '../../../services/error.service';
import { ApiResponse } from '../../../models/api-response';

@Component({
  selector: 'app-profile-selection',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-selection.component.html',
  styleUrl: './profile-selection.component.scss'
})
/**
 * Dialog component for selecting, creating, editing, and deleting user profiles.
 * Handles profile picture upload, form validation, and dialog visibility.
 */
export class ProfileSelectionComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  api = inject(ApiService);
  errorService = inject(ErrorService);
  fb = inject(FormBuilder);

  profiles: Profile[] = [];
  isVisible = false;
  mode: 'select' | 'create' | 'edit' = 'select';
  profileToEdit: Profile | null = null;
  private subscriptions: Subscription[] = [];
  profilesFull: boolean = false;
  private MAX_PROFILES = 4;
  createProfileForm: FormGroup;

  profilePicPreview: string | null = null;
  profilePicFile: File | null = null;

  /**
   * Initializes the profile creation form.
   */
  constructor() {
    this.createProfileForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(20),
        Validators.minLength(1),
        Validators.pattern(/^(?!\s*$).+/)
      ]],
      kid: [false]
    });
  }

  /**
   * Subscribes to dialog visibility and profile data on init.
   */
  ngOnInit() {
    this.subscriptions.push(
      this.dialogService.isProfileSelectionVisible.subscribe(visible => {
        this.isVisible = visible;
      })
    );

    this.subscriptions.push(
      this.dialogService.profileSelectionData.subscribe(data => {
        if (data) {
          this.mode = data.mode ?? 'select';
          this.profileToEdit = data.profileToEdit ?? null;
          this.profiles = data.profiles ?? [];
          this.profilesFull = this.profiles.length >= this.MAX_PROFILES;
        }
      })
    );
  }

  /**
   * Unsubscribes from all subscriptions and resets form and preview on destroy.
   */
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.profilePicPreview) {
      URL.revokeObjectURL(this.profilePicPreview);
    }
    this.profilePicFile = null;
    this.profilePicPreview = null;
    this.createProfileForm.reset();
  }

  /**
   * Opens the create profile dialog.
   */
  openCreateProfile(): void {
    this.dialogService.openProfileCreate();
  }

  /**
   * Handles profile picture upload and sets preview.
   * @param event File input change event
   */
  onProfilePicUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.profilePicFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicPreview = reader.result as string;
      };
      reader.readAsDataURL(this.profilePicFile);
    }
  }

  /**
   * Creates a new profile using the form values and uploaded picture.
   * @param formValue Form values
   */
  async createProfile(formValue: any): Promise<void> {
    if (this.createProfileForm.invalid) {
      this.createProfileForm.markAllAsTouched();
      return;
    }
    const name = formValue.name.trim();
    const isKid = formValue.kid || false;
    try {
      const response = await this.api.createUserProfile(name, isKid, this.profilePicFile || undefined);
      if (response.isSuccess() && response.data) this.handleProfileCreation(response);
      else this.errorService.show(response);
    } catch (error) {
      this.errorService.show('Error creating profile. Please try again later.');
    };
  }

  /**
   * Handles logic after successful profile creation (updates user and closes dialog).
   * @param response API response containing new profile data
   */
  private handleProfileCreation(response: ApiResponse): void {
    const newProfile = new Profile(response.data);
    const user = this.api.CurrentUser;
    user.profiles.push(newProfile);
    this.api.CurrentUser = user;
    this.closeCreateDialog();
  }

  /**
   * Edits an existing profile using the form values and uploaded picture.
   * @param formValue Form values
   */
  async editProfile(formValue: any): Promise<void> {
    if (this.createProfileForm.invalid || !this.profileToEdit) {
      this.createProfileForm.markAllAsTouched();
      return Promise.resolve();
    }
    const name = formValue.name.trim();
    const isKid = formValue.kid || false;
    try {
      const response = await this.api.editUserProfile(this.profileToEdit.id, name, isKid, this.profilePicFile || undefined);
      if (response.isSuccess() && response.data) this.handleProfileUpdate(response);
      else this.errorService.show(response);
    } catch (error) {
      this.errorService.show('Error updating profile. Please try again later.');
    }
  }

  /**
   * Handles logic after successful profile update (updates user and closes dialog).
   * @param response API response containing updated profile data
   */
  private handleProfileUpdate(response: ApiResponse): void {
    const updatedProfile = new Profile(response.data);
    const user = this.api.CurrentUser;
    const index = user.profiles.findIndex(p => p.id === this.profileToEdit?.id);
    if (index !== -1) {
      user.profiles[index] = updatedProfile;
      this.api.CurrentUser = user;
    }
    this.closeCreateDialog();
  }

  /**
   * Deletes the currently selected profile after confirmation.
   */
  async deleteProfile(): Promise<void> {
    if (!this.profileToEdit) return;
    if (!this.confirmDeleteProfile(this.profileToEdit)) return;
    try {
      const response = await this.api.deleteUserProfile(this.profileToEdit.id);
      if (response.isSuccess()) this.handleProfileDelete(this.profileToEdit);
      else this.errorService.show(response);
    } catch (error) {
      this.errorService.show('Error deleting profile. Please try again later.');
    }
  }

  /**
   * Handles logic after successful profile deletion (updates user and current profile).
   * @param profile Profile that was deleted
   */
  private handleProfileDelete(profile: Profile): void {
    const user = this.api.CurrentUser;
    user.profiles = user.profiles.filter(p => p.id !== profile.id);
    this.api.CurrentUser = user;
    if (this.api.CurrentProfile.id === profile.id) {
      this.api.CurrentProfile = user.profiles.length > 0 ? user.profiles[0] : null;
    }
    this.closeCreateDialog();
  }

  /**
   * Shows confirmation dialog before deleting a profile.
   * @param profile Profile to confirm deletion for
   * @returns True if user confirms deletion, false otherwise
   */
  private confirmDeleteProfile(profile: Profile): boolean {
    return confirm(`Are you sure you want to delete the profile "${profile.name}"? This action cannot be undone.`);
  }

  /**
   * Opens the edit profile dialog for the given profile ID.
   * @param event Mouse event
   * @param profileId Profile ID
   */
  openEditProfile(event: Event, profileId: string): void {
    event.stopPropagation();
    const profile = this.profiles.find(p => p.id === profileId);
    if (profile) {
      this.createProfileForm.get('name')?.setValue(profile.name);
      this.createProfileForm.get('kid')?.setValue(profile.kid);
      this.profilePicPreview = profile.profilePic || null;
      this.dialogService.openProfileEdit(profile);
    }
  }

  /**
   * Selects a profile and notifies the dialog service.
   * @param profile Profile to select
   */
  selectProfile(profile: Profile): void {
    if (!profile) return;
    this.dialogService.selectProfile(profile);
  }

  /**
   * Closes the profile selection dialog.
   */
  closeDialog(): void {
    this.dialogService.closeProfileSelection();
  }

  /**
   * Closes the create/edit dialog and resets form and preview.
   */
  closeCreateDialog(): void {
    this.profilePicFile = null;
    if (this.profilePicPreview) URL.revokeObjectURL(this.profilePicPreview);
    this.profilePicPreview = null;
    this.createProfileForm.reset();
    this.dialogService.openProfileSelection(this.api.CurrentUser.profiles);
  }
}
