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
/**
 * HeaderComponent displays the application header with logo, navigation buttons, and profile/logout controls.
 * It supports various display modes via @Input properties and provides navigation methods.
 */
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

  /**
   * Navigates to the login page.
   */
  toLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navigates to the home page.
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Logs out the current user via the ApiService.
   */
  logOut(): void {
    this.api.logout()
  }

  async toProfile(): Promise<void> {
    const user = this.api.CurrentUser;
    try {
      const selectedProfile = await this.dialogService.openProfileSelection(user.profiles);
      this.api.CurrentProfile = selectedProfile;
      this.reloadWindow();
    } catch (error) {
      this.errorService.show('Profile selection was cancelled or timed out.');
    }
  }

  reloadWindow(): void {
    window.location.reload();
  }

  navigateToMain(): void {
    this.router.navigate(['/main']);
  }

}
