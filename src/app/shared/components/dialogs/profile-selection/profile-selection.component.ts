import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogData } from '../../../services/dialog.service';
import { Profile } from '../../../models/profile';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-selection',
  imports: [CommonModule],
  templateUrl: './profile-selection.component.html',
  styleUrl: './profile-selection.component.scss'
})
export class ProfileSelectionComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);

  profiles: Profile[] = [];
  isVisible = false;
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.subscriptions.push(
      this.dialogService.isProfileSelectionVisible.subscribe(visible => {
        this.isVisible = visible;
      })
    );

    this.subscriptions.push(
      this.dialogService.profileSelectionData.subscribe(data => {
        if (data?.profiles) {
          this.profiles = data.profiles;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  selectProfile(profile: Profile): void {
    this.dialogService.selectProfile(profile);
  }

  closeDialog(): void {
    this.dialogService.closeProfileSelection();
  }
}
