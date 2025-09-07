import { Component, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService } from '../../shared/services/error.service';
import { ApiService } from '../../shared/services/api.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { EmailInputComponent } from '../../shared/components/input-elements/email-input/email-input.component';
import { PasswordInputComponent } from '../../shared/components/input-elements/password-input/password-input.component';
import { OrientationWarningComponent } from '../../shared/components/orientation-warning/orientation-warning.component';

/**
 * Component for user registration. Handles form validation, API calls, error feedback,
 * and navigation. Uses Angular Reactive Forms and provides feedback for success and errors.
 */
@Component({
    selector: 'app-register',
    imports: [FormsModule, HeaderComponent, FooterComponent, EmailInputComponent, PasswordInputComponent, ReactiveFormsModule, OrientationWarningComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    private renderer = inject(Renderer2);
    private fb = inject(FormBuilder);
    private activeRoute = inject(ActivatedRoute);
    private router = inject(Router)
    private api = inject(ApiService);
    private errorService = inject(ErrorService);

    tempEmail: string = '';
    registerSuccess: boolean = false;
    registerForm: FormGroup;

    /**
     * Initializes the registration form and sets email from query params if present.
     */
    constructor() {
        this.activeRoute.queryParams.subscribe(params => {
            this.tempEmail = params['email'] || '';
        });

        this.registerForm = this.fb.group({
            email: [this.tempEmail, [
                Validators.required,
                Validators.email,
                Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
            ]],
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
        },
            { validators: this.passwordsMatch }
        );
    }

    /**
     * Adds signup background class to body on init.
     */
    ngOnInit() {
        this.renderer.addClass(document.body, 'signup-bg');
    }

    /**
     * Removes signup background class from body on destroy.
     */
    ngOnDestroy() {
        this.renderer.removeClass(document.body, 'signup-bg');
    }

    /**
     * Submits the registration form. Validates input, calls API, and handles success or error feedback.
     */
    async submitRegisterForm(): Promise<void> {
        if (this.registerForm.invalid) return this.registerForm.markAllAsTouched();
        const email = this.registerForm.value.email;
        const password = this.registerForm.value.password;
        const confirmedPassword = this.registerForm.value.confirmedPassword;
        try {
            const response = await this.api.register(email, password, confirmedPassword);
            if (!response.ok || response.data === null) return this.errorService.show(response);
            this.registerSuccess = true;
        } catch (error) {
            this.errorService.show('An error occurred while registering. Please try again later.');
        }
    }

    /**
     * Returns the email form control.
     */
    get email(): FormControl {
        return this.registerForm.get('email') as FormControl;
    }

    /**
     * Returns the password form control.
     */
    get password(): FormControl {
        return this.registerForm.get('password') as FormControl;
    }

    /**
     * Returns the confirmed password form control.
     */
    get confirmedPassword(): FormControl {
        return this.registerForm.get('confirmedPassword') as FormControl;
    }

    /**
     * Navigates to the home page.
     */
    toHome(): void {
        this.router.navigate(['/']);
    }

    /**
     * Custom validator to check if password and confirmed password match.
     * Sets or removes 'mismatch' error on confirmedPassword control.
     */
    passwordsMatch(group: AbstractControl): ValidationErrors | null {
        const password = group.get('password')?.value;
        const confirmedPassword = group.get('confirmedPassword');
        if (!confirmedPassword) return null;
        if (password !== confirmedPassword.value) confirmedPassword.setErrors({ mismatch: true });
        else RegisterComponent.handlePasswordMismatchError(confirmedPassword);
        return null;
    }

    /**
     * Removes 'mismatch' error from confirmedPassword control if passwords match.
     * @param password The confirmedPassword form control
     */
    static handlePasswordMismatchError(password: AbstractControl) {
        if (password.hasError('mismatch')) {
            const errors = { ...password.errors };
            delete errors['mismatch'];
            if (Object.keys(errors).length === 0) password.setErrors(null);
            else password.setErrors(errors);
        }
    }
}
