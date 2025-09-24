import { Component, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { Router } from '@angular/router';
import { OrientationWarningComponent } from '../../shared/components/orientation-warning/orientation-warning.component';
import { LoadingService } from '../../shared/services/loading.service';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';

@Component({
  selector: 'app-landing',
  imports: [HeaderComponent, FooterComponent, FormsModule, OrientationWarningComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
/**
 * LandingComponent
 *
 * Displays the landing page where users can enter their email and sign up.
 * Handles background styling, navigation, and loading state.
 */
export class LandingComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private errorService = inject(ErrorService);
  private router = inject(Router);
  private renderer = inject(Renderer2);
  loadingService = inject(LoadingService);

  /**
   * The email address entered by the user.
   */
  mailInput: string = '';

  /**
   * Constructor: Disables loading since the landing page should be shown immediately.
   */
  constructor() {
    this.loadingService.setLoading(false);
  }

  /**
   * Lifecycle hook: Adds the CSS class for the landing page background when initialized.
   * If a JWT token is found in sessionStorage, validates it with the backend.
   * Navigates to the main page if the token is valid, otherwise clears the session.
   * Shows an error message if validation fails due to a network or server error.
   */
  async ngOnInit() {
    this.renderer.addClass(document.body, 'landing-bg');
    const storageToken = sessionStorage.getItem('token');
    if (storageToken) await this.validateSessionToken(storageToken);
  }

  /**
   * 
   * Validates the token with the backend API.
   * Navigates to the main page if valid, otherwise clears sessionStorage.
   * Shows an error message if validation fails due to a network or server error.
   * @param storageToken The JWT token stored in sessionStorage.
   */
  async validateSessionToken(storageToken: string) {
    try {
      const response = await this.api.validateToken(storageToken);
      if (response.isSuccess()) {
        this.router.navigate(['/main']);
      } else {
        sessionStorage.clear();
      }
    } catch (error) {
      this.errorService.show('Error validating token, please log in again.');
      sessionStorage.clear();
    }
  }

  /**
   * Lifecycle hook: Removes the CSS class for the landing page background when destroyed.
   */
  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'landing-bg');
  }

  /**
   * Navigates to the registration page and passes the entered email as a query parameter.
   */
  toSignup() {
    this.router.navigate(['/register'], {
      queryParams: { email: this.mailInput }
    });
  }

}
