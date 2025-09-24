import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
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
import { ApiResponse } from '../../shared/models/api-response';

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

  it('should initialize forms with validators and not submit if invalid', async () => {
    expect(component.resetForm.get('password')?.hasError('required')).toBeTruthy();
    expect(component.resetForm.get('confirmedPassword')?.hasError('required')).toBeTruthy();
    expect(component.forgetForm.get('email')?.hasError('required')).toBeTruthy();

    spyOn(component.resetForm, 'markAllAsTouched');
    await component.submitResetForm();
    expect(component.resetForm.markAllAsTouched).toHaveBeenCalled();
    expect(apiService.resetPasswordConfirm).not.toHaveBeenCalled();

    spyOn(component.forgetForm, 'markAllAsTouched');
    await component.submitForgotForm();
    expect(component.forgetForm.markAllAsTouched).toHaveBeenCalled();
    expect(apiService.resetPassword).not.toHaveBeenCalled();
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
    const mockResponse = new ApiResponse(true, 200, null);
    apiService.verifyEmail.and.returnValue(Promise.resolve(mockResponse));

    await component.ngOnInit();

    expect(apiService.verifyEmail).toHaveBeenCalledWith('test-token');
    expect(component.accountVerify).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalledWith(['**']);
  });

  it('should submit reset form successfully', async () => {
    component.passwordReset = true;
    component.resetForm.patchValue({
      password: 'NewPassword123',
      confirmedPassword: 'NewPassword123'
    });
    const mockResponse = new ApiResponse(true, 200, null);
    apiService.resetPasswordConfirm.and.returnValue(Promise.resolve(mockResponse));

    await component.submitResetForm();

    expect(apiService.resetPasswordConfirm).toHaveBeenCalled();
    expect(component.passwordResetSuccess).toBeTruthy();
  });

  it('should submit forgot form successfully', async () => {
    component.forgetForm.patchValue({ email: 'test@example.com' });
    const mockResponse = new ApiResponse(true, 200, null);
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

  it('should handle API errors on verify', async () => {
    const mockResponse = new ApiResponse(false, 400, 'Invalid token');
    apiService.verifyEmail.and.returnValue(Promise.resolve(mockResponse));

    await component.ngOnInit();

    expect(errorService.show).toHaveBeenCalledWith(mockResponse);
    expect(router.navigate).toHaveBeenCalledWith(['**']);
  });

  it('should handle API errors on reset', async () => {
    component.passwordReset = true;
    component.resetForm.patchValue({
      password: 'NewPassword123',
      confirmedPassword: 'NewPassword123'
    });
    const mockResponse = new ApiResponse(false, 400, 'Reset failed');
    apiService.resetPasswordConfirm.and.returnValue(Promise.resolve(mockResponse));

    await component.submitResetForm();
    expect(errorService.show).toHaveBeenCalledWith(mockResponse);
    expect(component.passwordResetSuccess).toBeFalsy();
  });

  it('should handle API errors on forgot', async () => {
    component.forgetForm.patchValue({ email: 'test@example.com' });
    const mockResponse = new ApiResponse(false, 400, 'Forgot failed');
    apiService.resetPassword.and.returnValue(Promise.resolve(mockResponse));

    await component.submitForgotForm();
    expect(errorService.show).toHaveBeenCalledWith(mockResponse);
    expect(component.emailSent).toBeFalsy();
  });

  it('should handle error in verifyAccount catch block', async () => {
    apiService.verifyEmail.and.returnValue(Promise.reject('Network error'));
    await component.ngOnInit();
    expect(errorService.show).toHaveBeenCalledWith('Verification failed');
    expect(router.navigate).toHaveBeenCalledWith(['**']);
  });

  it('should handle error in submitResetForm catch block', async () => {
    component.passwordReset = true;
    component.resetForm.patchValue({
      password: 'NewPassword123',
      confirmedPassword: 'NewPassword123'
    });
    apiService.resetPasswordConfirm.and.returnValue(Promise.reject('Network error'));
    await component.submitResetForm();
    expect(errorService.show).toHaveBeenCalledWith('An error occurred during password reset. Please try again later.');
    expect(component.passwordResetSuccess).toBeFalsy();
  });

  it('should handle error in submitForgotForm catch block', async () => {
    component.forgetForm.patchValue({ email: 'test@example.com' });
    apiService.resetPassword.and.returnValue(Promise.reject('Network error'));
    await component.submitForgotForm();
    expect(errorService.show).toHaveBeenCalledWith('An error occurred during password reset. Please try again later.');
    expect(component.emailSent).toBeFalsy();
  });

  it('should not verify account if no token in params', async () => {
    if (activatedRoute.snapshot.routeConfig) {
      activatedRoute.snapshot.routeConfig.path = 'verify';
    }
    activatedRoute.snapshot.queryParams['token'] = undefined;
    spyOn<any>(component, 'verifyAccount');
    await component.ngOnInit();
    expect((component as any).verifyAccount).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set mismatch error when passwords do not match', () => {
    component.resetForm.patchValue({
      password: 'Password123',
      confirmedPassword: 'DifferentPassword'
    });
    const confirmedPasswordControl = component.resetForm.get('confirmedPassword');
    expect(confirmedPasswordControl?.hasError('mismatch')).toBeTrue();
  });

  it('should remove mismatch error when passwords match again', () => {
    component.resetForm.patchValue({
      password: 'Password123',
      confirmedPassword: 'DifferentPassword'
    });
    const confirmedPasswordControl = component.resetForm.get('confirmedPassword');
    expect(confirmedPasswordControl?.hasError('mismatch')).toBeTrue();

    component.resetForm.patchValue({
      confirmedPassword: 'Password123'
    });
    expect(confirmedPasswordControl?.hasError('mismatch')).toBeFalsy();
  });

  it('should clean up background and timeout on destroy', () => {
    component.timeoutId = setTimeout(() => { }, 1000);
    spyOn(window, 'clearTimeout');
    const rendererRemoveClassSpy = spyOn(component['renderer'], 'removeClass');
    component.ngOnDestroy();
    expect(window.clearTimeout).toHaveBeenCalledWith(jasmine.anything());
    expect(component.timeoutId).toBeNull();
    expect(rendererRemoveClassSpy).toHaveBeenCalledWith(document.body, 'login-bg');
  });

  it('should return truthy/falsy for isPasswordReset with various params', () => {
    expect((component as any).isPasswordReset('password/reset', { reset: 'true', token: 'abc' })).toBeTruthy();
    expect((component as any).isPasswordReset('password/reset', { reset: 'true' })).toBeFalsy();
    expect((component as any).isPasswordReset('other', { reset: 'true', token: 'abc' })).toBeFalsy();
  });

  it('should return true/false for isPasswordForget with various params', () => {
    expect((component as any).isPasswordForget('password/forgot', { forgot: 'true' })).toBeTrue();
    expect((component as any).isPasswordForget('password/forgot', {})).toBeFalse();
    expect((component as any).isPasswordForget('other', { forgot: 'true' })).toBeFalse();
  });

  it('should navigate to login without clearing timeout if timeoutId is null', () => {
    component.timeoutId = null;
    spyOn(window, 'clearTimeout');
    component.toLogin();
    expect(window.clearTimeout).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should do nothing in handlePasswordValidationErrors if confirmedPassword is null', () => {
    expect(() => (PasswordResetComponent as any).handlePasswordValidationErrors(null)).not.toThrow();
  });

  it('should set passwordReset and resetToken on ngOnInit if isPasswordReset', async () => {
    const path = 'password/reset';
    const params = { reset: 'true', token: 'abc' };
    spyOn(component as any, 'isPasswordReset').and.returnValue(true);
    spyOn(component as any, 'isPasswordForget').and.returnValue(false);
    Object.defineProperty(component['activeRoute'].snapshot, 'routeConfig', {
      value: { path },
      configurable: true
    });
    component['activeRoute'].snapshot.queryParams = params;
    await component.ngOnInit();
    expect(component.passwordReset).toBeTrue();
    expect(component.resetToken).toBe('abc');
  });

  it('should set passwordForget on ngOnInit if isPasswordForget', async () => {
    const path = 'password/forgot';
    const params = { forgot: 'true' };
    spyOn(component as any, 'isPasswordReset').and.returnValue(false);
    spyOn(component as any, 'isPasswordForget').and.returnValue(true);
    Object.defineProperty(component['activeRoute'].snapshot, 'routeConfig', {
      value: { path },
      configurable: true
    });
    component['activeRoute'].snapshot.queryParams = params;
    await component.ngOnInit();
    expect(component.passwordForget).toBeTrue();
  });

  it('should set timeout and navigate to login after verifyAccount success', async () => {
    const token = 'abc';
    const mockResponse = new ApiResponse(true, 200, null);
    apiService.verifyEmail.and.returnValue(Promise.resolve(mockResponse));
    router.navigate.calls.reset();
    jasmine.clock().install();
    await (component as any).verifyAccount(token);
    expect(component.timeoutId).not.toBeNull();
    jasmine.clock().tick(5001);
    expect(component['router'].navigate).toHaveBeenCalledWith(['/login']);
    jasmine.clock().uninstall();
  });

  it('should return null in passwordsMatch if confirmedPassword is missing', () => {
    const group = new FormGroup({
      password: new FormControl('Password123')
    });
    expect(component.passwordsMatch(group)).toBeNull();
  });

  it('should remove only mismatch error in handlePasswordValidationErrors', () => {
    const control = new FormControl('Password123');
    control.setErrors({ mismatch: true, required: true });
    (PasswordResetComponent as any).handlePasswordValidationErrors(control);
    expect(control.hasError('mismatch')).toBeFalse();
    expect(control.hasError('required')).toBeTrue();
  });

  it('should clear all errors in handlePasswordValidationErrors if only mismatch', () => {
    const control = new FormControl('Password123');
    control.setErrors({ mismatch: true });
    (PasswordResetComponent as any).handlePasswordValidationErrors(control);
    expect(control.errors).toBeNull();
  });

  it('should set resetToken to empty string if token param is missing', async () => {
    spyOn(component as any, 'isPasswordReset').and.returnValue(true);
    spyOn(component as any, 'isPasswordForget').and.returnValue(false);

    Object.defineProperty(component['activeRoute'].snapshot, 'routeConfig', {
      value: { path: 'password/reset' },
      configurable: true
    });
    component['activeRoute'].snapshot.queryParams = { reset: 'true' };

    await component.ngOnInit();
    expect(component.resetToken).toBe('');
  });
});
