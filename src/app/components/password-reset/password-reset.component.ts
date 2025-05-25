import { Component, inject } from '@angular/core';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { PasswordInputComponent } from "../../shared/components/input-elements/password-input/password-input.component";
import { EmailInputComponent } from "../../shared/components/input-elements/email-input/email-input.component";
import { FormGroup, FormBuilder, ReactiveFormsModule, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  imports: [FooterComponent, HeaderComponent, PasswordInputComponent, EmailInputComponent, ReactiveFormsModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {
  private fb = inject(FormBuilder);
  private activeRoute = inject(ActivatedRoute);
  private router = inject(Router);

  resetForm: FormGroup;
  forgetForm: FormGroup;


  accountVerify: boolean = false;
  passwordReset: boolean = false;
  resetToken: string = '';
  passwordForget: boolean = false;


  constructor() {
    const path = this.activeRoute.snapshot.routeConfig?.path;
    this.activeRoute.queryParams.subscribe(params => {
      if (params['reset'] === 'true' && path === 'password/reset' && params['token']) {
        this.passwordReset = true;
        this.resetToken = params['token'] || '';
      } else if (params['forgot'] === 'true' && path === 'password/forgot') {
        this.passwordForget = true;
      } else if (path === 'verify') {
        this.accountVerify = true;
      } else {
        this.router.navigate(['**']);
      }
    });

    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmedPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]]
    }, { validators: this.passwordsMatch });

    this.forgetForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });

  }

  submitResetForm() {
    if (this.resetForm.valid) {
      const password = this.resetForm.get('password')?.value;
      const confirmedPassword = this.resetForm.get('confirmedPassword')?.value;

      // Call your password reset service here
      console.log('Password reset successful:', { password, confirmedPassword });
    }
  }

  submitForgetForm() {
    if (this.forgetForm.valid) {
      const email = this.forgetForm.get('email')?.value;

      // Call your password forget service here
      console.log('Password reset link sent to:', email);
    }
  }

  toLogin() {
    this.router.navigate(['/login']);
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

  passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmedPassword = group.get('confirmedPassword')?.value;

    return password && confirmedPassword && password !== confirmedPassword
      ? { mismatch: true }
      : null;
  };


}
