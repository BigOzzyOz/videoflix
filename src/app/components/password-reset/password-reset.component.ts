import { Component, inject, OnInit } from '@angular/core';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { PasswordInputComponent } from "../../shared/components/input-elements/password-input/password-input.component";
import { EmailInputComponent } from "../../shared/components/input-elements/email-input/email-input.component";
import { FormGroup, FormBuilder, ReactiveFormsModule, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';

@Component({
  selector: 'app-password-reset',
  imports: [FooterComponent, HeaderComponent, PasswordInputComponent, EmailInputComponent, ReactiveFormsModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService)
  private activeRoute = inject(ActivatedRoute);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  resetForm: FormGroup;
  forgetForm: FormGroup;

  timeoutId: number | null = null;
  accountVerify: boolean = false;
  passwordReset: boolean = false;
  resetToken: string = '';
  verifyToken: string = '';
  passwordForget: boolean = false;
  emailSent: boolean = false;
  passwordResetSuccess: boolean = false;


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

  async ngOnInit() {
    const path = this.activeRoute.snapshot.routeConfig?.path;
    const params = this.activeRoute.snapshot.queryParams;

    if (path === 'verify' && params['token']) {
      await this.verifyAccount(params['token']);
    } else if (params['reset'] === 'true' && path === 'password/reset' && params['token']) {
      this.passwordReset = true;
      this.resetToken = params['token'] || '';
    } else if (params['forgot'] === 'true' && path === 'password/forgot') {
      this.passwordForget = true;
    } else {
      this.router.navigate(['**']);
    }
  }

  private async verifyAccount(token: string) {

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

  async submitResetForm() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const password = this.password?.value;
    const confirmedPassword = this.confirmedPassword?.value;

    try {
      const response = await this.api.resetPasswordConfirm(this.resetToken, password, confirmedPassword);

      if (!response.ok) {
        this.errorService.show(response);
        return;
      }

      this.passwordReset = false;
      this.passwordResetSuccess = true;

    } catch (error) {
      this.errorService.show('An error occurred during password reset. Please try again later.');
    }
  }

  async submitForgotForm() {
    if (this.forgetForm.invalid) {
      this.forgetForm.markAllAsTouched();
      return;
    }

    const email = this.forgetForm.get('email')?.value;

    try {
      const response = await this.api.resetPassword(email);

      if (!response.ok) {
        this.errorService.show(response);
        return;
      }

      this.passwordForget = false;
      this.emailSent = true;

    } catch (error) {
      this.errorService.show('An error occurred during password reset. Please try again later.');
    }

  }

  toLogin() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.router.navigate(['/login']);
  }

  toHome() {
    this.router.navigate(['/']);
  }

  get password(): FormControl {
    return this.resetForm.get('password') as FormControl;
  }

  get confirmedPassword(): FormControl {
    return this.resetForm.get('confirmedPassword') as FormControl;
  }

  get email(): FormControl {
    return this.forgetForm.get('email') as FormControl;
  }

  passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmedPassword = group.get('confirmedPassword');

    if (!confirmedPassword) {
      return null;
    }

    if (password !== confirmedPassword.value) {
      confirmedPassword.setErrors({ mismatch: true });
    } else {
      if (confirmedPassword.hasError('mismatch')) {
        const errors = { ...confirmedPassword.errors };
        delete errors['mismatch'];
        if (Object.keys(errors).length === 0) {
          confirmedPassword.setErrors(null);
        } else {
          confirmedPassword.setErrors(errors);
        }
      }
    }

    return null;
  }


}
