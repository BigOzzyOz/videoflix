import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService } from '../../shared/services/error.service';
import { ApiService } from '../../shared/services/api.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { EmailInputComponent } from '../../shared/components/input-elements/email-input/email-input.component';
import { PasswordInputComponent } from '../../shared/components/input-elements/password-input/password-input.component';

@Component({
    selector: 'app-register',
    imports: [FormsModule, HeaderComponent, FooterComponent, EmailInputComponent, PasswordInputComponent, ReactiveFormsModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private activeRoute = inject(ActivatedRoute);
    private router = inject(Router)
    private api = inject(ApiService);
    private errorService = inject(ErrorService);

    tempEmail: string = '';
    registerSuccess: boolean = false;
    registerForm: FormGroup;

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

    async submitRegisterForm() {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }
        const email = this.registerForm.value.email;
        const password = this.registerForm.value.password;
        const confirmedPassword = this.registerForm.value.confirmedPassword;

        try {
            const response = await this.api.register(email, password, confirmedPassword);
            if (!response.ok || response.data === null) {
                this.errorService.show(response);
                return;
            }

            this.registerSuccess = true;

        } catch (error) {
            this.errorService.show('An error occurred while registering. Please try again later.');
        }
    }

    get email(): FormControl {
        return this.registerForm.get('email') as FormControl;
    }

    get password(): FormControl {
        return this.registerForm.get('password') as FormControl;
    }

    get confirmedPassword(): FormControl {
        return this.registerForm.get('confirmedPassword') as FormControl;
    }

    toHome() {
        this.router.navigate(['/']);
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
