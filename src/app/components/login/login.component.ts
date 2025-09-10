import { Component, ElementRef, inject, ViewChild, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { PasswordInputComponent } from "../../shared/components/input-elements/password-input/password-input.component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailInputComponent } from "../../shared/components/input-elements/email-input/email-input.component";
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { DialogService } from '../../shared/services/dialog.service';
import { Router } from '@angular/router';
import { OrientationWarningComponent } from '../../shared/components/orientation-warning/orientation-warning.component';
import { ApiResponse } from '../../shared/models/api-response';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FooterComponent, PasswordInputComponent, ReactiveFormsModule, EmailInputComponent, OrientationWarningComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
/**
 * LoginComponent handles user authentication, form validation, and profile selection.
 * It manages the login form, communicates with the API for authentication,
 * and navigates the user based on login and profile selection results.
 */
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('errorResponse') errorResponse: ElementRef | undefined;
  loginForm: FormGroup;
  private renderer = inject(Renderer2);
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private errorService = inject(ErrorService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
      ]],
      password: ['', [
        Validators.required,
      ]]
    });
  }

  /**
   * Adds the login background CSS class to the document body when the component is initialized.
   */
  ngOnInit() {
    this.renderer.addClass(document.body, 'login-bg');
  }

  /**
   * Removes the login background CSS class from the document body when the component is destroyed.
   */
  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'login-bg');
  }

  /**
   * Returns the password form control from the login form.
   */
  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  /**
   * Returns the email form control from the login form.
   */
  get email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  /**
   * Handles login form submission, validates the form, sends login request to the API,
   * processes the response, and manages profile selection.
   */
  async submitLoginForm() {
    if (this.loginForm.invalid) return this.loginForm.markAllAsTouched();
    const { email, password } = this.getFormValues();

    try {
      const response = await this.api.login(email, password);
      if (!response.ok || response.data === null) return this.errorService.show(response);

      this.setDataFromResponse(response);
      await this.handleProfileSelection();
    } catch (error) {
      this.errorService.show('An error occurred during login. Please try again later.');
    }
  }

  /**
   * Sets authentication tokens and current user data from the API response.
   * @param response The API response containing authentication and user data.
   */
  private setDataFromResponse(response: ApiResponse) {
    this.api.AccessToken = response.data['access'];
    this.api.RefreshToken = response.data['refresh'];
    this.api.CurrentUser = response.data['user'];
  }

  /**
   * Retrieves the current values of the email and password fields from the login form.
   * @returns An object containing email and password values.
   */
  private getFormValues(): { email: string; password: string } {
    return {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
  }

  /**
   * Handles user profile selection after successful login.
   * Navigates to profile selection dialog if multiple profiles exist,
   * selects the single profile if only one exists, or shows an error if none exist.
   */
  async handleProfileSelection(): Promise<void> {
    const user = this.api.CurrentUser;

    if (user.profiles.length > 1) await this.awaitProfileSelection(user);
    else if (user.profiles.length === 1) this.singleProfileSelection(user);
    else this.errorService.show('No profiles available for this account.');
  }

  /**
   * Opens the profile selection dialog for users with multiple profiles.
   * Sets the selected profile and navigates to the main page.
   * @param user The current user object containing profiles.
   */
  private async awaitProfileSelection(user: User): Promise<void> {
    try {
      const selectedProfile = await this.dialogService.openProfileSelection(user.profiles);
      this.api.CurrentProfile = selectedProfile;
      this.navigateToMain();
    } catch (error) {
      this.errorService.show('Profile selection was cancelled or timed out.');
    }
  }

  /**
   * Selects the single available profile for the user and navigates to the main page.
   * @param user The current user object containing one profile.
   */
  private singleProfileSelection(user: User): void {
    this.api.CurrentProfile = user.profiles[0];
    this.navigateToMain();
  }

  /**
   * Navigates the user to the main page after successful login and profile selection.
   */
  navigateToMain(): void {
    this.router.navigate(['/main']);
  }

  /**
   * Navigates the user to the password reset page.
   */
  toPasswordForget() {
    const targetTree = this.router.createUrlTree(['/password/forgot'], {
      queryParams: { forgot: 'true' }
    });
    this.router.navigateByUrl(targetTree);
  }

  /**
   * Navigates the user to the registration page.
   */
  toRegister() {
    this.router.navigate(['/register']);
  }
}
