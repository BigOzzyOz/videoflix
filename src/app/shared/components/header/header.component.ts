import { Component, inject, Input } from '@angular/core';
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

    if (user.profiles.length > 1) {
      try {
        const selectedProfile = await this.dialogService.openProfileSelection(user.profiles);
        this.api.Profile = selectedProfile;
        this.navigateToMain();
      } catch (error) {
        this.errorService.show('Profile selection was cancelled or timed out.');
      }
    } else if (user.profiles.length === 1) {
      this.api.Profile = user.profiles[0];
      this.navigateToMain();
    } else {
      this.errorService.show('No profiles available for this account.');
    }
  }

  navigateToMain(): void {
    this.router.navigate(['/main']);
  }

}
