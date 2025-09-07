import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RegisterComponent } from './register.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { EmailInputComponent } from '../../shared/components/input-elements/email-input/email-input.component';
import { PasswordInputComponent } from '../../shared/components/input-elements/password-input/password-input.component';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { ApiResponse } from '../../shared/models/api-response';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: jasmine.SpyObj<Router>;
  let apiService: jasmine.SpyObj<ApiService>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['register']);
    const errorSpy = jasmine.createSpyObj('ErrorService', ['show']);
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: of({ email: 'test@example.com' })
    });

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        HeaderComponent,
        FooterComponent,
        EmailInputComponent,
        PasswordInputComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ApiService, useValue: apiSpy },
        { provide: ErrorService, useValue: errorSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    errorService = TestBed.inject(ErrorService) as jasmine.SpyObj<ErrorService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with email from query params', () => {
    expect(component.tempEmail).toBe('test@example.com');
    expect(component.registerForm.get('email')?.value).toBe('test@example.com');
  });

  it('should initialize form with validators', () => {
    expect(component.registerForm.get('email')?.hasError('required')).toBeFalsy(); // has value from query params
    expect(component.registerForm.get('password')?.hasError('required')).toBeTruthy();
    expect(component.registerForm.get('confirmedPassword')?.hasError('required')).toBeTruthy();
  });

  it('should render header and footer components', () => {
    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const footer = fixture.debugElement.query(By.directive(FooterComponent));

    expect(header).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('should have form control getter methods', () => {
    expect(component.email).toBe(component.registerForm.get('email') as FormControl);
    expect(component.password).toBe(component.registerForm.get('password') as FormControl);
    expect(component.confirmedPassword).toBe(component.registerForm.get('confirmedPassword') as FormControl);
  });

  it('should not submit form when invalid', async () => {
    component.registerForm.patchValue({
      email: '',
      password: '',
      confirmedPassword: ''
    });

    await component.submitRegisterForm();

    expect(apiService.register).not.toHaveBeenCalled();
    expect(component.registerForm.touched).toBeTruthy();
  });

  it('should register successfully with valid data', async () => {
    const mockResponse = new ApiResponse(true, 201, { id: 1 });
    apiService.register.and.returnValue(Promise.resolve(mockResponse));

    component.registerForm.patchValue({
      email: 'new@example.com',
      password: 'Password123',
      confirmedPassword: 'Password123'
    });

    await component.submitRegisterForm();

    expect(apiService.register).toHaveBeenCalledWith('new@example.com', 'Password123', 'Password123');
    expect(component.registerSuccess).toBeTruthy();
  });

  it('should handle registration error from API', async () => {
    const mockResponse = new ApiResponse(false, 400, null);
    apiService.register.and.returnValue(Promise.resolve(mockResponse));

    component.registerForm.patchValue({
      email: 'existing@example.com',
      password: 'Password123',
      confirmedPassword: 'Password123'
    });

    await component.submitRegisterForm();

    expect(errorService.show).toHaveBeenCalledWith(mockResponse);
    expect(component.registerSuccess).toBeFalsy();
  });

  it('should navigate to home', () => {
    component.toHome();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should display success message when registration is successful', () => {
    component.registerSuccess = true;
    fixture.detectChanges();

    const successMessage = fixture.nativeElement.querySelector('h1');
    expect(successMessage?.textContent).toBe('Email Send');
  });

  it('should display registration form when not successful', () => {
    component.registerSuccess = false;
    fixture.detectChanges();

    const formTitle = fixture.nativeElement.querySelector('h1');
    expect(formTitle?.textContent).toBe('Sign up');
  });

  it('should validate password match', () => {
    component.registerForm.patchValue({
      password: 'Password123',
      confirmedPassword: 'DifferentPassword123'
    });

    const confirmedPasswordControl = component.registerForm.get('confirmedPassword');
    expect(confirmedPasswordControl?.hasError('mismatch')).toBeTruthy();
  });

  it('should handle registration exception', async () => {
    apiService.register.and.rejectWith(new Error('Network error'));

    component.registerForm.patchValue({
      email: 'test@example.com',
      password: 'Password123',
      confirmedPassword: 'Password123'
    });

    await component.submitRegisterForm();

    expect(errorService.show).toHaveBeenCalledWith('An error occurred while registering. Please try again later.');
    expect(component.registerSuccess).toBeFalsy();
  });

  it('should validate password match correctly', () => {
    component.registerForm.patchValue({
      password: 'Password123',
      confirmedPassword: 'Password123'
    });

    const confirmedPasswordControl = component.registerForm.get('confirmedPassword');
    expect(confirmedPasswordControl?.hasError('mismatch')).toBeFalsy();

    component.registerForm.patchValue({
      confirmedPassword: 'DifferentPassword123'
    });

    expect(confirmedPasswordControl?.hasError('mismatch')).toBeTruthy();
  });

  it('should remove mismatch error when passwords match again', () => {
    component.registerForm.patchValue({
      password: 'Password123',
      confirmedPassword: 'Different123'
    });

    const confirmedPasswordControl = component.registerForm.get('confirmedPassword');
    expect(confirmedPasswordControl?.hasError('mismatch')).toBeTruthy();

    component.registerForm.patchValue({
      confirmedPassword: 'Password123'
    });

    expect(confirmedPasswordControl?.hasError('mismatch')).toBeFalsy();
  });

  it('should trigger navigation when back to home button is clicked', () => {
    spyOn(component, 'toHome');

    component.registerSuccess = true;
    fixture.detectChanges();

    const backButton = fixture.nativeElement.querySelector('.register__container__form__buttons__register');
    backButton.click();

    expect(component.toHome).toHaveBeenCalled();
  });

  it('should return null from passwordsMatch if confirmedPassword is falsy', () => {
    component.registerForm.patchValue({
      password: 'password',
      confirmedPassword: null
    });
    expect(component.passwordsMatch(component.registerForm)).toBeNull();
    expect(component.passwordsMatch(component.registerForm)).toBeNull();
    expect(component.passwordsMatch(component.registerForm)).toBeNull();
  });


  it('should return null from passwordsMatch if confirmedPassword control is missing', () => {
    const fb = new FormBuilder();
    const group = fb.group({
      password: ['password']
      // no confirmedPassword control
    });
    expect(component.passwordsMatch(group)).toBeNull();
  });

  it('should remove mismatch error and reset errors if no other errors remain', () => {
    const passwordControl = {
      errors: { mismatch: true },
      hasError: (err: string) => err === 'mismatch',
      setErrors: jasmine.createSpy()
    };
    RegisterComponent.handlePasswordMismatchError(passwordControl as any);
    expect(passwordControl.setErrors).toHaveBeenCalledWith(null);
  });

  it('should remove only mismatch error and keep other errors', () => {
    const passwordControl = {
      errors: { mismatch: true, required: true },
      hasError: (err: string) => err === 'mismatch' || err === 'required',
      setErrors: jasmine.createSpy()
    };
    RegisterComponent.handlePasswordMismatchError(passwordControl as any);
    expect(passwordControl.setErrors).toHaveBeenCalledWith({ required: true });
  });
});


describe('RegisterComponent with missing email param', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: jasmine.SpyObj<Router>;
  let apiService: jasmine.SpyObj<ApiService>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['register']);
    const errorSpy = jasmine.createSpyObj('ErrorService', ['show']);
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], { queryParams: of({}) });

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        HeaderComponent,
        FooterComponent,
        EmailInputComponent,
        PasswordInputComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ApiService, useValue: apiSpy },
        { provide: ErrorService, useValue: errorSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    errorService = TestBed.inject(ErrorService) as jasmine.SpyObj<ErrorService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    fixture.detectChanges();
  });

  it('should set tempEmail to empty string if email param is missing', async () => {
    expect(component.tempEmail).toBe('');
  });
});


