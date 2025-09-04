import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LoadingService } from '../../shared/services/loading.service';

import { LandingComponent } from './landing.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let router: jasmine.SpyObj<Router>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['setLoading']);

    await TestBed.configureTestingModule({
      imports: [LandingComponent, HeaderComponent, FooterComponent, FormsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: LoadingService, useValue: loadingServiceSpy }
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
});
