import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { PasswordInputComponent } from "../../shared/components/input-elements/password-input/password-input.component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailInputComponent } from "../../shared/components/input-elements/email-input/email-input.component";

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FooterComponent, PasswordInputComponent, ReactiveFormsModule, EmailInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.minLength(5),
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]]
    });
  }

  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  get email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }





}
