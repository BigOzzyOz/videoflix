import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { PasswordInputComponent } from "../../shared/components/input-elements/password-input/password-input.component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailInputComponent } from "../../shared/components/input-elements/email-input/email-input.component";
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';

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
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      console.log('Login Form Submitted', { email, password });
      await this.api.login(email, password).then(response => {
        if (!response.ok) {
          this.errorService.show(response.data.detail || 'Login failed. Please check your credentials.');
          return;
        }

        this.api.AccessToken = response.data.access;
        this.api.RefreshToken = response.data.refresh;
        this.api.CurrentUser = response.data.user;

      }).catch(error => {

      });
    } else {
      console.log('Login Form is invalid');
    }
  }

  errorHandling(response: any) {
    const errorElement = this.errorResponse?.nativeElement;
    if (errorElement) {
      errorElement.textContent = response.data.detail || 'An error occurred during login. Please try again.';
    }

  }



}
