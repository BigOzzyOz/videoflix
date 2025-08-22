import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

import { EmailInputComponent } from './email-input.component';

describe('EmailInputComponent', () => {
  let component: EmailInputComponent;
  let fixture: ComponentFixture<EmailInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailInputComponent, ReactiveFormsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EmailInputComponent);
    component = fixture.componentInstance;

    component.email = new FormControl('', [Validators.required, Validators.email]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default placeholder', () => {
    expect(component.placeholder).toBe('Email Address');
  });

  it('should render input with correct attributes', () => {
    const input = fixture.nativeElement.querySelector('#email-input');

    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('Email Address');
    expect(input.autocomplete).toBe('email');
  });

  it('should use custom placeholder when provided', () => {
    component.placeholder = 'Enter your email';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#email-input');
    expect(input.placeholder).toBe('Enter your email');
  });

  it('should bind FormControl to input', () => {
    const input = fixture.nativeElement.querySelector('#email-input');

    component.email.setValue('test@example.com');
    fixture.detectChanges();

    expect(input.value).toBe('test@example.com');
  });

  it('should show required error when touched and empty', () => {
    component.email.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage?.textContent?.trim()).toBe('Email is required');
  });

  it('should show invalid email error for invalid format', () => {
    component.email.setValue('invalid-email');
    component.email.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage?.textContent?.trim()).toBe('Invalid email address');
  });

  it('should not show error when valid email is entered', () => {
    component.email.setValue('valid@example.com');
    component.email.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage).toBeFalsy();
  });

  it('should not show error when untouched', () => {
    component.email.setValue('');
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage).toBeFalsy();
  });

  it('should show minlength error when email is too short', () => {
    component.email = new FormControl('', [Validators.required, Validators.minLength(5)]);
    component.email.setValue('a@b');
    component.email.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage?.textContent?.trim()).toBe('Email too short');
  });
});
