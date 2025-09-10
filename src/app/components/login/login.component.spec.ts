import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { LoginComponent } from './login.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { EmailInputComponent } from '../../shared/components/input-elements/email-input/email-input.component';
import { PasswordInputComponent } from '../../shared/components/input-elements/password-input/password-input.component';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { ApiResponse } from '../../shared/models/api-response';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: jasmine.SpyObj<Router>;
  let apiService: jasmine.SpyObj<ApiService>;
  let errorService: jasmine.SpyObj<ErrorService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'navigateByUrl']);

    const apiSpy = jasmine.createSpyObj('ApiService', ['login']);
    Object.defineProperty(apiSpy, 'AccessToken', {
      get: jasmine.createSpy('get AccessToken').and.returnValue(''),
      set: jasmine.createSpy('set AccessToken'),
      configurable: true
    });
    Object.defineProperty(apiSpy, 'RefreshToken', {
      get: jasmine.createSpy('get RefreshToken').and.returnValue(''),
      set: jasmine.createSpy('set RefreshToken'),
      configurable: true
    });
    Object.defineProperty(apiSpy, 'CurrentUser', {
      get: jasmine.createSpy('get CurrentUser').and.returnValue(null),
      set: jasmine.createSpy('set CurrentUser'),
      configurable: true
    });

    const errorSpy = jasmine.createSpyObj('ErrorService', ['show']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        HeaderComponent,
        FooterComponent,
        EmailInputComponent,
        PasswordInputComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ApiService, useValue: apiSpy },
        { provide: ErrorService, useValue: errorSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    errorService = TestBed.inject(ErrorService) as jasmine.SpyObj<ErrorService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values and validators', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('email')?.hasError('required')).toBeTruthy();
    expect(component.loginForm.get('password')?.hasError('required')).toBeTruthy();
  });

  it('should render header and footer components', () => {
    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const footer = fixture.debugElement.query(By.directive(FooterComponent));

    expect(header).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('should have email and password getter methods', () => {
    expect(component.email).toBe(component.loginForm.get('email') as FormControl);
    expect(component.password).toBe(component.loginForm.get('password') as FormControl);
  });

  it('should not submit form when invalid', async () => {
    component.loginForm.patchValue({ email: '', password: '' });

    await component.submitLoginForm();

    expect(apiService.login).not.toHaveBeenCalled();
    expect(component.loginForm.touched).toBeTruthy();
  });

  it('should login successfully with valid credentials', async () => {
    const mockResponse = new ApiResponse(true, 200, {
      access: 'access-token',
      refresh: 'refresh-token',
      user: { id: 1, email: 'test@example.com' }
    }
    );
    apiService.login.and.returnValue(Promise.resolve(mockResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    await component.submitLoginForm();

    expect(apiService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(Object.getOwnPropertyDescriptor(apiService, 'AccessToken')?.set).toHaveBeenCalledWith('access-token');
    expect(Object.getOwnPropertyDescriptor(apiService, 'RefreshToken')?.set).toHaveBeenCalledWith('refresh-token');
    expect(Object.getOwnPropertyDescriptor(apiService, 'CurrentUser')?.set).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' });
  });

  it('should handle login error from API', async () => {
    const mockResponse = new ApiResponse(false, 401, null);
    apiService.login.and.returnValue(Promise.resolve(mockResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    await component.submitLoginForm();

    expect(errorService.show).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle login exception', async () => {
    apiService.login.and.rejectWith(new Error('Network error'));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    await component.submitLoginForm();

    expect(errorService.show).toHaveBeenCalledWith('An error occurred during login. Please try again later.');
  });

  it('should navigate to password forgot', () => {
    const mockUrlTree = { toString: () => '/password/forgot?forgot=true' } as UrlTree;
    router.createUrlTree.and.returnValue(mockUrlTree);

    component.toPasswordForget();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/password/forgot'], {
      queryParams: { forgot: 'true' }
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith(mockUrlTree);
  });

  it('should navigate to register', () => {
    component.toRegister();

    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should trigger navigation when forgot password link is clicked', () => {
    spyOn(component, 'toPasswordForget');
    const forgotPasswordLink = fixture.nativeElement.querySelector('.login__container__form__buttons__forgotpassword');

    forgotPasswordLink.click();

    expect(component.toPasswordForget).toHaveBeenCalled();
  });

  it('should trigger navigation when sign up link is clicked', () => {
    spyOn(component, 'toRegister');
    const signUpLink = fixture.nativeElement.querySelector('.login__container__form__buttons__signup a');

    signUpLink.click();

    expect(component.toRegister).toHaveBeenCalled();
  });

  it('should navigate to main when navigateToMain is called', () => {
    component.navigateToMain();
    expect(router.navigate).toHaveBeenCalledWith(['/main']);
  });

  describe('Profile selection logic', () => {
    let dialogService: any;
    beforeEach(() => {
      dialogService = {
        openProfileSelection: jasmine.createSpy('openProfileSelection')
      };
      (component as any).dialogService = dialogService;
      (component as any).api.CurrentProfile = undefined;
    });

    it('should handle multiple profiles', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        profiles: [{ id: 1 }, { id: 2 }]
      } as any;
      Object.defineProperty(apiService, 'CurrentUser', { get: () => user });
      dialogService.openProfileSelection.and.returnValue(Promise.resolve(user.profiles[1]));
      spyOn(component, 'navigateToMain');
      await component.handleProfileSelection();
      expect(dialogService.openProfileSelection).toHaveBeenCalledWith(user.profiles);
      expect((component as any).api.CurrentProfile).toEqual(user.profiles[1]);
      expect(component.navigateToMain).toHaveBeenCalled();
    });

    it('should handle single profile', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        profiles: [{ id: 1 }]
      } as any;
      Object.defineProperty(apiService, 'CurrentUser', { get: () => user });
      spyOn(component, 'navigateToMain');
      await component.handleProfileSelection();
      expect((component as any).api.CurrentProfile).toEqual(user.profiles[0]);
      expect(component.navigateToMain).toHaveBeenCalled();
    });

    it('should handle no profiles', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        profiles: []
      } as any;
      Object.defineProperty(apiService, 'CurrentUser', { get: () => user });
      await component.handleProfileSelection();
      expect(errorService.show).toHaveBeenCalledWith('No profiles available for this account.');
    });

    it('should handle dialog cancel/error', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        profiles: [{ id: 1 }, { id: 2 }]
      } as any;
      (component as any).api.CurrentUser = user;
      dialogService.openProfileSelection.and.returnValue(Promise.reject('cancelled'));
      await (component as any).awaitProfileSelection(user);
      expect(errorService.show).toHaveBeenCalledWith('Profile selection was cancelled or timed out.');
    });
  });

  describe('Background CSS class', () => {
    let renderer: any;
    beforeEach(() => {
      renderer = (component as any).renderer;
      spyOn(renderer, 'addClass');
      spyOn(renderer, 'removeClass');
    });
    it('should add login-bg class on ngOnInit', () => {
      component.ngOnInit();
      expect(renderer.addClass).toHaveBeenCalledWith(document.body, 'login-bg');
    });
    it('should remove login-bg class on ngOnDestroy', () => {
      component.ngOnDestroy();
      expect(renderer.removeClass).toHaveBeenCalledWith(document.body, 'login-bg');
    });
  });
});
