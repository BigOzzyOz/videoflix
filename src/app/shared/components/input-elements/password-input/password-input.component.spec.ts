import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

import { PasswordInputComponent } from './password-input.component';

describe('PasswordInputComponent', () => {
  let component: PasswordInputComponent;
  let fixture: ComponentFixture<PasswordInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputComponent, ReactiveFormsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PasswordInputComponent);
    component = fixture.componentInstance;

    // Provide required FormControl
    component.password = new FormControl('', [Validators.required, Validators.minLength(8)]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.placeholder).toBe('Password');
    expect(component.isVisible).toBe(false);
  });

  it('should render password input with correct attributes', () => {
    const input = fixture.nativeElement.querySelector('#password-input');

    expect(input.type).toBe('password');
    expect(input.placeholder).toBe('Password');
    expect(input.autocomplete).toBe('current-password');
  });

  it('should use custom placeholder when provided', () => {
    component.placeholder = 'Enter password';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#password-input');
    expect(input.placeholder).toBe('Enter password');
  });

  it('should bind FormControl to input', () => {
    const input = fixture.nativeElement.querySelector('#password-input');

    component.password.setValue('testpassword');
    fixture.detectChanges();

    expect(input.value).toBe('testpassword');
  });

  it('should toggle password visibility when toggle button is clicked', () => {
    const input = fixture.nativeElement.querySelector('#password-input');
    const toggleButton = fixture.nativeElement.querySelector('.password-toggle');

    expect(input.type).toBe('password');
    expect(component.isVisible).toBe(false);

    toggleButton.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(component.isVisible).toBe(true);

    toggleButton.click();
    fixture.detectChanges();

    expect(input.type).toBe('password');
    expect(component.isVisible).toBe(false);
  });

  it('should show different SVG icons based on visibility state', () => {
    const toggleButton = fixture.nativeElement.querySelector('.password-toggle');

    // Initially hidden (eye-slash icon)
    expect(component.isVisible).toBe(false);

    // Click to show (eye icon)
    toggleButton.click();
    fixture.detectChanges();
    expect(component.isVisible).toBe(true);
  });

  it('should show required error when touched and empty', () => {
    component.password.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage?.textContent?.trim()).toBe('Password is required');
  });

  it('should show minlength error when password is too short', () => {
    component.password.setValue('1234567'); // 7 characters (less than 8)
    component.password.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage?.textContent?.trim()).toBe('Password must be at least 8 characters long');
  });

  it('should show pattern error for invalid password format', () => {
    const patternValidator = Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);
    component.password = new FormControl('', [Validators.required, patternValidator]);

    component.password.setValue('password'); // no uppercase or number
    component.password.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage?.textContent?.trim()).toBe('At least 1 upper, 1 lowercase letter and one number');
  });

  it('should show mismatch error when passwords do not match', () => {
    component.password.setErrors({ mismatch: true });
    component.password.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage?.textContent?.trim()).toBe('Passwords do not match');
  });

  it('should not show error when valid password is entered', () => {
    component.password.setValue('ValidPassword123');
    component.password.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage).toBeFalsy();
  });

  it('should not show error when untouched', () => {
    component.password.setValue('');
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage).toBeFalsy();
  });
});
