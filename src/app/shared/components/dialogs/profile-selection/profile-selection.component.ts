import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../../services/dialog.service';
import { Profile } from '../../../models/profile';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ErrorService } from '../../../services/error.service';

@Component({
  selector: 'app-profile-selection',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-selection.component.html',
  styleUrl: './profile-selection.component.scss'
})
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

  constructor() {
    this.createProfileForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(1), Validators.pattern(/^(?!\s*$).+/)]],
      kid: [false]
    });
  }

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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.profilePicPreview) {
      URL.revokeObjectURL(this.profilePicPreview);
    }
    this.profilePicFile = null;
    this.profilePicPreview = null;
    this.createProfileForm.reset();
  }

  openCreateProfile(): void {
    this.dialogService.openProfileCreate();
  }

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

  async createProfile(formValue: any): Promise<void> {
    if (this.createProfileForm.invalid) {
      this.createProfileForm.markAllAsTouched();
      return;
    }
    const name = formValue.name.trim();
    const isKid = formValue.kid || false;
    try {
      const response = await this.api.createUserProfile(name, isKid, this.profilePicFile || undefined);
      if (response.isSuccess() && response.data) {
        const newProfile = new Profile(response.data);
        const user = this.api.CurrentUser;
        user.profiles.push(newProfile);
        this.api.CurrentUser = user;
        this.closeCreateDialog();
      } else {
        this.errorService.show(response);
      }
    } catch (error) {
      this.errorService.show('Error creating profile. Please try again later.');
    };
  }

  async editProfile(formValue: any): Promise<void> {
    if (this.createProfileForm.invalid || !this.profileToEdit) {
      this.createProfileForm.markAllAsTouched();
      return Promise.resolve();
    }
    const name = formValue.name.trim();
    const isKid = formValue.kid || false;
    const response = await this.api.editUserProfile(this.profileToEdit.id, name, isKid, this.profilePicFile || undefined);
    if (response.isSuccess() && response.data) {
      const updatedProfile = new Profile(response.data);
      const user = this.api.CurrentUser;
      const index = user.profiles.findIndex(p => p.id === this.profileToEdit?.id);
      if (index !== -1) {
        user.profiles[index] = updatedProfile;
        this.api.CurrentUser = user;
      }
      this.closeCreateDialog();
    } else {
      this.errorService.show(response);
    }
  }

  async deleteProfile(): Promise<void> {
    if (!this.profileToEdit) return;
    if (!confirm(`Are you sure you want to delete the profile "${this.profileToEdit.name}"? This action cannot be undone.`)) {
      return;
    }
    const response = await this.api.deleteUserProfile(this.profileToEdit.id);
    if (response.isSuccess()) {
      const user = this.api.CurrentUser;
      user.profiles = user.profiles.filter(p => p.id !== this.profileToEdit?.id);
      this.api.CurrentUser = user;
      if (this.api.CurrentProfile?.id === this.profileToEdit.id) {
        this.api.CurrentProfile = user.profiles.length > 0 ? user.profiles[0] : null;
      }
      this.closeCreateDialog();
    } else {
      this.errorService.show(response);
    }
  }

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

  selectProfile(profile: Profile): void {
    this.dialogService.selectProfile(profile);
  }

  closeDialog(): void {
    this.dialogService.closeProfileSelection();
  }

  closeCreateDialog(): void {
    this.profilePicFile = null;
    if (this.profilePicPreview) {
      URL.revokeObjectURL(this.profilePicPreview);
    }
    this.profilePicPreview = null;
    this.createProfileForm.reset();
    this.dialogService.openProfileSelection(this.api.CurrentUser.profiles);
  }
}
