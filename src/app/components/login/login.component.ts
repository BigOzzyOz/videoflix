import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { PasswordInputComponent } from "../../shared/components/input-elements/password-input/password-input.component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailInputComponent } from "../../shared/components/input-elements/email-input/email-input.component";
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FooterComponent, PasswordInputComponent, ReactiveFormsModule, EmailInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @ViewChild('errorResponse') errorResponse: ElementRef | undefined;
  loginForm: FormGroup;
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private errorService = inject(ErrorService);
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

  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  get email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  async submitLoginForm() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    console.log('Login Form Submitted', { email, password });
    try {
      const response = await this.api.login(email, password);
      if (!response.ok || response.data === null) {
        this.errorService.show(response);
        return;
      }

      this.api.AccessToken = response.data['access'];
      this.api.RefreshToken = response.data['refresh'];
      this.api.CurrentUser = response.data['user'];

      //TODO - redirect to the home page or dashboard
    } catch (error) {
      this.errorService.show('An error occurred during login. Please try again later.');
    }

  }

  toPasswordForget() {
    const targetTree = this.router.createUrlTree(['/password/forgot'], {
      queryParams: { forgot: 'true' }
    });
    this.router.navigateByUrl(targetTree);
  }

  toRegister() {
    this.router.navigate(['/register']);
  }

}
