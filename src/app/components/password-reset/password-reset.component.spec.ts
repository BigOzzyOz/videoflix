import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { PasswordResetComponent } from './password-reset.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { EmailInputComponent } from '../../shared/components/input-elements/email-input/email-input.component';
import { PasswordInputComponent } from '../../shared/components/input-elements/password-input/password-input.component';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;
  let router: jasmine.SpyObj<Router>;
  let apiService: jasmine.SpyObj<ApiService>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['verifyEmail', 'resetPasswordConfirm', 'resetPassword']);
    const errorSpy = jasmine.createSpyObj('ErrorService', ['show']);
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        routeConfig: { path: 'verify' },
        queryParams: { token: 'test-token' }
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        PasswordResetComponent,
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

    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    errorService = TestBed.inject(ErrorService) as jasmine.SpyObj<ErrorService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize forms with validators', () => {
    expect(component.resetForm.get('password')?.hasError('required')).toBeTruthy();
    expect(component.resetForm.get('confirmedPassword')?.hasError('required')).toBeTruthy();
    expect(component.forgetForm.get('email')?.hasError('required')).toBeTruthy();
  });

  it('should render header and footer components', () => {
    fixture.detectChanges();
    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const footer = fixture.debugElement.query(By.directive(FooterComponent));

    expect(header).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('should have form control getter methods', () => {
    expect(component.password).toBe(component.resetForm.get('password') as FormControl);
    expect(component.confirmedPassword).toBe(component.resetForm.get('confirmedPassword') as FormControl);
    expect(component.email).toBe(component.forgetForm.get('email') as FormControl);
  });

  it('should verify account successfully on init', async () => {
    const mockResponse = { ok: true, status: 200, data: null };
    apiService.verifyEmail.and.returnValue(Promise.resolve(mockResponse));

    await component.ngOnInit();

    expect(apiService.verifyEmail).toHaveBeenCalledWith('test-token');
    expect(component.accountVerify).toBeTruthy();
  });

  it('should submit reset form successfully', async () => {
    component.passwordReset = true;
    component.resetForm.patchValue({
      password: 'NewPassword123',
      confirmedPassword: 'NewPassword123'
    });
    const mockResponse = { ok: true, status: 200, data: null };
    apiService.resetPasswordConfirm.and.returnValue(Promise.resolve(mockResponse));

    await component.submitResetForm();

    expect(apiService.resetPasswordConfirm).toHaveBeenCalled();
    expect(component.passwordResetSuccess).toBeTruthy();
  });

  it('should submit forgot form successfully', async () => {
    component.forgetForm.patchValue({ email: 'test@example.com' });
    const mockResponse = { ok: true, status: 200, data: null };
    apiService.resetPassword.and.returnValue(Promise.resolve(mockResponse));

    await component.submitForgotForm();

    expect(apiService.resetPassword).toHaveBeenCalledWith('test@example.com');
    expect(component.emailSent).toBeTruthy();
  });

  it('should navigate to login and clear timeout', () => {
    component.timeoutId = 123;
    spyOn(window, 'clearTimeout');

    component.toLogin();

    expect(clearTimeout).toHaveBeenCalledWith(123);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to home', () => {
    component.toHome();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle API errors', async () => {
    const mockResponse = { ok: false, status: 400, data: null };
    apiService.verifyEmail.and.returnValue(Promise.resolve(mockResponse));

    await component.ngOnInit();

    expect(errorService.show).toHaveBeenCalledWith(mockResponse);
    expect(router.navigate).toHaveBeenCalledWith(['**']);
  });
});
