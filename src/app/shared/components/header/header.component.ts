import { Component, inject, Input } from '@angular/core';
import { Location } from '@angular/common';
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
  private location = inject(Location);


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
    this.location.back();
  }

  /**
   * Logs out the current user via the ApiService.
   */
  logOut(): void {
    this.api.logout()
  }

  /**
   * Allows the user to select a different profile and reloads the window to apply changes.
   * Handles errors if the profile selection is cancelled or times out.
   */
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

  /**
   * Reloads the current window by navigating to a dummy route and then back to the original URL.
   * This forces a full reload of the current route.
   */
  reloadWindow(): void {
    const originalUrl = this.router.url;
    this.router.navigateByUrl('/dummy', { skipLocationChange: true }).then(() => {
      this.router.navigate([originalUrl]);
    });
  }

  /**
   * Navigates to the main page.
   */
  navigateToMain(): void {
    this.router.navigate(['/main']);
  }

}
