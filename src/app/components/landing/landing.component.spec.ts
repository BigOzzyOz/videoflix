import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LoadingService } from '../../shared/services/loading.service';

import { LandingComponent } from './landing.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { ApiResponse } from '../../shared/models/api-response';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let router: jasmine.SpyObj<Router>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let errorService: jasmine.SpyObj<ErrorService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['setLoading']);
    apiService = jasmine.createSpyObj('ApiService', ['validateToken']);
    errorService = jasmine.createSpyObj('ErrorService', ['show']);

    await TestBed.configureTestingModule({
      imports: [LandingComponent, HeaderComponent, FooterComponent, FormsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: ApiService, useValue: apiService },
        { provide: ErrorService, useValue: errorService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty mailInput', () => {
    expect(component.mailInput).toBe('');
  });

  it('should render header and footer components', () => {
    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const footer = fixture.debugElement.query(By.directive(FooterComponent));

    expect(header).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('should bind email input with ngModel', async () => {
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;

    component.mailInput = 'test@example.com';
    fixture.detectChanges();

    await fixture.whenStable();

    expect(emailInput.value).toBe('test@example.com');
  });

  it('should update component property when input value changes', async () => {
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;

    emailInput.value = 'user@input.com';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    await fixture.whenStable();

    expect(component.mailInput).toBe('user@input.com');
  });

  it('should navigate to register with email when sign up is clicked', () => {
    component.mailInput = 'user@test.com';
    component.toSignup();

    expect(router.navigate).toHaveBeenCalledWith(['/register'], {
      queryParams: { email: 'user@test.com' }
    });
  });

  it('should trigger navigation when sign up button is clicked', () => {
    const signUpButton = fixture.nativeElement.querySelector('.landing__input__button');
    component.mailInput = 'click@test.com';

    signUpButton.click();

    expect(router.navigate).toHaveBeenCalledWith(['/register'], {
      queryParams: { email: 'click@test.com' }
    });
  });

  it('should render all landing page elements', () => {
    const title = fixture.nativeElement.querySelector('.landing__header');
    const subtitle = fixture.nativeElement.querySelector('.landing__subheader');
    const description = fixture.nativeElement.querySelector('.landing__description');
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const signUpButton = fixture.nativeElement.querySelector('.landing__input__button');

    expect(title?.textContent).toBe('Movies, TV shows, and more');
    expect(subtitle?.textContent).toBe('Watch whenever you want wherever you want');
    expect(description?.textContent).toBe('Enter your email to create or restart your subscription.');
    expect(emailInput?.placeholder).toBe('Enter your email');
    expect(signUpButton?.textContent?.trim()).toContain('Sign Up');
  });

  it('should add landing-bg class to body on init and remove on destroy', () => {
    const renderer = (component as any).renderer;
    spyOn(renderer, 'addClass').and.callThrough();
    spyOn(renderer, 'removeClass').and.callThrough();

    component.ngOnInit();
    expect(renderer.addClass).toHaveBeenCalledWith(document.body, 'landing-bg');

    component.ngOnDestroy();
    expect(renderer.removeClass).toHaveBeenCalledWith(document.body, 'landing-bg');
  });

  it('should call loadingService.setLoading(false) in constructor', () => {
    expect(loadingServiceSpy.setLoading).toHaveBeenCalledWith(false);
  });

  it('should navigate to /main if token is valid', async () => {
    const responseMock: ApiResponse = {
      ok: true,
      status: 200,
      data: {},
      isClientError: () => false,
      isServerError: () => false,
      isSuccess: () => true,
      message: '',
      isUnauthorized: function (): boolean {
        throw new Error('Function not implemented.');
      },
      isForbidden: function (): boolean {
        throw new Error('Function not implemented.');
      },
      isNotFound: function (): boolean {
        throw new Error('Function not implemented.');
      },
      hasData: function (): boolean {
        throw new Error('Function not implemented.');
      },
      getErrorMessage: function (): string {
        throw new Error('Function not implemented.');
      }
    };
    apiService.validateToken.and.resolveTo(responseMock);
    spyOn(sessionStorage, 'clear');
    await component.validateSessionToken('token');
    expect(router.navigate).toHaveBeenCalledWith(['/main']);
    expect(sessionStorage.clear).not.toHaveBeenCalled();
  });

  it('should clear sessionStorage if token is invalid', async () => {
    spyOn(sessionStorage, 'clear');
    const responseMock: ApiResponse = {
      ok: false,
      status: 401,
      data: {},
      isClientError: () => true,
      isServerError: () => false,
      isSuccess: () => false,
      message: '',
      isUnauthorized: function (): boolean { return true; },
      isForbidden: function (): boolean { return false; },
      isNotFound: function (): boolean { return false; },
      hasData: function (): boolean { return false; },
      getErrorMessage: function (): string { return 'Unauthorized'; }
    };
    apiService.validateToken.and.resolveTo(responseMock);
    await component.validateSessionToken('token');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(sessionStorage.clear).toHaveBeenCalled();
  });

  it('should show error and clear sessionStorage on exception', async () => {
    apiService.validateToken.and.rejectWith(new Error('fail'));
    spyOn(sessionStorage, 'clear');
    await component.validateSessionToken('token');
    expect(errorService.show).toHaveBeenCalledWith('Error validating token, please log in again.');
    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should call validateSessionToken in ngOnInit if token exists', async () => {
    spyOn(component, 'validateSessionToken').and.returnValue(Promise.resolve());
    spyOn(sessionStorage, 'getItem').and.returnValue('token');
    await component.ngOnInit();
    expect(component.validateSessionToken).toHaveBeenCalledWith('token');
  });

  it('should not call validateSessionToken in ngOnInit if no token exists', async () => {
    spyOn(component, 'validateSessionToken');
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    await component.ngOnInit();
    expect(component.validateSessionToken).not.toHaveBeenCalled();
  });
});
