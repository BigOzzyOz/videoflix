import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { PasswordInputComponent } from "../../shared/components/input-elements/password-input/password-input.component";
import { EmailInputComponent } from "../../shared/components/input-elements/email-input/email-input.component";
import { FormGroup, FormBuilder, ReactiveFormsModule, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { OrientationWarningComponent } from '../../shared/components/orientation-warning/orientation-warning.component';

@Component({
  selector: 'app-password-reset',
  imports: [FooterComponent, HeaderComponent, PasswordInputComponent, EmailInputComponent, ReactiveFormsModule, OrientationWarningComponent],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
/**
 * Handles password reset, password forget, and account verification flows.
 * Provides form validation, API calls, and navigation for password-related actions.
 */
export class PasswordResetComponent implements OnInit {
  private renderer = inject(Renderer2);
  private fb = inject(FormBuilder);
  private api = inject(ApiService)
  private activeRoute = inject(ActivatedRoute);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  resetForm: FormGroup;
  forgetForm: FormGroup;

  timeoutId: ReturnType<typeof setTimeout> | null = null;
  accountVerify: boolean = false;
  passwordReset: boolean = false;
  resetToken: string = '';
  verifyToken: string = '';
  passwordForget: boolean = false;
  emailSent: boolean = false;
  passwordResetSuccess: boolean = false;

  /**
   * Initializes forms and validators for password reset and forget flows.
   */
  constructor() {
    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmedPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ]]
    },
      { validators: this.passwordsMatch }
    );
    this.forgetForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  /**
   * Sets background and determines flow type on init.
   */
  async ngOnInit() {
    this.renderer.addClass(document.body, 'login-bg');
    const path = this.activeRoute.snapshot.routeConfig?.path;
    const params = this.activeRoute.snapshot.queryParams;

    if (path === 'verify' && params['token']) await this.verifyAccount(params['token']);
    else if (this.isPasswordReset(path, params)) {
      this.passwordReset = true;
      this.resetToken = params['token'] || '';
    } else if (this.isPasswordForget(path, params)) this.passwordForget = true;
    else this.router.navigate(['/login']);
  }

  /**
   * Checks if route is for password forget flow.
   * @param path Route path
   * @param params Route parameters
   */
  private isPasswordForget(path: string | undefined, params: Params): boolean {
    return params['forgot'] === 'true' && path === 'password/forgot'
  }

  /**
   * Checks if route is for password reset flow.
   * @param path Route path
   * @param params Route parameters
   */
  private isPasswordReset(path: string | undefined, params: Params): boolean {
    return params['reset'] === 'true' && path === 'password/reset' && params['token'];
  }

  /**
   * Cleans up background and timeout on destroy.
   */
  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'login-bg');
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Verifies account using token. Navigates to login on success.
   * @param token Verification token
   */
  private async verifyAccount(token: string): Promise<void> {
    try {
      const response = await this.api.verifyEmail(token);
      if (response.ok) {
        this.accountVerify = true;
        this.timeoutId = setTimeout(() => this.router.navigate(['/login']), 5000);
      } else {
        this.errorService.show(response);
        this.router.navigate(['**']);
      }
    } catch (error) {
      this.errorService.show('Verification failed');
      this.router.navigate(['**']);
    }
  }

  /**
   * Submits password reset form and calls API.
   */
  async submitResetForm(): Promise<void> {
    if (this.resetForm.invalid) return this.resetForm.markAllAsTouched();
    const password = this.password?.value;
    const confirmedPassword = this.confirmedPassword?.value;
    try {
      const response = await this.api.resetPasswordConfirm(this.resetToken, password, confirmedPassword);
      if (!response.ok) return this.errorService.show(response);
      this.passwordReset = false;
      this.passwordResetSuccess = true;

    } catch (error) {
      this.errorService.show('An error occurred during password reset. Please try again later.');
    }
  }

  /**
   * Submits password forget form and calls API.
   */
  async submitForgotForm(): Promise<void> {
    if (this.forgetForm.invalid) return this.forgetForm.markAllAsTouched();
    const email = this.forgetForm.get('email')?.value;
    try {
      const response = await this.api.resetPassword(email);
      if (!response.ok) return this.errorService.show(response);
      this.passwordForget = false;
      this.emailSent = true;
    } catch (error) {
      this.errorService.show('An error occurred during password reset. Please try again later.');
    }
  }

  /**
   * Navigates to login page, clearing timeouts.
   */
  toLogin(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.router.navigate(['/login']);
  }

  /**
   * Navigates to home page.
   */
  toHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Gets password FormControl from resetForm.
   */
  get password(): FormControl {
    return this.resetForm.get('password') as FormControl;
  }

  /**
   * Gets confirmedPassword FormControl from resetForm.
   */
  get confirmedPassword(): FormControl {
    return this.resetForm.get('confirmedPassword') as FormControl;
  }

  /**
   * Gets email FormControl from forgetForm.
   */
  get email(): FormControl {
    return this.forgetForm.get('email') as FormControl;
  }

  /**
   * Validator to check if password and confirmedPassword match.
   * @param group Form group
   */
  passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmedPassword = group.get('confirmedPassword');
    if (!confirmedPassword) return null;
    if (password !== confirmedPassword.value) confirmedPassword.setErrors({ mismatch: true });
    else PasswordResetComponent.handlePasswordValidationErrors(confirmedPassword);
    return null;
  }

  /**
   * Removes 'mismatch' error from confirmedPassword if passwords match.
   * @param confirmedPassword Confirmed password control
   */
  private static handlePasswordValidationErrors(confirmedPassword: AbstractControl | null): void {
    if (!confirmedPassword) return;

    if (confirmedPassword.hasError('mismatch')) {
      const errors = { ...confirmedPassword.errors };
      delete errors['mismatch'];
      if (Object.keys(errors).length === 0) confirmedPassword.setErrors(null);
      else confirmedPassword.setErrors(errors);
    }
  }
}
