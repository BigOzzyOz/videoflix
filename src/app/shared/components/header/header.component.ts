import { Component, inject, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DialogService } from '../../services/dialog.service';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() loginButton: Boolean = false;
  @Input() logoutButton: Boolean = false;
  @Input() backArrow: Boolean = false;
  @Input() responsiveLogo: Boolean = false;
  @Input() shortLogo: Boolean = false;
  @Input() longLogo: Boolean = false;
  private router = inject(Router);
  public api = inject(ApiService);
  private errorService = inject(ErrorService);
  private dialogService = inject(DialogService);
  private cdRef = inject(ChangeDetectorRef);


  constructor() { }

  toLogin() {
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  logOut() {
    this.api.logout()
  }

  async toProfile(): Promise<void> {
    const user = this.api.CurrentUser;

    try {
      const selectedProfile = await this.dialogService.openProfileSelection(user.profiles);
      this.api.CurrentProfile = selectedProfile;
      window.location.reload();
    } catch (error) {
      this.errorService.show('Profile selection was cancelled or timed out.');
    }

  }

  navigateToMain(): void {
    this.router.navigate(['/main']);
  }

}
