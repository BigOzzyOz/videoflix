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

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FooterComponent, PasswordInputComponent, ReactiveFormsModule, EmailInputComponent, OrientationWarningComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
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

  ngOnInit() {
    this.renderer.addClass(document.body, 'login-bg');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'login-bg');
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

    try {
      const response = await this.api.login(email, password);
      if (!response.ok || response.data === null) {
        this.errorService.show(response);
        return;
      }

      this.api.AccessToken = response.data['access'];
      this.api.RefreshToken = response.data['refresh'];
      this.api.CurrentUser = response.data['user'];

      await this.handleProfileSelection();
    } catch (error) {
      this.errorService.show('An error occurred during login. Please try again later.');
    }
  }

  async handleProfileSelection(): Promise<void> {
    const user = this.api.CurrentUser;

    if (user.profiles.length > 1) {
      try {
        const selectedProfile = await this.dialogService.openProfileSelection(user.profiles);
        this.api.CurrentProfile = selectedProfile;
        this.navigateToMain();
      } catch (error) {
        this.errorService.show('Profile selection was cancelled or timed out.');
      }
    } else if (user.profiles.length === 1) {
      this.api.CurrentProfile = user.profiles[0];
      this.navigateToMain();
    } else {
      this.errorService.show('No profiles available for this account.');
    }
  }

  navigateToMain(): void {
    this.router.navigate(['/main']);
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
